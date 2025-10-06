import Link from "next/link";
import { getAvailableTables } from "@/lib/tables";

// キャッシュを無効化
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
  const tables = getAvailableTables();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">Museum Admin</h1>
        <p className="text-slate-600">
          Supabase上のテーブルをブラウザから閲覧・編集できる管理画面です。
        </p>
        <p className="text-sm text-slate-500">
          環境変数 <code>SUPABASE_URL</code> と
          <code className="ml-1">SUPABASE_SERVICE_ROLE_KEY</code> を設定して
          <code className="ml-1">npm run dev</code> を起動してください。
        </p>
      </header>

      <section>
        <h2 className="text-lg font-medium text-slate-700">テーブル一覧</h2>
        {tables.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            テーブルが定義されていません。lib/tables.ts を確認してください。
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => (
              <li key={table.tableName}>
                <Link
                  href={`/${table.tableName}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow"
                >
                  <h3 className="text-xl font-semibold">
                    {table.displayName}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    テーブル: {table.tableName}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {table.columns.length} 列
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
