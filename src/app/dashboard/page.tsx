'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Card {
  id: string;
  name: string;
  limit: number;
}

interface Purchase {
  id: string;
  date: string;
  product: string;
  amount: number;
  shop: string;
  cardId: string;
}

function getYearMonth(date: string): string {
  return date.slice(0, 7);
}

function formatYen(amount: number): string {
  return `¥${amount.toLocaleString()}`;
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-');
  return `${y}年${parseInt(m)}月`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  useEffect(() => {
    const storedCards = localStorage.getItem('otoquest_cards');
    const storedPurchases = localStorage.getItem('otoquest_purchases');
    const parsedCards: Card[] = storedCards ? JSON.parse(storedCards) : [];
    const parsedPurchases: Purchase[] = storedPurchases
      ? JSON.parse(storedPurchases)
      : [];
    setCards(parsedCards);
    setPurchases(parsedPurchases);

    const months = Array.from(
      new Set(parsedPurchases.map((p) => getYearMonth(p.date)))
    )
      .sort()
      .reverse();
    const current = new Date().toISOString().slice(0, 7);
    if (!months.includes(current)) months.unshift(current);
    setAvailableMonths(months);
  }, []);

  const monthPurchases = purchases
    .filter((p) => getYearMonth(p.date) === selectedMonth)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalAmount = monthPurchases.reduce((sum, p) => sum + p.amount, 0);

  const cardUsage = cards.map((card) => {
    const used = monthPurchases
      .filter((p) => p.cardId === card.id)
      .reduce((sum, p) => sum + p.amount, 0);
    const remaining = card.limit - used;
    const usedPct = card.limit > 0 ? (used / card.limit) * 100 : 0;
    const remainingPct = 100 - usedPct;
    const isLow = remainingPct <= 20;
    return { ...card, used, remaining, remainingPct, usedPct, isLow };
  });

  const cardMap = Object.fromEntries(cards.map((c) => [c.id, c.name]));

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem',
          }}
        >
          ← トップ
        </button>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
          📊 月次ダッシュボード
        </h1>
        <div style={{ marginLeft: 'auto' }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text)',
              fontSize: '0.85rem',
            }}
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 月間合計 */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {formatMonth(selectedMonth)} の合計支出
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-accent)' }}>
          {formatYen(totalAmount)}
        </div>
      </div>

      {/* カード別サマリー */}
      {cards.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            💳 カード別サマリー
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '14px',
            }}
          >
            {cardUsage.map((c) => (
              <div key={c.id} className="card" style={{ padding: '18px 20px' }}>
                <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '0.95rem' }}>
                  {c.name}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: '8px',
                  }}
                >
                  <span>
                    使用額:{' '}
                    <strong style={{ color: 'var(--color-text)' }}>
                      {formatYen(c.used)}
                    </strong>
                  </span>
                  <span>限度額: {formatYen(c.limit)}</span>
                </div>
                <div
                  style={{
                    height: '7px',
                    background: 'var(--color-border)',
                    borderRadius: '4px',
                    marginBottom: '7px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, c.usedPct)}%`,
                      background: c.isLow ? '#e74c3c' : 'var(--color-accent)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: c.isLow ? '#e74c3c' : 'var(--color-text-muted)',
                    fontWeight: c.isLow ? 700 : 400,
                  }}
                >
                  残枠: {formatYen(c.remaining)} ({Math.round(c.remainingPct)}%)
                  {c.isLow && ' ⚠️ 残枠わずか'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 月間購入履歴テーブル */}
      <div>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          📋 購入履歴
        </h2>
        {monthPurchases.length === 0 ? (
          <div
            className="card"
            style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}
          >
            この月の購入履歴はありません
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    {['日付', '商品名', '金額', 'ショップ', 'カード'].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: 'var(--color-text-muted)',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthPurchases.map((p) => (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                        {p.date}
                      </td>
                      <td style={{ padding: '11px 16px' }}>{p.product}</td>
                      <td
                        style={{
                          padding: '11px 16px',
                          whiteSpace: 'nowrap',
                          fontWeight: 600,
                          color: 'var(--color-accent)',
                        }}
                      >
                        {formatYen(p.amount)}
                      </td>
                      <td style={{ padding: '11px 16px' }}>{p.shop}</td>
                      <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            background: 'rgba(52,152,219,0.15)',
                            color: '#3498db',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {cardMap[p.cardId] ?? p.cardId ?? '不明'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {cards.length === 0 && purchases.length === 0 && (
        <div
          className="card"
          style={{ padding: '60px', textAlign: 'center', color: 'var(--color-text-muted)' }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
          <p>カード・購入データがまだありません。</p>
        </div>
      )}
    </main>
  );
}
