export type LanguageDistribution = Record<string, number>;

export type AdminKpiMonthlyRow = {
  yyyymm: string;
  visits: number;
  langDist: LanguageDistribution;
  ageDist: Record<string, number>;
  createdAt: string;
  craftAccesses: Record<string, number>;
  craftShopClicks: Record<string, number>;
  totalShopClicks: number | null;
};

export type KeywordCount = {
  keyword: string;
  count: number;
};

export type IntentCount = {
  intent: string;
  count: number;
};

export type SampleQuestion = {
  question: string;
};

export type AdminChatAggregatesMonthlyRow = {
  yyyymm: string;
  volumeTotal: number;
  volumeByCraft: Record<string, number>;
  langUiDist: LanguageDistribution;
  topIntentsOverall: IntentCount[];
  topIntentsByCraft: Record<string, IntentCount[]>;
  updatedAt: string;
};

export type SummaryScope =
  | { type: "overall"; raw: string }
  | { type: "craft"; craftId: number; raw: string };

export type AdminChatSummaryRow = {
  scope: SummaryScope;
  period: string;
  summaryMd: string;
  recommendations: string[];
  dataHash: string;
  modelVersion: string;
  promptVersion: string;
  createdAt: string;
};

type RawKpiRow = {
  yyyymm: string;
  visits: string;
  lang_dist: string;
  age_dist: string;
  created_at: string;
  craft_accesses: string;
  craft_shop_clicks: string;
  total_shop_clicks: number | null;
};

type RawChatAggregateRow = {
  yyyymm: string;
  volume_total: string;
  volume_by_craft: string;
  lang_ui_dist: string;
  top_intents_overall: string;
  top_intents_by_craft: string;
  updated_at: string;
};

type RawChatSummaryRow = {
  scope: string;
  period: string;
  summary_md: string;
  recommendations_md: string;
  data_hash: string;
  model_version: string;
  prompt_version: string;
  created_at: string;
};

function parseJsonField<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn("Failed to parse JSON field", value, error);
    return fallback;
  }
}

function parseScope(scope: string): SummaryScope {
  if (scope === "overall") {
    return { type: "overall", raw: scope };
  }

  if (scope.startsWith("craft:")) {
    const craftId = Number(scope.split(":")[1] ?? "");
    if (!Number.isNaN(craftId)) {
      return { type: "craft", craftId, raw: scope };
    }
  }

  return { type: "overall", raw: scope };
}

function parseRecommendations(markdownList: string): string[] {
  return markdownList
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("-"))
    .map((line) => line.replace(/^[-\s]+/, "").trim())
    .filter(Boolean);
}

const rawAdminKpiMonthly: RawKpiRow[] = [
  {
    yyyymm: "2025-09",
    visits: "180",
    lang_dist: '{"ja": 126, "en": 44, "zh": 10}',
    age_dist:
      '{"20s": 57, "30s": 52, "40s": 32, "10s": 22, "50s+": 17}',
    created_at: "2025-11-12 02:56:42.896406+00:00",
    craft_accesses: "{}",
    craft_shop_clicks: "{}",
    total_shop_clicks: 27,
  },
  {
    yyyymm: "2025-10",
    visits: "220",
    lang_dist: '{"ja": 145, "en": 61, "zh": 14}',
    age_dist:
      '{"20s": 68, "30s": 57, "40s": 44, "10s": 27, "50s+": 24}',
    created_at: "2025-11-12 02:56:42.906004+00:00",
    craft_accesses: "{}",
    craft_shop_clicks: "{}",
    total_shop_clicks: 33,
  },
  {
    yyyymm: "2026-01",
    visits: "245",
    lang_dist: '{"en": 35, "es": 15, "fr": 2, "ja": 185, "zh": 8}',
    age_dist: '{"10s": 6, "20s": 84, "30s": 40, "40s": 11, "50s": 28, "60s": 15, "70s": 4, "80s_plus": 4, "under_10": 53}',
    created_at: "2026-02-07 05:17:08.86932+00",
    craft_accesses: '{"1": 32, "2": 1, "3": 5, "5": 2, "6": 1, "9": 4, "10": 1, "11": 2, "13": 21, "14": 2, "15": 4, "16": 3, "17": 42, "18": 2, "19": 10, "21": 3, "22": 1, "23": 6, "24": 1, "27": 2, "31": 6, "32": 1, "34": 4, "35": 4, "36": 2, "40": 2, "41": 1, "42": 8, "43": 1, "45": 2, "46": 1, "49": 1, "50": 2, "51": 1, "53": 1, "54": 1, "55": 3, "56": 2, "57": 1, "58": 1, "60": 1, "61": 1, "62": 1, "63": 15, "65": 2, "66": 2, "67": 1, "69": 11, "71": 3, "72": 4, "73": 1}',
    craft_shop_clicks: '{"1": 3, "13": 1, "17": 1, "31": 1, "50": 1, "63": 2, "72": 1}',
    total_shop_clicks: null,
  },
];

