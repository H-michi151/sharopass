import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

export interface PracticeQuestion {
  id: string;
  subject: string;
  type: '択一式' | '選択式' | '○×';
  difficulty: '基礎' | '標準' | '応用';
  question: string;
  // 択一式
  choices?: Record<string, string>;
  answer?: string;
  // 選択式
  word_bank?: string[];
  answers?: Record<string, string>;
  // ○×
  // answer: true | false (booleanの場合もあり)
  explanation: string;
  law_reference: string;
  isActive?: boolean;
}

/** Firestoreから条件に合う問題をランダムに1問取得 */
export async function fetchRandomQuestion(
  subject: string,
  type: string,
  difficulty: string
): Promise<PracticeQuestion | null> {
  if (!db) return null;
  try {
    const col = collection(db, 'questions');
    const constraints = [where('isActive', '==', true)];
    if (subject !== 'all') constraints.push(where('subject', '==', subject));
    if (type !== 'all') constraints.push(where('type', '==', type));
    if (difficulty !== 'all') constraints.push(where('difficulty', '==', difficulty));

    const q = query(col, ...constraints);
    const snap = await getDocs(q);
    if (snap.empty) return null;

    const docs = snap.docs;
    const randomDoc = docs[Math.floor(Math.random() * docs.length)];
    return { id: randomDoc.id, ...randomDoc.data() } as PracticeQuestion;
  } catch (e) {
    console.error('問題取得エラー:', e);
    return null;
  }
}

/** ユーザーの練習問題正誤を Firestore に保存 */
export async function savePracticeResult(
  uid: string,
  question: PracticeQuestion,
  isCorrect: boolean
): Promise<void> {
  if (!db || uid === 'demo-user') return;
  try {
    const ref = doc(
      db,
      'users',
      uid,
      'practiceResults',
      `${question.id}_${Date.now()}`
    );
    await setDoc(ref, {
      questionId: question.id,
      subject: question.subject,
      type: question.type,
      difficulty: question.difficulty,
      isCorrect,
      answeredAt: serverTimestamp(),
    });
  } catch (e) {
    console.error('練習結果保存エラー:', e);
  }
}
