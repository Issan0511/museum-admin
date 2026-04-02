import "server-only";

import { cache } from "react";
import type {
  AdminChatSummaryRow,
  AdminChatAggregatesMonthlyRow,
  IntentCount,
  AdminKpiMonthlyRow,
} from "@/lib/dummyLogs";
import {
  adminChatAggregatesMonthly,
  adminChatSummaries,
  adminKpiMonthly,
} from "@/lib/dummyLogs";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  buildAvailableMonthOptions,
  buildMonthlyDashboardData,
  resolveLatestMonthSlug,
  type AvailableMonthOption,
  type MonthlyDashboardData,
} from "./data";

export const KPI_DB_CUTOFF_MONTH = "2026-03";
const CHAT_MONTHLY_SUMMARY_FUNCTION_URL =
  "https://lkgbfkyxcxykmgdqajhl.supabase.co/functions/v1/generate_chat_monthly_summary";

type DbKpiRow = {
  yyyymm: string | null;
  visits: number | string | null;
  lang_dist: unknown;
  age_dist: unknown;
  created_at: string | null;
  craft_accesses: unknown;
  craft_shop_clicks: unknown;
  total_shop_clicks: number | string | null;
  updated_at_date: string | null;
};

type DbChatAggregateRow = {
  yyyymm: string | null;
  volume_total: number | string | null;
  volume_by_craft: unknown;
  lang_ui_dist: unknown;
  top_intents_overall: unknown;
  top_intents_by_craft: unknown;
  updated_at: string | null;
  updated_at_date: string | null;
};

type DbChatSummaryMonthlyRow = {
  yyyymm: string | null;
  overall_summary: string | null;
  overall_summary_short: string | null;
  craft_summaries: unknown;
  model: string | null;
  prompt_version: string | null;
  generated_at: string | null;
  updated_at: string | null;
};

type DbCraftSummary = {
  summary?: unknown;
};

export type LogDashboardCollection = {
  monthlyDashboardData: Record<string, MonthlyDashboardData>;
  availableMonths: string[];
  availableMonthOptions: AvailableMonthOption[];
  latestMonth: string;
};

const MONTH_SLUG_PATTERN = /^\d{4}-\d{2}$/;
const previousMonthRollupJobs = new Map<string, Promise<void>>();

function isDbBackedMonth(month: string): boolean {
  return MONTH_SLUG_PATTERN.test(month) && month >= KPI_DB_CUTOFF_MONTH;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getPreviousMonthUtcSlug(baseDate = new Date()): string {
  const year = baseDate.getUTCFullYear();
  const monthIndex = baseDate.getUTCMonth() - 1;
  const previous = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));
  return `${previous.getUTCFullYear()}-${String(previous.getUTCMonth() + 1).padStart(2, "0")}`;
}

async function invokeRollupFunction(functionName: string, month: string) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? getRequiredEnv("SUPABASE_URL");
  await invokeFunctionByUrl(`${supabaseUrl}/functions/v1/${functionName}`, month);
}

