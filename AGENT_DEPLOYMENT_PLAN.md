# SocratIQ Multi-Agent System - Deployment Plan

**Created**: October 22, 2025
**Status**: Ready for Implementation
**Estimated Effort**: 40-60 hours (6-day dual-team sprint as per PRD)

---

## Executive Summary

This document outlines the complete deployment plan for the SocratIQ multi-agent collaboration system, transforming the current Level 0 generic AI assistant into a production-grade pharmaceutical intelligence platform with specialized agents.

### What's Been Completed

✅ **Infrastructure Foundation** (Oct 8-9, 2025):
- AWS VPC, RDS PostgreSQL, API Gateway, Lambda functions deployed
- Database schema with 64 unified pharmaceutical assets
- Cognito authentication, Secrets Manager
- 5 S3 corpus buckets with legal compliance framework

✅ **Agent Framework Definition** (Oct 9-22, 2025):
- 5 agent skills documents (133 pages total)
- System prompts for all agents and sub-agents
- Corpus cross-reference documents (36 sources mapped)
- Legal review of 52 best practice sources

✅ **Architecture Design** (Oct 22, 2025):
- Multi-agent collaboration architecture
- Lambda function specifications
- CloudFormation template for agent deployment
- IAM roles and permissions

### What Needs to Be Built

🎯 **Implementation Phase** (Next 6 days):
1. Lambda function code for 4 domain agents (VERA, FINN, NORA, CLIA)
2. Sophie orchestrator with multi-agent coordination
3. Shared utilities library (corpus retrieval, Bedrock invocation)
4. Deployment automation and testing framework

---

## Architecture Overview

### System Components

```
User → API Gateway → Sophie Orchestrator
                          ↓
                   (Analyzes query)
                          ↓
            ┌─────────────┼─────────────┐
            ↓             ↓             ↓             ↓
         VERA          FINN          NORA         CLIA
    (Product/Clinical) (Financial) (Regulatory) (Market/Trials)
            ↓             ↓             ↓             ↓
       S3 Corpus     S3 Corpus     S3 Corpus    S3 Corpus
            ↓             ↓             ↓             ↓
    AWS Bedrock   AWS Bedrock   AWS Bedrock  AWS Bedrock
  (Claude 3.5)   (Claude 3.5)  (Claude 3.5) (Claude 3.5)
            ↓             ↓             ↓             ↓
            └─────────────┼─────────────┘
                          ↓
                  Sophie Synthesis
                 (Tri-Paradigm Reasoning)
                          ↓
                    User Response
```

### Lambda Functions to Deploy

| Function | Purpose | Memory | Timeout | Dependencies |
|----------|---------|--------|---------|--------------|
| **Sophie-Orchestrator** | User-facing orchestration | 2048MB | 300s | All agent ARNs, DB access |
| **VERA-Agent** | Product/clinical intelligence | 1024MB | 180s | S3 corpus, Bedrock |
| **FINN-Agent** | Financial intelligence | 1024MB | 180s | S3 corpus, Bedrock |
| **NORA-Agent** | Regulatory/legal intelligence | 1024MB | 180s | S3 corpus, Bedrock |
| **CLIA-Agent** | Market/trial intelligence | 1024MB | 180s | S3 corpus, Bedrock |

---

## Implementation Plan

### Phase 1: Shared Utilities Library (Day 1 - 8 hours)

**Purpose**: Reusable code for all agents

**Files to Create**:
- `lambda/shared/corpus-retrieval.ts` - S3 corpus document retrieval
- `lambda/shared/bedrock-client.ts` - AWS Bedrock Claude invocation
- `lambda/shared/agent-prompts.ts` - System prompts for all agents
- `lambda/shared/types.ts` - TypeScript interfaces
- `lambda/shared/utils.ts` - Helper functions

**Key Functions**:
```typescript
// corpus-retrieval.ts
export async function retrieveFromCorpus(params: {
  bucket: string;
  query: string;
  subAgent?: string;
  maxResults?: number;
}): Promise<CorpusDocument[]>;

// bedrock-client.ts
export async function invokeClaude(params: {
  systemPrompt: string;
  userMessage: string;
  corpusContext?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<ClaudeResponse>;

// agent-prompts.ts
export const AGENT_SYSTEM_PROMPTS: {
  VERA: Record<string, string>;
  FINN: Record<string, string>;
  NORA: Record<string, string>;
  CLIA: Record<string, string>;
  Sophie: string;
};
```

