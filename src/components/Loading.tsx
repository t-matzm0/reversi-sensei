import React from 'react';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export function Loading({ message = '読み込み中...', size = 'medium' }: LoadingProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-b-2 border-blue-500`}
      />
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );
}
