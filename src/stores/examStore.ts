import { create } from 'zustand';
import { Question, Session, ExamResult, UserAnswer, SubjectResult, ExamType, Subject } from '../types';

interface ExamState {
  questions: Question[];
  currentSubjects: Subject[];
  session: Session | null;
  currentIndex: number;
  results: ExamResult | null;
  isReviewMode: boolean;
  customTimeLimitSentaku: number; // 分単位
  customTimeLimitTakuitsu: number; // 分単位
  setQuestions: (questions: Question[]) => void;
  startSession: (examId: string, userId: string, type: ExamType, timeLimit: number, subjects: Subject[]) => void;
  answerQuestion: (questionId: string, answer: string | Record<string, string>) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  submitExam: () => void;
  resetExam: () => void;
  decrementTimer: () => void;
  setReviewMode: (mode: boolean) => void;
  setCustomTimeLimitSentaku: (minutes: number) => void;
  setCustomTimeLimitTakuitsu: (minutes: number) => void;
  loadReviewFromRecord: (
    questions: Question[],
    answers: Record<string, { answer: string | Record<string, string>; answeredAt: string; questionId: string }>,
    examType: ExamType,
    examId: string
  ) => void;
}

function calculateResults(session: Session, questions: Question[], subjects: Subject[]): ExamResult {
  const type = session.type;
  
  // グループ化
  const subjectMap = new Map<string, { name: string; questions: Question[] }>();
  for (const q of questions) {
    if (!subjectMap.has(q.subjectId)) {
      subjectMap.set(q.subjectId, { name: q.subjectName, questions: [] });
    }
    subjectMap.get(q.subjectId)!.questions.push(q);
  }

  const subjectResults: SubjectResult[] = [];
  let totalScore = 0;
  let maxTotalScore = 0;

  for (const [subjectId, { name, questions: subjectQs }] of Array.from(subjectMap.entries())) {
    let score = 0;
    let maxScore = 0;

    for (const q of subjectQs) {
      const userAnswer = session.answers[q.id];
      
      if (type === 'takuitsu') {
        maxScore += 1;
        if (userAnswer && userAnswer.answer === q.correctAnswer) score++;
      } else {
        // 選択式：空欄1つにつき1点
        if (q.blanks) {
          maxScore += q.blanks.length;
          if (userAnswer && typeof userAnswer.answer === 'object') {
            const blankAnswers = userAnswer.answer as Record<string, string>;
            q.blanks.forEach((b: any) => {
              if (blankAnswers[b.id] === b.correctAnswer) score++;
            });
          }
        }
      }
    }

    const subjectMeta = subjects.find(s => s.id === subjectId);
    const passingScore = subjectMeta ? subjectMeta.passingScore : (type === 'sentaku' ? 3 : 4);
    subjectResults.push({
      subjectId,
      subjectName: name,
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
      passingScore,
      isPassing: score >= passingScore,
      tagResults: [],
    });
    
    totalScore += score;
    maxTotalScore += maxScore;
  }

  const isPassingAllSubjects = subjectResults.length > 0 && subjectResults.every(r => r.isPassing);
  const passingTotal = type === 'sentaku' ? 24 : 45;
  const isPassingTotal = totalScore >= passingTotal;
  const completedAt = new Date().toISOString();
  const timeTaken = session.remainingTime > 0
    ? (type === 'sentaku' ? 80 * 60 : 210 * 60) - session.remainingTime
    : (type === 'sentaku' ? 80 * 60 : 210 * 60);

  return {
    id: `result_${Date.now()}`,
    sessionId: session.id,
    examId: session.examId,
    userId: session.userId,
    type,
    subjectResults,
    totalScore,
    maxTotalScore,
    totalPercentage: maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 100) : 0,
    isPassingAllSubjects,
    isPassingTotal,
    isPassing: isPassingAllSubjects && isPassingTotal,
    deviation: maxTotalScore > 0 ? 50 + Math.round((totalScore / maxTotalScore - 0.5) * 100) : 50,
    completedAt,
    timeTaken,
  };
}

export const useExamStore = create<ExamState>((set, get) => ({
  questions: [],
  currentSubjects: [],
  session: null,
  currentIndex: 0,
  results: null,
  isReviewMode: false,
  customTimeLimitSentaku: 80,   // デフォルト80分
  customTimeLimitTakuitsu: 210, // デフォルト210分

  setQuestions: (questions) => set({ questions }),

  startSession: (examId, userId, type, timeLimit, subjects) => {
    const session: Session = {
      id: `session_${Date.now()}`,
      examId,
      userId,
      type,
      status: 'in_progress',
      answers: {},
      startedAt: new Date().toISOString(),
      remainingTime: timeLimit,
      currentQuestionIndex: 0,
    };
    set({ session, currentSubjects: subjects, currentIndex: 0, results: null, isReviewMode: false });
  },

  answerQuestion: (questionId, answer) => {
    const { session } = get();
    if (!session) return;
    const userAnswer: UserAnswer = {
      questionId,
      answer,
      answeredAt: new Date().toISOString(),
    };
    set({
      session: {
        ...session,
        answers: { ...session.answers, [questionId]: userAnswer },
      },
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  goToQuestion: (index) => set({ currentIndex: index }),

  submitExam: () => {
    const { session, questions, currentSubjects } = get();
    if (!session) return;
    const results = calculateResults(session, questions, currentSubjects);
    set({
      session: { ...session, status: 'completed', completedAt: new Date().toISOString() },
      results,
    });
  },

  resetExam: () => set({ questions: [], session: null, currentIndex: 0, results: null, isReviewMode: false }),

  decrementTimer: () => {
    const { session } = get();
    if (!session || session.status !== 'in_progress') return;
    if (session.remainingTime <= 0) {
      const { questions, currentSubjects } = get();
      const results = calculateResults(session, questions, currentSubjects);
      set({
        session: { ...session, status: 'timed_out', remainingTime: 0 },
        results,
      });
    } else {
      set({ session: { ...session, remainingTime: session.remainingTime - 1 } });
    }
  },

  setReviewMode: (mode) => set({ isReviewMode: mode }),

  setCustomTimeLimitSentaku: (minutes) => set({ customTimeLimitSentaku: minutes }),

  setCustomTimeLimitTakuitsu: (minutes) => set({ customTimeLimitTakuitsu: minutes }),

  // 履歴から復習モードを起動する
  loadReviewFromRecord: (questions, answers, examType, examId) => {
    const session: Session = {
      id: `review_session_${Date.now()}`,
      examId,
      userId: 'review',
      type: examType,
      status: 'completed',  // completed状態で読み込む（復習モード）
      answers,
      startedAt: new Date().toISOString(),
      remainingTime: 0,
      currentQuestionIndex: 0,
    };
    set({
      questions,
      session,
      currentIndex: 0,
      results: null,
      isReviewMode: true,
      currentSubjects: [],
    });
  },
}));
