# Open SWE Environment Matrix and Runbook (Local Dev)

Scope
- Exact env variables required for local development of agent and web apps; placement; value relations; Windows notes; verification steps.

Apps and Files
- Agent env file: ["apps/open-swe/.env"](./apps/open-swe/.env) (copy from ["apps/open-swe/.env.example"](./apps/open-swe/.env.example))
- Web env file: ["apps/web/.env"](./apps/web/.env) (copy from ["apps/web/.env.example"](./apps/web/.env.example))
- Reference configs: ["langgraph.json"](./langgraph.json), ["apps/open-swe/package.json"](./apps/open-swe/package.json), ["apps/web/package.json"](./apps/web/package.json)

Minimal Required Values (Local)
- apps/open-swe/.env (agent)
  - One LLM key: ANTHROPIC_API_KEY or OPENAI_API_KEY or GOOGLE_API_KEY
  - SECRETS_ENCRYPTION_KEY: 32-byte hex; must equal web’s key
  - OPEN_SWE_APP_URL: http://localhost:3001
  - PORT: "2025" (default; change only if 2025 is busy)
- apps/web/.env (web)
  - NEXT_PUBLIC_API_URL: http://localhost:3001/api
  - LANGGRAPH_API_URL: http://localhost:2025 (must match agent PORT)
  - SECRETS_ENCRYPTION_KEY: same 32-byte hex as agent

Optional but Common
- Tracing (agent): LANGCHAIN_TRACING_V2="true", LANGCHAIN_API_KEY, LANGCHAIN_PROJECT
- Tools (agent): DAYTONA_API_KEY, FIRECRAWL_API_KEY
- GitHub Integration
  - Agent: GITHUB_APP_NAME, GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY (multiline), GITHUB_WEBHOOK_SECRET, GITHUB_TRIGGER_USERNAME
  - Web: NEXT_PUBLIC_GITHUB_APP_CLIENT_ID, GITHUB_APP_CLIENT_SECRET, GITHUB_APP_REDIRECT_URI, GITHUB_APP_NAME, GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY (multiline)
  - Note: Without GitHub OAuth secrets, local UI login flows may be limited; core UI can still load
- Misc
  - Agent: SKIP_CI_UNTIL_LAST_COMMIT, NEXT_PUBLIC_ALLOWED_USERS_LIST
  - Web: NEXT_PUBLIC_ALLOWED_USERS_LIST

Relationships and Consistency
- Port/URL alignment
  - Agent PORT ↔ Web LANGGRAPH_API_URL: If PORT ≠ 2025, update LANGGRAPH_API_URL accordingly
  - Web port changes (Next dev default 3001): If changed, update OPEN_SWE_APP_URL (agent) and GITHUB_APP_REDIRECT_URI (web)
- Encryption key
  - SECRETS_ENCRYPTION_KEY must be identical across agent and web
  - Generate (PowerShell): node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
- Public vs Secret
  - NEXT_PUBLIC_* are browser-exposed; do not place secrets there
  - Keep API keys and private keys in non-public vars only

Placement and Files
- Agent: place in ["apps/open-swe/.env"](./apps/open-swe/.env); referenced by ["langgraph.json"](./langgraph.json)
- Web: place in ["apps/web/.env"](./apps/web/.env) or .env.local (Next.js precedence rules)
- Never commit .env files

Windows and Multiline Keys
- .env files are parsed by dotenv; no PowerShell quoting required inside files
- Multiline RSA keys: keep the BEGIN/END lines and newlines as in example
- Use Copy-Item to duplicate templates:
  - Copy-Item apps/open-swe/.env.example apps/open-swe/.env
  - Copy-Item apps/web/.env.example apps/web/.env

Verification Steps
- Start both apps (from root): yarn dev
- Web health: open http://localhost:3001; page renders without errors
- Agent health: open http://localhost:2025 (LangGraph HTTP app per ["langgraph.json"](./langgraph.json))
- Proxy path: action in UI should call NEXT_PUBLIC_API_URL (/api) and forward to LANGGRAPH_API_URL; confirm 2xx responses
- With a valid LLM key, run a simple agent action; expect success and (if enabled) traces in LangSmith

Common Pitfalls and Remedies
- 404/connection failure from UI → check LANGGRAPH_API_URL points to agent and agent PORT is open
- CORS issues → requests must go through web /api proxy; ensure NEXT_PUBLIC_API_URL is http://localhost:3001/api
- Yarn version mismatch → corepack enable; corepack prepare yarn@3.5.1 --activate
- Node version mismatch → use Node 20 (see ["langgraph.json"](./langgraph.json))
- Port conflicts → change agent PORT and update web LANGGRAPH_API_URL; restart both

Appendix: Variable Catalogue
- Agent: LANGCHAIN_PROJECT, LANGCHAIN_API_KEY, LANGCHAIN_TRACING_V2, LANGCHAIN_TEST_TRACKING, ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY, DAYTONA_API_KEY, FIRECRAWL_API_KEY, GITHUB_APP_NAME, GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, GITHUB_WEBHOOK_SECRET, GITHUB_TRIGGER_USERNAME, PORT, OPEN_SWE_APP_URL, SECRETS_ENCRYPTION_KEY, SKIP_CI_UNTIL_LAST_COMMIT, NEXT_PUBLIC_ALLOWED_USERS_LIST, OPEN_SWE_LOCAL_MODE, OPEN_SWE_LOCAL_PROJECT_PATH
- Web: NEXT_PUBLIC_GITHUB_APP_CLIENT_ID, GITHUB_APP_CLIENT_SECRET, GITHUB_APP_REDIRECT_URI, GITHUB_APP_NAME, GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, NEXT_PUBLIC_API_URL, LANGGRAPH_API_URL, SECRETS_ENCRYPTION_KEY, NEXT_PUBLIC_ALLOWED_USERS_LIST