'use client';

import React, { useState, useEffect } from 'react';

interface StagingAuthProps {
  children: React.ReactNode;
}

export default function StagingAuth({ children }: StagingAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already authenticated in this session
    const auth = sessionStorage.getItem('staging-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check - in production, this should be more secure
    const correctPassword = process.env.NEXT_PUBLIC_STAGING_PASSWORD || 'staging2024';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('staging-auth', 'true');
      setError('');
    } else {
      setError('パスワードが間違っています');
    }
  };

  // Only show auth on staging environment
  const isStaging = process.env.NODE_ENV === 'production' && 
                   process.env.NEXT_PUBLIC_ENV === 'staging';

  if (!isStaging || isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">検証環境</h1>
          <p className="text-gray-600">パスワードを入力してください</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="パスワードを入力"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            ログイン
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          これは検証環境です。本番環境ではありません。
        </div>
      </div>
    </div>
  );
}