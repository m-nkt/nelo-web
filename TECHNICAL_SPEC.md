# 技術選定・アーキテクチャ設計書

## 技術スタック選定

### フロントエンド

#### 選定: **Next.js 14 (App Router) + TypeScript + Tailwind CSS**

**理由:**
- SSR/SSG対応でSEO最適化
- API Routesでバックエンド統合可能
- TypeScriptで型安全性
- Tailwind CSSで高速UI開発
- Vercelデプロイで簡単運用

**代替案:**
- React + Vite（より軽量だが、SSR設定が必要）
- Remix（フルスタックフレームワーク）

---

### バックエンド

#### 選定: **Next.js API Routes + 外部サービス**

**理由:**
- フロントエンドと統合しやすい
- 初期はモノリスの方が開発効率が高い
- 必要に応じてマイクロサービス化可能

**将来的な分離案:**
- Node.js + Express（独立バックエンド）
- Python + FastAPI（AI機能強化時）

---

### データベース

#### 選定: **PostgreSQL (Supabase / Neon)**

**理由:**
- リレーショナルデータに適している
- ユーザー、アポイントメント、ポイント管理に最適
- Supabase/Neonでホスティング簡単
- リアルタイム機能（Supabase）も利用可能

**代替案:**
- MySQL (PlanetScale)
- MongoDB（ドキュメント指向が必要な場合）

---

### 認証

#### 選定: **NextAuth.js (Auth.js)**

**理由:**
- Next.jsと統合しやすい
- OAuth対応（Google、GitHub等）
- セッション管理が簡単
- TypeScript対応

**代替案:**
- Clerk（より高機能だが有料）
- Supabase Auth（Supabase使用時）

---

### カレンダー連携

#### 選定: **Google Calendar API**

**理由:**
- 最も普及しているカレンダーサービス
- 豊富なAPI機能
- 無料枠が大きい

**実装:**
- OAuth 2.0認証
- Calendar API v3
- 空き時間取得（Freebusy API）

---

### ビデオ通話

#### 選定: **Google Meet**

**理由:**
- 無料
- 自動リンク生成可能
- ブラウザで動作（アプリ不要）

**実装方法:**
- Google Calendar APIでイベント作成時にMeetリンク自動付与
- または、直接Meetリンク生成

---

### 決済

#### 選定: **Stripe**

**理由:**
- 最も普及している決済サービス
- 豊富なドキュメント
- サブスクリプション対応
- 日本対応

**実装:**
- Stripe Checkout（初期）
- Stripe Customer Portal（管理画面）
- Webhook（決済イベント処理）

---

### 通知

#### 選定: **Twilio WhatsApp Business API + SendGrid (Email)**

**理由:**
- WhatsApp Business APIはTwilioが最も確実
- EmailはSendGridが高信頼性
- フォールバックとしてEmail必須

**代替案:**
- WhatsApp Business API（直接申請、審査厳しい）
- Resend（Email、シンプル）

---

### フォーム（初期MVP）

#### 選定: **Tally / Typeform（外部サービス）**

**理由:**
- 開発工数削減
- すぐに使える
- データをAPI/webhookで取得可能

**将来的な移行:**
- 自社フォーム（Next.js + React Hook Form）

---

### データ管理（初期MVP）

#### 選定: **Airtable / Google Sheets（外部サービス）**

**理由:**
- 初期は人力オペレーション想定
- 非エンジニアでも操作可能
- APIでデータ取得可能

**将来的な移行:**
- 完全自社DB（PostgreSQL）

---

### AI機能

#### 選定: **OpenAI GPT-4 API / Google Gemini API**

**理由:**
- ChatGPT API: 高品質、コスト高め
- Gemini API: コスト効率良い、品質も十分

**用途:**
- マッチング優先度調整
- フィードバック生成
- おすすめ相手提案

---

### ホスティング

#### 選定: **Vercel (Frontend) + Supabase/Neon (Database)**

**理由:**
- Vercel: Next.js最適化、自動デプロイ
- Supabase/Neon: PostgreSQLホスティング、無料枠あり

**代替案:**
- Railway（フルスタック）
- AWS / GCP（スケール時）

---

### モニタリング・ログ

#### 選定: **Sentry (Error Tracking) + Vercel Analytics**

**理由:**
- Sentry: エラー追跡が優秀
- Vercel Analytics: パフォーマンス監視

**将来的な追加:**
- Datadog / New Relic（本格運用時）

---

## アーキテクチャ図

```
┌─────────────────────────────────────────────────┐
│                  ユーザー                        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│            Next.js Frontend                      │
│  (Next.js 14 + TypeScript + Tailwind CSS)        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Next.js API Routes (Backend)             │
│  - 認証 (NextAuth.js)                            │
│  - ユーザー管理                                  │
│  - マッチングロジック                            │
│  - ポイント管理                                  │
└─────┬────────────┬──────────────┬───────────────┘
      │            │              │
┌─────▼─────┐ ┌───▼────┐ ┌───────▼──────┐
│ PostgreSQL │ │ Stripe │ │ Google APIs  │
│ (Supabase) │ │         │ │ - Calendar   │
│            │ │         │ │ - Meet       │
└────────────┘ └─────────┘ └──────────────┘
      │
┌─────▼───────────────────────────────────────────┐
│        外部サービス                              │
│  - Twilio (WhatsApp)                            │
│  - SendGrid (Email)                               │
│  - OpenAI/Gemini (AI)                         │
│  - Airtable/Sheets (初期データ管理)              │
└─────────────────────────────────────────────────┘
```

