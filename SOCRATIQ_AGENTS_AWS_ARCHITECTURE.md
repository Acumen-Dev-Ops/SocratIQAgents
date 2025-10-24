# SocratIQ Agents - AWS Architecture Documentation

**Document Created**: October 24, 2025
**Repository**: SocratIQAgents
**Purpose**: Complete AWS component inventory for multi-agent pharmaceutical intelligence system
**Status**: Development Ready - Awaiting Production Deployment

---

## 🎯 EXECUTIVE SUMMARY

This repository contains the complete multi-agent AI architecture for SocratIQ's pharmaceutical intelligence platform. The system consists of 5 specialized AI agents (VERA, FINN, NORA, CLIA, Sophie) deployed as AWS Lambda functions, backed by S3 corpus storage, and orchestrated through Sophie's strategic coordination engine.

### Agent Overview

| Agent | Full Name | Primary Domain | Lambda Function | S3 Corpus Bucket |
|-------|-----------|----------------|-----------------|------------------|
| **VERA** | Product & Clinical Intelligence | Product optimization, clinical trials, CMC | `SocratIQ-VERA-Agent-prod` | `socratiq-vera-corpus-prod` |
| **FINN** | Financial & Investment Intelligence | Budget, pricing, exit strategy, ROI | `SocratIQ-FINN-Agent-prod` | `socratiq-finn-corpus-prod` |
| **NORA** | Legal, Regulatory & IP Intelligence | FDA pathways, patents, CRADA, compliance | `SocratIQ-NORA-Agent-prod` | `socratiq-nora-corpus-prod` |
| **CLIA** | Clinical Trials & Market Intelligence | Market analysis, competitive intel, operations | `SocratIQ-CLIA-Agent-prod` | `socratiq-clia-corpus-prod` |
| **Sophie** | Strategic Orchestration Engine | Multi-agent coordination, TxP synthesis | `SocratIQ-Sophie-Orchestrator-prod` | `socratiq-sophie-corpus-prod` |

---

## ☁️ AWS INFRASTRUCTURE COMPONENTS

### 1. Lambda Functions (5 Total)

#### Domain Agent Lambda Functions (4)

**Shared Configuration**:
- **Runtime**: Node.js 20.x
- **Memory**: 1024 MB
- **Timeout**: 180 seconds (3 minutes)
- **VPC**: Enabled (for RDS access)
  - Security Group: `sg-079019dddda2c3b3a`
  - Subnets: `subnet-077cc788ec4a6a7fe`, `subnet-08c8e7b914ab19438`
- **IAM Role**: `SocratIQ-DomainAgent-ExecutionRole-prod`
- **Layers**: `socratiq-agent-shared-prod`

**Individual Agents**:

1. **SocratIQ-VERA-Agent-prod**
   - **Description**: Product & Clinical Intelligence Agent
   - **Handler**: `index.handler`
   - **Code Package**: `agents/vera-agent.zip`
   - **Environment Variables**:
     ```
     AGENT_NAME: VERA
     VERA_CORPUS_BUCKET: socratiq-vera-corpus-prod
     BEDROCK_MODEL_ID: anthropic.claude-3-5-sonnet-20241022-v2:0
     REGION: us-east-1
     ENVIRONMENT: prod
     ```
   - **Sub-Agents**:
     - VERA-Product: Product optimization, 505(b)(2) pathways
     - VERA-Clinical: Trial design, endpoints
     - VERA-Biomarker: Patient stratification, companion diagnostics
     - VERA-CMC: Manufacturing, scale-up
     - VERA-Strategic: Partnerships, KOLs
     - VERA-Development: Federal technology acceleration (CRADA coordination)

