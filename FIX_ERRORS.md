# エラー解決ガイド

## 🔧 よくあるエラーと解決方法

### エラー1: `Cannot find package 'express'` または `Cannot find module`

**エラーメッセージ例**:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express' imported from ...
```

**原因**: 依存関係（必要なパッケージ）がインストールされていない

**解決方法**:

1. **ターミナルで以下を実行**
   ```bash
   cd /Users/masakinakata/LanguageMatching
   npm install
   ```

2. **数分待つ**
   - 初回は数分かかります
   - `node_modules` フォルダが作成されます

3. **再度サーバーを起動**
   ```bash
   npm run dev
   ```

**これで解決するはずです！** ✅

---

### エラー2: `npm: command not found`

**エラーメッセージ例**:
```
zsh: command not found: npm
```

**原因**: Node.jsがインストールされていない

**解決方法**:

1. **Node.jsをインストール**
   - https://nodejs.org にアクセス
   - 「LTS」版をダウンロード
   - インストール

2. **ターミナルを再起動**

3. **確認**
   ```bash
   node --version
   npm --version
   ```
   - バージョンが表示されればOK

---

### エラー3: ポート3000が使われている

**エラーメッセージ例**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**原因**: ポート3000が既に使われている

**解決方法1**: 別のポートを使う

1. `.env`ファイルを開く（または作成）
2. 以下を追加:
   ```
   PORT=3001
   ```
3. サーバーを再起動

**解決方法2**: 既存のプロセスを終了

```bash
# ポート3000を使っているプロセスを探す
lsof -ti:3000

# プロセスを終了（表示された番号を入力）
kill -9 <プロセス番号>
```

---

### エラー4: `.env`ファイルが見つからない

**エラーメッセージ例**:
```
Error: Cannot find module './.env'
```

**解決方法**:

1. **`.env`ファイルを作成**
   ```bash
   cd /Users/masakinakata/LanguageMatching
   touch .env
   ```

2. **`.env.example`をコピー**（存在する場合）
   ```bash
   cp .env.example .env
   ```

3. **`.env`ファイルを編集**
   - 必要な認証情報を設定
   - 最初は空でもOK（一部機能は動きませんが、サーバーは起動します）

---

### エラー5: データベース接続エラー

**エラーメッセージ例**:
```
Error: relation "users" does not exist
```

**原因**: データベースのスキーマが作成されていない

**解決方法**:

1. **SupabaseでSQL Editorを開く**
   - https://supabase.com にログイン
   - プロジェクトを選択
   - 「SQL Editor」をクリック

2. **スキーマを実行**
   - `database/schema.sql` の内容をコピー
   - SQL Editorにペースト
   - 「Run」をクリック

---

### エラー6: 権限エラー

**エラーメッセージ例**:
```
EACCES: permission denied
```

**解決方法**:

1. **フォルダの権限を確認**
   ```bash
   ls -la /Users/masakinakata/LanguageMatching
   ```

2. **権限を変更**（必要に応じて）
   ```bash
   chmod -R 755 /Users/masakinakata/LanguageMatching
   ```

---

## ✅ エラーが出たときの確認チェックリスト

1. **依存関係がインストールされているか**
   ```bash
   ls node_modules
   ```
   - `node_modules`フォルダが存在するか確認

2. **Node.jsがインストールされているか**
   ```bash
   node --version
   npm --version
   ```

3. **プロジェクトフォルダにいるか**
   ```bash
   pwd
   ```
   - `/Users/masakinakata/LanguageMatching` と表示されればOK

4. **`.env`ファイルが存在するか**
   ```bash
   ls -la .env
   ```

---

## 🆘 それでも解決しない場合

1. **エラーメッセージ全体をコピー**
2. **Googleで検索**
   - 多くの場合、解決方法が見つかります
3. **それでも解決しない場合**
   - エラーメッセージ全体を教えてください

---

## 💡 よくある質問

### Q: `npm install`は何回実行すればいいの？

**A**: 初回のみ、または新しい依存関係を追加したときのみ

### Q: `npm install`に時間がかかる

**A**: 正常です。初回は数分かかることがあります

### Q: エラーが出たけど、続行してもいい？

**A**: エラーが出た場合は、解決してから続行してください

---

**最も多いエラーは `Cannot find package` です。これは `npm install` で解決できます！**

