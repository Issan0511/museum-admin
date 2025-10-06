"use client";

import { useMemo, useState } from "react";

type CalendarRow = Record<string, any> & {
  demo_date?: string | null;
  template_id?: number | string | null;
};

type DemoTemplate = {
  id: number;
  name_ja: string | null;
  name_en?: string | null;
};

type FormState = {
  mode: "idle" | "editing" | "creating";
  primaryValue?: string | number | null;
  values: {
    demo_date: string;
    template_id: string;
  };
};

type ModalState = {
  isOpen: boolean;
  dateKey?: string;
  existingEvent?: CalendarRow;
};

type CalendarTableEditorProps = {
  tableName: string;
  primaryKey: string;
  initialRows: CalendarRow[];
  templates: DemoTemplate[];
};

const DAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

function parseDateParts(value: string | null | undefined) {
  if (!value) return null;
  const directMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (directMatch) {
    return {
      year: Number(directMatch[1]),
      month: Number(directMatch[2]),
      day: Number(directMatch[3]),
    };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return {
    year: parsed.getFullYear(),
    month: parsed.getMonth() + 1,
    day: parsed.getDate(),
  };
}

function formatDateKeyFromParts(parts: { year: number; month: number; day: number }) {
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

function toDateKey(value: string | null | undefined) {
  const parts = parseDateParts(value);
  if (!parts) return null;
  return formatDateKeyFromParts(parts);
}

function toDateInputValue(value: string | null | undefined) {
  const key = toDateKey(value);
  return key ?? "";
}

function createDateFromParts(parts: { year: number; month: number; day: number }) {
  return new Date(parts.year, parts.month - 1, parts.day);
}

function formatDisplayDate(value: string | null | undefined) {
  const parts = parseDateParts(value);
  if (!parts) return "";
  const date = createDateFromParts(parts);
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
  return formatter.format(date);
}

function normalizeTemplateId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type CalendarDay = {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  isToday: boolean;
};

function buildCalendarDays(monthAnchor: Date): CalendarDay[] {
  const startOfMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), 1);
  const startOffset = startOfMonth.getDay();
  const gridStart = new Date(startOfMonth);
  gridStart.setDate(startOfMonth.getDate() - startOffset);

  const today = new Date();

  return Array.from({ length: 42 }, (_, index) => {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);
    return {
      date: current,
      key: formatDateKey(current),
      isCurrentMonth: current.getMonth() === monthAnchor.getMonth(),
      isToday: isSameDay(current, today),
    };
  });
}

