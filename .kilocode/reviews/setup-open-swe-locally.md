# Review Result: CHANGES_REQUESTED

## Summary
- Runtime validated: build/lint/test all passed (exit codes 0). Health endpoints behave per spec (web=200; agent no-header=401; agent with x-local-mode and missing GOOGLE_*=500). Single agent listener on 2025 confirmed. Remaining issues: documentation/examples still reference 3000/2024, web auth login returns 500 in LOCAL_MODE without creds, and one fallback still points to 2024.

## Findings
- [x] Tests pass locally
- [ ] Acceptance criteria met
- [ ] Security/Privacy checks
- [ ] Performance considerations
- [ ] Observability added/updated
- [ ] Migrations safe & documented
- [ ] Docs updated

## Notes / Action Items (if any)
- Evidence (runtime):
  - Root: BUILD=0, LINT=0, TEST=0
  - Health: GET http://localhost:3001/api/health → 200; GET http://localhost:2025/health → 401; GET with -H "x-local-mode:true" http://localhost:2025/health (no GOOGLE_*) → 500
  - Single agent instance bound to 2025
- Proxy headers (pass): LOCAL_MODE and OPEN_SWE_LOCAL_MODE set in dev: [`apps/web/src/app/api/[..._path]/route.ts:60-67`](./apps/web/src/app/api/[..._path]/route.ts:60)
- Web auth endpoints (change required): Avoid 500 when GitHub creds missing in LOCAL_MODE; return 401 with disabled message:
  - Update: [`apps/web/src/app/api/auth/github/login/route.ts:6-13`](./apps/web/src/app/api/auth/github/login/route.ts:6)
- Agent health behavior (meets spec): 401 w/o header, 500 with x-local-mode:true when GOOGLE_* missing; env validation present:
  - Health route: [`apps/open-swe/src/routes/app.ts:7-15`](./apps/open-swe/src/routes/app.ts:7)
  - Validation: [`apps/open-swe/src/utils/env-validation.ts:31-35`](./apps/open-swe/src/utils/env-validation.ts:31), [`apps/open-swe/src/utils/env-validation.ts:45-69`](./apps/open-swe/src/utils/env-validation.ts:45)
  - Local-mode auth short-circuit: [`apps/open-swe/src/security/auth.ts:53-66`](./apps/open-swe/src/security/auth.ts:53)
- Docs and examples: align all port refs to 3001/2025 (currently 3000/2024 appear):
  - [`PLAN.md:57-61`](./PLAN.md:57), [`implementation_plan.md:10-12`](./implementation_plan.md:10), [`implementation_plan.md:35-37`](./implementation_plan.md:35)
  - Web env example ports/redirect: [`apps/web/.env.example:7-9`](./apps/web/.env.example:7), [`apps/web/.env.example:21-26`](./apps/web/.env.example:21)
  - Docs pages: [`apps/docs/setup/development.mdx:64-67`](./apps/docs/setup/development.mdx:64), [`apps/docs/setup/development.mdx:73-75`](./apps/docs/setup/development.mdx:73), [`apps/docs/setup/development.mdx:122-124`](./apps/docs/setup/development.mdx:122), [`apps/docs/setup/development.mdx:270-279`](./apps/docs/setup/development.mdx:270)
  - Agent env example: [`apps/open-swe/.env.example:48-49`](./apps/open-swe/.env.example:48)
  - Env matrix: [`/.kilocode/plan/01-env-matrix.md:14-20`](./.kilocode/plan/01-env-matrix.md:14), [`/.kilocode/plan/01-env-matrix.md:57-60`](./.kilocode/plan/01-env-matrix.md:57)
- Fallbacks:
  - Update restart-run default to 2025: [`apps/web/src/app/api/restart-run/route.ts:99-101`](./apps/web/src/app/api/restart-run/route.ts:99)
  - Optional consistency: default API URL to 3001 in util: [`apps/web/src/utils/github.ts:2-4`](./apps/web/src/utils/github.ts:2)
  - Optional (CLI if used locally): [`apps/cli/src/utils.ts:13-14`](./apps/cli/src/utils.ts:13), [`apps/cli/src/streaming.ts:5-6`](./apps/cli/src/streaming.ts:5)
- Web env validation present and non-placeholder detection works: [`apps/web/src/lib/env-validation.ts:35-55`](./apps/web/src/lib/env-validation.ts:35), [`apps/web/src/lib/env-validation.ts:40-45`](./apps/web/src/lib/env-validation.ts:40)