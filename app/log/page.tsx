import { redirect } from "next/navigation";

import { resolveLatestMonthSlug } from "./data";

export default function LogIndexPage() {
  const slug = resolveLatestMonthSlug();
  redirect(`/log/${slug}`);
}
