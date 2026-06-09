import { NextResponse } from "next/server";
import { createServerClient, setAuthCookies } from "@insforge/sdk/ssr";

export async function POST(request: Request) {
  try {
    const client = createServerClient();
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      name,
    });

    if (error) {
      return NextResponse.json(
        { error: error.error, message: error.message },
        { status: error.statusCode ?? 400 }
      );
    }

    if (data?.requireEmailVerification) {
      return NextResponse.json({ requireEmailVerification: true, email });
    }

    if (data?.accessToken) {
      const response = NextResponse.json({ user: data.user });
      setAuthCookies(response.cookies, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return response;
    }

    return NextResponse.json({ user: data?.user ?? null });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Sign up failed" },
      { status: 500 }
    );
  }
}
