param(
  [Parameter(Mandatory = $true)]
  [string]$Name,
  [Parameter(Mandatory = $true)]
  [int]$Duration,
  [string]$Date = (Get-Date).ToUniversalTime().ToString("o"),
  [string]$Notes = $null,
  [string]$ExerciseId = "",
  [int]$Reps = 10,
  [decimal]$Weight = 0,
  [int]$Rest = 90,
  [string]$BaseUrl = "",
  [string]$TokenPath = ""
)

$ErrorActionPreference = "Stop"
$ApiScriptRoot = if ($PSScriptRoot) { $PSScriptRoot } else { Join-Path (Get-Location) "scripts\api" }
Invoke-Expression (Get-Content (Join-Path $ApiScriptRoot "_common.ps1") -Raw)

if (-not $TokenPath) {
  $TokenPath = $DefaultTokenPath
}

$body = @{
  name = $Name
  date = $Date
  duration = $Duration
  notes = $Notes
}

if ($ExerciseId) {
  $body.exercises = @(
    @{
      exerciseId = $ExerciseId
      sets = @(
        @{
          reps = $Reps
          weight = [double]$Weight
          rest = $Rest
        }
      )
    }
  )
}

$response = Invoke-ApiRequest `
  -Method "POST" `
  -Path "/api/workouts" `
  -BaseUrl $BaseUrl `
  -TokenPath $TokenPath `
  -Body $body `
  -Auth

Show-Json $response
