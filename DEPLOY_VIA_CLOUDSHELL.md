# 🚀 Deploy SocratIQ via AWS CloudShell

**Why CloudShell?** Your local machine is out of disk space. CloudShell has its own storage and all AWS tools pre-installed!

---

## Step 1: Open AWS CloudShell

1. Go to **AWS Console**: https://console.aws.amazon.com
2. Sign in to your account (Account ID: **797455229240**)
3. Click the **CloudShell icon** (terminal icon) in the top navigation bar (next to the search bar)
4. Wait for CloudShell to initialize (~30 seconds)

---

## Step 2: Upload Your Code to CloudShell

You have **two options** to get your code into CloudShell:

### **Option A: Upload via CloudShell UI** (Easiest)

1. In CloudShell, click **Actions** → **Upload file**
2. Create a zip file of your project first on your local machine:
   - Right-click the `SocratIQAgents` folder
   - Send to → Compressed (zipped) folder
3. Upload `SocratIQAgents.zip` to CloudShell
4. In CloudShell, run:
   ```bash
   unzip SocratIQAgents.zip
   cd SocratIQAgents
   ```

### **Option B: Use Git** (If pushed to GitHub/GitLab)

If you've pushed your code to a Git repository:

```bash
git clone <your-repo-url>
cd SocratIQAgents
```

---

## Step 3: Run the Deployment Script

Once your code is in CloudShell, run:

```bash
cd infrastructure/lambda
chmod +x deploy-agents.sh
./deploy-agents.sh
```

**What happens:**
- Installs npm dependencies
- Compiles TypeScript → JavaScript
- Packages all 5 Lambda functions
- Uploads to S3
- Deploys CloudFormation stack
- Shows Lambda ARNs

**Time:** ~15 minutes

---

## Step 4: Monitor Deployment

The script will show progress:

```
================================================
SocratIQ Multi-Agent System Deployment
================================================

Step 1: Building shared utilities...
  ✓ Shared utilities built

Step 2: Packaging shared layer...
  ✓ Shared layer packaged

Step 3: Building VERA agent...
  ✓ VERA agent packaged

...

Step 10: Deploying CloudFormation stack...
  Creating new stack...
  Waiting for stack creation to complete...
  ✓ Stack created successfully

================================================
✓ Deployment Complete!
================================================
```

---

## Step 5: Test Your Deployment

After deployment completes, test VERA agent:

```bash
aws lambda invoke \
  --function-name SocratIQ-VERA-Agent-prod \
  --payload '{"query":"What is the best enrollment strategy for Phase 3 trials?"}' \
  response.json

cat response.json | jq .
```

Test Sophie orchestrator:

```bash
aws lambda invoke \
  --function-name SocratIQ-Sophie-Orchestrator-prod \
  --payload '{"message":"Should I pursue CRADA with NIH for my cancer immunotherapy?"}' \
  response.json

cat response.json | jq .
```

---

## Troubleshooting

### **If CloudShell times out (after 20 min inactivity)**
- Just reopen it and continue where you left off
- Your files persist between sessions

### **If you need more storage**
- CloudShell has 1GB persistent storage
- Our deployment needs ~500MB
- If needed, clean up: `npm cache clean --force`

### **If deployment fails**
- Check CloudWatch Logs: `/aws/lambda/SocratIQ-*`
- Run with verbose output: `bash -x deploy-agents.sh`
- Check CloudFormation console for error details

---

## Alternative: Quick Deploy Commands

If you just want to deploy without the full script, here are the essential commands:

```bash
# 1. Navigate to project
cd ~/SocratIQAgents

# 2. Build shared utilities
cd lambda/shared
npm install
npm run build
cd ../..

# 3. Create S3 bucket (if doesn't exist)
aws s3 mb s3://socratiq-lambda-code-prod --region us-east-1 || true

# 4. Package and upload (we'll use inline deployment instead of full build)
cd infrastructure/lambda

# 5. Deploy CloudFormation
aws cloudformation create-stack \
  --stack-name socratiq-agent-lambdas-prod \
  --template-body file://agent-lambdas.yaml \
  --parameters ParameterKey=Environment,ParameterValue=prod \
  --capabilities CAPABILITY_NAMED_IAM \
  --region us-east-1

# 6. Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name socratiq-agent-lambdas-prod \
  --region us-east-1

# 7. Get outputs
aws cloudformation describe-stacks \
  --stack-name socratiq-agent-lambdas-prod \
  --query 'Stacks[0].Outputs' \
  --output table
```

---

## Next Steps After Deployment

1. ✅ Test all 5 Lambda functions
2. ✅ Check CloudWatch Logs
3. ✅ Update API Gateway (if needed)
4. ✅ Test with real pharmaceutical queries
5. ✅ Monitor costs in AWS Cost Explorer

---

**Ready to deploy?** Open AWS CloudShell and let's go! 🚀
