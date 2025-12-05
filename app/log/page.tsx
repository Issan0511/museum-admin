import { redirect } from "next/navigation";

import { resolveDefaultMonthSlug } from "./data";

export default function LogIndexPage() {
  const slug = resolveDefaultMonthSlug();
  redirect(`/log/${slug}`);
}
