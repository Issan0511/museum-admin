# Museum Admin

Supabase のテーブルを管理するための Next.js 製ダッシュボードです。`csvs/` ディレクトリの各 `_rows.csv` が Supabase のテーブルに対応している前提で、テーブルの一覧と編集画面を提供します。

## セットアップ

```bash
npm install
```

環境変数を設定してください。

```bash
cp .env.example .env.local
# .env.local を編集して Supabase の URL とサービスロールキーを入力
```

開発サーバーの起動:

```bash
npm run dev
```

## 機能

- `csvs/` 内の CSV からテーブル一覧を自動生成
- レコードの閲覧・追加・更新・削除
- Supabase の API を Next.js 経由で呼び出し、サービスロールキーを安全にサーバー側で利用

## 注意事項

- 更新・削除は `id` カラムを持つテーブルを前提としています。
- Supabase の権限設定により操作できない場合があります。
- 本アプリは Tailwind CSS を利用しています。
