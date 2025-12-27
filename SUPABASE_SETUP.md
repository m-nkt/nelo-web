# Supabase設定ガイド（画像を見ながら）

## 🎯 プロジェクト名: SuperMatch

---

## 📸 画像から必要な情報を取得

### ステップ1: Project URLを取得

1. **左サイドバーで「General」をクリック**
2. **「Project URL」を探す**
   - 例: `https://xxxxx.supabase.co`
3. **これをコピー** → これが `SUPABASE_URL` です

---

### ステップ2: API Keysを取得

画像を見ると、API Keys画面が開いています。

#### 2-1. Publishable Key（表示されている）

画像に表示されているキー：
```
sb_publishable_x8dyj6UXdlMn2qCjT5fQCA_kjA1q...
```

**これを使います！**

1. **コピーボタン（📋アイコン）をクリック**
2. **コピーしたキー** → これが `SUPABASE_KEY` です

#### 2-2. Secret Key（表示されていない）

画像を見ると、「Secret keys」セクションにキーが表示されていません。

**2つの選択肢があります：**

##### 選択肢A: Legacy Keysを使う（簡単）

1. **タブを切り替える**
   - 「Legacy anon, service_role API keys」タブをクリック

2. **2つのキーをコピー**
   - `anon public` キー → これが `SUPABASE_KEY`
   - `service_role` キー → これが `SUPABASE_SERVICE_KEY`

##### 選択肢B: 新しいSecret Keyを作成

1. **「+ New secret key」ボタンをクリック**
2. **名前を入力**（例: `default`）
3. **作成されたキーをコピー** → これが `SUPABASE_SERVICE_KEY`

**推奨: 選択肢A（Legacy Keys）が簡単です！**

---

## 📝 .envファイルに設定

### ステップ1: .envファイルを開く

1. **テキストエディタで開く**
   - `/Users/masakinakata/LanguageMatching/.env` を開く

### ステップ2: 値を設定

以下の3つの値を設定します：

```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=sb_publishable_...（または anon public キー）
SUPABASE_SERVICE_KEY=service_role_...（または 新しい secret key）
```

#### 具体的な手順

1. **Project URLを取得**
   - Settings → General → Project URL
   - コピーして `.env` の `SUPABASE_URL=` の後に貼り付け

2. **Publishable Keyを取得**
   - Settings → API Keys → Publishable key
   - コピーボタンをクリック
   - `.env` の `SUPABASE_KEY=` の後に貼り付け

3. **Secret Keyを取得**
   - **方法1（簡単）**: Legacy Keysタブ → `service_role` キーをコピー
   - **方法2**: New secret key を作成 → コピー
   - `.env` の `SUPABASE_SERVICE_KEY=` の後に貼り付け

---

## ✅ 確認方法

### ステップ1: .envファイルを保存

### ステップ2: サーバーを再起動

```bash
# サーバーを停止（Ctrl+C）
# 再度起動
npm run dev
```

### ステップ3: 起動メッセージを確認

以下のように表示されれば成功：

```
✅ Database configured
```

警告が出ていれば、設定が完了していません。

---

## 🎯 まとめ

**必要な3つの値：**

1. **SUPABASE_URL**
   - Settings → General → Project URL

2. **SUPABASE_KEY**
   - Settings → API Keys → Publishable key（画像に表示されているもの）
   - または Legacy Keys → anon public

3. **SUPABASE_SERVICE_KEY**
   - Legacy Keys → service_role
   - または New secret key を作成

**これらを `.env` ファイルに設定すれば完了です！**

---

## 🆘 わからない場合

1. **Legacy Keysタブを開く**
   - 「Legacy anon, service_role API keys」タブをクリック
   - そこに2つのキーが表示されます

2. **それでもわからない場合**
   - スクリーンショットを共有してください
   - 具体的に案内します

---

**まずは、Legacy Keysタブを開いて、service_roleキーを確認してください！**

