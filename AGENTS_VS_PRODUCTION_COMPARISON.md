# SocratIQ Agents Repository vs Production App - Component Comparison

**Document Created**: October 24, 2025
**Purpose**: Compare AWS components between SocratIQAgents repo and production SocratIQ app
**Status**: Gap Analysis for Integration Planning

---

## 🎯 EXECUTIVE SUMMARY

This document provides a detailed comparison between:
1. **SocratIQAgents Repository**: Multi-agent AI system (this repo) - **Development Ready**
2. **Production SocratIQ App**: Live pharmaceutical intelligence platform - **Currently Deployed**

### Key Findings

| Category | Agents Repo | Production App | Integration Status |
|----------|-------------|----------------|-------------------|
| **Lambda Functions** | 5 (agents) | 9 (platform APIs) | ⚠️ **To be merged** |
| **S3 Buckets** | 5 (agent corpus) | 0 | ⚠️ **New infrastructure** |
| **Database** | Shared RDS | AWS RDS PostgreSQL | ✅ **Already shared** |
| **API Gateway** | To be added | Deployed (`8cwa0shan6`) | ⚠️ **Needs endpoints** |
| **Frontend** | Streamlit (local) | React + Amplify | ⚠️ **Integration needed** |
| **Authentication** | None (testing only) | AWS Cognito | ⚠️ **Needs integration** |
| **VPC** | Shared | Deployed | ✅ **Already configured** |

---

## 📊 DETAILED COMPONENT COMPARISON

### 1. AWS Lambda Functions

#### SocratIQAgents Repository (5 Functions - Not Yet Deployed)

| Function Name | Purpose | Runtime | Memory | Timeout | VPC | Status |
|---------------|---------|---------|--------|---------|-----|--------|
| **SocratIQ-VERA-Agent-prod** | Product & Clinical Intelligence | Node.js 20.x | 1024 MB | 180s | Yes | 🔴 Not deployed |
| **SocratIQ-FINN-Agent-prod** | Financial & Investment Intelligence | Node.js 20.x | 1024 MB | 180s | Yes | 🔴 Not deployed |
| **SocratIQ-NORA-Agent-prod** | Legal, Regulatory & IP Intelligence | Node.js 20.x | 1024 MB | 180s | Yes | 🔴 Not deployed |
| **SocratIQ-CLIA-Agent-prod** | Clinical Trials & Market Intelligence | Node.js 20.x | 1024 MB | 180s | Yes | 🔴 Not deployed |
| **SocratIQ-Sophie-Orchestrator-prod** | Multi-agent coordination | Node.js 20.x | 2048 MB | 300s | Yes | 🔴 Not deployed |

#### Production SocratIQ App (9 Functions - Currently Deployed)

| Function Name | Purpose | Runtime | Memory | Last Modified | Status |
|---------------|---------|---------|--------|---------------|--------|
| **SocratIQ-GetAssets** | Retrieve customer pharmaceutical assets | Node.js 20.x | 512 MB | Oct 11, 2025 | ✅ Active |
| **SocratIQ-GetUnifiedAssets** | Retrieve 64 unified assets for TxP Dashboard | Node.js 20.x | 512 MB | Oct 16, 2025 | ✅ Active |
| **SocratIQ-AskSophie** | Sophie orchestrator chat endpoint | Node.js 20.x | 512 MB | Oct 11, 2025 | ✅ Active |
| **SocratIQ-GetTppScore** | Calculate Target Product Profile scores | Node.js 20.x | 1024 MB | Oct 11, 2025 | ✅ Active |
| **SocratIQ-DeployHistoricalAssets** | Deploy migration 004 (historical_assets table) | Node.js 20.x | 1024 MB | Oct 11, 2025 | ✅ Active |
| **SocratIQ-InsertHistoricalAssets** | Insert 40 benchmark assets from SQL | Node.js 20.x | 1024 MB | Oct 11, 2025 | ✅ Active |
| **SocratIQ-GenerateHistoricalAssets** | AI-powered asset generation (backup method) | Node.js 20.x | 2048 MB | Oct 11, 2025 | ✅ Active |
| **SocratIQ-DeployFullSchema** | Deploy complete database schema | Node.js 20.x | 1024 MB | Oct 11, 2025 | ✅ Active |
| **SocratIQ-InitDatabase** | Initialize database extensions | Node.js 20.x | 512 MB | Oct 11, 2025 | ✅ Active |

