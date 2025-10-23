#!/bin/bash
# SocratIQ Multi-Agent System - AWS CloudShell Deployment (Minimal)
# Optimized for CloudShell's limited disk space

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

echo "Step 7: Packaging Lambda functions (minimal - no node_modules)..."

# Package VERA - minimal: just compiled code
cd lambda/agents/vera/dist/agents/vera
cp -r ../../shared ./
zip -r -q ../../../../../../vera-agent.zip . shared/
cd ../../../../../..
echo "✓ VERA packaged"

# Package FINN
cd lambda/agents/finn/dist/agents/finn
cp -r ../../shared ./
zip -r -q ../../../../../../finn-agent.zip . shared/
cd ../../../../../..
echo "✓ FINN packaged"

# Package NORA
cd lambda/agents/nora/dist/agents/nora
cp -r ../../shared ./
zip -r -q ../../../../../../nora-agent.zip . shared/
cd ../../../../../..
echo "✓ NORA packaged"

# Package CLIA
cd lambda/agents/clia/dist/agents/clia
cp -r ../../shared ./
zip -r -q ../../../../../../clia-agent.zip . shared/
cd ../../../../../..
echo "✓ CLIA packaged"

# Package Sophie
cd lambda/agents/sophie/dist/agents/sophie
cp -r ../../shared ./
zip -r -q ../../../../../../sophie-orchestrator.zip . shared/
cd ../../../../../..
echo "✓ Sophie packaged"
echo ""

echo "Step 8: Creating S3 bucket (if needed)..."
aws s3 mb s3://${S3_CODE_BUCKET} --region ${AWS_REGION} 2>/dev/null || echo "Bucket already exists"
echo ""

echo "Step 9: Uploading Lambda packages to S3..."
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
if aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${AWS_REGION} &>/dev/null; then
    echo "Updating existing stack..."
    aws cloudformation update-stack \
        --stack-name ${STACK_NAME} \
        --template-body file://infrastructure/lambda/agent-lambdas.yaml \
        --region ${AWS_REGION} \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameters \
            ParameterKey=Environment,ParameterValue=prod \
            ParameterKey=S3CodeBucket,ParameterValue=${S3_CODE_BUCKET}

    echo "Waiting for stack update..."
    aws cloudformation wait stack-update-complete \
        --stack-name ${STACK_NAME} \
        --region ${AWS_REGION}
    echo "✓ Stack updated successfully"
else
    echo "Creating new stack..."
    aws cloudformation create-stack \
        --stack-name ${STACK_NAME} \
        --template-body file://infrastructure/lambda/agent-lambdas.yaml \
        --region ${AWS_REGION} \
        --capabilities CAPABILITY_NAMED_IAM \
        --parameters \
            ParameterKey=Environment,ParameterValue=prod \
            ParameterKey=S3CodeBucket,ParameterValue=${S3_CODE_BUCKET}

    echo "Waiting for stack creation (this takes 5-7 minutes)..."
    aws cloudformation wait stack-create-complete \
        --stack-name ${STACK_NAME} \
        --region ${AWS_REGION}
    echo "✓ Stack created successfully"
fi
echo ""

echo "================================================"
echo "✓ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "Lambda Functions Deployed (using Lambda runtime's built-in AWS SDK)"
echo ""

echo "Next Steps:"
echo "1. Test VERA: aws lambda invoke --function-name SocratIQ-VERA-Agent-prod --cli-binary-format raw-in-base64-out --payload '{\"query\":\"What are clinical trial phases?\"}' response.json && cat response.json"
echo "2. Test Sophie: aws lambda invoke --function-name SocratIQ-Sophie-Orchestrator-prod --cli-binary-format raw-in-base64-out --payload '{\"message\":\"What is a CRADA?\"}' response.json && cat response.json"
echo "3. View logs: aws logs tail /aws/lambda/SocratIQ-VERA-Agent-prod --follow"
echo ""
