import Link from "next/link";
import { notFound } from "next/navigation";

import TableRowEditor from "@/components/TableRowEditor";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getTableMetadata } from "@/lib/tables";
import { inferPrimaryKey, mergeColumns } from "@/lib/tableUtils";

export default async function NewTableRowPage({
  params,
}: {
  params: { table: string };
}) {
  const metadata = getTableMetadata(params.table);

  if (!metadata) {
    notFound();
  }

  const tableName = metadata.tableName;

  const supabase = createServiceRoleClient();
  const { data: sampleRows, error } = await supabase
    .from(tableName)
    .select("*")
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  const columns = mergeColumns(metadata.columns, sampleRows ?? []);
  const primaryKey = inferPrimaryKey(columns);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold capitalize">{tableName}</h1>
          <p className="text-sm text-slate-600">新規作成</p>
        </div>
        <Link
          href={`/${tableName}`}
          className="rounded border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-100"
        >
          ← 一覧に戻る
        </Link>
      </div>

      <TableRowEditor
        tableName={tableName}
        columns={columns}
        primaryKey={primaryKey}
        initialValues={{}}
        mode="create"
      />
    </div>
  );
}
