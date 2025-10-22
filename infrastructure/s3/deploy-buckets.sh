#!/bin/bash

# SocratIQ Agent Corpus S3 Bucket Deployment Script
# This script deploys S3 buckets for VERA, FINN, NORA, CLIA, and Sophie agents

set -e  # Exit on error

# Configuration
STACK_NAME="socratiq-agent-corpus"
TEMPLATE_FILE="bucket-configuration.yaml"
REGION="us-east-1"
ENVIRONMENT="${1:-prod}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SocratIQ Agent Corpus S3 Bucket Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Environment: ${YELLOW}${ENVIRONMENT}${NC}"
echo -e "Region: ${YELLOW}${REGION}${NC}"
echo -e "Stack Name: ${YELLOW}${STACK_NAME}-${ENVIRONMENT}${NC}"
echo ""

# Validate template
echo -e "${YELLOW}Validating CloudFormation template...${NC}"
aws cloudformation validate-template \
  --template-body file://${TEMPLATE_FILE} \
  --region ${REGION} \
  > /dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Template validation successful${NC}"
else
  echo -e "${RED}✗ Template validation failed${NC}"
  exit 1
fi

# Check if stack exists
echo ""
echo -e "${YELLOW}Checking if stack exists...${NC}"
STACK_EXISTS=$(aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME}-${ENVIRONMENT} \
  --region ${REGION} 2>&1 || true)

if echo "$STACK_EXISTS" | grep -q "does not exist"; then
  echo -e "${YELLOW}Stack does not exist. Creating new stack...${NC}"
  OPERATION="create-stack"
else
  echo -e "${YELLOW}Stack exists. Updating stack...${NC}"
  OPERATION="update-stack"
fi

# Deploy stack
echo ""
echo -e "${YELLOW}Deploying stack...${NC}"

if [ "$OPERATION" == "create-stack" ]; then
  aws cloudformation create-stack \
    --stack-name ${STACK_NAME}-${ENVIRONMENT} \
    --template-body file://${TEMPLATE_FILE} \
    --parameters \
      ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
      ParameterKey=EnableVersioning,ParameterValue=true \
      ParameterKey=EnableEncryption,ParameterValue=true \
    --capabilities CAPABILITY_NAMED_IAM \
    --region ${REGION} \
    --tags \
      Key=Project,Value=SocratIQ \
      Key=Environment,Value=${ENVIRONMENT} \
      Key=ManagedBy,Value=CloudFormation

  echo -e "${YELLOW}Waiting for stack creation to complete...${NC}"
  aws cloudformation wait stack-create-complete \
    --stack-name ${STACK_NAME}-${ENVIRONMENT} \
    --region ${REGION}

else
  aws cloudformation update-stack \
    --stack-name ${STACK_NAME}-${ENVIRONMENT} \
    --template-body file://${TEMPLATE_FILE} \
    --parameters \
      ParameterKey=Environment,ParameterValue=${ENVIRONMENT} \
      ParameterKey=EnableVersioning,ParameterValue=true \
      ParameterKey=EnableEncryption,ParameterValue=true \
    --capabilities CAPABILITY_NAMED_IAM \
    --region ${REGION} \
    --tags \
      Key=Project,Value=SocratIQ \
      Key=Environment,Value=${ENVIRONMENT} \
      Key=ManagedBy,Value=CloudFormation

  echo -e "${YELLOW}Waiting for stack update to complete...${NC}"
  aws cloudformation wait stack-update-complete \
    --stack-name ${STACK_NAME}-${ENVIRONMENT} \
    --region ${REGION} 2>&1 || true

  # Handle "No updates are to be performed" error
  if [ $? -ne 0 ]; then
    STACK_STATUS=$(aws cloudformation describe-stacks \
      --stack-name ${STACK_NAME}-${ENVIRONMENT} \
      --region ${REGION} \
      --query 'Stacks[0].StackStatus' \
      --output text)

    if [ "$STACK_STATUS" == "UPDATE_COMPLETE" ]; then
      echo -e "${YELLOW}No changes detected. Stack is already up to date.${NC}"
    else
      echo -e "${RED}✗ Stack update failed with status: ${STACK_STATUS}${NC}"
      exit 1
    fi
  fi
fi

# Get stack outputs
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}S3 Bucket Names:${NC}"

aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME}-${ENVIRONMENT} \
  --region ${REGION} \
  --query 'Stacks[0].Outputs[?OutputKey!=`AgentCorpusAccessPolicyArn`].[OutputKey,OutputValue]' \
  --output table

echo ""
echo -e "${YELLOW}IAM Policy ARN:${NC}"
aws cloudformation describe-stacks \
  --stack-name ${STACK_NAME}-${ENVIRONMENT} \
  --region ${REGION} \
  --query 'Stacks[0].Outputs[?OutputKey==`AgentCorpusAccessPolicyArn`].OutputValue' \
  --output text

echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "1. Attach the IAM policy to your Lambda execution roles"
echo "2. Upload agent corpus documents to the respective buckets"
echo "3. Update Lambda environment variables with bucket names"
echo ""
echo -e "${YELLOW}Example corpus upload:${NC}"
echo "aws s3 cp ./documents/vera/ s3://socratiq-vera-corpus-${ENVIRONMENT}/ --recursive"
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
