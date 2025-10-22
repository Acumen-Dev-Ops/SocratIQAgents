# SocratIQ Agent Framework - Quick Start Guide

**Version**: 1.0.0
**Last Updated**: October 22, 2025

## Overview

This guide will help you quickly deploy the SocratIQ agent framework and S3 corpus infrastructure.

## Prerequisites

- AWS CLI installed and configured
- AWS credentials with permissions for:
  - S3 bucket creation
  - IAM policy creation
  - CloudFormation stack deployment
- Access to `us-east-1` region
- Bash shell (Git Bash on Windows, Terminal on Mac/Linux)

## 5-Minute Setup

### Step 1: Clone and Review Framework

```bash
# If you're reading this, you already have the repository!
# Review the agent skills:
ls -la agents/*/skills.md

# VERA - Product & Clinical Intelligence
# FINN - Financial & Investment Intelligence
# NORA - Legal, Regulatory & IP Intelligence
# CLIA - Clinical Trials & Market Intelligence
# Sophie - Strategic Orchestration Engine
```

### Step 2: Deploy S3 Buckets

```bash
# Navigate to infrastructure directory
cd infrastructure/s3

# Make deployment script executable (if not already)
chmod +x deploy-buckets.sh

# Deploy to production
./deploy-buckets.sh prod

# Expected output:
# - 5 S3 buckets created (one per agent)
# - IAM policy created for Lambda access
# - Bucket names and policy ARN displayed
```

### Step 3: Capture Output Values

```bash
# Save the bucket names from the output:
# socratiq-vera-corpus-prod
# socratiq-finn-corpus-prod
# socratiq-nora-corpus-prod
# socratiq-clia-corpus-prod
# socratiq-sophie-corpus-prod

# Save the IAM policy ARN (example):
# arn:aws:iam::797455229240:policy/SocratIQ-AgentCorpusAccess-prod
```

### Step 4: Attach IAM Policy to Lambda Role

```bash
# Get policy ARN from CloudFormation stack
POLICY_ARN=$(aws cloudformation describe-stacks \
  --stack-name socratiq-agent-corpus-prod \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`AgentCorpusAccessPolicyArn`].OutputValue' \
  --output text)

echo "Policy ARN: $POLICY_ARN"

# Attach to existing Lambda role (replace with your actual role name)
aws iam attach-role-policy \
  --role-name SophieLambdaRole \
  --policy-arn $POLICY_ARN \
  --region us-east-1

echo "✓ IAM policy attached to Lambda role"
```

### Step 5: Update Lambda Environment Variables

```bash
# Update Lambda function with bucket names
aws lambda update-function-configuration \
  --function-name SocratIQ-AskSophie \
  --region us-east-1 \
  --environment Variables="{
    VERA_CORPUS_BUCKET=socratiq-vera-corpus-prod,
    FINN_CORPUS_BUCKET=socratiq-finn-corpus-prod,
    NORA_CORPUS_BUCKET=socratiq-nora-corpus-prod,
    CLIA_CORPUS_BUCKET=socratiq-clia-corpus-prod,
    SOPHIE_CORPUS_BUCKET=socratiq-sophie-corpus-prod
  }"

echo "✓ Lambda environment variables updated"
```

### Step 6: Verify Deployment

```bash
# List all agent corpus buckets
aws s3 ls | grep socratiq.*corpus

# Expected output:
# 2025-10-22 10:00:00 socratiq-clia-corpus-prod
# 2025-10-22 10:00:00 socratiq-finn-corpus-prod
# 2025-10-22 10:00:00 socratiq-nora-corpus-prod
# 2025-10-22 10:00:00 socratiq-sophie-corpus-prod
# 2025-10-22 10:00:00 socratiq-vera-corpus-prod

# Check Lambda function configuration
aws lambda get-function-configuration \
  --function-name SocratIQ-AskSophie \
  --region us-east-1 \
  --query 'Environment.Variables'

# Verify buckets are empty (initial state)
aws s3 ls s3://socratiq-vera-corpus-prod/
# (should return empty - ready for corpus upload)
```

## Next Steps

### 1. Prepare Corpus Documents

Organize your pharmaceutical documents by agent:

```
local-corpus/
├── vera/
│   ├── clinical-trials/
│   ├── product-development/
│   └── manufacturing/
├── finn/
│   ├── financial-models/
│   ├── budget-analyses/
│   └── market-access/
├── nora/
│   ├── regulatory/
│   ├── patents/
│   └── federal-tech/
├── clia/
│   ├── market-research/
│   ├── competitive-intel/
│   └── clinical-operations/
└── sophie/
    ├── orchestration-logs/
    ├── decision-frameworks/
    └── benchmarks/
```

