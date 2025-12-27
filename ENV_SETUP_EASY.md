# .envファイル設定ガイド（超わかりやすく）

## 🎯 目的: .envファイルに環境変数を1つずつ設定する

---

## 📍 .envファイルはどこ？

### 場所
```
/Users/masakinakata/LanguageMatching/.env
```

### 見つけ方

#### 方法1: Finderで探す

1. **Finderを開く**
2. **「移動」→「ホーム」をクリック**
3. **「LanguageMatching」フォルダを開く**
4. **`.env` ファイルを探す**
   - 見つからない場合は、作成する必要があります

#### 方法2: ターミナルで確認

1. **ターミナルを開く**
2. **以下を実行：**
   ```bash
   cd /Users/masakinakata/LanguageMatching
   ls -la .env
   ```
3. **ファイルが表示されれば存在します**

#### 方法3: テキストエディタで開く

1. **テキストエディタを開く**（メモ帳、TextEdit、VS Codeなど）
2. **「ファイルを開く」をクリック**
3. **以下のパスを入力：**
   ```
   /Users/masakinakata/LanguageMatching/.env
   ```

---

## 📝 .envファイルがない場合

### 作成方法

#### 方法1: ターミナルで作成

1. **ターミナルで以下を実行：**
   ```bash
   cd /Users/masakinakata/LanguageMatching
   touch .env
   ```

2. **テキストエディタで開く**

#### 方法2: テキストエディタで作成

1. **テキストエディタを開く**
2. **新規ファイルを作成**
3. **保存時に以下のパスを指定：**
   ```
   /Users/masakinakata/LanguageMatching/.env
   ```

---

## 🔧 設定手順（1つずつ）

### ステップ1: Supabase設定（1つずつ）

#### 1-1. Project URLを取得して設定

**どこから取得:**
1. Supabaseの画面で「General」をクリック
2. 「Project URL」を探す
3. コピー（例: `https://xxxxx.supabase.co`）

**どこに貼り付け:**
1. `.env` ファイルを開く
2. 以下の行を探す（または追加）：
   ```env
   SUPABASE_URL=
   ```
3. `=` の後に貼り付け：
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   ```
4. **保存**

#### 1-2. Publishable Keyを取得して設定

**どこから取得:**
1. Supabaseの画面で「API Keys」を開く（既に開いているはず）
2. 「Publishable key」セクションを確認
3. キーの横のコピーボタン（📋）をクリック
4. コピー（例: `sb_publishable_x8dyj6UXdlMn2qCjT5fQCA_kjA1q...`）

**どこに貼り付け:**
1. `.env` ファイルを開く
2. 以下の行を探す（または追加）：
   ```env
   SUPABASE_KEY=
   ```
3. `=` の後に貼り付け：
   ```env
   SUPABASE_KEY=sb_publishable_x8dyj6UXdlMn2qCjT5fQCA_kjA1q...
   ```
4. **保存**

#### 1-3. Secret Keyを取得して設定

**どこから取得:**
1. Supabaseの画面で「API Keys」を開く
2. **「Legacy anon, service_role API keys」タブをクリック**
3. `service_role` キーを探す
4. コピーボタン（📋）をクリック
5. コピー（例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`）

**どこに貼り付け:**
1. `.env` ファイルを開く
2. 以下の行を探す（または追加）：
   ```env
   SUPABASE_SERVICE_KEY=
   ```
3. `=` の後に貼り付け：
   ```env
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **保存**

---

### ステップ2: Twilio設定（1つずつ）

#### 2-1. Account SIDを取得して設定

**どこから取得:**
1. Twilio Consoleにログイン
   - https://console.twilio.com
2. ダッシュボードの上部を確認
3. 「Account SID」をコピー（例: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

**どこに貼り付け:**
1. `.env` ファイルを開く
2. 以下の行を探す（または追加）：
   ```env
   TWILIO_ACCOUNT_SID=
   ```
3. `=` の後に貼り付け：
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **保存**

#### 2-2. Auth Tokenを取得して設定

**どこから取得:**
1. Twilio Consoleのダッシュボードで「Auth Token」を探す
2. 「表示」をクリック
3. 表示されたトークンをコピー（例: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

**どこに貼り付け:**
1. `.env` ファイルを開く
2. 以下の行を探す（または追加）：
   ```env
   TWILIO_AUTH_TOKEN=
   ```
3. `=` の後に貼り付け：
   ```env
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **保存**

#### 2-3. WhatsApp番号を設定

**値:**
- `whatsapp:+14155238886`（そのまま）

**どこに貼り付け:**
1. `.env` ファイルを開く
2. 以下の行を探す（または追加）：
   ```env
   TWILIO_WHATSAPP_NUMBER=
   ```
3. `=` の後に貼り付け：
   ```env
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```
4. **保存**

---

## 📋 完成した.envファイルの例

```env
# Server
PORT=3000
NODE_ENV=development

# Twilio (WhatsApp Business API)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Google Gemini (AI)
GEMINI_API_KEY=

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=sb_publishable_x8dyj6UXdlMn2qCjT5fQCA_kjA1q...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/callback

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# App URLs
APP_BASE_URL=http://localhost:3000

# Admin
ADMIN_TOKEN=change-this-in-production
```

---

## ✅ チェックリスト（1つずつ確認）

### Supabase設定
- [ ] Project URLをコピー
- [ ] `.env` ファイルの `SUPABASE_URL=` の後に貼り付け
- [ ] 保存
- [ ] Publishable Keyをコピー
- [ ] `.env` ファイルの `SUPABASE_KEY=` の後に貼り付け
- [ ] 保存
- [ ] Legacy Keysタブを開く
- [ ] service_roleキーをコピー
- [ ] `.env` ファイルの `SUPABASE_SERVICE_KEY=` の後に貼り付け
- [ ] 保存

### Twilio設定
- [ ] Account SIDをコピー
- [ ] `.env` ファイルの `TWILIO_ACCOUNT_SID=` の後に貼り付け
- [ ] 保存
- [ ] Auth Tokenをコピー
- [ ] `.env` ファイルの `TWILIO_AUTH_TOKEN=` の後に貼り付け
- [ ] 保存
- [ ] `.env` ファイルの `TWILIO_WHATSAPP_NUMBER=` の後に `whatsapp:+14155238886` を入力
- [ ] 保存

---

## 💡 重要なポイント

1. **1つずつ設定する**
   - 1つコピー → 貼り付け → 保存
   - 次の1つをコピー → 貼り付け → 保存

2. **毎回保存する**
   - 設定したら必ず保存

3. **間違えても大丈夫**
   - 後で修正できます

---

## 🆘 わからない場合

### .envファイルが見つからない

1. **ターミナルで以下を実行：**
   ```bash
   cd /Users/masakinakata/LanguageMatching
   touch .env
   ```

2. **テキストエディタで開く**

### どこに貼り付けるかわからない

- `.env` ファイルを開く
- `=` の後（右側）に貼り付ける
- 例: `SUPABASE_URL=` の `=` の後に貼り付け

---

**1つずつ、ゆっくり設定してください！焦らなくて大丈夫です！💪**