2. **SocratIQ-FINN-Agent-prod**
   - **Description**: Financial & Investment Intelligence Agent
   - **Handler**: `index.handler`
   - **Code Package**: `agents/finn-agent.zip`
   - **Environment Variables**:
     ```
     AGENT_NAME: FINN
     FINN_CORPUS_BUCKET: socratiq-finn-corpus-prod
     BEDROCK_MODEL_ID: anthropic.claude-3-5-sonnet-20241022-v2:0
     REGION: us-east-1
     ENVIRONMENT: prod
     ```
   - **Sub-Agents**:
     - FINN-Budget: Cash runway, budget optimization
     - FINN-Pricing: Value-based pricing, reimbursement
     - FINN-Exit: Exit strategy, buyer identification, valuation
     - FINN-Partnerships: Deal structure, licensing
     - FINN-Risk: Portfolio risk, scenario analysis
     - FINN-ROI: Acceleration value quantification

3. **SocratIQ-NORA-Agent-prod**
   - **Description**: Legal, Regulatory & IP Intelligence Agent
   - **Handler**: `index.handler`
   - **Code Package**: `agents/nora-agent.zip`
   - **Environment Variables**:
     ```
     AGENT_NAME: NORA
     NORA_CORPUS_BUCKET: socratiq-nora-corpus-prod
     BEDROCK_MODEL_ID: anthropic.claude-3-5-sonnet-20241022-v2:0
     REGION: us-east-1
     ENVIRONMENT: prod
     ```
   - **Sub-Agents**:
     - NORA-Regulatory: FDA pathways, international regulatory
     - NORA-IP: Patent landscape, freedom-to-operate
     - NORA-Legal: Contract analysis, partnership structure
     - NORA-FedScout: CRADA, SBIR/STTR (PRIMARY OWNER)
     - NORA-Compliance: 21 CFR Part 11, GDPR
     - NORA-Intelligence: Competitive regulatory intelligence

4. **SocratIQ-CLIA-Agent-prod**
   - **Description**: Clinical Trials & Market Intelligence Agent
   - **Handler**: `index.handler`
   - **Code Package**: `agents/clia-agent.zip`
   - **Environment Variables**:
     ```
     AGENT_NAME: CLIA
     CLIA_CORPUS_BUCKET: socratiq-clia-corpus-prod
     BEDROCK_MODEL_ID: anthropic.claude-3-5-sonnet-20241022-v2:0
     REGION: us-east-1
     ENVIRONMENT: prod
     ```
   - **Sub-Agents**:
     - CLIA-Market: TAM/SAM/SOM analysis, market segmentation
     - CLIA-Clinical: Trial intelligence, enrollment forecasting
     - CLIA-Timeline: Development milestone prediction
     - CLIA-Competitive: Competitive threat analysis
     - CLIA-Operations: Clinical operations optimization

#### Sophie Orchestrator Lambda Function

5. **SocratIQ-Sophie-Orchestrator-prod**
   - **Description**: Strategic Orchestration Engine with Multi-Agent Coordination
   - **Runtime**: Node.js 20.x
   - **Handler**: `index.handler`
   - **Code Package**: `agents/sophie-orchestrator.zip`
   - **Memory**: 2048 MB (2x domain agents)
   - **Timeout**: 300 seconds (5 minutes)
   - **IAM Role**: `SocratIQ-Sophie-ExecutionRole-prod`
   - **Layers**: `socratiq-agent-shared-prod`
   - **VPC**: Enabled (same as domain agents)
   - **Environment Variables**:
     ```
     AGENT_NAME: Sophie
     VERA_LAMBDA_ARN: <VERA Lambda ARN>
     FINN_LAMBDA_ARN: <FINN Lambda ARN>
     NORA_LAMBDA_ARN: <NORA Lambda ARN>
     CLIA_LAMBDA_ARN: <CLIA Lambda ARN>
     SOPHIE_CORPUS_BUCKET: socratiq-sophie-corpus-prod
     BEDROCK_MODEL_ID: anthropic.claude-3-5-sonnet-20241022-v2:0
     DB_SECRET_ARN: arn:aws:secretsmanager:us-east-1:797455229240:secret:socratiq/db/credentials-4w7uQA
     REGION: us-east-1
     ENVIRONMENT: prod
     ```
   - **Core Capabilities**:
     - SophieLogic™: Tri-paradigm reasoning (mechanistic + deterministic + probabilistic)
     - SophieTrust™: Governance and safety framework
     - SophieModels™: AI cognitive toolkit
     - Multi-agent coordination and synthesis
     - Conflict resolution using MCDA
     - TxP Intelligence Framework™ (12-profile optimization)