export default function CalendarTableEditor({
  tableName,
  primaryKey,
  initialRows,
  templates,
}: CalendarTableEditorProps) {
  const [rows, setRows] = useState<CalendarRow[]>(initialRows);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (rows.length > 0) {
      const firstDateKey = toDateKey(rows[0]?.demo_date);
      if (firstDateKey) {
        const parts = parseDateParts(firstDateKey);
        if (parts) {
          return new Date(parts.year, parts.month - 1, 1);
        }
      }
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [formState, setFormState] = useState<FormState>({
    mode: "idle",
    values: {
      demo_date: "",
      template_id: templates.length > 0 ? String(templates[0].id) : "",
    },
  });
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templateMap = useMemo(() => {
    return new Map<number, DemoTemplate>(
      templates.map((template) => [template.id, template])
    );
  }, [templates]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarRow[]>();
    rows.forEach((row) => {
      const key = toDateKey(row.demo_date ?? null);
      if (!key) return;
      const list = map.get(key) ?? [];
      list.push(row);
      list.sort((a, b) => {
        const templateIdA = normalizeTemplateId(a.template_id) ?? Infinity;
        const templateIdB = normalizeTemplateId(b.template_id) ?? Infinity;
        const nameA = templateMap.get(templateIdA)?.name_ja ?? "";
        const nameB = templateMap.get(templateIdB)?.name_ja ?? "";
        if (nameA && nameB) return nameA.localeCompare(nameB, "ja");
        if (nameA) return -1;
        if (nameB) return 1;
        return templateIdA - templateIdB;
      });
      map.set(key, list);
    });
    return map;
  }, [rows, templateMap]);

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const keyA = toDateKey(a.demo_date ?? null);
      const keyB = toDateKey(b.demo_date ?? null);
      if (!keyA && !keyB) return 0;
      if (!keyA) return 1;
      if (!keyB) return -1;
      return keyA.localeCompare(keyB);
    });
  }, [rows]);

  const resetForm = () => {
    setFormState({
      mode: "idle",
      values: {
        demo_date: "",
        template_id: templates.length > 0 ? String(templates[0].id) : "",
      },
    });
  };

  const openModal = (dateKey?: string, existingEvent?: CalendarRow) => {
    if (existingEvent) {
      // 既存のイベントを編集
      const pkValue = existingEvent[primaryKey] ?? null;
      const templateId = normalizeTemplateId(existingEvent.template_id);
      setFormState({
        mode: "editing",
        primaryValue: pkValue,
        values: {
          demo_date: toDateInputValue(existingEvent.demo_date ?? null),
          template_id: templateId !== null ? String(templateId) : "",
        },
      });
    } else {
      // 新規作成
      setFormState({
        mode: "creating",
        values: {
          demo_date: dateKey ?? "",
          template_id: templates.length > 0 ? String(templates[0].id) : "",
        },
      });
    }
    setModalState({
      isOpen: true,
      dateKey,
      existingEvent,
    });
    setMessage(null);
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
    });
    resetForm();
  };

  const startCreate = (dateKey?: string) => {
    setFormState({
      mode: "creating",
      values: {
        demo_date: dateKey ?? "",
        template_id: templates.length > 0 ? String(templates[0].id) : "",
      },
    });
    setMessage(null);
  };

  const startEdit = (row: CalendarRow) => {
    const pkValue = row[primaryKey] ?? null;
    const templateId = normalizeTemplateId(row.template_id);
    setFormState({
      mode: "editing",
      primaryValue: pkValue,
      values: {
        demo_date: toDateInputValue(row.demo_date ?? null),
        template_id: templateId !== null ? String(templateId) : "",
      },
    });
    setMessage(null);
  };

  const handleChange = (field: keyof FormState["values"], value: string) => {
    setFormState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
    }));
  };

  const submitForm = async () => {
    if (formState.mode === "idle") return;

    if (!formState.values.demo_date) {
      setMessage("デモ日を選択してください。");
      return;
    }

    const templateId = normalizeTemplateId(formState.values.template_id);
    if (templateId === null) {
      setMessage("実演を選択してください。");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const method = formState.mode === "creating" ? "POST" : "PUT";
      const payload = {
        primaryKey,
        primaryValue: formState.primaryValue,
        values: {
          demo_date: formState.values.demo_date,
          template_id: templateId,
        },
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

      setMessage(formState.mode === "creating" ? "予定を追加しました。" : "予定を更新しました。");
      closeModal();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (row: CalendarRow) => {
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

      setRows((prev) => prev.filter((current) => current[primaryKey] !== primaryValue));
      setMessage("予定を削除しました。");
      closeModal();
    } catch (error) {
      console.error(error);
      setMessage(error instanceof Error ? error.message : "エラーが発生しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const editingKey =
    formState.mode === "editing" && formState.primaryValue !== undefined && formState.primaryValue !== null
      ? String(formState.primaryValue)
      : null;

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const monthLabel = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
  }).format(currentMonth);

  return (
    <div className="space-y-6">
      <div className="rounded border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">カレンダー表示</h2>
            <p className="text-sm text-slate-600">クリックで予定の追加・編集ができます。</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              onClick={goToPreviousMonth}
            >
              ← 前の月
            </button>
            <div className="min-w-[120px] text-center text-sm font-medium text-slate-700">{monthLabel}</div>
            <button
              type="button"
              className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
              onClick={goToNextMonth}
            >
              次の月 →
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2 text-xs font-medium text-slate-500">
          {DAY_LABELS.map((label) => (
            <div key={label} className="text-center">
              {label}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2 text-xs">
          {calendarDays.map((day) => {
            const events = eventsByDate.get(day.key) ?? [];
            return (
              <div
                key={day.key}
                className={`flex min-h-[120px] flex-col rounded border p-2 ${
                  day.isCurrentMonth ? "border-slate-200 bg-slate-50" : "border-slate-100 bg-white text-slate-300"
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-medium ${day.isCurrentMonth ? "text-slate-700" : "text-slate-400"}`}>
                    {day.date.getDate()}
                  </span>
                  {day.isToday && <span className="rounded bg-emerald-100 px-1 py-px text-[10px] text-emerald-700">今日</span>}
                </div>
                <div className="mt-2 flex-1 space-y-1">
                  {events.map((event) => {
                    const pkValue = event[primaryKey];
                    const eventKey = pkValue !== undefined && pkValue !== null ? String(pkValue) : JSON.stringify(event);
                    const templateId = normalizeTemplateId(event.template_id);
                    const templateName = templateId !== null ? templateMap.get(templateId)?.name_ja : undefined;
                    return (
                      <button
                        key={eventKey}
                        type="button"
                        className="w-full truncate rounded bg-emerald-100 px-2 py-1 text-left text-[11px] font-medium text-emerald-700 hover:bg-emerald-200"
                        onClick={() => startEdit(event)}
                        disabled={isSubmitting}
                      >
                        {templateName || (templateId !== null ? `ID: ${templateId}` : "実演未設定")}
                      </button>
                    );
                  })}
                </div>
                {events.length > 0 ? (
                  <button
                    type="button"
                    className="mt-2 w-full rounded border border-dashed border-blue-300 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                    onClick={() => openModal(day.key, events[0])}
                    disabled={isSubmitting || templates.length === 0}
                  >
                    変更
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mt-2 w-full rounded border border-dashed border-emerald-300 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                    onClick={() => openModal(day.key)}
                    disabled={isSubmitting || templates.length === 0}
                  >
                    追加
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {message && (
        <p className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">{message}</p>
      )}

      {/* モーダル */}
      {modalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={closeModal}>
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold">
              {formState.mode === "creating" ? "予定の追加" : "変更"}
            </h3>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="modal-date" className="text-sm font-medium text-slate-700">
                  日付
                </label>
                <input
                  id="modal-date"
                  type="date"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  value={formState.values.demo_date}
                  onChange={(event) => handleChange("demo_date", event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label htmlFor="modal-template" className="text-sm font-medium text-slate-700">
                  実演
                </label>
                <select
                  id="modal-template"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  value={formState.values.template_id}
                  onChange={(event) => handleChange("template_id", event.target.value)}
                  disabled={isSubmitting || templates.length === 0}
                >
                  {templates.length === 0 ? (
                    <option value="">登録可能な実演がありません</option>
                  ) : (
                    templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name_ja ?? `ID: ${template.id}`}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:bg-emerald-300"
                  onClick={submitForm}
                  disabled={isSubmitting}
                >
                  {formState.mode === "creating" ? "追加" : "保存"}
                </button>
                <button
                  type="button"
                  className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  キャンセル
                </button>
              </div>
              {formState.mode === "editing" && modalState.existingEvent && (
                <button
                  type="button"
                  className="w-full rounded border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  onClick={() => {
                    if (modalState.existingEvent) {
                      handleDelete(modalState.existingEvent);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  削除
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
