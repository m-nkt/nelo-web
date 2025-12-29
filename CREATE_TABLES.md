# データベーステーブル作成ガイド

`user_states`テーブルが存在しない場合、以下のSQLをSupabaseで実行してください。

## Supabaseでテーブルを作成する方法

1. **Supabaseダッシュボードにログイン**
   - https://supabase.com/dashboard
   - プロジェクトを選択

2. **SQLエディタを開く**
   - 左メニューから「SQL Editor」をクリック

3. **以下のSQLを実行**

```sql
-- User states table (for registration flow)
CREATE TABLE IF NOT EXISTS user_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_states_phone ON user_states(phone_number);
```

4. **確認**
   - 「Run」ボタンをクリック
   - 成功メッセージが表示されればOK

## すべてのテーブルを作成する場合

`database/schema.sql` ファイルの内容をすべてコピー&ペーストして実行してください。

---

## トラブルシューティング

### エラー: "table already exists"
- これは問題ありません。テーブルは既に存在しています。

### エラー: "permission denied"
- Supabaseの権限を確認してください
- Service Keyを使用していることを確認してください

