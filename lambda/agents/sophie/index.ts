// SocratIQ Multi-Agent System - Sophie Orchestrator
// Sophie: Strategic Orchestration & Pharmaceutical Intelligence Engine
// Domain: Multi-Agent Coordination & Strategic Synthesis
// Created: October 22, 2025

import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { invokeClaude, invokeClaudeForClassification } from '../../shared/bedrock-client';
import { AGENT_SYSTEM_PROMPTS, SOPHIE_CLASSIFICATION_PROMPT } from '../../shared/agent-prompts';
import {
  AgentName,
  AgentPlan,
  AgentResponse,
  SophieSynthesis,
  SourceCitation
} from '../../shared/types';
import {
  generateTraceId,
  parseLambdaEvent,
  buildLambdaResponse,
  formatErrorResponse,
  extractConfidenceFromText,
  logInfo,
  logError,
  checkRequiredEnvVars
} from '../../shared/utils';

const lambdaClient = new LambdaClient({ region: process.env.AWS_REGION || 'us-east-1' });

// Environment variables for agent Lambda ARNs
const AGENT_ARNS: Record<AgentName, string> = {
  VERA: process.env.VERA_LAMBDA_ARN || '',
  FINN: process.env.FINN_LAMBDA_ARN || '',
  NORA: process.env.NORA_LAMBDA_ARN || '',
  CLIA: process.env.CLIA_LAMBDA_ARN || '',
  Sophie: '' // Sophie doesn't invoke itself
};

/**
 * Sophie Orchestrator Lambda Handler
 * Coordinates multi-agent responses and synthesizes strategic recommendations
 */
export async function handler(event: any): Promise<any> {
  const startTime = Date.now();
  const traceId = generateTraceId();

  try {
    checkRequiredEnvVars([
      'VERA_LAMBDA_ARN',
      'FINN_LAMBDA_ARN',
      'NORA_LAMBDA_ARN',
      'CLIA_LAMBDA_ARN'
    ]);

    logInfo('Sophie orchestrator invoked', { traceId });

    const request = parseLambdaEvent(event);

    if (!request.message && !request.query) {
      return buildLambdaResponse(400, formatErrorResponse({
        error: 'ValidationError',
        message: 'Missing required field: message or query',
        statusCode: 400,
        traceId
      }));
    }

    const userQuery = request.message || request.query;
    const assetId = request.assetId;
    const assetContext = request.assetContext;

    // Step 1: Classify query to determine which agents to invoke
    logInfo('Classifying query', { traceId, query: userQuery });
    const agentPlan = await classifyQuery(userQuery, traceId);

    logInfo('Agent plan determined', {
      traceId,
      agents: agentPlan.agents,
      pattern: agentPlan.invocationPattern
    });

    // Step 2: Check if Sophie should respond directly (no agents needed)
    let agentResponses: AgentResponse[] = [];

    if (agentPlan.agents.length === 0 || agentPlan.invocationPattern === 'none') {
      logInfo('Sophie responding directly without invoking agents', { traceId });
      // Sophie will synthesize with empty agent responses - she'll answer from her own knowledge
    } else {
      // Step 2a: Create execution plan with specific tasks for each agent
      logInfo('Creating detailed execution plan for agents', { traceId });
      const executionPlan = await createExecutionPlan(userQuery, agentPlan, traceId);

      logInfo('Execution plan created', {
        traceId,
        agentTasks: executionPlan.agentTasks
      });

      // Step 2b: Invoke agents with their specific assigned tasks
      agentResponses = await invokeAgentsWithPlan(executionPlan, {
        userQuery,
        assetContext,
        traceId
      });

      logInfo('Agent responses received', {
        traceId,
        responseCount: agentResponses.length
      });
    }

    // Step 3: Synthesize using tri-paradigm reasoning
    const synthesis = await synthesizeResponses({
      userQuery,
      agentResponses,
      traceId
    });

    logInfo('Sophie synthesis complete', {
      traceId,
      confidence: synthesis.confidence,
      processingTime: Date.now() - startTime
    });

    // Return complete response
    return buildLambdaResponse(200, {
      recommendation: synthesis.recommendation,
      mechanisticAnalysis: synthesis.mechanisticAnalysis,
      deterministicScoring: synthesis.deterministicScoring,
      probabilisticRisk: synthesis.probabilisticRisk,
      confidence: synthesis.confidence,
      sources: synthesis.sources,
      agentContributions: synthesis.agentContributions,
      conflicts: synthesis.conflicts,
      traceId: synthesis.traceId,
      timestamp: synthesis.timestamp,
      metadata: {
        processingTime: Date.now() - startTime,
        agentsInvoked: agentPlan.agents,
        invocationPattern: agentPlan.invocationPattern
      }
    });

  } catch (error) {
    logError('Sophie orchestrator error', error, { traceId });

    return buildLambdaResponse(500, formatErrorResponse({
      error: 'InternalError',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
      traceId
    }));
  }
}

