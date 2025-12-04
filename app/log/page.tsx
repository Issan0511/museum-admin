"use client";

import React from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ========================
// 型定義（フロント用）
// ========================

type KpiCard = {
  label: string;
  value: number;
  diff: number; // 前年同月比などの増減率（%）
};

type SimpleRatioItem = {
  label: string;
  value: number;
};

type ChatThemeRatio = {
  label: string;
  ratio: number; // 0〜1
};

type OverallChatSummaryData = {
  totalQuestions: number;
  mainThemes: ChatThemeRatio[];
  summary: string;
  actions: string[];
};

type CraftChatSummaryItem = {
  craft: string;
  volume: number;
  topIntents: ChatThemeRatio[];
  aiSummary: string;
  actions: string[];
};

type MonthlyDashboardData = {
  monthLabel: string; // "2025年10月" など表示用
  highlights: string[];
  kpiCards: KpiCard[];
  rankingData: SimpleRatioItem[];
  languageData: SimpleRatioItem[];
  ageData: SimpleRatioItem[];
  overallChatSummary: OverallChatSummaryData;
  craftChatSummaries: CraftChatSummaryItem[];
};

// ========================
// ダミーデータ（DB から取得した Object を想定）
// ========================

const mockDashboardData: MonthlyDashboardData = {
  monthLabel: "2025年10月",
  highlights: [
    "来館者数が前年同月比+12%で過去最高を更新",
    "英語・中国語の閲覧率が上昇し、多言語利用が拡大",
    "AIチャットの質問数増加により、工芸別の関心傾向が明確化",
    "人気テーマ：西陣織、金箔、京焼・清水焼の三つが全体の7割を占める",
  ],
  kpiCards: [
    { label: "来館者数", value: 12840, diff: 12 },
    { label: "Webアクセス数", value: 54210, diff: 9 },
    { label: "AIチャット総質問数", value: 1840, diff: 15 },
  ],
  rankingData: [
    { label: "西陣織", value: 980 },
    { label: "金箔", value: 720 },
    { label: "清水焼", value: 560 },
    { label: "漆芸", value: 410 },
    { label: "竹工芸", value: 350 },
    { label: "京扇子", value: 300 },
    { label: "友禅染", value: 260 },
    { label: "京金具", value: 240 },
    { label: "京人形", value: 200 },
    { label: "京提灯", value: 150 },
  ],
  languageData: [
    { label: "日本語", value: 62 },
    { label: "英語", value: 23 },
    { label: "中国語", value: 10 },
    { label: "韓国語", value: 5 },
  ],
  ageData: [
    { label: "〜20代", value: 18 },
    { label: "30代", value: 27 },
    { label: "40代", value: 24 },
    { label: "50代", value: 20 },
    { label: "60代〜", value: 11 },
  ],
  overallChatSummary: {
    totalQuestions: 1840,
    mainThemes: [
      { label: "工芸の歴史背景", ratio: 0.34 },
      { label: "制作工程", ratio: 0.28 },
      { label: "体験に関する質問", ratio: 0.22 },
      { label: "購入・メンテナンス", ratio: 0.16 },
    ],
    summary:
      "利用者は“物語性の理解”と“制作工程の可視化”を求める傾向が強い。体験の詳細導線を整理することで満足度が上がる見込み。",
    actions: [
      "工芸別の工程説明を強化",
      "体験予約の導線を改善",
      "初心者向けガイドを追加",
    ],
  },
  craftChatSummaries: [
    {
      craft: "西陣織",
      volume: 342,
      topIntents: [
        { label: "技法の歴史/背景", ratio: 0.36 },
        { label: "図案・紋紙の工程", ratio: 0.28 },
        { label: "体験の所要時間", ratio: 0.14 },
      ],
      aiSummary:
        "来訪者は“背景の物語”を求める傾向が強く、図案工程の図解需要が高い。",
      actions: ["工程図を1枚目に固定", "3行サマリ（日英）", "関連展示リンクを追加"],
    },
    {
      craft: "金箔",
      volume: 198,
      topIntents: [
        { label: "材料の入手/購入", ratio: 0.33 },
        { label: "体験予約/料金", ratio: 0.31 },
        { label: "加飾の耐久性/保存", ratio: 0.19 },
      ],
      aiSummary:
        "“購入・体験”系の意図が中心。価格情報を上部にまとめると離脱が抑えられる。",
      actions: ["料金表の固定表示", "予約ボタンの強調", "保存方法Q&Aを追加"],
    },
    {
      craft: "京焼・清水焼",
      volume: 221,
      topIntents: [
        { label: "窯元/工房の違い", ratio: 0.29 },
        { label: "釉薬/焼成温度", ratio: 0.27 },
        { label: "購入場所", ratio: 0.18 },
      ],
      aiSummary:
        "技術要素の深掘りが多く、図表・写真による比較が有効。",
      actions: ["釉薬比較の図表", "用語ツールチップ追加", "工房紹介を上部へ"],
    },
    {
      craft: "蒔絵",
      volume: 187,
      topIntents: [
        { label: "漆・金粉の素材説明", ratio: 0.34 },
        { label: "工程（下地〜研ぎ出し）", ratio: 0.30 },
        { label: "体験可能な技法の違い", ratio: 0.16 },
      ],
      aiSummary:
        "素材・工程に関する“深い理解”を求める利用者が多い。",
      actions: ["工程図の追加", "体験技法比較表", "素材説明の強化"],
    },
    {
      craft: "友禅染",
      volume: 176,
      topIntents: [
        { label: "手描き/型染の違い", ratio: 0.31 },
        { label: "染料・糊置き工程", ratio: 0.27 },
        { label: "体験内容/時間", ratio: 0.18 },
      ],
      aiSummary:
        "“違いを知りたい”需要が高いため、比較図解が有効。",
      actions: ["手描き・型染の図解", "体験工程の明確化", "染料基礎知識を追加"],
    },
  ],
};

