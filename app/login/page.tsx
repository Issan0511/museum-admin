import { LoginForm } from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const redirectTo = searchParams?.redirect || "/";

  return <LoginForm redirectTo={redirectTo} />;
}
