# Ports Audit (standard: agent 2025, web 3001)

Scope
- Files reviewed per task: PLAN.md, implementation_plan.md, apps/web/.env.example, apps/open-swe/.env.example, apps/docs/setup/development.mdx, .kilocode/plan/01-env-matrix.md

Summary
- Agent: 2025 (OK across reviewed files)
- Web: 3001 (OK across reviewed files; one mismatch fixed in docs)

Mismatches fixed
1) apps/docs/setup/development.mdx
   - Before:
     - “GITHUB_APP_REDIRECT_URI: http://localhost:3000/api/auth/github/callback”
   - After:
     - “GITHUB_APP_REDIRECT_URI: http://localhost:3001/api/auth/github/callback”
   - Ref: apps/docs/setup/development.mdx line near GitHub App OAuth settings

Confirmed correct (no change needed)
- PLAN.md: uses http://localhost:3001 (web) and http://localhost:2025 (agent)
- implementation_plan.md: uses http://localhost:3001 (web) and http://localhost:2025 (agent)
- apps/web/.env.example:
  - NEXT_PUBLIC_API_URL="http://localhost:3001/api"
  - LANGGRAPH_API_URL="http://localhost:2025"
  - GITHUB_APP_REDIRECT_URI="http://localhost:3001/api/auth/github/callback"
- apps/open-swe/.env.example:
  - PORT="2025"
  - OPEN_SWE_APP_URL="http://localhost:3001"
- .kilocode/plan/01-env-matrix.md: web 3001, agent 2025

Notes
- Matches inside node_modules were intentionally ignored (third-party defaults commonly reference 3000).
- If you run dev on a different port, update:
  - Agent: apps/open-swe/.env PORT
  - Web: apps/web/.env NEXT_PUBLIC_API_URL and LANGGRAPH_API_URL