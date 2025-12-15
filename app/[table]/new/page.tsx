import Link from "next/link";
import { notFound } from "next/navigation";

import TableRowEditor from "@/components/TableRowEditor";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getTableMetadata } from "@/lib/tables";
import { inferPrimaryKey, mergeColumns } from "@/lib/tableUtils";

export default async function NewTableRowPage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table } = await params;
  const metadata = getTableMetadata(table);

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

  // カレンダー以外のテーブルで、主キーがidの場合は最大ID+1を計算
  let nextId: string | number | undefined;
  if (tableName !== "calendar" && primaryKey === "id") {
    const { data: maxIdRow, error: maxIdError } = await supabase
      .from(tableName)
      .select(primaryKey)
      .order(primaryKey, { ascending: false })
      .limit(1)
      .maybeSingle();

    const rawMaxId = maxIdRow?.[primaryKey];

    if (!maxIdError && typeof rawMaxId === "number" && Number.isFinite(rawMaxId)) {
      nextId = String(rawMaxId + 1);
    } else if (!maxIdError && typeof rawMaxId === "string" && /^\d+$/.test(rawMaxId)) {
      // bigint(int8)がstringで返ることがあるため BigInt で扱う
      nextId = (BigInt(rawMaxId) + 1n).toString();
    } else {
      // 0件テーブル or 取得失敗時は1から
      nextId = "1";
    }
  }

  // 初期値を設定（nextIdがある場合はidに設定）
  const initialValues: Record<string, any> = {};
  if (nextId !== undefined) {
    initialValues[primaryKey] = nextId;
  }

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
        initialValues={initialValues}
        mode="create"
      />
    </div>
  );
}
