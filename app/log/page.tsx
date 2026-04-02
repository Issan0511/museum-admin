import { redirect } from "next/navigation";

import { getLogDashboardCollection } from "./server-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LogIndexPage() {
  const { latestMonth } = await getLogDashboardCollection();
  const slug = latestMonth;
  redirect(`/log/${slug}`);
}
