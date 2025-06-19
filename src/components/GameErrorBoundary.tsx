'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

export function GameErrorBoundary({ children, onReset }: Props) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-center w-16 h-16 mb-4 bg-yellow-100 rounded-full">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ゲームでエラーが発生しました
          </h3>
          <p className="text-gray-600 text-center mb-4">
            ゲームの状態に問題が発生しました。新しいゲームを開始してください。
          </p>
          <button
            onClick={() => {
              if (onReset) {
                onReset();
              } else {
                window.location.reload();
              }
            }}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            新しいゲームを開始
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}