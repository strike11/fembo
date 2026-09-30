import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { isMaintenanceMode } from "@/lib/env";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    isMaintenanceMode() &&
    pathname !== "/maintenance" &&
    pathname !== "/uptime" &&
    pathname !== "/support" &&
    !pathname.startsWith("/api/health") &&
    !pathname.startsWith("/api/ready") &&
    !pathname.startsWith("/api/abuse") &&
    !pathname.startsWith("/.well-known")
  ) {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }
  const sessionCookie = getSessionCookie(request);

  if (pathname.startsWith("/app") && !sessionCookie) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if ((pathname === "/login" || pathname === "/register") && sessionCookie) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/:path*",
    "/login",
    "/register",
    "/",
    "/privacy",
    "/terms",
    "/age",
    "/whats-new",
    "/uptime",
    "/support",
  ],
};
