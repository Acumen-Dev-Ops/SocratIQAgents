# SocratIQ Multi-Agent System - Deployment Script (PowerShell)
# Created: October 22, 2025
# Purpose: Package and deploy all Lambda functions on Windows

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SocratIQ Multi-Agent System Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }
$STACK_NAME = "socratiq-agent-lambdas-prod"
$S3_CODE_BUCKET = "socratiq-lambda-code-prod"
$ENVIRONMENT = "prod"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  AWS Region: $AWS_REGION"
Write-Host "  Stack Name: $STACK_NAME"
Write-Host "  S3 Bucket: $S3_CODE_BUCKET"
Write-Host "  Environment: $ENVIRONMENT"
Write-Host ""

# Step 1: Install dependencies and build shared utilities
Write-Host "Step 1: Building shared utilities..." -ForegroundColor Green
Set-Location "..\..\lambda\shared"
npm install
npm run build
Write-Host "  ✓ Shared utilities built" -ForegroundColor Green
Write-Host ""

# Step 2: Package shared layer
Write-Host "Step 2: Packaging shared layer..." -ForegroundColor Green
Set-Location "..\..\"
New-Item -ItemType Directory -Force -Path "lambda\shared\nodejs\node_modules" | Out-Null
Copy-Item -Recurse -Force "lambda\shared\node_modules\*" "lambda\shared\nodejs\node_modules\"
Copy-Item -Recurse -Force "lambda\shared\dist\*" "lambda\shared\nodejs\"
Set-Location "lambda\shared"
Compress-Archive -Path "nodejs\*" -DestinationPath "..\..\agent-shared-layer.zip" -Force
Set-Location "..\..\"
Remove-Item -Recurse -Force "lambda\shared\nodejs"
Write-Host "  ✓ Shared layer packaged" -ForegroundColor Green
Write-Host ""

# Function to build agent
function Build-Agent {
    param($Name, $Path)
    Write-Host "Building $Name agent..." -ForegroundColor Green
    Set-Location $Path
    npm install
    npm run build
    Set-Location "dist"
    Copy-Item -Recurse -Force "..\..\..\shared\dist\*" "."
    Copy-Item -Recurse -Force "..\..\..\shared\node_modules" "."
    $zipPath = "..\..\..\..\$Name-agent.zip"
    Compress-Archive -Path "*" -DestinationPath $zipPath -Force
    Set-Location "..\..\..\.."
    Write-Host "  ✓ $Name agent packaged" -ForegroundColor Green
    Write-Host ""
}

# Step 3-7: Build all agents
Build-Agent "vera" "lambda\agents\vera"
Build-Agent "finn" "lambda\agents\finn"
Build-Agent "nora" "lambda\agents\nora"
Build-Agent "clia" "lambda\agents\clia"

Write-Host "Building Sophie orchestrator..." -ForegroundColor Green
Set-Location "lambda\agents\sophie"
npm install
npm run build
Set-Location "dist"
Copy-Item -Recurse -Force "..\..\..\shared\dist\*" "."
Copy-Item -Recurse -Force "..\..\..\shared\node_modules" "."
Compress-Archive -Path "*" -DestinationPath "..\..\..\..\sophie-orchestrator.zip" -Force
Set-Location "..\..\..\.."
Write-Host "  ✓ Sophie orchestrator packaged" -ForegroundColor Green
Write-Host ""

# Step 8: Create S3 bucket if it doesn't exist
Write-Host "Step 8: Checking S3 bucket..." -ForegroundColor Green
try {
    aws s3 ls "s3://$S3_CODE_BUCKET" --region $AWS_REGION 2>&1 | Out-Null
    Write-Host "  ✓ S3 bucket already exists" -ForegroundColor Green
} catch {
    Write-Host "  Creating S3 bucket: $S3_CODE_BUCKET"
    aws s3 mb "s3://$S3_CODE_BUCKET" --region $AWS_REGION
    Write-Host "  ✓ S3 bucket created" -ForegroundColor Green
}
Write-Host ""

