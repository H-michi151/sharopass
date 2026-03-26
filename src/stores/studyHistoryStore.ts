import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExamResult, Question, ExamType } from '../types';
import { saveRecordToFirestore, loadRecordsFromFirestore, deleteAllRecordsFromFirestore } from '../lib/firestoreHistory';
import { saveSubjectProgress } from '../lib/firestoreProgress';
import { isFirebaseConfigured } from '../lib/firebase';

// LocalStorageに保存する1回分の試験記録
export interface WrongAnswerRecord {
  questionId: string;
  subjectId: string;
  subjectName: string;
  questionText: string;
  userAnswer: string;    // ユーザーの選択（表示用文字列）
  correctAnswer: string; // 正答（表示用文字列）
  explanation: string;
  examType: ExamType;
  examDate: string;
}

export interface ExamRecord {
  id: string;
  examType: ExamType;
  examDate: string;        // ISO文字列
  timeTaken: number;       // 秒
  totalScore: number;
  maxTotalScore: number;
  totalPercentage: number;
  isPassing: boolean;
  subjectResults: Array<{
    subjectId: string;
    subjectName: string;
    score: number;
    maxScore: number;
    percentage: number;
    isPassing: boolean;
  }>;
  wrongAnswers: WrongAnswerRecord[];
  // 復習モード用：問題データと回答データを保存
  questions?: Question[];
  answers?: Record<string, { answer: string | Record<string, string>; answeredAt: string; questionId: string }>;
}

interface StudyHistoryState {
  records: ExamRecord[];
  addRecord: (result: ExamResult, questions: Question[], answers: Record<string, { answer: string | Record<string, string>; answeredAt: string; questionId: string }>, userId?: string) => void;
  clearHistory: (userId?: string) => void;
  // Firestore同期
  loadFromFirestore: (userId: string) => Promise<void>;
  syncToFirestore: (userId: string) => Promise<void>;
  // エクスポート/インポート
  exportToJson: () => void;
  importFromJson: (jsonText: string) => { success: boolean; message: string };
  // 集計ゲッター
  getTotalStudyTime: () => number;
  getSubjectAccuracy: () => Record<string, { subjectName: string; correct: number; total: number; percentage: number }>;
  getAllWrongAnswers: () => WrongAnswerRecord[];
  getRecentRecords: (n: number) => ExamRecord[];
}

