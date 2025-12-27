# エンドポイント確認ガイド

## 🔍 確認方法

### 1. ヘルスチェック（成功 ✅）

```
http://localhost:3001/health
```

**期待される結果:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-20T..."
}
```

---

### 2. 統計情報（失敗 ❌）

統計情報エンドポイントは認証が必要です。

#### 方法A: ブラウザで確認

1. **URLを開く**
   ```
   http://localhost:3001/api/admin/stats?token=change-this-in-production
   ```

2. **認証トークンを確認**
   - `.env`ファイルの`ADMIN_TOKEN`を確認
   - デフォルトは `change-this-in-production`

#### 方法B: ターミナルで確認（curl）

```bash
curl "http://localhost:3001/api/admin/stats?token=change-this-in-production"
```

または、ヘッダーで送信：

```bash
curl -H "x-admin-token: change-this-in-production" http://localhost:3001/api/admin/stats
```

---

### 3. その他のエンドポイント

#### ユーザー一覧
```
http://localhost:3001/api/admin/users?token=change-this-in-production
```

#### アポイントメント一覧
```
http://localhost:3001/api/admin/appointments?token=change-this-in-production
```

#### 手動マッチング実行
```bash
curl -X POST "http://localhost:3001/api/admin/matching/trigger?token=change-this-in-production"
```

---

## ⚠️ よくあるエラー

### エラー1: `Unauthorized`

**原因**: 認証トークンが間違っている、または送信されていない

**解決方法**:
- URLに `?token=change-this-in-production` を追加
- または、`.env`ファイルの`ADMIN_TOKEN`を確認

### エラー2: `Database is not configured`

**原因**: Supabaseが設定されていない

**解決方法**:
- `.env`ファイルに`SUPABASE_URL`と`SUPABASE_KEY`を設定
- または、データベース機能を使わないエンドポイントを試す

### エラー3: `Service not configured`

**原因**: 必要なサービスが設定されていない

**解決方法**:
- 該当するサービスの環境変数を設定
- または、その機能を使わないエンドポイントを試す

---

## 📋 チェックリスト

### 基本確認
- [ ] ヘルスチェックが成功する
- [ ] サーバーが起動している

### 管理画面API確認
- [ ] 認証トークンが正しい
- [ ] URLに`?token=...`が含まれている
- [ ] データベースが設定されている（統計情報の場合）

---

## 💡 簡単な確認方法

### ターミナルで一括確認

```bash
# ヘルスチェック
curl http://localhost:3001/health

# 統計情報（認証付き）
curl "http://localhost:3001/api/admin/stats?token=change-this-in-production"
```

### ブラウザで確認

1. ブラウザのアドレスバーに以下を入力：
   ```
   http://localhost:3001/api/admin/stats?token=change-this-in-production
   ```

2. JSONが表示されれば成功

---

## 🆘 それでも失敗する場合

エラーメッセージを教えてください。具体的な解決方法を提案します。

