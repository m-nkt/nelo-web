# ステップバイステップ完全ガイド

## 🎯 目的: 明日リリースできるようにする

---

## 📋 全体の流れ

1. **Supabase設定** → データベースを使えるようにする
2. **Twilio設定** → WhatsAppでメッセージを送受信できるようにする
3. **動作テスト** → 実際に動くか確認する
4. **デプロイ準備** → 本番環境に公開する準備

---

## ステップ1: Supabase設定（データベース）

### 目的
ユーザー情報やアポイントメントを保存できるようにする

### 手順

#### 1-1. Project URLを取得

1. **Supabaseの画面で左サイドバーを確認**
2. **「General」をクリック**
3. **「Project URL」を探す**
   - 例: `https://xxxxx.supabase.co`
4. **コピーする**

#### 1-2. API Keysを取得

1. **左サイドバーで「API Keys」をクリック**（既に開いているはず）

2. **Publishable Keyをコピー**
   - 画像に表示されているキー
   - コピーボタン（📋）をクリック

3. **Secret Keyを取得**
   - **方法1（簡単）**: 「Legacy anon, service_role API keys」タブをクリック
     - `service_role` キーをコピー
   - **方法2**: 「+ New secret key」ボタンをクリックして作成

#### 1-3. データベーススキーマを実行

1. **左サイドバーで「SQL Editor」をクリック**
2. **「New query」をクリック**
3. **`database/schema.sql` を開く**
   - `/Users/masakinakata/LanguageMatching/database/schema.sql`
4. **内容をすべてコピー**
5. **SQL Editorに貼り付け**
6. **「Run」ボタンをクリック**
7. **「Success」と表示されればOK**

#### 1-4. .envファイルに設定

1. **テキストエディタで `.env` ファイルを開く**
   - `/Users/masakinakata/LanguageMatching/.env`

2. **以下のように設定：**
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=sb_publishable_...（コピーしたキー）
   SUPABASE_SERVICE_KEY=service_role_...（コピーしたキー）
   ```

3. **保存**

---

## ステップ2: Twilio設定（WhatsApp）

### 目的
WhatsAppでメッセージを送受信できるようにする

### 手順

#### 2-1. Twilioアカウント情報を取得

1. **Twilio Consoleにログイン**
   - https://console.twilio.com

2. **Account SIDをコピー**
   - ダッシュボードの上部に表示されている
   - 例: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Auth Tokenをコピー**
   - 「Auth Token」の横の「表示」をクリック
   - コピー

#### 2-2. WhatsApp Sandboxに参加

1. **Twilio Consoleで「Messaging」→「Try it out」→「Send a WhatsApp message」**

2. **Sandboxの指示を確認**
   - 例: `join <キーワード>` を送信するように指示される

3. **WhatsAppでSandbox番号にメッセージを送信**
   - 送信先: `+14155238886`（あなたが確認した番号）
   - メッセージ: `join <キーワード>`（指示されたキーワード）

4. **確認メッセージが返ってくればOK**

#### 2-3. .envファイルに設定

1. **`.env` ファイルを開く**

2. **以下のように設定：**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

3. **保存**

#### 2-4. Webhook URLを設定（重要！）

**ローカル環境でテストする場合、ngrokが必要です：**

1. **ngrokをインストール**
   - https://ngrok.com からダウンロード
   - インストール

2. **ngrokを起動**
   ```bash
   ngrok http 3000
   ```

3. **Webhook URLをコピー**
   - ngrokが表示するURL（例: `https://xxxx.ngrok.io`）
   - Webhook URL: `https://xxxx.ngrok.io/api/whatsapp/webhook`

4. **TwilioでWebhook URLを設定**
   - Twilio Console → 「Messaging」→「Settings」→「WhatsApp Sandbox Settings」
   - 「When a message comes in」にWebhook URLを設定

---

## ステップ3: 動作テスト

### 目的
実際に動くか確認する

### 手順

