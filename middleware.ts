import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Route protection middleware — redirects unauthenticated users away from /dashboard */
export async function middleware(request: NextRequest) {
  const session = request.cookies.get("__session");
  const { pathname } = request.nextUrl;

  // Public routes: allow access, redirect to dashboard if already logged in
  const publicRoutes = ["/login", "/register"];
  if (publicRoutes.includes(pathname)) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Protected routes: redirect to login if no session cookie
  if (!session && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
