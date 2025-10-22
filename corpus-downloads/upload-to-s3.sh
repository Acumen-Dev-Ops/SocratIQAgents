#!/bin/bash

# SocratIQ Agent Corpus - S3 Upload Script
# This script uploads downloaded corpus documents to respective S3 buckets

set -e  # Exit on error

# Configuration
REGION="us-east-1"
PROFILE="${AWS_PROFILE:-default}"
DRY_RUN="${1:-false}"  # Set to 'true' for dry run (no actual upload)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SocratIQ Corpus Upload to S3${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Region: ${YELLOW}${REGION}${NC}"
echo -e "AWS Profile: ${YELLOW}${PROFILE}${NC}"
echo -e "Dry Run: ${YELLOW}${DRY_RUN}${NC}"
echo ""

# Function to upload agent corpus
upload_agent_corpus() {
    local AGENT=$1
    local BUCKET_NAME="socratiq-${AGENT,,}-corpus-prod"  # Convert to lowercase
    local SOURCE_DIR="corpus-downloads/${AGENT,,}"

    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Uploading ${AGENT} Corpus${NC}"
    echo -e "${BLUE}========================================${NC}"

    # Check if source directory exists
    if [ ! -d "$SOURCE_DIR" ]; then
        echo -e "${RED}✗ Source directory not found: $SOURCE_DIR${NC}"
        echo -e "${YELLOW}  Skipping $AGENT...${NC}"
        return 1
    fi

    # Count files to upload
    FILE_COUNT=$(find "$SOURCE_DIR" -type f | wc -l)

    if [ $FILE_COUNT -eq 0 ]; then
        echo -e "${YELLOW}⚠ No files found in $SOURCE_DIR${NC}"
        echo -e "${YELLOW}  Skipping $AGENT...${NC}"
        return 0
    fi

    echo -e "${YELLOW}Found $FILE_COUNT files to upload${NC}"
    echo ""

    # Check if bucket exists
    echo -e "${YELLOW}Checking if bucket exists: $BUCKET_NAME${NC}"
    if ! aws s3 ls "s3://$BUCKET_NAME" --region $REGION --profile $PROFILE > /dev/null 2>&1; then
        echo -e "${RED}✗ Bucket does not exist: $BUCKET_NAME${NC}"
        echo -e "${YELLOW}  Please deploy S3 buckets first using infrastructure/s3/deploy-buckets.sh${NC}"
        return 1
    fi
    echo -e "${GREEN}✓ Bucket exists${NC}"
    echo ""

    # Perform upload
    if [ "$DRY_RUN" = "true" ]; then
        echo -e "${YELLOW}DRY RUN: Would upload files from $SOURCE_DIR to s3://$BUCKET_NAME/${NC}"
        aws s3 sync "$SOURCE_DIR/" "s3://$BUCKET_NAME/" \
            --region $REGION \
            --profile $PROFILE \
            --dryrun
    else
        echo -e "${YELLOW}Uploading files to s3://$BUCKET_NAME/${NC}"
        aws s3 sync "$SOURCE_DIR/" "s3://$BUCKET_NAME/" \
            --region $REGION \
            --profile $PROFILE \
            --metadata "upload-date=$(date -u +%Y-%m-%dT%H:%M:%SZ),version=1.0.0"

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Upload complete for $AGENT${NC}"
        else
            echo -e "${RED}✗ Upload failed for $AGENT${NC}"
            return 1
        fi
    fi

    echo ""
}

# Upload all agent corpora
echo -e "${BLUE}Starting corpus uploads...${NC}"
echo ""

AGENTS=("VERA" "FINN" "NORA" "CLIA" "Sophie")
UPLOAD_SUCCESS=0
UPLOAD_FAILED=0
UPLOAD_SKIPPED=0

for AGENT in "${AGENTS[@]}"; do
    upload_agent_corpus "$AGENT"
    EXIT_CODE=$?

    if [ $EXIT_CODE -eq 0 ]; then
        UPLOAD_SUCCESS=$((UPLOAD_SUCCESS + 1))
    elif [ $EXIT_CODE -eq 1 ]; then
        UPLOAD_SKIPPED=$((UPLOAD_SKIPPED + 1))
    else
        UPLOAD_FAILED=$((UPLOAD_FAILED + 1))
    fi
done

# Summary
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Upload Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Successful: $UPLOAD_SUCCESS${NC}"
echo -e "${YELLOW}Skipped: $UPLOAD_SKIPPED${NC}"
echo -e "${RED}Failed: $UPLOAD_FAILED${NC}"
echo ""

if [ "$DRY_RUN" = "true" ]; then
    echo -e "${YELLOW}This was a DRY RUN - no files were actually uploaded.${NC}"
    echo -e "${YELLOW}Run without 'true' argument to perform actual upload:${NC}"
    echo -e "${YELLOW}  ./upload-to-s3.sh${NC}"
    echo ""
fi

# List uploaded files (if not dry run)
if [ "$DRY_RUN" != "true" ] && [ $UPLOAD_SUCCESS -gt 0 ]; then
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Uploaded Files by Agent${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    for AGENT in "${AGENTS[@]}"; do
        BUCKET_NAME="socratiq-${AGENT,,}-corpus-prod"

        if aws s3 ls "s3://$BUCKET_NAME" --region $REGION --profile $PROFILE > /dev/null 2>&1; then
            echo -e "${YELLOW}${AGENT} Corpus (s3://$BUCKET_NAME):${NC}"
            aws s3 ls "s3://$BUCKET_NAME" --recursive --region $REGION --profile $PROFILE --human-readable
            echo ""
        fi
    done
fi

# Next steps
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Next Steps${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "1. Verify uploads in AWS S3 Console"
echo "2. Update Lambda environment variables with bucket names"
echo "3. Run Transform™ pipeline for entity extraction"
echo "4. Generate embeddings for semantic search"
echo "5. Test agent queries against corpus"
echo ""
echo -e "${BLUE}To update Lambda environment variables:${NC}"
echo ""
echo "aws lambda update-function-configuration \\"
echo "  --function-name SocratIQ-AskSophie \\"
echo "  --region us-east-1 \\"
echo "  --environment Variables=\"{ \\"
echo "    VERA_CORPUS_BUCKET=socratiq-vera-corpus-prod, \\"
echo "    FINN_CORPUS_BUCKET=socratiq-finn-corpus-prod, \\"
echo "    NORA_CORPUS_BUCKET=socratiq-nora-corpus-prod, \\"
echo "    CLIA_CORPUS_BUCKET=socratiq-clia-corpus-prod, \\"
echo "    SOPHIE_CORPUS_BUCKET=socratiq-sophie-corpus-prod, \\"
echo "    ENABLE_CORPUS_RETRIEVAL=true \\"
echo "  }\""
echo ""
echo -e "${GREEN}Upload complete!${NC}"
