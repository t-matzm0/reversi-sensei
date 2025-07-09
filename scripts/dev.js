#!/usr/bin/env node

const { spawn } = require('child_process');
const os = require('os');

// 環境を検出
function detectEnvironment() {
  const platform = os.platform();
  const isWSL = process.env.WSL_DISTRO_NAME || 
    (platform === 'linux' && os.release().toLowerCase().includes('microsoft'));
  
  return {
    platform,
    isWSL,
    isWindows: platform === 'win32',
    isMac: platform === 'darwin',
    isLinux: platform === 'linux'
  };
}

// 開発サーバーを起動
function startDevServer() {
  const env = detectEnvironment();
  let command = 'next';
  let args = ['dev'];

  console.log('Environment detected:', {
    platform: env.platform,
    isWSL: env.isWSL,
    isWindows: env.isWindows,
    isMac: env.isMac,
    isLinux: env.isLinux
  });

  // WSL環境の場合は0.0.0.0でバインド
  if (env.isWSL) {
    args.push('-H', '0.0.0.0');
    console.log('WSL detected: binding to 0.0.0.0');
    console.log('Access the app at:');
    console.log('  - From WSL: http://localhost:3000');
    console.log('  - From Windows: http://localhost:3000');
  } else if (env.isWindows) {
    // Windows環境はデフォルト設定
    console.log('Windows detected: using default settings');
    console.log('Access the app at: http://localhost:3000');
  } else {
    // Mac/Linux環境もデフォルト設定
    console.log(`${env.platform} detected: using default settings`);
    console.log('Access the app at: http://localhost:3000');
  }

  // Next.js開発サーバーを起動
  const child = spawn(command, args, {
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (error) => {
    console.error('Failed to start dev server:', error);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code);
  });
}

// メイン処理
startDevServer();