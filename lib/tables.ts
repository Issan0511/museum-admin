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
      "display_order",
      "slug",
      "name_ja",
      "name_en",
      "name_zh",
      "name_ko",
      "name_fr",
      "name_es",
      "kana",
      "summary_ja",
      "summary_en",
      "summary_zh",
      "summary_ko",
      "summary_fr",
      "summary_es",
      "description_ja",
      "description_en",
      "description_zh",
      "description_ko",
      "description_fr",
      "description_es",
      "youtube_id",
      "shop_collection",
      "details_path",
      "details_format",
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
      "name_ko",
      "name_fr",
      "name_es",
      "start_date",
      "end_date",
      "detail_ja",
      "detail_en",
      "detail_zh",
      "detail_ko",
      "detail_fr",
      "detail_es",
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
      "name_ko",
      "name_fr",
      "name_es",
      "description_ja",
      "description_en",
      "description_zh",
      "description_ko",
      "description_fr",
      "description_es",
    ],
  },
];

export function getAvailableTables(): TableMetadata[] {
  return TABLES.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function getTableMetadata(tableName: string): TableMetadata | undefined {
  return TABLES.find((table) => table.tableName === tableName);
}
