import {
  adminChatAggregatesMonthly,
  adminChatSummaries,
  adminKpiMonthly,
  type AdminChatAggregatesMonthlyRow,
  type AdminChatSummaryRow,
  type AdminKpiMonthlyRow,
} from "@/lib/dummyLogs";

export type KpiCard = {
  label: string;
  value: number;
  diff: number;
};

export type SimpleRatioItem = {
  label: string;
  value: number;
};

export type ChatThemeRatio = {
  label: string;
  ratio: number;
};

export type OverallChatSummaryData = {
  totalQuestions: number;
  mainThemes: ChatThemeRatio[];
  summary: string;
  actions: string[];
};

export type CraftChatSummaryItem = {
  craft: string;
  volume: number;
  topIntents: ChatThemeRatio[];
  aiSummary: string;
  actions: string[];
};

export type MonthlyDashboardSource = {
  kpi: AdminKpiMonthlyRow;
  chatAggregate: AdminChatAggregatesMonthlyRow | null;
  chatSummaries: AdminChatSummaryRow[];
};

export type MonthlyDashboardData = {
  source: MonthlyDashboardSource;
  monthLabel: string;
  highlights: string[];
  kpiCards: KpiCard[];
  rankingData: SimpleRatioItem[];
  languageData: SimpleRatioItem[];
  ageData: SimpleRatioItem[];
  overallChatSummary: OverallChatSummaryData;
  craftChatSummaries: CraftChatSummaryItem[];
};

const CRAFT_LABELS: Record<string, string> = {
  "1": "西陣織",
  "2": "京鹿の子絞",
  "3": "京友禅",
  "4": "京小紋",
  "5": "京くみひも",
  "6": "京繍",
  "7": "京黒紋付染",
  "8": "京房ひも・撚ひも",
  "9": "京仏壇",
  "10": "京仏具",
  "11": "京漆器",
  "12": "京指物",
  "13": "京焼・清水焼",
  "14": "京扇子",
  "15": "京うちわ",
  "16": "京石工芸品",
  "17": "京人形",
  "18": "京表具",
  "19": "京陶人形",
  "20": "京都の金属工芸品",
  "21": "京象嵌",
  "22": "京刃物",
  "23": "京の神祇装束調度品",
  "24": "京銘竹",
  "25": "京の色紙短冊和本帖",
  "26": "北山丸太",
  "27": "京版画",
  "28": "京袋物",
  "29": "京すだれ",
  "30": "京印章",
  "31": "工芸菓子",
  "32": "京竹工芸",
  "33": "造園",
  "34": "清酒",
  "35": "薫香",
  "36": "伝統建築",
  "37": "額看板",
  "38": "菓子木型",
  "39": "かつら",
  "40": "京金網",
  "41": "唐紙",
  "42": "かるた",
  "43": "きせる",
  "44": "京瓦",
  "45": "京真田紐",
  "46": "京足袋",
  "47": "京つげぐし",
  "48": "京葛籠",
  "49": "京丸うちわ",
  "50": "京弓",
  "51": "京和傘",
  "52": "截金",
  "53": "嵯峨面",
  "54": "尺八",
  "55": "三味線",
  "56": "調べ緒",
  "57": "茶筒",
  "58": "提燈",
  "59": "念珠玉",
  "60": "能面",
  "61": "花かんざし",
  "62": "帆布製カバン",
  "63": "伏見人形",
  "64": "邦楽器絃",
  "65": "矢",
  "66": "結納飾・水引工芸",
  "67": "和蝋燭",
  "68": "珠数",
  "69": "京菓子",
  "70": "京漬物",
  "71": "京料理",
  "72": "京こま",
  "73": "京たたみ",
  "74": "京七宝",
};

const INTENT_LABELS: Record<string, string> = {
  overview: "概要・定義",
  history: "歴史背景",
  material: "素材",
  process: "技法・工程",
  price: "価格",
  products: "製品",
  other_craft: "他工芸比較",
  purchase: "購入場所",
  experience: "体験・ワークショップ",
  access_location: "アクセス・所在地",
  facility_rules: "施設ルール・サービス",
  child_beginner: "子ども・初心者向け",
  other: "その他",
  unclassified: "分類不能",
};

