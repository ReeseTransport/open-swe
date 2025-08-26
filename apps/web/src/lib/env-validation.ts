export type EnvValidationResult = {
  ok: boolean;
  missing: string[];
  invalid: string[];
  details?: {
    port?: string;
    proxyUrl?: string;
    localMode?: boolean;
  };
};

function isEmpty(v: string | undefined | null): boolean {
  return !v || v.trim() === "";
}

function isPlaceholder(v: string): boolean {
  const s = v.trim();
  if (s.length === 0) return true;
  const lower = s.toLowerCase();
  if (lower === "changeme") return true;
  if (lower.startsWith("your_") || lower.startsWith("your-")) return true;
  if (/^your[a-z0-9_-]*$/i.test(s)) return true;
  return false;
}

function isLikelyValidEncryptionKey(v: string): boolean {
  if (v.length < 32) return false;
  return /^[a-f0-9]+$/i.test(v) || v.length >= 32;
}

export function validateWebEnv(): EnvValidationResult {
  const missing: string[] = [];
  const invalid: string[] = [];

  const port = process.env.PORT ?? "3001";
  if (port !== "3001") {
    invalid.push("PORT (expected 3001)");
  }

  const proxyUrl = process.env.LANGGRAPH_API_URL ?? "http://localhost:2025";
  if (isEmpty(proxyUrl)) {
    missing.push("LANGGRAPH_API_URL");
  } else if (isPlaceholder(proxyUrl)) {
    invalid.push("LANGGRAPH_API_URL");
  }

  const sek = process.env.SECRETS_ENCRYPTION_KEY;
  if (isEmpty(sek)) {
    missing.push("SECRETS_ENCRYPTION_KEY");
  } else if (!isLikelyValidEncryptionKey(sek!) || isPlaceholder(sek!)) {
    invalid.push("SECRETS_ENCRYPTION_KEY");
  }

  const localMode = process.env.OPEN_SWE_LOCAL_MODE === "true" || process.env.NODE_ENV !== "production";

  const ghClientId =
    process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID ??
    process.env.GITHUB_CLIENT_ID ??
    "";
  const ghClientSecret =
    process.env.GITHUB_APP_PRIVATE_KEY ??
    process.env.GITHUB_CLIENT_SECRET ??
    "";

  if (!localMode) {
    if (isEmpty(ghClientId)) missing.push("GITHUB_CLIENT_ID");
    if (isEmpty(ghClientSecret)) missing.push("GITHUB_CLIENT_SECRET");
    if (!isEmpty(ghClientId) && isPlaceholder(ghClientId))
      invalid.push("GITHUB_CLIENT_ID");
    if (!isEmpty(ghClientSecret) && isPlaceholder(ghClientSecret))
      invalid.push("GITHUB_CLIENT_SECRET");
  }

  return {
    ok: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
    details: { port, proxyUrl, localMode },
  };
}