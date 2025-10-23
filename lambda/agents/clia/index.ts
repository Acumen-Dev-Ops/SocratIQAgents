// SocratIQ Multi-Agent System - CLIA Agent
// CLIA: Clinical Trials & Market Intelligence
// Domain: Market Analysis and Clinical Trial Intelligence
// Created: October 22, 2025

import { retrieveFromCorpus } from '../../shared/corpus-retrieval';
import { invokeClaude } from '../../shared/bedrock-client';
import { AGENT_SYSTEM_PROMPTS } from '../../shared/agent-prompts';
import {
  AgentRequest,
  AgentResponse,
  CLIASubAgent,
  CorpusDocument
} from '../../shared/types';
import {
  generateTraceId,
  parseLambdaEvent,
  buildLambdaResponse,
  formatErrorResponse,
  logInfo,
  logError,
  checkRequiredEnvVars
} from '../../shared/utils';

const CORPUS_BUCKET = process.env.CLIA_CORPUS_BUCKET || 'socratiq-clia-corpus-prod';

export async function handler(event: any): Promise<any> {
  const startTime = Date.now();
  const traceId = generateTraceId();

  try {
    checkRequiredEnvVars(['CLIA_CORPUS_BUCKET']);
    logInfo('CLIA agent invoked', { traceId });

    const request: AgentRequest = parseLambdaEvent(event);

    if (!request.query) {
      return buildLambdaResponse(400, formatErrorResponse({
        error: 'ValidationError',
        message: 'Missing required field: query',
        statusCode: 400,
        traceId
      }));
    }

    const subAgent = request.subAgent as CLIASubAgent || detectCLIASubAgent(request.query);
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
    const systemPrompt = AGENT_SYSTEM_PROMPTS.CLIA[subAgent];

    const claudeResponse = await invokeClaude({
      systemPrompt,
      userMessage,
      corpusContext,
      maxTokens: 4096,
      temperature: 0.1
    });

    const response: AgentResponse = {
      agent: 'CLIA',
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

    logInfo('CLIA agent response generated', { traceId, subAgent, confidence: response.confidence });
    return buildLambdaResponse(200, response);

  } catch (error) {
    logError('CLIA agent error', error, { traceId });
    return buildLambdaResponse(500, formatErrorResponse({
      error: 'InternalError',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
      traceId
    }));
  }
}

function detectCLIASubAgent(query: string): CLIASubAgent {
  const queryLower = query.toLowerCase();

  const keywords = {
    'CLIA-Market': ['market', 'epidemiology', 'prevalence', 'incidence', 'patient population', 'market size'],
    'CLIA-Competitive': ['competitive', 'competitor', 'landscape', 'pipeline', 'benchmark', 'positioning'],
    'CLIA-Clinical': ['clinical trial', 'study design', 'comparator', 'endpoint', 'nct'],
    'CLIA-Timeline': ['timeline', 'milestone', 'gantt', 'schedule', 'critical path', 'duration'],
    'CLIA-Operations': ['operations', 'cro', 'site selection', 'vendor', 'logistics', 'recruitment']
  };

  for (const [subAgent, words] of Object.entries(keywords)) {
    if (words.some(word => queryLower.includes(word))) {
      return subAgent as CLIASubAgent;
    }
  }

  return 'CLIA-Market';
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
    if (asset.indication) message += `- Indication: ${asset.indication}\n`;
    if (asset.targetPopulation) message += `- Target Population: ${asset.targetPopulation}\n`;
    if (asset.developmentPhase) message += `- Phase: ${asset.developmentPhase}\n`;
    message += '\n';
  }
  if (request.previousResponses && request.previousResponses.length > 0) {
    message += `**Previous Agent Insights**:\n`;
    request.previousResponses.forEach(r => message += `\n**${r.agent}**: ${r.response.substring(0, 500)}...\n`);
    message += '\n';
  }
  message += `Please provide market/competitive intelligence with data citations.`;
  return message;
}
