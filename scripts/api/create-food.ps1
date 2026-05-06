param(
  [Parameter(Mandatory = $true)]
  [string]$Name,
  [decimal]$CaloriesKcal = 0,
  [decimal]$ProteinGrams = 0,
  [decimal]$CarbsGrams = 0,
  [decimal]$FatGrams = 0,
  [Nullable[decimal]]$FiberGrams = $null,
  [string]$Brand = $null,
  [string]$Barcode = $null,
  [string]$ServingUnit = "g",
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
  brand = if ([string]::IsNullOrWhiteSpace($Brand)) { $null } else { $Brand }
  barcode = if ([string]::IsNullOrWhiteSpace($Barcode)) { $null } else { $Barcode }
  caloriesKcal = [double]$CaloriesKcal
  proteinGrams = [double]$ProteinGrams
  carbsGrams = [double]$CarbsGrams
  fatGrams = [double]$FatGrams
  fiberGrams = if ($null -eq $FiberGrams) { $null } else { [double]$FiberGrams }
  servingUnit = $ServingUnit
}

$response = Invoke-ApiRequest `
  -Method "POST" `
  -Path "/api/foods" `
  -BaseUrl $BaseUrl `
  -TokenPath $TokenPath `
  -Body $body `
  -Auth

Show-Json $response