const LANGUAGE_LABELS: Record<string, string> = {
  ja: "日本語",
  en: "英語",
  zh: "中国語",
  es: "スペイン語",
  fr: "フランス語",
  ko: "韓国語",
};

const AGE_LABELS: Record<string, string> = {
  under_10: "10歳未満",
  "10s": "10代",
  "20s": "20代",
  "30s": "30代",
  "40s": "40代",
  "50s": "50代",
  "50s+": "50代以上",
  "60s": "60代",
  "70s": "70代",
  "80s_plus": "80代以上",
};

const AGE_ORDER = [
  "under_10",
  "10s",
  "20s",
  "30s",
  "40s",
  "50s",
  "50s+",
  "60s",
  "70s",
  "80s_plus",
];

function toMonthLabel(yyyymm: string): string {
  const [year, month] = yyyymm.split("-");
  return `${year}年${Number(month)}月`;
}

function getCraftLabel(craftId: string): string {
  return CRAFT_LABELS[craftId] ?? `工芸${craftId}`;
}

function getIntentLabel(intent: string): string {
  return INTENT_LABELS[intent] ?? intent;
}

function toRatioItems(
  record: Record<string, number>,
  labels: Record<string, string>
): SimpleRatioItem[] {
  const total = Object.values(record).reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return [];
  }

  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({
      label: labels[key] ?? key,
      value: Math.round((count / total) * 100),
    }));
}

function toOrderedRatioItems(
  record: Record<string, number>,
  labels: Record<string, string>,
  order: string[]
): SimpleRatioItem[] {
  const total = Object.values(record).reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return [];
  }

  const orderMap = new Map(order.map((key, index) => [key, index]));

  return Object.entries(record)
    .sort((a, b) => {
      const aOrder = orderMap.get(a[0]);
      const bOrder = orderMap.get(b[0]);

      if (aOrder !== undefined && bOrder !== undefined) {
        return aOrder - bOrder;
      }
      if (aOrder !== undefined) {
        return -1;
      }
      if (bOrder !== undefined) {
        return 1;
      }
      return b[1] - a[1];
    })
    .map(([key, count]) => ({
      label: labels[key] ?? key,
      value: Math.round((count / total) * 100),
    }));
}

function toCraftRanking(record: Record<string, number>): SimpleRatioItem[] {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([craftId, value]) => ({
      label: getCraftLabel(craftId),
      value,
    }));
}