### 2. Lambda Layer

**AgentSharedLayer** (`socratiq-agent-shared-prod`)
- **Description**: Shared utilities for all SocratIQ agents
- **Compatible Runtime**: Node.js 20.x
- **Package**: `layers/agent-shared-layer.zip`
- **Size**: ~9 MB
- **Contents**:
  - AWS SDK v3 clients (Bedrock, S3, Secrets Manager)
  - Bedrock client wrapper ([bedrock-client.ts](lambda/shared/bedrock-client.ts))
  - Corpus retrieval utilities ([corpus-retrieval.ts](lambda/shared/corpus-retrieval.ts))
  - Agent system prompts ([agent-prompts.ts](lambda/shared/agent-prompts.ts))
  - Shared types and utilities ([types.ts](lambda/shared/types.ts), [utils.ts](lambda/shared/utils.ts))
- **Shared Modules**:
  ```
  /nodejs/node_modules/
  ├── @aws-sdk/client-bedrock-runtime
  ├── @aws-sdk/client-s3
  ├── @aws-sdk/client-secrets-manager
  └── @smithy/* (dependencies)
  ```

### 3. S3 Buckets (5 Agent Corpus Buckets)

**Bucket Configuration** (applies to all 5 buckets):
- **Region**: us-east-1
- **Encryption**: AES-256 (server-side)
- **Versioning**: Enabled
- **Public Access**: Blocked (all settings)
- **Lifecycle Rules**:
  - Transition to STANDARD_IA: 90 days
  - Delete old versions: 365 days
- **IAM Policy**: Managed by `SocratIQ-AgentCorpusAccess-prod`

**Individual Buckets**:

1. **socratiq-vera-corpus-prod**
   - **Purpose**: Product development, clinical trials, manufacturing documents
   - **Expected Content**:
     - FDA guidance documents (product development)
     - Clinical trial protocols and results
     - CMC and manufacturing best practices
     - Biomarker validation studies
     - Partnership case studies
     - CRADA templates and federal technology documents

2. **socratiq-finn-corpus-prod**
   - **Purpose**: Financial models, budgets, pricing analyses, deal structures
   - **Expected Content**:
     - Budget templates and cash runway models
     - Pricing strategy frameworks (value-based, cost-plus)
     - Exit valuation methodologies
     - Partnership deal structures
     - Risk assessment models
     - ROI calculators and benchmarks

3. **socratiq-nora-corpus-prod**
   - **Purpose**: Regulatory documents, patents, legal agreements, federal tech
   - **Expected Content**:
     - FDA guidance documents (regulatory pathways)
     - Patent landscape analyses
     - Freedom-to-operate assessments
     - CRADA templates and examples
     - SBIR/STTR application guides
     - 21 CFR Part 11 compliance guides
     - Contract templates and deal structures

4. **socratiq-clia-corpus-prod**
   - **Purpose**: Market research, clinical trial data, competitive intelligence
   - **Expected Content**:
     - Market research reports (TAM/SAM/SOM)
     - Clinical trial enrollment benchmarks
     - Development timeline databases
     - Competitive landscape analyses
     - Clinical operations SOPs
     - Site selection methodologies

5. **socratiq-sophie-corpus-prod**
   - **Purpose**: Orchestration logs, decision synthesis, strategic frameworks
   - **Expected Content**:
     - Multi-agent coordination logs
     - TxP Intelligence Framework documentation
     - Conflict resolution case studies
     - Tri-paradigm reasoning examples
     - MCDA methodologies
     - Strategic decision templates

### 4. IAM Roles and Policies

#### Domain Agent Execution Role

**Role Name**: `SocratIQ-DomainAgent-ExecutionRole-prod`

**Managed Policies**:
- `AWSLambdaBasicExecutionRole` (CloudWatch Logs)
- `AWSLambdaVPCAccessExecutionRole` (VPC networking for RDS)

**Custom Policies**:

