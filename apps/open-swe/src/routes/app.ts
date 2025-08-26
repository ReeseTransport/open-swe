import { Hono } from "hono";
import { unifiedWebhookHandler } from "./github/unified-webhook.js";
import { validateAgentEnv } from "../utils/env-validation.js";

export const app = new Hono();

app.get("/health", (c) => {
  const result = validateAgentEnv();
  if (!result.ok) {
    return c.json(
      { ok: false, missing: result.missing, invalid: result.invalid },
      500,
    );
  }
  return c.json({ ok: true }, 200);
});

app.post("/webhooks/github", unifiedWebhookHandler);
