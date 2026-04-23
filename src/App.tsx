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
  LogOut
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
  const [screen, setScreen] = useState<'home' | 'exam' | 'results'>('home');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(50 * 60); // 50 minutes in seconds

  // Initialize Exam
  const startExam = () => {
    // 1. Get the mandatory 25 questions (Part 1: ids 1001 to 1025)
    const mandatoryQuestions = QUESTIONS.filter(q => q.id >= 1001 && q.id <= 1025);
    
    // 2. Get the rest of the questions (Part 2)
    const remainingPool = QUESTIONS.filter(q => q.id < 1001 || q.id > 1025);
    
    // 3. Shuffle the pool and take 25 random questions
    const randomQuestions = shuffle(remainingPool).slice(0, 25);
    
    // 4. Combine and shuffle the final 50 questions
    const finalSet = shuffle([...mandatoryQuestions, ...randomQuestions]);
    
    setExamQuestions(finalSet);
    setCurrentIndex(0);
    setAnswers({});
    setTimeLeft(50 * 60);
    setScreen('exam');
  };

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (screen === 'exam' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && screen === 'exam') {
      setScreen('results');
    }
    return () => clearInterval(interval);
  }, [screen, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
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
              Test your knowledge with 50 questions randomly selected from our database of 298. 
              You have 50 minutes to complete the exam.
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
                <p className="text-[11px] text-slate-500">50 minutes strict duration.</p>
              </div>
            </div>
 
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                onClick={startExam}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl text-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Start Exam <Play className="w-5 h-5 fill-white" />
              </button>
            </div>
            <p className="mt-8 text-slate-400 text-sm italic">
              Based on EASA Maintenance and Engineering MOE Guidance
            </p>
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
                      cx="24" cy="24" r="21" fill="transparent" stroke="#2563eb" strokeWidth="3" 
                      strokeDasharray={132} strokeDashoffset={132 - (132 * progress) / 100}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-slate-700">
                    {currentIndex + 1}/50
                  </span>
                </div>
                <div className="hidden sm:block">
                  <h2 className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">Progress</h2>
                  <p className="font-bold text-sm">{Math.round(progress)}% Complete</p>
                </div>
              </div>

              <div className="bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg scale-90 sm:scale-100">
                <Timer className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-xl font-bold tracking-tighter">
                  {formatTime(timeLeft)}
                </span>
              </div>

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
                    {currentQuestion.options.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => handleAnswer(currentQuestion.id, opt.key)}
                        className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group active:scale-[0.99] ${
                          answers[currentQuestion.id] === opt.key 
                            ? 'bg-blue-50 border-blue-600 ring-1 ring-blue-600' 
                            : 'bg-slate-50 border-transparent hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] ${
                            answers[currentQuestion.id] === opt.key ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                          }`}>
                            {opt.key.toUpperCase()}
                          </div>
                          <span className="text-xs md:text-sm font-medium leading-tight">{opt.text}</span>
                        </div>
                        {answers[currentQuestion.id] === opt.key && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation as Text Links */}
            <div className="mt-4 flex justify-between items-center px-2">
              <button 
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
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
                  Finish Exam <CheckCircle2 className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIndex(prev => Math.min(examQuestions.length - 1, prev + 1))}
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
                  <p className="text-4xl font-black">{formatTime((50 * 60) - timeLeft)}</p>
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
