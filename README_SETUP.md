# セットアップガイド

## 前提条件

- Node.js 20.x 以上
- npm または pnpm
- Supabase アカウント（または PostgreSQL データベース）
- Twilio アカウント（WhatsApp Business API）
- Google Cloud プロジェクト（Calendar API）
- Stripe アカウント
- OpenAI API キー（または Google Gemini API キー）

## 1. プロジェクトのセットアップ

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集して必要な値を設定
```

## 2. データベースのセットアップ

### Supabase を使用する場合

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. SQL Editor で `database/schema.sql` を実行
3. `.env` に Supabase の URL とキーを設定

### 自前の PostgreSQL を使用する場合

```bash
# PostgreSQL に接続
psql -U postgres -d your_database

# スキーマを実行
\i database/schema.sql
```

## 3. Twilio WhatsApp Business API の設定

1. [Twilio Console](https://console.twilio.com) でアカウントを作成
2. WhatsApp Sandbox を有効化（または Business API を申請）
3. `.env` に Twilio の認証情報を設定
4. Webhook URL を設定: `https://your-domain.com/api/whatsapp/webhook`

## 4. Google Calendar API の設定

1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクトを作成
2. Calendar API を有効化
3. OAuth 2.0 認証情報を作成
4. リダイレクト URI を設定: `http://localhost:3000/api/calendar/callback`
5. `.env` に Google の認証情報を設定

## 5. Stripe の設定

1. [Stripe Dashboard](https://dashboard.stripe.com) でアカウントを作成
2. API キーを取得
3. Webhook を設定: `https://your-domain.com/api/payment/webhook`
4. `.env` に Stripe の認証情報を設定

## 6. OpenAI API の設定

1. [OpenAI Platform](https://platform.openai.com) で API キーを取得
2. `.env` に API キーを設定

または

1. [Google AI Studio](https://makersuite.google.com/app/apikey) で API キーを取得
2. `.env` に `GOOGLE_AI_API_KEY` を設定

## 7. アプリケーションの起動

```bash
# 開発モード
npm run dev

# 本番モード
npm start
```

サーバーは `http://localhost:3000` で起動します。

## 8. テスト

### WhatsApp でテスト

1. Twilio Sandbox の指示に従って WhatsApp にメッセージを送信
2. 登録フローが開始されることを確認

### エンドポイントのテスト

```bash
# Health check
curl http://localhost:3000/health

# マッチング検索（例）
curl -X POST http://localhost:3000/api/matching/find \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

## トラブルシューティング

### WhatsApp メッセージが届かない

- Twilio の Webhook URL が正しく設定されているか確認
- Twilio Sandbox の指示に従ってメッセージを送信しているか確認
- ログを確認: `console.log` でメッセージを受信しているか確認

### Google Calendar 連携が失敗する

- OAuth リダイレクト URI が正しく設定されているか確認
- スコープが正しく設定されているか確認
- トークンの有効期限を確認

### データベース接続エラー

- Supabase の URL とキーが正しいか確認
- データベースのスキーマが正しく作成されているか確認
- ネットワーク接続を確認

## 次のステップ

1. 本番環境へのデプロイ（Vercel、Railway、Heroku など）
2. ドメインの設定
3. SSL 証明書の設定
4. モニタリングとログの設定

