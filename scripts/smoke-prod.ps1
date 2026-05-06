param(
  [string]$BaseUrl = "https://suivi-sportif.fr"
)

$ErrorActionPreference = "Stop"

$stamp = Get-Date -Format "yyyyMMddHHmmss"
$email = "smoke+$stamp@suivi-sportif.fr"
$password = "SmokeTest123!"
$token = $null
$created = @{}
$results = New-Object System.Collections.Generic.List[object]
$tmpDir = Join-Path $env:TEMP "suivi-smoke-$stamp"

New-Item -ItemType Directory -Path $tmpDir -Force | Out-Null

function Add-Result($name, $ok, $detail) {
  $script:results.Add([pscustomobject]@{
    Check = $name
    OK = [bool]$ok
    Detail = [string]$detail
  }) | Out-Null
}

function Invoke-SmokeCurl($method, $url, $body = $null, $auth = $false) {
  $out = Join-Path $script:tmpDir ([guid]::NewGuid().ToString() + ".body")
  $args = @(
    "-sS",
    "-L",
    "-X",
    $method,
    "-o",
    $out,
    "-w",
    "%{http_code}|%{url_effective}"
  )

  if ($null -ne $body) {
    $json = $body | ConvertTo-Json -Depth 20 -Compress
    $bodyFile = Join-Path $script:tmpDir ([guid]::NewGuid().ToString() + ".json")
    Set-Content -Path $bodyFile -Value $json -NoNewline -Encoding UTF8
    $args += @("-H", "Content-Type: application/json", "--data-binary", "@$bodyFile")
  }

  if ($auth -and $script:token) {
    $args += @("-H", "Authorization: Bearer $script:token")
  }

  $args += @($url)
  $meta = & curl.exe @args
  $parts = $meta -split "\|", 2
  $content = if (Test-Path $out) { Get-Content $out -Raw } else { "" }
  $parsed = $null

  if ($content) {
    try {
      $parsed = $content | ConvertFrom-Json
    } catch {
      $parsed = $null
    }
  }

  return [pscustomobject]@{
    Status = [int]$parts[0]
    Url = $parts[1]
    Content = $content
    Json = $parsed
  }
}

try {
  $r = Invoke-SmokeCurl GET "$BaseUrl/health"
  Add-Result "HTTPS /health" ($r.Status -eq 200 -and $r.Json.data.status -eq "ok") "HTTP $($r.Status) status=$($r.Json.data.status)"
} catch {
  Add-Result "HTTPS /health" $false $_.Exception.Message
}

