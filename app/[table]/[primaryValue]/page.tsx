import Link from "next/link";
import { notFound } from "next/navigation";

import TableRowEditor from "@/components/TableRowEditor";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getTableMetadata } from "@/lib/tables";
import { inferPrimaryKey, mergeColumns } from "@/lib/tableUtils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = Record<string, any>;

async function fetchRow(
  tableName: string,
  primaryKey: string,
  primaryValue: string
) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq(primaryKey, primaryValue)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Row | null;
}

export default async function TableRowPage({
  params,
}: {
  params: { table: string; primaryValue: string };
}) {
  const metadata = getTableMetadata(params.table);

  if (!metadata) {
    notFound();
  }

  const tableName = metadata.tableName;

  const supabase = createServiceRoleClient();
  const { data: sampleRows, error: sampleError } = await supabase
    .from(tableName)
    .select("*")
    .limit(10);

  if (sampleError) {
    throw new Error(sampleError.message);
  }

  const columns = mergeColumns(metadata.columns, sampleRows ?? []);
  const primaryKey = inferPrimaryKey(columns);

  let row: Row | null = null;
  let fetchError: string | null = null;

  try {
    row = await fetchRow(tableName, primaryKey, params.primaryValue);
  } catch (error) {
    fetchError =
      error instanceof Error ? error.message : "レコードの取得に失敗しました";
  }

  if (!row) {
    fetchError = fetchError ?? "該当するレコードが見つかりませんでした";
  }

  const primaryValueLabel = row
    ? String(row[primaryKey] ?? "")
    : decodeURIComponent(params.primaryValue);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold capitalize">{tableName}</h1>
          <p className="text-sm text-slate-600">
            {primaryKey}: {primaryValueLabel}
          </p>
        </div>
        <Link
          href={`/${tableName}`}
          className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100"
        >
          ← 一覧に戻る
        </Link>
      </div>

      {!row || fetchError ? (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {fetchError}
        </p>
      ) : (
        <TableRowEditor
          tableName={tableName}
          columns={mergeColumns(metadata.columns, [row, ...(sampleRows ?? [])])}
          primaryKey={primaryKey}
          initialValues={row}
          primaryValue={row[primaryKey]}
          mode="edit"
        />
      )}
    </div>
  );
}
