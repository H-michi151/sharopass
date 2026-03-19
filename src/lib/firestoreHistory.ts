import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { ExamRecord } from '../stores/studyHistoryStore';

const RECORDS_COLLECTION = 'examRecords';

/** Firestoreへ試験記録を保存するpath: users/{uid}/examRecords/{recordId} */
export async function saveRecordToFirestore(userId: string, record: ExamRecord): Promise<void> {
  if (!db) throw new Error('Firestore is not configured');
  const ref = doc(db, 'users', userId, RECORDS_COLLECTION, record.id);
  // questionsが大きい場合、Firestoreの1ドキュメント1MB制限に注意
  // 問題データはchoicesを除いた最小限に絞って保存
  const lightRecord = {
    ...record,
    // questions は復習用に保持するが、choicesは省略して容量を節約
    questions: record.questions?.map(q => ({
      id: q.id,
      type: q.type,
      subjectId: q.subjectId,
      subjectName: q.subjectName,
      globalNumber: q.globalNumber,
      questionNumber: q.questionNumber,
      text: q.text,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      blanks: q.blanks,
      choices: q.choices,
      examId: q.examId,
      tags: q.tags,
      difficulty: q.difficulty,
    })),
  };
  await setDoc(ref, lightRecord);
}

/** ユーザーの全試験記録をFirestoreから取得 */
export async function loadRecordsFromFirestore(userId: string, maxCount = 50): Promise<ExamRecord[]> {
  if (!db) return [];
  const colRef = collection(db, 'users', userId, RECORDS_COLLECTION);
  const q = query(colRef, orderBy('examDate', 'desc'), limit(maxCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as ExamRecord);
}

/** ユーザーの全試験記録をFirestoreから削除 */
export async function deleteAllRecordsFromFirestore(userId: string): Promise<void> {
  if (!db) return;
  const colRef = collection(db, 'users', userId, RECORDS_COLLECTION);
  const snap = await getDocs(colRef);
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
}
