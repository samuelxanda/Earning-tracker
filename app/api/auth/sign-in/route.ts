import { NextResponse } from "next/server";
import { createServerClient, setAuthCookies } from "@insforge/sdk/ssr";

export async function POST(request: Request) {
  try {
    const client = createServerClient();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.accessToken) {
      return NextResponse.json(
        {
          error: error?.error ?? "AUTH_UNAUTHORIZED",
          message: error?.message ?? "Sign in failed",
        },
        { status: error?.statusCode ?? 401 }
      );
    }

    const response = NextResponse.json({ user: data.user });
    setAuthCookies(response.cookies, {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Sign in failed" },
      { status: 500 }
    );
  }
}