// ========================
// プレゼン用コンポーネント
// ========================

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f"];

function OverallStats({ cards }: { cards: KpiCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
        >
          <div className="mb-1 text-sm text-white/60">{c.label}</div>
          <div className="text-2xl font-semibold text-white/90">
            {c.value.toLocaleString()}
          </div>
          <div
            className={`text-sm ${c.diff >= 0 ? "text-green-400" : "text-red-400"}`}
          >
            {c.diff >= 0 ? "+" : ""}
            {c.diff}%
          </div>
        </div>
      ))}
    </div>
  );
}

function HighlightPanel({ highlights }: { highlights: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-base font-semibold">今月のハイライト</h3>
      <ul className="list-disc space-y-2 pl-5 text-sm text-white/90">
        {highlights.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function PieGraph({ title, data }: { title: string; data: SimpleRatioItem[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
            >
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RankingGraph({ data }: { data: SimpleRatioItem[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-base font-semibold">人気展示ランキング（ベスト10）</h3>
      <div className="h-80">
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="label"
              type="category"
              tick={{ fill: "#fff", fontSize: 12 }}
              width={100}
            />
            <Tooltip />
            <Bar dataKey="value" fill="#82ca9d" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function OverallChatSummaryView({ data }: { data: OverallChatSummaryData }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-white/70">
        総質問数：{data.totalQuestions.toLocaleString()} 件
      </div>
      <div>
        <div className="mb-1 text-sm text-white/70">主な質問テーマ</div>
        <ul className="space-y-1 text-sm">
          {data.mainThemes.map((t) => (
            <li key={t.label} className="flex items-center justify-between">
              <span>{t.label}</span>
              <span className="text-white/60">{Math.round(t.ratio * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="mb-1 text-sm text-white/70">AI要約</div>
        <p className="text-sm leading-relaxed text-white/90">{data.summary}</p>
      </div>
      <div>
        <div className="mb-1 text-sm text-white/70">提案・改善点</div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-white/90">
          {data.actions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CraftChatSummaryList({ items }: { items: CraftChatSummaryItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div
          key={it.craft}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-base font-semibold">{it.craft}</h4>
            <span className="text-sm text-white/60">
              質問数：{it.volume.toLocaleString()}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-sm text-white/70">主な意図</div>
              <ul className="space-y-1 text-sm">
                {it.topIntents.map((ti) => (
                  <li key={ti.label} className="flex items-center justify-between">
                    <span>{ti.label}</span>
                    <span className="text-white/60">{Math.round(ti.ratio * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1 text-sm text-white/70">AI要約</div>
              <p className="text-sm leading-relaxed text-white/90">{it.aiSummary}</p>
            </div>
          </div>
          <div className="mt-3 text-sm text-white/70">
            提案：{it.actions.join("／")}
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================
// エクスポートコンポーネント
// ========================

export default function MonthlyNarrativeDashboard() {
  const data = mockDashboardData; // 将来は API から取得した Object に差し替え

  return (
    <div className="min-h-screen w-full bg-[#0b1a2a] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b1a2ab3] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold md:text-xl">
            京都伝統産業ミュージアム｜{data.monthLabel} AIナラティブレポート
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <HighlightPanel highlights={data.highlights} />

        <Panel title="全体KPIサマリ">
          <OverallStats cards={data.kpiCards} />
        </Panel>

        <RankingGraph data={data.rankingData} />

        <div className="grid gap-4 md:grid-cols-2">
          <PieGraph title="言語別アクセス分布" data={data.languageData} />
          <PieGraph title="年齢別アクセス分布" data={data.ageData} />
        </div>

        <Panel title="全体：AIチャット質問ログの要約">
          <OverallChatSummaryView data={data.overallChatSummary} />
        </Panel>

        <Panel title="工芸別：AIチャット質問ログの要約">
          <CraftChatSummaryList items={data.craftChatSummaries} />
        </Panel>
      </main>
    </div>
  );
}
