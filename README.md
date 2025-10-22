# SocratIQ Agent Framework

**Version**: 1.0.0
**Created**: October 22, 2025
**Status**: Framework Ready - Awaiting Corpus Population
**Owner**: Acumen Analytics Product Team

## Overview

This repository contains the complete agent framework for the SocratIQ Platform, including detailed skills documentation and S3 corpus infrastructure for all pharmaceutical intelligence agents:

- **VERA** - Product & Clinical Intelligence
- **FINN** - Financial & Investment Intelligence
- **NORA** - Legal, Regulatory & IP Intelligence
- **CLIA** - Clinical Trials & Market Intelligence
- **Sophie** - Strategic Orchestration Engine

## Repository Structure

```
SocratIQAgents/
├── agents/                              # Agent skills and capabilities
│   ├── VERA/
│   │   └── skills.md                   # VERA agent skills documentation
│   ├── FINN/
│   │   └── skills.md                   # FINN agent skills documentation
│   ├── NORA/
│   │   └── skills.md                   # NORA agent skills documentation
│   ├── CLIA/
│   │   └── skills.md                   # CLIA agent skills documentation
│   └── Sophie/
│       └── skills.md                   # Sophie orchestration documentation
├── infrastructure/
│   └── s3/
│       ├── bucket-configuration.yaml   # CloudFormation template for S3 buckets
│       └── deploy-buckets.sh          # Deployment script
├── socratiq_prd_oct_9_2025.md         # Product Requirements Document
├── CURRENT_ARCHITECTURE_STATE.md       # Production architecture documentation
└── README.md                           # This file
```

## Agent Overview

### VERA - Product & Clinical Intelligence

**Domain**: Product optimization, clinical trial design, and manufacturing strategy

**Sub-Agents**:
- VERA-Product: Product optimization, indication selection, 505(b)(2) pathways
- VERA-Clinical: Trial design, endpoint selection, regulatory alignment
- VERA-Biomarker: Patient stratification, companion diagnostics
- VERA-CMC: Manufacturing, supply chain, scale-up
- VERA-Strategic: Partnerships, academic collaborations, KOLs
- VERA-Development: Development partnerships, licensing, federal technology acceleration

**S3 Bucket**: `socratiq-vera-corpus-prod`

**Key Capabilities**:
- Product development optimization
- Clinical trial protocol design
- Biomarker strategy and validation
- CMC strategy and manufacturing scale-up
- Strategic partnership identification
- Federal technology acceleration (coordinates with NORA-FedScout)

**Documentation**: [agents/VERA/skills.md](agents/VERA/skills.md)

---

### FINN - Financial & Investment Intelligence

**Domain**: Financial modeling, budget optimization, pricing strategy, and exit planning

**Sub-Agents**:
- FINN-Budget: Budget optimization, cash runway analysis
- FINN-Pricing: Pricing strategy, market access, reimbursement
- FINN-Exit: Exit planning, strategic buyer identification, valuation
- FINN-Partnerships: Commercial partnerships, licensing deals
- FINN-Risk: Risk assessment, portfolio optimization, scenario analysis
- FINN-ROI: Return on investment analysis, project prioritization

**S3 Bucket**: `socratiq-finn-corpus-prod`

**Key Capabilities**:
- Cash runway optimization and forecasting
- Value-based pricing strategy
- Exit timing and valuation enhancement
- Partnership deal structure optimization
- Financial risk quantification
- ROI calculation and capital allocation

**Documentation**: [agents/FINN/skills.md](agents/FINN/skills.md)

---

### NORA - Legal, Regulatory & IP Intelligence

**Domain**: Regulatory pathway optimization, IP strategy, legal compliance, and federal technology integration

**Sub-Agents**:
- NORA-Regulatory: FDA pathways, international regulatory strategy
- NORA-IP: Patent strategy, freedom-to-operate, competitive IP
- NORA-Legal: Contract analysis, partnership structuring
- NORA-FedScout: Federal technology integration, CRADA, SBIR/STTR (PRIMARY OWNER)
- NORA-Compliance: 21 CFR Part 11, GDPR, audit trails
- NORA-Intelligence: Competitive intelligence, regulatory intelligence

**S3 Bucket**: `socratiq-nora-corpus-prod`

**Key Capabilities**:
- FDA pathway optimization (505(b)(2), NDA, BLA)
- Patent landscape analysis and FTO assessments
- Federal technology integration (CRADA, SBIR/STTR)
- Regulatory compliance and quality systems
- Competitive regulatory intelligence
- Legal document analysis and contract structuring

