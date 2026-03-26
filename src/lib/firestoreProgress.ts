import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';

export interface SubjectProgress {
  correct: number;
  total: number;
  lastStudied: unknown; // Firestore Timestamp
  history: { date: string; correct: number; total: number }[];
}

/** 科目別進捗を Firestore に保存（users/{uid}/progress/{subjectId}） */
export async function saveSubjectProgress(
  uid: string,
  subjectId: string,
  correct: number,
  total: number
): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid, 'progress', subjectId);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? (snap.data() as SubjectProgress) : null;

  await setDoc(ref, {
    correct: (existing?.correct ?? 0) + correct,
    total: (existing?.total ?? 0) + total,
    lastStudied: serverTimestamp(),
    history: arrayUnion({
      date: new Date().toISOString().split('T')[0],
      correct,
      total,
    }),
  } as Record<string, unknown>);
}

/** 科目別進捗を Firestore から取得 */
export async function getSubjectProgress(
  uid: string,
  subjectId: string
): Promise<SubjectProgress | null> {
  if (!db) return null;
  const ref = doc(db, 'users', uid, 'progress', subjectId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as SubjectProgress) : null;
}
