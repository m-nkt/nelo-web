# 1つずつ設定する手順（超わかりやすく）

## 🎯 目的: 1つずつコピー→貼り付け→保存を繰り返す

---

## 📝 基本の流れ

1. **値をコピー**（SupabaseやTwilioの画面から）
2. **.envファイルを開く**
3. **該当する行の `=` の後に貼り付け**
4. **保存**
5. **次の値を設定**（1に戻る）

---

## ステップ1: Supabase設定（3つの値を1つずつ）

### 1-1. Project URLを設定

#### どこから取得
1. **Supabaseの画面を開く**
2. **左サイドバーで「General」をクリック**
3. **「Project URL」を探す**
   - 例: `https://xxxxx.supabase.co`
4. **コピー**（Command + C）

#### どこに貼り付け
1. **.envファイルを開く**
   - ターミナルで: `open -a TextEdit /Users/masakinakata/LanguageMatching/.env`
2. **以下の行を探す：**
   ```env
   SUPABASE_URL=
   ```
3. **`=` の後に貼り付け**（Command + V）
   ```env
   SUPABASE_URL=https://xxxxx.supabase.co
   ```
4. **保存**（Command + S）

**これで1つ目完了！**

---

### 1-2. Publishable Keyを設定

#### どこから取得
1. **Supabaseの画面で「API Keys」を開く**（既に開いているはず）
2. **「Publishable key」セクションを確認**
3. **キーの横のコピーボタン（📋）をクリック**
   - 例: `sb_publishable_x8dyj6UXdlMn2qCjT5fQCA_kjA1q...`
4. **コピー**（Command + C）

#### どこに貼り付け
1. **.envファイルを開く**（まだ開いていればそのまま）
2. **以下の行を探す：**
   ```env
   SUPABASE_KEY=
   ```
3. **`=` の後に貼り付け**（Command + V）
   ```env
   SUPABASE_KEY=sb_publishable_x8dyj6UXdlMn2qCjT5fQCA_kjA1q...
   ```
4. **保存**（Command + S）

**これで2つ目完了！**

---

### 1-3. Secret Keyを設定

#### どこから取得
1. **Supabaseの画面で「API Keys」を開く**
2. **「Legacy anon, service_role API keys」タブをクリック**
3. **`service_role` キーを探す**
4. **コピーボタン（📋）をクリック**
   - 例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. **コピー**（Command + C）

#### どこに貼り付け
1. **.envファイルを開く**（まだ開いていればそのまま）
2. **以下の行を探す：**
   ```env
   SUPABASE_SERVICE_KEY=
   ```
3. **`=` の後に貼り付け**（Command + V）
   ```env
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **保存**（Command + S）

**これで3つ目完了！Supabase設定完了！**

---

## ステップ2: Twilio設定（3つの値を1つずつ）

### 2-1. Account SIDを設定

#### どこから取得
1. **Twilio Consoleにログイン**
   - https://console.twilio.com
2. **ダッシュボードの上部を確認**
3. **「Account SID」を探す**
   - 例: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. **コピー**（Command + C）

#### どこに貼り付け
1. **.envファイルを開く**
2. **以下の行を探す：**
   ```env
   TWILIO_ACCOUNT_SID=
   ```
3. **`=` の後に貼り付け**（Command + V）
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **保存**（Command + S）

**これで1つ目完了！**

---

### 2-2. Auth Tokenを設定

#### どこから取得
1. **Twilio Consoleのダッシュボードで「Auth Token」を探す**
2. **「表示」をクリック**
3. **表示されたトークンをコピー**
   - 例: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. **コピー**（Command + C）

#### どこに貼り付け
1. **.envファイルを開く**
2. **以下の行を探す：**
   ```env
   TWILIO_AUTH_TOKEN=
   ```
3. **`=` の後に貼り付け**（Command + V）
   ```env
   TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. **保存**（Command + S）

**これで2つ目完了！**

---

### 2-3. WhatsApp番号を設定

#### 値
- `whatsapp:+14155238886`（そのまま入力）

#### どこに貼り付け
1. **.envファイルを開く**
2. **以下の行を探す：**
   ```env
   TWILIO_WHATSAPP_NUMBER=
   ```
3. **`=` の後に入力**（コピーではなく、直接入力）
   ```env
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```
4. **保存**（Command + S）

**これで3つ目完了！Twilio設定完了！**

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
   - 設定したら必ず保存（Command + S）

3. **間違えても大丈夫**
   - 後で修正できます

---

## 🆘 わからない場合

### .envファイルを開く方法（ワンタップ）

ターミナルで以下をコピー＆ペーストして実行：
```bash
cd /Users/masakinakata/LanguageMatching && open -a TextEdit .env
```

**これだけで、TextEditで `.env` ファイルが開きます！**

詳細は [OPEN_ENV.md](./OPEN_ENV.md) を参照してください。

---

**1つずつ、ゆっくり設定してください！焦らなくて大丈夫です！💪**

