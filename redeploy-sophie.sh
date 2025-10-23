#!/bin/bash
# Redeploy Sophie with leadership changes
# Run this in AWS CloudShell after pushing changes to GitHub

set -e

AWS_REGION="us-east-1"
S3_CODE_BUCKET="socratiq-lambda-code-prod"
TIMESTAMP=$(date +%s)

echo "================================================"
echo "Redeploying Sophie with Leadership Changes"
echo "================================================"
echo ""

# Pull latest code
echo "Step 1: Pulling latest code from GitHub..."
cd ~/SocratIQAgents
git pull
echo "✓ Code updated"
echo ""

# Rebuild Sophie
echo "Step 2: Rebuilding Sophie with esbuild..."
cd lambda/agents/sophie

# Clean dist
rm -rf dist
mkdir -p dist

# Bundle with esbuild
npx esbuild index.ts \
    --bundle \
    --platform=node \
    --target=node20 \
    --format=cjs \
    --outfile=dist/index.js \
    --external:@aws-sdk/* \
    --external:aws-sdk \
    --minify

echo "✓ Sophie rebuilt"
echo ""

# Package
echo "Step 3: Creating deployment package..."
cd ~/SocratIQAgents
rm -f sophie-orchestrator.zip
cd lambda/agents/sophie/dist
zip -q ../../../../sophie-orchestrator.zip index.js
cd ~/SocratIQAgents
echo "✓ Package created"
echo ""

# Upload to S3
echo "Step 4: Uploading to S3..."
aws s3 cp sophie-orchestrator.zip \
    s3://${S3_CODE_BUCKET}/agents/sophie-orchestrator-${TIMESTAMP}.zip \
    --region ${AWS_REGION} \
    --quiet
echo "✓ Uploaded to S3"
echo ""

# Update Lambda
echo "Step 5: Updating Lambda function..."
aws lambda update-function-code \
    --function-name SocratIQ-Sophie-Orchestrator-prod \
    --s3-bucket ${S3_CODE_BUCKET} \
    --s3-key agents/sophie-orchestrator-${TIMESTAMP}.zip \
    --region ${AWS_REGION} \
    --publish \
    --no-cli-pager
echo "✓ Lambda updated"
echo ""

echo "================================================"
echo "✓ SOPHIE REDEPLOYED SUCCESSFULLY!"
echo "================================================"
echo ""
echo "Sophie now has strategic leadership capabilities:"
echo "- Creates execution plans with agent-specific tasks"
echo "- Delegates targeted assignments to each agent"
echo "- Synthesizes multi-agent responses into unified recommendations"
echo ""
echo "Test with complex query:"
echo 'aws lambda invoke --function-name SocratIQ-Sophie-Orchestrator-prod --cli-binary-format raw-in-base64-out --payload '"'"'{"query":"Create a Target Product Profile for an intradermal antibiotic for surgical infections"}'"'"' sophie-tpp-test.json && cat sophie-tpp-test.json | jq '"'"'.'"'"
echo ""
echo "View logs to see execution plan:"
echo "aws logs tail /aws/lambda/SocratIQ-Sophie-Orchestrator-prod --follow"
echo ""
