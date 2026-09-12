import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/kanban") ||
    pathname.startsWith("/profile");

  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Redirect unauthenticated users trying to access protected routes
  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    // Optionally preserve the attempted path for redirect after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users trying to access login/register to dashboard
  if (isAuthPage && token) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/kanban/:path*",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
