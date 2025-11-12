import Link from "next/link";
import {
  adminChatAggregatesMonthly,
  adminChatSummaries,
  adminKpiMonthly,
  type AdminChatAggregatesMonthlyRow,
} from "@/lib/dummyLogs";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

function groupAggregatesByCraft(rows: AdminChatAggregatesMonthlyRow[]) {
  return rows.reduce<Record<string, AdminChatAggregatesMonthlyRow[]>>(
    (acc, row) => {
      if (!acc[row.craft]) {
        acc[row.craft] = [];
      }
      acc[row.craft].push(row);
      return acc;
    },
    {}
  );
}

export default function LogPage() {
  const aggregatesByCraft = groupAggregatesByCraft(adminChatAggregatesMonthly);
  const craftEntries = Object.entries(aggregatesByCraft)
    .map(([craft, rows]) => [
      craft,
      [...rows].sort((a, b) => a.month.localeCompare(b.month)),
    ] as const)
    .sort((a, b) => a[0].localeCompare(b[0]));
  const sortedKpis = [...adminKpiMonthly].sort((a, b) =>
    a.month.localeCompare(b.month)
  );
  const sortedSummaries = [...adminChatSummaries].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Engagement Logs</h1>
          <p className="mt-1 text-sm text-slate-500">
            Snapshot of monthly KPIs, chat channel performance, and curator
            follow-ups.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          ← Back to dashboard
        </Link>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Monthly KPI Overview</h2>
          <p className="text-sm text-slate-500">
            Highlights of visitor trends and exhibition performance sourced from
            admin_kpi_monthly.csv.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedKpis.map((row) => (
            <article
              key={row.month}
              className="flex h-full flex-col justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <header className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {row.month}
                </h3>
                <p className="text-sm text-slate-500">
                  {row.exhibitionHighlights.join(" • ")}
                </p>
              </header>
              <dl className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-slate-700">Visitors</dt>
                  <dd>{row.totalVisitors.toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-slate-700">New members</dt>
                  <dd>{row.newMembers.toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-slate-700">Gift shop</dt>
                  <dd>{formatCurrency(row.giftShopRevenue)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-medium text-slate-700">Satisfaction</dt>
                  <dd>{row.satisfactionScore.toFixed(1)} / 5</dd>
                </div>
              </dl>
              <footer className="mt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Channel breakdown
                </h4>
                <ul className="mt-2 space-y-1 text-xs text-slate-500">
                  {row.channelBreakdown.map((channel) => (
                    <li key={channel.channel} className="flex justify-between">
                      <span>{channel.channel}</span>
                      <span>{channel.visitors.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Chat Aggregates</h2>
          <p className="text-sm text-slate-500">
            Combined monthly metrics grouped by craft from admin_chat_aggregates_monthly.csv.
          </p>
        </div>
        <div className="space-y-6">
          {craftEntries.map(([craft, rows]) => (
            <article
              key={craft}
              className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <header className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{craft}</h3>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {rows.length} monthly entries
                </p>
              </header>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-medium">Month</th>
                      <th className="px-3 py-2 font-medium">Conversations</th>
                      <th className="px-3 py-2 font-medium">Avg. response</th>
                      <th className="px-3 py-2 font-medium">Sentiment</th>
                      <th className="px-3 py-2 font-medium">Top topics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {rows.map((row) => (
                      <tr key={`${row.month}-${row.craft}`}>
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {row.month}
                        </td>
                        <td className="px-3 py-2">
                          {row.totalConversations.toLocaleString()}
                        </td>
                        <td className="px-3 py-2">
                          {row.avgResponseTimeSeconds} sec
                        </td>
                        <td className="px-3 py-2">
                          <div className="space-y-1 text-xs text-slate-500">
                            <p>
                              Positive: {row.sentiment.positive}% · Neutral: {" "}
                              {row.sentiment.neutral}% · Negative: {" "}
                              {row.sentiment.negative}%
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <ul className="list-disc space-y-1 pl-5 text-xs text-slate-500">
                            {row.topTopics.map((topic) => (
                              <li key={topic}>{topic}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Chat Summaries & Recommendations</h2>
          <p className="text-sm text-slate-500">
            Curated narratives with next steps from admin_chat_summaries.csv.
          </p>
        </div>
        <div className="space-y-4">
          {sortedSummaries.map((row) => (
            <article
              key={`${row.date}-${row.craft}`}
              className="space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {row.craft}
                  </h3>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    {row.date}
                  </p>
                </div>
                {row.metadata.needsEscalation && (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                    Needs escalation
                  </span>
                )}
              </header>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="leading-relaxed">{row.summary}</p>
                <div className="rounded-md bg-slate-50 p-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Recommendation
                  </h4>
                  <p className="mt-1 text-sm text-slate-700">
                    {row.recommendation}
                  </p>
                </div>
              </div>
              <footer className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Trending questions
                </h4>
                <ul className="list-disc space-y-1 pl-5 text-xs text-slate-500">
                  {row.metadata.trendingQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
                <p className="text-xs text-slate-400">{row.metadata.notes}</p>
              </footer>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