#### 🔍 Analysis

**Overlap**:
- Both have `SocratIQ-AskSophie` / `SocratIQ-Sophie-Orchestrator-prod` - **Name conflict to resolve**
- Production Sophie is simpler (no multi-agent coordination yet)
- Agents repo Sophie is more advanced (invokes VERA/FINN/NORA/CLIA)

**Unique to Agents Repo**:
- 4 specialized domain agents (VERA, FINN, NORA, CLIA) - **NEW**
- Enhanced Sophie with true multi-agent orchestration - **UPGRADE**

**Unique to Production**:
- Database administration functions (Deploy, Insert, Generate, Init)
- Asset retrieval APIs (GetAssets, GetUnifiedAssets)
- TxP scoring API (GetTppScore)

**Integration Plan**:
1. Deploy 4 new domain agent Lambdas (VERA, FINN, NORA, CLIA)
2. Replace production `SocratIQ-AskSophie` with `SocratIQ-Sophie-Orchestrator-prod`
3. Keep existing database admin and asset API functions

---

### 2. S3 Buckets

#### SocratIQAgents Repository (5 Buckets - Not Yet Deployed)

| Bucket Name | Purpose | Size (Estimated) | Status |
|-------------|---------|------------------|--------|
| **socratiq-vera-corpus-prod** | VERA agent knowledge base | TBD | 🔴 Not created |
| **socratiq-finn-corpus-prod** | FINN agent knowledge base | TBD | 🔴 Not created |
| **socratiq-nora-corpus-prod** | NORA agent knowledge base | TBD | 🔴 Not created |
| **socratiq-clia-corpus-prod** | CLIA agent knowledge base | TBD | 🔴 Not created |
| **socratiq-sophie-corpus-prod** | Sophie orchestration corpus | TBD | 🔴 Not created |

#### Production SocratIQ App (0 Buckets)

**No S3 buckets currently used for document storage.**

**Note**: Production app may have S3 buckets for:
- Frontend assets (managed by Amplify, not visible)
- Lambda deployment packages (private)

#### 🔍 Analysis

**Gap**: Agent corpus buckets are entirely new infrastructure

**Integration Plan**:
1. Deploy 5 S3 buckets using CloudFormation template
2. Populate with pharmaceutical documents (corpus population project)
3. Grant Lambda functions read access via IAM policy

---

### 3. Database (AWS RDS PostgreSQL)

#### Shared Database: `socratiq-prod-db.cdg2livjhuop.us-east-1.rds.amazonaws.com`

**Endpoint**: `socratiq-prod-db.cdg2livjhuop.us-east-1.rds.amazonaws.com:5432`
**Database**: `socratiq`
**Engine**: PostgreSQL
**Status**: ✅ **Shared between both systems**

#### Tables Used by Agents Repo

| Table | Purpose | Schema File |
|-------|---------|-------------|
| **unified_assets** | 64 pharmaceutical assets for TxP scoring | `shared/schema.ts` |
| **historical_assets** | 40 benchmark assets (20 successes, 20 failures) | `shared/schema.ts` |
| **sophie_patterns** | Pattern detection results | `shared/schema.ts` |
| **pattern_hypotheses** | AI-generated hypotheses | `shared/schema.ts` |
| **recommended_actions** | Strategic recommendations | `shared/schema.ts` |

**Access**: Sophie orchestrator only (via Secrets Manager)

#### Tables Used by Production App

