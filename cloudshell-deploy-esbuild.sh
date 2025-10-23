#!/bin/bash
# SocratIQ - CloudShell Deployment with esbuild
# Simple bundling approach - no TypeScript config headaches!

set -e

echo "================================================"
echo "SocratIQ Deployment (esbuild)"
echo "================================================"
echo ""

AWS_REGION="us-east-1"
S3_CODE_BUCKET="socratiq-lambda-code-prod"

# Install esbuild locally
echo "Installing esbuild..."
npm install esbuild
export PATH="./node_modules/.bin:$PATH"
echo ""

# Build each agent with esbuild (bundles everything into single index.js)
for AGENT in vera finn nora clia sophie; do
    echo "Building $AGENT..."
    cd lambda/agents/$AGENT
    mkdir -p dist
    npx esbuild index.ts \
        --bundle \
        --platform=node \
        --target=node20 \
        --format=cjs \
        --outfile=dist/index.js \
        --external:@aws-sdk/* \
        --external:aws-sdk \
        --minify
    cd ../../..
    echo "✓ $AGENT built"
done
echo ""

# Package (just the single bundled index.js file)
echo "Packaging..."
cd lambda/agents/vera/dist && zip -q ../../../vera-agent.zip index.js && cd ../../../..
cd lambda/agents/finn/dist && zip -q ../../../finn-agent.zip index.js && cd ../../../..
cd lambda/agents/nora/dist && zip -q ../../../nora-agent.zip index.js && cd ../../../..
cd lambda/agents/clia/dist && zip -q ../../../clia-agent.zip index.js && cd ../../../..
cd lambda/agents/sophie/dist && zip -q ../../../sophie-orchestrator.zip index.js && cd ../../../..
echo "✓ All packages created"
echo ""

# Upload to S3
echo "Uploading to S3..."
aws s3 cp vera-agent.zip s3://${S3_CODE_BUCKET}/agents/ --quiet
aws s3 cp finn-agent.zip s3://${S3_CODE_BUCKET}/agents/ --quiet
aws s3 cp nora-agent.zip s3://${S3_CODE_BUCKET}/agents/ --quiet
aws s3 cp clia-agent.zip s3://${S3_CODE_BUCKET}/agents/ --quiet
aws s3 cp sophie-orchestrator.zip s3://${S3_CODE_BUCKET}/agents/ --quiet
echo "✓ Uploaded to S3"
echo ""

# Force update Lambda functions
echo "Updating Lambda functions..."
TIMESTAMP=$(date +%s)

aws s3 cp vera-agent.zip s3://${S3_CODE_BUCKET}/agents/vera-agent-${TIMESTAMP}.zip --quiet
aws lambda update-function-code --function-name SocratIQ-VERA-Agent-prod --s3-bucket ${S3_CODE_BUCKET} --s3-key agents/vera-agent-${TIMESTAMP}.zip --region ${AWS_REGION} --no-cli-pager > /dev/null

aws s3 cp finn-agent.zip s3://${S3_CODE_BUCKET}/agents/finn-agent-${TIMESTAMP}.zip --quiet
aws lambda update-function-code --function-name SocratIQ-FINN-Agent-prod --s3-bucket ${S3_CODE_BUCKET} --s3-key agents/finn-agent-${TIMESTAMP}.zip --region ${AWS_REGION} --no-cli-pager > /dev/null

aws s3 cp nora-agent.zip s3://${S3_CODE_BUCKET}/agents/nora-agent-${TIMESTAMP}.zip --quiet
aws lambda update-function-code --function-name SocratIQ-NORA-Agent-prod --s3-bucket ${S3_CODE_BUCKET} --s3-key agents/nora-agent-${TIMESTAMP}.zip --region ${AWS_REGION} --no-cli-pager > /dev/null

aws s3 cp clia-agent.zip s3://${S3_CODE_BUCKET}/agents/clia-agent-${TIMESTAMP}.zip --quiet
aws lambda update-function-code --function-name SocratIQ-CLIA-Agent-prod --s3-bucket ${S3_CODE_BUCKET} --s3-key agents/clia-agent-${TIMESTAMP}.zip --region ${AWS_REGION} --no-cli-pager > /dev/null

aws s3 cp sophie-orchestrator.zip s3://${S3_CODE_BUCKET}/agents/sophie-orchestrator-${TIMESTAMP}.zip --quiet
aws lambda update-function-code --function-name SocratIQ-Sophie-Orchestrator-prod --s3-bucket ${S3_CODE_BUCKET} --s3-key agents/sophie-orchestrator-${TIMESTAMP}.zip --region ${AWS_REGION} --no-cli-pager > /dev/null

echo "✓ All Lambdas updated"
echo ""

echo "================================================"
echo "✓ DEPLOYMENT COMPLETE!"
echo "================================================"
echo ""
echo "Waiting 10 seconds for functions to become active..."
sleep 10
echo ""
echo "Test with:"
echo "aws lambda invoke --function-name SocratIQ-CLIA-Agent-prod --cli-binary-format raw-in-base64-out --payload '{\"query\":\"What are the phases of clinical trials?\"}' test.json && cat test.json"
