$DefaultBaseUrl = "https://suivi-sportif.fr"
$DefaultTokenPath = Join-Path $ApiScriptRoot ".token.json"

function Write-Utf8JsonFile {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [Parameter(Mandatory = $true)]
    [string]$Json
  )

  $encoding = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Json, $encoding)
}

function Save-ApiToken {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Token,
    [Parameter(Mandatory = $true)]
    [string]$Email,
    [string]$BaseUrl = $DefaultBaseUrl,
    [string]$TokenPath = $DefaultTokenPath
  )

  $payload = @{
    baseUrl = $BaseUrl.TrimEnd("/")
    email = $Email
    savedAt = (Get-Date).ToUniversalTime().ToString("o")
    token = $Token
  } | ConvertTo-Json -Compress

  Write-Utf8JsonFile -Path $TokenPath -Json $payload
}

function Get-ApiTokenState {
  param(
    [string]$TokenPath = $DefaultTokenPath
  )

  if (-not (Test-Path $TokenPath)) {
    throw "Token absent. Lance d'abord: .\scripts\api\login.ps1"
  }

  return Get-Content $TokenPath -Raw | ConvertFrom-Json
}

function Invoke-ApiRequest {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Method,
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [object]$Body = $null,
    [switch]$Auth,
    [string]$BaseUrl = "",
    [string]$TokenPath = $DefaultTokenPath
  )

  $state = $null
  if ($Auth) {
    $state = Get-ApiTokenState -TokenPath $TokenPath
  }

  if (-not $BaseUrl) {
    if ($state -and $state.baseUrl) {
      $BaseUrl = $state.baseUrl
    } else {
      $BaseUrl = $DefaultBaseUrl
    }
  }

  $BaseUrl = $BaseUrl.TrimEnd("/")
  $url = "$BaseUrl$Path"
  $tmpDir = Join-Path $env:TEMP ("suivi-api-" + [guid]::NewGuid().ToString())
  New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

  try {
    $responseFile = Join-Path $tmpDir "response.json"
    $args = @(
      "-sS",
      "-L",
      "-X",
      $Method,
      "-o",
      $responseFile,
      "-w",
      "%{http_code}"
    )

    if ($Auth) {
      $args += @("-H", "Authorization: Bearer $($state.token)")
    }

    if ($null -ne $Body) {
      $bodyFile = Join-Path $tmpDir "body.json"
      $json = $Body | ConvertTo-Json -Depth 20 -Compress
      Write-Utf8JsonFile -Path $bodyFile -Json $json
      $args += @("-H", "Content-Type: application/json", "--data-binary", "@$bodyFile")
    }

    $args += @($url)
    $status = & curl.exe @args
    $content = if (Test-Path $responseFile) { Get-Content $responseFile -Raw } else { "" }

    if ([int]$status -lt 200 -or [int]$status -ge 300) {
      throw "HTTP $status - $content"
    }

    if (-not $content) {
      return $null
    }

    return $content | ConvertFrom-Json
  } finally {
    Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue
  }
}

function Show-Json {
  param([object]$Value)

  $Value | ConvertTo-Json -Depth 20
}
