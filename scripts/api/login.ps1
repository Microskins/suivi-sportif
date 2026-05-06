param(
  [string]$BaseUrl = "https://suivi-sportif.fr",
  [string]$Email = "admin@suivi-sportif.fr",
  [string]$Password = "",
  [string]$TokenPath = ""
)

$ErrorActionPreference = "Stop"
$ApiScriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Join-Path (Get-Location) "scripts\api" }
Invoke-Expression (Get-Content (Join-Path $ApiScriptRoot "_common.ps1") -Raw)

if (-not $TokenPath) {
  $TokenPath = $DefaultTokenPath
}

if (-not $Password) {
  $securePassword = Read-Host "Mot de passe pour $Email" -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
  try {
    $Password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

$response = Invoke-ApiRequest `
  -Method "POST" `
  -Path "/api/users/login" `
  -BaseUrl $BaseUrl `
  -Body @{ email = $Email; password = $Password }

Save-ApiToken `
  -Token $response.data.token `
  -Email $Email `
  -BaseUrl $BaseUrl `
  -TokenPath $TokenPath

Write-Host "Login OK: $Email"
Write-Host "Token stocke: $TokenPath"
