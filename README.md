# Museum Admin

博物館管理システム向けの管理画面アプリケーションです。Supabase上のテーブルをブラウザから閲覧・編集できます。

## 概要

Museum Adminは、博物館の工芸品、イベント、カレンダー、デモテンプレートなどのデータを管理するための軽量なWebアプリケーションです。Next.js + TypeScript + Tailwind CSSで構築されており、Supabaseをバックエンドとして使用します。

### 主な機能

- 📊 **テーブル一覧表示** - 管理対象のテーブルを一覧表示
- 📝 **データ閲覧** - テーブルデータをテーブル形式で表示
- ✏️ **データ編集** - 既存レコードの更新
- ➕ **データ追加** - 新規レコードの作成
- 🗑️ **データ削除** - レコードの削除
- 🔍 **多言語対応** - 日本語、英語、中国語のデータ管理

### 管理対象テーブル

- **カレンダー** (`calendar`) - デモ日程管理
- **工芸品** (`crafts`) - 工芸品情報（多言語対応）
- **イベント** (`events`) - イベント情報（多言語対応）
- **デモテンプレート** (`demo_templates`) - デモ用テンプレート（多言語対応）

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **パッケージマネージャー**: npm

## セットアップ

### 必要要件

- Node.js 18.x 以上
- npm
- Supabaseプロジェクト

### インストール

1. リポジトリをクローン

```bash
git clone https://github.com/Issan0511/museum-admin.git
cd museum-admin
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を設定

`.env.local` ファイルをプロジェクトルートに作成し、以下の環境変数を設定します：

```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **注意**: `SUPABASE_SERVICE_ROLE_KEY` はサービスロールキーを使用してください。データベースへの完全なアクセス権限が必要です。

4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構造

```
museum-admin/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # トップページ（テーブル一覧）
│   ├── globals.css          # グローバルスタイル
│   ├── [table]/             # 動的ルート（テーブル詳細）
│   │   └── page.tsx         # テーブル編集画面
│   └── api/                 # APIルート
│       └── tables/
│           └── [table]/
│               └── route.ts # CRUD API
├── components/              # Reactコンポーネント
│   └── TableEditor.tsx      # テーブル編集UI
├── lib/                     # ユーティリティ
│   ├── tables.ts           # テーブルメタデータ定義
│   └── supabase/
│       └── server.ts       # Supabaseクライアント
├── csvs/                    # CSVファイル用ディレクトリ
└── public/                  # 静的ファイル
```

## 使い方

### テーブルの追加

新しいテーブルを管理画面に追加するには、`lib/tables.ts` を編集します：

```typescript
const TABLES: TableMetadata[] = [
  // ...既存のテーブル
  {
    tableName: "your_table_name",  // Supabaseのテーブル名
    displayName: "表示名",          // 管理画面での表示名
    columns: ["id", "name", "..."], // カラム名の配列
  },
];
```

### APIエンドポイント

各テーブルに対して以下のAPIが自動生成されます：

- `GET /api/tables/[table]` - データ取得
- `POST /api/tables/[table]` - データ作成
- `PUT /api/tables/[table]` - データ更新
- `DELETE /api/tables/[table]` - データ削除

## 開発

### ビルド

```bash
npm run build
```

### 本番起動

```bash
npm start
```

### Lint

```bash
npm run lint
```

## ライセンス

Private

## 作者

Issan0511