/**
 * Classify user query to determine which agents should respond
 * Uses Claude to intelligently route queries
 */
async function classifyQuery(userQuery: string, traceId: string): Promise<AgentPlan> {
  try {
    const classificationResult = await invokeClaudeForClassification(
      userQuery,
      SOPHIE_CLASSIFICATION_PROMPT
    );

    return {
      agents: classificationResult.agents || ['VERA'],
      invocationPattern: classificationResult.invocationPattern || 'parallel',
      reasoning: classificationResult.reasoning || 'Default classification'
    };
  } catch (error) {
    logError('Query classification failed, using fallback', error, { traceId });

    // Fallback: Use keyword-based classification
    return fallbackClassification(userQuery);
  }
}

/**
 * Fallback classification using simple keyword matching
 */
function fallbackClassification(query: string): AgentPlan {
  const queryLower = query.toLowerCase();
  const agents: AgentName[] = [];

  // Check for agent keywords
  if (/product|clinical|trial|enrollment|biomarker|cmc|manufacturing/.test(queryLower)) {
    agents.push('VERA');
  }
  if (/financial|valuation|budget|pricing|roi|rnpv|exit|deal/.test(queryLower)) {
    agents.push('FINN');
  }
  if (/regulatory|fda|patent|ip|legal|crada|compliance/.test(queryLower)) {
    agents.push('NORA');
  }
  if (/market|competitive|landscape|epidemiology|timeline/.test(queryLower)) {
    agents.push('CLIA');
  }

  // If no match, default to VERA
  if (agents.length === 0) {
    agents.push('VERA');
  }

  // Determine invocation pattern
  const invocationPattern = agents.length > 1 && /crada|federal/.test(queryLower)
    ? 'sequential'
    : 'parallel';

  return {
    agents,
    invocationPattern,
    reasoning: 'Fallback keyword-based classification'
  };
}

/**
 * Create detailed execution plan with specific tasks for each agent
 */
async function createExecutionPlan(
  userQuery: string,
  agentPlan: AgentPlan,
  traceId: string
): Promise<{ agentTasks: Record<AgentName, string>; invocationPattern: string }> {
  const planningPrompt = `You are Sophie, the strategic orchestrator. The user asked: "${userQuery}"

You will coordinate these agents: ${agentPlan.agents.join(', ')}

For each agent, create a SPECIFIC, TARGETED task that leverages their expertise. Don't just send them the user's question - give them a clear, focused assignment.

Agent Capabilities:
- VERA: Product formulation, clinical trial design, biomarkers, CMC/manufacturing, partnerships
- FINN: Financial modeling (rNPV, IRR), deal valuation, pricing strategy, ROI analysis
- NORA: Regulatory pathways (505b2, BLA), FDA strategy, patent landscape, IP protection
- CLIA: Market analysis, epidemiology, competitive intelligence, trial operations, timelines

Respond with JSON only:
{
  "VERA": "Analyze the product formulation requirements for...",
  "FINN": "Calculate the risk-adjusted NPV considering...",
  "NORA": "Evaluate regulatory pathway options for...",
  "CLIA": "Assess the competitive landscape and market opportunity for..."
}

Only include agents from this list: ${agentPlan.agents.join(', ')}
Be specific and actionable in each task assignment.`;

  try {
    const result = await invokeClaude({
      systemPrompt: 'You are a strategic task decomposition specialist. Create clear, specific tasks for domain experts.',
      userMessage: planningPrompt,
      maxTokens: 1024,
      temperature: 0.3
    });

    const agentTasks = JSON.parse(result.content);

    return {
      agentTasks,
      invocationPattern: agentPlan.invocationPattern
    };
  } catch (error) {
    logError('Execution plan creation failed, using fallback', error, { traceId });

    // Fallback: use the original query for all agents
    const fallbackTasks: Record<string, string> = {};
    for (const agent of agentPlan.agents) {
      fallbackTasks[agent] = userQuery;
    }

    return {
      agentTasks: fallbackTasks as Record<AgentName, string>,
      invocationPattern: agentPlan.invocationPattern
    };
  }
}

