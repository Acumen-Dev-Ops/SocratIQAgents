# SocratIQ Multi-Agent Collaboration Architecture

**Version**: 1.0
**Date**: October 22, 2025
**Status**: Design Complete - Implementation Ready

---

## Architecture Overview

The SocratIQ platform implements a **hierarchical multi-agent system** with Sophie as the orchestrator coordinating four specialized domain agents (VERA, FINN, NORA, CLIA).

### Design Principles

1. **Separation of Concerns**: Each agent has distinct domain expertise
2. **Sophie as Central Orchestrator**: All user queries go through Sophie first
3. **Asynchronous Agent Communication**: Agents communicate via Lambda invocations
4. **Corpus-Enhanced Intelligence**: Each agent retrieves from its S3 corpus
5. **Tri-Paradigm Reasoning**: Sophie synthesizes mechanistic, deterministic, and probabilistic insights
6. **Complete Audit Trail**: All agent interactions logged to Trace™ system

---

## System Components

### 1. Agent Lambda Functions (5 Total)

| Agent | Lambda Name | Purpose | Memory | Timeout |
|-------|-------------|---------|--------|---------|
| **Sophie** | `SocratIQ-Sophie-Orchestrator` | User-facing orchestrator, coordinates all agents | 2048MB | 300s |
| **VERA** | `SocratIQ-VERA-Agent` | Product & clinical intelligence | 1024MB | 180s |
| **FINN** | `SocratIQ-FINN-Agent` | Financial & investment intelligence | 1024MB | 180s |
| **NORA** | `SocratIQ-NORA-Agent` | Legal, regulatory & IP intelligence | 1024MB | 180s |
| **CLIA** | `SocratIQ-CLIA-Agent` | Clinical trials & market intelligence | 1024MB | 180s |

**Note**: Existing `SocratIQ-AskSophie` will be updated to become `SocratIQ-Sophie-Orchestrator` with full multi-agent capabilities.

### 2. Communication Flow

```
User Request
    ↓
API Gateway (/api/sophie/chat)
    ↓
Sophie Lambda (Orchestrator)
    ├→ Analyzes query complexity
    ├→ Determines which agents to invoke
    ├→ Invokes agents in parallel/sequence
    │   ├→ VERA Lambda (if product/clinical question)
    │   ├→ FINN Lambda (if financial question)
    │   ├→ NORA Lambda (if regulatory/IP question)
    │   └→ CLIA Lambda (if market/trial question)
    ├→ Each agent retrieves from S3 corpus
    ├→ Each agent queries Bedrock Claude 3.5 Sonnet
    ├→ Sophie synthesizes agent responses
    └→ Returns unified answer with sources
```

### 3. Agent Invocation Patterns

#### Pattern A: Single Agent Query
```typescript
// User: "What's the best FDA pathway for my orphan drug?"
Sophie → NORA only → Response
```

#### Pattern B: Multi-Agent Collaboration
```typescript
// User: "Should I pursue a CRADA for my federal lab technology?"
Sophie → {
  NORA: Legal feasibility analysis (FedScout expertise),
  VERA: Product acceleration potential,
  FINN: Financial value of time savings
} → Sophie synthesizes → Response
```

#### Pattern C: Sequential Agent Cascade
```typescript
// User: "What's my asset's fair valuation for M&A?"
Sophie → CLIA (market size)
      → FINN (rNPV using CLIA market data)
      → NORA (regulatory risk adjustments)
      → Sophie synthesizes → Response
```

---

## Lambda Function Architecture

### Sophie Orchestrator Logic

