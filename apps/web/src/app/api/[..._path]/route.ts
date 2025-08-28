import { initApiPassthrough } from "langgraph-nextjs-api-passthrough";
import {
  GITHUB_TOKEN_COOKIE,
  GITHUB_INSTALLATION_ID_COOKIE,
  GITHUB_INSTALLATION_TOKEN_COOKIE,
  GITHUB_INSTALLATION_NAME,
  GITHUB_INSTALLATION_ID,
  LOCAL_MODE_HEADER,
} from "@open-swe/shared/constants";
import {
  getGitHubInstallationTokenOrThrow,
  getInstallationNameFromReq,
  getGitHubAccessTokenOrThrow,
} from "./utils";
import { encryptSecret } from "@open-swe/shared/crypto";

export const { GET, POST, PUT, PATCH, DELETE, OPTIONS, runtime } =
  initApiPassthrough({
    apiUrl: process.env.LANGGRAPH_API_URL ?? "http://localhost:2025",
    runtime: "edge",
    disableWarningLog: true,
    bodyParameters: (req, body) => {
      if (body.config?.configurable && "apiKeys" in body.config.configurable) {
        const encryptionKey = process.env.SECRETS_ENCRYPTION_KEY;
        if (!encryptionKey) {
          throw new Error(
            "SECRETS_ENCRYPTION_KEY environment variable is required",
          );
        }

        const apiKeys = body.config.configurable.apiKeys;
        const encryptedApiKeys: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(apiKeys)) {
          if (typeof value === "string" && value.trim() !== "") {
            encryptedApiKeys[key] = encryptSecret(value, encryptionKey);
          } else {
            encryptedApiKeys[key] = value;
          }
        }

        body.config.configurable.apiKeys = encryptedApiKeys;
        return body;
      }
      return body;
    },
    headers: async (req) => {
      const encryptionKey = process.env.SECRETS_ENCRYPTION_KEY;
      if (!encryptionKey) {
        throw new Error(
          "SECRETS_ENCRYPTION_KEY environment variable is required",
        );
      }

      const forwarded: Record<string, string> = {};

      // Filter out sensitive headers
      const sensitiveHeaders = new Set([
        "authorization",
        "cookie",
        "set-cookie",
        "x-api-key",
        "x-auth-token",
        "proxy-authorization",
        "x-forwarded-for",
        "x-real-ip",
      ]);

      // Forward non-sensitive headers
      req.headers.forEach((value, key) => {
        if (!sensitiveHeaders.has(key.toLowerCase())) {
          forwarded[key] = value;
        }
      });

      if (
        process.env.OPEN_SWE_LOCAL_MODE === "true" &&
        req.headers.get(LOCAL_MODE_HEADER) !== "true"
      ) {
        forwarded[LOCAL_MODE_HEADER] = "true";
      }

      if (process.env.NODE_ENV !== "production") {
        return forwarded;
      }

      const installationIdCookie = req.cookies.get(
        GITHUB_INSTALLATION_ID_COOKIE,
      )?.value;

      if (!installationIdCookie) {
        return forwarded;
      }

      if (
        !process.env.GITHUB_APP_ID ||
        !process.env.GITHUB_APP_PRIVATE_KEY
      ) {
        return forwarded;
      }

      try {
        const [installationToken, installationName] = await Promise.all([
          getGitHubInstallationTokenOrThrow(installationIdCookie, encryptionKey),
          getInstallationNameFromReq(req.clone(), installationIdCookie),
        ]);

        return {
          ...forwarded,
          [GITHUB_TOKEN_COOKIE]: getGitHubAccessTokenOrThrow(req, encryptionKey),
          [GITHUB_INSTALLATION_TOKEN_COOKIE]: installationToken,
          [GITHUB_INSTALLATION_NAME]: installationName,
          [GITHUB_INSTALLATION_ID]: installationIdCookie,
        };
      } catch {
        return forwarded;
      }
    },
  });
