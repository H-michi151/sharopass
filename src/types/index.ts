export type ExamType = 'sentaku' | 'takuitsu';

export interface Blank {
  id: string;
  position: number;
  correctAnswer: string;
  choices: string[];
}

export interface Question {
  id: string;
  examId: string;
  type: ExamType;
  subjectId: string;
  subjectName: string;
  questionNumber: number;
  globalNumber: number;
  text: string;
  // 択一式
  choices?: string[];
  correctAnswer?: string;
  // 選択式
  blanks?: Blank[];
  explanation?: string;
  tags: string[];
  difficulty: number;
}

export interface Subject {
  id: string;
  name: string;
  questionCount: number;
  passingScore: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  type: ExamType;
  timeLimit: number;
  subjects: Subject[];
  createdAt: string;
  updatedAt: string;
}

export interface UserAnswer {
  questionId: string;
  answer: string | Record<string, string>;
  answeredAt: string;
}

export interface Session {
  id: string;
  examId: string;
  userId: string;
  type: ExamType;
  status: 'in_progress' | 'completed' | 'timed_out';
  answers: Record<string, UserAnswer>;
  startedAt: string;
  completedAt?: string;
  remainingTime: number;
  currentQuestionIndex: number;
}

export interface TagResult {
  tag: string;
  correct: number;
  total: number;
  percentage: number;
}

export interface SubjectResult {
  subjectId: string;
  subjectName: string;
  score: number;
  maxScore: number;
  percentage: number;
  passingScore: number;
  isPassing: boolean;
  tagResults: TagResult[];
}

export interface ExamResult {
  id: string;
  sessionId: string;
  examId: string;
  userId: string;
  type: ExamType;
  subjectResults: SubjectResult[];
  totalScore: number;
  maxTotalScore: number;
  totalPercentage: number;
  isPassingAllSubjects: boolean;
  isPassingTotal: boolean;
  isPassing: boolean;
  deviation: number;
  completedAt: string;
  timeTaken: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}
