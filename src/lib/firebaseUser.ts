import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface UserDoc {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  plan: 'free' | 'premium';
  createdAt: unknown; // Firestore Timestamp
}

/** ユーザードキュメントを作成または更新（初回ログイン時） */
export async function createOrUpdateUserDoc(
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string
): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // 初回：新規作成
    await setDoc(ref, {
      uid,
      email,
      displayName,
      photoURL: photoURL || '',
      plan: 'free',
      createdAt: serverTimestamp(),
    });
  } else {
    // 既存：メール・名前・アイコンだけ更新（planは変えない）
    await setDoc(
      ref,
      { email, displayName, photoURL: photoURL || '' },
      { merge: true }
    );
  }
}

/** ユーザーのplanフィールドを取得 */
export async function getUserPlan(uid: string): Promise<'free' | 'premium'> {
  if (!db) return 'free';
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return 'free';
  return (snap.data()?.plan as 'free' | 'premium') ?? 'free';
}

/**
 * ユーザーがプレミアムかどうかを判定するユーティリティ
 * 将来的に plan: "premium" のユーザーだけが使える機能のゲートに使う
 */
export async function isPremium(uid: string): Promise<boolean> {
  const plan = await getUserPlan(uid);
  return plan === 'premium';
}
