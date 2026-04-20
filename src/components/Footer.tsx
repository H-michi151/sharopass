import Link from 'next/link';

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        marginTop: '64px',
        padding: '24px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href="/privacy"
            style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}
          >
            プライバシーポリシー
          </Link>
          <Link
            href="/terms"
            style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}
          >
            利用規約
          </Link>
          <Link
            href="/contact"
            style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}
          >
            お問い合わせ
          </Link>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          © 2025 SHAROPASS - MIC（管理者）
        </p>
      </div>
    </footer>
  );
}
