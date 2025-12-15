import { NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// craftsテーブル用のバケット名
const MARKDOWN_BUCKET = 'craft_texts';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    // craftsテーブルのみサポート
    if (table !== 'crafts') {
      return Response.json({ error: "このテーブルはマークダウンファイルをサポートしていません" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const primaryValue = formData.get('primaryValue') as string | null;

    if (!file) {
      return Response.json({ error: "ファイルが選択されていません" }, { status: 400 });
    }

    if (!primaryValue) {
      return Response.json({ error: "主キーの値が必要です" }, { status: 400 });
    }

    // マークダウンファイルかチェック
    if (!file.name.endsWith('.md') && file.type !== 'text/markdown') {
      return Response.json({ error: "マークダウンファイル(.md)を選択してください" }, { status: 400 });
    }

    // ファイルをバッファに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const client = createServiceRoleClient();
    const fileName = `${primaryValue}.md`;

    // 既存のファイルを削除（存在する場合）
    await client.storage.from(MARKDOWN_BUCKET).remove([fileName]);

    // 新しいファイルをアップロード
    const { error: uploadError } = await client.storage
      .from(MARKDOWN_BUCKET)
      .upload(fileName, buffer, {
        contentType: 'text/markdown',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    return Response.json({ 
      success: true,
      message: "マークダウンファイルをアップロードしました"
    });
  } catch (error) {
    console.error('Markdown upload error:', error);
    const message = error instanceof Error ? error.message : "マークダウンファイルのアップロードに失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    // craftsテーブルのみサポート
    if (table !== 'crafts') {
      return Response.json({ error: "このテーブルはマークダウンファイルをサポートしていません" }, { status: 400 });
    }

    const { primaryValue } = await request.json();

    if (!primaryValue) {
      return Response.json({ error: "主キーの値が必要です" }, { status: 400 });
    }

    const client = createServiceRoleClient();
    const fileName = `${primaryValue}.md`;

    const { error } = await client.storage.from(MARKDOWN_BUCKET).remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    return Response.json({ 
      success: true,
      message: "マークダウンファイルを削除しました"
    });
  } catch (error) {
    console.error('Markdown delete error:', error);
    const message = error instanceof Error ? error.message : "マークダウンファイルの削除に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}

// マークダウンファイルの内容を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    // craftsテーブルのみサポート
    if (table !== 'crafts') {
      return Response.json({ error: "このテーブルはマークダウンファイルをサポートしていません" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const primaryValue = searchParams.get('primaryValue');

    if (!primaryValue) {
      return Response.json({ error: "主キーの値が必要です" }, { status: 400 });
    }

    const client = createServiceRoleClient();
    const fileName = `${primaryValue}.md`;

    const { data, error } = await client.storage
      .from(MARKDOWN_BUCKET)
      .download(fileName);

    if (error) {
      if (error.message.includes('not found')) {
        return Response.json({ exists: false }, { status: 404 });
      }
      throw error;
    }

    const text = await data.text();

    return Response.json({ 
      exists: true,
      content: text
    });
  } catch (error) {
    console.error('Markdown get error:', error);
    const message = error instanceof Error ? error.message : "マークダウンファイルの取得に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}