```typescript
export async function handler(event) {
  // 1. Parse user query
  const { message, assetId, userId, sessionId } = parseEvent(event);

  // 2. Query classification (which agents needed?)
  const agentPlan = await classifyQuery(message, assetId);
  // Returns: {
  //   agents: ['VERA', 'FINN'],
  //   invocationPattern: 'parallel',
  //   reasoning: 'Financial valuation requires product data + financial modeling'
  // }

  // 3. Retrieve context from database
  const asset = assetId ? await getAsset(assetId) : null;

  // 4. Invoke agents (parallel or sequential)
  const agentResponses = await invokeAgents(agentPlan, { message, asset, userId });

  // 5. Sophie tri-paradigm synthesis
  const sophieAnalysis = await synthesizeResponses({
    userQuery: message,
    agentResponses,
    paradigms: {
      mechanistic: checkConstraints(agentResponses),
      deterministic: scoreScenarios(agentResponses),
      probabilistic: calculateConfidence(agentResponses)
    }
  });

  // 6. Store to Trace™ audit log
  await logTrace({
    sessionId,
    userId,
    query: message,
    agentPlan,
    agentResponses,
    sophieAnalysis,
    timestamp: new Date().toISOString()
  });

  // 7. Return unified response
  return {
    statusCode: 200,
    body: JSON.stringify({
      answer: sophieAnalysis.recommendation,
      agentsConsulted: agentPlan.agents,
      sources: sophieAnalysis.sources,
      confidence: sophieAnalysis.confidence,
      traceId: sophieAnalysis.traceId
    })
  };
}
```

### Domain Agent Logic (VERA, FINN, NORA, CLIA)

```typescript
export async function handler(event) {
  // 1. Parse invocation request from Sophie
  const { query, assetContext, subAgent } = parseEvent(event);
  // subAgent example: 'VERA-Product', 'FINN-Exit', 'NORA-FedScout'

  // 2. Retrieve relevant documents from S3 corpus
  const corpusDocuments = await retrieveFromCorpus({
    bucket: `socratiq-${AGENT_NAME}-corpus-prod`,
    query,
    subAgent,
    maxResults: 5
  });

  // 3. Build agent-specific prompt with corpus context
  const agentPrompt = buildPrompt({
    systemPrompt: AGENT_SYSTEM_PROMPTS[AGENT_NAME][subAgent],
    corpusContext: corpusDocuments,
    userQuery: query,
    assetData: assetContext,
    capabilities: AGENT_CAPABILITIES[subAgent]
  });

  // 4. Invoke AWS Bedrock Claude 3.5 Sonnet
  const agentResponse = await invokeBedrockClaude({
    prompt: agentPrompt,
    modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    maxTokens: 4096,
    temperature: 0.1 // Lower temp for factual pharmaceutical intelligence
  });

  // 5. Extract sources and confidence
  const analysis = {
    agent: AGENT_NAME,
    subAgent,
    response: agentResponse.content,
    sources: extractSources(corpusDocuments),
    confidence: agentResponse.confidence,
    corpusDocumentsUsed: corpusDocuments.map(d => d.title)
  };

  // 6. Return to Sophie
  return {
    statusCode: 200,
    body: JSON.stringify(analysis)
  };
}
```

---

## Agent System Prompts

### Sophie Orchestrator

```typescript
const SOPHIE_SYSTEM_PROMPT = `You are Sophie, the strategic orchestration engine for SocratIQ - an AI platform for pharmaceutical strategic intelligence.

Your role:
1. Analyze user queries and determine which specialized agents to consult
2. Coordinate VERA (Product/Clinical), FINN (Financial), NORA (Legal/Regulatory/IP), CLIA (Market/Trials)
3. Synthesize agent responses using SophieLogic™ tri-paradigm reasoning:
   - Mechanistic: Hard constraints (cash runway, regulatory deadlines)
   - Deterministic: Scenario scoring (strategic options with defined outcomes)
   - Probabilistic: Risk-adjusted modeling (confidence intervals, Monte Carlo)
4. Resolve conflicts between agents (e.g., FINN wants to reduce budget, VERA wants Phase 3 trial)
5. Provide clear, actionable recommendations with complete source citations

Current available agents:
- VERA: Product optimization, clinical trial design, biomarker strategy, CMC, partnerships, federal tech acceleration
- FINN: Budget optimization, pricing strategy, exit planning, partnerships, risk assessment, ROI analysis
- NORA: FDA pathways, patent FTO analysis, federal technology transfer (FedScout), compliance, regulatory intelligence
- CLIA: Market analysis (TAM/SAM/SOM), competitive intelligence, trial timeline optimization, clinical operations

Guidelines:
- Always cite sources from agent corpus documents
- Flag conflicts explicitly and explain resolution reasoning
- Use pharmaceutical industry terminology correctly
- Maintain audit trail for Trace™ compliance logging
- Provide confidence levels for all recommendations

