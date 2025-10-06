const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;

// テーブル名からStorageバケット名へのマッピング
const TABLE_TO_BUCKET_MAP: Record<string, string> = {
  crafts: "craft_images",
  demo_templates: "demo_images",
  events: "event_images",
};

/**
 * テーブル名とIDから画像URLを生成
 * @param tableName テーブル名
 * @param id レコードのID
 * @returns 画像のパブリックURL（バケットが存在しない場合はnull）
 */
export function getImageUrl(tableName: string, id: string | number): string | null {
  const bucketName = TABLE_TO_BUCKET_MAP[tableName];
  
  if (!bucketName || !SUPABASE_URL) {
    return null;
  }

  // Supabase StorageのパブリックURLフォーマット
  // キャッシュバスティングのためにタイムスタンプを追加
  return `${SUPABASE_URL}/storage/v1/object/public/${bucketName}/${id}.png?t=${Date.now()}`;
}

/**
 * テーブル名が画像をサポートしているかチェック
 */
export function hasImageSupport(tableName: string): boolean {
  return tableName in TABLE_TO_BUCKET_MAP;
}

/**
 * テーブル名からバケット名を取得
 */
export function getBucketName(tableName: string): string | null {
  return TABLE_TO_BUCKET_MAP[tableName] || null;
}
