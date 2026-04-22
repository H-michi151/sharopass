import Link from 'next/link';

const sectionStyle: React.CSSProperties = {
  marginBottom: '32px',
};

const h2Style: React.CSSProperties = {
  fontSize: '1.05rem',
  fontWeight: 700,
  marginBottom: '12px',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--color-border)',
};

const pStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  lineHeight: 1.9,
  color: 'var(--color-text-muted)',
};

export const metadata = {
  title: 'プライバシーポリシー | SHAROPASS',
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 20px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
        プライバシーポリシー
      </h1>
      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '40px' }}>
        最終更新日：2026年4月22日
      </p>

      <div style={sectionStyle}>
        <h2 style={h2Style}>1. 運営者情報</h2>
        <p style={pStyle}>
          本サービス「SHAROPASS」（以下「本サービス」）は、MIC（管理者）が運営します。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>2. 収集する情報</h2>
        <p style={pStyle}>
          本サービスでは、以下の情報を収集します。
        </p>
        <ul style={{ ...pStyle, paddingLeft: '20px', marginTop: '8px' }}>
          <li>メールアドレス（アカウント登録時）</li>
          <li>表示名（アカウント登録時に任意入力）</li>
          <li>学習履歴・試験結果データ（Firestore に保存）</li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>3. 利用目的</h2>
        <ul style={{ ...pStyle, paddingLeft: '20px' }}>
          <li>ユーザー認証及びアカウント管理</li>
          <li>学習データ・試験結果の保存・表示</li>
          <li>サービス改善のための統計分析（個人を特定しない形式）</li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>4. 第三者提供</h2>
        <p style={pStyle}>
          収集した情報は、法令に基づく場合を除き、第三者に提供・開示しません。
          ただし、本サービスは Google Firebase（Google LLC）を利用しており、
          データ処理の一部を委託しています。Firebase のプライバシーポリシーについては
          Google のサービス利用規約をご参照ください。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>5. Cookie・ローカルストレージ</h2>
        <p style={pStyle}>
          本サービスは認証セッション管理のために Firebase が設定する Cookie を使用します。
          また、一部設定情報をブラウザのローカルストレージに保存します。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>6. データの保管・削除</h2>
        <p style={pStyle}>
          収集したデータは、サービス提供に必要な期間保管します。
          アカウント削除・データ消去をご希望の場合は、
          <Link href="/contact" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
            お問い合わせフォーム
          </Link>
          よりご連絡ください。確認後、速やかに対応いたします。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>7. ポリシーの変更</h2>
        <p style={pStyle}>
          本ポリシーは予告なく改定することがあります。重要な変更がある場合はサービス内でお知らせします。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>8. お問い合わせ</h2>
        <p style={pStyle}>
          個人情報に関するお問い合わせは{' '}
          <Link href="/contact" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
            お問い合わせフォーム
          </Link>{' '}
          からお願いします。
        </p>
      </div>
    </main>
  );
}