**Dependencies**:
```json
{
  "@aws-sdk/client-s3": "^3.x",
  "@aws-sdk/client-bedrock-runtime": "^3.x",
  "@aws-sdk/client-lambda": "^3.x",
  "@aws-sdk/client-secrets-manager": "^3.x"
}
```

---

### Phase 2: Domain Agent Implementation (Days 2-3 - 16 hours)

**Purpose**: Implement VERA, FINN, NORA, CLIA agents

**Template Structure** (same for all 4 agents):
```typescript
// lambda/agents/vera/index.ts
import { retrieveFromCorpus } from '../../shared/corpus-retrieval';
import { invokeClaude } from '../../shared/bedrock-client';
import { AGENT_SYSTEM_PROMPTS } from '../../shared/agent-prompts';

export async function handler(event: any) {
  const { query, assetContext, subAgent, metadata } = JSON.parse(event.body || event);

  // 1. Determine sub-agent (e.g., VERA-Product, VERA-Clinical)
  const selectedSubAgent = subAgent || detectSubAgent(query);

  // 2. Retrieve corpus documents
  const corpusDocs = await retrieveFromCorpus({
    bucket: process.env.CORPUS_BUCKET!,
    query,
    subAgent: selectedSubAgent,
    maxResults: 5
  });

  // 3. Build context from corpus
  const corpusContext = corpusDocs
    .map(doc => `Source: ${doc.title}\n${doc.excerpt}`)
    .join('\n\n---\n\n');

  // 4. Build user message with asset context
  const userMessage = buildUserMessage(query, assetContext);

  // 5. Invoke Bedrock Claude
  const response = await invokeClaude({
    systemPrompt: AGENT_SYSTEM_PROMPTS.VERA[selectedSubAgent],
    userMessage,
    corpusContext,
    maxTokens: 4096,
    temperature: 0.1
  });

  // 6. Return structured response
  return {
    statusCode: 200,
    body: JSON.stringify({
      agent: 'VERA',
      subAgent: selectedSubAgent,
      response: response.content,
      sources: corpusDocs.map(d => ({ title: d.title, url: d.url })),
      confidence: response.confidence,
      timestamp: new Date().toISOString()
    })
  };
}

function detectSubAgent(query: string): string {
  // Simple keyword matching (can enhance with ML later)
  const keywords = {
    'VERA-Product': ['product', 'positioning', 'differentiation', 'formulation'],
    'VERA-Clinical': ['trial', 'protocol', 'enrollment', 'endpoint', 'phase'],
    'VERA-Biomarker': ['biomarker', 'diagnostic', 'companion', 'cdx'],
    'VERA-CMC': ['manufacturing', 'cmc', 'scale-up', 'supply chain'],
    'VERA-Strategic': ['partnership', 'licensing', 'alliance', 'deal'],
    'VERA-Development': ['crada', 'federal', 'sbir', 'sttr', 'government']
  };

  for (const [subAgent, words] of Object.entries(keywords)) {
    if (words.some(word => query.toLowerCase().includes(word))) {
      return subAgent;
    }
  }

  return 'VERA-Product'; // Default
}

function buildUserMessage(query: string, assetContext?: any): string {
  let message = `User Query: ${query}\n\n`;

  if (assetContext) {
    message += `Asset Context:\n`;
    message += `- Name: ${assetContext.productName}\n`;
    message += `- Indication: ${assetContext.indication}\n`;
    message += `- Development Stage: ${assetContext.developmentPhase}\n`;
    message += `- Mechanism: ${assetContext.mechanismOfAction}\n\n`;
  }

  message += `Provide a detailed, evidence-based response using corpus sources. Always cite sources.`;

  return message;
}
```

**Deployment**:
- Package each agent as separate .zip file
- Upload to S3 bucket `socratiq-lambda-code-prod/agents/`
- CloudFormation references these .zip files

---

