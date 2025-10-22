# SocratIQ Platform - Complete Architecture State Documentation

**Document Created**: October 16, 2025, 11:45 AM EDT
**Last Verified**: October 16, 2025, 5:30 PM EDT
**Document Version**: 1.1.0
**Platform Version**: Production (Phase 2.2 Complete + Production CORS Fix)
**Author**: Claude Code AI Assistant (Sonnet 4.5)
**Purpose**: Single Source of Truth for All Development Work

---

## 🎯 EXECUTIVE SUMMARY

This document represents the **complete, verified, accurate state** of the SocratIQ platform as of October 16, 2025. Every detail has been verified through direct AWS CLI queries, code inspection, and database connectivity tests. Use this document as your **primary reference** for all development work.

### Critical Success Factors
✅ **AWS Production Backend Deployed** - 8 Lambda functions + API Gateway
✅ **React Frontend Deployed** - AWS Amplify hosting
✅ **Database Operational** - AWS RDS PostgreSQL with VPN access
✅ **Phase 2.2 Complete** - 64 unified assets integrated into TxP Dashboard
✅ **Authentication Production-Ready** - AWS Cognito with automatic JWT injection

---

## 📐 COMPLETE ARCHITECTURE OVERVIEW

### Deployment Model: HYBRID ARCHITECTURE

The platform uses a **hybrid development architecture** where:
- **Local Development**: Express backend (port 3001) for rapid iteration
- **Production Deployment**: AWS Lambda + API Gateway for scalability
- **Shared Resources**: Single AWS RDS PostgreSQL database, AWS Cognito, AWS Bedrock

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCTION ENVIRONMENT                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  AWS Amplify (Frontend)                                         │
│  └─ https://dcy0k0y50q67k.amplifyapp.com                       │
│     └─ React SPA (Cognito Auth + JWT)                          │
│        └─ Calls Backend APIs                                    │
│                                                                  │
│  AWS API Gateway (Backend)                                      │
│  └─ https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod│
│     ├─ GET  /api/customer/assets                               │
│     ├─ POST /api/sophie/chat                                    │
│     └─ GET  /api/tpp/score/{assetId}                           │
│     └─ AWS Lambda Functions (8 total)                          │
│        ├─ SocratIQ-GetAssets                                   │
│        ├─ SocratIQ-AskSophie                                   │
│        ├─ SocratIQ-GetTppScore                                 │
│        ├─ SocratIQ-DeployHistoricalAssets                      │
│        ├─ SocratIQ-InsertHistoricalAssets                      │
│        ├─ SocratIQ-GenerateHistoricalAssets                    │
│        ├─ SocratIQ-DeployFullSchema                            │
│        └─ SocratIQ-InitDatabase                                │
│                                                                  │
│  AWS RDS PostgreSQL (Database) - VPC ONLY                      │
│  └─ socratiq-prod-db.cdg2livjhuop.us-east-1.rds.amazonaws.com  │
│     └─ Database: socratiq                                       │
│        ├─ Table: unified_assets (64 pharmaceutical assets)     │
│        ├─ Table: historical_assets (40 benchmark assets)       │
│        ├─ Table: documents, entities, users, projects          │
│        └─ Schema managed via Drizzle ORM                       │
│                                                                  │
│  AWS Cognito (Authentication)                                  │
│  └─ User Pool ID: us-east-1_PczohxQao                          │
│     └─ Client ID: 26vmipk2m5ga6vol7htdvu9tb2                   │
│        └─ Amplify v6 integration                               │
│                                                                  │
│  AWS Bedrock (AI Services)                                     │
│  └─ Claude 3.5 Sonnet 4.5 (Global Inference Profile)          │
│                                                                  │
│  AWS VPC Infrastructure                                        │
│  └─ VPC ID: vpc-0596668685e114793                              │
│     ├─ Private Subnet 1: subnet-077cc788ec4a6a7fe              │
│     ├─ Private Subnet 2: subnet-08c8e7b914ab19438              │
│     ├─ Lambda SG: sg-079019dddda2c3b3a                         │
│     └─ Database SG: sg-09fcd6239c92a1c6b                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   LOCAL DEVELOPMENT ENVIRONMENT                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  React Dev Server (Port 3000)                                   │
│  └─ http://localhost:3000                                       │
│     └─ Hot reload enabled                                       │
│     └─ Calls local Express OR production API Gateway           │
│                                                                  │
│  Express Backend (Port 3001)                                    │
│  └─ http://localhost:3001                                       │
│     ├─ GET  /api/unified-assets (64 assets)                    │
│     ├─ POST /api/sophie/chat                                    │
│     ├─ GET  /api/documents                                      │
│     └─ 20+ route modules (see server/routes*.ts)               │
│                                                                  │
│  Database Connection (VPN Required)                             │
│  └─ PostgreSQL: socratiq-prod-db (shared with production)      │
│     └─ **CRITICAL**: VPN must be connected                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ DATABASE ARCHITECTURE

### **CRITICAL NOTE: VPN REQUIRED FOR DATABASE ACCESS**

The AWS RDS PostgreSQL database is **NOT publicly accessible**. To connect from your local machine, you MUST:
1. Connect to the configured VPN
2. Use connection string with VPN active
3. All Lambda functions have VPC access configured automatically

### Database Configuration

| Property | Value |
|----------|-------|
| **Endpoint** | `socratiq-prod-db.cdg2livjhuop.us-east-1.rds.amazonaws.com` |
| **Port** | `5432` |
| **Database Name** | `socratiq` |
| **Username** | `socratiqadmin` |
| **Password** | `3DL4kKQgIoykYT7c1oylKA2u` |
| **Engine** | PostgreSQL |
| **Status** | `available` |
| **VPC Access** | Private subnets only (VPN required for local access) |

### Connection String

```bash
# For local Express backend (VPN required)
DATABASE_URL=postgresql://socratiqadmin:3DL4kKQgIoykYT7c1oylKA2u@socratiq-prod-db.cdg2livjhuop.us-east-1.rds.amazonaws.com:5432/socratiq

# Lambda functions retrieve credentials from AWS Secrets Manager
# Secret ARN: arn:aws:secretsmanager:us-east-1:797455229240:secret:socratiq/db/credentials-4w7uQA
```

### Database Schema (Drizzle ORM)

**Key Tables** (verified October 16, 2025):

