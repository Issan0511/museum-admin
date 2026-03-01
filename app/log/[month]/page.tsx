import { redirect } from "next/navigation";

import LogMonthClient from "./LogMonthClient";
import { monthlyDashboardData, resolveLatestMonthSlug } from "../data";

export default async function LogMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  if (!monthlyDashboardData[month]) {
    redirect(`/log/${resolveLatestMonthSlug()}`);
  }
  return <LogMonthClient month={month} />;
}