const rawAdminChatAggregatesMonthly: RawChatAggregateRow[] = [
  {
    yyyymm: "2025-09",
    volume_total: "54",
    volume_by_craft: '{"1": 30, "2": 14, "3": 10}',
    lang_ui_dist: '{"ja": 38, "en": 10, "zh": 6}',
    top_intents_overall: '[{"intent": "history", "count": 20}, {"intent": "process", "count": 15}, {"intent": "purchase", "count": 10}]',
    top_intents_by_craft: '{"1": [{"intent": "history", "count": 10}], "2": [{"intent": "process", "count": 5}], "3": [{"intent": "purchase", "count": 5}]}',
    updated_at: "2025-11-12 02:56:42.932082+00:00",
  },
  {
    yyyymm: "2025-10",
    volume_total: "66",
    volume_by_craft: '{"1": 37, "2": 20, "3": 9}',
    lang_ui_dist: '{"ja": 47, "en": 16, "zh": 3}',
    top_intents_overall: '[{"intent": "history", "count": 25}, {"intent": "process", "count": 20}, {"intent": "purchase", "count": 15}]',
    top_intents_by_craft: '{"1": [{"intent": "history", "count": 12}], "2": [{"intent": "process", "count": 8}], "3": [{"intent": "purchase", "count": 5}]}',
    updated_at: "2025-11-12 02:56:42.939094+00:00",
  },
  {
    yyyymm: "2026-01",
    volume_total: "93",
    volume_by_craft: '{"1": 7, "9": 1, "13": 23, "15": 1, "16": 1, "17": 10, "19": 2, "23": 1, "34": 2, "35": 2, "40": 5, "42": 4, "49": 5, "56": 2, "61": 1, "63": 4, "69": 16, "71": 2, "73": 4}',
    lang_ui_dist: '{"es": 11, "ja": 82}',
    top_intents_overall: '[{"count": 37, "intent": "history"}, {"count": 23, "intent": "other"}, {"count": 10, "intent": "process"}, {"count": 7, "intent": "material"}, {"count": 5, "intent": "products"}, {"count": 5, "intent": "other_craft"}, {"count": 3, "intent": "purchase"}, {"count": 2, "intent": "access_location"}, {"count": 1, "intent": "price"}]',
    top_intents_by_craft: '{"1": [{"count": 4, "intent": "history"}, {"count": 1, "intent": "process"}, {"count": 1, "intent": "material"}, {"count": 1, "intent": "other"}], "9": [{"count": 1, "intent": "history"}], "13": [{"count": 18, "intent": "history"}, {"count": 2, "intent": "process"}, {"count": 1, "intent": "price"}, {"count": 1, "intent": "material"}, {"count": 1, "intent": "other_craft"}], "15": [{"count": 1, "intent": "purchase"}], "16": [{"count": 1, "intent": "purchase"}], "17": [{"count": 4, "intent": "history"}, {"count": 2, "intent": "other"}, {"count": 2, "intent": "products"}, {"count": 1, "intent": "purchase"}, {"count": 1, "intent": "other_craft"}], "19": [{"count": 1, "intent": "history"}, {"count": 1, "intent": "access_location"}], "23": [{"count": 1, "intent": "process"}], "34": [{"count": 1, "intent": "process"}, {"count": 1, "intent": "material"}], "35": [{"count": 1, "intent": "other"}, {"count": 1, "intent": "process"}], "40": [{"count": 5, "intent": "other"}], "42": [{"count": 1, "intent": "products"}, {"count": 1, "intent": "other_craft"}, {"count": 1, "intent": "material"}, {"count": 1, "intent": "history"}], "49": [{"count": 2, "intent": "other"}, {"count": 1, "intent": "products"}, {"count": 1, "intent": "material"}, {"count": 1, "intent": "history"}], "56": [{"count": 2, "intent": "process"}], "61": [{"count": 1, "intent": "products"}], "63": [{"count": 1, "intent": "history"}, {"count": 1, "intent": "access_location"}, {"count": 1, "intent": "other_craft"}, {"count": 1, "intent": "process"}], "69": [{"count": 12, "intent": "other"}, {"count": 2, "intent": "history"}, {"count": 1, "intent": "process"}, {"count": 1, "intent": "other_craft"}], "71": [{"count": 2, "intent": "history"}], "73": [{"count": 2, "intent": "material"}, {"count": 2, "intent": "history"}]}',
    updated_at: "2026-02-07 06:13:14.719+00",
  },
];

