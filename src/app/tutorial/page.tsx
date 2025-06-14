import Link from 'next/link'
import Tutorial from '@/components/Tutorial'

export const metadata = {
  title: 'チュートリアル | オセロ先生',
  description: 'オセロの基本ルールと戦略を学びましょう',
}

export default function TutorialPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ゲームに戻る
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">オセロ戦略チュートリアル</h1>
        <Tutorial />
      </div>
    </main>
  )
}