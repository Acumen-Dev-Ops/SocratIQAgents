#!/bin/bash
# Force update Lambda functions with new code
# This script re-uploads packages and forces Lambda to use new code

set -e

AWS_REGION="us-east-1"
S3_CODE_BUCKET="socratiq-lambda-code-prod"
TIMESTAMP=$(date +%s)

echo "Force updating Lambda functions with timestamp: $TIMESTAMP"
echo ""

# Upload with timestamp to force update
echo "Uploading packages with new keys..."
aws s3 cp vera-agent.zip s3://${S3_CODE_BUCKET}/agents/vera-agent-${TIMESTAMP}.zip --quiet
aws s3 cp finn-agent.zip s3://${S3_CODE_BUCKET}/agents/finn-agent-${TIMESTAMP}.zip --quiet
aws s3 cp nora-agent.zip s3://${S3_CODE_BUCKET}/agents/nora-agent-${TIMESTAMP}.zip --quiet
aws s3 cp clia-agent.zip s3://${S3_CODE_BUCKET}/agents/clia-agent-${TIMESTAMP}.zip --quiet
aws s3 cp sophie-orchestrator.zip s3://${S3_CODE_BUCKET}/agents/sophie-orchestrator-${TIMESTAMP}.zip --quiet
echo "✓ Packages uploaded"
echo ""

# Update each Lambda function directly
echo "Updating VERA Lambda..."
aws lambda update-function-code \
  --function-name SocratIQ-VERA-Agent-prod \
  --s3-bucket ${S3_CODE_BUCKET} \
  --s3-key agents/vera-agent-${TIMESTAMP}.zip \
  --region ${AWS_REGION} \
  --no-cli-pager
echo "✓ VERA updated"
echo ""

echo "Updating FINN Lambda..."
aws lambda update-function-code \
  --function-name SocratIQ-FINN-Agent-prod \
  --s3-bucket ${S3_CODE_BUCKET} \
  --s3-key agents/finn-agent-${TIMESTAMP}.zip \
  --region ${AWS_REGION} \
  --no-cli-pager
echo "✓ FINN updated"
echo ""

echo "Updating NORA Lambda..."
aws lambda update-function-code \
  --function-name SocratIQ-NORA-Agent-prod \
  --s3-bucket ${S3_CODE_BUCKET} \
  --s3-key agents/nora-agent-${TIMESTAMP}.zip \
  --region ${AWS_REGION} \
  --no-cli-pager
echo "✓ NORA updated"
echo ""

echo "Updating CLIA Lambda..."
aws lambda update-function-code \
  --function-name SocratIQ-CLIA-Agent-prod \
  --s3-bucket ${S3_CODE_BUCKET} \
  --s3-key agents/clia-agent-${TIMESTAMP}.zip \
  --region ${AWS_REGION} \
  --no-cli-pager
echo "✓ CLIA updated"
echo ""

echo "Updating Sophie Lambda..."
aws lambda update-function-code \
  --function-name SocratIQ-Sophie-Orchestrator-prod \
  --s3-bucket ${S3_CODE_BUCKET} \
  --s3-key agents/sophie-orchestrator-${TIMESTAMP}.zip \
  --region ${AWS_REGION} \
  --no-cli-pager
echo "✓ Sophie updated"
echo ""

echo "================================================"
echo "✓ ALL LAMBDAS UPDATED!"
echo "================================================"
echo ""
echo "Test with:"
echo "aws lambda invoke --function-name SocratIQ-CLIA-Agent-prod --cli-binary-format raw-in-base64-out --payload '{\"query\":\"What are the phases of clinical trials?\"}' clia-test.json && cat clia-test.json"
