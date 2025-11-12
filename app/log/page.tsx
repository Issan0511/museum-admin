import Link from "next/link";
import {
  adminChatAggregatesMonthly,
  adminChatSummaries,
  adminKpiMonthly,
  type AdminChatAggregatesMonthlyRow,
  type AdminChatSummaryRow,
} from "@/lib/dummyLogs";

export const dynamic = "force-dynamic";

const craftNameMap: Record<number, string> = {
  1: "西陣織", // Nishijin weaving
  2: "京焼・清水焼", // Kyo ware & Kiyomizu ware
  3: "京友禅", // Kyo Yuzen dyeing
};

function formatMonthLabel(yyyymm: string) {
  const [year, month] = yyyymm.split("-");
  return `${year}年${Number(month)}月`;
}

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  }).format(new Date(timestamp));
}

function distributionEntries(distribution: Record<string, number>) {
  return Object.entries(distribution).sort(([, aCount], [, bCount]) => bCount - aCount);
}

function groupAggregatesByCraft(rows: AdminChatAggregatesMonthlyRow[]) {
  return rows.reduce<Record<number, AdminChatAggregatesMonthlyRow[]>>(
    (acc, row) => {
      if (!acc[row.craftId]) {
        acc[row.craftId] = [];
      }
      acc[row.craftId].push(row);
      return acc;
    },
    {}
  );
}

function groupSummariesByCraft(rows: AdminChatSummaryRow[]) {
  return rows.reduce<Record<number, AdminChatSummaryRow[]>>((acc, row) => {
    if (row.scope.type !== "craft") {
      return acc;
    }

    if (!acc[row.scope.craftId]) {
      acc[row.scope.craftId] = [];
    }

    acc[row.scope.craftId].push(row);
    return acc;
  }, {});
}

function getCraftLabel(craftId: number) {
  return craftNameMap[craftId] ?? `工芸ID ${craftId}`;
}

function formatLangCode(code: string) {
  switch (code) {
    case "ja":
      return "日本語";
    case "en":
      return "英語";
    case "zh":
      return "中国語";
    default:
      return code.toUpperCase();
  }
}