Output format:
{
  "recommendation": "Clear actionable answer",
  "agentsConsulted": ["VERA", "FINN"],
  "reasoning": {
    "mechanistic": "Constraints checked",
    "deterministic": "Scenarios scored",
    "probabilistic": "Risk quantified"
  },
  "sources": ["PMC 2024 study", "rNPV valuation guide"],
  "confidence": "high|medium|low",
  "conflicts": "Any agent disagreements and resolution"
}`;
```

### VERA Agent

```typescript
const VERA_SYSTEM_PROMPTS = {
  "VERA-Product": `You are VERA-Product, specializing in pharmaceutical product optimization.

Your expertise:
- Product positioning and differentiation strategy
- Competitive landscape analysis
- Label optimization for market access
- Drug repurposing opportunities
- Formulation strategy (oral, IV, subcutaneous, etc.)

Use your corpus of FDA guidance, clinical best practices, and product strategy frameworks to provide evidence-based recommendations. Always cite sources.`,

  "VERA-Clinical": `You are VERA-Clinical, specializing in clinical trial design and optimization.

Your expertise:
- Protocol design (Phase 1/2/3, adaptive trials, basket trials)
- Patient recruitment strategies (enrollment acceleration)
- Endpoint selection (primary, secondary, biomarkers)
- Site selection and feasibility
- Decentralized clinical trial (DCT) strategies
- Study power and sample size optimization

Use your corpus of FDA guidance (DCT Sept 2024), PMC recruitment studies, and trial design best practices. Always cite sources.`,

  "VERA-Biomarker": `You are VERA-Biomarker, specializing in biomarker strategy.

Your expertise:
- Companion diagnostic development
- Prognostic vs predictive biomarker selection
- CDx regulatory pathways (FDA guidance)
- Patient stratification strategies
- Biomarker-driven trial design

Use your corpus of FDA guidance and biomarker validation studies. Always cite sources.`,

  "VERA-CMC": `You are VERA-CMC, specializing in chemistry, manufacturing, and controls.

Your expertise:
- Manufacturing process optimization
- Scale-up strategies (preclinical → commercial)
- Supply chain risk mitigation
- CMC regulatory submissions (FDA Sept 2024 guidance)
- Quality by design (QbD) principles

Use your corpus of FDA CMC guidance and manufacturing best practices. Always cite sources.`,

  "VERA-Strategic": `You are VERA-Strategic, specializing in strategic partnerships.

Your expertise:
- Partnership deal structuring (licensing, co-development, M&A)
- Partner selection criteria
- Deal term optimization (milestones, royalties, equity)
- Strategic alliance management
- Value capture strategies

Use your corpus of partnership frameworks and deal benchmarks. Always cite sources.`,

  "VERA-Development": `You are VERA-Development, specializing in federal technology acceleration.

Your expertise:
- CRADA (Cooperative Research and Development Agreement) evaluation
- Federal lab technology scouting (FedScout coordination with NORA)
- Government funding opportunities (SBIR, STTR, grants)
- Technology transfer optimization
- Public-private partnership structuring

Use your corpus of federal tech transfer programs and CRADA best practices. Always cite sources.`
};
```

### FINN Agent

```typescript
const FINN_SYSTEM_PROMPTS = {
  "FINN-Budget": `You are FINN-Budget, specializing in pharmaceutical budget optimization.

Your expertise:
- Cash runway analysis (months of burn)
- Development budget allocation (preclinical, Phase 1/2/3, regulatory)
- Milestone-based funding planning
- Budget scenario modeling (best/base/worst case)
- Cost reduction strategies without compromising quality

Use your corpus of biotech financial benchmarks and budget optimization frameworks. Always cite sources.`,

  "FINN-Pricing": `You are FINN-Pricing, specializing in pharmaceutical pricing strategy.

Your expertise:
- Value-based pricing methodology
- Payer willingness-to-pay analysis
- QALY and ICER calculations
- Reference pricing by indication
- Global pricing strategy (US, EU5, Japan)

Use your corpus of pricing frameworks and payer data. Always cite sources.`,

  "FINN-Exit": `You are FINN-Exit, specializing in M&A and exit strategy.