const rawAdminChatSummaries: RawChatSummaryRow[] = [
  {
    scope: "overall",
    period: "2025-09",
    summary_md: "2025-09は来訪が増加。質問は予約・体験・購入先に集中。",
    recommendations_md:
      "- 体験予約導線の多言語整備\n- よくある質問の先頭配置\n- ショップ連携の強化",
    data_hash: "hash_overall_2025-09",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.951899+00:00",
  },
  {
    scope: "craft:1",
    period: "2025-09",
    summary_md: "西陣織に関する質問は予約と体験案内が多い。",
    recommendations_md:
      "- 予約要否を明記\n- 初心者向け体験の所要時間を記載\n- 購入先リンクを見やすく",
    data_hash: "hash_craft_1_2025-09",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.952030+00:00",
  },
  {
    scope: "craft:2",
    period: "2025-09",
    summary_md: "京焼・清水焼に関する質問は予約と体験案内が多い。",
    recommendations_md:
      "- 予約要否を明記\n- 初心者向け体験の所要時間を記載\n- 購入先リンクを見やすく",
    data_hash: "hash_craft_2_2025-09",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.952049+00:00",
  },
  {
    scope: "craft:3",
    period: "2025-09",
    summary_md: "京友禅に関する質問は予約と体験案内が多い。",
    recommendations_md:
      "- 予約要否を明記\n- 初心者向け体験の所要時間を記載\n- 購入先リンクを見やすく",
    data_hash: "hash_craft_3_2025-09",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.952060+00:00",
  },
  {
    scope: "overall",
    period: "2025-10",
    summary_md: "2025-10は来訪が増加。質問は予約・体験・購入先に集中。",
    recommendations_md:
      "- 体験予約導線の多言語整備\n- よくある質問の先頭配置\n- ショップ連携の強化",
    data_hash: "hash_overall_2025-10",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.952071+00:00",
  },
  {
    scope: "craft:1",
    period: "2025-10",
    summary_md: "西陣織に関する質問は予約と体験案内が多い。",
    recommendations_md:
      "- 予約要否を明記\n- 初心者向け体験の所要時間を記載\n- 購入先リンクを見やすく",
    data_hash: "hash_craft_1_2025-10",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.952107+00:00",
  },
  {
    scope: "craft:2",
    period: "2025-10",
    summary_md: "京焼・清水焼に関する質問は予約と体験案内が多い。",
    recommendations_md:
      "- 予約要否を明記\n- 初心者向け体験の所要時間を記載\n- 購入先リンクを見やすく",
    data_hash: "hash_craft_2_2025-10",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.952114+00:00",
  },
  {
    scope: "craft:3",
    period: "2025-10",
    summary_md: "京友禅に関する質問は予約と体験案内が多い。",
    recommendations_md:
      "- 予約要否を明記\n- 初心者向け体験の所要時間を記載\n- 購入先リンクを見やすく",
    data_hash: "hash_craft_3_2025-10",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.952121+00:00",
  },
  {
    scope: "overall",
    period: "2025-11",
    summary_md: "2025-11は来訪が増加。質問は予約・体験・購入先に集中。",
    recommendations_md:
      "- 体験予約導線の多言語整備\n- よくある質問の先頭配置\n- ショップ連携の強化",
    data_hash: "hash_overall_2025-11",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.952130+00:00",
  },
  {
    scope: "craft:1",
    period: "2025-11",
    summary_md: "西陣織に関する質問は予約と体験案内が多い。",
    recommendations_md:
      "- 予約要否を明記\n- 初心者向け体験の所要時間を記載\n- 購入先リンクを見やすく",
    data_hash: "hash_craft_1_2025-11",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.952145+00:00",
  },
  {
    scope: "craft:2",
    period: "2025-11",
    summary_md: "京焼・清水焼に関する質問は予約と体験案内が多い。",
    recommendations_md:
      "- 予約要否を明記\n- 初心者向け体験の所要時間を記載\n- 購入先リンクを見やすく",
    data_hash: "hash_craft_2_2025-11",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.952152+00:00",
  },
  {
    scope: "craft:3",
    period: "2025-11",
    summary_md: "京友禅に関する質問は予約と体験案内が多い。",
    recommendations_md:
      "- 予約要否を明記\n- 初心者向け体験の所要時間を記載\n- 購入先リンクを見やすく",
    data_hash: "hash_craft_3_2025-11",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v1",
    created_at: "2025-11-12 02:56:42.952158+00:00",
  },
];