async function invokeFunctionByUrl(url: string, month: string) {
  const serviceKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ month }),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Failed to invoke ${url} for ${month}: ${response.status} ${detail}`
    );
  }
}

async function ensurePreviousMonthRollups() {
  const targetMonth = getPreviousMonthUtcSlug();
  if (!isDbBackedMonth(targetMonth)) {
    return;
  }

  const existingJob = previousMonthRollupJobs.get(targetMonth);
  if (existingJob) {
    await existingJob;
    return;
  }

  const job = (async () => {
    try {
      const supabase = createServiceRoleClient();
      const [
        { data: existingKpiRow, error: kpiCheckError },
        { data: existingChatAggregateRow, error: chatCheckError },
        { data: existingChatSummaryRow, error: chatSummaryCheckError },
      ] = await Promise.all([
        supabase
          .from("admin_kpi_monthly")
          .select("yyyymm")
          .eq("yyyymm", targetMonth)
          .maybeSingle(),
        supabase
          .from("admin_chat_aggregates_monthly")
          .select("yyyymm")
          .eq("yyyymm", targetMonth)
          .maybeSingle(),
        supabase
          .from("admin_chat_summaries_monthly")
          .select("yyyymm")
          .eq("yyyymm", targetMonth)
          .maybeSingle(),
      ]);

      if (kpiCheckError) {
        throw kpiCheckError;
      }
      if (chatCheckError) {
        throw chatCheckError;
      }
      if (chatSummaryCheckError) {
        throw chatSummaryCheckError;
      }

      const tasks: Promise<void>[] = [];
      let chatAggregateEnsured = Boolean(existingChatAggregateRow);

      if (!existingKpiRow) {
        tasks.push(invokeRollupFunction("rollup_monthly", targetMonth));
      }

      if (!existingChatAggregateRow) {
        tasks.push(
          invokeRollupFunction("rollup_chat_monthly", targetMonth).then(() => {
            chatAggregateEnsured = true;
          })
        );
      }

      if (tasks.length > 0) {
        await Promise.all(tasks);
      }

      if (!existingChatSummaryRow && chatAggregateEnsured) {
        await invokeFunctionByUrl(CHAT_MONTHLY_SUMMARY_FUNCTION_URL, targetMonth);
      }
    } catch (error) {
      console.error(
        `Failed to ensure previous month rollups for ${targetMonth}. Continuing without auto-rollup.`,
        error
      );
    }
  })().finally(() => {
    previousMonthRollupJobs.delete(targetMonth);
  });

  previousMonthRollupJobs.set(targetMonth, job);
  await job;
}

function toNumber(value: unknown, fallback = 0): number {
  const number =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  return Number.isFinite(number) ? number : fallback;
}

function parseJsonValue<T>(value: unknown, fallback: T): T {
  if (value == null) {
    return fallback;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn("Failed to parse JSON field", value, error);
      return fallback;
    }
  }

  return value as T;
}

function toNumberRecord(value: unknown): Record<string, number> {
  const parsed = parseJsonValue<Record<string, unknown>>(value, {});

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }

  return Object.entries(parsed).reduce<Record<string, number>>((acc, [key, raw]) => {
    const number = toNumber(raw, Number.NaN);
    if (!Number.isNaN(number)) {
      acc[key] = number;
    }
    return acc;
  }, {});
}

function toIntentCounts(value: unknown): IntentCount[] {
  const parsed = parseJsonValue<unknown[]>(value, []);

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.reduce<IntentCount[]>((acc, item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return acc;
    }

    const record = item as Record<string, unknown>;
    const intent = record.intent;
    const count = record.count;

    if (typeof intent !== "string") {
      return acc;
    }

    acc.push({
      intent,
      count: toNumber(count),
    });
    return acc;
  }, []);
}

function toIntentCountsByCraft(value: unknown): Record<string, IntentCount[]> {
  const parsed = parseJsonValue<Record<string, unknown>>(value, {});

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }

  return Object.entries(parsed).reduce<Record<string, IntentCount[]>>(
    (acc, [craftId, raw]) => {
      acc[craftId] = toIntentCounts(raw);
      return acc;
    },
    {}
  );
}

function normalizeChatSummaryRows(
  row: DbChatSummaryMonthlyRow
): AdminChatSummaryRow[] {
  if (!row.yyyymm) {
    return [];
  }

  const createdAt = row.updated_at ?? row.generated_at ?? "";
  const modelVersion = row.model ?? "";
  const promptVersion = row.prompt_version ?? "";
  const dataHash = `${row.yyyymm}:${createdAt}`;
  const rows: AdminChatSummaryRow[] = [];

  const overallSummary = row.overall_summary ?? row.overall_summary_short ?? null;
  if (overallSummary) {
    rows.push({
      scope: { type: "overall", raw: "overall" },
      period: row.yyyymm,
      summaryMd: overallSummary,
      recommendations: [],
      dataHash,
      modelVersion,
      promptVersion,
      createdAt,
    });
  }

  const craftSummaries = parseJsonValue<Record<string, DbCraftSummary>>(
    row.craft_summaries,
    {}
  );

  for (const [craftId, item] of Object.entries(craftSummaries)) {
    const craftIdNumber = Number(craftId);
    if (Number.isNaN(craftIdNumber)) {
      continue;
    }

    const summary = typeof item?.summary === "string" ? item.summary : null;
    if (!summary) {
      continue;
    }

    rows.push({
      scope: { type: "craft", craftId: craftIdNumber, raw: `craft:${craftId}` },
      period: row.yyyymm,
      summaryMd: summary,
      recommendations: [],
      dataHash: `${dataHash}:craft:${craftId}`,
      modelVersion,
      promptVersion,
      createdAt,
    });
  }

  return rows;
}

function normalizeKpiRow(row: DbKpiRow): AdminKpiMonthlyRow | null {
  if (!row.yyyymm) {
    return null;
  }

  return {
    yyyymm: row.yyyymm,
    visits: toNumber(row.visits),
    langDist: toNumberRecord(row.lang_dist),
    ageDist: toNumberRecord(row.age_dist),
    createdAt: row.created_at ?? row.updated_at_date ?? "",
    craftAccesses: toNumberRecord(row.craft_accesses),
    craftShopClicks: toNumberRecord(row.craft_shop_clicks),
    totalShopClicks:
      row.total_shop_clicks == null ? null : toNumber(row.total_shop_clicks),
  };
}

function normalizeChatAggregateRow(
  row: DbChatAggregateRow
): AdminChatAggregatesMonthlyRow | null {
  if (!row.yyyymm) {
    return null;
  }

  return {
    yyyymm: row.yyyymm,
    volumeTotal: toNumber(row.volume_total),
    volumeByCraft: toNumberRecord(row.volume_by_craft),
    langUiDist: toNumberRecord(row.lang_ui_dist),
    topIntentsOverall: toIntentCounts(row.top_intents_overall),
    topIntentsByCraft: toIntentCountsByCraft(row.top_intents_by_craft),
    updatedAt: row.updated_at ?? row.updated_at_date ?? "",
  };
}

function mergeByMonth<T extends { yyyymm: string }>(
  legacyRows: T[],
  dbRows: T[]
): T[] {
  return [...legacyRows.filter((row) => !isDbBackedMonth(row.yyyymm)), ...dbRows];
}

async function fetchDbKpiRows(): Promise<AdminKpiMonthlyRow[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("admin_kpi_monthly")
      .select(
        "yyyymm, visits, lang_dist, age_dist, created_at, craft_accesses, craft_shop_clicks, total_shop_clicks, updated_at_date"
      )
      .gte("yyyymm", KPI_DB_CUTOFF_MONTH)
      .order("yyyymm", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? [])
      .map((row) => normalizeKpiRow(row as DbKpiRow))
      .filter((row): row is AdminKpiMonthlyRow => row !== null);
  } catch (error) {
    console.error("Failed to fetch admin_kpi_monthly. Falling back to dummy data.", error);
    return [];
  }
}

async function fetchDbChatAggregateRows(): Promise<AdminChatAggregatesMonthlyRow[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("admin_chat_aggregates_monthly")
      .select(
        "yyyymm, volume_total, volume_by_craft, lang_ui_dist, top_intents_overall, top_intents_by_craft, updated_at, updated_at_date"
      )
      .gte("yyyymm", KPI_DB_CUTOFF_MONTH)
      .order("yyyymm", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? [])
      .map((row) => normalizeChatAggregateRow(row as DbChatAggregateRow))
      .filter((row): row is AdminChatAggregatesMonthlyRow => row !== null);
  } catch (error) {
    console.error(
      "Failed to fetch admin_chat_aggregates_monthly. Falling back to dummy data.",
      error
    );
    return [];
  }
}

async function fetchDbChatSummaryRows(): Promise<AdminChatSummaryRow[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("admin_chat_summaries_monthly")
      .select(
        "yyyymm, overall_summary, overall_summary_short, craft_summaries, model, prompt_version, generated_at, updated_at"
      )
      .gte("yyyymm", KPI_DB_CUTOFF_MONTH)
      .order("yyyymm", { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).flatMap((row) =>
      normalizeChatSummaryRows(row as DbChatSummaryMonthlyRow)
    );
  } catch (error) {
    console.error(
      "Failed to fetch admin_chat_summaries_monthly. Falling back to dummy data.",
      error
    );
    return [];
  }
}

function mergeSummaryRows(
  legacyRows: AdminChatSummaryRow[],
  dbRows: AdminChatSummaryRow[]
) {
  return [...legacyRows.filter((row) => !isDbBackedMonth(row.period)), ...dbRows];
}

export const getLogDashboardCollection = cache(async (): Promise<LogDashboardCollection> => {
  await ensurePreviousMonthRollups();

  const [dbKpiRows, dbChatAggregateRows, dbChatSummaryRows] = await Promise.all([
    fetchDbKpiRows(),
    fetchDbChatAggregateRows(),
    fetchDbChatSummaryRows(),
  ]);

  const monthlyDashboardData = buildMonthlyDashboardData({
    kpiRows: mergeByMonth(adminKpiMonthly, dbKpiRows),
    chatAggregateRows: mergeByMonth(adminChatAggregatesMonthly, dbChatAggregateRows),
    chatSummaryRows: mergeSummaryRows(adminChatSummaries, dbChatSummaryRows),
  });

  const availableMonths = Object.keys(monthlyDashboardData).sort();

  return {
    monthlyDashboardData,
    availableMonths,
    availableMonthOptions: buildAvailableMonthOptions(monthlyDashboardData),
    latestMonth: resolveLatestMonthSlug(availableMonths, new Date()),
  };
});

export async function getLogDashboardMonthData(month: string) {
  const collection = await getLogDashboardCollection();

  return {
    ...collection,
    data: collection.monthlyDashboardData[month] ?? null,
  };
}
