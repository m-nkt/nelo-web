# 動作確認ガイド（非エンジニア向け）

## 🎯 このガイドの目的

実際にサービスが動いているか確認する方法を、わかりやすく説明します。

---

## 📋 確認する前に必要なもの

### 1. セットアップ済みか確認

以下のものがセットアップされている必要があります：

- [ ] Node.jsがインストールされている
- [ ] 依存関係がインストールされている（`npm install`済み）
- [ ] `.env`ファイルが作成されている
- [ ] データベース（Supabase）がセットアップされている
- [ ] Twilioアカウントが作成されている

### 2. まだセットアップしていない場合

まず [QUICK_START.md](./QUICK_START.md) を参照して、セットアップを完了してください。

---

## 🧪 確認方法（3つのレベル）

### レベル1: サーバーが起動するか確認（最も簡単）

#### 手順

1. **ターミナルを開く**
   - Macの「ターミナル」アプリを開く

2. **プロジェクトフォルダに移動**
   ```bash
   cd /Users/masakinakata/LanguageMatching
   ```

3. **サーバーを起動**
   ```bash
   npm run dev
   ```

4. **成功メッセージを確認**
   ```
   🚀 Server running on port 3000
   📱 WhatsApp webhook: http://localhost:3000/api/whatsapp/webhook
   ⏰ Initializing scheduler...
   ✅ Scheduler initialized
   ```
   
   このメッセージが表示されれば、**サーバーは正常に起動しています！**

5. **ブラウザで確認**
   - ブラウザで `http://localhost:3000/health` を開く
   - `{"status":"ok","timestamp":"..."}` が表示されればOK

**これでレベル1は完了！**

---

### レベル2: WhatsAppでメッセージを送れるか確認

#### 前提条件

- Twilioアカウントが作成されている
- Twilio WhatsApp Sandboxが設定されている
- `.env`ファイルにTwilioの認証情報が設定されている

#### 手順

1. **Twilio Sandboxに参加**
   - TwilioのSandbox指示に従って、指定のキーワードをWhatsAppに送信
   - 例: `join <キーワード>` を送信

2. **サーバーを起動**
   ```bash
   npm run dev
   ```

3. **テストメッセージを送信**
   - WhatsAppでTwilio Sandbox番号にメッセージを送る
   - 例: 「こんにちは」と送信

4. **応答を確認**
   - 登録フローが開始されるはずです
   - 「こんにちは！言語マッチングサービスへようこそ...」というメッセージが返ってくればOK

**これでレベル2は完了！**

---

### レベル3: すべての機能を確認（完全版）

#### 確認項目

1. **ユーザー登録**
   - WhatsAppで「こんにちは」と送信
   - 登録フローが開始される
   - すべての質問に答える
   - 登録が完了する

2. **Googleカレンダー連携**
   - 登録完了後、送られてくるリンクをクリック
   - Googleアカウントでログイン
   - カレンダー連携が完了する

3. **マッチング検索**
   - WhatsAppで「マッチング」と送信
   - マッチング候補が表示される（ユーザーが2人以上いる場合）

4. **ポイント確認**
   - WhatsAppで「ポイント」と送信
   - ポイント残高が表示される

5. **アポイントメント確認**
   - WhatsAppで「アポ」と送信
   - 予定されているアポイントメントが表示される

---

## 🔍 トラブルシューティング

### 問題1: サーバーが起動しない

**エラーメッセージ**: `Error: Cannot find module '...'`

**解決方法**:
```bash
npm install
```

### 問題2: WhatsAppメッセージが届かない

**確認事項**:
1. Twilio Sandboxに参加しているか
2. `.env`ファイルにTwilioの認証情報が正しく設定されているか
3. サーバーが起動しているか
4. Webhook URLが正しく設定されているか

**解決方法**:
- Twilio ConsoleでWebhook URLを確認
- `http://localhost:3000/api/whatsapp/webhook` が設定されているか確認
- **注意**: ローカル環境では、ngrokなどのツールが必要です

### 問題3: データベースエラー

**エラーメッセージ**: `Error: relation "users" does not exist`

**解決方法**:
1. SupabaseでSQL Editorを開く
2. `database/schema.sql` の内容を実行

### 問題4: 環境変数エラー

**エラーメッセージ**: `Error: TWILIO_ACCOUNT_SID is not defined`

**解決方法**:
1. `.env`ファイルが存在するか確認
2. `.env`ファイルに必要な認証情報がすべて設定されているか確認

---

## 📱 WhatsAppで確認する方法（詳細）

### ステップ1: Twilio Sandboxの設定

1. **Twilio Consoleにログイン**
   - https://console.twilio.com にアクセス

2. **WhatsApp Sandboxを有効化**
   - 「Messaging」→「Try it out」→「Send a WhatsApp message」
   - Sandbox番号を確認

3. **Sandboxに参加**
   - WhatsAppでSandbox番号に `join <キーワード>` を送信
   - キーワードはTwilio Consoleに表示されます

### ステップ2: Webhook URLの設定

**重要**: ローカル環境でテストする場合、ngrokなどのツールが必要です。

#### ngrokを使う方法（推奨）

1. **ngrokをインストール**
   - https://ngrok.com からダウンロード
   - インストール

2. **ngrokを起動**
   ```bash
   ngrok http 3000
   ```

3. **Webhook URLを取得**
   - ngrokが表示するURL（例: `https://xxxx.ngrok.io`）をコピー
   - Webhook URL: `https://xxxx.ngrok.io/api/whatsapp/webhook`

4. **TwilioでWebhook URLを設定**
   - Twilio Console → 「Messaging」→「Settings」→「WhatsApp Sandbox Settings」
   - 「When a message comes in」にWebhook URLを設定

### ステップ3: テスト

1. **サーバーを起動**
   ```bash
   npm run dev
   ```

2. **WhatsAppでメッセージを送信**
   - Twilio Sandbox番号に「こんにちは」と送信

3. **応答を確認**
   - 登録フローが開始されるはずです

---

## ✅ 確認チェックリスト

### 基本確認

- [ ] サーバーが起動する
- [ ] `/health` エンドポイントが動作する
- [ ] エラーログが出ていない

### WhatsApp確認

- [ ] Twilio Sandboxに参加している
- [ ] Webhook URLが設定されている
- [ ] メッセージを送信できる
- [ ] 応答が返ってくる

### 機能確認

- [ ] ユーザー登録ができる
- [ ] Googleカレンダー連携ができる
- [ ] マッチング検索ができる
- [ ] ポイント確認ができる
- [ ] アポイントメント確認ができる

---

## 💡 簡単な確認方法（最初に試す）

**最も簡単な確認方法**:

1. ターミナルで `npm run dev` を実行
2. エラーが出なければOK
3. ブラウザで `http://localhost:3000/health` を開く
4. `{"status":"ok"}` が表示されればOK

**これだけでも、基本的な動作は確認できます！**

---

## 🆘 困ったときは

1. **エラーメッセージをコピー**
2. **Googleで検索**（多くの場合、解決方法が見つかります）
3. **それでも解決しない場合**: エラーメッセージを教えてください

---

## 📞 次のステップ

確認が完了したら：

1. **実際にユーザー登録をテスト**
2. **マッチング機能をテスト**
3. **本番環境へのデプロイを検討**

頑張ってください！💪

