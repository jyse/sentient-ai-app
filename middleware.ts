import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({
            name,
            value,
            ...options
          });
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({
            name,
            value: "",
            ...options
          });
        }
      }
    }
  );

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");

  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    // If there's an auth error or no session, treat as logged out
    if (error || !session) {
      if (!isAuthPage) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return response;
    }

    // If logged in and trying to access login page, redirect to home
    if (session && isAuthPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  } catch (error) {
    // Handle any unexpected errors gracefully
    console.error("Middleware auth error:", error);

    // If error occurs and not on auth page, redirect to login
    if (!isAuthPage) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