---

## データモデル設計

### ユーザー (users)
```sql
- id: UUID (Primary Key)
- email: String (Unique)
- name: String
- languages_learning: JSON (学びたい言語リスト)
- languages_teaching: JSON (教えられる言語リスト)
- level: String (中級以上/ネイティブ等)
- gender: String (Optional)
- age_range: String
- video_call_ok: Boolean
- preferred_time_slots: JSON (希望時間帯)
- google_calendar_id: String (Optional)
- stripe_customer_id: String
- points_balance: Integer
- trust_score: Float (信頼度スコア)
- created_at: Timestamp
- updated_at: Timestamp
```

### アポイントメント (appointments)
```sql
- id: UUID (Primary Key)
- user1_id: UUID (Foreign Key -> users)
- user2_id: UUID (Foreign Key -> users)
- scheduled_at: Timestamp
- duration_minutes: Integer (15分単位)
- google_meet_link: String
- status: String (pending/confirmed/cancelled/completed)
- points_used: Integer
- cancelled_by: UUID (Optional)
- cancellation_reason: String (Optional)
- created_at: Timestamp
- updated_at: Timestamp
```

### ポイント取引 (point_transactions)
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> users)
- amount: Integer (増減ポイント)
- transaction_type: String (purchase/usage/refund/penalty)
- appointment_id: UUID (Optional, Foreign Key -> appointments)
- stripe_payment_intent_id: String (Optional)
- created_at: Timestamp
```

### マッチング履歴 (matching_history)
```sql
- id: UUID (Primary Key)
- user1_id: UUID (Foreign Key -> users)
- user2_id: UUID (Foreign Key -> users)
- matched_at: Timestamp
- common_time_slots: JSON
- match_score: Float (マッチングスコア)
- status: String (proposed/accepted/rejected)
```

---

## API設計

### 認証
- `POST /api/auth/signin` - サインイン
- `POST /api/auth/signup` - サインアップ
- `POST /api/auth/signout` - サインアウト

### ユーザー
- `GET /api/users/me` - 現在のユーザー情報取得
- `PUT /api/users/me` - プロフィール更新
- `GET /api/users/:id` - ユーザー情報取得（公開情報のみ）

### カレンダー
- `POST /api/calendar/connect` - Google Calendar連携
- `GET /api/calendar/availability` - 空き時間取得
- `POST /api/calendar/sync` - カレンダー同期

### マッチング
- `GET /api/matching/potential` - マッチング候補取得
- `POST /api/matching/propose` - マッチング提案
- `POST /api/matching/accept` - マッチング承認
- `POST /api/matching/reject` - マッチング拒否

### アポイントメント
- `GET /api/appointments` - アポイントメント一覧
- `GET /api/appointments/:id` - アポイントメント詳細
- `POST /api/appointments/:id/cancel` - キャンセル
- `POST /api/appointments/:id/confirm` - 確定

### ポイント
- `GET /api/points/balance` - ポイント残高取得
- `GET /api/points/transactions` - 取引履歴
- `POST /api/points/purchase` - ポイント購入

### 決済
- `POST /api/payments/create-checkout` - Stripe Checkout作成
- `POST /api/payments/webhook` - Stripe Webhook

---

## セキュリティ考慮事項

1. **認証・認可**
   - JWTトークン管理
   - セッション有効期限
   - CSRF対策

2. **データ保護**
   - 個人情報の暗号化
   - GDPR/個人情報保護法対応
   - データベースバックアップ

3. **API セキュリティ**
   - レート制限
   - 入力値検証
   - SQLインジェクション対策

4. **決済セキュリティ**
   - Stripe PCI準拠
   - Webhook署名検証

---

## パフォーマンス最適化

1. **データベース**
   - インデックス最適化
   - クエリ最適化
   - 接続プール

2. **キャッシュ**
   - Redis（将来的に）
   - Next.js ISR/SSG

3. **CDN**
   - Vercel Edge Network
   - 静的アセット最適化

---

## 開発環境

- **Node.js**: 20.x LTS
- **Package Manager**: pnpm (推奨) / npm
- **TypeScript**: 5.x
- **Linter**: ESLint + Prettier
- **Testing**: Jest + React Testing Library
- **E2E Testing**: Playwright

---

## デプロイ戦略

1. **開発環境**: Vercel Preview
2. **ステージング環境**: Vercel Staging
3. **本番環境**: Vercel Production

**CI/CD:**
- GitHub Actions
- 自動テスト実行
- 自動デプロイ