### Phase 3: Sophie Orchestrator (Days 4-5 - 16 hours)

**Purpose**: Coordinate multi-agent responses with tri-paradigm reasoning

**Key Components**:

#### 1. Query Classification
```typescript
async function classifyQuery(message: string, assetId?: string): Promise<AgentPlan> {
  // Use Claude to determine which agents to invoke
  const classificationPrompt = `
    Analyze this user query and determine which SocratIQ agents should respond:
    - VERA (product/clinical questions)
    - FINN (financial/budget/valuation questions)
    - NORA (regulatory/legal/IP questions)
    - CLIA (market/trial/competitive questions)

    User query: "${message}"

    Return JSON: {
      "agents": ["VERA", "FINN"],
      "invocationPattern": "parallel|sequential",
      "reasoning": "Why these agents?"
    }
  `;

  const response = await invokeClaude({
    systemPrompt: 'You are a query router for pharmaceutical intelligence agents.',
    userMessage: classificationPrompt,
    maxTokens: 500,
    temperature: 0
  });

  return JSON.parse(response.content);
}
```

#### 2. Agent Invocation
```typescript
async function invokeAgents(
  plan: AgentPlan,
  context: { message: string; asset?: any }
): Promise<AgentResponse[]> {
  const lambdaArns = {
    VERA: process.env.VERA_LAMBDA_ARN!,
    FINN: process.env.FINN_LAMBDA_ARN!,
    NORA: process.env.NORA_LAMBDA_ARN!,
    CLIA: process.env.CLIA_LAMBDA_ARN!
  };

  if (plan.invocationPattern === 'parallel') {
    // Invoke all agents simultaneously
    const invocations = plan.agents.map(agent =>
      lambdaClient.send(new InvokeCommand({
        FunctionName: lambdaArns[agent],
        Payload: JSON.stringify(context)
      }))
    );

    const results = await Promise.all(invocations);
    return results.map(r => JSON.parse(new TextDecoder().decode(r.Payload)));
  } else {
    // Sequential invocation (agent B uses agent A's output)
    const responses: AgentResponse[] = [];
    let enrichedContext = { ...context };

    for (const agent of plan.agents) {
      const result = await lambdaClient.send(new InvokeCommand({
        FunctionName: lambdaArns[agent],
        Payload: JSON.stringify({
          ...enrichedContext,
          previousResponses: responses
        })
      }));

      const response = JSON.parse(new TextDecoder().decode(result.Payload));
      responses.push(response);

      // Enrich context for next agent
      enrichedContext = {
        ...enrichedContext,
        [agent.toLowerCase() + 'Analysis']: response.response
      };
    }

    return responses;
  }
}
```

#### 3. Sophie Tri-Paradigm Synthesis
```typescript
async function synthesizeResponses(params: {
  userQuery: string;
  agentResponses: AgentResponse[];
}): Promise<SophieSynthesis> {
  const synthesisPrompt = `
    You are Sophie, the strategic orchestrator for SocratIQ pharmaceutical intelligence.

    User asked: "${params.userQuery}"

    Agent responses:
    ${params.agentResponses.map(r => `
      ${r.agent}: ${r.response}
      Sources: ${r.sources.map(s => s.title).join(', ')}
    `).join('\n\n')}

    Synthesize using SophieLogic™ tri-paradigm reasoning:

    1. MECHANISTIC (Hard Constraints):
       - Check for blockers: cash runway < 18 months? Regulatory violations?
       - If constraint violated: STOP and recommend fix

    2. DETERMINISTIC (Scenario Scoring):
       - Score 3-5 strategic options based on agent inputs
       - Use explicit criteria (financial ROI, regulatory feasibility, market size)

    3. PROBABILISTIC (Risk Adjustment):
       - Apply confidence intervals to recommendations
       - Quantify uncertainty (e.g., "60-80% probability of success")

    Output clear recommendation with:
    - Executive summary (2-3 sentences)
    - Reasoning by paradigm
    - Source citations from all agents
    - Confidence level
    - Any agent conflicts and how you resolved them
  `;

  const response = await invokeClaude({
    systemPrompt: AGENT_SYSTEM_PROMPTS.Sophie,
    userMessage: synthesisPrompt,
    maxTokens: 8192,
    temperature: 0.2
  });

  return {
    recommendation: response.content,
    confidence: extractConfidence(response.content),
    sources: aggregateSources(params.agentResponses),
    traceId: generateTraceId()
  };
}
```

