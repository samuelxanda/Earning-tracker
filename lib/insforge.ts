import { createBrowserClient } from "@insforge/sdk/ssr";

const client = createBrowserClient();

export function createClient() {
  return client;
}