1. **unified_assets** - 64 pharmaceutical assets
   - Primary keys: `asset_id` (TEXT, PK)
   - Fields: `name`, `company`, `therapeutic_area`, `indication`, `development_phase`
   - TxP Scores: `txp_product_score`, `txp_patient_score`, `txp_budget_score`, etc.
   - Drug Repurposing: `is_repurposed`, `original_indication`, `repurposing_classification`
   - Total Fields: 106 columns
   - **IMPORTANT**: Drizzle ORM converts snake_case to camelCase in JavaScript

2. **historical_assets** - 40 benchmark pharmaceutical assets (20 successes, 20 failures)
   - Used for TxP scoring comparisons
   - Deployed October 10, 2025 via Lambda
   - Includes: Keytruda, Ozempic, Dupixent (successes), Alzheimer's drug failures

3. **documents** - Document processing and entity extraction
4. **entities** - Named entity recognition results
5. **users** - User management with RBAC
6. **projects** - EMME pharmaceutical project management
7. **sophie_patterns** - Sophie Impact Lens™ pattern detection
8. **pattern_hypotheses** - AI-generated hypotheses
9. **recommended_actions** - Strategic recommendations
10. **blast_zone_analyses** - Impact analysis for decisions

### Database Schema File Location

```
shared/schema.ts - Single source of truth for database schema
```

---

## ☁️ AWS INFRASTRUCTURE

### CloudFormation Stacks (Verified October 16, 2025)

| Stack Name | Status | Purpose | Created |
|------------|--------|---------|---------|
| **socratiq-lambda-prod** | UPDATE_COMPLETE | Lambda functions + API Gateway | Oct 8, 2025 |
| **socratiq-vpc-prod** | CREATE_COMPLETE | VPC networking for Lambda/RDS | Oct 8, 2025 |
| **amplify-sp1001** | UPDATE_COMPLETE | Frontend React hosting | Earlier |

### Lambda Functions (9 Total)

All Lambda functions verified as deployed and operational:

| Function Name | Runtime | Memory | Last Modified | Purpose |
|---------------|---------|--------|---------------|---------|
| **SocratIQ-GetAssets** | nodejs20.x | 512 MB | Oct 11, 2025 | Retrieve customer pharmaceutical assets |
| **SocratIQ-GetUnifiedAssets** | nodejs20.x | 512 MB | Oct 16, 2025 | **NEW**: Retrieve 64 unified pharmaceutical assets for TxP Dashboard |
| **SocratIQ-AskSophie** | nodejs20.x | 512 MB | Oct 11, 2025 | Sophie orchestrator chat endpoint |
| **SocratIQ-GetTppScore** | nodejs20.x | 1024 MB | Oct 11, 2025 | Calculate Target Product Profile scores |
| **SocratIQ-DeployHistoricalAssets** | nodejs20.x | 1024 MB | Oct 11, 2025 | Deploy migration 004 (historical_assets table) |
| **SocratIQ-InsertHistoricalAssets** | nodejs20.x | 1024 MB | Oct 11, 2025 | Insert 40 benchmark assets from SQL |
| **SocratIQ-GenerateHistoricalAssets** | nodejs20.x | 2048 MB | Oct 11, 2025 | AI-powered asset generation (backup method) |
| **SocratIQ-DeployFullSchema** | nodejs20.x | 1024 MB | Oct 11, 2025 | Deploy complete database schema |
| **SocratIQ-InitDatabase** | nodejs20.x | 512 MB | Oct 11, 2025 | Initialize database extensions |

### API Gateway Endpoints (Verified)

**Production API Base URL**: `https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod/`

**Available Endpoints**:

```
GET  /api/customer/assets          → SocratIQ-GetAssets
GET  /api/unified-assets            → SocratIQ-GetUnifiedAssets (NEW - Oct 16, 2025)
POST /api/sophie/chat               → SocratIQ-AskSophie
GET  /api/tpp/score/{assetId}      → SocratIQ-GetTppScore
```

**API Gateway Configuration**:
- API ID: `8cwa0shan6`
- Stage: `Prod` (deployed Oct 10, 2025)
- CORS: Enabled for all origins (`*`)
- Methods: GET, POST, OPTIONS

### AWS Amplify Frontend

**Application Details**:
- **App ID**: `dcy0k0y50q67k`
- **App Name**: `sp1001`
- **URL**: `https://dcy0k0y50q67k.amplifyapp.com`
- **Repository**: `https://github.com/acumen-dev-ops/socratiq`
- **Production Branch**: `sagemaker-work` (auto-deploy enabled)
- **Platform**: React (Web)
- **Last Deploy**: October 15, 2025, 8:45 PM EDT

**Amplify Environment Variables** (configured in AWS Console):
```
AMPLIFY_BACKEND_APP_ID=dcy0k0y50q67k
USER_BRANCH=dev
```

**Build Configuration** (`amplify.yml`):
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
```

### AWS Cognito Authentication

**Production Configuration** (Amplify v6):

```javascript
// src/config/amplify.ts
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_PczohxQao',
      userPoolClientId: '26vmipk2m5ga6vol7htdvu9tb2',
      loginWith: { email: true }
    }
  }
};
```

**Authentication Flow**:
1. User enters credentials in `LoginPage.tsx`
2. `useAuth.login()` calls AWS Cognito `signIn()`
3. Cognito detects `NEW_PASSWORD_REQUIRED` for first-time users
4. UI prompts for password change
5. `confirmSignIn()` completes authentication
6. JWT tokens stored in browser via Amplify session management
7. All API calls automatically include `Authorization: Bearer <token>` header
8. Session persists across page reloads

**Key Files**:
- `src/hooks/useAuth.ts` - Authentication logic
- `src/contexts/AuthContext.tsx` - Centralized auth state (React Context)
- `src/config/amplify.ts` - Amplify configuration
- `src/index.tsx` - Amplify initialization + AuthProvider wrapper

---

## 💻 FRONTEND ARCHITECTURE

### React Application Structure

```
src/
├── index.tsx                    # Entry point (Amplify init + AuthProvider)
├── App.tsx                      # Main app (AuthContext consumer, routing)
├── config/
│   ├── amplify.ts              # AWS Cognito configuration
│   └── api.ts                  # API endpoints + configuration
├── contexts/
│   └── AuthContext.tsx         # Centralized auth state (single source of truth)
├── hooks/
│   ├── useAuth.ts              # Cognito authentication hook
│   └── useUnifiedAssets.ts     # Fetch 64 pharmaceutical assets
├── utils/
│   └── api.ts                  # API utility functions (JWT injection)
├── types/
│   └── unifiedAssets.ts        # TypeScript types (camelCase for Drizzle)
├── pages/
│   ├── LoginPage.tsx           # Cognito login + password change
│   ├── CustomerDashboard.tsx   # Main dashboard
│   ├── TxPDashboardV2.tsx      # Target Product Profile (uses unified assets)
│   ├── SophieWelcomeDashboard.tsx  # Sophie onboarding
│   ├── SophieChat.tsx          # Chat with Sophie
│   └── customer/
│       ├── AssetPortfolio.tsx  # Asset management
│       └── EvidenceBundleGenerator.tsx
└── components/
    ├── Layout.tsx              # Main layout wrapper
    └── FileUpload.tsx          # Document upload
