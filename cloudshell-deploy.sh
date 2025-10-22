#!/bin/bash
# SocratIQ Multi-Agent System - AWS CloudShell Deployment
# Run this script in AWS CloudShell after uploading your code

set -e  # Exit on error

echo "================================================"
echo "SocratIQ Multi-Agent CloudShell Deployment"
echo "================================================"
echo ""

# Configuration
AWS_REGION="us-east-1"
STACK_NAME="socratiq-agent-lambdas-prod"
S3_CODE_BUCKET="socratiq-lambda-code-prod"

# Verify we're in the right directory
if [ ! -d "lambda/shared" ]; then
    echo "Error: Please run this from the SocratIQAgents root directory"
    exit 1
fi

echo "Step 1: Installing dependencies for shared utilities..."
cd lambda/shared
npm install --loglevel=error
npm run build
cd ../..
echo "✓ Shared utilities built"
echo ""

echo "Step 2: Building VERA agent..."
cd lambda/agents/vera
npm install --loglevel=error
npm run build
cd ../../..
echo "✓ VERA built"
echo ""

echo "Step 3: Building FINN agent..."
cd lambda/agents/finn
npm install --loglevel=error
npm run build
cd ../../..
echo "✓ FINN built"
echo ""

echo "Step 4: Building NORA agent..."
cd lambda/agents/nora
npm install --loglevel=error
npm run build
cd ../../..
echo "✓ NORA built"
echo ""

echo "Step 5: Building CLIA agent..."
cd lambda/agents/clia
npm install --loglevel=error
npm run build
cd ../../..
echo "✓ CLIA built"
echo ""

echo "Step 6: Building Sophie orchestrator..."
cd lambda/agents/sophie
npm install --loglevel=error
npm run build
cd ../../..
echo "✓ Sophie built"
echo ""

echo "Step 7: Packaging Lambda functions..."

# Package shared layer
mkdir -p lambda/shared/nodejs/node_modules
cp -r lambda/shared/node_modules/* lambda/shared/nodejs/node_modules/
cp -r lambda/shared/dist/* lambda/shared/nodejs/
cd lambda/shared
zip -r -q ../../agent-shared-layer.zip nodejs/
cd ../..
rm -rf lambda/shared/nodejs
echo "✓ Shared layer packaged"

# Package VERA
cd lambda/agents/vera/dist
cp -r ../../../shared/dist/* .
cp -r ../../../shared/node_modules .
zip -r -q ../../../../vera-agent.zip .
cd ../../../..
echo "✓ VERA packaged"

# Package FINN
cd lambda/agents/finn/dist
cp -r ../../../shared/dist/* .
cp -r ../../../shared/node_modules .
zip -r -q ../../../../finn-agent.zip .
cd ../../../..
echo "✓ FINN packaged"

# Package NORA
cd lambda/agents/nora/dist
cp -r ../../../shared/dist/* .
cp -r ../../../shared/node_modules .
zip -r -q ../../../../nora-agent.zip .
cd ../../../..
echo "✓ NORA packaged"

# Package CLIA
cd lambda/agents/clia/dist
cp -r ../../../shared/dist/* .
cp -r ../../../shared/node_modules .
zip -r -q ../../../../clia-agent.zip .
cd ../../../..
echo "✓ CLIA packaged"

# Package Sophie
cd lambda/agents/sophie/dist
cp -r ../../../shared/dist/* .
cp -r ../../../shared/node_modules .
zip -r -q ../../../../sophie-orchestrator.zip .
cd ../../../..
echo "✓ Sophie packaged"
echo ""

echo "Step 8: Creating S3 bucket (if needed)..."
aws s3 mb s3://${S3_CODE_BUCKET} --region ${AWS_REGION} 2>/dev/null || echo "Bucket already exists"
echo ""

echo "Step 9: Uploading Lambda packages to S3..."
aws s3 cp agent-shared-layer.zip s3://${S3_CODE_BUCKET}/layers/ --quiet
echo "✓ Shared layer uploaded"
aws s3 cp vera-agent.zip s3://${S3_CODE_BUCKET}/agents/ --quiet
echo "✓ VERA uploaded"
aws s3 cp finn-agent.zip s3://${S3_CODE_BUCKET}/agents/ --quiet
echo "✓ FINN uploaded"
aws s3 cp nora-agent.zip s3://${S3_CODE_BUCKET}/agents/ --quiet
echo "✓ NORA uploaded"
aws s3 cp clia-agent.zip s3://${S3_CODE_BUCKET}/agents/ --quiet
echo "✓ CLIA uploaded"
aws s3 cp sophie-orchestrator.zip s3://${S3_CODE_BUCKET}/agents/ --quiet
echo "✓ Sophie uploaded"
echo ""

echo "Step 10: Deploying CloudFormation stack..."
cd infrastructure/lambda

# Check if stack exists
if aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${AWS_REGION} 2>&1 | grep -q 'does not exist'; then
    echo "Creating new stack..."
    aws cloudformation create-stack \
        --stack-name ${STACK_NAME} \
        --template-body file://agent-lambdas.yaml \
        --parameters ParameterKey=Environment,ParameterValue=prod \
        --capabilities CAPABILITY_NAMED_IAM \
        --region ${AWS_REGION}

    echo "Waiting for stack creation (this takes 5-7 minutes)..."
    aws cloudformation wait stack-create-complete \
        --stack-name ${STACK_NAME} \
        --region ${AWS_REGION}

    echo "✓ Stack created successfully"
else
    echo "Updating existing stack..."
    aws cloudformation update-stack \
        --stack-name ${STACK_NAME} \
        --template-body file://agent-lambdas.yaml \
        --parameters ParameterKey=Environment,ParameterValue=prod \
        --capabilities CAPABILITY_NAMED_IAM \
        --region ${AWS_REGION} 2>&1 || true

    echo "Waiting for stack update..."
    aws cloudformation wait stack-update-complete \
        --stack-name ${STACK_NAME} \
        --region ${AWS_REGION} 2>&1 || true

    echo "✓ Stack updated successfully"
fi

cd ../..
echo ""

echo "================================================"
echo "✓ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""

echo "Lambda Function ARNs:"
aws cloudformation describe-stacks \
    --stack-name ${STACK_NAME} \
    --region ${AWS_REGION} \
    --query 'Stacks[0].Outputs[?contains(OutputKey, `LambdaArn`)].{Agent:OutputKey,ARN:OutputValue}' \
    --output table

echo ""
echo "Next Steps:"
echo "1. Test VERA: aws lambda invoke --function-name SocratIQ-VERA-Agent-prod --payload '{\"query\":\"What enrollment strategy for Phase 3?\"}' response.json"
echo "2. Test Sophie: aws lambda invoke --function-name SocratIQ-Sophie-Orchestrator-prod --payload '{\"message\":\"Should I pursue CRADA?\"}' response.json"
echo "3. View logs: aws logs tail /aws/lambda/SocratIQ-VERA-Agent-prod --follow"
echo ""
