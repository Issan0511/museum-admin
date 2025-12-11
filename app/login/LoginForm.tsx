"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import { loginAction, type LoginState } from "./actions";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const initialState: LoginState = {};
  const [state, formAction] = useFormState<LoginState, FormData>(
    loginAction,
    initialState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow">
        <div className="mb-6 space-y-2 text-center">
          <p className="text-xs font-medium tracking-wide text-indigo-600">Museum Admin</p>
          <h1 className="text-2xl font-semibold text-slate-900">管理画面ログイン</h1>
          <p className="text-sm text-slate-600">管理画面の閲覧にはパスワードが必要です。</p>
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


      </div>
    </div>
  );
}
