param(
  [Parameter(Mandatory = $true)]
  [string]$Name,
  [string]$Description = $null,
  [ValidateSet("chest", "back", "shoulders", "arms", "legs", "core", "cardio")]
  [string]$MuscleGroup = "legs",
  [ValidateSet("none", "barbell", "dumbbell", "machine", "cable", "kettlebell", "resistance_band")]
  [string]$Equipment = "none",
  [ValidateSet("beginner", "intermediate", "advanced")]
  [string]$Difficulty = "beginner",
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
  description = $Description
  muscleGroup = $MuscleGroup
  equipment = $Equipment
  difficulty = $Difficulty
}

$response = Invoke-ApiRequest `
  -Method "POST" `
  -Path "/api/exercises" `
  -BaseUrl $BaseUrl `
  -TokenPath $TokenPath `
  -Body $body `
  -Auth

Show-Json $response
