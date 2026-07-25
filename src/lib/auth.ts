export const AUTH_COOKIE = "cs_auth";

/** Session token derived from the site password (Web Crypto: works in middleware and Node). */
export async function expectedToken(): Promise<string> {
  const data = new TextEncoder().encode(
    "computer-solution-salt:" + (process.env.SITE_PASSWORD ?? "")
  );
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
