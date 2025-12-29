# Nelo Website (nelo.so)

Neloは、世界中の人々とつながるためのプラットフォームです。「Text to Friend」で、あなたが本当に話したい人と出会えます。

## 技術スタック

- **Next.js 14** (App Router)
- **Tailwind CSS** (スタイリング)
- **Lucide React** (アイコン)
- **Playfair Display** (セリフフォント)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

## ビルド

本番用のビルドを作成するには：

```bash
npm run build
```

## デプロイ

### Vercel（推奨）

1. [Vercel](https://vercel.com)にログイン
2. GitHubリポジトリを接続、または`vercel`コマンドでデプロイ
3. ドメイン`nelo.so`を設定

```bash
npm i -g vercel
vercel
```

### その他のプラットフォーム

Next.jsは様々なプラットフォームでデプロイ可能です：
- Netlify
- AWS Amplify
- Cloudflare Pages

## 機能

- **Glassmorphismデザイン**: モダンで洗練されたUI
- **Tally連携**: ウェイトリストへの登録機能
- **トピック選択**: プリセットトピックから簡単に選択（既存テキストに追加）
- **レスポンシブデザイン**: あらゆるデバイスに対応

## Tally連携

- テキスト入力 + Enter: 入力内容を`intent`パラメータとしてTallyへ送信
- テキスト入力 + 矢印ボタン: 同様にTallyへ送信
- ヘッダーの"Join Waitlist"ボタン: `intent=General Interest`でTallyへ送信

Tally URL: `https://tally.so/r/jabRR6?intent={入力内容}`

## ライセンス

© 2024 Nelo. All rights reserved.
