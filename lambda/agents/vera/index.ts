// SocratIQ Multi-Agent System - VERA Agent
// VERA: Virtual Expert for Regulatory Advancement
// Domain: Product & Clinical Intelligence
// Created: October 22, 2025

import { retrieveFromCorpus } from './shared/corpus-retrieval';
import { invokeClaude } from './shared/bedrock-client';
import { AGENT_SYSTEM_PROMPTS } from './shared/agent-prompts';
import {
  AgentRequest,
  AgentResponse,
  VERASubAgent,
  CorpusDocument
} from './shared/types';
import {
  generateTraceId,
  parseLambdaEvent,
  buildLambdaResponse,
  formatErrorResponse,
  logInfo,
  logError,
  checkRequiredEnvVars
} from './shared/utils';

// Environment variables
const CORPUS_BUCKET = process.env.VERA_CORPUS_BUCKET || 'socratiq-vera-corpus-prod';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

/**
 * VERA Agent Lambda Handler
 * Handles product and clinical intelligence queries
 */
export async function handler(event: any): Promise<any> {
  const startTime = Date.now();
  const traceId = generateTraceId();

  try {
    // Check required environment variables
    checkRequiredEnvVars(['VERA_CORPUS_BUCKET']);

    logInfo('VERA agent invoked', { traceId, event });

    // Parse event
    const request: AgentRequest = parseLambdaEvent(event);

    // Validate request
    if (!request.query) {
      return buildLambdaResponse(400, formatErrorResponse({
        error: 'ValidationError',
        message: 'Missing required field: query',
        statusCode: 400,
        traceId
      }));
    }

    // Determine which VERA sub-agent to use
    const subAgent = request.subAgent as VERASubAgent || detectVERASubAgent(request.query);

    logInfo('Sub-agent selected', { traceId, subAgent });

    // Retrieve relevant documents from corpus
    const corpusDocs = await retrieveFromCorpus({
      bucket: CORPUS_BUCKET,
      query: request.query,
      subAgent,
      maxResults: 5,
      minRelevanceScore: 0.1
    });

    logInfo('Corpus documents retrieved', {
      traceId,
      documentCount: corpusDocs.length
    });

    // Build corpus context for Claude
    const corpusContext = buildCorpusContext(corpusDocs);

    // Build user message with asset context
    const userMessage = buildUserMessage(request);

    // Get system prompt for selected sub-agent
    const systemPrompt = AGENT_SYSTEM_PROMPTS.VERA[subAgent];

    // Invoke Bedrock Claude
    const claudeResponse = await invokeClaude({
      systemPrompt,
      userMessage,
      corpusContext,
      maxTokens: 4096,
      temperature: 0.1
    });

    // Build agent response
    const response: AgentResponse = {
      agent: 'VERA',
      subAgent,
      response: claudeResponse.content,
      sources: corpusDocs.map(doc => ({
        title: doc.title,
        url: doc.url,
        excerpt: doc.excerpt,
        relevanceScore: doc.relevanceScore
      })),
      confidence: claudeResponse.confidence || 0.75,
      timestamp: new Date().toISOString(),
      traceId,
      metadata: {
        processingTime: Date.now() - startTime,
        corpusDocumentsRetrieved: corpusDocs.length,
        tokensUsed: claudeResponse.usage.inputTokens + claudeResponse.usage.outputTokens
      }
    };

    logInfo('VERA agent response generated', {
      traceId,
      subAgent,
      confidence: response.confidence,
      processingTime: response.metadata?.processingTime
    });

    return buildLambdaResponse(200, response);

  } catch (error) {
    logError('VERA agent error', error, { traceId });

    return buildLambdaResponse(500, formatErrorResponse({
      error: 'InternalError',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
      traceId
    }));
  }
}

/**
 * Detect which VERA sub-agent should handle the query
 * Uses keyword matching to route to specialist sub-agents
 */
function detectVERASubAgent(query: string): VERASubAgent {
  const queryLower = query.toLowerCase();

  // VERA-Development keywords (CRADA, federal partnerships)
  const developmentKeywords = ['crada', 'federal', 'sbir', 'sttr', 'government', 'nih', 'dod', 'federal lab'];
  if (developmentKeywords.some(keyword => queryLower.includes(keyword))) {
    return 'VERA-Development';
  }

  // VERA-Clinical keywords
  const clinicalKeywords = ['trial', 'protocol', 'enrollment', 'endpoint', 'phase', 'recruitment', 'patient enrollment', 'clinical study'];
  if (clinicalKeywords.some(keyword => queryLower.includes(keyword))) {
    return 'VERA-Clinical';
  }

  // VERA-Biomarker keywords
  const biomarkerKeywords = ['biomarker', 'diagnostic', 'companion', 'cdx', 'patient selection', 'precision medicine', 'stratification'];
  if (biomarkerKeywords.some(keyword => queryLower.includes(keyword))) {
    return 'VERA-Biomarker';
  }

  // VERA-CMC keywords
  const cmcKeywords = ['manufacturing', 'cmc', 'scale-up', 'supply chain', 'gmp', 'production', 'quality control'];
  if (cmcKeywords.some(keyword => queryLower.includes(keyword))) {
    return 'VERA-CMC';
  }

  // VERA-Strategic keywords
  const strategicKeywords = ['partnership', 'licensing', 'alliance', 'collaboration', 'deal', 'kol', 'advisory board'];
  if (strategicKeywords.some(keyword => queryLower.includes(keyword))) {
    return 'VERA-Strategic';
  }

  // Default to VERA-Product
  return 'VERA-Product';
}

/**
 * Build corpus context string for Claude
 */
function buildCorpusContext(docs: CorpusDocument[]): string {
  if (docs.length === 0) {
    return 'No relevant corpus documents found.';
  }

  return docs.map((doc, index) => `
**Source ${index + 1}: ${doc.title}**
Relevance Score: ${(doc.relevanceScore * 100).toFixed(0)}%
URL: ${doc.url}
Legal Status: ${doc.legalStatus}

${doc.excerpt}
`).join('\n---\n');
}

/**
 * Build user message with query and asset context
 */
function buildUserMessage(request: AgentRequest): string {
  let message = `**User Query**: ${request.query}\n\n`;

  // Add asset context if provided
  if (request.assetContext) {
    const asset = request.assetContext;
    message += `**Asset Context**:\n`;
    if (asset.productName) message += `- Product Name: ${asset.productName}\n`;
    if (asset.indication) message += `- Indication: ${asset.indication}\n`;
    if (asset.developmentPhase) message += `- Development Phase: ${asset.developmentPhase}\n`;
    if (asset.mechanismOfAction) message += `- Mechanism of Action: ${asset.mechanismOfAction}\n`;
    if (asset.targetPopulation) message += `- Target Population: ${asset.targetPopulation}\n`;
    if (asset.regulatoryPath) message += `- Regulatory Path: ${asset.regulatoryPath}\n`;
    message += '\n';
  }

  // Add previous agent responses if this is a sequential invocation
  if (request.previousResponses && request.previousResponses.length > 0) {
    message += `**Previous Agent Insights**:\n`;
    for (const prevResponse of request.previousResponses) {
      message += `\n**${prevResponse.agent}**: ${prevResponse.response.substring(0, 500)}...\n`;
    }
    message += '\n';
  }

  message += `Please provide a detailed, evidence-based response using the corpus sources. Always cite specific sources when making claims.`;

  return message;
}