### 2. Upload Corpus Documents

```bash
# Upload VERA product development documents
aws s3 cp ./local-corpus/vera/ \
  s3://socratiq-vera-corpus-prod/documents/ \
  --recursive \
  --region us-east-1

# Upload FINN financial models
aws s3 cp ./local-corpus/finn/ \
  s3://socratiq-finn-corpus-prod/documents/ \
  --recursive \
  --region us-east-1

# Upload NORA regulatory documents
aws s3 cp ./local-corpus/nora/ \
  s3://socratiq-nora-corpus-prod/documents/ \
  --recursive \
  --region us-east-1

# Upload CLIA market research
aws s3 cp ./local-corpus/clia/ \
  s3://socratiq-clia-corpus-prod/documents/ \
  --recursive \
  --region us-east-1

# Upload Sophie orchestration data
aws s3 cp ./local-corpus/sophie/ \
  s3://socratiq-sophie-corpus-prod/documents/ \
  --recursive \
  --region us-east-1
```

### 3. Verify Upload

```bash
# Check document counts
echo "VERA documents:"
aws s3 ls s3://socratiq-vera-corpus-prod/documents/ --recursive | wc -l

echo "FINN documents:"
aws s3 ls s3://socratiq-finn-corpus-prod/documents/ --recursive | wc -l

echo "NORA documents:"
aws s3 ls s3://socratiq-nora-corpus-prod/documents/ --recursive | wc -l

echo "CLIA documents:"
aws s3 ls s3://socratiq-clia-corpus-prod/documents/ --recursive | wc -l

echo "Sophie documents:"
aws s3 ls s3://socratiq-sophie-corpus-prod/documents/ --recursive | wc -l
```

### 4. Test Agent Integration

```bash
# Test Sophie orchestration with corpus access
curl -X POST https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod/api/sophie/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "What is the regulatory pathway for our rare disease asset?",
    "conversationId": "test-001"
  }'

# Expected response:
# {
#   "response": "Based on NORA regulatory analysis...",
#   "agents": ["NORA-Regulatory", "VERA-Clinical", "FINN-Budget"],
#   "confidence": "High (85%)",
#   "sources": ["s3://socratiq-nora-corpus-prod/documents/fda-guidance/..."]
# }
```

## Common Issues & Solutions

### Issue: "Access Denied" when uploading to S3

**Solution**: Verify your AWS credentials have S3 write permissions

```bash
aws sts get-caller-identity
# Verify you're using the correct AWS account

aws iam list-attached-user-policies --user-name YOUR_USERNAME
# Ensure you have S3 write permissions
```

### Issue: Lambda can't access S3 buckets

**Solution**: Verify IAM policy is attached to Lambda role

```bash
# List policies attached to Lambda role
aws iam list-attached-role-policies --role-name SophieLambdaRole

# Should include: SocratIQ-AgentCorpusAccess-prod
```

### Issue: CloudFormation stack creation fails

**Solution**: Check CloudFormation events for error details

```bash
aws cloudformation describe-stack-events \
  --stack-name socratiq-agent-corpus-prod \
  --max-items 10
```

## Testing Checklist

- [ ] All 5 S3 buckets created successfully
- [ ] IAM policy created and attached to Lambda role
- [ ] Lambda environment variables updated with bucket names
- [ ] Test document uploaded to each bucket
- [ ] Lambda function can read from buckets (test via CloudWatch Logs)
- [ ] Sophie orchestration endpoint responds with agent analysis

## Additional Resources

- **Full Documentation**: [README.md](README.md)
- **Agent Skills**:
  - [VERA Skills](agents/VERA/skills.md)
  - [FINN Skills](agents/FINN/skills.md)
  - [NORA Skills](agents/NORA/skills.md)
  - [CLIA Skills](agents/CLIA/skills.md)
  - [Sophie Skills](agents/Sophie/skills.md)
- **Production Architecture**: [CURRENT_ARCHITECTURE_STATE.md](CURRENT_ARCHITECTURE_STATE.md)
- **Product Requirements**: [socratiq_prd_oct_9_2025.md](socratiq_prd_oct_9_2025.md)

## Support

For issues or questions:
1. Review agent skills documentation for specific agent capabilities
2. Check CloudWatch Logs for Lambda function errors
3. Verify S3 bucket permissions and IAM policies
4. Contact development team via Slack/Discord

---

**Deployment Time**: ~5 minutes
**Corpus Upload Time**: Varies by document volume (typically 10-30 minutes)
**Testing Time**: ~10 minutes

**Total Setup Time**: ~30-60 minutes

---

**Last Updated**: October 22, 2025
**Version**: 1.0.0
