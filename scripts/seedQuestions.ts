/**
 * scripts/seedQuestions.ts
 * Firebase Admin SDK を使って questions_seed.json を Firestore に一括登録する
 *
 * 実行方法：
 *   1. Firebase Admin SDK をインストール: npm install firebase-admin
 *   2. サービスアカウントキーを環境変数に設定:
 *      export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
 *   3. 実行: npx ts-node scripts/seedQuestions.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as questions from './questions_seed.json';

// Firebase Admin 初期化（環境変数 GOOGLE_APPLICATION_CREDENTIALS を使用）
initializeApp({
  credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
});

const db = getFirestore();

async function seedQuestions() {
  const col = db.collection('questions');
  const batch = db.batch();
  let count = 0;

  for (const q of questions as any[]) {
    const ref = col.doc(q.id);
    batch.set(ref, {
      ...q,
      isActive: true,
      createdAt: Timestamp.now(),
    });
    count++;
    // Firestore batch limit is 500 writes
    if (count % 499 === 0) {
      await batch.commit();
      console.log(`Committed ${count} questions...`);
    }
  }

  await batch.commit();
  console.log(`✅ Done! Seeded ${count} questions to Firestore 'questions' collection.`);
}

seedQuestions().catch(console.error);
