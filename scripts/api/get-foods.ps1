param(
  [string]$BaseUrl = "",
  [string]$TokenPath = ""
)

$ErrorActionPreference = "Stop"
$ApiScriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Join-Path (Get-Location) "scripts\api" }
Invoke-Expression (Get-Content (Join-Path $ApiScriptRoot "_common.ps1") -Raw)

if (-not $TokenPath) {
  $TokenPath = $DefaultTokenPath
}

$response = Invoke-ApiRequest `
  -Method "GET" `
  -Path "/api/foods" `
  -BaseUrl $BaseUrl `
  -TokenPath $TokenPath `
  -Auth

Show-Json $response
