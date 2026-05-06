param(
  [Parameter(Mandatory = $true)]
  [string]$Name,
  [Parameter(Mandatory = $true)]
  [int]$DailyCaloriesKcal,
  [Nullable[decimal]]$DailyProteinGrams = $null,
  [Nullable[decimal]]$DailyCarbsGrams = $null,
  [Nullable[decimal]]$DailyFatGrams = $null,
  [string]$StartDate = (Get-Date).Date.ToUniversalTime().ToString("o"),
  [string]$EndDate = $null,
  [bool]$IsActive = $true,
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
  startDate = $StartDate
  endDate = if ([string]::IsNullOrWhiteSpace($EndDate)) { $null } else { $EndDate }
  dailyCaloriesKcal = $DailyCaloriesKcal
  dailyProteinGrams = if ($null -eq $DailyProteinGrams) { $null } else { [double]$DailyProteinGrams }
  dailyCarbsGrams = if ($null -eq $DailyCarbsGrams) { $null } else { [double]$DailyCarbsGrams }
  dailyFatGrams = if ($null -eq $DailyFatGrams) { $null } else { [double]$DailyFatGrams }
  isActive = $IsActive
}

$response = Invoke-ApiRequest `
  -Method "POST" `
  -Path "/api/nutrition-goals" `
  -BaseUrl $BaseUrl `
  -TokenPath $TokenPath `
  -Body $body `
  -Auth

Show-Json $response
