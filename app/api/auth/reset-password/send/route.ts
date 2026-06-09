import { NextResponse } from "next/server";
import { createServerClient } from "@insforge/sdk/ssr";

export async function POST(request: Request) {
  try {
    const client = createServerClient();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const { error } = await client.auth.sendResetPasswordEmail({
      email,
    });

    if (error) {
      return NextResponse.json(
        { error: error.error, message: error.message },
        { status: error.statusCode ?? 400 }
      );
    }

    return NextResponse.json({ success: true, email });
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to send reset email" },
      { status: 500 }
    );
  }
}