try {
  $httpUrl = $BaseUrl -replace "^https://", "http://"
  $r = Invoke-SmokeCurl GET "$httpUrl/health"
  Add-Result "HTTP -> HTTPS" ($r.Url.StartsWith("https://") -and $r.Status -eq 200) "final=$($r.Url) status=$($r.Status)"
} catch {
  Add-Result "HTTP -> HTTPS" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl GET "$BaseUrl/"
  Add-Result "Frontend /" ($r.Status -eq 200 -and $r.Content.Contains('<div id="root"')) "HTTP $($r.Status), bytes=$($r.Content.Length)"
} catch {
  Add-Result "Frontend /" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl GET "$BaseUrl/api/exercises"
  Add-Result "Protected route rejects anonymous" ($r.Status -eq 401 -and $r.Json.code -eq "UNAUTHORIZED") "HTTP $($r.Status) code=$($r.Json.code)"
} catch {
  Add-Result "Protected route rejects anonymous" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl POST "$BaseUrl/api/users/register" @{
    email = $email
    password = $password
    name = "Smoke Test"
  }
  $script:token = $r.Json.data.token
  Add-Result "Register" ($r.Status -eq 201 -and $script:token -and $r.Json.data.user.email -eq $email) "HTTP $($r.Status) user=$($r.Json.data.user.email)"
} catch {
  Add-Result "Register" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl POST "$BaseUrl/api/users/login" @{
    email = $email
    password = $password
  }
  $script:token = $r.Json.data.token
  Add-Result "Login" ($r.Status -eq 200 -and $script:token) "HTTP $($r.Status)"
} catch {
  Add-Result "Login" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl GET "$BaseUrl/api/users/me" $null $true
  Add-Result "GET /api/users/me" ($r.Status -eq 200 -and $r.Json.data.email -eq $email) "HTTP $($r.Status) user=$($r.Json.data.email)"
} catch {
  Add-Result "GET /api/users/me" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl POST "$BaseUrl/api/exercises" @{
    name = "Smoke Squat $stamp"
    description = "Smoke test exercise"
    muscleGroup = "legs"
    equipment = "barbell"
    difficulty = "beginner"
  } $true
  $created.exerciseId = $r.Json.data.id
  Add-Result "Create exercise" ($r.Status -eq 201 -and $created.exerciseId) "HTTP $($r.Status) id=$($created.exerciseId)"
} catch {
  Add-Result "Create exercise" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl POST "$BaseUrl/api/workouts" @{
    name = "Smoke workout $stamp"
    date = (Get-Date).ToUniversalTime().ToString("o")
    duration = 45
    notes = "Smoke test"
    exercises = @(
      @{
        exerciseId = $created.exerciseId
        sets = @(
          @{
            reps = 10
            weight = 50
            rest = 90
          }
        )
      }
    )
  } $true
  $created.workoutId = $r.Json.data.id
  Add-Result "Create workout" ($r.Status -eq 201 -and $created.workoutId) "HTTP $($r.Status) id=$($created.workoutId)"
} catch {
  Add-Result "Create workout" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl POST "$BaseUrl/api/foods" @{
    name = "Smoke rice $stamp"
    brand = $null
    barcode = $null
    caloriesKcal = 350
    proteinGrams = 7
    carbsGrams = 78
    fatGrams = 1
    fiberGrams = $null
    servingUnit = "g"
  } $true
  $created.foodId = $r.Json.data.id
  Add-Result "Create food" ($r.Status -eq 201 -and $created.foodId) "HTTP $($r.Status) id=$($created.foodId)"
} catch {
  Add-Result "Create food" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl POST "$BaseUrl/api/meals" @{
    name = "Smoke lunch $stamp"
    date = (Get-Date).ToUniversalTime().ToString("o")
    mealType = "lunch"
    notes = $null
    items = @(
      @{
        foodId = $created.foodId
        quantityGrams = 150
      }
    )
  } $true
  $created.mealId = $r.Json.data.id
  Add-Result "Create meal" ($r.Status -eq 201 -and $created.mealId) "HTTP $($r.Status) id=$($created.mealId)"
} catch {
  Add-Result "Create meal" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl POST "$BaseUrl/api/nutrition-goals" @{
    name = "Smoke goal $stamp"
    startDate = (Get-Date).Date.ToUniversalTime().ToString("o")
    endDate = $null
    dailyCaloriesKcal = 2400
    dailyProteinGrams = 160
    dailyCarbsGrams = 260
    dailyFatGrams = 70
    isActive = $true
  } $true
  $created.goalId = $r.Json.data.id
  Add-Result "Create nutrition goal" ($r.Status -eq 201 -and $created.goalId) "HTTP $($r.Status) id=$($created.goalId)"
} catch {
  Add-Result "Create nutrition goal" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl GET "$BaseUrl/api/nutrition-goals/active" $null $true
  Add-Result "Active nutrition goal" ($r.Status -eq 200 -and $r.Json.data.id -eq $created.goalId) "HTTP $($r.Status) id=$($r.Json.data.id)"
} catch {
  Add-Result "Active nutrition goal" $false $_.Exception.Message
}

try {
  $r = Invoke-SmokeCurl GET "$BaseUrl/mcp"
  Add-Result "MCP route reachable" (($r.Status -eq 200) -or ($r.Status -eq 400) -or ($r.Status -eq 401) -or ($r.Status -eq 405)) "HTTP $($r.Status)"
} catch {
  Add-Result "MCP route reachable" $false $_.Exception.Message
}

$cleanup = @(
  @{ name = "Cleanup meal"; key = "mealId"; path = "meals" },
  @{ name = "Cleanup workout"; key = "workoutId"; path = "workouts" },
  @{ name = "Cleanup nutrition goal"; key = "goalId"; path = "nutrition-goals" },
  @{ name = "Cleanup food"; key = "foodId"; path = "foods" },
  @{ name = "Cleanup exercise"; key = "exerciseId"; path = "exercises" }
)

foreach ($item in $cleanup) {
  if ($created.ContainsKey($item.key) -and $created[$item.key]) {
    try {
      $r = Invoke-SmokeCurl DELETE "$BaseUrl/api/$($item.path)/$($created[$item.key])" $null $true
      Add-Result $item.name ($r.Status -eq 204) "HTTP $($r.Status)"
    } catch {
      Add-Result $item.name $false $_.Exception.Message
    }
  }
}

$results | Format-Table -AutoSize
Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue

if (($results | Where-Object { -not $_.OK }).Count -gt 0) {
  exit 1
}
