export type EnvValidationResult = {
  ok: boolean;
  missing: string[];
  invalid: string[];
};

function isEmpty(value: string | undefined | null): boolean {
  return !value || value.trim() === "";
}

function isPlaceholder(value: string | undefined | null): boolean {
  const v = (value ?? "").trim();
  if (v.length === 0) return true;
  const lower = v.toLowerCase();
  if (lower === "changeme") return true;
  if (lower.startsWith("your_") || lower.startsWith("your-")) return true;
  if (/^your[a-z0-9_-]*$/i.test(v)) return true;
  return false;
}

function isLikelyValidEncryptionKey(value: string): boolean {
  // Expect at least 32 chars; prefer hex-like content
  if (value.length < 32) return false;
  return /^[a-f0-9]+$/i.test(value) || value.length >= 32;
}

export function validateAgentEnv(): EnvValidationResult {
  const missing: string[] = [];
  const invalid: string[] = [];

  // Port must be 2025 for local setup alignment
  const port = process.env.PORT ?? "2025";
  if (port !== "2025") {
    invalid.push("PORT (expected 2025)");
  }

  // Encryption key
  const sek = process.env.SECRETS_ENCRYPTION_KEY;
  if (isEmpty(sek)) {
    missing.push("SECRETS_ENCRYPTION_KEY");
  } else if (!isLikelyValidEncryptionKey(sek!) || isPlaceholder(sek!)) {
    invalid.push("SECRETS_ENCRYPTION_KEY");
  }

  // LLM configuration: either GOOGLE_API_KEY or Vertex trio
  const googleApiKey = process.env.GOOGLE_API_KEY;
  const vProject = process.env.GOOGLE_VERTEX_PROJECT;
  const vLocation = process.env.GOOGLE_VERTEX_LOCATION;
  const vCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  const hasGoogleApiKey = !!googleApiKey && !isPlaceholder(googleApiKey);
  const hasVertexTrio =
    !!vProject &&
    !!vLocation &&
    !!vCreds &&
    !isPlaceholder(vProject) &&
    !isPlaceholder(vLocation) &&
    !isPlaceholder(vCreds);

  if (!hasGoogleApiKey && !hasVertexTrio) {
    if (isEmpty(googleApiKey)) {
      missing.push("GOOGLE_API_KEY (or Vertex trio)");
    } else if (isPlaceholder(googleApiKey)) {
      invalid.push("GOOGLE_API_KEY");
    }
    if (isEmpty(vProject)) missing.push("GOOGLE_VERTEX_PROJECT (or GOOGLE_API_KEY)");
    if (isEmpty(vLocation)) missing.push("GOOGLE_VERTEX_LOCATION (or GOOGLE_API_KEY)");
    if (isEmpty(vCreds)) missing.push("GOOGLE_APPLICATION_CREDENTIALS (or GOOGLE_API_KEY)");
  }

  return { ok: missing.length === 0 && invalid.length === 0, missing, invalid };
}