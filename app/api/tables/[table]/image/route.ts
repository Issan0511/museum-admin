import { NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getBucketName } from "@/lib/imageUtils";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const primaryValue = formData.get('primaryValue') as string | null;

    if (!file) {
      return Response.json({ error: "ファイルが選択されていません" }, { status: 400 });
    }

    if (!primaryValue) {
      return Response.json({ error: "主キーの値が必要です" }, { status: 400 });
    }

    const bucketName = getBucketName(params.table);
    if (!bucketName) {
      return Response.json({ error: "このテーブルは画像をサポートしていません" }, { status: 400 });
    }

    // ファイルをバッファに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const client = createServiceRoleClient();
    const fileName = `${primaryValue}.png`;

    // 既存の画像を削除（存在する場合）
    await client.storage.from(bucketName).remove([fileName]);

    // 新しい画像をアップロード
    const { error: uploadError } = await client.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type || 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    return Response.json({ 
      success: true,
      message: "画像をアップロードしました"
    });
  } catch (error) {
    console.error('Image upload error:', error);
    const message = error instanceof Error ? error.message : "画像のアップロードに失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { table: string } }
) {
  try {
    const { primaryValue } = await request.json();

    if (!primaryValue) {
      return Response.json({ error: "主キーの値が必要です" }, { status: 400 });
    }

    const bucketName = getBucketName(params.table);
    if (!bucketName) {
      return Response.json({ error: "このテーブルは画像をサポートしていません" }, { status: 400 });
    }

    const client = createServiceRoleClient();
    const fileName = `${primaryValue}.png`;

    const { error } = await client.storage.from(bucketName).remove([fileName]);

    if (error) {
      console.error('Delete error:', error);
      throw error;
    }

    return Response.json({ 
      success: true,
      message: "画像を削除しました"
    });
  } catch (error) {
    console.error('Image delete error:', error);
    const message = error instanceof Error ? error.message : "画像の削除に失敗しました";
    return Response.json({ error: message }, { status: 500 });
  }
}
