// /exam/[type] の静的エクスポート用 generateStaticParams
// 'use client'のpage.tsxとは別ファイルで定義することで静的ビルドに対応
export function generateStaticParams() {
  return [{ type: 'sentaku' }, { type: 'takuitsu' }];
}

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