**Documentation**: [agents/NORA/skills.md](agents/NORA/skills.md)

---

### CLIA - Clinical Trials & Market Intelligence

**Domain**: Market analysis, clinical trial intelligence, competitive landscape, and operational excellence

**Sub-Agents**:
- CLIA-Market: Market analysis, commercial opportunity assessment
- CLIA-Clinical: Clinical trial intelligence, enrollment, site selection
- CLIA-Timeline: Development timeline optimization, milestone planning
- CLIA-Competitive: Competitive intelligence, threat analysis
- CLIA-Operations: Clinical operations excellence, vendor management

**S3 Bucket**: `socratiq-clia-corpus-prod`

**Key Capabilities**:
- Market size and segmentation (TAM/SAM/SOM)
- Clinical trial feasibility and enrollment forecasting
- Development timeline prediction
- Competitive threat assessment
- Clinical operations optimization
- Strategic positioning recommendations

**Documentation**: [agents/CLIA/skills.md](agents/CLIA/skills.md)

---

### Sophie - Strategic Orchestration Engine

**Domain**: Multi-agent coordination, conflict resolution, and tri-paradigm reasoning

**Core Components**:
- **SophieLogic™**: Tri-paradigm reasoning (mechanistic + deterministic + probabilistic)
- **SophieTrust™**: Governance and safety framework
- **SophieModels™**: AI cognitive toolkit

**S3 Bucket**: `socratiq-sophie-corpus-prod`

**Key Capabilities**:
- Cross-agent orchestration and coordination
- Conflict resolution using Multi-Criteria Decision Analysis (MCDA)
- Tri-paradigm AI reasoning synthesis
- TxP Intelligence Framework™ (12-profile optimization)
- Federal technology coordination (FedScout cross-domain synthesis)
- Strategic decision synthesis with uncertainty quantification

**Documentation**: [agents/Sophie/skills.md](agents/Sophie/skills.md)

---

## Infrastructure Deployment

### S3 Bucket Architecture

Each agent has a dedicated S3 bucket for storing its knowledge corpus:

| Agent | Bucket Name | Purpose |
|-------|-------------|---------|
| VERA | `socratiq-vera-corpus-prod` | Product development, clinical trials, manufacturing docs |
| FINN | `socratiq-finn-corpus-prod` | Financial models, budgets, pricing analyses, deal structures |
| NORA | `socratiq-nora-corpus-prod` | Regulatory documents, patents, legal agreements, federal tech |
| CLIA | `socratiq-clia-corpus-prod` | Market research, clinical trial data, competitive intelligence |
| Sophie | `socratiq-sophie-corpus-prod` | Orchestration logs, decision synthesis, strategic frameworks |

### Bucket Features

- **Encryption**: AES-256 server-side encryption at rest
- **Versioning**: Enabled for all buckets
- **Lifecycle**: Automatic transition to STANDARD_IA after 90 days
- **Access Control**: Private buckets with IAM policy-based access
- **Security**: Public access blocked, all access logged

### Deployment Instructions

#### Prerequisites

- AWS CLI configured with appropriate credentials
- Permissions to create S3 buckets and IAM policies
- Access to `us-east-1` region

#### Deploy S3 Buckets

```bash
# Navigate to infrastructure directory
cd infrastructure/s3

# Make deployment script executable
chmod +x deploy-buckets.sh

# Deploy to production
./deploy-buckets.sh prod

# Deploy to development (optional)
./deploy-buckets.sh dev
```

The script will:
1. Validate the CloudFormation template
2. Create or update the stack
3. Create 5 S3 buckets (one per agent)
4. Create IAM policy for Lambda access
5. Output bucket names and policy ARN

#### Manual Deployment (AWS Console)

1. Navigate to AWS CloudFormation Console
2. Create new stack
3. Upload `infrastructure/s3/bucket-configuration.yaml`
4. Set parameters:
   - Environment: `prod`
   - EnableVersioning: `true`
   - EnableEncryption: `true`
5. Create stack

#### Attach IAM Policy to Lambda Roles

After deployment, attach the created IAM policy to your Lambda execution roles:

```bash
# Get policy ARN from stack outputs
POLICY_ARN=$(aws cloudformation describe-stacks \
  --stack-name socratiq-agent-corpus-prod \
  --query 'Stacks[0].Outputs[?OutputKey==`AgentCorpusAccessPolicyArn`].OutputValue' \
  --output text)

# Attach to Lambda role (replace with your role name)
aws iam attach-role-policy \
  --role-name SophieLambdaRole \
  --policy-arn $POLICY_ARN
```