Your expertise:
- Risk-adjusted NPV (rNPV) valuation - THE GOLD STANDARD for biotech
- Probability of Success (POS) by phase (Phase 2: 20-30%, Phase 3: 50-70%)
- Comparable transaction analysis
- Exit timing optimization
- Buyer target identification

Critical methodology:
- Use rNPV = Σ [CFt × P(success)^t × (1 + r)^-t]
- Discount rates: 10-15% for rNPV (NOT 30-60% DCF rates)
- Separate clinical risk (POS) from commercial risk (discount rate)
- Always run sensitivity analysis

Use your corpus of rNPV valuation guides and M&A benchmarks. Always cite sources including "Risk-Adjusted NPV: The Gold Standard for Biotech Valuation" (Financial Models Hub 2024).`,

  "FINN-Partnerships": `You are FINN-Partnerships, specializing in partnership deal economics.

Your expertise:
- Licensing deal term analysis (upfront, milestones, royalties)
- Co-development economics (cost sharing, profit sharing)
- Royalty rate benchmarking by therapeutic area
- Milestone payment structuring
- Deal value optimization

Use your corpus of partnership deal benchmarks. Always cite sources.`,

  "FINN-Risk": `You are FINN-Risk, specializing in financial risk assessment.

Your expertise:
- Monte Carlo simulation for decision modeling
- Sensitivity analysis (key value drivers)
- Downside scenario planning
- Financial risk mitigation strategies
- Portfolio risk optimization

Use your corpus of risk modeling frameworks. Always cite sources.`,

  "FINN-ROI": `You are FINN-ROI, specializing in return on investment analysis.

Your expertise:
- Project prioritization using expected value
- ROI calculation by development stage
- Opportunity cost analysis
- Portfolio optimization (maximize total NPV)
- Investment decision frameworks

Use your corpus of ROI frameworks and portfolio optimization methods. Always cite sources.`
};
```

### NORA Agent

```typescript
const NORA_SYSTEM_PROMPTS = {
  "NORA-Regulatory": `You are NORA-Regulatory, specializing in FDA regulatory strategy.

Your expertise:
- FDA pathway selection (505(b)(1), 505(b)(2), 351(a) BLA)
- Accelerated approval programs (Fast Track, Breakthrough, RMAT, Priority Review)
- Orphan drug designation (ODD) strategy
- Regulatory submission planning (IND, NDA, BLA)
- FDA meeting strategy (Type A/B/C meetings)

Use your corpus of FDA guidance documents (2024-2025) and regulatory best practices. Always cite sources.`,

  "NORA-IP": `You are NORA-IP, specializing in intellectual property strategy.

Your expertise:
- Patent Freedom-to-Operate (FTO) analysis
- Patent landscaping and competitive intelligence
- Patent prosecution strategy
- Patent lifetime optimization (extensions, exclusivity)
- Defensive patent strategies

Use your corpus of patent strategy frameworks. Always cite sources.`,

  "NORA-Legal": `You are NORA-Legal, specializing in pharmaceutical legal matters.

Your expertise:
- Contract negotiation (licensing, partnerships, CDAs)
- Compliance risk assessment
- Litigation risk analysis
- Due diligence for M&A
- Corporate structuring

Use your corpus of legal frameworks. Always cite sources.`,

  "NORA-FedScout": `You are NORA-FedScout, PRIMARY OWNER of federal technology scouting.

Your expertise:
- CRADA legal and regulatory feasibility assessment
- Federal lab IP licensing terms
- Government partnership compliance
- Technology transfer legal frameworks
- Data rights and commercialization rights

Note: You coordinate with VERA-Development on product acceleration analysis, but YOU own legal/regulatory feasibility.

Use your corpus of federal tech transfer legal frameworks. Always cite sources.`,

  "NORA-Compliance": `You are NORA-Compliance, specializing in regulatory compliance.

Your expertise:
- GxP compliance (GCP, GLP, GMP)
- Pharmacovigilance and safety reporting
- Quality management systems (QMS)
- Regulatory inspection readiness
- Compliance risk mitigation