---

### Phase 4: Deployment & Testing (Day 6 - 8 hours)

#### 4.1 Package Lambda Functions
```bash
# Shared layer
cd lambda/shared
npm install
zip -r ../../agent-shared-layer.zip .

# Each agent
cd ../agents/vera
npm install
zip -r ../../../vera-agent.zip .

cd ../finn
npm install
zip -r ../../../finn-agent.zip .

cd ../nora
npm install
zip -r ../../../nora-agent.zip .

cd ../clia
npm install
zip -r ../../../clia-agent.zip .

cd ../sophie
npm install
zip -r ../../../sophie-orchestrator.zip .
```

#### 4.2 Upload to S3
```bash
aws s3 mb s3://socratiq-lambda-code-prod
aws s3 cp agent-shared-layer.zip s3://socratiq-lambda-code-prod/layers/
aws s3 cp vera-agent.zip s3://socratiq-lambda-code-prod/agents/
aws s3 cp finn-agent.zip s3://socratiq-lambda-code-prod/agents/
aws s3 cp nora-agent.zip s3://socratiq-lambda-code-prod/agents/
aws s3 cp clia-agent.zip s3://socratiq-lambda-code-prod/agents/
aws s3 cp sophie-orchestrator.zip s3://socratiq-lambda-code-prod/agents/
```

#### 4.3 Deploy CloudFormation Stack
```bash
cd infrastructure/lambda
aws cloudformation create-stack \
  --stack-name socratiq-agent-lambdas-prod \
  --template-body file://agent-lambdas.yaml \
  --parameters ParameterKey=Environment,ParameterValue=prod \
  --capabilities CAPABILITY_NAMED_IAM
```

#### 4.4 Test Each Agent
```typescript
// Test VERA
const veraTest = {
  query: "What's the best enrollment strategy for a Phase 3 oncology trial?",
  assetContext: { indication: "NSCLC", developmentPhase: "Phase 3" }
};

// Test FINN
const finnTest = {
  query: "What's the rNPV valuation for a Phase 2 rare disease asset with $500M peak sales?",
  assetContext: { developmentPhase: "Phase 2", peakSales: 500000000 }
};

// Test NORA
const noraTest = {
  query: "Should we pursue 505(b)(2) or BLA pathway for our reformulated drug?",
  assetContext: { productType: "Reformulation" }
};

// Test CLIA
const cliaTest = {
  query: "What's the competitive landscape for JAK inhibitors in rheumatoid arthritis?",
  assetContext: { indication: "Rheumatoid Arthritis", mechanismOfAction: "JAK inhibitor" }
};

// Test Sophie multi-agent
const sophieTest = {
  message: "Should I pursue a CRADA with the NIH for my federal lab technology?",
  assetId: "asset-123"
};
```

---

## File Structure

```
SocratIQAgents/
├── infrastructure/
│   └── lambda/
│       ├── MULTI_AGENT_ARCHITECTURE.md (✅ Created)
│       ├── agent-lambdas.yaml (✅ Created - CloudFormation)
│       └── deploy-agents.sh (TODO)
├── lambda/
│   ├── shared/ (TODO - Day 1)
│   │   ├── package.json
│   │   ├── corpus-retrieval.ts
│   │   ├── bedrock-client.ts
│   │   ├── agent-prompts.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   └── agents/
│       ├── vera/ (TODO - Day 2)
│       │   ├── package.json
│       │   └── index.ts
│       ├── finn/ (TODO - Day 2)
│       │   ├── package.json
│       │   └── index.ts
│       ├── nora/ (TODO - Day 3)
│       │   ├── package.json
│       │   └── index.ts
│       ├── clia/ (TODO - Day 3)
│       │   ├── package.json
│       │   └── index.ts
│       └── sophie/ (TODO - Days 4-5)
│           ├── package.json
│           └── index.ts
├── tests/ (TODO - Day 6)
│   ├── vera.test.ts
│   ├── finn.test.ts
│   ├── nora.test.ts
│   ├── clia.test.ts
│   └── sophie.test.ts
└── AGENT_DEPLOYMENT_PLAN.md (✅ This document)
```

