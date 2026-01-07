import Link from "next/link";
import { notFound } from "next/navigation";
import { getTableMetadata } from "@/lib/tables";
import { createServiceRoleClient } from "@/lib/supabase/server";
import CalendarTableEditor from "@/components/CalendarTableEditor";
import ImageThumbnail from "@/components/ImageThumbnail";
import { inferPrimaryKey, mergeColumns } from "@/lib/tableUtils";
import { getImageUrl, hasImageSupport } from "@/lib/imageUtils";

// キャッシュを無効化
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchRows(tableName: string, columns: string[]) {
  const supabase = createServiceRoleClient();
  
  // ソートカラムを決定（crafts テーブルは display_order、それ以外は id があれば id、なければ最初のカラム）
  const sortColumn =
    (tableName === "crafts" && columns.includes("display_order"))
      ? "display_order"
      : columns.includes("id")
        ? "id"
        : columns[0];
  
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .order(sortColumn, { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

async function fetchDemoTemplates() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("demo_templates")
    .select("id, name_ja, name_en")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export default async function TablePage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table } = await params;
  const metadata = getTableMetadata(table);

  if (!metadata) {
    notFound();
  }

  let rows: Record<string, unknown>[] = [];
  let fetchError: string | null = null;
  let templateError: string | null = null;
  let templates: Awaited<ReturnType<typeof fetchDemoTemplates>> = [];

  try {
    rows = await fetchRows(metadata.tableName, metadata.columns);
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "データの取得に失敗しました";
  }

  const columns = mergeColumns(metadata.columns, rows);
  const primaryKey = inferPrimaryKey(columns);
  const nameColumn = columns.find(
    (column) => column.toLowerCase() === "name_ja"
  );

  const isCalendarTable = metadata.tableName === "calendar";

  if (!fetchError && isCalendarTable) {
    try {
      templates = await fetchDemoTemplates();
    } catch (error) {
      templateError = error instanceof Error ? error.message : "関連データの取得に失敗しました";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold capitalize">
            {metadata.tableName}
          </h1>
          <p className="text-sm text-slate-600">
            列: {columns.join(", ") || "(なし)"}
          </p>
          <p className="text-xs text-slate-500">主キー推定: {primaryKey}</p>
        </div>
        <Link
          href="/data"
          className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100"
        >
          ← 一覧に戻る
        </Link>
      </div>

      {fetchError ? (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          データの取得中にエラーが発生しました: {fetchError}
        </p>
      ) : isCalendarTable ? (
        templateError ? (
          <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            カレンダーに必要な関連データの取得中にエラーが発生しました: {templateError}
          </p>
        ) : (
          <CalendarTableEditor
            tableName={metadata.tableName}
            primaryKey={primaryKey}
            initialRows={rows}
            templates={templates}
          />
        )
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">レコード</h2>
            <Link
              href={`/${metadata.tableName}/new`}
              className="rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              新規追加
            </Link>
          </div>
          {rows.length === 0 ? (
            <p className="rounded border border-slate-200 bg-white px-3 py-6 text-center text-sm text-slate-500">
              レコードがありません。新規追加ボタンから作成してください。
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 overflow-hidden rounded border border-slate-200 bg-white">
              {rows.map((row, index) => {
                const primaryValue = row[primaryKey];
                const key =
                  primaryValue !== undefined && primaryValue !== null
                    ? String(primaryValue)
                    : `row-${index}`;
                const displayName =
                  (nameColumn &&
                    typeof row[nameColumn] === "string" &&
                    row[nameColumn]) ||
                    (typeof row["name_ja"] === "string" && row["name_ja"]) ||
                  (typeof row["NAME_JA"] === "string" && row["NAME_JA"]) ||
                  `${primaryValue}`;

                const imageUrl = hasImageSupport(metadata.tableName) && 
                  primaryValue !== undefined && 
                  primaryValue !== null &&
                  (typeof primaryValue === 'string' || typeof primaryValue === 'number')
                  ? getImageUrl(metadata.tableName, primaryValue)
                  : null;

                return (
                  <li key={key} className="bg-white">
                    {primaryValue === undefined || primaryValue === null ? (
                      <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-400">
                        <span className="font-medium">{displayName}</span>
                        <span className="text-xs">主キー未設定</span>
                      </div>
                    ) : (
                      <Link
                        href={`/${metadata.tableName}/${encodeURIComponent(
                          String(primaryValue)
                        )}`}
                        className="flex items-center justify-between px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          {imageUrl && (
                            <ImageThumbnail
                              src={imageUrl}
                              alt={displayName}
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                          <span className="font-medium">{displayName}</span>
                        </div>
                        <span className="text-xs text-slate-400">編集</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
