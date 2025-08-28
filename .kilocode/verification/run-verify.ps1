Param()

$ErrorActionPreference = "Continue"

New-Item -ItemType Directory -Force -Path ".kilocode/verification" | Out-Null
New-Item -ItemType Directory -Force -Path ".kilocode/verification/screenshots" | Out-Null

function Get-Resp {
  param(
    [Parameter(Mandatory = $true)][string]$u,
    [hashtable]$h
  )
  try {
    $handler = [System.Net.Http.HttpClientHandler]::new()
    $client = [System.Net.Http.HttpClient]::new($handler)
    try {
      if ($h) {
        foreach ($k in $h.Keys) {
          $client.DefaultRequestHeaders.Remove($k) | Out-Null
          $client.DefaultRequestHeaders.Add($k, [string]$h[$k])
        }
      }
      $response = $client.GetAsync($u, [System.Net.Http.HttpCompletionOption]::ResponseContentRead).Result
      $body = $response.Content.ReadAsStringAsync().Result
      [PSCustomObject]@{
        StatusCode = [int]$response.StatusCode
        Body       = $body
      }
    } finally {
      $client.Dispose()
      $handler.Dispose()
    }
  } catch {
    [PSCustomObject]@{
      StatusCode = -1
      Body       = $_.Exception.Message
    }
  }
}

$web = Get-Resp -u "http://localhost:3001/api/health"
$web | ConvertTo-Json -Depth 10 | Set-Content -Encoding utf8 ".kilocode/verification/web-health.json"

$agentNo = Get-Resp -u "http://localhost:2025/health"
"StatusCode: $($agentNo.StatusCode)`nBody:`n$($agentNo.Body)" | Set-Content -Encoding utf8 ".kilocode/verification/agent-health-nohdr.txt"

$agentLm = Get-Resp -u "http://localhost:2025/health" -h @{ "x-local-mode" = "true" }
"StatusCode: $($agentLm.StatusCode)`nBody:`n$($agentLm.Body)" | Set-Content -Encoding utf8 ".kilocode/verification/agent-health-localmode.txt"

$gh = Get-Resp -u "http://localhost:3001/api/auth/github/login"
"StatusCode: $($gh.StatusCode)`nBody:`n$($gh.Body)" | Set-Content -Encoding utf8 ".kilocode/verification/github-login-401.txt"

$png = ".kilocode/verification/screenshots/home.png"
$edgePaths = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)
$chromePaths = @("C:\Program Files\Google\Chrome\Application\chrome.exe")
$browser = ($edgePaths + $chromePaths | Where-Object { Test-Path $_ } | Select-Object -First 1)
if ($browser) {
  & $browser --headless --disable-gpu --screenshot="$png" --window-size=1280,720 "http://localhost:3001"
} else {
  Set-Content -Encoding utf8 ".kilocode/verification/screenshots/home.png.txt" "Edge/Chrome not found"
}

$env:OPEN_SWE_LOCAL_MODE = "true"
$env:SECRETS_ENCRYPTION_KEY = "non-sensitive-dev-key"

yarn install
yarn build

$lint = yarn lint 2>&1
$lint | Out-File -Encoding utf8 ".kilocode/verification/lint-output.txt"
"ExitCode: $LASTEXITCODE" | Add-Content ".kilocode/verification/lint-output.txt"

$test = yarn test 2>&1
$test | Out-File -Encoding utf8 ".kilocode/verification/test-output.txt"
"ExitCode: $LASTEXITCODE" | Add-Content ".kilocode/verification/test-output.txt"