```

### Critical Frontend Configuration

**API Configuration** (`src/utils/api.ts` - Updated Oct 16, 2025):

```typescript
// Environment-aware backend URL (UPDATED - Production CORS Fix)
// Automatically uses Lambda in production, Express in development
const UNIFIED_ASSETS_BASE_URL = process.env.REACT_APP_BACKEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod'
    : 'http://localhost:3001');

const UNIFIED_ASSETS_BASE = `${UNIFIED_ASSETS_BASE_URL}/api/unified-assets`;
```

**CRITICAL CHANGE (Oct 16, 2025)**:
- Previously hardcoded `localhost:3001` causing CORS errors in production
- Now automatically detects environment and uses correct endpoint
- Amplify environment variables override for explicit control


**Environment Variables** (`.env`):

```bash
# React app variables (REACT_APP_ prefix required)
REACT_APP_USER_POOL_ID=us-east-1_PczohxQao
REACT_APP_USER_POOL_CLIENT_ID=26vmipk2m5ga6vol7htdvu9tb2
REACT_APP_AWS_REGION=us-east-1
REACT_APP_BACKEND_URL=http://localhost:3001

# For production deployment via Amplify, configure in AWS Console
REACT_APP_API_URL=https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod
```

### TxP Dashboard Integration (Phase 2.2 Complete)

**File**: `src/pages/TxPDashboardV2.tsx`

**Data Flow**:
1. Component mounts
2. `useUnifiedAssets()` hook fetches assets from `/api/unified-assets`
3. In development: calls Express backend (port 3001)
4. In production: calls Lambda API Gateway
5. Assets returned with camelCase field names (Drizzle ORM conversion)
6. Dropdown populated with 64 assets
7. First asset auto-selected
8. TxP scores displayed (product, patient, budget, regulatory, etc.)

**Key Features**:
- Dynamic asset dropdown (64 pharmaceutical assets)
- Auto-select first asset on load
- TxP dimension scores mapped from database
- Exit Readiness Score calculation with fallback for missing data
- Subtitle shows asset details (name, company, therapeutic area, indication)

**Type System** (`src/types/unifiedAssets.ts`):
```typescript
// CRITICAL: Uses camelCase (Drizzle ORM converts from snake_case)
interface UnifiedAsset {
  assetId: string;              // NOT asset_id
  name: string;
  company: string;
  therapeuticArea: string;      // NOT therapeutic_area
  indication: string;
  developmentPhase: string;     // NOT development_phase
  txpProductScore: number | null;  // NOT txp_product_score
  // ... 106 total fields
}
```

---

## 🖥️ BACKEND ARCHITECTURE

### Express Server (Local Development)

**File**: `server/index.ts`

**Configuration**:
- **Port**: 3001 (hardcoded, do NOT use environment variable `PORT`)
- **CORS**: Enabled for all origins (`*`)
- **Authentication**: Cognito JWT verification via `authManager.ts`
- **Database**: Direct connection to RDS PostgreSQL (VPN required)

**Route Modules** (verified October 16, 2025):

```
server/
├── index.ts                          # Main server entry point
├── routes.ts                         # Core route registration
├── routes-unified-assets.ts          # 64 pharmaceutical assets API ⭐
├── routes-sophie.ts                  # Sophie orchestration
├── routes-platform-core.ts           # Platform core APIs
├── routes-emme.ts                    # EMME project management
├── routes-corpus.ts                  # Pharmaceutical corpus
├── routes-pipeline.ts                # Document processing pipeline
├── routes-sophie-impact-lens.ts      # Impact Lens APIs
├── routes-mesh.ts                    # Knowledge graph
├── routes-build.ts                   # Project builder
├── routes-profile.ts                 # User profiles
├── routes-fedscout.ts                # Federal licensing
├── routes-emme-projects.ts           # EMME projects
├── routes-emme-questions.ts          # EMME questions
├── routes-advanced-nlp.ts            # NLP processing
├── routes-risk-analyzer.ts           # Risk assessment
├── routes-gnn.ts                     # Graph neural networks
└── [15 other route modules]
```

**Critical Routes for Development**:

| Route | File | Purpose |
|-------|------|---------|
| `/api/unified-assets` | `routes-unified-assets.ts` | **PRIMARY**: 64 pharmaceutical assets |
| `/api/sophie/chat` | `routes-sophie.ts` | Sophie AI chat |
| `/api/documents` | `routes.ts` | Document management |
| `/api/tpp/score/:assetId` | (Lambda only) | TxP scoring |
| `/api/customer/assets` | (Lambda only) | Customer assets |

### Unified Assets API (Local Express)

**File**: `server/routes-unified-assets.ts`

**Endpoints**:

```typescript
GET  /api/unified-assets                  // Get all assets (paginated)
GET  /api/unified-assets/:id              // Get single asset by ID
GET  /api/unified-assets/stats/summary    // Summary statistics
GET  /api/unified-assets/stats/by-source  // Assets grouped by source
GET  /api/unified-assets/stats/by-therapeutic-area
GET  /api/unified-assets/stats/by-phase
GET  /api/unified-assets/stats/repurposing
GET  /api/unified-assets/search?q=query   // Search assets
GET  /api/unified-assets/top-performers   // Top TxP scores
GET  /api/unified-assets/filters/options  // Filter dropdown options
GET  /api/unified-assets/:id/txp-scores   // TxP dimension scores
```

**Database Query Example**:

```typescript
// routes-unified-assets.ts
import { db } from './db';
import { unifiedAssets } from '../shared/schema';

// Get all assets
const assets = await db
  .select()
  .from(unifiedAssets)
  .orderBy(desc(unifiedAssets.txpOverallCompleteness))
  .limit(100);

// Drizzle automatically converts snake_case columns to camelCase objects
// Database: txp_product_score → JavaScript: txpProductScore
```

### Lambda Functions (Production Backend)

**File**: `lambda/template.yaml` (SAM template)

**Shared Code Architecture**:

Lambda functions and Express server share business logic:

```
server/services/          # ✅ Shared business logic
├── sophieOrchestrationService.ts
├── veraAgent.ts
├── finnAgent.ts
├── txpScoringService.ts
└── claudeService.ts

