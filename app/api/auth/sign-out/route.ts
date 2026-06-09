import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@insforge/sdk/ssr";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const client = createServerClient({
      cookies: cookieStore,
    });
    await client.auth.signOut();

    const response = NextResponse.json({ success: true });
    response.cookies.set("insforge_access_token", "", { maxAge: 0, path: "/" });
    response.cookies.set("insforge_refresh_token", "", { maxAge: 0, path: "/" });

    return response;
  } catch {
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Sign out failed" },
      { status: 500 }
    );
  }
}
