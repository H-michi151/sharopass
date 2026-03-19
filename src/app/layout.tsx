import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '社労士試験 模試アプリ',
  description: '社会保険労務士試験の模擬試験アプリ。選択式・択一式の練習ができます。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