---

## Corpus Population

### Recommended Corpus Structure

Each agent bucket should follow this folder structure:

```
socratiq-{agent}-corpus-prod/
├── documents/              # Primary source documents
│   ├── fda_guidance/
│   ├── clinical_trials/
│   ├── patents/
│   └── financial_reports/
├── processed/              # Extracted and processed data
│   ├── entities/
│   ├── embeddings/
│   └── summaries/
├── benchmarks/             # Industry benchmarks and standards
└── metadata/               # Document metadata and indices
```

### Upload Documents

#### Using AWS CLI

```bash
# Upload VERA product development documents
aws s3 cp ./local/vera-docs/ s3://socratiq-vera-corpus-prod/documents/ --recursive

# Upload FINN financial models
aws s3 cp ./local/finn-models/ s3://socratiq-finn-corpus-prod/documents/ --recursive

# Upload NORA regulatory documents
aws s3 cp ./local/nora-regulatory/ s3://socratiq-nora-corpus-prod/documents/ --recursive

# Upload CLIA market research
aws s3 cp ./local/clia-market/ s3://socratiq-clia-corpus-prod/documents/ --recursive

# Upload Sophie orchestration logs
aws s3 cp ./local/sophie-logs/ s3://socratiq-sophie-corpus-prod/documents/ --recursive
```

#### Using AWS Console

1. Navigate to S3 Console
2. Select the agent bucket
3. Click "Upload"
4. Add files or folders
5. Set metadata tags (agent, document_type, date, etc.)
6. Upload

### Document Processing Pipeline

Documents uploaded to agent corpus buckets should be processed through the SocratIQ Transform™ pipeline:

1. **Text Extraction**: Extract text from PDFs, Word docs, etc.
2. **Entity Extraction**: Use AWS Bedrock Claude 3.5 Sonnet for NER
3. **Embedding Generation**: Create vector embeddings for semantic search
4. **Metadata Tagging**: Tag with pharmaceutical domain entities
5. **Storage**: Store in PostgreSQL (entities) and S3 (processed documents)
6. **Audit Trail**: Log all processing in Trace™ for compliance

---

## Integration with Production Architecture

### Current Production Environment

The agent framework integrates with the existing SocratIQ production architecture:

- **Frontend**: AWS Amplify (`https://dcy0k0y50q67k.amplifyapp.com`)
- **Backend**: AWS Lambda + API Gateway (`https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod`)
- **Database**: AWS RDS PostgreSQL (`socratiq-prod-db.cdg2livjhuop.us-east-1.rds.amazonaws.com`)
- **Authentication**: AWS Cognito (User Pool: `us-east-1_PczohxQao`)
- **AI Services**: AWS Bedrock Claude 3.5 Sonnet 4.5

### Lambda Function Integration

Agent corpus buckets will be accessed by existing Lambda functions:

| Lambda Function | Agent Access | Purpose |
|-----------------|--------------|---------|
| `SocratIQ-AskSophie` | All agents | Multi-agent orchestration |
| `SocratIQ-GetTppScore` | VERA, FINN, CLIA | TxP profile scoring |
| `SocratIQ-GetAssets` | All agents | Asset analysis with agent insights |

### Environment Variables

Update Lambda functions with corpus bucket names:

```bash
# Update Lambda environment variables
aws lambda update-function-configuration \
  --function-name SocratIQ-AskSophie \
  --environment Variables="{
    VERA_CORPUS_BUCKET=socratiq-vera-corpus-prod,
    FINN_CORPUS_BUCKET=socratiq-finn-corpus-prod,
    NORA_CORPUS_BUCKET=socratiq-nora-corpus-prod,
    CLIA_CORPUS_BUCKET=socratiq-clia-corpus-prod,
    SOPHIE_CORPUS_BUCKET=socratiq-sophie-corpus-prod
  }"
```

---

## Development Workflow

### Local Development with Agent Framework

1. **Start Local Development Environment**:
   ```bash
   # Connect to VPN (required for database access)
   # Start React dev server (port 3000) and Express backend (port 3001)
   npm run dev:full
   ```

2. **Test Agent Integration**:
   ```bash
   # Test Sophie orchestration with agents
   npm run test:sophie

   # Test individual agents
   npm run test:agents

   # Test TxP scoring with agent inputs
   npm run test:txp
   ```

