// SocratIQ Multi-Agent System - FINN Agent
// FINN: Financial & Investment Intelligence
// Domain: Financial Analysis & Valuation
// Created: October 22, 2025

import { retrieveFromCorpus } from './shared/corpus-retrieval';
import { invokeClaude } from './shared/bedrock-client';
import { AGENT_SYSTEM_PROMPTS } from './shared/agent-prompts';
import {
  AgentRequest,
  AgentResponse,
  FINNSubAgent,
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

const CORPUS_BUCKET = process.env.FINN_CORPUS_BUCKET || 'socratiq-finn-corpus-prod';

export async function handler(event: any): Promise<any> {
  const startTime = Date.now();
  const traceId = generateTraceId();

  try {
    checkRequiredEnvVars(['FINN_CORPUS_BUCKET']);
    logInfo('FINN agent invoked', { traceId });

    const request: AgentRequest = parseLambdaEvent(event);

    if (!request.query) {
      return buildLambdaResponse(400, formatErrorResponse({
        error: 'ValidationError',
        message: 'Missing required field: query',
        statusCode: 400,
        traceId
      }));
    }

    const subAgent = request.subAgent as FINNSubAgent || detectFINNSubAgent(request.query);
    logInfo('Sub-agent selected', { traceId, subAgent });

    const corpusDocs = await retrieveFromCorpus({
      bucket: CORPUS_BUCKET,
      query: request.query,
      subAgent,
      maxResults: 5,
      minRelevanceScore: 0.1
    });

    const corpusContext = buildCorpusContext(corpusDocs);
    const userMessage = buildUserMessage(request);
    const systemPrompt = AGENT_SYSTEM_PROMPTS.FINN[subAgent];

    const claudeResponse = await invokeClaude({
      systemPrompt,
      userMessage,
      corpusContext,
      maxTokens: 4096,
      temperature: 0.1
    });

    const response: AgentResponse = {
      agent: 'FINN',
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

    logInfo('FINN agent response generated', { traceId, subAgent, confidence: response.confidence });
    return buildLambdaResponse(200, response);

  } catch (error) {
    logError('FINN agent error', error, { traceId });
    return buildLambdaResponse(500, formatErrorResponse({
      error: 'InternalError',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
      traceId
    }));
  }
}

function detectFINNSubAgent(query: string): FINNSubAgent {
  const queryLower = query.toLowerCase();

  const keywords = {
    'FINN-ROI': ['rnpv', 'npv', 'irr', 'roi', 'return on investment', 'discount rate', 'wacc', 'valuation'],
    'FINN-Exit': ['exit', 'acquisition', 'm&a', 'merger', 'buyout', 'comparable', 'comp'],
    'FINN-Pricing': ['pricing', 'price', 'reimbursement', 'payer', 'icer', 'qaly', 'value-based'],
    'FINN-Partnerships': ['deal terms', 'milestone', 'royalty', 'upfront', 'licensing', 'partnership economics'],
    'FINN-Risk': ['risk', 'sensitivity', 'scenario', 'monte carlo', 'probability', 'uncertainty'],
    'FINN-Budget': ['budget', 'burn rate', 'runway', 'cash', 'expense', 'cost', 'spending']
  };

  for (const [subAgent, words] of Object.entries(keywords)) {
    if (words.some(word => queryLower.includes(word))) {
      return subAgent as FINNSubAgent;
    }
  }

  return 'FINN-ROI';
}

function buildCorpusContext(docs: CorpusDocument[]): string {
  if (docs.length === 0) return 'No relevant corpus documents found.';
  return docs.map((doc, i) => `**Source ${i + 1}: ${doc.title}**\nRelevance: ${(doc.relevanceScore * 100).toFixed(0)}%\nURL: ${doc.url}\n\n${doc.excerpt}`).join('\n---\n');
}

function buildUserMessage(request: AgentRequest): string {
  let message = `**User Query**: ${request.query}\n\n`;
  if (request.assetContext) {
    const asset = request.assetContext;
    message += `**Asset Context**:\n`;
    if (asset.productName) message += `- Product: ${asset.productName}\n`;
    if (asset.developmentPhase) message += `- Phase: ${asset.developmentPhase}\n`;
    if (asset.peakSales) message += `- Peak Sales Estimate: $${(asset.peakSales / 1_000_000).toFixed(0)}M\n`;
    if (asset.cashRunway) message += `- Cash Runway: ${asset.cashRunway} months\n`;
    if (asset.fundingStatus) message += `- Funding Status: ${asset.fundingStatus}\n`;
    message += '\n';
  }
  if (request.previousResponses && request.previousResponses.length > 0) {
    message += `**Previous Agent Insights**:\n`;
    request.previousResponses.forEach(r => message += `\n**${r.agent}**: ${r.response.substring(0, 500)}...\n`);
    message += '\n';
  }
  message += `Please provide detailed financial analysis with calculations and source citations.`;
  return message;
}