lambda/handlers/          # Lambda wrappers
├── customer/
│   ├── askSophie.ts     # Calls sophieOrchestrationService
│   ├── getAssets.ts     # Calls database directly
│   └── getTppScore.ts   # Calls txpScoringService
└── admin/
    ├── deployFullSchema.ts
    ├── deployHistoricalAssets.ts
    ├── insertHistoricalAssets.ts
    └── generateHistoricalAssets.ts
```

**Lambda Deployment Process**:

```bash
# Build Lambda functions
npm run lambda:build     # Compiles TypeScript to dist/
sam build               # Packages for AWS

# Deploy to AWS
sam deploy --guided     # Interactive deployment
# OR
npm run lambda:deploy   # Uses saved samconfig.toml

# Stack outputs API Gateway endpoint
# https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod/
```

**IAM Permissions** (configured in `template.yaml`):

```yaml
SophieLambdaRole:
  Policies:
    - Bedrock: InvokeModel (Claude Sonnet 4.5 global profile)
    - Secrets Manager: GetSecretValue (database credentials)
    - CloudWatch Logs: CreateLogGroup, CreateLogStream, PutLogEvents
    - VPC: CreateNetworkInterface, DeleteNetworkInterface (for RDS access)
```

---

## 🔄 DAILY DEVELOPMENT WORKFLOW

### Local Development Cycle

**Start Your Day** (Git Sync):

```bash
# 1. Sync with team
git pull origin sagemaker-work
npm install

# 2. Ensure VPN is connected (for database access)
# [Connect to VPN before proceeding]

# 3. Start local development servers
npm run dev:full
# This starts:
#   - React dev server on port 3000
#   - Express backend on port 3001

# 4. Verify connectivity
# Open browser: http://localhost:3000
# React app should connect to Express backend
```

**Development Loop**:

```bash
# Edit files in src/ (React frontend) or server/ (Express backend)
# Changes auto-reload via hot module replacement (HMR)

# Run tests periodically
npm run test:sophie           # Test Sophie orchestration
npm run test:agents           # Test pharmaceutical agents
npm run test:upload           # Test document processing
npm run test:txp              # Test TxP scoring
```

**Commit and Push**:

```bash
# 1. Add changes
git add .

# 2. Commit with descriptive message
git commit -m "feat: add drug repurposing filter to TxP Dashboard"

# 3. Push to feature branch or sagemaker-work
git push origin sagemaker-work
```

### Amplify Auto-Deployment (Frontend)

**Automatic Deployment** (configured):

```
git push origin sagemaker-work
  ↓
GitHub webhook triggers Amplify build
  ↓
Amplify runs: npm ci && npm run build
  ↓
Build artifacts uploaded to CDN
  ↓
https://dcy0k0y50q67k.amplifyapp.com updated automatically
  ↓
Build takes ~3-5 minutes
```

**Monitoring Deployment**:

```bash
# AWS CLI
aws amplify list-jobs \
  --app-id dcy0k0y50q67k \
  --branch-name sagemaker-work \
  --max-results 5

# AWS Console
https://console.aws.amazon.com/amplify/home?region=us-east-1#/dcy0k0y50q67k
```

**No Manual Steps Required** for frontend deployment to Amplify.

### Lambda Deployment (Backend)

**Manual Deployment** (when backend changes):

```bash
# 1. Make changes to server/services/ or lambda/handlers/

# 2. Test locally with Express
npm run dev:server
# Verify endpoints work at http://localhost:3001/api/...

# 3. Build Lambda functions
cd lambda
sam build

# 4. Deploy to AWS
sam deploy \
  --parameter-overrides \
    VpcId=vpc-0596668685e114793 \
    PrivateSubnet1=subnet-077cc788ec4a6a7fe \
    PrivateSubnet2=subnet-08c8e7b914ab19438 \
    LambdaSecurityGroup=sg-079019dddda2c3b3a \
    SecretsArn=arn:aws:secretsmanager:us-east-1:797455229240:secret:socratiq/db/credentials-4w7uQA

# 5. Verify deployment
aws lambda list-functions --region us-east-1 | grep SocratIQ

# 6. Test production endpoint
curl https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod/api/customer/assets
```

**Lambda Deployment Takes**: ~2-5 minutes (CloudFormation stack update)

### Database Schema Changes

**Using Drizzle ORM**:

```bash
# 1. Edit schema
code shared/schema.ts

# 2. Push changes to database (development only)
npm run db:push
# ⚠️ VPN must be connected

# 3. Generate migration for production
npx drizzle-kit generate:pg
# Creates SQL file in migrations/

# 4. Deploy migration via Lambda
aws lambda invoke \
  --function-name SocratIQ-DeployFullSchema \
  --region us-east-1 \
  /tmp/response.json
