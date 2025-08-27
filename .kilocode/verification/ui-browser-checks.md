# UI and Agent Browser Checks

Summary of verification for local Open SWE instance.

- Web: http://localhost:3001
- Agent: http://localhost:2025

## Step 1 — Home page
- URL: http://localhost:3001
- Status: 200 (see dev server logs)
- Screenshot: pending capture to workspace
- Notes: Page rendered “Get started” with “Connect GitHub” button

## Step 2 — Web health
- URL: http://localhost:3001/api/health
- Status: 200
- Body sample: {"ok":true,"ports":{"web":"3001","agent":"2025"},"proxy":"http://localhost:2025"}
- Screenshot: pending

## Step 3 — Web GitHub login
- URL: http://localhost:3001/api/auth/github/login
- Status: 500
- Body: {"error":"GitHub App configuration missing"}
- Expected: 401 (disabled) per route contract
- Action: Configure GitHub App environment or adjust route to return 401 when app config is absent

## Step 4 — Agent health (no headers)
- URL: http://localhost:2025/health
- Status: 401
- Body: "GitHub installation name header missing"
- Screenshot: pending

## Step 5 — Agent health with x-local-mode:true
- URL: http://localhost:2025/health
- Header: x-local-mode: true
- Status: 500
- Reason: Missing Google/Vertex credentials (GOOGLE_API_KEY or Vertex trio)
- Artifacts:
  - [.kilocode/verification/screenshots/agent-health-500-local-mode.txt](.kilicode/verification/screenshots/agent-health-500-local-mode.txt)
  - [.kilicode/verification/screenshots/agent-health-500-local-mode.html](.kilicode/verification/screenshots/agent-health-500-local-mode.html)

## Notes
- Console/network logs showed repeated 401s for GitHub endpoints until configuration is provided.
- Agent responded 401 without header, 500 with x-local-mode:true (expected missing creds failure).