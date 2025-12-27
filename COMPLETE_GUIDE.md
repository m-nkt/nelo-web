# 完全ガイド：明日リリースまで

## 🎯 目的: 明日リリースできるようにする

---

## 📋 全体の流れ（4ステップ）

1. **Supabase設定** → データベースを使えるようにする
2. **Twilio設定** → WhatsAppでメッセージを送受信できるようにする
3. **動作テスト** → 実際に動くか確認する
4. **デプロイ準備** → 本番環境に公開する準備

---

## ステップ1: Supabase設定（30分）

### 目的
ユーザー情報やアポイントメントを保存できるようにする

### 手順

#### 1-1. Project URLを取得（5分）

1. **Supabaseの画面で左サイドバーを確認**
2. **「General」をクリック**
3. **「Project URL」を探す**
   - 例: `https://xxxxx.supabase.co`
4. **コピーする** → これが `SUPABASE_URL`

#### 1-2. API Keysを取得（10分）

1. **左サイドバーで「API Keys」をクリック**（既に開いているはず）

2. **Publishable Keyをコピー**
   - 画像に表示されているキー（`sb_publishable_...`）
   - コピーボタン（📋）をクリック
   - → これが `SUPABASE_KEY`

3. **Secret Keyを取得**
   - **「Legacy anon, service_role API keys」タブをクリック**
   - `service_role` キーをコピー
   - → これが `SUPABASE_SERVICE_KEY`

#### 1-3. データベーススキーマを実行（10分）

1. **左サイドバーで「SQL Editor」をクリック**
2. **「New query」をクリック**
3. **`database/schema.sql` を開く**
   - `/Users/masakinakata/LanguageMatching/database/schema.sql`
   - 内容をすべてコピー
4. **SQL Editorに貼り付け**
5. **「Run」ボタンをクリック**
6. **「Success」と表示されればOK**

#### 1-4. .envファイルに設定（5分）

**重要: 1つずつ設定してください！**

##### 1-4-1. .envファイルを開く

1. **ターミナルで以下を実行：**
   ```bash
   cd /Users/masakinakata/LanguageMatching
   open -a TextEdit .env
   ```
   
   これで、TextEditで `.env` ファイルが開きます。

##### 1-4-2. Project URLを設定

1. **Supabaseの画面でProject URLをコピー**（ステップ1-1で取得したもの）
2. **.envファイルで以下の行を探す：**
   ```env
   SUPABASE_URL=
   ```
3. **`=` の後に貼り付け**（Command + V）
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   ```
4. **保存**（Command + S）

##### 1-4-3. Publishable Keyを設定

1. **Supabaseの画面でPublishable Keyをコピー**（ステップ1-2で取得したもの）
2. **.envファイルで以下の行を探す：**
   ```env
   SUPABASE_KEY=
   ```
3. **`=` の後に貼り付け**（Command + V）
   ```env
   SUPABASE_KEY=sb_publishable_...
   ```
4. **保存**（Command + S）

##### 1-4-4. Secret Keyを設定

1. **Supabaseの画面でservice_roleキーをコピー**（ステップ1-3で取得したもの）
2. **.envファイルで以下の行を探す：**
   ```env
   SUPABASE_SERVICE_KEY=
   ```
3. **`=` の後に貼り付け**（Command + V）
   ```env
   SUPABASE_SERVICE_KEY=service_role_...
   ```
4. **保存**（Command + S）

**詳細**: [ONE_BY_ONE.md](./ONE_BY_ONE.md) を参照

---

## ステップ2: Twilio設定（30分）

### 目的
WhatsAppでメッセージを送受信できるようにする

### 手順

#### 2-1. Twilioアカウント情報を取得（10分）

1. **Twilio Consoleにログイン**
   - https://console.twilio.com

2. **Account SIDをコピー**
   - ダッシュボードの上部に表示されている
   - 例: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Auth Tokenをコピー**
   - 「Auth Token」の横の「表示」をクリック
   - コピー

#### 2-2. .envファイルに設定（5分）

**重要: 1つずつ設定してください！**

##### 2-2-1. Account SIDを設定

1. **Twilio ConsoleでAccount SIDをコピー**（ステップ2-1で取得したもの）
2. **.envファイルで以下の行を探す：**
   ```env
   TWILIO_ACCOUNT_SID=
   ```
3. **`=` の後に貼り付け**（Command + V）
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **保存**（Command + S）

##### 2-2-2. Auth Tokenを設定

1. **Twilio ConsoleでAuth Tokenをコピー**（ステップ2-1で取得したもの）
2. **.envファイルで以下の行を探す：**
   ```env
   TWILIO_AUTH_TOKEN=
   ```
3. **`=` の後に貼り付け**（Command + V）
   ```env
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **保存**（Command + S）

##### 2-2-3. WhatsApp番号を設定

1. **.envファイルで以下の行を探す：**
   ```env
   TWILIO_WHATSAPP_NUMBER=
   ```
2. **`=` の後に以下を入力**（コピーではなく、直接入力）
   ```env
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```
3. **保存**（Command + S）

**詳細**: [ONE_BY_ONE.md](./ONE_BY_ONE.md) を参照

