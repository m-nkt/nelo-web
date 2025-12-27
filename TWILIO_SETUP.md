# Twilio設定ガイド（Sandbox番号: +14155238886）

## 🎯 目的: WhatsAppでメッセージを送受信できるようにする

---

## 📝 手順（1つずつ）

### ステップ1: Twilioアカウント情報を取得

#### 1-1. Account SIDを取得

1. **Twilio Consoleにログイン**
   - https://console.twilio.com

2. **ダッシュボードの上部を確認**
   - 「Account SID」が表示されている
   - 例: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **コピーする**

#### 1-2. Auth Tokenを取得

1. **「Auth Token」の横の「表示」をクリック**
2. **表示されたトークンをコピー**
   - 例: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### ステップ2: .envファイルに設定

#### 2-1. .envファイルを開く

1. **テキストエディタで開く**
   - `/Users/masakinakata/LanguageMatching/.env`

#### 2-2. 値を設定

以下のように設定：

```env
# Twilio (WhatsApp Business API)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**重要**: 
- `TWILIO_ACCOUNT_SID`: コピーしたAccount SID
- `TWILIO_AUTH_TOKEN`: コピーしたAuth Token
- `TWILIO_WHATSAPP_NUMBER`: `whatsapp:+14155238886`（そのまま）

#### 2-3. 保存

ファイルを保存

---

### ステップ3: WhatsApp Sandboxに参加

#### 3-1. Sandboxの指示を確認

1. **Twilio Consoleで「Messaging」→「Try it out」→「Send a WhatsApp message」**

2. **Sandboxの指示を確認**
   - 例: `join <キーワード>` を送信するように指示される
   - キーワードをメモ

#### 3-2. WhatsAppでメッセージを送信

1. **WhatsAppを開く**

2. **新しいチャットを開始**
   - 送信先: `+14155238886`

3. **メッセージを送信**
   - 例: `join <キーワード>`（指示されたキーワード）

4. **確認メッセージが返ってくればOK**
   - 「You're all set!」などのメッセージが返ってくる

---

### ステップ4: Webhook URLを設定（重要！）

**ローカル環境でテストする場合、ngrokが必要です：**

#### 4-1. ngrokをインストール

1. **ngrokのサイトを開く**
   - https://ngrok.com

2. **ダウンロード**
   - Mac版をダウンロード

3. **インストール**
   - ダウンロードしたファイルを開く
   - アプリを「アプリケーション」フォルダにドラッグ

#### 4-2. ngrokを起動

1. **ターミナルを開く**（サーバーとは別のターミナル）

2. **ngrokを起動**
   ```bash
   ngrok http 3000
   ```

3. **Webhook URLをコピー**
   - ngrokが表示するURL（例: `https://xxxx.ngrok.io`）
   - Webhook URL: `https://xxxx.ngrok.io/api/whatsapp/webhook`

#### 4-3. TwilioでWebhook URLを設定

1. **Twilio Consoleで「Messaging」→「Settings」→「WhatsApp Sandbox Settings」**

2. **「When a message comes in」にWebhook URLを設定**
   - URL: `https://xxxx.ngrok.io/api/whatsapp/webhook`（ngrokのURL）

3. **「Save」をクリック**

---

### ステップ5: 動作確認

#### 5-1. サーバーを再起動

1. **サーバーを停止**（Ctrl+C）

2. **再度起動**
   ```bash
   npm run dev
   ```

3. **起動メッセージを確認**
   ```
   ✅ Twilio configured
   ```

#### 5-2. WhatsAppでテスト

1. **WhatsAppでSandbox番号にメッセージを送信**
   - 送信先: `+14155238886`
   - メッセージ: 「こんにちは」

2. **応答を確認**
   - 登録フローが開始されるはず
   - メッセージが返ってくればOK

---

## ✅ チェックリスト

- [ ] Account SIDを取得
- [ ] Auth Tokenを取得
- [ ] .envファイルに設定
- [ ] WhatsApp Sandboxに参加
- [ ] ngrokをインストール（ローカル環境の場合）
- [ ] Webhook URLを設定
- [ ] サーバーを再起動
- [ ] 「✅ Twilio configured」が表示される
- [ ] WhatsAppでメッセージを送信できる

---

## 🆘 よくある問題

### 問題1: Webhook URLが設定できない

**原因**: ngrokが起動していない

**解決方法**: ngrokを起動してから設定

### 問題2: メッセージが返ってこない

**原因**: Webhook URLが間違っている、またはサーバーが起動していない

**解決方法**: 
1. Webhook URLを確認
2. サーバーが起動しているか確認
3. ngrokが起動しているか確認

---

## 💡 まとめ

**やること:**
1. Account SIDとAuth Tokenを取得
2. .envファイルに設定（Sandbox番号も含む）
3. WhatsApp Sandboxに参加
4. ngrokをインストール・起動
5. Webhook URLを設定
6. 動作テスト

**これで、WhatsAppでメッセージを送受信できるようになります！**

---

**頑張ってください！応援しています！💪**

