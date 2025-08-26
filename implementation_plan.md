[Overview]
- Purpose: Exact local setup/run/verify for Open SWE monorepo on Windows 11 + PowerShell 7 using Yarn/Turbo. Covers apps/open-swe (agent) and apps/web (Next.js).
- Constraints: Yarn only; run orchestrated commands from repo root; strict TypeScript/ESLint; no source edits.
- References: ["README.md"](./README.md), ["AGENTS.md"](./AGENTS.md), ["turbo.json"](./turbo.json), ["package.json"](./package.json), ["langgraph.json"](./langgraph.json), ["apps/open-swe/package.json"](./apps/open-swe/package.json), ["apps/web/package.json"](./apps/web/package.json).

[Types]
- Environment values:
  - string: *_API_KEY, GITHUB_*, NEXT_PUBLIC_*, OPEN_SWE_APP_URL, SECRETS_ENCRYPTION_KEY (32-byte hex), LANGGRAPH_API_URL, NEXT_PUBLIC_API_URL, LANGCHAIN_PROJECT
  - boolean-like (string "true"/"false"): LANGCHAIN_TRACING_V2, LANGCHAIN_TEST_TRACKING, SKIP_CI_UNTIL_LAST_COMMIT
  - number-like (string): PORT (default "2025")
- URLs: http://localhost:3001 (web), http://localhost:2025 (agent HTTP)

[Files]
- Root: ["package.json"](./package.json), ["turbo.json"](./turbo.json), ["AGENTS.md"](./AGENTS.md), ["langgraph.json"](./langgraph.json)
- Agent app: ["apps/open-swe/.env.example"](./apps/open-swe/.env.example), ["apps/open-swe/README.md"](./apps/open-swe/README.md)
- Web app: ["apps/web/.env.example"](./apps/web/.env.example), ["apps/web/README.md"](./apps/web/README.md)
- Shared: ["packages/shared/package.json"](./packages/shared/package.json)

[Functions]
- N/A (documentation-only change)

[Classes]
- N/A

[Dependencies]
- Node: "20" per ["langgraph.json"](./langgraph.json)
- Package manager: Yarn 3.5.1 per packageManager fields
- Turbo orchestrates tasks; ^build/^lint/^test/^dev ensure shared builds before dependents

[Testing]
- Root (Turbo): yarn test
- Package-specific:
  - Agent: yarn workspace @open-swe/agent test, yarn workspace @open-swe/agent test:int, yarn workspace @open-swe/agent test:single
  - Shared: yarn workspace @open-swe/shared test
- Lint/format: yarn lint, yarn lint:fix, yarn format, yarn format:check
- E2E smoke (manual): With both dev servers running, load http://localhost:3001, open browser console → initiate an action; verify proxying to http://localhost:2025 without CORS errors

[Implementation Order]
1) Prerequisites (PowerShell 7)
- corepack enable
- corepack prepare yarn@3.5.1 --activate
- yarn --version  (expect 3.5.1)
- node -v        (>= 20.x)

2) Install (repo root)
- yarn install

3) Environment files
- Copy-Item apps/open-swe/.env.example apps/open-swe/.env
- Copy-Item apps/web/.env.example apps/web/.env

4) Populate minimal env (local dev)
- Agent (.env): One of ANTHROPIC_API_KEY or OPENAI_API_KEY or GOOGLE_API_KEY; SECRETS_ENCRYPTION_KEY (32-byte hex); OPEN_SWE_APP_URL=http://localhost:3001; optional: LANGCHAIN_TRACING_V2/LANGCHAIN_API_KEY; default PORT=2025
- Web (.env): NEXT_PUBLIC_API_URL=http://localhost:3001/api; LANGGRAPH_API_URL=http://localhost:2025; SECRETS_ENCRYPTION_KEY (must match agent); optional GitHub OAuth (NEXT_PUBLIC_GITHUB_APP_CLIENT_ID, GITHUB_APP_CLIENT_SECRET, GITHUB_APP_REDIRECT_URI, GITHUB_APP_PRIVATE_KEY, GITHUB_APP_NAME, GITHUB_APP_ID). Without GitHub OAuth, some login flows won’t work.

5) Quality checks (repo root)
- yarn build
- yarn lint
- yarn test

6) Run dev
- Single command (Turbo runs both): yarn dev
- Or separate terminals:
  - yarn workspace @open-swe/agent dev
  - yarn workspace @open-swe/web dev

7) Verify
- Web UI: http://localhost:3001 renders without errors
- Agent HTTP: http://localhost:2025 responds (health/HTTP app via ["langgraph.json"](./langgraph.json))
- Proxy: Web actions call NEXT_PUBLIC_API_URL (/api) which forwards to LANGGRAPH_API_URL=http://localhost:2025
- With valid LLM key, run a trivial action from UI; confirm 2xx and traces (if LANGCHAIN_TRACING_V2 enabled)

[Env Keys (summary)]
- apps/open-swe (.env): LANGCHAIN_PROJECT, LANGCHAIN_API_KEY, LANGCHAIN_TRACING_V2, LANGCHAIN_TEST_TRACKING, ANTHROPIC_API_KEY, OPENAI_API_KEY, GOOGLE_API_KEY, DAYTONA_API_KEY, FIRECRAWL_API_KEY, GITHUB_APP_NAME, GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY (multiline), GITHUB_WEBHOOK_SECRET, GITHUB_TRIGGER_USERNAME, PORT (default 2025), OPEN_SWE_APP_URL, SECRETS_ENCRYPTION_KEY (32-byte hex), SKIP_CI_UNTIL_LAST_COMMIT, NEXT_PUBLIC_ALLOWED_USERS_LIST
- apps/web (.env): NEXT_PUBLIC_GITHUB_APP_CLIENT_ID, GITHUB_APP_CLIENT_SECRET, GITHUB_APP_REDIRECT_URI, GITHUB_APP_NAME, GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY (multiline), NEXT_PUBLIC_API_URL, LANGGRAPH_API_URL, SECRETS_ENCRYPTION_KEY (32-byte hex), NEXT_PUBLIC_ALLOWED_USERS_LIST
- Placement: local development uses .env at each app root; Next.js also supports .env.local

[Local URLs]
- Web app: http://localhost:3001
- Agent server (LangGraph HTTP): http://localhost:2025

[Rollback Notes]
- If install/build fails: yarn clean; then yarn install && yarn build
- Ports in use: change PORT in apps/open-swe/.env and adjust LANGGRAPH_API_URL/NEXT_PUBLIC_API_URL in apps/web/.env accordingly; restart both dev servers
- Yarn mismatch: corepack prepare yarn@3.5.1 --activate
- Node mismatch: use Node 20; optionally set via nvm-windows
- Broken state: remove .turbo/.next/dist in packages via clean scripts (root: yarn clean), then re-run build

[Success Criteria]
- yarn install/build/lint/test succeed at root
- Both dev servers run concurrently with hot reload
- UI can reach agent through /api proxy without CORS/auth errors
- With configured LLM key, initiating an agent task returns 2xx and visible result in UI

[Artifacts]
- Plan: ["PLAN.md"](./PLAN.md)
- Env deep-dive: [".kilocode/plan/01-env-matrix.md"](./.kilocode/plan/01-env-matrix.md)