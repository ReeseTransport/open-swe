import { Hono } from "hono";
import { createLogger, LogLevel } from "../utils/logger.js";

export const app = new Hono();

const requiredGithubEnvVars = [
  "GITHUB_APP_ID",
  "GITHUB_APP_PRIVATE_KEY",
  "GITHUB_WEBHOOK_SECRET",
];

const missingGithubEnvVars = requiredGithubEnvVars.filter((k) => !process.env[k]);

if (missingGithubEnvVars.length === 0) {
  // Lazily import the webhook handler so modules that instantiate GitHubApp
  // (which throws when env vars are missing) are not imported during startup.
  (async () => {
    try {
      const mod = await import("./github/unified-webhook.js");
      app.post("/webhooks/github", mod.unifiedWebhookHandler);
    } catch (err) {
      const logger = createLogger(LogLevel.ERROR, "AppInit");
      logger.error("Failed to initialize GitHub webhook route", { error: err });
    }
  })();
} else {
  const logger = createLogger(LogLevel.WARN, "AppInit");
  logger.warn(
    "GitHub integration disabled due to missing environment variables; running in local mode without GitHub.",
  );
}
