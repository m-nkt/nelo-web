# 非エンジニア向け完全ガイド

## 📚 このガイドについて

このガイドは、プログラミングの知識がない方でも理解できるように、できるだけ簡単な言葉で説明しています。

---

## 🤔 よくある質問

### Q1: GitHubって何？必要？

**A: GitHubは「コードの保存場所」です。必須ではありませんが、強く推奨します。**

#### なぜGitHubを使うの？

1. **バックアップ**: コードが消えても復元できる
2. **共有**: 他のエンジニアと協力できる
3. **履歴管理**: 過去のバージョンに戻れる
4. **無料**: 個人利用なら無料

#### GitHubを使わない場合

- コードはあなたのパソコンにだけ保存されます
- パソコンが壊れたら、コードも消えます
- 他の人と共有するのが難しい

**結論: GitHubを使うことをおすすめします！**

---

## 💾 コードはどこに保存されるの？

### 現在の状況

今、コードはあなたのパソコンのこの場所に保存されています：

```
/Users/masakinakata/LanguageMatching/
```

このフォルダの中に、すべてのコードファイルがあります。

### 保存場所の選択肢

#### 1. パソコンだけに保存（GitHubなし）
- ✅ 簡単
- ❌ バックアップがない
- ❌ 共有が難しい

#### 2. GitHubに保存（推奨）
- ✅ バックアップがある
- ✅ どこからでもアクセスできる
- ✅ 履歴管理ができる
- ⚠️ 少し設定が必要

#### 3. 両方に保存（最推奨）
- ✅ パソコンで作業
- ✅ GitHubに自動でバックアップ
- ✅ 最安全

---

## 🚀 実際の手順（超わかりやすく）

### ステップ1: GitHubアカウントを作る（5分）

1. **GitHubのサイトを開く**
   - ブラウザで https://github.com を開く

2. **「Sign up」をクリック**
   - 右上の「Sign up」ボタンをクリック

3. **アカウント情報を入力**
   - ユーザー名（例: masakinakata）
   - メールアドレス
   - パスワード

4. **メール認証**
   - メールが届くので、リンクをクリック

5. **完了！**
   - GitHubアカウントができました

---

### ステップ2: GitHubにリポジトリ（保存場所）を作る（3分）

1. **GitHubにログイン**
   - https://github.com にログイン

2. **「New」をクリック**
   - 左上の「+」マーク → 「New repository」

3. **リポジトリ情報を入力**
   - Repository name: `LanguageMatching`（好きな名前でOK）
   - Description: 「言語マッチングサービス」（説明、任意）
   - Public または Private を選択
     - **Public**: 誰でも見れる（無料）
     - **Private**: あなただけ見れる（無料）
   - **「Initialize this repository with a README」はチェックしない**（重要！）

4. **「Create repository」をクリック**
   - リポジトリが作成されました

---

### ステップ3: パソコンのコードをGitHubにアップロード（10分）

#### 方法A: GitHub Desktopを使う（簡単・推奨）

1. **GitHub Desktopをインストール**
   - https://desktop.github.com からダウンロード
   - インストールして起動

2. **GitHubにログイン**
   - GitHub DesktopでGitHubアカウントにログイン

3. **リポジトリを追加**
   - 「File」→「Add Local Repository」
   - 「Choose...」をクリック
   - `/Users/masakinakata/LanguageMatching` フォルダを選択
   - 「Add repository」をクリック

4. **GitHubに接続**
   - 左下に「Publish repository」ボタンがあるはず
   - クリック
   - リポジトリ名を確認（`LanguageMatching`）
   - 「Publish repository」をクリック

5. **完了！**
   - コードがGitHubにアップロードされました！

#### 方法B: コマンドラインを使う（少し難しい）

ターミナル（Macのアプリ）を開いて、以下のコマンドを1つずつ実行：

```bash
# 1. プロジェクトフォルダに移動
cd /Users/masakinakata/LanguageMatching

# 2. Gitを初期化（初回のみ）
git init

# 3. すべてのファイルを追加
git add .

# 4. 最初のコミット（保存）
git commit -m "Initial commit"

# 5. GitHubのリポジトリに接続
# （YOUR_USERNAMEをあなたのGitHubユーザー名に置き換える）
git remote add origin https://github.com/YOUR_USERNAME/LanguageMatching.git

# 6. GitHubにアップロード
git push -u origin main
```

**注意**: 方法Bを使う場合、GitHubの認証情報を入力する必要があります。

---

## 📝 今後の作業の流れ

### 日常的な作業フロー

1. **コードを編集**
   - パソコンでコードを変更

2. **GitHub Desktopで確認**
   - 変更されたファイルが表示される

3. **コミット（保存）**
   - 変更内容を説明するメッセージを入力
   - 例: 「ユーザー登録機能を追加」
   - 「Commit to main」をクリック

4. **プッシュ（アップロード）**
   - 「Push origin」をクリック
   - GitHubにアップロードされる

**これで、コードが安全に保存されます！**

---

## 🔐 セキュリティについて

### 重要な情報はGitHubに上げない

以下の情報は**絶対に**GitHubにアップロードしないでください：

- APIキー（Twilio、Stripe、OpenAIなど）
- パスワード
- 個人情報

これらは `.env` ファイルに保存され、`.gitignore` で除外されています。

### 確認方法

GitHubにアップロードする前に、GitHub Desktopで確認：
- `.env` ファイルが表示されていないことを確認
- 表示されていたら、`.gitignore` を確認

---

## 🆘 困ったときは

### よくある問題

#### Q: 「gitコマンドが見つからない」エラー

**A: Gitをインストールする必要があります**

1. ターミナルで以下を実行：
```bash
git --version
```

2. エラーが出たら、Gitをインストール：
```bash
# Macの場合
xcode-select --install
```

または、https://git-scm.com からダウンロード

#### Q: GitHubにアップロードできない

**A: 認証情報を確認**

1. GitHub Desktopを使っている場合：
   - 「Preferences」→「Accounts」でログイン状態を確認

2. コマンドラインを使っている場合：
   - Personal Access Tokenが必要かもしれません
   - https://github.com/settings/tokens で作成

#### Q: コードを間違えて削除してしまった

**A: GitHubから復元できます**

1. GitHubのサイトでリポジトリを開く
2. 履歴から過去のバージョンを確認
3. 必要なファイルをダウンロード

---

## 📋 チェックリスト

### 初回セットアップ

- [ ] GitHubアカウントを作成
- [ ] GitHub Desktopをインストール（またはGitをインストール）
- [ ] リポジトリを作成
- [ ] コードをGitHubにアップロード
- [ ] `.env` ファイルがアップロードされていないことを確認

### 日常的な作業

- [ ] コードを編集
- [ ] 変更内容を確認
- [ ] コミット（保存）
- [ ] プッシュ（アップロード）

---

## 💡 まとめ

1. **GitHubはコードの保存場所**（バックアップとして重要）
2. **GitHub Desktopを使うと簡単**
3. **コードはパソコンで編集、GitHubに保存**
4. **重要な情報（APIキーなど）はGitHubに上げない**

**まずはGitHubアカウントを作って、GitHub Desktopをインストールすることから始めましょう！**

---

## 📞 次のステップ

1. GitHubアカウント作成
2. GitHub Desktopインストール
3. コードをGitHubにアップロード
4. セットアップガイド（README_SETUP.md）に進む

質問があれば、いつでも聞いてください！

