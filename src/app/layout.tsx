import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import StagingAuth from '@/components/StagingAuth';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Reversi Sensei - Master the Game of Othello',
  description: 'Learn Othello strategies from beginner to advanced level with interactive tutorials and AI opponents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ErrorBoundary>
          <StagingAuth>
            {children}
          </StagingAuth>
        </ErrorBoundary>
      </body>
    </html>
  );
}