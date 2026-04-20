import Link from 'next/link';

const sectionStyle: React.CSSProperties = { marginBottom: '32px' };
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
  title: '利用規約 | SHAROPASS',
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 20px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px' }}>
        利用規約
      </h1>
      <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '40px' }}>
        最終更新日：2025年4月20日
      </p>

      <p style={{ ...pStyle, marginBottom: '32px' }}>
        本利用規約（以下「本規約」）は、MIC（管理者）が提供する「SHAROPASS」（以下「本サービス」）の
        利用条件を定めるものです。ユーザーは本規約に同意の上、本サービスをご利用ください。
      </p>

      <div style={sectionStyle}>
        <h2 style={h2Style}>第1条（サービス内容）</h2>
        <p style={pStyle}>
          本サービスは、社会保険労務士試験の模擬試験・練習問題を提供する学習支援サービスです。
          収録問題はすべて参考・学習目的のために作成されたものであり、実際の試験問題とは異なります。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>第2条（アカウント登録）</h2>
        <p style={pStyle}>
          本サービスの一部機能はアカウント登録が必要です。
          登録にあたっては正確な情報を提供してください。
          アカウントの管理はユーザー自身の責任において行うものとします。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>第3条（禁止事項）</h2>
        <p style={pStyle}>ユーザーは以下の行為を行ってはなりません。</p>
        <ul style={{ ...pStyle, paddingLeft: '20px', marginTop: '8px' }}>
          <li>本サービスのコンテンツの無断転載・複製・商業利用</li>
          <li>サービスへの不正アクセスまたはシステムへの攻撃</li>
          <li>他のユーザーの利用を妨害する行為</li>
          <li>虚偽の情報を登録する行為</li>
          <li>その他、運営者が不適切と判断する行為</li>
        </ul>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>第4条（免責事項）</h2>
        <p style={pStyle}>
          本サービスが提供する模擬試験・問題の正確性について最大限の努力をしていますが、
          内容の正確性・完全性を保証するものではありません。
          本サービスの利用によって生じた損害について、運営者は一切の責任を負いません。
          本サービスは実際の試験合格を保証するものではありません。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>第5条（サービスの変更・停止）</h2>
        <p style={pStyle}>
          運営者は、ユーザーへの事前通知なく、本サービスの内容を変更・停止・終了することができます。
          これによってユーザーに生じた損害について、運営者は責任を負いません。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>第6条（退会・アカウント削除）</h2>
        <p style={pStyle}>
          退会・アカウント削除をご希望の場合は、
          <Link href="/contact" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
            お問い合わせフォーム
          </Link>
          よりお申し出ください。確認後、速やかに対応いたします。
          削除後はデータの復元ができませんのでご注意ください。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>第7条（プライバシーポリシー）</h2>
        <p style={pStyle}>
          個人情報の取り扱いについては、
          <Link href="/privacy" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
            プライバシーポリシー
          </Link>
          をご確認ください。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>第8条（規約の変更）</h2>
        <p style={pStyle}>
          本規約は予告なく改定することがあります。改定後も本サービスを継続利用した場合、
          改定後の規約に同意したものとみなします。
        </p>
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>第9条（準拠法・管轄）</h2>
        <p style={pStyle}>
          本規約の解釈には日本法を準拠法とし、紛争が生じた場合は運営者所在地を管轄する
          裁判所を専属的合意管轄裁判所とします。
        </p>
      </div>
    </main>
  );
}
