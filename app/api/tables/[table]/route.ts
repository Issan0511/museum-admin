import { NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

function getClient() {
  return createServiceRoleClient();
}

function validateTableName(table: string) {
  if (!/^[a-z0-9_]+$/i.test(table)) {
    throw new Error("不正なテーブル名です。");
  }
}

function validatePrimaryKey(primaryKey: string | undefined) {
  if (!primaryKey || !/^[a-z0-9_]+$/i.test(primaryKey)) {
    throw new Error("不正な主キーです。");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    validateTableName(params.table);
    const payload = await request.json();
    const client = getClient();
    const tableQuery = client.from(params.table as string) as any;
    const { data, error } = await tableQuery
      .insert(payload.values ?? payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return Response.json({ data });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "登録に失敗しました";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    validateTableName(params.table);
    const payload = await request.json();
    const { primaryKey, primaryValue, values } = payload ?? {};
    validatePrimaryKey(primaryKey);

    if (primaryValue === undefined || primaryValue === null) {
      throw new Error(`${primaryKey} が必要です`);
    }

    console.log('[PUT] Table:', params.table);
    console.log('[PUT] PrimaryKey:', primaryKey, '=', primaryValue);
    console.log('[PUT] Values:', values);

    const client = getClient();
    const tableQuery = client.from(params.table as string) as any;
    const { data, error } = await tableQuery
      .update(values as Record<string, unknown>)
      .eq(primaryKey, primaryValue)
      .select()
      .single();

    console.log('[PUT] Response - Data:', data);
    console.log('[PUT] Response - Error:', error);

    if (error) {
      throw error;
    }

    return Response.json({ data });
  } catch (error) {
    console.error('[PUT] Exception:', error);
    const message = error instanceof Error ? error.message : "更新に失敗しました";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    validateTableName(params.table);
    const payload = await request.json();
    const { primaryKey, primaryValue } = payload ?? {};
    validatePrimaryKey(primaryKey);

    if (primaryValue === undefined || primaryValue === null) {
      throw new Error(`${primaryKey} が必要です`);
    }

    const client = getClient();
    const tableQuery = client.from(params.table as string) as any;
    const { error } = await tableQuery
      .delete()
      .eq(primaryKey, primaryValue);

    if (error) {
      throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "削除に失敗しました";
    return Response.json({ error: message }, { status: 400 });
  }
}
