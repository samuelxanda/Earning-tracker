import { InsForgeClient } from "@insforge/sdk";

let client: InsForgeClient | null = null;

export function createClient() {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_INSFORGE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;

    if (!url || !anonKey) {
      throw new Error("InsForge credentials not configured");
    }

    client = new InsForgeClient({
      baseUrl: url,
      anonKey,
    });
  }

  return client;
}