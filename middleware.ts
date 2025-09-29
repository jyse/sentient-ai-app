import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const {
    data: { session }
  } = await supabase.auth.getSession();

  // Auth condition checks
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isPublicPage = req.nextUrl.pathname === "/" || isAuthPage;

  // If user is not signed in and trying to access protected routes
  if (!session && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If user is signed in and trying to access auth pages, redirect to app
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
};