| Table | Purpose | Rows |
|-------|---------|------|
| **unified_assets** | 64 pharmaceutical assets | 64 |
| **historical_assets** | Benchmark pharmaceutical assets | 40 |
| **documents** | Document processing metadata | Variable |
| **entities** | Named entity recognition results | Variable |
| **users** | User management with RBAC | Variable |
| **projects** | EMME pharmaceutical project management | Variable |
| **sophie_patterns** | Sophie Impact Lens™ pattern detection | Variable |
| **pattern_hypotheses** | AI-generated hypotheses | Variable |
| **recommended_actions** | Prioritized action items | Variable |
| **blast_zone_analyses** | Impact analysis for decisions | Variable |

#### 🔍 Analysis

**Overlap**: Both use the same database and same core tables

**Integration**: ✅ **No changes needed** - Database already supports both systems

---

### 4. API Gateway

#### SocratIQAgents Repository (Endpoints to Add)

**API Gateway**: `8cwa0shan6` (same as production)

**New Endpoints Needed**:
```
POST /api/agents/vera     → SocratIQ-VERA-Agent-prod
POST /api/agents/finn     → SocratIQ-FINN-Agent-prod
POST /api/agents/nora     → SocratIQ-NORA-Agent-prod
POST /api/agents/clia     → SocratIQ-CLIA-Agent-prod
POST /api/sophie/chat     → SocratIQ-Sophie-Orchestrator-prod (replace existing)
```

#### Production SocratIQ App (Current Endpoints)

**API Gateway**: `8cwa0shan6`
**Base URL**: `https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod/`

**Existing Endpoints**:
```
GET  /api/customer/assets          → SocratIQ-GetAssets
GET  /api/unified-assets            → SocratIQ-GetUnifiedAssets
POST /api/sophie/chat               → SocratIQ-AskSophie (simple version)
GET  /api/tpp/score/{assetId}      → SocratIQ-GetTppScore
```

#### 🔍 Analysis

**Conflict**: `/api/sophie/chat` endpoint exists but points to simple Sophie (no multi-agent)

**Integration Plan**:
1. Add 4 new agent endpoints (`/api/agents/{agent}`)
2. Update `/api/sophie/chat` to point to new Sophie orchestrator
3. Keep existing asset and TPP endpoints unchanged

---

### 5. Frontend

#### SocratIQAgents Repository (Local Testing UI)

**Type**: Streamlit Python app
**File**: `streamlit_app.py`
**URL**: `http://localhost:8501` (local only)
**Purpose**: Development testing for agents

**Features**:
- Individual agent chat (VERA, FINN, NORA, CLIA)
- Sophie multi-agent orchestration
- Target Product Profile generation
- Query history

**Status**: 🔴 **Local development only** (not deployed to production)

#### Production SocratIQ App (React Frontend)

**Type**: React SPA (Single Page Application)
**Hosting**: AWS Amplify
**URL**: `https://dcy0k0y50q67k.amplifyapp.com`
**Repository**: `https://github.com/acumen-dev-ops/socratiq`
**Branch**: `sagemaker-work` (auto-deploy)

**Pages**:
- Login (Cognito authentication)
- Customer Dashboard
- TxP Dashboard V2 (64 unified assets)
- Sophie Welcome Dashboard
- Sophie Chat
- Asset Portfolio
- Evidence Bundle Generator

**Status**: ✅ **Production deployed**

#### 🔍 Analysis

**Gap**: Streamlit UI is for local testing only - production uses React

**Integration Plan**:
1. Keep Streamlit for agent development/testing
2. Add agent endpoints to production React app
3. Update `SophieChat.tsx` to call new multi-agent Sophie orchestrator
4. Add individual agent chat UI to React app (optional)

---

### 6. Authentication

#### SocratIQAgents Repository

**Authentication**: ❌ **None**
- Streamlit app calls Lambda directly (no auth)
- For local testing only

#### Production SocratIQ App

