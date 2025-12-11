"use client";

import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { useFormState } from "react-dom";

const ADMIN_PASSWORD = "densan2026";
const AUTH_COOKIE_NAME = "admin_auth";

type LoginState = {
  error?: string;
};

async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  "use server";

  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");

  if (password !== ADMIN_PASSWORD) {
    return { error: "パスワードが違います。" };
  }

  cookies().set({
    name: AUTH_COOKIE_NAME,
    value: "granted",
    httpOnly: true,
    maxAge: 60 * 60, // 1 hour
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const redirectPath =
    typeof redirectTo === "string" && redirectTo.startsWith("/")
      ? redirectTo
      : "/";

  redirect(redirectPath);
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const redirectTo = searchParams?.redirect || "/";
  const [state, formAction] = useFormState(loginAction, {});

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-xs font-medium tracking-wide text-indigo-600">Museum Admin</p>
          <h1 className="text-2xl font-semibold text-slate-900">管理画面ログイン</h1>
          <p className="text-sm text-slate-600">
            管理画面の閲覧にはパスワードが必要です。
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <label className="block space-y-1">
            <span className="text-sm font-medium text-slate-800">パスワード</span>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="パスワードを入力"
            />
          </label>

          {state.error && (
            <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            ログイン
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="text-indigo-600 hover:underline">
            トップに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