#### 2-3. WhatsApp Sandboxに参加（5分）

1. **Twilio Consoleで「Messaging」→「Try it out」→「Send a WhatsApp message」**

2. **Sandboxの指示を確認**
   - 例: `join <キーワード>` を送信するように指示される

3. **WhatsAppでSandbox番号にメッセージを送信**
   - 送信先: `+14155238886`
   - メッセージ: `join <キーワード>`（指示されたキーワード）

4. **確認メッセージが返ってくればOK**

#### 2-4. ngrokをインストール・起動（5分）

1. **ngrokのサイトを開く**
   - https://ngrok.com

2. **ダウンロード・インストール**
   - Mac版をダウンロード
   - アプリを「アプリケーション」フォルダにドラッグ

3. **ngrokを起動**
   - ターミナルを開く（サーバーとは別）
   - 以下を実行：
     ```bash
     ngrok http 3000
     ```

4. **Webhook URLをコピー**
   - ngrokが表示するURL（例: `https://xxxx.ngrok.io`）
   - Webhook URL: `https://xxxx.ngrok.io/api/whatsapp/webhook`

#### 2-5. Webhook URLを設定（5分）

1. **Twilio Consoleで「Messaging」→「Settings」→「WhatsApp Sandbox Settings」**

2. **「When a message comes in」にWebhook URLを設定**
   - URL: `https://xxxx.ngrok.io/api/whatsapp/webhook`（ngrokのURL）

3. **「Save」をクリック**

---

## ステップ3: 動作テスト（1時間）

### 目的
実際に動くか確認する

### 手順

#### 3-1. サーバーを再起動（2分）

1. **サーバーを停止**（Ctrl+C）

2. **再度起動**
   ```bash
   npm run dev
   ```

3. **起動メッセージを確認**
   ```
   ✅ Database configured
   ✅ Twilio configured
   ```

#### 3-2. WhatsAppでテスト（30分）

1. **WhatsAppでSandbox番号にメッセージを送信**
   - 送信先: `+14155238886`
   - メッセージ: 「こんにちは」

2. **応答を確認**
   - 登録フローが開始されるはず
   - 「こんにちは！言語マッチングサービスへようこそ...」というメッセージが返ってくればOK

3. **ユーザー登録フローのテスト**
   - 質問に答える
   - 登録が完了することを確認

#### 3-3. マッチング機能のテスト（30分）

1. **2人以上のユーザーで登録**
   - 別の電話番号で登録（またはテスト用に複数アカウント）

2. **マッチング機能をテスト**
   - 「マッチング」と送信
   - マッチング候補が表示されるか確認

---

## ステップ4: デプロイ準備（30分）

### 目的
実際にユーザーが使えるようにする

### 手順

#### 4-1. Vercelアカウントを作成（10分）

1. **Vercelのサイトを開く**
   - https://vercel.com

2. **アカウント作成**
   - GitHubアカウントでログイン

#### 4-2. プロジェクトをデプロイ（10分）

1. **「New Project」をクリック**

2. **GitHubリポジトリを選択**
   - `LanguageMatching` リポジトリを選択

3. **環境変数を設定**
   - すべての環境変数を設定（Supabase、Twilioなど）

4. **「Deploy」をクリック**

#### 4-3. Webhook URLを更新（10分）

1. **デプロイが完了したら、URLを確認**
   - 例: `https://supermatch.vercel.app`

2. **TwilioでWebhook URLを更新**
   - 新しいURL: `https://supermatch.vercel.app/api/whatsapp/webhook`

---

## ✅ チェックリスト

### Supabase設定
- [ ] Project URLを取得
- [ ] Publishable Keyを取得
- [ ] Secret Keyを取得（Legacy Keysタブから）
- [ ] データベーススキーマを実行
- [ ] .envファイルに設定
- [ ] サーバーを再起動して「✅ Database configured」が表示される

### Twilio設定
- [ ] Account SIDを取得
- [ ] Auth Tokenを取得
- [ ] .envファイルに設定（Sandbox番号も含む）
- [ ] WhatsApp Sandboxに参加
- [ ] ngrokをインストール
- [ ] ngrokを起動
- [ ] Webhook URLを設定
- [ ] サーバーを再起動して「✅ Twilio configured」が表示される

### 動作テスト
- [ ] サーバーが起動する
- [ ] WhatsAppでメッセージを送信できる
- [ ] ユーザー登録フローが動作する
- [ ] マッチング機能が動作する

### デプロイ準備
- [ ] Vercelアカウントを作成
- [ ] プロジェクトをデプロイ
- [ ] 環境変数を設定
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
2. API Keysを取得（Legacy Keysタブから）
3. データベーススキーマを実行
4. .envファイルに設定

### 2. Twilio設定（30分）

1. Account SIDとAuth Tokenを取得
2. .envファイルに設定（Sandbox番号: `whatsapp:+14155238886`）
3. WhatsApp Sandboxに参加
4. ngrokをインストール・起動
5. Webhook URLを設定

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

詳細は **[STEP_BY_STEP.md](./STEP_BY_STEP.md)** と **[TWILIO_SETUP.md](./TWILIO_SETUP.md)** を参照してください。

**頑張ってください！応援しています！💪**