**Authentication**: ✅ **AWS Cognito**
- **User Pool ID**: `us-east-1_PczohxQao`
- **Client ID**: `26vmipk2m5ga6vol7htdvu9tb2`
- **Identity Pool ID**: `us-east-1:ff78d7be-9358-4a13-8290-c0d7ea180844`

**Features**:
- Email/password login
- First-time password change flow
- JWT token injection for API calls
- Session persistence
- RBAC (5 roles: super_admin, platform_admin, partner_admin, analyst, viewer)

#### 🔍 Analysis

**Gap**: Agent Lambdas do not validate JWT tokens (production APIs require auth)

**Integration Plan**:
1. Add Cognito authorizer to new agent API Gateway endpoints
2. Verify JWT tokens in Lambda functions (optional, API Gateway handles it)
3. Pass user context to agents for personalized responses

---

### 7. VPC & Networking

#### Shared VPC Infrastructure

**VPC ID**: `vpc-0596668685e114793`

| Component | ID | Used by Agents Repo | Used by Production |
|-----------|-----|---------------------|-------------------|
| **Private Subnet 1** | `subnet-077cc788ec4a6a7fe` | ✅ Yes | ✅ Yes |
| **Private Subnet 2** | `subnet-08c8e7b914ab19438` | ✅ Yes | ✅ Yes |
| **Lambda Security Group** | `sg-079019dddda2c3b3a` | ✅ Yes | ✅ Yes |
| **Database Security Group** | `sg-09fcd6239c92a1c6b` | ✅ Yes | ✅ Yes |

#### 🔍 Analysis

**Integration**: ✅ **No changes needed** - Both use the same VPC configuration

---

### 8. IAM Roles & Policies

#### SocratIQAgents Repository (2 New Roles)

| Role Name | Purpose | Policies |
|-----------|---------|----------|
| **SocratIQ-DomainAgent-ExecutionRole-prod** | VERA/FINN/NORA/CLIA | Bedrock, S3 Corpus, VPC, CloudWatch |
| **SocratIQ-Sophie-ExecutionRole-prod** | Sophie orchestrator | Bedrock, S3 Corpus, Lambda Invoke, Secrets Manager, VPC, CloudWatch |

#### Production SocratIQ App (Existing Role)

| Role Name | Purpose | Policies |
|-----------|---------|----------|
| **SophieLambdaRole** (existing) | All production Lambdas | Bedrock, Secrets Manager, VPC, CloudWatch |

#### 🔍 Analysis

**New Roles**: 2 new IAM roles will be created by CloudFormation

**Integration Plan**:
1. Deploy new roles via CloudFormation template
2. Keep existing `SophieLambdaRole` for production functions
3. Attach S3 corpus access policy to new roles

---

### 9. AWS Bedrock

#### SocratIQAgents Repository

**Model**: Claude 3.5 Sonnet v2
**Model ID**: `anthropic.claude-3-5-sonnet-20241022-v2:0`
**Configuration**: Specialized system prompts per agent/sub-agent

#### Production SocratIQ App

**Model**: Claude 3.5 Sonnet 4.5 (Global Inference Profile)
**Model ID**: (uses global profile, not specific model ID)
**Configuration**: General Sophie orchestration prompt

#### 🔍 Analysis

**Difference**: Agents repo uses v2 model with specialized prompts per agent

**Integration**: ✅ **Both compatible** - Same Bedrock service, different prompts

---

### 10. CloudFormation Stacks

#### SocratIQAgents Repository (2 New Stacks - Not Deployed)

| Stack Name | Template | Resources | Status |
|------------|----------|-----------|--------|
| **socratiq-agent-corpus-prod** | `infrastructure/s3/bucket-configuration.yaml` | 5 S3 buckets, 1 IAM policy | 🔴 Not deployed |
| **socratiq-agent-lambdas-prod** | `infrastructure/lambda/agent-lambdas.yaml` | 5 Lambda functions, 2 IAM roles, 1 Lambda layer | 🔴 Not deployed |

#### Production SocratIQ App (3 Existing Stacks)