3. **Access Corpus Documents Locally**:
   ```bash
   # Download corpus documents for local development
   aws s3 sync s3://socratiq-vera-corpus-prod/documents/ ./local-corpus/vera/
   aws s3 sync s3://socratiq-finn-corpus-prod/documents/ ./local-corpus/finn/
   # etc.
   ```

### Agent Development Cycle

1. **Update Agent Skills**: Edit `agents/{AGENT}/skills.md`
2. **Update Agent Implementation**: Modify `server/services/{agent}Agent.ts`
3. **Test Locally**: Use Express backend on port 3001
4. **Deploy to Lambda**: `sam build && sam deploy`
5. **Upload Corpus Documents**: Use AWS CLI or Console
6. **Verify Integration**: Test via production frontend

---

## FedScout Cross-Domain Coordination

### Architecture Decision

**FedScout operates as a dual-domain capability**:
- **Primary Owner**: NORA-FedScout (legal/regulatory expertise)
- **Strategic Coordinator**: VERA-Development (product acceleration analysis)
- **Financial Analyst**: FINN-ROI (acceleration value quantification)
- **Synthesis**: Sophie combines legal feasibility + strategic product value + financial impact

### Example Coordination Flow

```typescript
async function analyzeFederalOpportunity(asset: Asset): Promise<FedScoutAnalysis> {
  // NORA: Legal/regulatory feasibility
  const legalAnalysis = await NORA_FedScout.assessCRADA(asset);

  // VERA: Product development acceleration potential
  const productImpact = await VERA_Development.evaluateFederalTech(
    asset,
    legalAnalysis.technologies
  );

  // FINN: Financial impact of acceleration
  const financialValue = await FINN_ROI.calculateAccelerationValue(
    productImpact.timelineSavings
  );

  // Sophie: Tri-paradigm synthesis
  return {
    recommendation: "Pursue CRADA with NIH NCATS",
    rationale: "18-month CMC acceleration worth $3M NPV",
    legalFeasibility: legalAnalysis,
    productAcceleration: productImpact,
    financialImpact: financialValue,
    sophieConfidence: "High (82%)"
  };
}
```

---

## TxP Intelligence Framework™

### 12-Profile Optimization

Sophie coordinates all agents to generate comprehensive Target Product Profile (TxP) assessments:

1. **Product Profile (PxP)** - VERA primary
2. **Patient Profile (PxP)** - VERA primary
3. **Price Profile (PrxP)** - FINN primary
4. **Market Profile (MxP)** - CLIA primary
5. **Partner Profile (PaP)** - VERA + FINN coordination
6. **Budget Profile (BxP)** - FINN primary
7. **Regulatory Profile (RxP)** - NORA primary
8. **Investor Exit Profile (ExP)** - FINN primary
9. **Target Risk Profile (TRxP)** - FINN + NORA coordination
10. **Target Endpoint Profile (TExP)** - VERA primary
11. **Target Shots on Goal Profile (TSxP)** - All agents synthesis
12. **Target Phase Profile (TPxP)** - VERA + CLIA coordination

### Agent Contribution by Profile

Each TxP profile is scored 0-10 based on agent analyses:

```typescript
const AgentExpertiseMap = {
  product: { primary: "VERA", secondary: ["CLIA"], weight: 0.8 },
  patient: { primary: "VERA", secondary: [], weight: 0.9 },
  price: { primary: "FINN", secondary: ["CLIA"], weight: 0.7 },
  market: { primary: "CLIA", secondary: ["FINN"], weight: 0.8 },
  partner: { primary: "VERA", secondary: ["FINN"], weight: 0.6 },
  budget: { primary: "FINN", secondary: [], weight: 1.0 },
  regulatory: { primary: "NORA", secondary: ["VERA"], weight: 0.9 },
  exit: { primary: "FINN", secondary: ["CLIA", "NORA"], weight: 0.7 }
};
```

---

## Next Steps

### Immediate Actions (Week 1)

1. **Deploy S3 Buckets**:
   ```bash
   cd infrastructure/s3
   ./deploy-buckets.sh prod
   ```

2. **Attach IAM Policy to Lambda Roles**:
   ```bash
   aws iam attach-role-policy \
     --role-name SophieLambdaRole \
     --policy-arn <policy-arn-from-output>
   ```

3. **Upload Initial Corpus Documents**:
   - Gather pharmaceutical documents for each agent
   - Organize into recommended folder structure
   - Upload to respective S3 buckets

