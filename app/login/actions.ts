"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const AUTH_COOKIE_NAME = "admin_auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get("password");
  const redirectTo = formData.get("redirectTo");

  if (password !== ADMIN_PASSWORD) {
    return { error: "パスワードが違います。" };
  }

  const cookieStore = await cookies();
  cookieStore.set({
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
