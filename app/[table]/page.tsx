import Link from "next/link";
import { notFound } from "next/navigation";
import { getTableMetadata } from "@/lib/tables";
import { createServiceRoleClient } from "@/lib/supabase/server";
import TableEditor from "@/components/TableEditor";

async function fetchRows(tableName: string) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.from(tableName).select("*");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

function mergeColumns(metadataColumns: string[], rows: Record<string, unknown>[]) {
  const set = new Set(metadataColumns);
  rows.forEach((row) => {
    Object.keys(row ?? {}).forEach((key) => {
      set.add(key);
    });
  });
  return Array.from(set);
}

function inferPrimaryKey(columns: string[]) {
  if (columns.length === 0) {
    return "id";
  }

  const lowerColumns = columns.map((col) => col.toLowerCase());
  const idIndex = lowerColumns.indexOf("id");
  if (idIndex !== -1) {
    return columns[idIndex];
  }

  const uuidIndex = lowerColumns.indexOf("uuid");
  if (uuidIndex !== -1) {
    return columns[uuidIndex];
  }

  return columns[0];
}

export default async function TablePage({
  params,
}: {
  params: { table: string };
}) {
  const metadata = getTableMetadata(params.table);

  if (!metadata) {
    notFound();
  }

  let rows: Record<string, unknown>[] = [];
  let fetchError: string | null = null;

  try {
    rows = await fetchRows(metadata.tableName);
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "データの取得に失敗しました";
  }

  const columns = mergeColumns(metadata.columns, rows);
  const primaryKey = inferPrimaryKey(columns);

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
          href="/"
          className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100"
        >
          ← 一覧に戻る
        </Link>
      </div>

      {fetchError ? (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          データの取得中にエラーが発生しました: {fetchError}
        </p>
      ) : (
        <TableEditor
          tableName={metadata.tableName}
          columns={columns}
          primaryKey={primaryKey}
          initialRows={rows}
        />
      )}
    </div>
  );
}
