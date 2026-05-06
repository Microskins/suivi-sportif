param(
  [Parameter(Mandatory = $true)]
  [string]$Name,
  [Parameter(Mandatory = $true)]
  [string]$FoodId,
  [Parameter(Mandatory = $true)]
  [decimal]$QuantityGrams,
  [ValidateSet("breakfast", "lunch", "dinner", "snack", "other")]
  [string]$MealType = "other",
  [string]$Date = (Get-Date).ToUniversalTime().ToString("o"),
  [string]$Notes = $null,
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
  mealType = $MealType
  notes = $Notes
  items = @(
    @{
      foodId = $FoodId
      quantityGrams = [double]$QuantityGrams
    }
  )
}

$response = Invoke-ApiRequest `
  -Method "POST" `
  -Path "/api/meals" `
  -BaseUrl $BaseUrl `
  -TokenPath $TokenPath `
  -Body $body `
  -Auth

Show-Json $response
