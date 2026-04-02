import { redirect } from "next/navigation";

import LogMonthClient from "./LogMonthClient";
import { getLogDashboardMonthData } from "../server-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LogMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const { data, availableMonthOptions, latestMonth } =
    await getLogDashboardMonthData(month);

  if (!data) {
    redirect(`/log/${latestMonth}`);
  }

  return (
    <LogMonthClient
      month={month}
      data={data}
      availableMonths={availableMonthOptions}
    />
  );
}
