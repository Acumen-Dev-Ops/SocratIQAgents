#!/bin/bash
# SocratIQ Multi-Agent System - Deployment Script
# Created: October 22, 2025
# Purpose: Package and deploy all Lambda functions

set -e  # Exit on error

echo "================================================"
echo "SocratIQ Multi-Agent System Deployment"
echo "================================================"
echo ""

# Configuration
AWS_REGION="${AWS_REGION:-us-east-1}"
STACK_NAME="socratiq-agent-lambdas-prod"
S3_CODE_BUCKET="socratiq-lambda-code-prod"
ENVIRONMENT="prod"

echo "Configuration:"
echo "  AWS Region: $AWS_REGION"
echo "  Stack Name: $STACK_NAME"
echo "  S3 Bucket: $S3_CODE_BUCKET"
echo "  Environment: $ENVIRONMENT"
echo ""

# Step 1: Install dependencies and build shared utilities
echo "Step 1: Building shared utilities..."
cd ../../lambda/shared
npm install
npm run build
echo "  ✓ Shared utilities built"
echo ""

# Step 2: Package shared layer
echo "Step 2: Packaging shared layer..."
cd ../..
mkdir -p lambda/shared/nodejs/node_modules
cp -r lambda/shared/node_modules/* lambda/shared/nodejs/node_modules/
cp -r lambda/shared/dist/* lambda/shared/nodejs/
cd lambda/shared
zip -r ../../agent-shared-layer.zip nodejs/
cd ../..
rm -rf lambda/shared/nodejs
echo "  ✓ Shared layer packaged"
echo ""

# Step 3: Build and package VERA agent
echo "Step 3: Building VERA agent..."
cd lambda/agents/vera
npm install
npm run build
cd dist
cp -r ../../../shared/dist/* .
cp -r ../../../shared/node_modules .
zip -r ../../../../vera-agent.zip .
cd ../../../..
echo "  ✓ VERA agent packaged"
echo ""

# Step 4: Build and package FINN agent
echo "Step 4: Building FINN agent..."
cd lambda/agents/finn
npm install
npm run build
cd dist
cp -r ../../../shared/dist/* .
cp -r ../../../shared/node_modules .
zip -r ../../../../finn-agent.zip .
cd ../../../..
echo "  ✓ FINN agent packaged"
echo ""

# Step 5: Build and package NORA agent
echo "Step 5: Building NORA agent..."
cd lambda/agents/nora
npm install
npm run build
cd dist
cp -r ../../../shared/dist/* .
cp -r ../../../shared/node_modules .
zip -r ../../../../nora-agent.zip .
cd ../../../..
echo "  ✓ NORA agent packaged"
echo ""

# Step 6: Build and package CLIA agent
echo "Step 6: Building CLIA agent..."
cd lambda/agents/clia
npm install
npm run build
cd dist
cp -r ../../../shared/dist/* .
cp -r ../../../shared/node_modules .
zip -r ../../../../clia-agent.zip .
cd ../../../..
echo "  ✓ CLIA agent packaged"
echo ""

# Step 7: Build and package Sophie orchestrator
echo "Step 7: Building Sophie orchestrator..."
cd lambda/agents/sophie
npm install
npm run build
cd dist
cp -r ../../../shared/dist/* .
cp -r ../../../shared/node_modules .
zip -r ../../../../sophie-orchestrator.zip .
cd ../../../..
echo "  ✓ Sophie orchestrator packaged"
echo ""

# Step 8: Create S3 bucket if it doesn't exist
echo "Step 8: Checking S3 bucket..."
if aws s3 ls "s3://$S3_CODE_BUCKET" 2>&1 | grep -q 'NoSuchBucket'; then
    echo "  Creating S3 bucket: $S3_CODE_BUCKET"
    aws s3 mb "s3://$S3_CODE_BUCKET" --region "$AWS_REGION"
    echo "  ✓ S3 bucket created"
else
    echo "  ✓ S3 bucket already exists"
fi
echo ""

# Step 9: Upload Lambda packages to S3
echo "Step 9: Uploading Lambda packages to S3..."
aws s3 cp agent-shared-layer.zip "s3://$S3_CODE_BUCKET/layers/agent-shared-layer.zip"
echo "  ✓ Shared layer uploaded"
aws s3 cp vera-agent.zip "s3://$S3_CODE_BUCKET/agents/vera-agent.zip"
echo "  ✓ VERA agent uploaded"
aws s3 cp finn-agent.zip "s3://$S3_CODE_BUCKET/agents/finn-agent.zip"
echo "  ✓ FINN agent uploaded"
aws s3 cp nora-agent.zip "s3://$S3_CODE_BUCKET/agents/nora-agent.zip"
echo "  ✓ NORA agent uploaded"
aws s3 cp clia-agent.zip "s3://$S3_CODE_BUCKET/agents/clia-agent.zip"
echo "  ✓ CLIA agent uploaded"
aws s3 cp sophie-orchestrator.zip "s3://$S3_CODE_BUCKET/agents/sophie-orchestrator.zip"
echo "  ✓ Sophie orchestrator uploaded"
echo ""

# Step 10: Deploy CloudFormation stack
echo "Step 10: Deploying CloudFormation stack..."
cd infrastructure/lambda

# Check if stack exists
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" 2>&1 | grep -q 'does not exist'; then
    echo "  Creating new stack..."
    aws cloudformation create-stack \
        --stack-name "$STACK_NAME" \
        --template-body file://agent-lambdas.yaml \
        --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "$AWS_REGION"

    echo "  Waiting for stack creation to complete..."
    aws cloudformation wait stack-create-complete \
        --stack-name "$STACK_NAME" \
        --region "$AWS_REGION"

    echo "  ✓ Stack created successfully"
else
    echo "  Updating existing stack..."
    aws cloudformation update-stack \
        --stack-name "$STACK_NAME" \
        --template-body file://agent-lambdas.yaml \
        --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "$AWS_REGION" || true

    echo "  Waiting for stack update to complete..."
    aws cloudformation wait stack-update-complete \
        --stack-name "$STACK_NAME" \
        --region "$AWS_REGION" || true

    echo "  ✓ Stack updated successfully"
fi

cd ../..
echo ""

# Step 11: Get stack outputs
echo "Step 11: Retrieving stack outputs..."
aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query 'Stacks[0].Outputs' \
    --output table
echo ""

echo "================================================"
echo "✓ Deployment Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Test individual agents using AWS Lambda console"
echo "2. Test Sophie orchestrator with multi-agent queries"
echo "3. Monitor CloudWatch logs for any errors"
echo "4. Update API Gateway to point to Sophie Lambda"
echo ""
echo "Lambda Function ARNs:"
aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query 'Stacks[0].Outputs[?OutputKey==`VERALambdaArn` || OutputKey==`FINNLambdaArn` || OutputKey==`NORALambdaArn` || OutputKey==`CLIALambdaArn` || OutputKey==`SophieLambdaArn`].{Agent:OutputKey,ARN:OutputValue}' \
    --output table
echo ""
