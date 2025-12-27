# .envファイルの場所と開き方

## 📍 .envファイルはどこ？

### 場所
```
/Users/masakinakata/LanguageMatching/.env
```

---

## 🔍 見つけ方（3つの方法）

### 方法1: Finderで探す（Mac）

1. **Finderを開く**
   - MacのDockからFinderアイコンをクリック

2. **「移動」メニューをクリック**
   - 画面上部のメニューバーから「移動」をクリック

3. **「ホーム」をクリック**
   - または、ショートカット: `Command + Shift + H`

4. **「LanguageMatching」フォルダを探す**
   - フォルダを開く

5. **`.env` ファイルを探す**
   - ファイル名が `.env` のファイル
   - **注意**: `.` で始まるファイルは隠しファイルなので、見えない場合があります

6. **見つからない場合**
   - 作成する必要があります（下記参照）

---

### 方法2: ターミナルで開く（超簡単！ワンタップ）

1. **ターミナルを開く**

2. **以下をコピー＆ペーストして実行：**
   ```bash
   cd /Users/masakinakata/LanguageMatching && open -a TextEdit .env
   ```
   
   **これだけで、TextEditで `.env` ファイルが開きます！**

3. **ファイルが存在しない場合**
   - 自動的に作成されます
   - テンプレートが入っています

---

### 方法3: VS Codeで開く（エディタを使っている場合）

1. **VS Codeを開く**

2. **「ファイル」→「ファイルを開く」をクリック**

3. **以下のパスを入力：**
   ```
   /Users/masakinakata/LanguageMatching/.env
   ```

4. **Enterキーを押す**

---

## 📝 .envファイルがない場合

### 作成方法

#### 方法1: ターミナルで作成（簡単）

1. **ターミナルで以下を実行：**
   ```bash
   cd /Users/masakinakata/LanguageMatching
   touch .env
   ```

2. **テキストエディタで開く：**
   ```bash
   open -a TextEdit .env
   ```

#### 方法2: テキストエディタで作成

1. **TextEditを開く**
   - アプリケーションから開く

2. **新規ファイルを作成**

3. **保存**
   - 「ファイル」→「保存」
   - 保存場所: `/Users/masakinakata/LanguageMatching/`
   - ファイル名: `.env`
   - **重要**: ファイル名は `.env` です（拡張子なし）

---

## ✏️ .envファイルの編集方法

### 基本的な使い方

1. **ファイルを開く**
   - 上記の方法で開く

2. **内容を確認**
   - 既にいくつかの設定があるかもしれません

3. **値を設定**
   - `=` の後（右側）に値を入力
   - 例: `SUPABASE_URL=https://xxxxx.supabase.co`

4. **保存**
   - 「ファイル」→「保存」
   - または、`Command + S`

---

## 📋 .envファイルの内容（テンプレート）

以下の内容をコピーして、`.env` ファイルに貼り付けることもできます：

```env
# Server
PORT=3000
NODE_ENV=development

# Twilio (WhatsApp Business API)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Google Gemini (AI)
GEMINI_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_KEY=

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

**空欄の部分（`=` の後）に、取得した値を1つずつ貼り付けていきます。**

---

## 💡 わかりやすい手順

### ステップ1: ファイルを開く

ターミナルで：
```bash
cd /Users/masakinakata/LanguageMatching
open -a TextEdit .env
```

### ステップ2: 1つずつ設定

1. **Supabaseの画面で値をコピー**
2. **.envファイルの該当する行の `=` の後に貼り付け**
3. **保存**
4. **次の値を設定**

### ステップ3: 保存

設定したら必ず保存（`Command + S`）

---

## 🆘 困ったときは

### ファイルが見つからない

ターミナルで以下を実行：
```bash
cd /Users/masakinakata/LanguageMatching
ls -la | grep .env
```

表示されれば存在します。

### ファイルが開けない

ターミナルで以下を実行：
```bash
cd /Users/masakinakata/LanguageMatching
open -a TextEdit .env
```

---

**まずは、.envファイルを開いてみてください！**