1. **BedrockAccess**:
   ```json
   {
     "Effect": "Allow",
     "Action": [
       "bedrock:InvokeModel",
       "bedrock:InvokeModelWithResponseStream"
     ],
     "Resource": [
       "arn:aws:bedrock:*::foundation-model/*",
       "arn:aws:bedrock:*:797455229240:inference-profile/*"
     ]
   }
   ```

2. **S3CorpusAccess**:
   ```json
   {
     "Effect": "Allow",
     "Action": [
       "s3:GetObject",
       "s3:ListBucket"
     ],
     "Resource": [
       "arn:aws:s3:::socratiq-vera-corpus-prod",
       "arn:aws:s3:::socratiq-vera-corpus-prod/*",
       "arn:aws:s3:::socratiq-finn-corpus-prod",
       "arn:aws:s3:::socratiq-finn-corpus-prod/*",
       "arn:aws:s3:::socratiq-nora-corpus-prod",
       "arn:aws:s3:::socratiq-nora-corpus-prod/*",
       "arn:aws:s3:::socratiq-clia-corpus-prod",
       "arn:aws:s3:::socratiq-clia-corpus-prod/*"
     ]
   }
   ```

#### Sophie Orchestrator Execution Role

**Role Name**: `SocratIQ-Sophie-ExecutionRole-prod`

**Managed Policies**:
- `AWSLambdaBasicExecutionRole`
- `AWSLambdaVPCAccessExecutionRole`

**Custom Policies**:

1. **InvokeAgentLambdas**:
   ```json
   {
     "Effect": "Allow",
     "Action": "lambda:InvokeFunction",
     "Resource": [
       "arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-VERA-Agent-prod",
       "arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-FINN-Agent-prod",
       "arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-NORA-Agent-prod",
       "arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-CLIA-Agent-prod"
     ]
   }
   ```

2. **BedrockAccess**: (same as domain agents)

3. **SecretsManagerAccess**:
   ```json
   {
     "Effect": "Allow",
     "Action": "secretsmanager:GetSecretValue",
     "Resource": "arn:aws:secretsmanager:us-east-1:797455229240:secret:socratiq/db/credentials-4w7uQA"
   }
   ```

4. **S3SophieCorpusAccess**:
   ```json
   {
     "Effect": "Allow",
     "Action": [
       "s3:GetObject",
       "s3:ListBucket"
     ],
     "Resource": [
       "arn:aws:s3:::socratiq-sophie-corpus-prod",
       "arn:aws:s3:::socratiq-sophie-corpus-prod/*"
     ]
   }
   ```

### 5. CloudFormation Stacks

#### Agent Lambda Stack

**Stack Name**: `socratiq-agent-lambdas-prod` (to be deployed)

**Template**: [infrastructure/lambda/agent-lambdas.yaml](infrastructure/lambda/agent-lambdas.yaml)

**Resources Created**:
- 5 Lambda functions (VERA, FINN, NORA, CLIA, Sophie)
- 2 IAM execution roles
- 1 Lambda layer (shared dependencies)
- 1 API Gateway integration permission

**Parameters**:
```yaml
Environment: prod
S3CodeBucket: socratiq-lambda-code-prod
BedrockModelId: anthropic.claude-3-5-sonnet-20241022-v2:0
DBSecretArn: arn:aws:secretsmanager:us-east-1:797455229240:secret:socratiq/db/credentials-4w7uQA
```

**Outputs**:
- Lambda function ARNs (5)
- IAM role ARNs (2)
- Lambda layer ARN (1)

#### Agent Corpus S3 Stack

**Stack Name**: `socratiq-agent-corpus-prod` (to be deployed)

**Template**: [infrastructure/s3/bucket-configuration.yaml](infrastructure/s3/bucket-configuration.yaml)

**Resources Created**:
- 5 S3 buckets (VERA, FINN, NORA, CLIA, Sophie)
- 1 IAM managed policy for corpus access

**Parameters**:
```yaml
Environment: prod
EnableVersioning: true
EnableEncryption: true
```

**Outputs**:
- S3 bucket names (5)
- S3 bucket ARNs (5)
- IAM policy ARN (1)

### 6. VPC Configuration

**Shared with Production SocratIQ App**:

