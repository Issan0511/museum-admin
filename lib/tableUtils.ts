export function mergeColumns(
  metadataColumns: string[],
  rows: Record<string, unknown>[]
) {
  const set = new Set(metadataColumns);
  const excludeColumns = ['created_at', 'updated_at']; // システムカラムを除外
  
  rows.forEach((row) => {
    Object.keys(row ?? {}).forEach((key) => {
      if (!excludeColumns.includes(key)) {
        set.add(key);
      }
    });
  });
  return Array.from(set);
}

export function inferPrimaryKey(columns: string[]) {
  if (columns.length === 0) {
    return "id";
  }

  const lowerColumns = columns.map((col) => col.toLowerCase());
  const idIndex = lowerColumns.indexOf("id");
  if (idIndex !== -1) {
    return columns[idIndex];
  }

  const uuidIndex = lowerColumns.indexOf("uuid");
  if (uuidIndex !== -1) {
    return columns[uuidIndex];
  }

  return columns[0];
}