---

## Success Criteria

### Functional Requirements
- [  ] Each agent successfully retrieves from its S3 corpus
- [  ] Each agent invokes Bedrock Claude 3.5 Sonnet correctly
- [  ] Each agent cites sources in responses
- [  ] Sophie successfully invokes domain agents (parallel and sequential)
- [  ] Sophie tri-paradigm synthesis produces coherent recommendations
- [  ] All responses include confidence levels

### Performance Requirements
- [  ] Single agent response: < 5 seconds
- [  ] Multi-agent response (2-3 agents): < 15 seconds
- [  ] Corpus retrieval: < 1 second
- [  ] Cold start time: < 3 seconds

### Quality Requirements
- [  ] Source citation rate: 100% of responses
- [  ] Pharmaceutical terminology accuracy: > 95%
- [  ] Agent invocation success rate: > 99%
- [  ] User satisfaction (beta testing): > 85% helpful ratings

---

## Risk Mitigation

### Risk 1: Lambda Cold Starts
**Impact**: First invocation slow (3-5s)
**Mitigation**:
- Provisioned concurrency for Sophie orchestrator
- Keep functions warm with CloudWatch Events (ping every 5 min)

### Risk 2: Bedrock Rate Limits
**Impact**: Throttling during high load
**Mitigation**:
- Implement exponential backoff retry logic
- Request rate limit increase from AWS
- Cache frequent queries (future enhancement)

### Risk 3: Corpus Retrieval Accuracy
**Impact**: Irrelevant documents retrieved
**Mitigation**:
- Phase 1: Simple keyword matching (current plan)
- Phase 2: Implement embeddings-based semantic search
- Monitor and improve relevance scores

### Risk 4: Agent Response Quality
**Impact**: Incorrect pharmaceutical advice
**Mitigation**:
- Extensive testing with domain experts
- Implement confidence thresholds (don't return low-confidence answers)
- Human-in-the-loop review for critical decisions
- Comprehensive source citation for verification

---

## Timeline

### 6-Day Dual-Team Sprint (As per PRD)

**Team 1: Sophie Orchestration** (Senior developers)
- Days 1-2: Shared utilities + Sophie scaffolding
- Days 3-4: Sophie orchestration logic + tri-paradigm synthesis
- Day 5: Integration testing
- Day 6: Performance optimization

**Team 2: Domain Agents** (Mid-level developers)
- Day 1: Shared utilities review
- Day 2: VERA + FINN implementation
- Day 3: NORA + CLIA implementation
- Days 4-5: Testing and refinement
- Day 6: End-to-end integration testing

### Post-Sprint (Days 7-14)
- Deploy to staging environment
- Beta testing with Ocuterra and Golden Hour
- Gather feedback and iterate
- Production deployment

---

## Next Steps

1. **Review this plan** with development team
2. **Confirm AWS permissions** (Bedrock access, Lambda invoke)
3. **Set up development environment** (Node.js 20.x, TypeScript, AWS SDK v3)
4. **Begin Day 1 implementation** (shared utilities)
5. **Daily standups** to track progress and blockers

---

## Questions to Resolve Before Implementation

1. **Bedrock Model Access**: Confirm `anthropic.claude-3-5-sonnet-20241022-v2:0` is available in us-east-1
2. **Lambda Code S3 Bucket**: Create `socratiq-lambda-code-prod` bucket?
3. **API Gateway Integration**: Update existing `/api/sophie/chat` or create new route?
4. **Database Access**: Do agents need direct database access or only through Sophie?
5. **Monitoring**: CloudWatch dashboards configuration preferences?
6. **Error Handling**: How should agents handle Bedrock failures? Fallback strategies?
7. **Testing Strategy**: Unit tests, integration tests, or end-to-end only?

---

**Status**: Ready to begin implementation
**Next Action**: Start Day 1 - Shared Utilities Library
**Owner**: Development Team (to be assigned)
**Target Completion**: October 28, 2025 (6 days from now)
