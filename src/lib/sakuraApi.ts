/**
 * sakuraApi.ts - さくらPHP APIへのクライアント
 * さくらレンタルサーバー（ビジネスプラン）のPHP APIと通信する
 */
import { ExamRecord } from '../stores/studyHistoryStore';

// ========================================
// 設定（.env.local に追加してください）
// NEXT_PUBLIC_SAKURA_API_URL=https://yourdomain.sakura.ne.jp/api
// ========================================
const API_BASE = process.env.NEXT_PUBLIC_SAKURA_API_URL || '';

export const isSakuraConfigured = !!process.env.NEXT_PUBLIC_SAKURA_API_URL;

/** localStorageからJWTトークンを取得 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sharoshi_token');
}

/** JWTトークンを保存 */
export function setToken(token: string): void {
  localStorage.setItem('sharoshi_token', token);
}

/** JWTトークンを削除（ログアウト） */
export function clearToken(): void {
  localStorage.removeItem('sharoshi_token');
}

/** 共通フェッチ関数 */
async function apiCall<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API Error: ${res.status}`);
  return data as T;
}

// ========================================
// 認証API
// ========================================
export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
}

/** ユーザー登録 */
export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<{ token: string; user: AuthUser }> {
  const result = await apiCall<{ token: string; user: AuthUser }>('/register.php', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName }),
  });
  setToken(result.token);
  return result;
}

/** ログイン */
export async function loginUser(
  email: string,
  password: string
): Promise<{ token: string; user: AuthUser }> {
  const result = await apiCall<{ token: string; user: AuthUser }>('/login.php', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(result.token);
  return result;
}

// ========================================
// 学習履歴API
// ========================================

/** 学習履歴を保存 */
export async function saveHistoryToSakura(record: ExamRecord): Promise<void> {
  if (!isSakuraConfigured) return;
  await apiCall('/history_save.php', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

/** 学習履歴を取得 */
export async function loadHistoryFromSakura(): Promise<ExamRecord[]> {
  if (!isSakuraConfigured) return [];
  const data = await apiCall<{ records: ExamRecord[] }>('/history_load.php');
  return data.records;
}