| Stack Name | Status | Created | Resources |
|------------|--------|---------|-----------|
| **socratiq-lambda-prod** | UPDATE_COMPLETE | Oct 8, 2025 | 9 Lambda functions, API Gateway |
| **socratiq-vpc-prod** | CREATE_COMPLETE | Oct 8, 2025 | VPC networking |
| **amplify-sp1001** | UPDATE_COMPLETE | Earlier | React frontend hosting |

#### 🔍 Analysis

**New Stacks**: 2 new CloudFormation stacks will be created

**Integration**: Independent stacks, no conflicts with existing infrastructure

---

## 🔄 INTEGRATION ROADMAP

### Phase 1: Infrastructure Deployment (Week 1)

**Tasks**:
1. ✅ Deploy S3 corpus buckets
   ```bash
   cd infrastructure/s3
   ./deploy-buckets.sh prod
   ```
2. ✅ Build and package Lambda functions
   ```bash
   cd lambda
   ./package-lambdas.sh
   ```
3. ✅ Upload Lambda packages to S3 code bucket
   ```bash
   aws s3 cp *.zip s3://socratiq-lambda-code-prod/agents/
   ```
4. ✅ Deploy Lambda functions
   ```bash
   cd infrastructure/lambda
   ./deploy-agents.sh prod
   ```

**Deliverables**:
- 5 S3 buckets created
- 5 Lambda functions deployed
- 2 IAM roles created
- 1 Lambda layer deployed

### Phase 2: API Gateway Integration (Week 2)

**Tasks**:
1. Add new API Gateway endpoints for agents
2. Configure Cognito authorizer for agent endpoints
3. Update `/api/sophie/chat` to point to new Sophie orchestrator
4. Test all endpoints with Postman/Insomnia

**Deliverables**:
- 4 new agent endpoints live
- Updated Sophie endpoint
- API documentation updated

### Phase 3: Corpus Population (Weeks 3-4)

**Tasks**:
1. Gather pharmaceutical documents for each agent
2. Organize into recommended folder structure
3. Upload to respective S3 buckets
4. Test corpus retrieval in Lambda functions

**Deliverables**:
- VERA corpus populated (product dev, clinical trials, CMC)
- FINN corpus populated (financial models, budgets)
- NORA corpus populated (regulatory, patents, CRADA)
- CLIA corpus populated (market research, competitive intel)
- Sophie corpus populated (orchestration logs, frameworks)

### Phase 4: Frontend Integration (Week 5)

**Tasks**:
1. Update React `SophieChat.tsx` to call new multi-agent Sophie
2. Add individual agent chat components (optional)
3. Update TxP Dashboard to show agent contributions
4. Deploy to Amplify

**Deliverables**:
- Sophie chat uses multi-agent orchestration
- Agent insights visible in UI
- Production deployment

### Phase 5: Testing & Validation (Week 6)

**Tasks**:
1. End-to-end testing of agent coordination
2. Performance testing (latency, cost)
3. Security audit (IAM policies, VPC)
4. User acceptance testing

**Deliverables**:
- Test results documented
- Performance benchmarks
- Security sign-off
- Production ready

---

## 📊 FEATURE COMPARISON MATRIX

| Feature | Agents Repo | Production App | Integration Status |
|---------|-------------|----------------|-------------------|
| **Multi-Agent Coordination** | ✅ Yes (VERA/FINN/NORA/CLIA) | ❌ No (simple Sophie) | ⚠️ Upgrade needed |
| **Tri-Paradigm Reasoning** | ✅ Yes (SophieLogic™) | ❌ No | ⚠️ New feature |
| **Corpus Retrieval** | ✅ Yes (S3 buckets) | ❌ No | ⚠️ New infrastructure |
| **Sub-Agent Specialization** | ✅ Yes (25 sub-agents) | ❌ No | ⚠️ New feature |
| **TxP Scoring** | ✅ Database query | ✅ Lambda function | ✅ Compatible |
| **User Authentication** | ❌ No | ✅ Cognito | ⚠️ Integration needed |
| **Frontend UI** | ⚠️ Streamlit (local) | ✅ React (Amplify) | ⚠️ Integration needed |
| **Database Schema** | ✅ Shared | ✅ Shared | ✅ Compatible |
| **API Gateway** | ⚠️ Needs endpoints | ✅ Deployed | ⚠️ Integration needed |
| **VPC Networking** | ✅ Shared | ✅ Shared | ✅ Compatible |