| Component | ID | Purpose |
|-----------|-----|---------|
| **VPC** | `vpc-0596668685e114793` | Isolated network for Lambda/RDS |
| **Private Subnet 1** | `subnet-077cc788ec4a6a7fe` | Lambda execution (AZ 1) |
| **Private Subnet 2** | `subnet-08c8e7b914ab19438` | Lambda execution (AZ 2) |
| **Security Group** | `sg-079019dddda2c3b3a` | Lambda functions (allows RDS access) |
| **Database SG** | `sg-09fcd6239c92a1c6b` | RDS PostgreSQL (allows Lambda) |

### 7. AWS Bedrock Integration

**Model Used**: Claude 3.5 Sonnet (v2)
- **Model ID**: `anthropic.claude-3-5-sonnet-20241022-v2:0`
- **Provider**: Anthropic
- **Region**: us-east-1
- **Access**: Via AWS Bedrock Global Inference Profile
- **Invocation**: `bedrock-runtime:InvokeModel` API

**Configuration per Agent**:
- **Max Tokens**: 4,096 (domain agents), 8,192 (Sophie)
- **Temperature**: 0.1 (factual, low variance)
- **Top-P**: 0.9 (nucleus sampling)
- **System Prompts**: Specialized per agent/sub-agent

### 8. Secrets Manager

**Secret ARN**: `arn:aws:secretsmanager:us-east-1:797455229240:secret:socratiq/db/credentials-4w7uQA`

**Purpose**: Store RDS PostgreSQL credentials for Sophie orchestrator

**Contents**:
```json
{
  "username": "socratiqadmin",
  "password": "3DL4kKQgIoykYT7c1oylKA2u",
  "host": "socratiq-prod-db.cdg2livjhuop.us-east-1.rds.amazonaws.com",
  "port": 5432,
  "database": "socratiq"
}
```

**Access**: Sophie orchestrator only (needs database for TxP synthesis)

### 9. API Gateway Integration

**Existing API Gateway**: `8cwa0shan6` (production SocratIQ app)

**New Endpoint to Add**:
```
POST /api/sophie/chat → SocratIQ-Sophie-Orchestrator-prod
```

**Permission**: Lambda function permission granted for API Gateway invocation

---

## 📁 REPOSITORY STRUCTURE

```
SocratIQAgents/
├── agents/                                  # Agent skills documentation
│   ├── VERA/skills.md                      # VERA sub-agent capabilities
│   ├── FINN/skills.md                      # FINN sub-agent capabilities
│   ├── NORA/skills.md                      # NORA sub-agent capabilities
│   ├── CLIA/skills.md                      # CLIA sub-agent capabilities
│   └── Sophie/skills.md                    # Sophie orchestration logic
│
├── infrastructure/
│   ├── s3/
│   │   ├── bucket-configuration.yaml       # S3 corpus buckets CloudFormation
│   │   └── deploy-buckets.sh              # S3 deployment script
│   └── lambda/
│       ├── agent-lambdas.yaml              # Lambda functions CloudFormation
│       └── deploy-agents.sh                # Lambda deployment script
│
├── lambda/
│   ├── agents/
│   │   ├── vera/index.js                   # VERA agent handler (compiled)
│   │   ├── finn/index.js                   # FINN agent handler (compiled)
│   │   ├── nora/index.js                   # NORA agent handler (compiled)
│   │   ├── clia/index.js                   # CLIA agent handler (compiled)
│   │   └── sophie/index.js                 # Sophie orchestrator (compiled)
│   └── shared/                             # Lambda layer code
│       ├── bedrock-client.ts               # Bedrock Claude invocation
│       ├── corpus-retrieval.ts             # S3 corpus retrieval
│       ├── agent-prompts.ts                # Agent system prompts
│       ├── types.ts                        # TypeScript interfaces
│       ├── utils.ts                        # Shared utilities
│       └── package.json
│
├── streamlit_app.py                        # Local testing UI
├── README.md                               # Repository overview
├── CURRENT_ARCHITECTURE_STATE.md           # Production app architecture
└── socratiq_prd_oct_9_2025.md             # Product requirements
```

---

