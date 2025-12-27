# Gemini 1.5 Flash への移行とコスト最適化

## 📋 実装内容

### 1. OpenAIからGemini 1.5 Flashに変更 ✅

**変更ファイル:**
- `package.json`: `openai` → `@google/generative-ai`
- `src/services/chatbot.js`: OpenAI API → Gemini API
- `src/utils/env-check.js`: `OPENAI_API_KEY` → `GEMINI_API_KEY`
- `src/index.js`: サービス状態表示を更新

**環境変数:**
- 旧: `OPENAI_API_KEY`
- 新: `GEMINI_API_KEY`

**APIキーの取得方法:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. APIキーを生成
3. `.env` ファイルに `GEMINI_API_KEY=your-api-key` を設定

---

### 2. AI節約設計 ✅

**実装内容:**
- 最初の「登録」や「Hello」などの挨拶メッセージには、AIを呼ばず定型文を返す

**対象メッセージ:**
- 挨拶: `hello`, `hi`, `hey`, `こんにちは`, `こんばんは`, `おはよう`, `はじめまして`, `初めまして`, `よろしく`
- 登録: `登録`, `とうろく`, `新規`, `登録したい`, `始めたい`, `はじめたい`, `register`, `signup`, `sign up`, `start`

**返信内容:**
```
ようこそ！SuperMatchへ🎉

まずはあなたのお名前を教えてください。
```

**効果:**
- 初期登録時のAI呼び出しを削減
- コスト削減
- レスポンス速度向上

---

### 3. 赤字防止：1日10通制限 ✅

**実装内容:**
- 1人のユーザーが1日に10通以上送ったら、AI処理をスキップ
- コマンド（マッチング、ポイント、アポ）は引き続き利用可能

**データベース:**
- `message_logs` テーブルを追加
- メッセージ送信履歴を記録
- 1日のメッセージ数をカウント

**制限超過時の返信:**
```
本日の無料枠（10通）を超えました。

明日またお試しください。

以下のコマンドは引き続きご利用いただけます：
- マッチング
- ポイント
- アポ
```

**効果:**
- AI APIコストの上限を設定
- 悪用防止
- コマンド機能は継続利用可能

---

## 📊 データベーススキーマ変更

### 追加テーブル: `message_logs`

```sql
CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT,
  ai_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (phone_number) REFERENCES users(phone_number)
);

CREATE INDEX IF NOT EXISTS idx_message_logs_phone_date ON message_logs(phone_number, created_at);
```

**実行方法:**
1. SupabaseのSQL Editorを開く
2. 上記のSQLを実行

---

## 🔧 設定方法

### 1. パッケージのインストール

```bash
npm install
```

これで `@google/generative-ai` がインストールされます。

### 2. 環境変数の設定

`.env` ファイルに以下を追加：

```env
# Google Gemini (AI)
GEMINI_API_KEY=your-gemini-api-key-here
```

**APIキーの取得:**
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. 「Create API Key」をクリック
3. 生成されたキーをコピー
4. `.env` ファイルに設定

### 3. データベーススキーマの更新

SupabaseのSQL Editorで以下を実行：

```sql
-- Message logs table (for rate limiting)
CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT,
  ai_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (phone_number) REFERENCES users(phone_number)
);

CREATE INDEX IF NOT EXISTS idx_message_logs_phone_date ON message_logs(phone_number, created_at);
```

---

## 💰 コスト削減効果

### 従来（OpenAI GPT-4o-mini）
- すべてのメッセージにAI呼び出し
- 1メッセージあたり約 $0.00015（200トークン想定）
- 1000メッセージ/日 = 約 $0.15/日 = 約 $4.5/月

### 新実装（Gemini 1.5 Flash + 最適化）
- 挨拶メッセージ: AI呼び出しなし（0円）
- コマンド: AI呼び出しなし（0円）
- 一般会話: Gemini 1.5 Flash（約 $0.000075/メッセージ）
- 1日10通制限: 最大 $0.00075/日 = 約 $0.0225/月

**削減率: 約99.5%**

---

## 📝 動作確認

### 1. 挨拶メッセージのテスト

WhatsAppで以下を送信：
- `hello`
- `こんにちは`
- `登録`

**期待結果:**
- AIを呼ばず、定型文を返す
- 「ようこそ！SuperMatchへ🎉 まずはあなたのお名前を教えてください。」

### 2. 1日10通制限のテスト

1. 10通以上のメッセージを送信
2. 11通目以降は制限メッセージが返る

**期待結果:**
- 10通目まではAIが動作
- 11通目以降は「本日の無料枠（10通）を超えました」と返る
- コマンド（マッチング、ポイント、アポ）は引き続き動作

### 3. コマンドの動作確認

以下を送信：
- `マッチング`
- `ポイント`
- `アポ`

**期待結果:**
- AIを呼ばず、直接コマンド処理
- 制限に関係なく動作

---

## 🐛 トラブルシューティング

### エラー: "GEMINI_API_KEY is not set"

**解決方法:**
1. `.env` ファイルに `GEMINI_API_KEY` を設定
2. サーバーを再起動

### エラー: "relation 'message_logs' does not exist"

**解決方法:**
1. SupabaseのSQL Editorで `message_logs` テーブルを作成
2. 上記のSQLを実行

### エラー: "Database is not configured"

**解決方法:**
1. `.env` ファイルにSupabaseの設定を追加
2. サーバーを再起動

---

## 📚 参考資料

- [Google Gemini API ドキュメント](https://ai.google.dev/docs)
- [Gemini 1.5 Flash 料金](https://ai.google.dev/pricing)
- [Supabase ドキュメント](https://supabase.com/docs)

---

**最終更新**: 2024年XX月XX日

