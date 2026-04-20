import { auth, isFirebaseConfigured } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';

/** メール/パスワードで新規登録し、表示名を設定 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> {
  if (!auth || !isFirebaseConfigured) throw new Error('Firebase が設定されていません');
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  return cred.user;
}

/** メール/パスワードでログイン */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  if (!auth || !isFirebaseConfigured) throw new Error('Firebase が設定されていません');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** ログアウト */
export async function signOutUser(): Promise<void> {
  if (auth && isFirebaseConfigured) await firebaseSignOut(auth);
}