function calcDiff(current: number, previous: number | null): number {
  if (!previous || previous <= 0) {
    return 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

function sumRecordValues(record: Record<string, number>): number {
  return Object.values(record).reduce((sum, value) => sum + value, 0);
}

const kpiByMonth = new Map(adminKpiMonthly.map((row) => [row.yyyymm, row]));
const aggregateByMonth = new Map(
  adminChatAggregatesMonthly.map((row) => [row.yyyymm, row])
);
const summariesByMonth = adminChatSummaries.reduce<
  Record<string, AdminChatSummaryRow[]>
>((acc, row) => {
  const current = acc[row.period] ?? [];
  current.push(row);
  acc[row.period] = current;
  return acc;
}, {});

function buildMonthData(
  month: string,
  index: number,
  sortedMonths: string[]
): MonthlyDashboardData | null {
  const kpi = kpiByMonth.get(month);
  if (!kpi) {
    return null;
  }

  const chatAggregate = aggregateByMonth.get(month) ?? null;
  const chatSummaries = summariesByMonth[month] ?? [];
  const previousMonth = sortedMonths[index - 1];
  const previousKpi = previousMonth ? kpiByMonth.get(previousMonth) ?? null : null;
  const previousAggregate = previousMonth
    ? aggregateByMonth.get(previousMonth) ?? null
    : null;

  const totalShopClicks =
    kpi.totalShopClicks ?? sumRecordValues(kpi.craftShopClicks);
  const totalQuestions = chatAggregate?.volumeTotal ?? 0;

  const overallSummary =
    chatSummaries.find((item) => item.scope.type === "overall") ?? null;

  const craftVolumes = chatAggregate?.volumeByCraft ?? {};
  const craftIntents = chatAggregate?.topIntentsByCraft ?? {};

  const craftChatSummaries: CraftChatSummaryItem[] = Object.entries(craftVolumes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([craftId, volume]) => {
      const summary =
        chatSummaries.find(
          (item) => item.scope.type === "craft" && item.scope.craftId === Number(craftId)
        ) ?? null;

      const intents = (craftIntents[craftId] ?? []).slice(0, 3);

      return {
        craft: getCraftLabel(craftId),
        volume,
        topIntents: intents.map((intent) => ({
          label: getIntentLabel(intent.intent),
          ratio: volume > 0 ? intent.count / volume : 0,
        })),
        aiSummary: summary?.summaryMd ?? "要約データなし",
        actions:
          summary?.recommendations.length
            ? summary.recommendations
            : ["関連コンテンツの改善案を作成"],
      };
    });

  const topCraft = toCraftRanking(kpi.craftAccesses)[0];

  return {
    source: {
      kpi,
      chatAggregate,
      chatSummaries,
    },
    monthLabel: toMonthLabel(month),
    highlights: [
      `来館者数 ${kpi.visits.toLocaleString()} 人`,
      `AIチャット総質問数 ${totalQuestions.toLocaleString()} 件`,
      topCraft
        ? `展示アクセス最多は「${topCraft.label}」(${topCraft.value.toLocaleString()}件)`
        : "展示アクセスデータはありません",
    ],
    kpiCards: [
      {
        label: "来館者数",
        value: kpi.visits,
        diff: calcDiff(kpi.visits, previousKpi?.visits ?? null),
      },
      {
        label: "ショップクリック数",
        value: totalShopClicks,
        diff: calcDiff(
          totalShopClicks,
          previousKpi
            ? previousKpi.totalShopClicks ??
                sumRecordValues(previousKpi.craftShopClicks)
            : null
        ),
      },
      {
        label: "AIチャット総質問数",
        value: totalQuestions,
        diff: calcDiff(totalQuestions, previousAggregate?.volumeTotal ?? null),
      },
    ],
    rankingData: toCraftRanking(kpi.craftAccesses),
    languageData: toRatioItems(kpi.langDist, LANGUAGE_LABELS),
    ageData: toOrderedRatioItems(kpi.ageDist, AGE_LABELS, AGE_ORDER),
    overallChatSummary: {
      totalQuestions,
      mainThemes: (chatAggregate?.topIntentsOverall ?? []).slice(0, 4).map((intent) => ({
        label: getIntentLabel(intent.intent),
        ratio: totalQuestions > 0 ? intent.count / totalQuestions : 0,
      })),
      summary: overallSummary?.summaryMd ?? "全体サマリーはありません。",
      actions:
        overallSummary?.recommendations.length
          ? overallSummary.recommendations
          : ["次月データで改善アクションを生成"],
    },
    craftChatSummaries,
  };
}

const allMonths = Array.from(
  new Set([...adminKpiMonthly.map((row) => row.yyyymm)])
).sort();

export const monthlyDashboardData: Record<string, MonthlyDashboardData> = allMonths
  .map((month, index) => [month, buildMonthData(month, index, allMonths)] as const)
  .reduce<Record<string, MonthlyDashboardData>>((acc, [month, data]) => {
    if (data) {
      acc[month] = data;
    }
    return acc;
  }, {});

export const availableMonths = Object.keys(monthlyDashboardData).sort();

export const getPreviousMonthSlug = (baseDate = new Date()) => {
  const previous = new Date(baseDate.getFullYear(), baseDate.getMonth() - 1, 1);
  const year = previous.getFullYear();
  const month = String(previous.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const resolveDefaultMonthSlug = (baseDate = new Date()) => {
  const candidate = getPreviousMonthSlug(baseDate);
  if (monthlyDashboardData[candidate]) {
    return candidate;
  }

  const latest = [...availableMonths].sort().at(-1);
  return latest ?? candidate;
};
