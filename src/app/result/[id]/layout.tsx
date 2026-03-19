// /result/[id] の静的エクスポート用 generateStaticParams
// ResultPageはZustandストアのみ参照するためダミーIDでOK
export function generateStaticParams() {
  return [{ id: 'current' }];
}

export default function ResultLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
