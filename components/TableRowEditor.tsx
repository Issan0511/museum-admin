"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Row = Record<string, any>;

type TableRowEditorProps = {
  tableName: string;
  columns: string[];
  primaryKey: string;
  initialValues: Row;
  mode: "create" | "edit";
  primaryValue?: string | number | null;
};

function buildInitialValues(columns: string[], initialValues: Row) {
  return columns.reduce<Row>((acc, column) => {
    acc[column] = initialValues[column] ?? "";
    return acc;
  }, {});
}

export default function TableRowEditor({
  tableName,
  columns,
  primaryKey,
  initialValues,
  mode,
  primaryValue,
}: TableRowEditorProps) {
  const router = useRouter();
  const sortedColumns = useMemo(() => {
    const unique = Array.from(new Set(columns));
    if (!unique.includes(primaryKey)) {
      unique.unshift(primaryKey);
    }
    return unique;
  }, [columns, primaryKey]);
  const [values, setValues] = useState<Row>(() =>
    buildInitialValues(sortedColumns, initialValues)
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (column: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  useEffect(() => {
    setValues(buildInitialValues(sortedColumns, initialValues));
  }, [initialValues, sortedColumns]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const method = mode === "create" ? "POST" : "PUT";
      const payload = {
        primaryKey,
        primaryValue,
        values,
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

      setMessage("保存しました。");
      setValues(buildInitialValues(sortedColumns, data ?? values));

      if (mode === "create" && data && data[primaryKey] !== undefined) {
        const newPrimaryValue = data[primaryKey];
        router.replace(
          `/${tableName}/${encodeURIComponent(String(newPrimaryValue))}`
        );
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "エラーが発生しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (primaryValue === undefined || primaryValue === null) {
      setError(`${primaryKey} が見つからないため削除できません。`);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

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

      setMessage("削除しました。");
      router.replace(`/${tableName}`);
      router.refresh();
    } catch (deleteError) {
      console.error(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "エラーが発生しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {sortedColumns.map((column) => {
            const inputId = `${column}-input`;
            return (
              <div key={column} className="space-y-1">
                <label
                  htmlFor={inputId}
                  className="block text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  {column}
                </label>
                <input
                  id={inputId}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={values[column] ?? ""}
                  onChange={(event) => handleChange(column, event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:bg-indigo-300"
          disabled={isSubmitting}
        >
          保存
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${tableName}`)}
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          disabled={isSubmitting}
        >
          一覧に戻る
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            disabled={isSubmitting}
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
}