## 🔄 AGENT ORCHESTRATION FLOW

### User Query → Sophie → Multi-Agent Coordination

```
┌─────────────────────────────────────────────────────────────────┐
│ User submits query via frontend (Streamlit or React)            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ SocratIQ-Sophie-Orchestrator-prod (Lambda)                      │
│                                                                  │
│ 1. Intent Analysis (determine domain: clinical, regulatory,     │
│    commercial, financial, or multi-domain)                      │
│                                                                  │
│ 2. Agent Selection (choose 1-4 specialized agents based on      │
│    query complexity and domain overlap)                         │
│                                                                  │
│ 3. Parallel Invocation (invoke domain agents concurrently)      │
└───────────────┬───────────────────────────────┬─────────────────┘
                │                               │
        ┌───────┴───────┐               ┌───────┴───────┐
        ▼               ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ VERA Agent  │ │ FINN Agent  │ │ NORA Agent  │ │ CLIA Agent  │
│ Lambda      │ │ Lambda      │ │ Lambda      │ │ Lambda      │
│             │ │             │ │             │ │             │
│ 1. Detect   │ │ 1. Detect   │ │ 1. Detect   │ │ 1. Detect   │
│    sub-agent│ │    sub-agent│ │    sub-agent│ │    sub-agent│
│ 2. Retrieve │ │ 2. Retrieve │ │ 2. Retrieve │ │ 2. Retrieve │
│    corpus   │ │    corpus   │ │    corpus   │ │    corpus   │
│ 3. Invoke   │ │ 3. Invoke   │ │ 3. Invoke   │ │ 3. Invoke   │
│    Bedrock  │ │    Bedrock  │ │    Bedrock  │ │    Bedrock  │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
        │               │               │               │
        └───────┬───────┴───────┬───────┴───────┬───────┘
                │               │               │
                ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Sophie Synthesis & Conflict Resolution                          │
│                                                                  │
│ 4. Response Aggregation (collect all agent responses)           │
│                                                                  │
│ 5. Tri-Paradigm Analysis:                                       │
│    - Mechanistic: Causal relationships and mechanisms           │
│    - Deterministic: Rules-based scoring and compliance          │
│    - Probabilistic: Risk quantification and uncertainty         │
│                                                                  │
│ 6. Conflict Resolution (MCDA for disagreements):                │
│    - Weight agent expertise by domain relevance                 │
│    - Apply Multi-Criteria Decision Analysis                     │
│    - Flag unresolved conflicts for user review                  │
│                                                                  │
│ 7. Strategic Recommendation (actionable synthesis)              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ Return to User:                                                  │
│ - Strategic recommendation                                       │
│ - Tri-paradigm analysis breakdown                               │
│ - Agent contributions (individual insights)                      │
│ - Confidence score                                               │
│ - Sources (from all agent corpus retrievals)                    │
│ - Conflicts identified (if any)                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 COST ESTIMATION

### Monthly AWS Costs (Estimated)

**Assumptions**:
- 10,000 queries/month
- Average 2 agents invoked per query
- Average response: 1,000 tokens

| Service | Usage | Unit Cost | Monthly Cost |
|---------|-------|-----------|--------------|
| **Lambda (Compute)** | 20,000 invocations × 5 sec avg | $0.0000166667/GB-sec | ~$8 |
| **Lambda (Requests)** | 20,000 requests | $0.20/1M requests | $0.004 |
| **Bedrock (Claude 3.5)** | 20M input + 20M output tokens | $3/$15 per 1M tokens | $360 |
| **S3 (Storage)** | 100 GB corpus | $0.023/GB | $2.30 |
| **S3 (Requests)** | 100,000 GET requests | $0.0004/1K | $0.04 |
| **Secrets Manager** | 1 secret | $0.40/secret/month | $0.40 |
| **CloudWatch Logs** | 5 GB/month | $0.50/GB | $2.50 |
| **Total** | | | **~$373/month** |

**Note**: Bedrock is the largest cost driver (~96% of total)

---

**Document Version**: 1.0.0
**Last Updated**: October 24, 2025
**Status**: Development Ready - Awaiting Deployment
