import { NextResponse, type NextRequest } from "next/server";

const publicRoutes = ["/auth", "/api/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  const hasToken =
    request.cookies.has("insforge_access_token") ||
    request.cookies.has("insforge_refresh_token");

  if (!isPublic && !hasToken && pathname.startsWith("/earnings")) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (pathname.startsWith("/auth") && hasToken) {
    return NextResponse.redirect(new URL("/earnings", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