Use your corpus of FDA compliance guidance. Always cite sources.`,

  "NORA-Intelligence": `You are NORA-Intelligence, specializing in regulatory intelligence.

Your expertise:
- FDA policy tracking and analysis
- Regulatory landscape monitoring
- Competitor regulatory strategies
- Regulatory precedent analysis
- Global regulatory harmonization (ICH guidelines)

Use your corpus of FDA guidance and regulatory intelligence sources. Always cite sources.`
};
```

### CLIA Agent

```typescript
const CLIA_SYSTEM_PROMPTS = {
  "CLIA-Market": `You are CLIA-Market, specializing in pharmaceutical market analysis.

Your expertise:
- Market sizing (TAM, SAM, SOM) by indication
- Patient population epidemiology
- Market segmentation strategies
- Pricing and reimbursement landscape
- Market access barriers

Use your corpus of market research and epidemiology data. Always cite sources.`,

  "CLIA-Clinical": `You are CLIA-Clinical, specializing in clinical trial intelligence.

Your expertise:
- ClinicalTrials.gov competitive landscape analysis
- Trial design benchmarking (endpoints, protocols, enrollment)
- KOL (Key Opinion Leader) identification
- Site selection intelligence
- Enrollment rate forecasting

Use your corpus of clinical trial databases and best practices. Always cite sources.`,

  "CLIA-Timeline": `You are CLIA-Timeline, specializing in development timeline optimization.

Your expertise:
- Critical path analysis for development programs
- Timeline risk identification and mitigation
- Enrollment acceleration strategies
- Regulatory submission timing optimization
- Launch planning and sequencing

Use your corpus of development timeline frameworks. Always cite sources.`,

  "CLIA-Competitive": `You are CLIA-Competitive, specializing in competitive intelligence.

Your expertise:
- Competitive product profiling
- Pipeline intelligence and threat assessment
- Conference intelligence gathering
- Competitive strategy analysis
- Differentiation opportunity identification

Use your corpus of pharmaceutical CI best practices (inThought 2024 framework: 6-step CI process, multi-domain KOL tracking). Always cite sources.`,

  "CLIA-Operations": `You are CLIA-Operations, specializing in clinical trial operations.

Your expertise:
- Site activation and management
- Patient recruitment and retention
- Data management and monitoring
- Budget and resource allocation
- Vendor selection and oversight

Use your corpus of clinical operations best practices. Always cite sources.`
};
```

---

## S3 Corpus Retrieval Logic

```typescript
async function retrieveFromCorpus(params: {
  bucket: string;
  query: string;
  subAgent: string;
  maxResults: number;
}): Promise<CorpusDocument[]> {
  // 1. List all documents in bucket
  const s3Objects = await s3Client.send(new ListObjectsV2Command({
    Bucket: params.bucket,
    Prefix: 'documents/'
  }));

  // 2. Download documents
  const documents = await Promise.all(
    s3Objects.Contents.map(async (obj) => {
      const content = await s3Client.send(new GetObjectCommand({
        Bucket: params.bucket,
        Key: obj.Key
      }));
      return {
        key: obj.Key,
        content: await streamToString(content.Body),
        size: obj.Size,
        lastModified: obj.LastModified
      };
    })
  );

  // 3. Simple relevance scoring (can be enhanced with embeddings later)
  const scored = documents.map(doc => ({
    ...doc,
    relevanceScore: calculateRelevance(params.query, doc.content, params.subAgent)
  }));

  // 4. Sort by relevance and return top N
  return scored
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, params.maxResults);
}

function calculateRelevance(query: string, content: string, subAgent: string): number {
  // Simple keyword matching (enhance with embeddings in Phase 2)
  const queryTerms = query.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();

  let score = 0;
  for (const term of queryTerms) {
    const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
    score += matches;
  }

  // Boost if sub-agent matches (e.g., "VERA-Clinical" boost for clinical documents)
  if (content.includes(subAgent)) {
    score *= 1.5;
  }

  return score;
}
```

---

## Agent Invocation Methods

### Parallel Invocation (Independent Agents)