export default function LogPage() {
  const aggregatesByCraft = groupAggregatesByCraft(adminChatAggregatesMonthly);
  const craftAggregateEntries = Object.entries(aggregatesByCraft)
    .map(([craftId, rows]) => [
      Number(craftId),
      [...rows].sort((a, b) => a.yyyymm.localeCompare(b.yyyymm)),
    ] as const)
    .sort((a, b) => a[0] - b[0]);

  const sortedKpis = [...adminKpiMonthly].sort((a, b) =>
    a.yyyymm.localeCompare(b.yyyymm)
  );

  const overallSummaries = adminChatSummaries
    .filter((summary) => summary.scope.type === "overall")
    .sort((a, b) => a.period.localeCompare(b.period));

  const craftSummaries = groupSummariesByCraft(adminChatSummaries);
  const craftSummaryEntries = Object.entries(craftSummaries)
    .map(([craftId, summaries]) => [
      Number(craftId),
      [...summaries].sort((a, b) => a.period.localeCompare(b.period)),
    ] as const)
    .sort((a, b) => a[0] - b[0]);

  return (
    <div className="space-y-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">ログレポート</h1>
          <p className="mt-1 text-sm text-slate-500">
            CSVログから再現した月次KPI、チャット集計、サマリーを確認できます。
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          ← ダッシュボードに戻る
        </Link>
      </header>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">月次KPI</h2>
          <p className="text-sm text-slate-500">
            admin_kpi_monthly.csv の指標を整形し、言語別・年代別の構成比も表示します。
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedKpis.map((row) => (
            <article
              key={row.yyyymm}
              className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <header className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {formatMonthLabel(row.yyyymm)}
                </h3>
                <p className="text-xs text-slate-400">
                  更新: {formatTimestamp(row.createdAt)}
                </p>
              </header>
              <dl className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-slate-700">来訪者数</dt>
                  <dd>{row.visits.toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-slate-700">ショップ導線</dt>
                  <dd>{row.shopClicks.toLocaleString()}</dd>
                </div>
              </dl>
              <div className="mt-4 grid gap-4 text-xs text-slate-500 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold uppercase tracking-wide text-slate-500">
                    言語別
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {distributionEntries(row.langDist).map(([lang, count]) => (
                      <li key={lang} className="flex justify-between">
                        <span>{formatLangCode(lang)}</span>
                        <span>{count.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold uppercase tracking-wide text-slate-500">
                    年代別
                  </h4>
                  <ul className="mt-2 space-y-1">
                    {distributionEntries(row.ageDist).map(([age, count]) => (
                      <li key={age} className="flex justify-between">
                        <span>{age}</span>
                        <span>{count.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">チャット集計</h2>
          <p className="text-sm text-slate-500">
            admin_chat_aggregates_monthly.csv から工芸別に整形したボリューム・言語構成・インサイトです。
          </p>
        </div>
        <div className="space-y-8">
          {craftAggregateEntries.map(([craftId, rows]) => (
            <article
              key={craftId}
              className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  {getCraftLabel(craftId)}
                </h3>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  月次エントリー {rows.length} 件
                </p>
              </header>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">月</th>
                      <th className="px-3 py-2 font-medium">チャット件数</th>
                      <th className="px-3 py-2 font-medium">UI言語</th>
                      <th className="px-3 py-2 font-medium">検出言語</th>
                      <th className="px-3 py-2 font-medium">キーワード</th>
                      <th className="px-3 py-2 font-medium">意図</th>
                      <th className="px-3 py-2 font-medium">サンプル質問</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {rows.map((row) => (
                      <tr key={`${row.yyyymm}-${row.craftId}`}>
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {formatMonthLabel(row.yyyymm)}
                        </td>
                        <td className="px-3 py-2">
                          {row.volume.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <ul className="space-y-1 text-xs text-slate-500">
                            {distributionEntries(row.langUiDist).map(([lang, count]) => (
                              <li key={lang} className="flex justify-between">
                                <span>{formatLangCode(lang)}</span>
                                <span>{count.toLocaleString()}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <ul className="space-y-1 text-xs text-slate-500">
                            {distributionEntries(row.langDetectedDist).map(
                              ([lang, count]) => (
                                <li key={lang} className="flex justify-between">
                                  <span>{formatLangCode(lang)}</span>
                                  <span>{count.toLocaleString()}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </td>
                        <td className="px-3 py-2 align-top">
                          {row.topKeywords.length > 0 ? (
                            <ul className="space-y-1 text-xs text-slate-500">
                              {row.topKeywords.map((keyword) => (
                                <li
                                  key={`${row.yyyymm}-${keyword.keyword}`}
                                  className="flex justify-between"
                                >
                                  <span className="truncate pr-2">
                                    {keyword.keyword}
                                  </span>
                                  <span>{keyword.count}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-400">データなし</p>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          {row.topIntents.length > 0 ? (
                            <ul className="space-y-1 text-xs text-slate-500">
                              {row.topIntents.map((intent) => (
                                <li
                                  key={`${row.yyyymm}-${intent.intent}`}
                                  className="flex justify-between"
                                >
                                  <span className="truncate pr-2">
                                    {intent.intent}
                                  </span>
                                  <span>{intent.count}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-400">データなし</p>
                          )}
                        </td>
                        <td className="px-3 py-2 align-top">
                          <ul className="space-y-1 text-xs text-slate-500">
                            {row.sampleQa.map((qa, index) => (
                              <li key={`${row.yyyymm}-qa-${index}`}>{qa.question}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 0 && (
                <p className="text-right text-xs text-slate-400">
                  最終更新: {formatTimestamp(rows[rows.length - 1].updatedAt)}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">サマリー & 推奨アクション</h2>
          <p className="text-sm text-slate-500">
            admin_chat_summaries.csv を Markdown から整形し、全体と工芸別の洞察を表示します。
          </p>
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">全体サマリー</h3>
            <div className="space-y-4">
              {overallSummaries.map((summary) => (
                <article
                  key={`${summary.scope.raw}-${summary.period}`}
                  className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">
                        {formatMonthLabel(summary.period)}
                      </h4>
                      <p className="text-xs text-slate-400">
                        更新: {formatTimestamp(summary.createdAt)}
                      </p>
                    </div>
                  </header>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {summary.summaryMd}
                  </p>
                  <div className="rounded-md bg-slate-50 p-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      推奨アクション
                    </h5>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {summary.recommendations.map((recommendation) => (
                        <li key={recommendation}>{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">工芸別サマリー</h3>
            <div className="space-y-6">
              {craftSummaryEntries.map(([craftId, summaries]) => (
                <article
                  key={`summary-${craftId}`}
                  className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900">
                        {getCraftLabel(craftId)}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {summaries.length} 件のサマリー
                      </p>
                    </div>
                  </header>
                  <div className="space-y-4">
                    {summaries.map((summary) => (
                      <div
                        key={`${summary.scope.raw}-${summary.period}`}
                        className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-sm font-medium text-slate-700">
                            {formatMonthLabel(summary.period)}
                          </span>
                          <span className="text-xs text-slate-400">
                            更新: {formatTimestamp(summary.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {summary.summaryMd}
                        </p>
                        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                          {summary.recommendations.map((recommendation) => (
                            <li key={recommendation}>{recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
