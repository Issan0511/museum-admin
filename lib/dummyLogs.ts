export type LanguageDistribution = Record<string, number>;

export type AdminKpiMonthlyRow = {
  yyyymm: string;
  visits: number;
  shopClicks: number;
  langDist: LanguageDistribution;
  ageDist: Record<string, number>;
  createdAt: string;
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
  craftId: number;
  yyyymm: string;
  volume: number;
  langUiDist: LanguageDistribution;
  langDetectedDist: LanguageDistribution;
  topKeywords: KeywordCount[];
  topIntents: IntentCount[];
  sampleQa: SampleQuestion[];
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
  shop_clicks: string;
  lang_dist: string;
  age_dist: string;
  created_at: string;
};

type RawChatAggregateRow = {
  craft_id: string;
  yyyymm: string;
  volume: string;
  lang_ui_dist: string;
  lang_detected_dist: string;
  top_keywords: string;
  top_intents: string;
  sample_qa: string;
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
    shop_clicks: "27",
    lang_dist: '{"ja": 126, "en": 44, "zh": 10}',
    age_dist:
      '{"20s": 57, "30s": 52, "40s": 32, "10s": 22, "50s+": 17}',
    created_at: "2025-11-12 02:56:42.896406+00:00",
  },
  {
    yyyymm: "2025-10",
    visits: "220",
    shop_clicks: "33",
    lang_dist: '{"ja": 145, "en": 61, "zh": 14}',
    age_dist:
      '{"20s": 68, "30s": 57, "40s": 44, "10s": 27, "50s+": 24}',
    created_at: "2025-11-12 02:56:42.906004+00:00",
  },
  {
    yyyymm: "2025-11",
    visits: "260",
    shop_clicks: "39",
    lang_dist: '{"ja": 173, "en": 70, "zh": 17}',
    age_dist:
      '{"20s": 86, "30s": 67, "40s": 47, "10s": 30, "50s+": 30}',
    created_at: "2025-11-12 02:56:42.923401+00:00",
  },
];