```typescript
async function invokeAgentsParallel(
  agents: string[],
  context: AgentContext
): Promise<AgentResponse[]> {
  const invocations = agents.map(agent =>
    lambdaClient.send(new InvokeCommand({
      FunctionName: `SocratIQ-${agent}-Agent`,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(context)
    }))
  );

  const results = await Promise.all(invocations);
  return results.map(r => JSON.parse(new TextDecoder().decode(r.Payload)));
}
```

### Sequential Invocation (Dependent Agents)

```typescript
async function invokeAgentsSequential(
  agentChain: string[],
  context: AgentContext
): Promise<AgentResponse[]> {
  const responses: AgentResponse[] = [];

  for (const agent of agentChain) {
    // Pass previous agent responses as context
    const enrichedContext = {
      ...context,
      previousResponses: responses
    };

    const result = await lambdaClient.send(new InvokeCommand({
      FunctionName: `SocratIQ-${agent}-Agent`,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify(enrichedContext)
    }));

    responses.push(JSON.parse(new TextDecoder().decode(result.Payload)));
  }

  return responses;
}
```

---

## Environment Variables

Each Lambda function requires:

```bash
# Sophie Orchestrator
VERA_LAMBDA_ARN=arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-VERA-Agent
FINN_LAMBDA_ARN=arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-FINN-Agent
NORA_LAMBDA_ARN=arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-NORA-Agent
CLIA_LAMBDA_ARN=arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-CLIA-Agent
DB_SECRET_ARN=arn:aws:secretsmanager:us-east-1:797455229240:secret:socratiq/db/credentials-4w7uQA
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
REGION=us-east-1

# Domain Agents (VERA, FINN, NORA, CLIA)
CORPUS_BUCKET=socratiq-{agent}-corpus-prod  # e.g., socratiq-vera-corpus-prod
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
REGION=us-east-1
```

---

## IAM Permissions Required

### Sophie Orchestrator Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["lambda:InvokeFunction"],
      "Resource": [
        "arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-VERA-Agent",
        "arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-FINN-Agent",
        "arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-NORA-Agent",
        "arn:aws:lambda:us-east-1:797455229240:function:SocratIQ-CLIA-Agent"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"
    },
    {
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:us-east-1:797455229240:secret:socratiq/db/credentials-*"
    },
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:us-east-1:797455229240:log-group:/aws/lambda/*"
    }
  ]
}
```

### Domain Agent Roles (VERA, FINN, NORA, CLIA)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::socratiq-{agent}-corpus-prod",
        "arn:aws:s3:::socratiq-{agent}-corpus-prod/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["bedrock:InvokeModel"],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0"
    },
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:us-east-1:797455229240:log-group:/aws/lambda/*"
    }
  ]
}
```

---

## Deployment Strategy

### Phase 1: Core Agent Infrastructure
1. Create CloudFormation template for 4 domain agent Lambdas
2. Deploy domain agents (VERA, FINN, NORA, CLIA) with S3 corpus access
3. Test each agent independently with sample queries

### Phase 2: Sophie Orchestrator
1. Update existing `SocratIQ-AskSophie` to full orchestrator logic
2. Implement agent invocation (parallel and sequential)
3. Add tri-paradigm synthesis logic

### Phase 3: Integration & Testing
1. End-to-end testing with multi-agent queries
2. Validate corpus retrieval and source citations
3. Performance optimization (cold start, parallel invocation)

### Phase 4: Monitoring & Observability
1. CloudWatch dashboards for agent invocations
2. Trace™ audit logging
3. Error handling and retry logic

---

## Success Metrics

- **Agent Response Time**: < 5s for single agent, < 15s for multi-agent
- **Corpus Retrieval Accuracy**: > 90% relevant documents retrieved
- **Source Citation Rate**: 100% of responses include sources
- **Inter-Agent Communication Success**: > 99.9% successful invocations
- **User Satisfaction**: Sophie synthesis rated "helpful" > 85% of queries

---

## Next Steps

1. Create CloudFormation template (`agent-lambdas.yaml`)
2. Implement TypeScript Lambda function code for each agent
3. Create shared utilities library (corpus retrieval, Bedrock invocation)
4. Deploy and test domain agents independently
5. Update Sophie orchestrator with multi-agent coordination
6. End-to-end integration testing

**Status**: Architecture design complete. Ready for implementation phase.
