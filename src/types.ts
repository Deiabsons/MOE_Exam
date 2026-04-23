export interface Question {
  id: number;
  text: string;
  options: {
    key: string;
    text: string;
  }[];
  correctAnswer: string;
  page: string;
}

export interface ExamState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<number, string>;
  isFinished: false;
  timeRemaining: number;
}