const rawAdminChatAggregatesMonthly: RawChatAggregateRow[] = [
  {
    craft_id: "1",
    yyyymm: "2025-09",
    volume: "30",
    lang_ui_dist: '{"ja": 22, "en": 6, "zh": 2}',
    lang_detected_dist: '{"ja": 16, "en": 8, "zh": 6}',
    top_keywords:
      '[{"k": "制作体験は予約が必要ですか", "c": 13}, {"k": "どの店で正絹の小物を買えますか", "c": 5}, {"k": "the", "c": 4}, {"k": "西陣織の帯はどうやって織るの", "c": 4}, {"k": "Do", "c": 3}]',
    top_intents:
      '[{"i": "予約/予約可否", "c": 16}, {"i": "体験/クラス", "c": 13}, {"i": "購入/購入先", "c": 6}]',
    sample_qa:
      '[{"q": "How is the obi woven in Nishijin-ori?"}, {"q": "Where can I buy small silk items?"}, {"q": "どの店で正絹の小物を買えますか？"}]',
    updated_at: "2025-11-12 02:56:42.932082+00:00",
  },
  {
    craft_id: "2",
    yyyymm: "2025-09",
    volume: "14",
    lang_ui_dist: '{"ja": 9, "en": 3, "zh": 2}',
    lang_detected_dist: '{"ja": 7, "zh": 5, "en": 2}',
    top_keywords:
      '[{"k": "初心者向け体験は何分くらい", "c": 4}, {"k": "清水焼の窯元見学は可能", "c": 3}, {"k": "Can", "c": 2}, {"k": "visit", "c": 2}, {"k": "Kiyomizu", "c": 2}]',
    top_intents: '[{"i": "体験/クラス", "c": 5}, {"i": "価格/費用", "c": 3}]',
    sample_qa:
      '[{"q": "Can I visit a Kiyomizu kiln?"}, {"q": "初心者向け体験は何分くらい？"}, {"q": "可以参观清水烧窑场吗？"}]',
    updated_at: "2025-11-12 02:56:42.933876+00:00",
  },
  {
    craft_id: "3",
    yyyymm: "2025-09",
    volume: "10",
    lang_ui_dist: '{"ja": 7, "zh": 2, "en": 1}',
    lang_detected_dist: '{"ja": 6, "zh": 3, "en": 1}',
    top_keywords:
      '[{"k": "子ども向けの説明はありますか", "c": 3}, {"k": "友禅の下絵は手描き", "c": 3}, {"k": "染料是天然的吗", "c": 1}, {"k": "有适合儿童的讲解吗", "c": 1}, {"k": "染料は天然ですか", "c": 1}]',
    top_intents: "[]",
    sample_qa:
      '[{"q": "子ども向けの説明はありますか？"}, {"q": "子ども向けの説明はありますか？"}, {"q": "友禅の下絵は手描き？"}]',
    updated_at: "2025-11-12 02:56:42.935479+00:00",
  },
  {
    craft_id: "1",
    yyyymm: "2025-10",
    volume: "37",
    lang_ui_dist: '{"ja": 25, "en": 11, "zh": 1}',
    lang_detected_dist: '{"ja": 21, "en": 12, "zh": 4}',
    top_keywords:
      '[{"k": "制作体験は予約が必要ですか", "c": 9}, {"k": "西陣織の帯はどうやって織るの", "c": 8}, {"k": "どの店で正絹の小物を買えますか", "c": 8}, {"k": "the", "c": 6}, {"k": "How", "c": 5}]',
    top_intents:
      '[{"i": "予約/予約可否", "c": 11}, {"i": "体験/クラス", "c": 10}, {"i": "購入/購入先", "c": 8}]',
    sample_qa:
      '[{"q": "西陣織の帯はどうやって織るの？"}, {"q": "西陣織の帯はどうやって織るの？"}, {"q": "制作体験は予約が必要ですか？"}]',
    updated_at: "2025-11-12 02:56:42.939094+00:00",
  },
  {
    craft_id: "2",
    yyyymm: "2025-10",
    volume: "20",
    lang_ui_dist: '{"ja": 15, "en": 4, "zh": 1}',
    lang_detected_dist: '{"ja": 13, "en": 5, "zh": 2}',
    top_keywords:
      '[{"k": "釉薬の違いで価格は変わりますか", "c": 6}, {"k": "初心者向け体験は何分くらい", "c": 5}, {"k": "清水焼の窯元見学は可能", "c": 4}, {"k": "the", "c": 3}, {"k": "How", "c": 2}]',
    top_intents: '[{"i": "体験/クラス", "c": 8}, {"i": "価格/費用", "c": 7}]',
    sample_qa:
      '[{"q": "釉薬の違いで価格は変わりますか？"}, {"q": "Does glaze type change the price?"}, {"q": "釉薬の違いで価格は変わりますか？"}]',
    updated_at: "2025-11-12 02:56:42.940628+00:00",
  },
  {
    craft_id: "3",
    yyyymm: "2025-10",
    volume: "9",
    lang_ui_dist: '{"ja": 7, "zh": 1, "en": 1}',
    lang_detected_dist: '{"ja": 6, "zh": 2, "en": 1}',
    top_keywords:
      '[{"k": "子ども向けの説明はありますか", "c": 3}, {"k": "染料は天然ですか", "c": 2}, {"k": "友禅の下絵は手描き", "c": 2}, {"k": "染料是天然的吗", "c": 1}, {"k": "Are", "c": 1}]',
    top_intents: "[]",
    sample_qa:
      '[{"q": "子ども向けの説明はありますか？"}, {"q": "子ども向けの説明はありますか？"}, {"q": "染料は天然ですか？"}]',
    updated_at: "2025-11-12 02:56:42.942147+00:00",
  },
  {
    craft_id: "1",
    yyyymm: "2025-11",
    volume: "37",
    lang_ui_dist: '{"ja": 23, "en": 13, "zh": 1}',
    lang_detected_dist: '{"ja": 19, "en": 12, "zh": 6}',
    top_keywords:
      '[{"k": "the", "c": 9}, {"k": "どの店で正絹の小物を買えますか", "c": 8}, {"k": "制作体験は予約が必要ですか", "c": 8}, {"k": "西陣織の帯はどうやって織るの", "c": 7}, {"k": "Do", "c": 5}]',
    top_intents:
      '[{"i": "予約/予約可否", "c": 13}, {"i": "購入/購入先", "c": 9}, {"i": "体験/クラス", "c": 8}]',
    sample_qa:
      '[{"q": "どの店で正絹の小物を買えますか？"}, {"q": "西陣織の帯はどうやって織るの？"}, {"q": "Do I need a reservation for the workshop?"}]',
    updated_at: "2025-11-12 02:56:42.945664+00:00",
  },
  {
    craft_id: "2",
    yyyymm: "2025-11",
    volume: "21",
    lang_ui_dist: '{"ja": 16, "en": 3, "zh": 2}',
    lang_detected_dist: '{"ja": 12, "en": 5, "zh": 4}',
    top_keywords:
      '[{"k": "初心者向け体験は何分くらい", "c": 7}, {"k": "釉薬の違いで価格は変わりますか", "c": 6}, {"k": "清水焼の窯元見学は可能", "c": 3}, {"k": "Can", "c": 2}, {"k": "visit", "c": 2}]',
    top_intents: '[{"i": "体験/クラス", "c": 9}, {"i": "価格/費用", "c": 7}]',
    sample_qa:
      '[{"q": "初心者向け体験は何分くらい？"}, {"q": "釉薬の違いで価格は変わりますか？"}, {"q": "初心者向け体験は何分くらい？"}]',
    updated_at: "2025-11-12 02:56:42.947263+00:00",
  },
  {
    craft_id: "3",
    yyyymm: "2025-11",
    volume: "20",
    lang_ui_dist: '{"ja": 11, "en": 6, "zh": 3}',
    lang_detected_dist: '{"ja": 11, "en": 5, "zh": 4}',
    top_keywords:
      '[{"k": "染料は天然ですか", "c": 5}, {"k": "友禅の下絵は手描き", "c": 5}, {"k": "Is", "c": 4}, {"k": "the", "c": 3}, {"k": "there", "c": 3}]',
    top_intents: "[]",
    sample_qa:
      '[{"q": "染料は天然ですか？"}, {"q": "Are the dyes natural?"}, {"q": "染料は天然ですか？"}]',
    updated_at: "2025-11-12 02:56:42.948752+00:00",
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
    shopClicks: Number(row.shop_clicks),
    langDist: parseJsonField(row.lang_dist, {} as LanguageDistribution),
    ageDist: parseJsonField(row.age_dist, {} as Record<string, number>),
    createdAt: row.created_at,
  })
);

export const adminChatAggregatesMonthly: AdminChatAggregatesMonthlyRow[] =
  rawAdminChatAggregatesMonthly.map((row) => {
    const keywordCounts = parseJsonField(row.top_keywords, [] as { k: string; c: number }[]);
    const intentCounts = parseJsonField(row.top_intents, [] as { i: string; c: number }[]);
    const qaItems = parseJsonField(row.sample_qa, [] as { q: string }[]);

    return {
      craftId: Number(row.craft_id),
      yyyymm: row.yyyymm,
      volume: Number(row.volume),
      langUiDist: parseJsonField(row.lang_ui_dist, {} as LanguageDistribution),
      langDetectedDist: parseJsonField(
        row.lang_detected_dist,
        {} as LanguageDistribution
      ),
      topKeywords: keywordCounts.map((item) => ({
        keyword: item.k,
        count: item.c,
      })),
      topIntents: intentCounts.map((item) => ({
        intent: item.i,
        count: item.c,
      })),
      sampleQa: qaItems.map((item) => ({
        question: item.q,
      })),
      updatedAt: row.updated_at,
    };
  });

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