---

## 🎯 CRITICAL INTEGRATION POINTS

### 1. Sophie Orchestrator Replacement

**Current**: `SocratIQ-AskSophie` (simple chat, no multi-agent)
**Upgrade to**: `SocratIQ-Sophie-Orchestrator-prod` (multi-agent coordination)

**Impact**:
- Enhanced intelligence (4 domain agents contributing)
- Longer response time (parallel agent invocation)
- Higher Bedrock costs (multiple Claude calls)
- Better quality recommendations (cross-domain synthesis)

**Risk Mitigation**:
- A/B test new Sophie vs old Sophie
- Monitor latency and cost
- Gradual rollout to users

### 2. Corpus Population Strategy

**Challenge**: Agents need high-quality pharmaceutical documents to function

**Options**:
1. **Manual Upload**: Gather existing docs, upload to S3
2. **Automated Scraping**: Scrape FDA.gov, ClinicalTrials.gov, PubMed
3. **Third-Party Data**: Purchase pharmaceutical datasets
4. **Hybrid Approach**: Combination of all three

**Recommendation**: Start with manual upload of curated documents

### 3. Cost Management

**New Monthly Costs**:
- Agent Lambdas: ~$10/month (compute)
- Bedrock (multi-agent): ~$500/month (5x increase from current)
- S3 Corpus: ~$5/month (storage + requests)
- **Total New Costs**: ~$515/month

**Mitigation**:
- Implement caching to reduce Bedrock calls
- Use cheaper models for sub-agents (if available)
- Monitor usage and optimize prompts

---

## 🚨 RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **High Bedrock Costs** | Budget overrun | High | Implement caching, monitor usage, set billing alerts |
| **Slow Response Times** | Poor UX | Medium | Optimize parallel agent invocation, use streaming |
| **Corpus Quality Issues** | Poor agent responses | Medium | Curate high-quality documents, validate sources |
| **API Gateway Conflicts** | Service disruption | Low | Test in staging, blue/green deployment |
| **Authentication Gaps** | Security risk | Low | Add Cognito authorizer to all endpoints |

---

## 📞 NEXT STEPS

### Immediate Actions (This Week)

1. **Deploy S3 Buckets**:
   ```bash
   cd infrastructure/s3 && ./deploy-buckets.sh prod
   ```

2. **Build Lambda Functions**:
   ```bash
   cd lambda && ./package-lambdas.sh
   ```

3. **Upload to S3 Code Bucket**:
   ```bash
   aws s3 cp vera-agent.zip s3://socratiq-lambda-code-prod/agents/
   # (repeat for all agents)
   ```

4. **Deploy Lambda Functions**:
   ```bash
   cd infrastructure/lambda && ./deploy-agents.sh prod
   ```

5. **Test Agent Invocations**:
   ```bash
   aws lambda invoke --function-name SocratIQ-VERA-Agent-prod \
     --payload '{"query": "What are best practices for Phase 3 trial design?"}' \
     vera-response.json
   ```

### Short-Term (Next 2 Weeks)

1. Add API Gateway endpoints for agents
2. Start corpus population with curated documents
3. Update React frontend to call new Sophie orchestrator
4. Conduct integration testing

### Medium-Term (Next Month)

1. Expand corpus with automated document collection
2. Optimize agent prompts based on user feedback
3. Implement caching to reduce costs
4. Add agent analytics dashboard

---

**Document Version**: 1.0.0
**Last Updated**: October 24, 2025
**Next Review**: November 7, 2025
**Status**: Integration Planning Complete