4. **Update Lambda Environment Variables**:
   ```bash
   aws lambda update-function-configuration \
     --function-name SocratIQ-AskSophie \
     --environment Variables="{...}"
   ```

### Short-Term (Weeks 2-4)

1. **Implement Agent Services**:
   - Create `server/services/veraAgent.ts`
   - Create `server/services/finnAgent.ts`
   - Create `server/services/noraAgent.ts`
   - Create `server/services/cliaAgent.ts`

2. **Integrate Sophie Orchestration**:
   - Update `server/services/sophieOrchestrationService.ts`
   - Implement multi-agent coordination
   - Add conflict resolution logic

3. **Test End-to-End Flow**:
   - User query → Sophie → Agent selection → Parallel execution → Synthesis
   - Verify TxP profile scoring with agent inputs
   - Test FedScout cross-domain coordination

### Medium-Term (Months 2-3)

1. **Enhance Agent Intelligence**:
   - Fine-tune agent prompts with pharmaceutical domain expertise
   - Implement agent-specific scoring algorithms
   - Add industry benchmark comparisons

2. **Build Agent Analytics**:
   - Track agent usage and performance
   - Measure recommendation adoption rates
   - Optimize agent coordination patterns

3. **Expand Corpus**:
   - Continuously add pharmaceutical documents
   - Process historical assets for training
   - Build domain-specific embeddings

---

## Support & Resources

### Documentation

- **Product Requirements**: [socratiq_prd_oct_9_2025.md](socratiq_prd_oct_9_2025.md)
- **Production Architecture**: [CURRENT_ARCHITECTURE_STATE.md](CURRENT_ARCHITECTURE_STATE.md)
- **Agent Skills**:
  - [VERA Skills](agents/VERA/skills.md)
  - [FINN Skills](agents/FINN/skills.md)
  - [NORA Skills](agents/NORA/skills.md)
  - [CLIA Skills](agents/CLIA/skills.md)
  - [Sophie Skills](agents/Sophie/skills.md)

### AWS Resources

| Resource | URL |
|----------|-----|
| **S3 Console** | https://console.aws.amazon.com/s3/ |
| **Lambda Console** | https://console.aws.amazon.com/lambda/ |
| **CloudFormation Console** | https://console.aws.amazon.com/cloudformation/ |
| **IAM Console** | https://console.aws.amazon.com/iam/ |

### Useful Commands

```bash
# List all agent corpus buckets
aws s3 ls | grep socratiq.*corpus

# Check bucket contents
aws s3 ls s3://socratiq-vera-corpus-prod/ --recursive

# Sync local directory with S3 bucket
aws s3 sync ./local/vera-docs/ s3://socratiq-vera-corpus-prod/documents/

# Download corpus for local development
aws s3 sync s3://socratiq-vera-corpus-prod/documents/ ./local-corpus/vera/

# View CloudFormation stack status
aws cloudformation describe-stacks --stack-name socratiq-agent-corpus-prod

# Get Lambda function configuration
aws lambda get-function-configuration --function-name SocratIQ-AskSophie
```

---

## Change Log

### Version 1.0.0 (October 22, 2025)

**Initial Release**:
- ✅ Created agent framework structure
- ✅ Documented skills for all 5 agents (VERA, FINN, NORA, CLIA, Sophie)
- ✅ Created S3 bucket CloudFormation template
- ✅ Created deployment script for S3 buckets
- ✅ Documented integration with production architecture
- ✅ Added FedScout cross-domain coordination documentation
- ✅ Created comprehensive README

**Files Created**:
- `agents/VERA/skills.md`
- `agents/FINN/skills.md`
- `agents/NORA/skills.md`
- `agents/CLIA/skills.md`
- `agents/Sophie/skills.md`
- `infrastructure/s3/bucket-configuration.yaml`
- `infrastructure/s3/deploy-buckets.sh`
- `README.md`

---

## Contact & Support

**Project Owner**: Acumen Analytics Product Team
**Email**: product@acumenanalytics.com
**Status**: Framework Ready - Awaiting Corpus Population

For technical issues or questions:
1. Review relevant agent skills documentation
2. Check [CURRENT_ARCHITECTURE_STATE.md](CURRENT_ARCHITECTURE_STATE.md) for production architecture
3. Contact development team via Slack/Discord

---

**Last Updated**: October 22, 2025
**Next Review**: November 22, 2025
**Version**: 1.0.0
