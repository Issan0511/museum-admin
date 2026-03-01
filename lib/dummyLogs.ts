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
  updated_at_date: string;
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
    updated_at_date: "2025-09-30",
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
    updated_at_date: "2025-10-31",
  },
  {
    yyyymm: "2026-01-02",
    visits: "339",
    lang_dist: '{"ja": 232, "ko": 1, "en": 69, "fr": 6, "zh": 13, "es": 18}',
    age_dist: '{"20s": 81, "30s": 55, "under_10": 57, "40s": 35, "10s": 10, "70s": 16, "80s_plus": 7, "60s": 34, "50s": 44}',
    created_at: "2026-02-26 00:27:43.093751+00",
    craft_accesses: '{"41": 2, "13": 21, "21": 4, "23": 6, "32": 1, "9": 5, "27": 5, "57": 2, "47": 1, "42": 10, "15": 7, "2": 1, "69": 14, "72": 9, "51": 3, "50": 6, "6": 1, "10": 1, "60": 1, "18": 5, "59": 1, "45": 2, "46": 1, "63": 18, "52": 1, "7": 1, "22": 2, "65": 2, "66": 6, "49": 1, "34": 6, "31": 6, "40": 2, "24": 2, "35": 4, "61": 1, "3": 8, "56": 2, "74": 2, "73": 3, "38": 2, "58": 1, "67": 1, "16": 7, "5": 4, "17": 59, "1": 43, "14": 9, "62": 1, "55": 3, "19": 11, "54": 3, "36": 2, "43": 3, "68": 1, "20": 1, "71": 4, "11": 3, "53": 1}',
    craft_shop_clicks: '{"13": 1, "50": 1, "15": 1, "31": 1, "63": 2, "1": 4, "74": 1, "17": 2, "72": 1, "51": 1}',
    total_shop_clicks: null,
    updated_at_date: "2026-02-26",
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
    yyyymm: "2026-01-02",
    volume_total: "105",
    volume_by_craft: '{"1": 7, "3": 1, "9": 1, "13": 23, "15": 2, "16": 1, "17": 10, "18": 1, "19": 2, "23": 1, "24": 2, "34": 2, "35": 2, "40": 5, "42": 4, "43": 1, "47": 1, "49": 5, "54": 1, "56": 2, "57": 1, "61": 1, "63": 6, "68": 1, "69": 16, "71": 2, "73": 4}',
    lang_ui_dist: '{"es": 11, "ja": 87, "en": 7}',
    top_intents_overall: '[{"count": 38, "intent": "history"}, {"count": 24, "intent": "other"}, {"count": 11, "intent": "process"}, {"count": 8, "intent": "material"}, {"count": 7, "intent": "overview"}, {"count": 5, "intent": "other_craft"}, {"count": 5, "intent": "products"}, {"count": 4, "intent": "purchase"}, {"count": 2, "intent": "access_location"}, {"count": 1, "intent": "price"}]',
    top_intents_by_craft: '{"1": [{"count": 4, "intent": "history"}, {"count": 1, "intent": "material"}, {"count": 1, "intent": "other"}, {"count": 1, "intent": "process"}], "3": [{"count": 1, "intent": "overview"}], "9": [{"count": 1, "intent": "history"}], "13": [{"count": 18, "intent": "history"}, {"count": 2, "intent": "process"}, {"count": 1, "intent": "material"}, {"count": 1, "intent": "other_craft"}, {"count": 1, "intent": "price"}], "15": [{"count": 1, "intent": "overview"}, {"count": 1, "intent": "purchase"}], "16": [{"count": 1, "intent": "purchase"}], "17": [{"count": 4, "intent": "history"}, {"count": 2, "intent": "other"}, {"count": 2, "intent": "products"}, {"count": 1, "intent": "other_craft"}, {"count": 1, "intent": "purchase"}], "18": [{"count": 1, "intent": "overview"}], "19": [{"count": 1, "intent": "access_location"}, {"count": 1, "intent": "history"}], "23": [{"count": 1, "intent": "process"}], "24": [{"count": 1, "intent": "material"}, {"count": 1, "intent": "other"}], "34": [{"count": 1, "intent": "material"}, {"count": 1, "intent": "process"}], "35": [{"count": 1, "intent": "other"}, {"count": 1, "intent": "process"}], "40": [{"count": 5, "intent": "other"}], "42": [{"count": 1, "intent": "history"}, {"count": 1, "intent": "material"}, {"count": 1, "intent": "other_craft"}, {"count": 1, "intent": "products"}], "43": [{"count": 1, "intent": "overview"}], "47": [{"count": 1, "intent": "overview"}], "49": [{"count": 2, "intent": "other"}, {"count": 1, "intent": "history"}, {"count": 1, "intent": "material"}, {"count": 1, "intent": "products"}], "54": [{"count": 1, "intent": "overview"}], "56": [{"count": 2, "intent": "process"}], "57": [{"count": 1, "intent": "process"}], "61": [{"count": 1, "intent": "products"}], "63": [{"count": 2, "intent": "history"}, {"count": 1, "intent": "access_location"}, {"count": 1, "intent": "other_craft"}, {"count": 1, "intent": "process"}, {"count": 1, "intent": "purchase"}], "68": [{"count": 1, "intent": "overview"}], "69": [{"count": 12, "intent": "other"}, {"count": 2, "intent": "history"}, {"count": 1, "intent": "other_craft"}, {"count": 1, "intent": "process"}], "71": [{"count": 2, "intent": "history"}], "73": [{"count": 2, "intent": "history"}, {"count": 2, "intent": "material"}]}',
    updated_at: "2026-02-26 00:50:47.876+00",
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
  {
    scope: "overall",
    period: "2026-01-02",
    summary_md:
      "歴史・由来に関する質問が最も多く、特に京焼・西陣織・京人形など主要工芸の「いつからあるのか」「何が違うのか」といった基礎理解への関心が高い。次いで、作り方・工程などの製作プロセス、購入場所や価格といった実用情報への質問が見られる。定義確認型の質問が全体傾向として目立つ。",
    recommendations_md:
      "- 歴史・定義・違いを比較できる導入コンテンツを先頭に配置\n- 京焼を起点に主要工芸への横断導線を強化\n- 工程・購入場所・価格の実務情報をFAQで即参照可能にする",
    data_hash: "hash_overall_2026-01-02_other_excluded",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v2-other-excluded",
    created_at: "2026-03-01 00:00:00+00:00",
  },
  {
    scope: "craft:13",
    period: "2026-01-02",
    summary_md:
      "京焼では定義・歴史・清水焼との違いに関する質問が中心。文化財指定、職人減少、価格、職人になる方法まで関心が広く、基礎説明と比較解説への需要が高い。",
    recommendations_md:
      "- 京焼と清水焼の違いを最短で理解できる比較カードを配置\n- 歴史年表と文化財指定情報を1画面で提示\n- 価格帯と学び方（職人への道）をFAQ化する",
    data_hash: "hash_craft_13_2026-01-02_other_excluded",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v2-other-excluded",
    created_at: "2026-03-01 00:00:00+00:00",
  },
  {
    scope: "craft:1",
    period: "2026-01-02",
    summary_md:
      "西陣織は歴史と定義を問う質問が中心で、加えて大きさや職人数など産業規模への関心が見られる。基礎解説に現況データを添える構成が有効。",
    recommendations_md:
      "- 歴史・定義の基礎解説を冒頭に固定\n- 規模感（職人数・生産関連指標）を見える化\n- 初学者向けに専門用語の言い換えを追加",
    data_hash: "hash_craft_1_2026-01-02_other_excluded",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v2-other-excluded",
    created_at: "2026-03-01 00:00:00+00:00",
  },
  {
    scope: "craft:17",
    period: "2026-01-02",
    summary_md:
      "京人形は歴史に関する質問が主で、兜・雛人形との関係確認や購入場所の問い合わせもある。製品カテゴリ説明と販売導線の明確化が有効。",
    recommendations_md:
      "- 京人形内のカテゴリ関係（兜・雛人形）を図解\n- 歴史背景の要点を短文で提示\n- 購入先情報を地域別に整理して導線を明確化",
    data_hash: "hash_craft_17_2026-01-02_other_excluded",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v2-other-excluded",
    created_at: "2026-03-01 00:00:00+00:00",
  },
  {
    scope: "craft:63",
    period: "2026-01-02",
    summary_md:
      "伏見人形では歴史に加え、工房数・製作主体・購入場所など具体情報への質問が分散。地域工芸としての背景と現存体制の整理が求められる。",
    recommendations_md:
      "- 歴史と地域性をセットで説明する導入を用意\n- 工房・作り手情報を一覧化して更新頻度を明示\n- 購入場所と見学可否を同一導線で案内する",
    data_hash: "hash_craft_63_2026-01-02_other_excluded",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v2-other-excluded",
    created_at: "2026-03-01 00:00:00+00:00",
  },
  {
    scope: "craft:73",
    period: "2026-01-02",
    summary_md:
      "京たたみでは違いと定義、職人減少への関心が確認できる。伝統技術の特徴説明と現状データ提示を組み合わせると理解が進みやすい。",
    recommendations_md:
      "- 京たたみの特徴と差異を比較形式で提示\n- 職人動向などの現状データを定期更新で掲示\n- 手入れ方法や選び方を実用FAQとして追加",
    data_hash: "hash_craft_73_2026-01-02_other_excluded",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v2-other-excluded",
    created_at: "2026-03-01 00:00:00+00:00",
  },
  {
    scope: "craft:69",
    period: "2026-01-02",
    summary_md:
      "京菓子では担い手減少に関する質問が見られ、産業継承や市場動向への説明ニーズがある。背景説明と継承事例の提示が有効。",
    recommendations_md:
      "- 担い手減少の背景を要点整理して提示\n- 継承事例と現場の取り組みを紹介\n- 市場動向と購入体験をつなぐ導線を強化",
    data_hash: "hash_craft_69_2026-01-02_other_excluded",
    model_version: "gpt-5-mini-2025-10",
    prompt_version: "v2-other-excluded",
    created_at: "2026-03-01 00:00:00+00:00",
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
