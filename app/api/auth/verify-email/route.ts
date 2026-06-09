import { NextResponse } from "next/server";
import { createServerClient, setAuthCookies } from "@insforge/sdk/ssr";

export async function POST(request: Request) {
  try {
    const client = createServerClient();
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    const { data, error } = await client.auth.verifyEmail({ email, otp });

    if (error) {
      return NextResponse.json(
        { error: error.error, message: error.message },
        { status: error.statusCode ?? 400 }
      );
    }

    const response = NextResponse.json({ user: data?.user ?? null });
    if (data?.accessToken) {
      setAuthCookies(response.cookies, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Verification failed" },
      { status: 500 }
    );
  }
}
