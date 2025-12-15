"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

import {
  MonthlyDashboardData,
  availableMonths,
  monthlyDashboardData,
} from "../data";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f"];

function OverallStats({ cards }: { cards: MonthlyDashboardData["kpiCards"] }) {
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

function PieGraph({ title, data }: { title: string; data: MonthlyDashboardData["languageData"] }) {
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

function RankingGraph({ data }: { data: MonthlyDashboardData["rankingData"] }) {
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

function OverallChatSummaryView({ data }: { data: MonthlyDashboardData["overallChatSummary"] }) {
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

function CraftChatSummaryList({ items }: { items: MonthlyDashboardData["craftChatSummaries"] }) {
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

function MonthMenu({
  currentMonth,
  onClose,
}: {
  currentMonth: string;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-lg border border-white/10 bg-[#0f2236] shadow-lg">
      <div className="px-3 py-2 text-xs text-white/60">月を選択</div>
      <div className="divide-y divide-white/5">
        {availableMonths.map((month) => (
          <Link
            key={month}
            href={`/log/${month}`}
            className={`block px-4 py-3 text-sm transition hover:bg-white/5 ${
              month === currentMonth ? "bg-white/10 font-semibold" : ""
            }`}
            onClick={onClose}
          >
            {monthlyDashboardData[month]?.monthLabel ?? month}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function MonthlyNarrativeDashboard({
  params,
}: {
  params: { month: string };
}) {
  const { month } = params;
  const data = useMemo(() => monthlyDashboardData[month], [month]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [month]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1a2a] text-white">
        <div className="space-y-3 text-center">
          <p className="text-lg font-semibold">対象の月データが見つかりません。</p>
          <div className="text-sm text-white/70">
            メニューから10月または11月を選択してください。
          </div>
          <div className="flex justify-center gap-3">
            {availableMonths.map((month) => (
              <Link
                key={month}
                href={`/log/${month}`}
                className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
              >
                {monthlyDashboardData[month]?.monthLabel ?? month}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0b1a2a] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b1a2ab3] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold md:text-xl">
            京都伝統産業ミュージアム｜{data.monthLabel} AIナラティブレポート
          </h1>
          <div className="relative">
            <button
              aria-label="月を選択"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/10 hover:bg-white/20"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <span className="sr-only">月選択メニュー</span>
              <div className="space-y-1">
                <span className="block h-0.5 w-6 bg-white"></span>
                <span className="block h-0.5 w-6 bg-white"></span>
                <span className="block h-0.5 w-6 bg-white"></span>
              </div>
            </button>
            {menuOpen ? (
              <MonthMenu currentMonth={month} onClose={() => setMenuOpen(false)} />
            ) : null}
          </div>
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
