# ポート番号の確認方法

## 🔍 問題

`curl: (7) Failed to connect to localhost port 3001`

これは、サーバーがポート3001で起動していないことを意味します。

---

## ✅ 解決方法

### ステップ1: サーバーのポートを確認

ターミナルのサーバー起動メッセージを確認してください：

```
🚀 Server running on port 3000
```

または

```
🚀 Server running on port 3001
```

**表示されているポート番号を使いましょう！**

---

### ステップ2: 正しいポートでアクセス

サーバーが**ポート3000**で起動している場合：

```
http://localhost:3000/api/admin/stats?token=change-this-in-production
```

サーバーが**ポート3001**で起動している場合：

```
http://localhost:3001/api/admin/stats?token=change-this-in-production
```

---

## 📋 確認手順

### 1. サーバーの起動メッセージを確認

ターミナルで以下の行を探してください：

```
🚀 Server running on port XXXX
```

この`XXXX`が実際のポート番号です。

### 2. そのポート番号でアクセス

ブラウザで：
```
http://localhost:XXXX/api/admin/stats?token=change-this-in-production
```

ターミナルで：
```bash
curl "http://localhost:XXXX/api/admin/stats?token=change-this-in-production"
```

---

## 💡 画像から判断すると

画像を見ると、サーバーは**ポート3000**で起動しているようです。

**正しいURL:**
```
http://localhost:3000/api/admin/stats?token=change-this-in-production
```

---

## 🆘 それでも接続できない場合

### サーバーが起動しているか確認

1. ターミナルでサーバーが動いているか確認
2. ヘルスチェックを試す：
   ```
   http://localhost:3000/health
   ```
3. これが成功すれば、サーバーは動いています

### ポート番号を確認

ターミナルの起動メッセージで、実際のポート番号を確認してください。

---

**ポート3000で試してみてください！**

