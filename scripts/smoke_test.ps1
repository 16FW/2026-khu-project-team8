param(
    [Parameter(Mandatory = $true)]
    [string]$BaseUrl,

    [string]$Keyword = "aws"
)

$ErrorActionPreference = "Stop"
$BaseUrl = $BaseUrl.TrimEnd("/")
$EscapedKeyword = [uri]::EscapeDataString($Keyword)

function Invoke-SmokeRequest {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Method,

        [Parameter(Mandatory = $true)]
        [string]$Path,

        [object]$Body = $null
    )

    $uri = "$BaseUrl$Path"
    $headers = @{
        "Accept" = "application/json"
    }

    $params = @{
        Method = $Method
        Uri = $uri
        Headers = $headers
        UseBasicParsing = $true
    }

    if ($null -ne $Body) {
        $params["ContentType"] = "application/json"
        $params["Body"] = ($Body | ConvertTo-Json -Compress)
    }

    try {
        $response = Invoke-WebRequest @params
        $json = $response.Content | ConvertFrom-Json
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $responseBody = ""
        if ($_.ErrorDetails.Message) {
            $responseBody = $_.ErrorDetails.Message
        }
        throw "Request failed: $Method $Path status=$statusCode body=$responseBody"
    }

    if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 300) {
        throw "Unexpected status: $Method $Path status=$($response.StatusCode)"
    }

    if ($true -ne $json.success) {
        throw "Unexpected response envelope: $Method $Path success=$($json.success)"
    }

    Write-Host "PASS $Method $Path status=$($response.StatusCode)"
    return $json
}

Write-Host "Running smoke tests against $BaseUrl"

Invoke-SmokeRequest -Method "GET" -Path "/health" | Out-Null
Invoke-SmokeRequest -Method "POST" -Path "/keywords" -Body @{ keyword = $Keyword } | Out-Null
Invoke-SmokeRequest -Method "GET" -Path "/keywords" | Out-Null
Invoke-SmokeRequest -Method "GET" -Path "/news?keyword=$EscapedKeyword" | Out-Null
Invoke-SmokeRequest -Method "GET" -Path "/news/today" | Out-Null
Invoke-SmokeRequest -Method "DELETE" -Path "/keywords/$EscapedKeyword" | Out-Null

Write-Host "Smoke tests completed"
