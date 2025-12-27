# ユーザーデータをリセットする方法

テストを最初からやり直すには、Supabaseのデータを削除します。

## 方法1: SupabaseのSQLエディタで削除（推奨）

1. **Supabaseダッシュボードにログイン**
   - https://supabase.com/dashboard にアクセス
   - プロジェクトを選択

2. **SQLエディタを開く**
   - 左メニューから「SQL Editor」をクリック

3. **以下のSQLを実行**
   ```sql
   -- 電話番号を自分の番号に変更してください
   DELETE FROM message_logs WHERE phone_number = '+818051898924';
   DELETE FROM user_states WHERE phone_number = '+818051898924';
   DELETE FROM users WHERE phone_number = '+818051898924';
   ```

4. **確認**
   - 実行後、「Run」ボタンをクリック
   - 成功メッセージが表示されればOK

5. **WhatsAppで「hi」を送信**
   - これで最初からやり直せます

---

## 方法2: 全ユーザーを削除（全データクリア）

⚠️ **注意**: これは全ユーザーのデータを削除します。本番環境では絶対に実行しないでください。

```sql
DELETE FROM message_logs;
DELETE FROM user_states;
DELETE FROM users;
```

---

## 方法3: スクリプトファイルを使用

`scripts/reset_user.sql` ファイルを開いて、電話番号を変更してからSupabaseのSQLエディタにコピー&ペーストしてください。

---

## トラブルシューティング

### エラーが出る場合

- 電話番号の形式を確認: `+818051898924`（`whatsapp:`プレフィックスは不要）
- テーブル名を確認: `users`, `user_states`, `message_logs`

### 削除できない場合

- Supabaseの権限を確認
- サービスキー（Service Key）を使用しているか確認

