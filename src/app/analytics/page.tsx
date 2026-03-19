'use client';

import { useRouter } from 'next/navigation';
import { useStudyHistoryStore, ExamRecord, WrongAnswerRecord } from '../../stores/studyHistoryStore';
import { useExamStore } from '../../stores/examStore';
import { useState } from 'react';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}時間${m}分`;
  return `${m}分${s}秒`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function AccuracyBar({ percentage, label }: { percentage: number; label: string }) {
  const color = percentage >= 80 ? 'var(--color-success)' : percentage >= 60 ? 'var(--color-accent)' : 'var(--color-error)';
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {percentage < 60 && (
            <span style={{ fontSize: '0.7rem', background: 'rgba(231,76,60,0.2)', color: 'var(--color-error)', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>
              要強化
            </span>
          )}
          {percentage >= 60 && percentage < 80 && (
            <span style={{ fontSize: '0.7rem', background: 'rgba(232,160,32,0.2)', color: 'var(--color-accent)', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>
              注意
            </span>
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color }}>{percentage}%</span>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${percentage}%`, background: color, transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}

function WrongAnswerItem({ item }: { item: WrongAnswerRecord }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ 
      borderLeft: '3px solid var(--color-error)', 
      paddingLeft: '16px', 
      marginBottom: '12px',
      background: 'var(--color-bg-elevated)',
      borderRadius: '0 8px 8px 0',
      overflow: 'hidden'
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ 
          width: '100%', 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--color-text)', 
          textAlign: 'left', 
          cursor: 'pointer',
          padding: '12px 16px 12px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '8px'
        }}
      >
        <span style={{ fontSize: '0.85rem', lineHeight: 1.5, flex: 1 }}>
          {item.questionText.slice(0, 80)}{item.questionText.length > 80 ? '…' : ''}
        </span>
        <span style={{ color: 'var(--color-text-muted)', flexShrink: 0, fontSize: '1rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 0 16px 0', fontSize: '0.85rem' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>あなたの回答：</span>
            <span style={{ marginLeft: '8px', color: 'var(--color-text-muted)' }}>{item.userAnswer || '未回答'}</span>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>正解：</span>
            <span style={{ marginLeft: '8px', color: 'var(--color-text)' }}>{item.correctAnswer}</span>
          </div>
          {item.explanation && (
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '10px 14px', 
              borderRadius: '8px',
              fontSize: '0.82rem',
              lineHeight: 1.7,
              color: 'var(--color-text-muted)'
            }}>
              <span style={{ color: 'var(--color-accent)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>📝 解説</span>
              {item.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { records, clearHistory, getTotalStudyTime, getSubjectAccuracy, getAllWrongAnswers, exportToJson, importFromJson } = useStudyHistoryStore();
  const loadReviewFromRecord = useExamStore((s) => s.loadReviewFromRecord);
  const [activeTab, setActiveTab] = useState<'summary' | 'subjects' | 'wrong'>('summary');
  const [wrongFilter, setWrongFilter] = useState<string>('all');
  const [importMessage, setImportMessage] = useState<string>('');

  const handleStartReview = (rec: ExamRecord) => {
    if (!rec.questions || !rec.answers) {
      alert('この試験記録には問題データが保存されていません。\n（この機能は最新の試験から有効です）');
      return;
    }
    loadReviewFromRecord(rec.questions, rec.answers, rec.examType, rec.id);
    router.push(`/exam/${rec.examType}`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = importFromJson(text);
      setImportMessage(result.message);
      setTimeout(() => setImportMessage(''), 4000);
    };
    reader.readAsText(file);
    e.target.value = ''; // リセット
  };

  const totalTime = getTotalStudyTime();
  const subjectAccuracy = getSubjectAccuracy();
  const allWrong = getAllWrongAnswers();
  const recentRecords = records.slice(0, 10);

  // 科目フィルターに使う一覧
  const wrongSubjects = Array.from(new Set(allWrong.map(w => w.subjectId)));
  const filteredWrong = wrongFilter === 'all'
    ? allWrong
    : allWrong.filter(w => w.subjectId === wrongFilter);

  // 苦手科目TOP3
  const weakSubjects = Object.entries(subjectAccuracy)
    .sort((a, b) => a[1].percentage - b[1].percentage)
    .slice(0, 3);

  const tabStyle = (active: boolean) => ({
    padding: '10px 20px',
    background: active ? 'var(--color-accent)' : 'transparent',
    color: active ? '#000' : 'var(--color-text-muted)',
    border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: active ? 700 : 400,
    fontSize: '0.9rem',
  });

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
            📊 学習分析
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            過去の受験データから弱点を把握しましょう
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => router.push('/')}>
          ← ダッシュボード
        </button>
      </div>

      {records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>受験履歴がありません</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            まず模擬試験を受験してください。結果が自動的に記録されます。
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>
            試験を受ける
          </button>
        </div>
      ) : (
        <>
          {/* サマリーカード */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }} className="fade-in">
            <div className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>総受験回数</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)' }}>{records.length}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>回</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>総学習時間</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-info)' }}>{formatTime(totalTime)}</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>合格回数</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-success)' }}>
                {records.filter(r => r.isPassing).length}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>回</div>
            </div>
            <div className="card" style={{ textAlign: 'center', padding: '20px 12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '6px' }}>間違い問題数</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-error)' }}>{allWrong.length}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>問</div>
            </div>
          </div>

          {/* 苦手科目ハイライト（横断） */}
          {weakSubjects.length > 0 && weakSubjects[0][1].percentage < 80 && (
            <div className="card fade-in" style={{ marginBottom: '32px', padding: '20px 24px', borderLeft: '3px solid var(--color-error)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-error)' }}>
                ⚠️ 重点強化が必要な科目
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {weakSubjects.map(([id, data]) => (
                  <div key={id} style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '8px', padding: '8px 14px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{data.subjectName}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-error)' }}>{data.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* タブ切り替え */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button style={tabStyle(activeTab === 'summary')} onClick={() => setActiveTab('summary')}>📋 受験履歴</button>
            <button style={tabStyle(activeTab === 'subjects')} onClick={() => setActiveTab('subjects')}>📊 科目別分析</button>
            <button style={tabStyle(activeTab === 'wrong')} onClick={() => setActiveTab('wrong')}>❌ 間違い問題</button>
          </div>

          {/* ── 受験履歴タブ ── */}
          {activeTab === 'summary' && (
            <div className="fade-in">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentRecords.map((rec: ExamRecord) => (
                  <div key={rec.id} className="card" style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <span className="badge" style={{
                            background: rec.examType === 'sentaku' ? 'rgba(232,160,32,0.2)' : 'rgba(52,152,219,0.2)',
                            color: rec.examType === 'sentaku' ? 'var(--color-accent)' : 'var(--color-info)',
                            fontSize: '0.75rem'
                          }}>
                            {rec.examType === 'sentaku' ? '選択式' : '択一式'}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{formatDate(rec.examDate)}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                          ⏱ {formatTime(rec.timeTaken)}
                          <span style={{ margin: '0 8px' }}>•</span>
                          間違い {rec.wrongAnswers.length} 問
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: rec.isPassing ? 'var(--color-success)' : 'var(--color-error)' }}>
                          {rec.totalScore}<span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--color-text-muted)' }}>/{rec.maxTotalScore}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: rec.isPassing ? 'var(--color-success)' : 'var(--color-error)' }}>
                          {rec.isPassing ? '合格' : '不合格'}
                        </span>
                      </div>
                    </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '6px' }}>
                       {rec.subjectResults.map(sr => (
                         <div key={sr.subjectId} style={{ fontSize: '0.72rem' }}>
                           <div style={{ color: 'var(--color-text-muted)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                             {sr.subjectName.slice(0, 12)}{sr.subjectName.length > 12 ? '…' : ''}
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                               <div style={{ height: '100%', width: `${sr.percentage}%`, background: sr.isPassing ? 'var(--color-success)' : 'var(--color-error)', borderRadius: '2px' }} />
                             </div>
                             <span style={{ color: sr.isPassing ? 'var(--color-success)' : 'var(--color-error)', fontWeight: 600, minWidth: '28px' }}>{sr.percentage}%</span>
                           </div>
                         </div>
                       ))}
                     </div>
                     {/* 復習ボタン */}
                     <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                       <button
                         className="btn btn-secondary"
                         onClick={() => handleStartReview(rec)}
                         style={{
                           fontSize: '0.8rem',
                           padding: '8px 16px',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '6px',
                           opacity: rec.questions ? 1 : 0.5,
                         }}
                         title={rec.questions ? 'この試験を復習する' : '問題データが保存されていない試験です（古い履歴）'}
                       >
                         📖 復習する
                         {!rec.questions && <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>（データなし）</span>}
                       </button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 科目別分析タブ ── */}
          {activeTab === 'subjects' && (
            <div className="fade-in">
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>
                  科目別 平均正答率（全受験回数通算）
                </h3>
                {Object.entries(subjectAccuracy).length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px' }}>データなし</p>
                ) : (
                  Object.entries(subjectAccuracy)
                    .sort((a, b) => a[1].percentage - b[1].percentage)
                    .map(([id, data]) => (
                      <AccuracyBar key={id} percentage={data.percentage} label={data.subjectName} />
                    ))
                )}
              </div>

              {/* 学習アドバイス */}
              <div className="card" style={{ marginTop: '20px', padding: '20px 24px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: 'var(--color-accent)' }}>
                  💡 学習効率アップのヒント
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(subjectAccuracy).filter(([,d]) => d.percentage < 60).slice(0,2).map(([id, data]) => (
                    <li key={id} style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                      <span>🔴</span>
                      <span><strong>{data.subjectName}</strong>（{data.percentage}%）は正答率が低め。間違い問題タブで頻出の誤答パターンを確認しましょう。</span>
                    </li>
                  ))}
                  {Object.entries(subjectAccuracy).filter(([,d]) => d.percentage >= 60 && d.percentage < 80).slice(0,2).map(([id, data]) => (
                    <li key={id} style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                      <span>🟡</span>
                      <span><strong>{data.subjectName}</strong>（{data.percentage}%）は安定圏まであとわずか。数字・日数を正確に覚えましょう。</span>
                    </li>
                  ))}
                  {Object.entries(subjectAccuracy).filter(([,d]) => d.percentage >= 80).length > 0 && (
                    <li style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                      <span>🟢</span>
                      <span>正答率80%以上の科目は維持しつつ、週1回は復習で知識の定着を確認してください。</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* ── 間違い問題タブ ── */}
          {activeTab === 'wrong' && (
            <div className="fade-in">
              {/* 科目フィルター */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <button
                  onClick={() => setWrongFilter('all')}
                  style={{ ...tabStyle(wrongFilter === 'all'), fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  すべて（{allWrong.length}）
                </button>
                {wrongSubjects.map(sid => {
                  const first = allWrong.find(w => w.subjectId === sid);
                  const count = allWrong.filter(w => w.subjectId === sid).length;
                  return (
                    <button
                      key={sid}
                      onClick={() => setWrongFilter(sid)}
                      style={{ ...tabStyle(wrongFilter === sid), fontSize: '0.8rem', padding: '6px 14px' }}
                    >
                      {first?.subjectName.slice(0, 8)}…（{count}）
                    </button>
                  );
                })}
              </div>

              {filteredWrong.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
                  <p style={{ color: 'var(--color-text-muted)' }}>この科目の間違いはありません！</p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                    クリックして解説を表示できます
                  </p>
                  {filteredWrong.map((item, idx) => (
                    <WrongAnswerItem key={`${item.questionId}_${idx}`} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* データ管理 */}
          <div style={{ marginTop: '48px', padding: '24px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '16px' }}>📦 データ管理（バックアップ）</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.6 }}>
              学習履歴をJSONファイルにエクスポートしてバックアップできます。<br />
              システム更新後もインポートで復元可能です。
            </p>
            {importMessage && (
              <div style={{
                padding: '10px 16px', marginBottom: '16px',
                background: importMessage.includes('件') ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
                borderRadius: '8px', fontSize: '0.85rem',
                color: importMessage.includes('件') ? 'var(--color-success)' : 'var(--color-error)',
              }}>
                {importMessage.includes('件') ? '✅ ' : '❌ '}{importMessage}
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* エクスポート */}
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '10px 18px' }}
                onClick={exportToJson}
              >
                📥 バックアップをダウンロード
              </button>

              {/* インポート */}
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', fontSize: '0.85rem', cursor: 'pointer',
                background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-border)',
                borderRadius: '8px', color: 'var(--color-text)', fontWeight: 500,
                transition: 'background 0.2s',
              }}>
                📤 バックアップから復元
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </label>

              {/* リセット */}
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', color: 'var(--color-error)', borderColor: 'var(--color-error)', marginLeft: 'auto' }}
                onClick={() => {
                  if (confirm('学習履歴をすべて削除しますか？この操作は取り消せません。\n（先にバックアップをダウンロードすることをお勧めします）')) {
                    clearHistory();
                  }
                }}
              >
                🗑 履歴をリセット
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
