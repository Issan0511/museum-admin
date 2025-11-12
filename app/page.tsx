import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold">Museum Admin</h1>
        <p className="text-slate-600">
          博物館運営に必要なデータとログをまとめて管理するダッシュボードです。
        </p>
        <p className="text-sm text-slate-500">
          下記のカードから目的のセクションに移動してください。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/data"
          className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              データ編集
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">
              テーブルの閲覧・更新
            </h2>
            <p className="text-sm text-slate-600">
              Supabase上のテーブル一覧やレコードの閲覧・編集を行うセクションです。
            </p>
          </div>
          <span className="mt-6 inline-flex items-center text-sm font-medium text-indigo-600 transition group-hover:gap-2">
            データ管理画面へ移動
            <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>

        <Link
          href="/log"
          className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
        >
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
              ログ閲覧
            </div>
            <h2 className="text-2xl font-semibold text-slate-900">操作履歴の確認</h2>
            <p className="text-sm text-slate-600">
              更新履歴や監査ログなどのモニタリングにアクセスします。
            </p>
          </div>
          <span className="mt-6 inline-flex items-center text-sm font-medium text-slate-600 transition group-hover:gap-2">
            ログビューアへ移動
            <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