#### 3-1. サーバーを起動

1. **ターミナルで以下を実行：**
   ```bash
   cd /Users/masakinakata/LanguageMatching
   npm run dev
   ```

2. **起動メッセージを確認**
   ```
   🚀 Server running on port 3000
   ✅ Database configured
   ✅ Twilio configured
   ```

#### 3-2. WhatsAppでテスト

1. **WhatsAppでSandbox番号にメッセージを送信**
   - 送信先: `+14155238886`
   - メッセージ: 「こんにちは」

2. **応答を確認**
   - 登録フローが開始されるはず
   - 「こんにちは！言語マッチングサービスへようこそ...」というメッセージが返ってくればOK

#### 3-3. ユーザー登録フローのテスト

1. **登録フローの質問に答える**
   - 学びたい言語
   - 教えられる言語
   - レベル
   - など

2. **登録が完了することを確認**

---

## ステップ4: デプロイ準備（本番環境）

### 目的
実際にユーザーが使えるようにする

### 手順

#### 4-1. デプロイ先を選ぶ

**推奨: Vercel**

1. **Vercelアカウントを作成**
   - https://vercel.com

2. **プロジェクトをインポート**
   - GitHubリポジトリを接続
   - 自動デプロイ設定

#### 4-2. 環境変数を設定

1. **Vercelのダッシュボードで「Settings」→「Environment Variables」**

2. **すべての環境変数を設定**
   - Supabase
   - Twilio
   - OpenAI（使用する場合）
   - Google Calendar（使用する場合）
   - Stripe（使用する場合）

#### 4-3. デプロイ

1. **「Deploy」ボタンをクリック**

2. **デプロイが完了するまで待つ**

3. **URLを確認**
   - 例: `https://supermatch.vercel.app`

#### 4-4. Webhook URLを更新

1. **TwilioでWebhook URLを更新**
   - 新しいURL: `https://supermatch.vercel.app/api/whatsapp/webhook`

---

## ✅ チェックリスト

### Supabase設定
- [ ] Project URLを取得
- [ ] Publishable Keyを取得
- [ ] Secret Keyを取得
- [ ] データベーススキーマを実行
- [ ] .envファイルに設定
- [ ] サーバーを再起動して「✅ Database configured」が表示される

### Twilio設定
- [ ] Account SIDを取得
- [ ] Auth Tokenを取得
- [ ] WhatsApp Sandboxに参加
- [ ] .envファイルに設定
- [ ] ngrokをインストール（ローカル環境の場合）
- [ ] Webhook URLを設定
- [ ] サーバーを再起動して「✅ Twilio configured」が表示される

### 動作テスト
- [ ] サーバーが起動する
- [ ] WhatsAppでメッセージを送信できる
- [ ] ユーザー登録フローが動作する

### デプロイ準備
- [ ] デプロイ先を選ぶ
- [ ] 環境変数を設定
- [ ] デプロイ
- [ ] Webhook URLを更新

---

## ⏰ 時間見積もり

- Supabase設定: 30分
- Twilio設定: 30分
- 動作テスト: 1時間
- デプロイ準備: 30分

**合計: 約2.5時間**

---

## 🎯 今すぐやること

### 1. Supabase設定（30分）

1. Project URLを取得
2. API Keysを取得
3. データベーススキーマを実行
4. .envファイルに設定

### 2. Twilio設定（30分）

1. Account SIDとAuth Tokenを取得
2. .envファイルに設定（Sandbox番号も設定）
3. ngrokをインストール
4. Webhook URLを設定

### 3. 動作テスト（1時間）

1. サーバーを再起動
2. WhatsAppでテスト

---

## 💡 まとめ

**今日やること:**
1. Supabase設定（30分）
2. Twilio設定（30分）
3. 動作テスト（1時間）

**これで、MVPとして動作します！**

**明日やること:**
1. デプロイ準備（30分）
2. リリース

---

**頑張ってください！応援しています！💪**

