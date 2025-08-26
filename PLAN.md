# Open SWE Local Setup Plan (Windows 11, Yarn/Turbo)

1. Goal & Non-Goals
- Goal: Provide a precise, repeatable local setup/run/verify plan for the Yarn/Turbo monorepo on Windows 11 (PowerShell 7), covering apps/open-swe and apps/web.
- Non-Goals: No code changes, no deployment infra; local-only docs and commands.

2. Current State (paths, key configs)
- Monorepo root: ["package.json"](./package.json), ["turbo.json"](./turbo.json), ["AGENTS.md"](./AGENTS.md), ["langgraph.json"](./langgraph.json)
- Apps:
  - Agent: ["apps/open-swe/package.json"](./apps/open-swe/package.json), env template ["apps/open-swe/.env.example"](./apps/open-swe/.env.example), dev script uses langgraph CLI, default PORT 2025.
  - Web: ["apps/web/package.json"](./apps/web/package.json), env template ["apps/web/.env.example"](./apps/web/.env.example), Next.js dev at 3001.
- Shared package: ["packages/shared/package.json"](./packages/shared/package.json) must build first; Turbo handles order via ^build.
- Root scripts (Turbo): dev/build/lint/format/test orchestrated across workspaces.
- Node/Package manager: Node 20 per ["langgraph.json"](./langgraph.json), Yarn 3.5.1 per packageManager fields.

3. Proposed Changes (docs only; per-file touch list)
- Add this plan: ["PLAN.md"](./PLAN.md)
- Add implementation checklist: ["implementation_plan.md"](./implementation_plan.md)
- Add env details deep-dive: [".kilocode/plan/01-env-matrix.md"](./.kilocode/plan/01-env-matrix.md)

4. Interfaces & Data Contracts
- Web proxies API calls to the LangGraph HTTP app (see ["langgraph.json"](./langgraph.json)); local URLs:
  - Web UI: http://localhost:3001
  - LangGraph server: http://localhost:2025
- Shared encryption: SECRETS_ENCRYPTION_KEY must be identical in both .env files.
- Public vs secret vars: NEXT_PUBLIC_* are exposed to the browser; others remain server-side.

5. Migrations/Data Considerations
- None. Local-only env files; idempotent installs and builds.

6. Rollout Strategy (incremental, with fallback)
- Step 1: Prereqs
  - Install Node 20.x; enable Corepack and Yarn 3.5.1:
    - corepack enable
    - corepack prepare yarn@3.5.1 --activate
    - yarn -v (expect 3.5.1)
- Step 2: Install from repo root
  - yarn install
- Step 3: Create env files
  - apps/open-swe: Copy-Item .env.example .env
  - apps/web: Copy-Item .env.example .env
- Step 4: Populate minimal required env (see Section 12 and env matrix file)
- Step 5: Build, lint, test (root)
  - yarn build
  - yarn lint
  - yarn test
- Step 6: Run dev
  - Option A (both): yarn dev
  - Option B (separate): yarn workspace @open-swe/agent dev; yarn workspace @open-swe/web dev
- Fallback: Stop dev, fix env/ports, re-run. Clean with yarn clean (root) and rebuild.

7. Testing Strategy
- Unit tests (root): yarn test (Turbo runs per-package tests)
- Package-specific:
  - Agent integration: yarn workspace @open-swe/agent test:int
  - Shared unit: yarn workspace @open-swe/shared test
- Smoketests (manual):
  - Open Web UI at http://localhost:3001; ensure homepage renders.
  - With agent running, perform a simple action in UI; verify requests hit http://localhost:2025 via Next proxy.

8. Telemetry & Observability
- Optional tracing via LangSmith: LANGCHAIN_TRACING_V2=true, LANGCHAIN_API_KEY, LANGCHAIN_PROJECT in ["apps/open-swe/.env"](./apps/open-swe/.env).
- For local docs/tests, keep LANGCHAIN_TEST_TRACKING=false unless evaluating.

9. Security & Privacy
- Do not commit .env files. Treat *_API_KEY, GITHUB_* as secrets.
- Ensure SECRETS_ENCRYPTION_KEY is a 32-byte hex and identical across agent and web.
- Limit NEXT_PUBLIC_* to values safe for the browser.

10. Performance & SLOs
- Not applicable for local dev; ensure both apps hot-reload and respond locally (<2s cold start).

11. Risks & Mitigations
- Yarn version mismatch → enforce Corepack prepare yarn@3.5.1.
- Node version mismatch → use Node 20 per ["langgraph.json"](./langgraph.json).
- Port collisions (3001/2025) → change PORT in agent .env and NEXT_PUBLIC_API_URL/LANGGRAPH_API_URL in web .env accordingly.
- Missing LLM key → set one of ANTHROPIC_API_KEY/OPENAI_API_KEY/GOOGLE_API_KEY in agent .env.
- Mismatched encryption key → set identical SECRETS_ENCRYPTION_KEY in both .env files.
- Missing GitHub OAuth config → UI GitHub login may fail; develop without auth or configure GITHUB_* vars.

12. Command Checklist (Windows PowerShell 7)
- corepack enable
- corepack prepare yarn@3.5.1 --activate
- yarn --version
- yarn install
- Copy-Item apps/open-swe/.env.example apps/open-swe/.env
- Copy-Item apps/web/.env.example apps/web/.env
- yarn build
- yarn lint
- yarn test
- yarn dev
  - or: yarn workspace @open-swe/agent dev
  - and: yarn workspace @open-swe/web dev

13. Acceptance Criteria
- yarn install completes without errors at repo root.
- yarn build, yarn lint, yarn test succeed via Turbo.
- Both apps run in dev: http://localhost:3001 (web) and http://localhost:2025 (agent).
- Web can reach agent via proxy (200 responses; no CORS errors).
- With at least one valid LLM key configured, initiating an agent run succeeds locally.

14. Out of Scope
- CI/CD setup, production deployments, containerization, secrets management beyond local .env.

15. Timeline/Estimates
- S (0.5–2 hours) assuming existing API keys; M (2–4 hours) if creating GitHub App and new keys.

Appendix: Key References
- Root Turbo orchestration: ["turbo.json"](./turbo.json)
- Agent config/scripts: ["apps/open-swe/package.json"](./apps/open-swe/package.json), ["apps/open-swe/README.md"](./apps/open-swe/README.md)
- Web config/scripts: ["apps/web/package.json"](./apps/web/package.json), ["apps/web/README.md"](./apps/web/README.md)
- Shared build: ["packages/shared/package.json"](./packages/shared/package.json)