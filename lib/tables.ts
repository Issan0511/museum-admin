export type TableMetadata = {
  tableName: string;
  displayName: string;
  columns: string[];
};

// CSVファイルに基づいて手動でテーブル定義
const TABLES: TableMetadata[] = [
  {
    tableName: "calendar",
    displayName: "カレンダー",
    columns: ["demo_date", "template_id"],
  },
  {
    tableName: "crafts",
    displayName: "工芸品",
    columns: [
      "id",
      "slug",
      "name_ja",
      "name_en",
      "name_zh",
      "kana",
      "summary_ja",
      "summary_en",
      "summary_zh",
      "description_ja",
      "description_en",
      "description_zh",
      "youtube_id",
      "shop_collection",
      "details_path",
      "details_format",
      "created_at",
    ],
  },
  {
    tableName: "events",
    displayName: "イベント",
    columns: [
      "id",
      "name_ja",
      "name_en",
      "name_zh",
      "start_date",
      "end_date",
      "detail_ja",
      "detail_en",
      "detail_zh",
      "created_at",
    ],
  },
  {
    tableName: "demo_templates",
    displayName: "デモテンプレート",
    columns: [
      "id",
      "name_ja",
      "name_en",
      "name_zh",
      "img",
      "description_ja",
      "description_en",
      "description_zh",
      "created_at",
    ],
  },
];

export function getAvailableTables(): TableMetadata[] {
  return TABLES.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function getTableMetadata(tableName: string): TableMetadata | undefined {
  return TABLES.find((table) => table.tableName === tableName);
}