export const useStudyHistoryStore = create<StudyHistoryState>()(
  persist(
    (set, get) => ({
      records: [],

      addRecord: (result, questions, answers, userId) => {
        // 重複防止：同じresult.idが既に保存されている場合はスキップ
        const existing = get().records.find(r => r.id === result.id);
        if (existing) return;

        const wrongAnswers: WrongAnswerRecord[] = [];

        for (const q of questions) {
          const userAnswerEntry = answers[q.id];
          if (!userAnswerEntry) continue;

          if (q.type === 'takuitsu') {
            const isCorrect = userAnswerEntry.answer === q.correctAnswer;
            if (!isCorrect) {
              const choiceIdx = parseInt(userAnswerEntry.answer as string) - 1;
              const correctIdx = parseInt(q.correctAnswer || '1') - 1;
              wrongAnswers.push({
                questionId: q.id,
                subjectId: q.subjectId,
                subjectName: q.subjectName,
                questionText: q.text,
                userAnswer: q.choices?.[choiceIdx]
                  ? `${choiceIdx + 1}. ${q.choices[choiceIdx]}`
                  : `選択肢${userAnswerEntry.answer}`,
                correctAnswer: q.choices?.[correctIdx]
                  ? `${correctIdx + 1}. ${q.choices[correctIdx]}`
                  : `選択肢${q.correctAnswer}`,
                explanation: q.explanation || '',
                examType: q.type,
                examDate: result.completedAt,
              });
            }
          } else if (q.type === 'sentaku' && q.blanks) {
            const blankAnswers = userAnswerEntry.answer as Record<string, string>;
            let hasWrong = false;
            const wrongDetails: string[] = [];
            const correctDetails: string[] = [];

            q.blanks.forEach((blank, idx) => {
              const userBlankAns = blankAnswers?.[blank.id] || '未回答';
              if (userBlankAns !== blank.correctAnswer) {
                hasWrong = true;
                wrongDetails.push(`（${['ア','イ','ウ','エ','オ'][idx]}）${userBlankAns}`);
                correctDetails.push(`（${['ア','イ','ウ','エ','オ'][idx]}）${blank.correctAnswer}`);
              }
            });

            if (hasWrong) {
              wrongAnswers.push({
                questionId: q.id,
                subjectId: q.subjectId,
                subjectName: q.subjectName,
                questionText: q.text.slice(0, 120) + '...',
                userAnswer: wrongDetails.join('、'),
                correctAnswer: correctDetails.join('、'),
                explanation: q.explanation || '',
                examType: q.type,
                examDate: result.completedAt,
              });
            }
          }
        }

        const record: ExamRecord = {
          id: result.id,
          examType: result.type,
          examDate: result.completedAt,
          timeTaken: result.timeTaken,
          totalScore: result.totalScore,
          maxTotalScore: result.maxTotalScore,
          totalPercentage: result.totalPercentage,
          isPassing: result.isPassing,
          subjectResults: result.subjectResults.map(s => ({
            subjectId: s.subjectId,
            subjectName: s.subjectName,
            score: s.score,
            maxScore: s.maxScore,
            percentage: s.percentage,
            isPassing: s.isPassing,
          })),
          wrongAnswers,
          // 復習モード用データを保存
          questions,
          answers,
        };

        set(state => ({ records: [record, ...state.records].slice(0, 50) }));

        // Firestore に試験記録と科目別進捗を保存（ログイン済みの場合のみ）
        if (isFirebaseConfigured && userId && userId !== 'demo-user') {
          saveRecordToFirestore(userId, record).catch((e) =>
            console.error('試験記録Firestore保存エラー:', e)
          );
          // 科目別進捗を保存
          for (const sr of result.subjectResults) {
            saveSubjectProgress(userId, sr.subjectId, sr.score, sr.maxScore).catch((e) =>
              console.error('進捗Firestore保存エラー:', e)
            );
          }
        }
      },

      clearHistory: async (userId?: string) => {
        set({ records: [] });
        // Firestoreも削除
        if (isFirebaseConfigured && userId) {
          try {
            await deleteAllRecordsFromFirestore(userId);
          } catch (e) {
            console.error('Firestore削除エラー:', e);
          }
        }
      },

      // Firestoreからローカルへ同期
      loadFromFirestore: async (userId: string) => {
        if (!isFirebaseConfigured) return;
        try {
          const cloudRecords = await loadRecordsFromFirestore(userId);
          if (cloudRecords.length > 0) {
            // クラウドのデータをローカルにマージ（クラウド優先）
            const localIds = new Set(get().records.map(r => r.id));
            const newRecords = cloudRecords.filter(r => !localIds.has(r.id));
            set(state => ({
              records: [...cloudRecords, ...state.records.filter(r =>
                !cloudRecords.some(cr => cr.id === r.id)
              )].sort((a, b) =>
                new Date(b.examDate).getTime() - new Date(a.examDate).getTime()
              ).slice(0, 50)
            }));
          }
        } catch (e) {
          console.error('Firestore読み込みエラー:', e);
        }
      },

      // ローカルデータをFirestoreへアップロード
      syncToFirestore: async (userId: string) => {
        if (!isFirebaseConfigured) return;
        try {
          const records = get().records;
          await Promise.all(records.map(r => saveRecordToFirestore(userId, r)));
        } catch (e) {
          console.error('Firestore同期エラー:', e);
        }
      },

      // JSONファイルにエクスポート（バックアップ）
      exportToJson: () => {
        const records = get().records;
        const data = {
          exportedAt: new Date().toISOString(),
          version: '1.0',
          records,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sharoshi-history-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },

      // JSONファイルからインポート（復元）
      importFromJson: (jsonText: string) => {
        try {
          const data = JSON.parse(jsonText);
          if (!data.records || !Array.isArray(data.records)) {
            return { success: false, message: '無効なファイル形式です' };
          }
          const imported = data.records as ExamRecord[];
          const existing = get().records;
          const existingIds = new Set(existing.map(r => r.id));
          const newRecords = imported.filter(r => !existingIds.has(r.id));
          set(state => ({
            records: [...newRecords, ...state.records]
              .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())
              .slice(0, 100),
          }));
          return { success: true, message: `${newRecords.length}件の記録をインポートしました` };
        } catch (e) {
          return { success: false, message: 'ファイルの読み込みに失敗しました' };
        }
      },

      getTotalStudyTime: () => {
        return get().records.reduce((sum, r) => sum + r.timeTaken, 0);
      },

      getSubjectAccuracy: () => {
        const acc: Record<string, { subjectName: string; correct: number; total: number; percentage: number }> = {};
        for (const record of get().records) {
          for (const sr of record.subjectResults) {
            if (!acc[sr.subjectId]) {
              acc[sr.subjectId] = { subjectName: sr.subjectName, correct: 0, total: 0, percentage: 0 };
            }
            acc[sr.subjectId].correct += sr.score;
            acc[sr.subjectId].total += sr.maxScore;
          }
        }
        for (const id in acc) {
          const d = acc[id];
          d.percentage = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
        }
        return acc;
      },

      getAllWrongAnswers: () => {
        return get().records.flatMap(r => r.wrongAnswers);
      },

      getRecentRecords: (n) => {
        return get().records.slice(0, n);
      },
    }),

    {
      name: 'sharoshi-study-history',
    }
  )
);
