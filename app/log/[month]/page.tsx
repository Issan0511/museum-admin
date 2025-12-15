import LogMonthClient from "./LogMonthClient";

export default async function LogMonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  return <LogMonthClient month={month} />;
}