/**
 * Invoke agents with their specific assigned tasks
 */
async function invokeAgentsWithPlan(
  executionPlan: { agentTasks: Record<AgentName, string>; invocationPattern: string },
  context: { userQuery: string; assetContext?: any; traceId: string }
): Promise<AgentResponse[]> {
  const agents = Object.keys(executionPlan.agentTasks) as AgentName[];

  if (executionPlan.invocationPattern === 'parallel') {
    return invokeAgentsParallelWithTasks(executionPlan.agentTasks, context);
  } else {
    return invokeAgentsSequentialWithTasks(executionPlan.agentTasks, agents, context);
  }
}

/**
 * Invoke agents based on the plan (parallel or sequential) - DEPRECATED
 * Kept for backwards compatibility
 */
async function invokeAgents(
  plan: AgentPlan,
  context: { query: string; assetContext?: any; traceId: string }
): Promise<AgentResponse[]> {
  if (plan.invocationPattern === 'parallel') {
    return invokeAgentsParallel(plan.agents, context);
  } else {
    return invokeAgentsSequential(plan.agents, context);
  }
}

/**
 * Invoke multiple agents in parallel
 */
async function invokeAgentsParallel(
  agents: AgentName[],
  context: { query: string; assetContext?: any; traceId: string }
): Promise<AgentResponse[]> {
  const invocations = agents.map(agent => invokeSingleAgent(agent, {
    query: context.query,
    assetContext: context.assetContext
  }));

  const results = await Promise.all(invocations);
  return results.filter(r => r !== null) as AgentResponse[];
}

/**
 * Invoke agents sequentially (agent B receives agent A's output)
 */
async function invokeAgentsSequential(
  agents: AgentName[],
  context: { query: string; assetContext?: any; traceId: string }
): Promise<AgentResponse[]> {
  const responses: AgentResponse[] = [];

  for (const agent of agents) {
    const response = await invokeSingleAgent(agent, {
      query: context.query,
      assetContext: context.assetContext,
      previousResponses: responses
    });

    if (response) {
      responses.push(response);
    }
  }

  return responses;
}

/**
 * Invoke multiple agents in parallel with specific tasks
 */
async function invokeAgentsParallelWithTasks(
  agentTasks: Record<AgentName, string>,
  context: { userQuery: string; assetContext?: any; traceId: string }
): Promise<AgentResponse[]> {
  const invocations = Object.entries(agentTasks).map(([agent, task]) =>
    invokeSingleAgent(agent as AgentName, {
      query: task,
      assetContext: context.assetContext,
      originalQuery: context.userQuery
    })
  );

  const results = await Promise.all(invocations);
  return results.filter(r => r !== null) as AgentResponse[];
}

/**
 * Invoke agents sequentially with specific tasks
 */
async function invokeAgentsSequentialWithTasks(
  agentTasks: Record<AgentName, string>,
  agents: AgentName[],
  context: { userQuery: string; assetContext?: any; traceId: string }
): Promise<AgentResponse[]> {
  const responses: AgentResponse[] = [];

  for (const agent of agents) {
    const task = agentTasks[agent];
    if (!task) continue;

    // Include previous agent responses for context
    const contextualTask = responses.length > 0
      ? `${task}\n\nContext from previous agents:\n${responses.map(r => `${r.agent}: ${r.response.substring(0, 500)}...`).join('\n\n')}`
      : task;

    const response = await invokeSingleAgent(agent, {
      query: contextualTask,
      assetContext: context.assetContext,
      originalQuery: context.userQuery,
      previousResponses: responses
    });

    if (response) {
      responses.push(response);
    }
  }

  return responses;
}

/**
 * Invoke a single agent Lambda function
 */
async function invokeSingleAgent(
  agent: AgentName,
  payload: any
): Promise<AgentResponse | null> {
  try {
    const arn = AGENT_ARNS[agent];
    if (!arn) {
      logError(`Missing Lambda ARN for agent: ${agent}`);
      return null;
    }

    const command = new InvokeCommand({
      FunctionName: arn,
      Payload: JSON.stringify(payload)
    });

    const result = await lambdaClient.send(command);

    if (result.Payload) {
      const responseBody = JSON.parse(new TextDecoder().decode(result.Payload));

      // Handle both direct response and API Gateway response format
      if (responseBody.statusCode === 200) {
        return typeof responseBody.body === 'string'
          ? JSON.parse(responseBody.body)
          : responseBody.body;
      } else {
        return responseBody;
      }
    }

    return null;
  } catch (error) {
    logError(`Error invoking ${agent} agent`, error);
    return null;
  }
}

