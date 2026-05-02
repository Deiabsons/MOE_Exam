/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Timer, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  Award,
  LogOut,
  Grid3X3,
  Shuffle
} from 'lucide-react';
import { QUESTIONS } from './data/questions';
import { Question } from './types';

// Utility to shuffle array
const shuffle = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function App() {
  const [screen, setScreen] = useState<'home' | 'exam' | 'results' | 'training'>('home');
  const [mode, setMode] = useState<'exam' | 'training'>('exam');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [trainingSearch, setTrainingSearch] = useState('');
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [timeLeft, setTimeLeft] = useState(50 * 60);

  const [hasProgress, setHasProgress] = useState(localStorage.getItem('full_review_active') === 'true');

  // Persistence logic for Full Review
  useEffect(() => {
    if (mode === 'training' && screen === 'exam') {
      localStorage.setItem('full_review_index', currentIndex.toString());
      localStorage.setItem('full_review_answers', JSON.stringify(answers));
      localStorage.setItem('full_review_active', 'true');
    }
  }, [currentIndex, answers, mode, screen]);

  const resetProgress = () => {
    localStorage.removeItem('full_review_index');
    localStorage.removeItem('full_review_answers');
    localStorage.removeItem('full_review_active');
    setHasProgress(false);
  };

  // Initialize Exam
  const startExam = () => {
    // 1. Get the mandatory 25 questions (Part 1: ids 1-25 or starting with M)
    const mandatoryQuestions = QUESTIONS.filter(q => 
      (typeof q.id === 'string' && q.id.startsWith('M')) || 
      (typeof q.id === 'number' && q.id <= 25)
    );
    
    // 2. Get the rest of the questions (Part 2 and beyond)
    const remainingPool = QUESTIONS.filter(q => 
      !((typeof q.id === 'string' && q.id.startsWith('M')) || 
      (typeof q.id === 'number' && q.id <= 25))
    );
    
    // 3. Shuffle the pool and take 25 random questions
    const randomQuestions = shuffle(remainingPool).slice(0, 25);
    
    // 4. Combine and shuffle the final 50 questions
    let finalSet = shuffle([...mandatoryQuestions, ...randomQuestions]);
    
    // Optional: Shuffle options for each question
    if (shuffleOptions) {
      finalSet = finalSet.map(q => {
        const specialOptions = q.options.filter(opt => opt.text.toLowerCase().includes('a & b'));
        const normalOptions = q.options.filter(opt => !opt.text.toLowerCase().includes('a & b'));
        return {
          ...q,
          options: [...shuffle(normalOptions), ...specialOptions]
        };
      });
    }

    setExamQuestions(finalSet);
    setCurrentIndex(0);
    setAnswers({});
    setMode('exam');
    setTimeLeft(finalSet.length * 60); // 1 minute per question
    setScreen('exam');
    setIsFeedbackVisible(false);
  };

  // Start Training
  const startTraining = (selectedQuestions: Question[], resume = false) => {
    let finalSet = [...selectedQuestions];

    // Optional: Shuffle options for each question
    if (shuffleOptions) {
      finalSet = finalSet.map(q => {
        const specialOptions = q.options.filter(opt => opt.text.toLowerCase().includes('a & b'));
        const normalOptions = q.options.filter(opt => !opt.text.toLowerCase().includes('a & b'));
        return {
          ...q,
          options: [...shuffle(normalOptions), ...specialOptions]
        };
      });
    }

    let startAt = 0;
    let savedAnswers = {};

    if (resume) {
      const savedIdx = localStorage.getItem('full_review_index');
      const savedAns = localStorage.getItem('full_review_answers');
      if (savedIdx) startAt = parseInt(savedIdx);
      if (savedAns) savedAnswers = JSON.parse(savedAns);
    }

    setExamQuestions(finalSet);
    setCurrentIndex(startAt);
    setAnswers(savedAnswers);
    setMode('training');
    setTimeLeft(finalSet.length * 60); 
    setScreen('exam');
    setIsFeedbackVisible(false);
  };

  const sections = useMemo(() => {
    // Get all unique sections from all questions
    const uniqueSections = Array.from(new Set(QUESTIONS.map(q => q.section)))
      .filter(s => s && s !== "(MOE Necessarily Known)") // Skip mandatory as it is added manually
      .sort((a, b) => {
        const getPriority = (s: string) => {
          const content = s.replace(/[()]/g, '');
          if (content.startsWith('1.')) return 1;
          if (content.startsWith('2.')) return 2;
          if (content.includes('L2')) return 2.5; 
          if (content.startsWith('3.')) return 3;
          if (content.startsWith('4.')) return 4;
          return 99;
        };
        const pA = getPriority(a);
        const pB = getPriority(b);
        if (pA !== pB) return pA - pB;
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
      });

    const result = uniqueSections.map(sectionName => ({
      id: sectionName,
      name: sectionName,
      filter: (q: Question) => q.section === sectionName
    }));

    // Add mandatory at the top
    return [
      { 
        id: 'MANDATORY', 
        name: 'MOE Necessarily Known', 
        filter: (q: Question) => 
          (typeof q.id === 'string' && q.id.startsWith('M')) || 
          (typeof q.id === 'number' && q.id <= 25) ||
          q.section === 'MOE Necessarily Known' 
      },
      ...result
    ];
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (screen === 'exam' && mode === 'exam' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (mode === 'exam' && timeLeft === 0 && screen === 'exam') {
      setScreen('results');
    }
    return () => clearInterval(interval);
  }, [screen, mode, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: string | number, answer: string) => {
    if (mode === 'training' && isFeedbackVisible) return;
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    if (mode === 'training') {
      setIsFeedbackVisible(true);
    }
  };

  const nextQuestion = () => {
    setCurrentIndex(prev => Math.min(examQuestions.length - 1, prev + 1));
    setIsFeedbackVisible(false);
  };

  const prevQuestion = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setIsFeedbackVisible(false);
  };

  const currentQuestion = examQuestions[currentIndex];
  const progress = examQuestions.length > 0 ? ((currentIndex + 1) / examQuestions.length) * 100 : 0;

  const score = useMemo(() => {
    let correct = 0;
    examQuestions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  }, [examQuestions, answers]);

  const percentage = examQuestions.length > 0 ? Math.round((score / examQuestions.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-xl mx-auto pt-10 px-6 text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-200">
                <BookOpen className="text-white w-10 h-10" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-3">EASA MOE Exam Simulator</h1>
            <p className="text-slate-600 mb-8 text-sm">
              Test your knowledge with a set of questions randomly selected from our database of {QUESTIONS.length}. 
              You have 1 minute per question.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-amber-100 p-1.5 rounded-lg"><RotateCcw className="w-4 h-4 text-amber-600" /></div>
                  <span className="font-semibold text-slate-700 text-sm">Randomized</span>
                </div>
                <p className="text-[11px] text-slate-500">Every attempt uses different questions.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-emerald-100 p-1.5 rounded-lg"><Timer className="w-4 h-4 text-emerald-600" /></div>
                  <span className="font-semibold text-slate-700 text-sm">Timed</span>
                </div>
                <p className="text-[11px] text-slate-500">1 minute per question.</p>
              </div>
            </div>

            {/* Shuffling Toggle */}
            <div className="mb-8 flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3 text-left">
                <div className="bg-blue-50 p-2 rounded-xl">
                  <Shuffle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">Shuffle Options</p>
                  <p className="text-[10px] text-slate-500">Randomize answer order</p>
                </div>
              </div>
              <button 
                onClick={() => setShuffleOptions(!shuffleOptions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${shuffleOptions ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${shuffleOptions ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
 
            <div className="flex flex-col justify-center gap-3">
              {hasProgress && parseInt(localStorage.getItem('full_review_index') || '0') > 0 ? (
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => {
                      setHasProgress(true);
                      startTraining(QUESTIONS, true);
                    }}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Play className="w-6 h-6 fill-white" />
                    Resume Full Review (Q. {parseInt(localStorage.getItem('full_review_index') || '0') + 1})
                  </button>
                  <button 
                    onClick={resetProgress}
                    className="text-slate-400 hover:text-red-500 font-bold py-1 text-xs transition-all flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset Progress
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setHasProgress(true);
                    startTraining(QUESTIONS);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Grid3X3 className="w-6 h-6 text-white" />
                  Full Review 298 Questions
                  <Play className="w-5 h-5 fill-white" />
                </button>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={startExam}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  Exam Sample (50 Questions) <Play className="w-5 h-5 fill-white" />
                </button>
                <button 
                  onClick={() => setScreen('training')}
                  className="flex-1 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3 px-8 rounded-xl text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Training by Section <BookOpen className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="mt-8 text-slate-400 text-sm italic">
              Based on EASA Maintenance and Engineering MOE Guidance
            </p>
          </motion.div>
        )}

        {screen === 'training' && (
          <motion.div 
            key="training"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto pt-10 px-6"
          >
            <button 
              onClick={() => setScreen('home')}
              className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Back to Dashboard
            </button>
            
            <h2 className="text-2xl font-bold mb-2">Training by Section</h2>
            <p className="text-slate-500 mb-8 text-sm">Select a specific MOE chapter to practice all related questions.</p>

            <div className="grid grid-cols-1 gap-2">
              {sections.map((sec, idx) => {
                const questions = QUESTIONS.filter(sec.filter);
                const count = questions.length;
                const isDisabled = count === 0;
                
                return (
                  <button
                    key={sec.id}
                    disabled={isDisabled}
                    onClick={() => startTraining(questions)}
                    className={`p-4 rounded-xl border transition-all text-left flex justify-between items-center group ${
                      isDisabled 
                        ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' 
                        : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-lg active:scale-[0.98]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                        isDisabled 
                          ? 'bg-slate-100 text-slate-300' 
                          : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <h3 className={`font-bold transition-colors leading-tight ${
                          isDisabled ? 'text-slate-400' : 'text-slate-800 group-hover:text-blue-600'
                        }`}>{sec.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isDisabled ? 'bg-slate-100 text-slate-300' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {count} Questions
                          </span>
                          {!isDisabled && <span className="text-[10px] text-slate-400">Practice now</span>}
                        </div>
                      </div>
                    </div>
                    {!isDisabled && (
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              })}
              
              {/* Custom Search Filter */}
              <div className="mt-6 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h3 className="font-bold text-blue-900 mb-2 text-sm uppercase tracking-wider">Custom Section Search</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. 3.9 or Calibration"
                    className="flex-grow bg-white border border-blue-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={trainingSearch}
                    onChange={(e) => setTrainingSearch(e.target.value)}
                  />
                  <button 
                    onClick={() => {
                      const filtered = QUESTIONS.filter(q => 
                        q.text.toLowerCase().includes(trainingSearch.toLowerCase()) || 
                        q.options.some(o => o.text.toLowerCase().includes(trainingSearch.toLowerCase()))
                      );
                      if (filtered.length > 0) startTraining(filtered);
                      else alert('No questions found for this search.');
                    }}
                    className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm"
                  >
                    Go
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-blue-400 font-medium">Search for identifiers like "2.18" or "Form 118" to find specific topics.</p>
              </div>
            </div>
          </motion.div>
        )}

        {screen === 'exam' && currentQuestion && (
          <motion.div 
            key="exam"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-4xl mx-auto min-h-screen px-4 py-4 flex flex-col"
          >
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 mb-4 flex flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle 
                      cx="24" cy="24" r="21" fill="transparent" stroke="#f1f5f9" strokeWidth="3" 
                    />
                    <circle 
                      cx="24" cy="24" r="21" fill="transparent" stroke={mode === 'training' ? '#1e293b' : '#2563eb'} strokeWidth="3" 
                      strokeDasharray={132} strokeDashoffset={132 - (132 * progress) / 100}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-slate-700">
                    {currentIndex + 1}/{examQuestions.length}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <h2 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">{mode === 'training' ? 'Full Review' : 'Progress'}</h2>
                  <p className="font-bold text-sm">{Math.round(progress)}% Complete</p>
                </div>
              </div>

              {mode === 'exam' && (
                <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg scale-90 sm:scale-100">
                  <Timer className="w-4 h-4 text-blue-400" />
                  <span className="font-mono text-xl font-bold tracking-tighter">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}

              <button 
                onClick={() => setShowExitConfirm(true)}
                className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-100 transition-colors font-bold text-xs"
              >
                <LogOut className="w-3.5 h-3.5" /> Exit
              </button>
            </div>

            {/* Exit Confirmation Modal */}
            <AnimatePresence>
              {showExitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowExitConfirm(false)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                  />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center"
                  >
                    <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Finish Early?</h3>
                    <p className="text-slate-500 mb-8">
                      Would you like to finish the exam now and see your results for the questions answered so far?
                    </p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => {
                          setShowExitConfirm(false);
                          setScreen('results');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 text-sm"
                      >
                        Finish and Show Results
                      </button>
                      <button 
                        onClick={() => {
                          setShowExitConfirm(false);
                          setScreen('home');
                        }}
                        className="bg-red-50 text-red-600 hover:bg-red-100 font-bold py-3 px-6 rounded-xl transition-all text-xs"
                      >
                        Cancel Exam and Exit
                      </button>
                      <button 
                        onClick={() => setShowExitConfirm(false)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all text-xs"
                      >
                        Nevermind, Continue Exam
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-grow flex flex-col justify-center items-center"
              >
                <div className="bg-white w-full rounded-2xl shadow-lg border border-slate-200 p-4 md:p-6">
                  <div className="mb-3">
                    <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2">
                      Q{currentIndex + 1} (Ref: #{currentQuestion.id})
                    </span>
                    <h3 className="text-sm md:text-base font-semibold leading-tight text-slate-800">
                      {currentQuestion.text}
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {currentQuestion.options.map((opt, index) => {
                      const isSelected = answers[currentQuestion.id] === opt.key;
                      const isCorrect = opt.key === currentQuestion.correctAnswer;
                      const showSuccess = mode === 'training' && isFeedbackVisible && isCorrect;
                      const showError = mode === 'training' && isFeedbackVisible && isSelected && !isCorrect;

                      return (
                        <button
                          key={opt.key}
                          disabled={mode === 'training' && isFeedbackVisible}
                          onClick={() => handleAnswer(currentQuestion.id, opt.key)}
                          className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group active:scale-[0.99] ${
                            showSuccess
                              ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                              : showError
                              ? 'bg-red-50 border-red-500 ring-1 ring-red-500'
                              : isSelected
                              ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600'
                              : 'bg-slate-50 border-transparent hover:border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                              showSuccess 
                                ? 'bg-emerald-600 text-white' 
                                : showError 
                                ? 'bg-red-600 text-white' 
                                : isSelected 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className={`text-xs md:text-sm font-medium leading-tight ${showSuccess ? 'text-emerald-900' : showError ? 'text-red-900' : ''}`}>
                              {opt.text}
                            </span>
                          </div>
                          {showSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {showError && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                          {isSelected && !isFeedbackVisible && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation as Text Links */}
            <div className="mt-4 flex justify-between items-center px-2">
              <button 
                onClick={prevQuestion}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 font-bold text-slate-500 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-900 transition-colors text-sm hover:underline"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              {currentIndex === examQuestions.length - 1 ? (
                <button 
                  onClick={() => setScreen('results')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-lg shadow-md transition-all flex items-center gap-2 active:scale-95 text-sm"
                >
                  Finish {mode === 'training' ? 'Review' : 'Exam'} <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={nextQuestion}
                  className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 transition-colors text-sm hover:underline"
                >
                  Next Question <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        )}

        {screen === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto pt-16 px-6 pb-20"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 text-center mb-10 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-900">
                <div 
                  className={`h-full transition-all duration-1000 ${percentage >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="mb-6 inline-flex p-5 rounded-3xl bg-blue-50 text-blue-600">
                <Award className="w-16 h-16" />
              </div>
              
              <h1 className="text-4xl font-bold mb-2">Exam Results</h1>
              <p className="text-slate-500 mb-8">You have completed the MOE Simulator session.</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Final Score</p>
                  <p className="text-4xl font-black">{score}/{examQuestions.length}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Percentage</p>
                  <p className={`text-4xl font-black ${percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {percentage}%
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time Spent</p>
                  <p className="text-4xl font-black">{formatTime((examQuestions.length * 60) - timeLeft)}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button 
                  onClick={startExam}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <RotateCcw className="w-5 h-5" /> Retake New Exam
                </button>
                <button 
                  onClick={() => setScreen('home')}
                  className="bg-white border-2 border-slate-200 hover:bg-slate-50 font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <BookOpen className="w-5 h-5" /> Home Dashboard
                </button>
              </div>
            </div>

            {/* Answer Key Review */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="text-blue-500" /> Answer Review
              </h2>
              {examQuestions.map((q, idx) => {
                const userAns = answers[q.id];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden border-l-8 border-l-transparent"
                    style={{ borderLeftColor: userAns ? (isCorrect ? '#10b981' : '#f59e0b') : '#cbd5e1' }}
                  >
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-grow">
                        <span className="text-xs font-bold text-slate-400 uppercase mb-1 block">Question {idx + 1} (Ref: #{q.id})</span>
                        <h4 className="text-lg font-semibold">{q.text}</h4>
                      </div>
                      <div className="flex-shrink-0">
                        {!userAns ? (
                          <div className="flex items-center gap-1 text-slate-400"><XCircle className="w-5 h-5" /> <span className="text-xs font-bold">Unanswered</span></div>
                        ) : isCorrect ? (
                          <div className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-5 h-5" /> <span className="text-xs font-bold">Correct</span></div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600"><AlertCircle className="w-5 h-5" /> <span className="text-xs font-bold">Incorrect</span></div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl text-sm ${isCorrect ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                        <p className="font-bold text-slate-400 mb-1 uppercase text-[10px]">Your Answer</p>
                        <p className="font-semibold">{userAns ? q.options.find(o => o.key === userAns)?.text : 'No answer'}</p>
                      </div>
                      {!isCorrect && (
                        <div className="bg-blue-50 p-4 rounded-xl text-sm">
                          <p className="font-bold text-blue-400 mb-1 uppercase text-[10px]">Correct Answer</p>
                          <p className="font-semibold text-blue-900">{q.options.find(o => o.key === q.correctAnswer)?.text}</p>
                        </div>
                      )}
                    </div>
                    <p className="mt-4 text-xs font-bold text-slate-400 italic">Reference: MOE page {q.page}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
