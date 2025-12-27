# クイック確認ガイド

## ✅ 成功したもの

### ヘルスチェック
```
http://localhost:3001/health
```
→ 成功 ✅

---

## ❌ 失敗したもの

### 統計情報
```
http://localhost:3001/api/admin/stats
```
→ 失敗 ❌

---

## 🔍 統計情報を確認する方法

### 方法1: 認証トークンを追加（推奨）

ブラウザで以下を開く：
```
http://localhost:3001/api/admin/stats?token=change-this-in-production
```

**重要**: URLの最後に `?token=change-this-in-production` を追加してください。

---

### 方法2: ターミナルで確認

```bash
curl "http://localhost:3001/api/admin/stats?token=change-this-in-production"
```

---

## ⚠️ よくあるエラー

### エラー1: `Unauthorized`

**原因**: 認証トークンが送信されていない

**解決方法**: URLに `?token=change-this-in-production` を追加

---

### エラー2: `Database is not configured`

**原因**: Supabaseが設定されていない

**解決方法**: 
- データベースが設定されていない場合、統計情報は0を返します
- 実際のデータを見るには、Supabaseを設定する必要があります

---

## 📋 確認手順

### ステップ1: 認証トークン付きでアクセス

ブラウザで以下を開く：
```
http://localhost:3001/api/admin/stats?token=change-this-in-production
```

### ステップ2: 結果を確認

**データベースが設定されている場合:**
```json
{
  "totalUsers": 0,
  "activeUsers": 0,
  "totalAppointments": 0,
  ...
}
```

**データベースが設定されていない場合:**
```json
{
  "error": "Database is not configured",
  "message": "Please set SUPABASE_URL and SUPABASE_KEY in .env file",
  "stats": {
    "totalUsers": 0,
    ...
    "note": "Database not configured - showing zero values"
  }
}
```

どちらも正常な応答です！

---

## 💡 まとめ

統計情報エンドポイントは：
1. **認証が必要** → URLに `?token=change-this-in-production` を追加
2. **データベースが設定されていない場合** → 0の値を返します（エラーではありません）

**正しいURL:**
```
http://localhost:3001/api/admin/stats?token=change-this-in-production
```

これで確認できるはずです！

