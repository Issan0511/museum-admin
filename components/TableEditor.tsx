"use client";

import { useMemo, useState } from "react";

type Row = Record<string, any>;

type TableEditorProps = {
  tableName: string;
  columns: string[];
  primaryKey: string;
  initialRows: Row[];
};

type FormState = {
  mode: "idle" | "editing" | "creating";
  primaryValue?: string | number | null;
  values: Row;
};

function createEmptyRow(columns: string[]) {
  return columns.reduce<Row>((acc, column) => {
    acc[column] = "";
    return acc;
  }, {});
}

export default function TableEditor({
  tableName,
  columns,
  primaryKey,
  initialRows,
}: TableEditorProps) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [formState, setFormState] = useState<FormState>({
    mode: "idle",
    values: createEmptyRow(columns),
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedColumns = useMemo(() => {
    const unique = Array.from(new Set(columns));
    if (!unique.includes(primaryKey)) {
      unique.unshift(primaryKey);
    }
    return unique;
  }, [columns, primaryKey]);

  const resetForm = () => {
    setFormState({ mode: "idle", values: createEmptyRow(sortedColumns) });
  };

  const startCreate = () => {
    setFormState({ mode: "creating", values: createEmptyRow(sortedColumns) });
    setMessage(null);
  };

  const startEdit = (row: Row) => {
    const pkValue = row[primaryKey] ?? null;
    setFormState({
      mode: "editing",
      primaryValue: pkValue,
      values: sortedColumns.reduce<Row>((acc, column) => {
        acc[column] = row[column] ?? "";
        return acc;
      }, {}),
    });
    setMessage(null);
  };

  const handleChange = (column: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [column]: value,
      },
    }));
  };

  const submitForm = async () => {
    if (formState.mode === "idle") return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const method = formState.mode === "creating" ? "POST" : "PUT";
      const payload = {
        primaryKey,
        primaryValue: formState.primaryValue,
        values: formState.values,
      };

      const response = await fetch(`/api/tables/${tableName}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? response.statusText);
      }

      const { data } = await response.json();

      setRows((prev) => {
        if (formState.mode === "creating") {
          return [...prev, data];
        }
        return prev.map((row) =>
          row[primaryKey] === formState.primaryValue ? { ...row, ...data } : row
        );
      });

      setMessage("保存しました。");
      resetForm();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row: Row) => {
    const primaryValue = row[primaryKey];
    if (primaryValue === undefined || primaryValue === null) {
      setMessage(`この行は削除できません (${primaryKey} が見つかりません)。`);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/tables/${tableName}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryKey, primaryValue }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? response.statusText);
      }

      setRows((prev) =>
        prev.filter((current) => current[primaryKey] !== primaryValue)
      );
      setMessage("削除しました。");
      resetForm();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">レコード</h2>
        <button
          type="button"
          className="rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:bg-indigo-300"
          onClick={startCreate}
          disabled={isSubmitting}
        >
          新規追加
        </button>
      </div>

      {message && (
        <p className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          {message}
        </p>
      )}

      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-100">
            <tr>
              {sortedColumns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-3 py-2 text-left font-medium uppercase tracking-wide text-slate-600"
                >
                  {column}
                </th>
              ))}
              <th className="px-3 py-2 text-left font-medium uppercase tracking-wide text-slate-600">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => {
              const primaryValue = row[primaryKey];
              const key =
                primaryValue !== undefined && primaryValue !== null
                  ? `${primaryValue}`
                  : JSON.stringify(row);
              const isEditing =
                formState.mode === "editing" &&
                formState.primaryValue === primaryValue;
              return (
                <tr key={key} className="odd:bg-slate-50">
                  {sortedColumns.map((column) => (
                    <td key={column} className="px-3 py-2 align-top">
                      {isEditing ? (
                        <input
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
                          value={formState.values[column] ?? ""}
                          onChange={(event) =>
                            handleChange(column, event.target.value)
                          }
                          disabled={isSubmitting}
                        />
                      ) : (
                        <span className="whitespace-pre-wrap text-slate-700">
                          {String(row[column] ?? "")}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2 align-top">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                          onClick={submitForm}
                          disabled={isSubmitting}
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          onClick={resetForm}
                          disabled={isSubmitting}
                        >
                          キャンセル
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                          onClick={() => startEdit(row)}
                          disabled={isSubmitting}
                        >
                          編集
                        </button>
                        <button
                          type="button"
                          className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                          onClick={() => handleDelete(row)}
                          disabled={isSubmitting}
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            {formState.mode === "creating" && (
              <tr className="bg-emerald-50">
                {sortedColumns.map((column) => (
                  <td key={column} className="px-3 py-2 align-top">
                    <input
                      className="w-full rounded border border-emerald-300 px-2 py-1 text-sm"
                      value={formState.values[column] ?? ""}
                      onChange={(event) => handleChange(column, event.target.value)}
                      disabled={isSubmitting}
                    />
                  </td>
                ))}
                <td className="px-3 py-2 align-top">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                      onClick={submitForm}
                      disabled={isSubmitting}
                    >
                      追加
                    </button>
                    <button
                      type="button"
                      className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      キャンセル
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {rows.length === 0 && formState.mode !== "creating" && (
              <tr>
                <td
                  colSpan={sortedColumns.length + 1}
                  className="px-3 py-6 text-center text-sm text-slate-500"
                >
                  レコードがありません。新規追加ボタンから作成してください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