/**
 * Synthesize agent responses using Sophie's tri-paradigm reasoning
 */
async function synthesizeResponses(params: {
  userQuery: string;
  agentResponses: AgentResponse[];
  traceId: string;
}): Promise<SophieSynthesis> {
  const { userQuery, agentResponses, traceId } = params;

  // Build synthesis prompt with all agent responses
  const synthesisPrompt = buildSynthesisPrompt(userQuery, agentResponses);

  // Invoke Claude with Sophie's system prompt
  const claudeResponse = await invokeClaude({
    systemPrompt: AGENT_SYSTEM_PROMPTS.Sophie,
    userMessage: synthesisPrompt,
    maxTokens: 8192,
    temperature: 0.2
  });

  // Parse response sections
  const responseText = claudeResponse.content;

  // Extract sections using pattern matching
  const mechanisticAnalysis = extractSection(responseText, 'Mechanistic Analysis');
  const deterministicScoring = extractSection(responseText, 'Deterministic Scoring');
  const probabilisticRisk = extractSection(responseText, 'Probabilistic Risk Assessment');

  // Aggregate sources from all agents
  const allSources = aggregateSources(agentResponses);

  // Build agent contributions summary
  const agentContributions: Partial<Record<AgentName, string>> = {};
  for (const response of agentResponses) {
    agentContributions[response.agent] = response.response.substring(0, 300) + '...';
  }

  // Extract conflicts if mentioned
  const conflicts = extractConflicts(responseText);

  // Calculate confidence
  const confidence = extractConfidenceFromText(responseText);

  return {
    recommendation: responseText,
    mechanisticAnalysis,
    deterministicScoring,
    probabilisticRisk,
    confidence,
    sources: allSources,
    agentContributions,
    conflicts,
    traceId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Build synthesis prompt for Claude
 */
function buildSynthesisPrompt(userQuery: string, agentResponses: AgentResponse[]): string {
  let prompt = `**User Query**: ${userQuery}\n\n`;

  prompt += `**Agent Responses**:\n\n`;

  for (const response of agentResponses) {
    prompt += `### ${response.agent} Agent`;
    if (response.subAgent) {
      prompt += ` (${response.subAgent})`;
    }
    prompt += `\n`;
    prompt += `**Confidence**: ${(response.confidence * 100).toFixed(0)}%\n\n`;
    prompt += `${response.response}\n\n`;

    if (response.sources.length > 0) {
      prompt += `**Sources**:\n`;
      response.sources.forEach(source => {
        prompt += `- ${source.title} (${source.url})\n`;
      });
      prompt += '\n';
    }

    prompt += `---\n\n`;
  }

  prompt += `\nPlease synthesize these agent responses using SophieLogic™ tri-paradigm reasoning:\n`;
  prompt += `1. **Mechanistic Analysis**: Check for hard constraints and blockers\n`;
  prompt += `2. **Deterministic Scoring**: Score strategic options with explicit criteria\n`;
  prompt += `3. **Probabilistic Risk Assessment**: Quantify uncertainty and risk\n\n`;
  prompt += `Provide a clear, actionable recommendation with confidence level and source citations.`;

  return prompt;
}

/**
 * Extract a specific section from the response text
 */
function extractSection(text: string, sectionName: string): string | undefined {
  const regex = new RegExp(`(?:^|\\n)(?:#+\\s*)?${sectionName}[:\\s]*([\\s\\S]*?)(?=\\n(?:#+|\\*\\*)|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : undefined;
}

/**
 * Aggregate sources from all agent responses
 */
function aggregateSources(agentResponses: AgentResponse[]): SourceCitation[] {
  const sourcesMap = new Map<string, SourceCitation>();

  for (const response of agentResponses) {
    for (const source of response.sources) {
      // Use URL as unique key to deduplicate
      if (!sourcesMap.has(source.url)) {
        sourcesMap.set(source.url, source);
      }
    }
  }

  return Array.from(sourcesMap.values());
}

/**
 * Extract conflicts from the synthesis text
 */
function extractConflicts(text: string): string[] | undefined {
  const conflictSection = extractSection(text, 'Conflict Resolution');
  if (!conflictSection) {
    return undefined;
  }

  // Extract bullet points or lines mentioning conflicts
  const lines = conflictSection.split('\n');
  const conflicts = lines
    .filter(line => line.trim().length > 0)
    .map(line => line.replace(/^[-*]\s*/, '').trim());

  return conflicts.length > 0 ? conflicts : undefined;
}
