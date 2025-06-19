# 開発ガイド

## 環境別の起動方法

### Windows / Mac (ローカル環境)

```bash
npm install
npm run dev:local
```

ブラウザで http://localhost:3000 にアクセス

### Windows上のWSL

```bash
npm install
npm run dev:wsl
# または
npm run dev
```

以下のいずれかのURLでアクセス：

- http://localhost:3000
- http://[WSLのIP]:3000

WSLのIPアドレスを確認：

```bash
ip addr show eth0 | grep inet | awk '{print $2}' | cut -d/ -f1
```

### Docker環境

```bash
# 開発環境
docker-compose up app

# 本番環境
docker-compose up app-prod
```

- 開発環境: http://localhost:3000
- 本番環境: http://localhost:3001

### Firebase Hosting (ローカルエミュレータ)

```bash
npm install -g firebase-tools
firebase login
npm run serve:firebase
```

http://localhost:5000 でアクセス

## ビルドとデプロイ

### 通常のビルド

```bash
npm run build
npm start
```

### Firebase向けビルド

```bash
EXPORT_MODE=static npm run build:firebase
```

### Firebaseへのデプロイ

```bash
npm run deploy:firebase
```

## トラブルシューティング

### WSLでアクセスできない場合

1. Windows Defenderファイアウォールで3000番ポートを許可
2. `npm run dev` の代わりに `npm run dev:wsl` を使用
3. WSLのIPアドレスを使用してアクセス

### Dockerでビルドエラーが出る場合

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### node_modulesの問題

```bash
rm -rf node_modules package-lock.json
npm install
```
