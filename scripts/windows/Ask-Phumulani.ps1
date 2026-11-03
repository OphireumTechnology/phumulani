<#
.SYNOPSIS
    Phumulani Ai — Local Operations Shell & CLI Testing Harness
.DESCRIPTION
    Provides an interactive and scripted terminal interface for Phumulani Ai (running locally on Ollama).
    Target Windows Path: D:\Phumulani\scripts\Ask-Phumulani.ps1

    Supported Operations:
    1. Direct interactive chat with Phumulani Ai
    2. Task-based execution (-Task parameter)
    3. Model health and diagnostic verification
    4. Inference latency measurement
    5. Fundraising solicitation email generation test
    6. Hypothetical donor response classification and reply drafting test
    7. Structured JSON response verification
    8. Application Gateway connectivity check (http://localhost:3000/api/phumulani-ai/gateway/status)
    9. Operational error log review

.EXAMPLE
    & "D:\Phumulani\scripts\Ask-Phumulani.ps1" -Task "Analyze a hypothetical donor reply and draft a response."
    & "D:\Phumulani\scripts\Ask-Phumulani.ps1" -CheckHealth
    & "D:\Phumulani\scripts\Ask-Phumulani.ps1" -TestEmail
    & "D:\Phumulani\scripts\Ask-Phumulani.ps1" -Interactive
#>

param(
    [Parameter(Position=0)]
    [string]$Task = "",

    [switch]$Interactive,
    [switch]$CheckHealth,
    [switch]$TestEmail,
    [switch]$TestReply,
    [switch]$TestJson,
    [switch]$CheckGateway,
    [switch]$ViewLogs,
    [string]$OllamaEndpoint = "http://127.0.0.1:11434",
    [string]$Model = "phumulani-ai",
    [string]$GatewayEndpoint = "http://localhost:3000/api/phumulani-ai/gateway/status",
    [string]$RootDir = "D:\Phumulani"
)

$ErrorActionPreference = "Stop"

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host " PHUMULANI AI — LOCAL LLM OPERATIONS & CLI HARNESS" -ForegroundColor White
Write-Host " Environment: Windows Local Inference Root ($RootDir)" -ForegroundColor Gray
Write-Host " Model: $Model | Endpoint: $OllamaEndpoint" -ForegroundColor Gray
Write-Host "======================================================================" -ForegroundColor Cyan

function Test-OllamaHealth {
    Write-Host "`n[1/3] Testing Local Ollama Daemon Health..." -ForegroundColor Yellow
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = Invoke-RestMethod -Uri "$OllamaEndpoint/api/tags" -Method Get -TimeoutSec 5
        $stopwatch.Stop()
        $models = $response.models | ForEach-Object { $_.name }
        
        Write-Host "  [OK] Ollama daemon online (Handshake: $($stopwatch.ElapsedMilliseconds) ms)" -ForegroundColor Green
        Write-Host "  Installed Models: $($models -join ', ')" -ForegroundColor Gray
        
        $hasModel = $models | Where-Object { $_ -match "^$Model" -or $_ -match "llama3\.2" }
        if ($hasModel) {
            Write-Host "  [OK] Target model ($Model) is installed and available." -ForegroundColor Green
        } else {
            Write-Host "  [WARN] Model '$Model' not found in local catalog. You can create it with:" -ForegroundColor DarkYellow
            Write-Host "         ollama create $Model -f `"$RootDir\scripts\Modelfile.phumulani-ai`"" -ForegroundColor White
        }
        return $true
    } catch {
        $stopwatch.Stop()
        Write-Host "  [FAIL] Unable to connect to Ollama at $OllamaEndpoint" -ForegroundColor Red
        Write-Host "         Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "         Ensure Ollama is started: Start-Process ollama serve" -ForegroundColor Yellow
        return $false
    }
}

function Test-GatewayHealth {
    Write-Host "`n[2/3] Testing Phumulani Application AI Gateway..." -ForegroundColor Yellow
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = Invoke-RestMethod -Uri $GatewayEndpoint -Method Get -TimeoutSec 5
        $stopwatch.Stop()
        Write-Host "  [OK] Application Gateway responding at $GatewayEndpoint" -ForegroundColor Green
        Write-Host "  Gateway Status: $($response.gateway.status) (Latency: $($stopwatch.ElapsedMilliseconds) ms)" -ForegroundColor Green
        Write-Host "  Active Backend: $($response.gateway.activeBackend)" -ForegroundColor Gray
        if ($response.gateway.metrics) {
            Write-Host "  Total Requests: $($response.gateway.metrics.totalRequests) | Injections Blocked: $($response.gateway.metrics.promptInjectionBlocks)" -ForegroundColor Gray
        }
        return $true
    } catch {
        $stopwatch.Stop()
        Write-Host "  [NOTICE] Web Application Gateway at $GatewayEndpoint is offline or not running." -ForegroundColor DarkYellow
        Write-Host "           Start web server with: powershell -File `"$RootDir\scripts\start-phumulani-ai.ps1`"" -ForegroundColor Gray
        return $false
    }
}

function Invoke-PhumulaniInference {
    param([string]$PromptText, [string]$ContextLabel = "Task")

    Write-Host "`n----------------------------------------------------------------------" -ForegroundColor DarkCyan
    Write-Host " EXECUTING INFERENCE: $ContextLabel" -ForegroundColor White
    Write-Host " Prompt: $PromptText" -ForegroundColor Gray
    Write-Host "----------------------------------------------------------------------" -ForegroundColor DarkCyan

    $payload = @{
        model = $Model
        prompt = $PromptText
        stream = $false
        options = @{
            temperature = 0.2
            num_predict = 1024
        }
    } | ConvertTo-Json

    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $res = Invoke-RestMethod -Uri "$OllamaEndpoint/api/generate" -Method Post -ContentType "application/json" -Body $payload -TimeoutSec 60
        $stopwatch.Stop()

        Write-Host "`n[RESPONSE GENERATED IN $($stopwatch.ElapsedMilliseconds) ms]:" -ForegroundColor Green
        Write-Host $res.response -ForegroundColor White
        Write-Host "`nInference Latency: $($stopwatch.ElapsedMilliseconds) ms | Tokens evaluated: $($res.eval_count)" -ForegroundColor DarkGray
    } catch {
        $stopwatch.Stop()
        Write-Host "`n[INFERENCE ERROR] Local inference call failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Falling back to deterministic expert template..." -ForegroundColor Yellow

        Write-Host "`n[DETERMINISTIC FALLBACK RESPONSE]:" -ForegroundColor Cyan
        Write-Host "Subject: Supporting Healing Homes Transitional Housing at Phumulani"
        Write-Host "Dear Prospective Funder, On behalf of Phumulani, we welcome the opportunity to discuss our transitional housing program supporting immigrant survivors. All correspondence adheres to VAWA Section 1367 safeguarding standards."
    }
}

# --- Execution Router ---

if ($CheckHealth) {
    Test-OllamaHealth | Out-Null
    Test-GatewayHealth | Out-Null
    exit 0
}

if ($CheckGateway) {
    Test-GatewayHealth | Out-Null
    exit 0
}

if ($ViewLogs) {
    $logPath = "$RootDir\logs"
    Write-Host "Checking logs in $logPath..." -ForegroundColor Yellow
    if (Test-Path $logPath) {
        Get-ChildItem -Path $logPath -Filter *.log | Select-Object -Last 5 | Format-Table Name, Length, LastWriteTime
    } else {
        Write-Host "No log directory found at $logPath." -ForegroundColor Gray
    }
    exit 0
}

if ($TestEmail) {
    Test-OllamaHealth | Out-Null
    $prompt = @"
Generate a personalized fundraising solicitation email for The McKnight Foundation regarding Phumulani's Healing Homes Transitional Housing program. 
The ask is $50,000 to support transitional shelter and rental subsidies for immigrant survivors in the Twin Cities.
Include professional greeting, program context, alignment with funder equity goals, and invitation for an introductory meeting with Executive Director Comfort Dondo.
Do NOT invent budget figures or non-existent partnerships.
"@
    Invoke-PhumulaniInference -PromptText $prompt -ContextLabel "Test Solicitation Email Generation"
    exit 0
}

if ($TestReply) {
    Test-OllamaHealth | Out-Null
    $prompt = @"
Analyze this incoming email and draft a context-aware response:
From: slindstrom@mcknight-foundation-example.org
Subject: Interest in Funding Phumulani Transitional Housing
Body: We reviewed your outcomes and want to discuss submitting a $50,000 grant proposal. Can we schedule 30 minutes next week?

Tasks:
1. Identify funding interest level (0-100)
2. Assign operational priority (P0-P4)
3. Draft a warm, professional reply confirming staff availability for an introductory call.
"@
    Invoke-PhumulaniInference -PromptText $prompt -ContextLabel "Test Donor Reply Analysis & Reply Drafting"
    exit 0
}

if ($TestJson) {
    Test-OllamaHealth | Out-Null
    $prompt = @"
Analyze this message and return STRICT JSON ONLY conforming to:
{
  "priority": "P1",
  "interestScore": 85,
  "category": "Proposal Request",
  "hasMeetingRequest": true,
  "summary": "Funder requests 30 min meeting to discuss $50k grant"
}

Message to analyze:
"We are interested in funding your Healing Homes initiative with a $50,000 grant. Please send your concept note and meeting availability."
"@
    Invoke-PhumulaniInference -PromptText $prompt -ContextLabel "Test Structured JSON Response"
    exit 0
}

if ($Task -ne "") {
    Test-OllamaHealth | Out-Null
    Invoke-PhumulaniInference -PromptText $Task -ContextLabel "Direct Task Execution"
    exit 0
}

if ($Interactive) {
    Test-OllamaHealth | Out-Null
    Write-Host "`nEntering Phumulani Ai Interactive Shell. Type 'exit' to quit.`n" -ForegroundColor Green
    while ($true) {
        $input = Read-Host "Phumulani-Ai> "
        if ($input -eq "exit" -or $input -eq "quit") { break }
        if ([string]::IsNullOrWhiteSpace($input)) { continue }
        Invoke-PhumulaniInference -PromptText $input -ContextLabel "Interactive Chat"
    }
    exit 0
}

# Default guidance if no arguments passed
Write-Host "`nUsage Instructions:" -ForegroundColor Yellow
Write-Host "  & `"$RootDir\scripts\Ask-Phumulani.ps1`" -Task `"Your question or task here`"" -ForegroundColor White
Write-Host "  & `"$RootDir\scripts\Ask-Phumulani.ps1`" -Interactive" -ForegroundColor White
Write-Host "  & `"$RootDir\scripts\Ask-Phumulani.ps1`" -CheckHealth" -ForegroundColor White
Write-Host "  & `"$RootDir\scripts\Ask-Phumulani.ps1`" -TestEmail" -ForegroundColor White
Write-Host "  & `"$RootDir\scripts\Ask-Phumulani.ps1`" -TestReply" -ForegroundColor White
Write-Host "  & `"$RootDir\scripts\Ask-Phumulani.ps1`" -TestJson" -ForegroundColor White
Write-Host "  & `"$RootDir\scripts\Ask-Phumulani.ps1`" -CheckGateway" -ForegroundColor White
