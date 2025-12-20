# 超簡単スタートガイド（非エンジニア向け）

## 🎯 このガイドの目的

**「何をすればいいかわからない」** という方向けに、**最小限の手順**だけを説明します。

---

## ✅ やることリスト（順番に）

### 1. GitHubアカウントを作る（5分）

1. https://github.com を開く
2. 「Sign up」をクリック
3. 情報を入力してアカウント作成
4. メール認証を完了

**これで完了！**

---

### 2. GitHub Desktopをインストール（3分）

1. https://desktop.github.com を開く
2. 「Download for Mac」をクリック
3. ダウンロードしたファイルを開く
4. アプリを「アプリケーション」フォルダにドラッグ

**これで完了！**

---

### 3. コードをGitHubに保存する（5分）

1. **GitHub Desktopを起動**
   - アプリケーションから起動

2. **GitHubにログイン**
   - GitHubアカウントでログイン

3. **リポジトリを作成**
   - 「File」→「New Repository」
   - Name: `LanguageMatching`
   - Local Path: `/Users/masakinakata/LanguageMatching` を選択
   - 「Create Repository」をクリック

4. **GitHubに公開**
   - 「Publish repository」をクリック
   - リポジトリ名を確認
   - 「Publish repository」をクリック

**これで完了！コードがGitHubに保存されました！**

---

### 4. 環境変数を設定する（10分）

1. **`.env` ファイルを作成**
   - `/Users/masakinakata/LanguageMatching/` フォルダに
   - ファイル名: `.env`（先頭のドットが重要！）

2. **以下の内容をコピー＆ペースト**

```
# Server
PORT=3000
NODE_ENV=development

# Twilio (WhatsApp Business API)
TWILIO_ACCOUNT_SID=ここにTwilioのAccount SIDを入力
TWILIO_AUTH_TOKEN=ここにTwilioのAuth Tokenを入力
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# OpenAI
OPENAI_API_KEY=ここにOpenAIのAPIキーを入力

# Supabase
SUPABASE_URL=ここにSupabaseのURLを入力
SUPABASE_KEY=ここにSupabaseのキーを入力
SUPABASE_SERVICE_KEY=ここにSupabaseのService Keyを入力

# Google Calendar
GOOGLE_CLIENT_ID=ここにGoogleのClient IDを入力
GOOGLE_CLIENT_SECRET=ここにGoogleのClient Secretを入力
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=ここにStripeのSecret Keyを入力
STRIPE_PUBLISHABLE_KEY=ここにStripeのPublishable Keyを入力
STRIPE_WEBHOOK_SECRET=ここにStripeのWebhook Secretを入力

# App URLs
APP_BASE_URL=http://localhost:3000
```

3. **各サービスの認証情報を取得**
   - まだ取得していない場合は、後で設定してもOK
   - まずは空欄のままでも動作確認はできます

**これで完了！**

---

### 5. 依存関係をインストール（2分）

1. **ターミナルを開く**
   - Macの「ターミナル」アプリを開く

2. **プロジェクトフォルダに移動**
   - 以下のコマンドをコピー＆ペーストしてEnter:
   ```bash
   cd /Users/masakinakata/LanguageMatching
   ```

3. **依存関係をインストール**
   - 以下のコマンドをコピー＆ペーストしてEnter:
   ```bash
   npm install
   ```
   - 数分かかります（初回のみ）

**これで完了！**

---

### 6. データベースをセットアップ（10分）

#### オプションA: Supabaseを使う（簡単・推奨）

1. **Supabaseアカウントを作成**
   - https://supabase.com にアクセス
   - 「Start your project」をクリック
   - GitHubアカウントでログイン

2. **プロジェクトを作成**
   - 「New Project」をクリック
   - プロジェクト名を入力
   - データベースのパスワードを設定（メモしておく！）
   - 「Create new project」をクリック

3. **SQL Editorでスキーマを実行**
   - 左メニューから「SQL Editor」をクリック
   - 「New query」をクリック
   - `/Users/masakinakata/LanguageMatching/database/schema.sql` の内容をコピー
   - SQL Editorにペースト
   - 「Run」をクリック

4. **認証情報を取得**
   - 左メニューから「Settings」→「API」をクリック
   - `Project URL` をコピー → `.env` の `SUPABASE_URL` に貼り付け
   - `anon public` キーをコピー → `.env` の `SUPABASE_KEY` に貼り付け
   - `service_role` キーをコピー → `.env` の `SUPABASE_SERVICE_KEY` に貼り付け

**これで完了！**

---

### 7. サーバーを起動（1分）

1. **ターミナルで以下を実行**
   ```bash
   npm run dev
   ```

2. **成功メッセージが表示されればOK**
   ```
   🚀 Server running on port 3000
   📱 WhatsApp webhook: http://localhost:3000/api/whatsapp/webhook
   ```

**これで完了！サーバーが動いています！**

---

## 🎉 完了！

これで基本的なセットアップは完了です。

次は、各サービスの認証情報を取得して、`.env` ファイルに設定していきましょう。

---

## 📚 もっと詳しく知りたい方へ

- **詳細な説明**: [GUIDE_FOR_NON_ENGINEERS.md](./GUIDE_FOR_NON_ENGINEERS.md)
- **セットアップガイド**: [README_SETUP.md](./README_SETUP.md)

---

## 🆘 困ったときは

### エラーが出た場合

1. **エラーメッセージをコピー**
2. **Googleで検索**（多くの場合、解決方法が見つかります）
3. **それでも解決しない場合**: エラーメッセージを教えてください

### よくあるエラー

- **「command not found: npm」**
  - Node.jsがインストールされていません
  - https://nodejs.org からインストール

- **「EACCES: permission denied」**
  - 権限の問題です
  - `sudo` を使うか、フォルダの権限を確認

---

**頑張ってください！応援しています！💪**