# Step 9: Upload Lambda packages to S3
Write-Host "Step 9: Uploading Lambda packages to S3..." -ForegroundColor Green
aws s3 cp "agent-shared-layer.zip" "s3://$S3_CODE_BUCKET/layers/agent-shared-layer.zip"
Write-Host "  ✓ Shared layer uploaded" -ForegroundColor Green
aws s3 cp "vera-agent.zip" "s3://$S3_CODE_BUCKET/agents/vera-agent.zip"
Write-Host "  ✓ VERA agent uploaded" -ForegroundColor Green
aws s3 cp "finn-agent.zip" "s3://$S3_CODE_BUCKET/agents/finn-agent.zip"
Write-Host "  ✓ FINN agent uploaded" -ForegroundColor Green
aws s3 cp "nora-agent.zip" "s3://$S3_CODE_BUCKET/agents/nora-agent.zip"
Write-Host "  ✓ NORA agent uploaded" -ForegroundColor Green
aws s3 cp "clia-agent.zip" "s3://$S3_CODE_BUCKET/agents/clia-agent.zip"
Write-Host "  ✓ CLIA agent uploaded" -ForegroundColor Green
aws s3 cp "sophie-orchestrator.zip" "s3://$S3_CODE_BUCKET/agents/sophie-orchestrator.zip"
Write-Host "  ✓ Sophie orchestrator uploaded" -ForegroundColor Green
Write-Host ""

# Step 10: Deploy CloudFormation stack
Write-Host "Step 10: Deploying CloudFormation stack..." -ForegroundColor Green
Set-Location "infrastructure\lambda"

# Check if stack exists
$stackExists = $false
try {
    aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION 2>&1 | Out-Null
    $stackExists = $true
} catch {}

if (-not $stackExists) {
    Write-Host "  Creating new stack..."
    aws cloudformation create-stack `
        --stack-name $STACK_NAME `
        --template-body file://agent-lambdas.yaml `
        --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $AWS_REGION

    Write-Host "  Waiting for stack creation to complete..."
    aws cloudformation wait stack-create-complete `
        --stack-name $STACK_NAME `
        --region $AWS_REGION

    Write-Host "  ✓ Stack created successfully" -ForegroundColor Green
} else {
    Write-Host "  Updating existing stack..."
    try {
        aws cloudformation update-stack `
            --stack-name $STACK_NAME `
            --template-body file://agent-lambdas.yaml `
            --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT `
            --capabilities CAPABILITY_NAMED_IAM `
            --region $AWS_REGION

        Write-Host "  Waiting for stack update to complete..."
        aws cloudformation wait stack-update-complete `
            --stack-name $STACK_NAME `
            --region $AWS_REGION

        Write-Host "  ✓ Stack updated successfully" -ForegroundColor Green
    } catch {
        Write-Host "  No changes to deploy or update failed" -ForegroundColor Yellow
    }
}

Set-Location "..\..\"
Write-Host ""

# Step 11: Get stack outputs
Write-Host "Step 11: Retrieving stack outputs..." -ForegroundColor Green
aws cloudformation describe-stacks `
    --stack-name $STACK_NAME `
    --region $AWS_REGION `
    --query 'Stacks[0].Outputs' `
    --output table
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✓ Deployment Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test individual agents using AWS Lambda console"
Write-Host "2. Test Sophie orchestrator with multi-agent queries"
Write-Host "3. Monitor CloudWatch logs for any errors"
Write-Host "4. Update API Gateway to point to Sophie Lambda"
Write-Host ""
Write-Host "Lambda Function ARNs:" -ForegroundColor Yellow
aws cloudformation describe-stacks --stack-name $STACK_NAME --region $AWS_REGION --query "Stacks[0].Outputs[?OutputKey=='VERALambdaArn' || OutputKey=='FINNLambdaArn' || OutputKey=='NORALambdaArn' || OutputKey=='CLIALambdaArn' || OutputKey=='SophieLambdaArn'].{Agent:OutputKey,ARN:OutputValue}" --output table
Write-Host ""