export const adminKpiMonthly: AdminKpiMonthlyRow[] = rawAdminKpiMonthly.map(
  (row) => ({
    yyyymm: row.yyyymm,
    visits: Number(row.visits),
    langDist: parseJsonField(row.lang_dist, {} as LanguageDistribution),
    ageDist: parseJsonField(row.age_dist, {} as Record<string, number>),
    createdAt: row.created_at,
    craftAccesses: parseJsonField(row.craft_accesses, {} as Record<string, number>),
    craftShopClicks: parseJsonField(row.craft_shop_clicks, {} as Record<string, number>),
    totalShopClicks: row.total_shop_clicks,
  })
);

export const adminChatAggregatesMonthly: AdminChatAggregatesMonthlyRow[] =
  rawAdminChatAggregatesMonthly.map((row) => ({
    yyyymm: row.yyyymm,
    volumeTotal: Number(row.volume_total),
    volumeByCraft: parseJsonField(row.volume_by_craft, {} as Record<string, number>),
    langUiDist: parseJsonField(row.lang_ui_dist, {} as LanguageDistribution),
    topIntentsOverall: parseJsonField(row.top_intents_overall, [] as IntentCount[]),
    topIntentsByCraft: parseJsonField(
      row.top_intents_by_craft,
      {} as Record<string, IntentCount[]>
    ),
    updatedAt: row.updated_at,
  }));

export const adminChatSummaries: AdminChatSummaryRow[] = rawAdminChatSummaries
  .map((row) => ({
    scope: parseScope(row.scope),
    period: row.period,
    summaryMd: row.summary_md,
    recommendations: parseRecommendations(row.recommendations_md),
    dataHash: row.data_hash,
    modelVersion: row.model_version,
    promptVersion: row.prompt_version,
    createdAt: row.created_at,
  }));
