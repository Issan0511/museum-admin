import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "admin_auth";
const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  const hasAuthCookie = request.cookies.has(AUTH_COOKIE_NAME);

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    if (hasAuthCookie) {
      const redirectTo = request.nextUrl.searchParams.get("redirect") || "/";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.next();
  }

  if (!hasAuthCookie) {
    const loginUrl = new URL("/login", request.url);
    const redirectTarget = `${pathname}${search}`;
    loginUrl.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
