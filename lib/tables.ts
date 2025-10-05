import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export type TableMetadata = {
  tableName: string;
  csvPath: string;
  columns: string[];
};

const CSV_DIR = path.join(process.cwd(), "csvs");

export function getAvailableTables(): TableMetadata[] {
  if (!fs.existsSync(CSV_DIR)) {
    return [];
  }

  return fs
    .readdirSync(CSV_DIR)
    .filter((file) => file.endsWith("_rows.csv"))
    .map((file) => {
      const tableName = file.replace(/_rows\\.csv$/i, "");
      const csvPath = path.join(CSV_DIR, file);
      const fileContents = fs.readFileSync(csvPath, "utf-8");
      const [header] = parse(fileContents, {
        bom: true,
        columns: false,
        skip_empty_lines: true,
        to_line: 1,
      }) as string[][];
      const columns = header ?? [];

      return { tableName, csvPath, columns } satisfies TableMetadata;
    })
    .sort((a, b) => a.tableName.localeCompare(b.tableName));
}

export function getTableMetadata(tableName: string): TableMetadata | undefined {
  const tables = getAvailableTables();
  return tables.find((table) => table.tableName === tableName);
}
