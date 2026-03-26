'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import {
  fetchRandomQuestion,
  savePracticeResult,
  type PracticeQuestion,
} from '../../lib/firestoreQuestions';
import { isFirebaseConfigured } from '../../lib/firebase';
import questionsJson from '../../../scripts/questions_seed.json';

const SUBJECTS = [
  'すべて',
  '労働基準法',
  '労働安全衛生法',
  '労働者災害補償保険法',
  '雇用保険法',
  '労働保険徴収法',
  '健康保険法',
  '国民年金法',
  '厚生年金保険法',
  '労務管理その他労働に関する一般常識',
  '社会保険に関する一般常識',
];

const TYPES = ['すべて', '択一式', '選択式', '○×'];
const DIFFICULTIES = ['すべて', '基礎', '標準', '応用'];

// ローカルJSONからランダム取得（Firebase未設定時のフォールバック）
function getLocalQuestion(subject: string, type: string, difficulty: string): PracticeQuestion | null {
  let pool = (questionsJson as PracticeQuestion[]).filter(q => q.isActive !== false);
  if (subject !== 'すべて') pool = pool.filter(q => q.subject === subject);
  if (type !== 'すべて') pool = pool.filter(q => q.type === type);
  if (difficulty !== 'すべて') pool = pool.filter(q => q.difficulty === difficulty);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function PracticePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [subject, setSubject] = useState('すべて');
  const [type, setType] = useState('すべて');
  const [difficulty, setDifficulty] = useState('すべて');

  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 択一式・○×の選択状態
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  // 選択式の穴埋め状態
  const [fillAnswers, setFillAnswers] = useState<Record<string, string>>({});
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 統計
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  const loadQuestion = async () => {
    setLoading(true);
    setError('');
    setSelectedChoice(null);
    setFillAnswers({});
    setAnswered(false);
    setIsCorrect(null);
    try {
      let q: PracticeQuestion | null = null;
      if (isFirebaseConfigured) {
        q = await fetchRandomQuestion(
          subject === 'すべて' ? 'all' : subject,
          type === 'すべて' ? 'all' : type,
          difficulty === 'すべて' ? 'all' : difficulty
        );
      }
      // Firestore未設定またはFirestoreが空 → ローカルJSONフォールバック
      if (!q) {
        q = getLocalQuestion(subject, type, difficulty);
      }
      if (!q) {
        setError('条件に合う問題が見つかりませんでした。条件を変更してください。');
      } else {
        setQuestion(q);
      }
    } catch {
      // Firestoreエラー時はローカルJSONで対応
      const q = getLocalQuestion(subject, type, difficulty);
      if (q) setQuestion(q);
      else setError('問題の読み込みに失敗しました。再試行してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!question || answered) return;

    let correct = false;

    if (question.type === '択一式') {
      correct = selectedChoice === question.answer;
    } else if (question.type === '○×') {
      const userBool = selectedChoice === 'true';
      correct = userBool === (question.answer as unknown as boolean);
    } else if (question.type === '選択式' && question.answers) {
      const keys = Object.keys(question.answers);
      correct = keys.every(k => fillAnswers[k] === question.answers![k]);
    }

    setIsCorrect(correct);
    setAnswered(true);
    setStats(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));

    if (user && user.uid !== 'demo-user' && question) {
      await savePracticeResult(user.uid, question, correct);
    }
  };

  const canAnswer = () => {
    if (!question) return false;
    if (question.type === '択一式' || question.type === '○×') return selectedChoice !== null;
    if (question.type === '選択式' && question.answers) {
      return Object.keys(question.answers).every(k => fillAnswers[k]);
    }
    return false;
  };

  const blankLabels = ['A', 'B', 'C', 'D', 'E'];

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
          ← トップ
        </button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>🧠 練習問題</h1>
        {stats.total > 0 && (
          <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            正答率 <span style={{ fontWeight: 700, color: stats.correct / stats.total >= 0.6 ? 'var(--color-success)' : 'var(--color-error)' }}>
              {Math.round((stats.correct / stats.total) * 100)}%
            </span> ({stats.correct}/{stats.total})
          </div>
        )}
      </div>

      {/* フィルター */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          {/* 科目 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>科目</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)', color: 'var(--color-text)', fontSize: '0.85rem' }}
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* 形式 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>形式</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)', color: 'var(--color-text)', fontSize: '0.85rem' }}
            >
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {/* 難易度 */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>難易度</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)', color: 'var(--color-text)', fontSize: '0.85rem' }}
            >
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <button
          className="btn btn-primary"
          onClick={loadQuestion}
          disabled={loading}
          style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
        >
          {loading ? '問題を読み込み中...' : '問題を生成する'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', color: 'var(--color-error)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* 問題表示 */}
      {question && (
        <div className="card fade-in" style={{ padding: '28px' }}>
          {/* メタ情報 */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.75rem', background: 'rgba(52,152,219,0.15)', color: '#3498db', padding: '2px 10px', borderRadius: '20px', fontWeight: 600 }}>
              {question.subject}
            </span>
            <span style={{ fontSize: '0.75rem', background: 'rgba(155,89,182,0.15)', color: '#9b59b6', padding: '2px 10px', borderRadius: '20px', fontWeight: 600 }}>
              {question.type}
            </span>
            <span style={{ fontSize: '0.75rem', background: question.difficulty === '基礎' ? 'rgba(46,204,113,0.15)' : question.difficulty === '標準' ? 'rgba(241,196,15,0.15)' : 'rgba(231,76,60,0.15)', color: question.difficulty === '基礎' ? '#2ecc71' : question.difficulty === '標準' ? '#f1c40f' : '#e74c3c', padding: '2px 10px', borderRadius: '20px', fontWeight: 600 }}>
              {question.difficulty}
            </span>
          </div>

          {/* 問題文 */}
          <p style={{ fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
            {question.question}
          </p>

          {/* 択一式 */}
          {question.type === '択一式' && question.choices && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {Object.entries(question.choices).map(([key, text]) => {
                const isSelected = selectedChoice === key;
                const showResult = answered;
                const isCorrectChoice = key === question.answer;
                let bg = 'var(--color-bg-elevated)';
                let border = 'var(--color-border)';
                if (showResult && isCorrectChoice) { bg = 'rgba(46,204,113,0.15)'; border = '#2ecc71'; }
                else if (showResult && isSelected && !isCorrectChoice) { bg = 'rgba(231,76,60,0.15)'; border = '#e74c3c'; }
                else if (!showResult && isSelected) { bg = 'rgba(52,152,219,0.15)'; border = '#3498db'; }
                return (
                  <button
                    key={key}
                    onClick={() => !answered && setSelectedChoice(key)}
                    style={{ textAlign: 'left', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${border}`, background: bg, color: 'var(--color-text)', cursor: answered ? 'default' : 'pointer', fontSize: '0.9rem', lineHeight: 1.6, transition: 'all 0.2s' }}
                  >
                    <strong>{key}.</strong> {text}
                    {showResult && isCorrectChoice && <span style={{ marginLeft: '8px', color: '#2ecc71' }}>✓ 正解</span>}
                    {showResult && isSelected && !isCorrectChoice && <span style={{ marginLeft: '8px', color: '#e74c3c' }}>✗</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* ○× */}
          {question.type === '○×' && (
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              {['true', 'false'].map(val => {
                const label = val === 'true' ? '○' : '×';
                const isSelected = selectedChoice === val;
                const isCorrectVal = String(question.answer) === val;
                let bg = 'var(--color-bg-elevated)';
                let border = 'var(--color-border)';
                let color = 'var(--color-text)';
                if (answered && isCorrectVal) { bg = 'rgba(46,204,113,0.15)'; border = '#2ecc71'; color = '#2ecc71'; }
                else if (answered && isSelected && !isCorrectVal) { bg = 'rgba(231,76,60,0.15)'; border = '#e74c3c'; color = '#e74c3c'; }
                else if (!answered && isSelected) { bg = 'rgba(52,152,219,0.15)'; border = '#3498db'; color = '#3498db'; }
                return (
                  <button
                    key={val}
                    onClick={() => !answered && setSelectedChoice(val)}
                    style={{ flex: 1, padding: '20px', fontSize: '2.5rem', fontWeight: 800, borderRadius: '12px', border: `2px solid ${border}`, background: bg, color, cursor: answered ? 'default' : 'pointer', transition: 'all 0.2s' }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}

          {/* 選択式 */}
          {question.type === '選択式' && question.answers && question.word_bank && (
            <div style={{ marginBottom: '20px' }}>
              {/* 空欄ごとの選択 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {Object.keys(question.answers).map((key, i) => {
                  const isCorrectFill = fillAnswers[key] === question.answers![key];
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-accent)', minWidth: '32px' }}>【{blankLabels[i]}】</span>
                      <select
                        value={fillAnswers[key] || ''}
                        onChange={e => setFillAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                        disabled={answered}
                        style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: `1px solid ${answered ? isCorrectFill ? '#2ecc71' : '#e74c3c' : 'var(--color-border)'}`, background: answered ? isCorrectFill ? 'rgba(46,204,113,0.1)' : 'rgba(231,76,60,0.1)' : 'var(--color-bg-elevated)', color: 'var(--color-text)', fontSize: '0.9rem' }}
                      >
                        <option value="">-- 選択してください --</option>
                        {question.word_bank!.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                      {answered && <span style={{ color: isCorrectFill ? '#2ecc71' : '#e74c3c', fontWeight: 700 }}>{isCorrectFill ? '✓' : `✗ 正解: ${question.answers![key]}`}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 回答・次へボタン */}
          {!answered ? (
            <button
              className="btn btn-primary"
              onClick={handleAnswer}
              disabled={!canAnswer()}
              style={{ width: '100%', padding: '13px', fontSize: '1rem', marginBottom: '16px' }}
            >
              回答する
            </button>
          ) : (
            <>
              {/* 正誤表示 */}
              <div style={{
                background: isCorrect ? 'rgba(46,204,113,0.12)' : 'rgba(231,76,60,0.12)',
                border: `1px solid ${isCorrect ? '#2ecc71' : '#e74c3c'}`,
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isCorrect ? '#2ecc71' : '#e74c3c', marginBottom: '10px' }}>
                  {isCorrect ? '✅ 正解！' : '❌ 不正解'}
                </div>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--color-text-muted)', marginBottom: '10px' }}>
                  {question.explanation}
                </p>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                  📖 {question.law_reference}
                </div>
              </div>
              <button
                className="btn btn-primary"
                onClick={loadQuestion}
                style={{ width: '100%', padding: '13px', fontSize: '1rem' }}
              >
                次の問題へ →
              </button>
            </>
          )}
        </div>
      )}

      {!user || user.uid === 'demo-user' ? (
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '20px' }}>
          ※ Googleログインすると学習記録が自動保存されます
        </p>
      ) : null}
    </main>
  );
}
