import { NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";

export async function POST(request: Request) {
  try {
    const client = createServerClient();
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "Email, code, and new password are required" },
        { status: 400 }
      );
    }

    const { data, error } = await client.auth.exchangeResetPasswordToken({
      email,
      code,
    });

    if (error || !data?.token) {
      return NextResponse.json(
        { error: error?.error ?? "INVALID_CODE", message: error?.message ?? "Invalid or expired code" },
        { status: error?.statusCode ?? 400 }
      );
    }

    const { error: resetError } = await client.auth.resetPassword({
      newPassword,
      otp: data.token,
    });

    if (resetError) {
      return NextResponse.json(
        { error: resetError.error, message: resetError.message },
        { status: resetError.statusCode ?? 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to reset password" },
      { status: 500 }
    );
  }
}
