import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-prod";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only protect /admin routes
  if (path.startsWith("/admin")) {
    // Allow access to login and register pages
    if (path === "/admin/login" || path === "/admin/register") {
      // If already logged in, redirect to dashboard
      const token = request.cookies.get("admin_token")?.value;
      if (token) {
        try {
          await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } catch (error) {
          // Invalid token, allow access to login
        }
      }
      return NextResponse.next();
    }

    // Protect all other admin routes
    const token = request.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
      return NextResponse.next();
    } catch (error) {
      // Invalid token
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
