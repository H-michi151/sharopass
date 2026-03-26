import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '../components/AuthProvider';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: '社労士試験 模試アプリ | SHAROPASS',
  description: '社会保険労務士試験の模擬試験アプリ。選択式・択一式の練習ができます。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
