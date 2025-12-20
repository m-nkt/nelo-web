# 言語マッチングサービス - プロジェクト概要

## 📋 プロジェクト概要

メッセージ不要・アプリ不要・即会話できる言語マッチングサービス。

**最大の差別化ポイント:**
- DMしない
- 事前チャットなし
- カレンダーで即アポ確定

## 🎯 コンセプト

「時間が確定された、真剣な会話」を提供する。

- Tinder for Language ではなく
- **Calendly for Language Conversation**

## 📁 ドキュメント構成

### 👋 非エンジニアの方へ（まずはこちら！）

- **[QUICK_TEST.md](./QUICK_TEST.md)** - 超簡単！5分で確認する方法 ⭐
  - まずはこれだけ試してください
  - サーバーが起動するか確認

- **[HOW_TO_TEST.md](./HOW_TO_TEST.md)** - 動作確認ガイド（詳細版）
  - すべての確認方法を詳しく説明
  - WhatsAppでの確認方法も含む

- **[QUICK_START.md](./QUICK_START.md)** - 超簡単スタートガイド
  - 最小限の手順だけを説明
  - 5分で始められる

- **[GUIDE_FOR_NON_ENGINEERS.md](./GUIDE_FOR_NON_ENGINEERS.md)** - 完全ガイド
  - GitHubとは何か
  - コードの保存方法
  - わかりやすく丁寧に説明

- **[GUIDE_SOURCETREE.md](./GUIDE_SOURCETREE.md)** - SourceTree（ソースツリー）完全ガイド
  - SourceTreeの使い方
  - インストールから日常的な作業まで
  - ボタンをクリックするだけで操作できる

### 📋 計画書・技術ドキュメント

このプロジェクトには以下の計画書が含まれています：

### 🚀 まずはこちら（推奨）
- **[MVP_MINIMAL.md](./MVP_MINIMAL.md)** - 超ミニマムMVPプラン（WhatsApp完結型）
  - WhatsAppでAIと会話して登録
  - Webフォーム不要
  - ユーザーはWhatsAppだけ見ればOK
  - 3週間で完成

- **[MVP_LIGHT.md](./MVP_LIGHT.md)** - 軽量MVPプラン（Web版）
  - 外部サービス活用
  - 最小工数で動く構成
  - すぐにリリース可能

### 📋 詳細計画書
1. **[ROADMAP.md](./ROADMAP.md)** - 開発ロードマップ（本格版）
   - フェーズ別の開発計画
   - マイルストーン
   - リスク管理

2. **[TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)** - 技術選定・アーキテクチャ
   - 技術スタック選定理由
   - データモデル設計
   - API設計
   - セキュリティ考慮事項

3. **[ESTIMATION.md](./ESTIMATION.md)** - 工数見積もり（本格版）
   - フェーズ別工数
   - リスク要因による追加工数
   - 開発体制別の見積もり
   - コスト見積もり

4. **[PLAN.md](./PLAN.md)** - 全体計画書（本格版）
   - 詳細な開発計画
   - タスク一覧
   - 成功指標（KPI）
   - 次のステップ

## 🚀 クイックスタート

### 開発期間（2つのプラン）

#### 🚀 超ミニマムMVP（最推奨！）
- **期間**: **3週間**
- **工数**: 約120時間（1.5人月）
- **体制**: 1-2名
- **特徴**: WhatsApp完結型、Webフォーム不要
- **詳細**: [MVP_MINIMAL.md](./MVP_MINIMAL.md) を参照

#### 🚀 軽量MVP（Web版）
- **期間**: **2-3週間**
- **工数**: 約120時間（1.5人月）
- **体制**: 1-2名
- **詳細**: [MVP_LIGHT.md](./MVP_LIGHT.md) を参照

#### 🏗️ 本格版（将来的）
- **期間**: 16-20週間（4-5ヶ月）
- **工数**: 約860-970時間（5-6人月）
- **体制**: 2名推奨（10-12週間）

### 技術スタック（超ミニマム版・推奨）
- **Backend**: Node.js / Python
- **Database**: PostgreSQL (Supabase/Neon)
- **Chatbot**: WhatsApp Business API (Twilio) + OpenAI/Gemini
- **Calendar**: Google Calendar API
- **Payment**: Stripe
- **Video**: Google Meet
- **Notification**: WhatsApp Business API

**Webフォーム不要！WhatsAppだけで完結**

## 📊 開発フェーズ

### Phase 0: 準備・設計（2週間）
- 要件定義・設計
- 技術選定確定
- 開発環境構築
- 外部API申請

### Phase 1: MVP（6-8週間）
- 基盤構築
- ユーザー管理
- マッチング機能
- 決済・通知

### Phase 2: 自動化・改善（4-6週間）
- マッチング最適化（AI）
- 自動リマインド
- ダッシュボード

### Phase 3: スケール対応（4-6週間）
- パフォーマンス最適化
- モニタリング
- セキュリティ強化

## 💰 コスト見積もり（月額）

| サービス | 月額 |
|----------|------|
| Vercel Pro | $20 |
| Supabase/Neon Pro | $25 |
| SendGrid Essentials | $15 |
| Sentry Team | $26 |
| **合計（固定）** | **約$86/月** |

※ Stripe手数料、Twilio使用量、AI API使用量は別途

## ⚠️ 主要リスク

1. **WhatsApp Business API審査**
   - 早期申請が必要
   - Email通知を必須機能として実装

2. **カレンダーマッチングロジックの複雑さ**
   - プロトタイプ早期検証
   - シンプルなロジックから開始

3. **Google Calendar API制限**
   - レート制限対策必須

## 📈 成功指標（KPI）

### Phase 1完了時
- ユーザー登録数: 10-20人
- マッチング成功率: 70%以上
- アポイントメント確定率: 60%以上

### Phase 2完了時
- アクティブユーザー: 50-100人
- 自動マッチング率: 80%以上
- ドタキャン率: 10%以下

### Phase 3完了時
- アクティブユーザー: 200人以上
- システム稼働率: 99%以上

## 🛠️ 実装状況

### ✅ 完了
- [x] プロジェクト初期化（package.json、ディレクトリ構造）
- [x] データベーススキーマ設計
- [x] WhatsApp Webhook エンドポイント
- [x] AIチャットボット実装（登録フロー）
- [x] Google Calendar API統合（OAuth）
- [x] マッチングロジック実装
- [x] Stripe決済統合
- [x] 通知機能（WhatsApp）

### 📝 セットアップ

**非エンジニアの方**: まず [QUICK_START.md](./QUICK_START.md) を読んでください！

**エンジニアの方**: 詳細なセットアップ手順は [README_SETUP.md](./README_SETUP.md) を参照してください。

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集

# データベースのセットアップ
# Supabase または PostgreSQL で database/schema.sql を実行

# 開発サーバーの起動
npm run dev
```

## 🔗 次のステップ

1. **外部API申請・設定**
   - Twilio WhatsApp Business API
   - Google Cloud Console（Calendar API）
   - Stripe アカウント
   - OpenAI API キー

2. **環境変数の設定**
   - `.env` ファイルに必要な認証情報を設定

3. **テスト**
   - WhatsApp で登録フローをテスト
   - マッチング機能をテスト

詳細は各ドキュメントを参照してください。

---

**作成日**: 2024年
**最終更新**: 2024年