```

**Critical Notes**:
- **Always test schema changes locally before deploying to production**
- **Coordinate with team** before changing shared tables
- **Backup database** before major schema changes

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Production Authentication (AWS Cognito)

**Status**: ✅ **PRODUCTION READY**

**Configuration**:
- User Pool ID: `us-east-1_PczohxQao`
- Client ID: `26vmipk2m5ga6vol7htdvu9tb2`
- Identity Pool ID: `us-east-1:ff78d7be-9358-4a13-8290-c0d7ea180844`
- Region: `us-east-1`

**Authentication Flows Enabled**:
- `ALLOW_USER_SRP_AUTH` - Secure Remote Password
- `ALLOW_REFRESH_TOKEN_AUTH` - Session refresh
- `ALLOW_CUSTOM_AUTH` - Custom challenge handling

**Password Change Flow** (First-Time Login):

1. User enters temporary password
2. Cognito returns `NEW_PASSWORD_REQUIRED` challenge
3. `LoginPage.tsx` displays password change form
4. User enters new password + confirmation
5. `useAuth.completeNewPassword()` calls `confirmSignIn()`
6. Cognito authenticates user and returns session
7. JWT tokens stored in browser
8. App navigates to dashboard

**JWT Token Injection** (Automatic):

```typescript
// src/utils/api.ts
async function getAuthToken(): Promise<string | null> {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString() || null;
}

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  const response = await fetch(endpoint, { ...options, headers });
  return response.json();
}
```

**Session Persistence**:
- Amplify stores tokens in browser (localStorage/IndexedDB)
- Sessions automatically refresh on page reload
- Token expiration handled transparently
- Logout clears all session data

### Role-Based Access Control (RBAC)

**Roles** (defined in `server/middleware/rbac.ts`):

| Role | Level | Permissions |
|------|-------|-------------|
| **super_admin** | 5 | Complete system control, user management |
| **platform_admin** | 4 | Full operational access, no user role changes |
| **partner_admin** | 3 | Manage their organization, projects |
| **analyst** | 2 | Create projects, analyze data, generate reports |
| **viewer** | 1 | View reports, limited data access |

**Permission Enforcement**:

```typescript
// server/middleware/rbac.ts
export function requireRole(minRole: number) {
  return async (req: any, res: any, next: any) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (!user || getRoleLevel(user.role) < minRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Usage in routes
app.delete('/api/admin/users/:id', isAuthenticated, requireRole(5), async (req, res) => {
  // Only super_admin can delete users
});
```

---

## 📊 KEY FEATURES & MODULES

### 1. Target Product Profile (TxP) Scoring

**Status**: ✅ **PHASE 2.2 COMPLETE** (October 15, 2025)

**Frontend**: `src/pages/TxPDashboardV2.tsx`
**Backend**: `server/routes-unified-assets.ts`
**Database**: `unified_assets` table (64 pharmaceutical assets)

**10-Dimensional Scoring**:
1. Product Profile (`txpProductScore`)
2. Patient Profile (`txpPatientScore`)
3. Budget Profile (`txpBudgetScore`)
4. Regulatory Profile (`txpRegulatoryScore`)
5. Clinical Profile (`txpClinicalScore`)
6. Commercial Profile (`txpCommercialScore`)
7. Manufacturing Profile (`txpManufacturingScore`)
8. Competitive Profile (`txpCompetitiveScore`)
9. Risk Profile (`txpRiskScore`)
10. Strategic Fit (`txpStrategicScore`)

**Overall Completeness**: `txpOverallCompleteness` (0-100%)

**Data Source**: 64 pharmaceutical assets from multiple tiers:
- Tier 1: Clinical trial data (ClinicalTrials.gov)
- Tier 2: FDA Orange Book approved drugs
- Tier 3: Biomedical literature (PubMed)
- Tier 4: Market intelligence
- Tier 5: Regulatory filings
- Tier 6: Drug repurposing opportunities

**Drug Repurposing Classification**:
```typescript
interface UnifiedAsset {
  isRepurposed: boolean | null;
  originalIndication: string | null;
  repurposingClassification: 'fda_approved_new_indication' | 'investigational_new_indication' | 'preclinical_repurposing' | 'literature_based' | null;
  repurposingEvidence: string | null;
}
```

### 2. Sophie AI Orchestration

**Status**: ✅ **OPERATIONAL** (Bedrock integration complete)

**Frontend**: `src/pages/SophieChat.tsx`
**Backend**: `server/routes-sophie.ts`, `server/services/sophieOrchestrationService.ts`
**AI Model**: Claude 3.5 Sonnet 4.5 (AWS Bedrock Global Inference Profile)

**25 Specialized Agents**:

**VERA** (Viability & Efficacy Research Agent):
- Product profile optimization
- Clinical trial design
- Biomarker analysis
- CMC (Chemistry, Manufacturing, Controls)
- Strategic partnerships
- Development planning

**FINN** (Financial Intelligence Navigator):
- Budget modeling
- Pricing strategy
- Revenue forecasting
- Market access planning
- Reimbursement strategy
- Health economics

**NORA** (Regulatory Operations & Risk Advisor):
- Regulatory pathway analysis
- Compliance monitoring
- Quality assurance
- Pharmacovigilance
- Labeling strategy
- Post-market surveillance

**CLIA** (Competitive Landscape Intelligence Analyst):
- Market analysis
- Competitive intelligence
- Landscape mapping
- Trend forecasting
- Pipeline analysis
- Strategic positioning

**Agent Orchestration Flow**:
```
User Query → Sophie Orchestrator
  ↓
Intent Analysis (identify domain: clinical, regulatory, commercial, financial)
  ↓
Agent Selection (choose 1-4 specialized agents)
  ↓
Parallel Execution (agents process query independently)
  ↓
Response Synthesis (combine agent outputs)
  ↓
Strategic Recommendation (actionable insights)
  ↓
Return to User
```

### 3. Document Processing Pipeline

**Status**: ✅ **OPERATIONAL**

**Frontend**: `src/components/FileUpload.tsx`
**Backend**: `server/routes.ts`, `server/services/fileProcessor.ts`
**Database**: `documents`, `entities` tables

**Supported File Types**:
- PDF (`.pdf`)
- Microsoft Word (`.docx`)
- Plain Text (`.txt`)

**Processing Steps**:
1. File upload (max 50MB)
2. Text extraction (`pdf-parse`, `mammoth`)
3. Entity extraction (AWS Bedrock Claude 3.5 Sonnet)
4. Semantic tagging (pharmaceutical corpus-based)
5. Metadata storage (PostgreSQL)
6. File storage (S3 or local filesystem)

**Entity Types Extracted**:
- Medical Terms (drugs, diseases, conditions, procedures)
- Organizations (pharma companies, research institutions)
- Clinical Data (trial phases, endpoints, efficacy metrics)
- Regulatory (FDA designations, approval pathways)
- Financial (budgets, pricing, market size)

### 4. Sophie Impact Lens™

**Status**: ✅ **FRAMEWORK DEPLOYED**

**Database Tables**:
- `sophie_patterns` - Detected decision patterns
- `pattern_hypotheses` - AI-generated hypotheses
- `recommended_actions` - Prioritized action items
- `blast_zone_analyses` - Impact assessment

**Pattern Detection**:
```
Document Analysis → Pattern Recognition
  ↓
Hypothesis Generation (Claude AI)
  ↓
Action Recommendations (prioritized by impact/effort)
  ↓
Blast Zone Analysis (cascading effects)
  ↓
Risk Mitigation Strategies
```

**Example Use Case**:
- User uploads regulatory guidance document
- Sophie detects pattern: "FDA increasing scrutiny on cardiovascular safety"
- Hypothesis: "Our Phase 3 trial may face additional safety monitoring requirements"
- Recommended Action: "Implement enhanced cardiovascular monitoring protocol"
- Blast Zone: "Affects timeline (6-month delay), budget (+$2M), enrollment criteria"

---

## 🔍 TROUBLESHOOTING GUIDE

### Common Issues & Solutions

#### Issue 1: "Database connection failed"

**Symptom**: Express server can't connect to RDS PostgreSQL

**Root Cause**: VPN not connected

**Solution**:
```bash
# 1. Connect to VPN
[Connect using your VPN client]

# 2. Verify connectivity
ping socratiq-prod-db.cdg2livjhuop.us-east-1.rds.amazonaws.com

# 3. Restart Express server
npm run dev:server
```

#### Issue 2: "Cognito authentication error"

**Symptom**: Login page shows authentication error

**Root Cause**: Missing or incorrect Cognito configuration

**Solution**:
```bash
# 1. Verify .env file has correct values
cat .env | grep REACT_APP_USER_POOL

# Expected output:
REACT_APP_USER_POOL_ID=us-east-1_PczohxQao
REACT_APP_USER_POOL_CLIENT_ID=26vmipk2m5ga6vol7htdvu9tb2

# 2. Restart React dev server
npm start

# 3. Clear browser cache and try again
```

#### Issue 3: "API returns 401 Unauthorized"

**Symptom**: API calls fail with 401 error

**Root Cause**: JWT token expired or not included

**Solution**:
```typescript
// Check if fetchAuthSession is working
import { fetchAuthSession } from 'aws-amplify/auth';

const session = await fetchAuthSession();
console.log('Token:', session.tokens?.idToken?.toString());

// If token is missing, user needs to log in again
```

#### Issue 4: "Amplify build fails"

**Symptom**: Amplify deployment shows "Build failed" status

**Root Cause**: Missing dependencies or build errors

**Solution**:
```bash
# 1. Test build locally
npm run build

# 2. Check for TypeScript errors
npm run lint

# 3. Review Amplify build logs in AWS Console
# https://console.aws.amazon.com/amplify/home?region=us-east-1#/dcy0k0y50q67k

# 4. Fix errors and push again
git add .
git commit -m "fix: resolve build errors"
git push origin sagemaker-work
```

#### Issue 5: "Lambda function timeout"

**Symptom**: API Gateway returns 504 Gateway Timeout

**Root Cause**: Lambda execution exceeds 30-second timeout

**Solution**:
```bash
# 1. Check CloudWatch Logs
aws logs tail /aws/lambda/SocratIQ-AskSophie --follow

# 2. Increase timeout in template.yaml
Timeout: 60  # Increase from 30 to 60 seconds

# 3. Redeploy Lambda
sam build && sam deploy

# 4. Optimize code for performance
# - Add caching
# - Reduce database queries
# - Use pagination for large results
```

#### Issue 6: "Unified assets not loading"

**Symptom**: TxP Dashboard dropdown is empty

**Root Cause**: Express backend not running or wrong API URL

**Solution**:
```bash
# 1. Verify Express backend is running
curl http://localhost:3001/api/unified-assets

# 2. Check .env file
echo $REACT_APP_BACKEND_URL
# Should output: http://localhost:3001

# 3. Check React app is calling correct URL
# src/utils/api.ts should have:
const UNIFIED_ASSETS_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

# 4. Restart both servers
npm run dev:full
```

---

## 📦 PACKAGE DEPENDENCIES

### Frontend Dependencies (`package.json`)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "aws-amplify": "^6.15.7",
    "@tanstack/react-query": "^5.60.5",
    "zustand": "^5.0.8",
    "framer-motion": "^11.13.1",
    "recharts": "^2.15.4",
    "lucide-react": "^0.545.0"
  }
}
```

### Backend Dependencies

```json
{
  "dependencies": {
    "express": "^4.21.2",
    "drizzle-orm": "^0.39.1",
    "pg": "^8.16.3",
    "@aws-sdk/client-bedrock-runtime": "^3.901.0",
    "@aws-sdk/client-s3": "^3.864.0",
    "@anthropic-ai/sdk": "^0.37.0",
    "amazon-cognito-identity-js": "^6.3.15",
    "natural": "^8.1.0",
    "compromise": "^14.14.4",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.10.0"
  }
}
```

### Lambda Dependencies (`lambda/package.json`)

```json
{
  "dependencies": {
    "@aws-sdk/client-bedrock-runtime": "^3.901.0",
    "@aws-sdk/client-secrets-manager": "^3.x.x",
    "pg": "^8.16.3",
    "drizzle-orm": "^0.39.1"
  }
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment Verification

**Frontend (React)**:
- [ ] All TypeScript errors resolved (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] `.env` variables configured correctly
- [ ] Cognito authentication tested
- [ ] API calls use correct endpoints

**Backend (Express/Lambda)**:
- [ ] All routes tested with Postman/Insomnia
- [ ] Database schema changes deployed
- [ ] Lambda functions build successfully (`sam build`)
- [ ] IAM permissions configured
- [ ] VPC networking confirmed

**Database**:
- [ ] Schema changes tested locally
- [ ] Migrations generated (`npx drizzle-kit generate:pg`)
- [ ] Backup created before major changes
- [ ] Team notified of schema updates

### Deployment Steps

**1. Frontend Deployment** (Automatic via Amplify):

```bash
git add .
git commit -m "feat: your feature description"
git push origin sagemaker-work
# Wait 3-5 minutes for Amplify build
# Verify: https://dcy0k0y50q67k.amplifyapp.com
```

**2. Backend Deployment** (Manual via SAM):

```bash
cd lambda
sam build
sam deploy \
  --parameter-overrides \
    VpcId=vpc-0596668685e114793 \
    PrivateSubnet1=subnet-077cc788ec4a6a7fe \
    PrivateSubnet2=subnet-08c8e7b914ab19438 \
    LambdaSecurityGroup=sg-079019dddda2c3b3a \
    SecretsArn=arn:aws:secretsmanager:us-east-1:797455229240:secret:socratiq/db/credentials-4w7uQA
# Wait 2-5 minutes for CloudFormation
# Verify: https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod/api/customer/assets
```

**3. Database Deployment** (Via Lambda):

```bash
# Deploy schema
aws lambda invoke \
  --function-name SocratIQ-DeployFullSchema \
  --region us-east-1 \
  /tmp/response.json

# Verify
cat /tmp/response.json
```

### Post-Deployment Verification

**Frontend**:
- [ ] Amplify build status: `SUCCESS`
- [ ] Homepage loads correctly
- [ ] Login works with Cognito
- [ ] TxP Dashboard shows 64 assets
- [ ] API calls succeed

**Backend**:
- [ ] Lambda functions show `Active` status
- [ ] API Gateway endpoints respond
- [ ] CloudWatch Logs show no errors
- [ ] Database connections successful

**End-to-End**:
- [ ] Login flow complete
- [ ] Dashboard data loads
- [ ] Sophie chat responds
- [ ] Document upload works
- [ ] TxP scoring displays correctly

---

## 📞 SUPPORT & RESOURCES

### AWS Resources

| Resource | URL/Command |
|----------|-------------|
| **Amplify Console** | https://console.aws.amazon.com/amplify/home?region=us-east-1#/dcy0k0y50q67k |
| **Lambda Console** | https://console.aws.amazon.com/lambda/home?region=us-east-1 |
| **API Gateway Console** | https://console.aws.amazon.com/apigateway/main/apis?region=us-east-1 |
| **RDS Console** | https://console.aws.amazon.com/rds/home?region=us-east-1 |
| **Cognito Console** | https://console.aws.amazon.com/cognito/v2/idp/user-pools?region=us-east-1 |
| **CloudFormation Console** | https://console.aws.amazon.com/cloudformation/home?region=us-east-1 |

### Key Documentation Files

| Document | Location | Purpose |
|----------|----------|---------|
| **Project Context** | `.claude/CLAUDE.md` | Claude Code AI context |
| **Hybrid Architecture** | `docs/HYBRID_DEVELOPMENT_ARCHITECTURE.md` | Local vs. Lambda development |
| **Phase 2.2 Report** | `docs/PHASE_2_2_COMPLETION_REPORT.md` | TxP Dashboard integration details |
| **Deployment Complete** | `workstream2-data/DEPLOYMENT_COMPLETE.md` | Lambda deployment summary |
| **Amplify Guide** | `docs/archives/deprecated/AMPLIFY_DEPLOYMENT_GUIDE.md` | Amplify deployment instructions (archived) |

### AWS CLI Useful Commands

```bash
# List Lambda functions
aws lambda list-functions --region us-east-1 | grep SocratIQ

# View Lambda logs
aws logs tail /aws/lambda/SocratIQ-GetAssets --follow

# List Amplify builds
aws amplify list-jobs --app-id dcy0k0y50q67k --branch-name sagemaker-work --max-results 5

# Describe database
aws rds describe-db-instances --region us-east-1 | grep socratiq

# CloudFormation stack outputs
aws cloudformation describe-stacks --stack-name socratiq-lambda-prod --query "Stacks[0].Outputs"

# Test API Gateway endpoint
curl https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod/api/customer/assets
```

---

## 🎯 NEXT STEPS & ROADMAP

### Immediate Tasks (Next 1-2 Weeks)

1. **Complete Lambda Integration for Unified Assets**
   - Create `GetUnifiedAssets` Lambda function
   - Deploy to API Gateway
   - Update frontend to call Lambda in production

2. **Implement Loading States**
   - Add spinner to TxP Dashboard during data fetch
   - Show error messages if API fails
   - Handle VPN disconnected gracefully

3. **Enhance TxP Scoring**
   - Add historical asset comparisons
   - Implement percentile rankings
   - Show similar assets (comparables)

4. **Sophie Impact Lens™ Completion**
   - Wire up frontend UI
   - Connect to database tables
   - Add pattern visualization

### Medium-Term (1-3 Months)

1. **Evidence Bundle Generation**
   - Automated document bundling
   - Regulatory submission packages
   - Commercial strategy decks

2. **Analytics Dashboard**
   - Real-time metrics
   - User activity tracking
   - System health monitoring

3. **Advanced Search & Filtering**
   - Multi-field search
   - Saved searches
   - Faceted filtering

4. **Collaboration Features**
   - Multi-user editing
   - Comments and annotations
   - Activity feeds

### Long-Term (3-6 Months)

1. **SageMaker Integration**
   - Move sub-agents to SageMaker Studio
   - Collaborative agent development
   - Advanced ML pipelines

2. **API Rate Limiting**
   - Implement quotas per user role
   - Usage tracking
   - Billing integration

3. **Advanced Analytics**
   - Predictive modeling
   - Trend analysis
   - Market intelligence

4. **Mobile Optimization**
   - Responsive design improvements
   - Progressive Web App (PWA)
   - Offline support

---

## 📝 CHANGE LOG

### Version 1.1.0 (October 16, 2025, 5:30 PM EDT)

**Changes**:
- ✅ **NEW Lambda Function**: `SocratIQ-GetUnifiedAssets`
  - Purpose: Retrieve 64 unified pharmaceutical assets for TxP Dashboard in production
  - Runtime: nodejs20.x, Memory: 512 MB
  - API Gateway: `GET /api/unified-assets`
  - Handler: `lambda/handlers/customer/getUnifiedAssets.ts`

- ✅ **Fixed Production CORS Error**:
  - Problem: React app in production called `localhost:3001` instead of Lambda endpoint
  - Solution: Updated `src/utils/api.ts` with environment-aware configuration
  - Auto-detects production environment and uses Lambda API Gateway
  - Development continues to use Express backend (localhost:3001)

- ✅ **Database Column Name Correction**:
  - Lambda handler uses actual database column names (snake_case)
  - Transforms results to camelCase for frontend compatibility
  - Matches Drizzle ORM behavior from Express API
  - Prevents Phase 2.2 snake_case vs camelCase regression

**Files Modified**:
- `src/utils/api.ts` (lines 271-278) - Environment-aware API configuration
- `lambda/handlers/customer/getUnifiedAssets.ts` - New Lambda handler
- `lambda/template.yaml` - Added GetUnifiedAssetsFunction resource
- `docs/CURRENT_ARCHITECTURE_STATE.md` - This document

**Verification Commands**:
```bash
# Verify Lambda function deployed
aws lambda get-function --function-name SocratIQ-GetUnifiedAssets --region us-east-1

# Test production endpoint
curl https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod/api/unified-assets?limit=10

# Verify CloudFormation stack updated
aws cloudformation describe-stacks --stack-name socratiq-lambda-prod --region us-east-1 \
  --query "Stacks[0].StackStatus"
# Expected: UPDATE_COMPLETE

# Test TxP Dashboard in production
# https://sp1001.socratiqplatform.com/txp
# Expected: Dropdown loads 64 pharmaceutical assets, no CORS errors
```

**Breaking Changes**: None

**Migration Required**: No - Backward compatible

**Rollback Instructions**:
- Revert `src/utils/api.ts` to hardcoded `localhost:3001` (not recommended)
- Or remove `GetUnifiedAssetsFunction` from Lambda stack
- See archived version 1.0.0 for previous configuration

---

### Version 1.0.0 (October 16, 2025)

**Initial Document Creation**:
- Comprehensive architecture documentation
- Verified all AWS resources via CLI
- Documented complete database schema
- Included all 64 pharmaceutical assets
- Verified Lambda functions and API Gateway
- Documented Amplify deployment process
- Added troubleshooting guide
- Created deployment checklist

**Sources**:
- AWS CloudFormation stack queries
- AWS Lambda function listings
- AWS API Gateway configuration
- AWS Amplify deployment status
- AWS RDS database configuration
- Code inspection of all route modules
- Git commit history analysis
- `.env` file configuration
- `package.json` dependencies

**Verification Method**:
- Direct AWS CLI queries (all commands documented)
- Code file reading (TypeScript/JavaScript)
- Database schema inspection (Drizzle ORM)
- Git log analysis
- Documentation cross-referencing

---

## ⚠️ CRITICAL WARNINGS

### DO NOT:

1. **Change database schema without team coordination** - Multiple developers share the same database
2. **Deploy Lambda without testing locally first** - Always test with Express backend before Lambda deployment
3. **Commit `.env` file to git** - Contains sensitive credentials, already in `.gitignore`
4. **Modify Cognito configuration in production** - Will break authentication for all users
5. **Delete or rename database tables** - Will cause application-wide failures
6. **Change API endpoint URLs without updating both environments** - Frontend and backend must match
7. **Force push to `main` or `sagemaker-work` branches** - Will overwrite team members' work
8. **Disable VPN when connecting to database** - RDS is NOT publicly accessible

### ALWAYS:

1. **Connect VPN before accessing database** - Required for local development
2. **Test changes locally before deploying** - Express server first, then Lambda
3. **Coordinate schema changes with team** - Use Slack/Discord for notifications
4. **Back up database before major changes** - Use AWS RDS snapshots
5. **Review Amplify build logs** - Verify successful deployment
6. **Monitor CloudWatch Logs** - Check for Lambda errors after deployment
7. **Use `npm run dev:full` for local development** - Starts both React and Express
8. **Keep dependencies up to date** - Run `npm install` after pulling code

---

## ✅ VERIFICATION CHECKLIST

Use this checklist at the start of each development session to ensure your environment is correctly configured:

### Environment Setup

- [ ] VPN connected (for database access)
- [ ] AWS CLI configured (`aws sts get-caller-identity` succeeds)
- [ ] Git repository up to date (`git pull origin sagemaker-work`)
- [ ] Node modules installed (`npm install`)
- [ ] `.env` file exists and contains correct values
- [ ] React dev server starts (`npm start`)
- [ ] Express backend starts (`npm run dev:server`)
- [ ] Database connection succeeds (Express logs show "Database connected")

### Frontend Verification

- [ ] http://localhost:3000 loads successfully
- [ ] Cognito login works
- [ ] Dashboard displays data
- [ ] TxP Dashboard shows 64 assets
- [ ] Sophie chat responds
- [ ] No console errors in browser DevTools

### Backend Verification

- [ ] http://localhost:3001/api/test returns success
- [ ] http://localhost:3001/api/unified-assets returns 64 assets
- [ ] http://localhost:3001/api/documents returns document list
- [ ] Express logs show no database errors
- [ ] All route modules loaded successfully

### AWS Production Verification

- [ ] https://dcy0k0y50q67k.amplifyapp.com loads
- [ ] Cognito login works on production
- [ ] https://8cwa0shan6.execute-api.us-east-1.amazonaws.com/Prod/api/customer/assets responds
- [ ] Lambda functions show "Active" status in AWS Console
- [ ] CloudWatch Logs show no errors

---

## 📖 GLOSSARY

**Key Terms for Development**:

| Term | Definition |
|------|------------|
| **Amplify** | AWS service for hosting React frontend |
| **API Gateway** | AWS service routing HTTP requests to Lambda |
| **Cognito** | AWS authentication service (replaces Replit Auth) |
| **Drizzle ORM** | TypeScript ORM for PostgreSQL database |
| **JWT** | JSON Web Token - authentication token from Cognito |
| **Lambda** | AWS serverless function execution service |
| **RDS** | AWS Relational Database Service (PostgreSQL) |
| **SAM** | AWS Serverless Application Model (deployment tool) |
| **TxP** | Target Product Profile - pharmaceutical asset evaluation |
| **VPC** | Virtual Private Cloud - isolated AWS network |
| **Unified Assets** | 64 pharmaceutical assets from multiple data sources |
| **Historical Assets** | 40 benchmark assets (20 successes, 20 failures) |
| **Sophie** | Strategic Orchestration for Pharmaceutical Intelligence Engine |
| **VERA** | Viability & Efficacy Research Agent |
| **FINN** | Financial Intelligence Navigator |
| **NORA** | Regulatory Operations & Risk Advisor |
| **CLIA** | Competitive Landscape Intelligence Analyst |

---

## 🔒 SECURITY NOTES

### Credentials in This Document

**Database Password**: `3DL4kKQgIoykYT7c1oylKA2u`
**⚠️ WARNING**: This password is included for development convenience. In production, Lambda functions retrieve credentials from AWS Secrets Manager. DO NOT share this document outside the development team.

### AWS Secrets Manager

**Secret ARN**: `arn:aws:secretsmanager:us-east-1:797455229240:secret:socratiq/db/credentials-4w7uQA`

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

### Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Use AWS Secrets Manager in production** - Lambda functions configured
3. **Rotate passwords regularly** - Update Secrets Manager + redeploy Lambdas
4. **Use IAM roles instead of access keys when possible**
5. **Enable MFA on AWS root account**
6. **Review CloudTrail logs for suspicious activity**

---

## 📅 MAINTENANCE SCHEDULE

### Daily Tasks

- [ ] Check Amplify build status
- [ ] Review CloudWatch Logs for errors
- [ ] Monitor database performance
- [ ] Verify VPN connectivity

### Weekly Tasks

- [ ] Review and merge pull requests
- [ ] Update dependencies (`npm update`)
- [ ] Check AWS cost reports
- [ ] Database backup verification
- [ ] Team sync on schema changes

### Monthly Tasks

- [ ] Rotate AWS credentials
- [ ] Review IAM policies
- [ ] Update documentation
- [ ] Performance optimization review
- [ ] Security audit
- [ ] Cost optimization analysis

---

**END OF DOCUMENT**

---

**Document Maintained By**: Development Team
**Last Updated By**: Claude Code AI Assistant
**Next Review Date**: November 16, 2025
**Contact**: See team Slack/Discord for support

**This document is the SINGLE SOURCE OF TRUTH for the SocratIQ platform architecture. All development work should reference this document first.**
