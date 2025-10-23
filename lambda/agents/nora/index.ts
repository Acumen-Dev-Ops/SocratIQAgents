// SocratIQ Multi-Agent System - NORA Agent
// NORA: Legal, Regulatory & IP Intelligence
// Domain: Regulatory, Legal, and Intellectual Property
// Created: October 22, 2025

import { retrieveFromCorpus } from './shared/corpus-retrieval';
import { invokeClaude } from './shared/bedrock-client';
import { AGENT_SYSTEM_PROMPTS } from './shared/agent-prompts';
import {
  AgentRequest,
  AgentResponse,
  NORASubAgent,
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

const CORPUS_BUCKET = process.env.NORA_CORPUS_BUCKET || 'socratiq-nora-corpus-prod';

export async function handler(event: any): Promise<any> {
  const startTime = Date.now();
  const traceId = generateTraceId();

  try {
    checkRequiredEnvVars(['NORA_CORPUS_BUCKET']);
    logInfo('NORA agent invoked', { traceId });

    const request: AgentRequest = parseLambdaEvent(event);

    if (!request.query) {
      return buildLambdaResponse(400, formatErrorResponse({
        error: 'ValidationError',
        message: 'Missing required field: query',
        statusCode: 400,
        traceId
      }));
    }

    const subAgent = request.subAgent as NORASubAgent || detectNORASubAgent(request.query);
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
    const systemPrompt = AGENT_SYSTEM_PROMPTS.NORA[subAgent];

    const claudeResponse = await invokeClaude({
      systemPrompt,
      userMessage,
      corpusContext,
      maxTokens: 4096,
      temperature: 0.1
    });

    const response: AgentResponse = {
      agent: 'NORA',
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

    logInfo('NORA agent response generated', { traceId, subAgent, confidence: response.confidence });
    return buildLambdaResponse(200, response);

  } catch (error) {
    logError('NORA agent error', error, { traceId });
    return buildLambdaResponse(500, formatErrorResponse({
      error: 'InternalError',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
      traceId
    }));
  }
}

function detectNORASubAgent(query: string): NORASubAgent {
  const queryLower = query.toLowerCase();

  const keywords = {
    'NORA-FedScout': ['crada', 'federal lab', 'government', 'nih', 'dod', 'sbir', 'sttr', 'technology transfer'],
    'NORA-Regulatory': ['fda', 'ema', 'regulatory', 'approval', 'pathway', '505b2', 'bla', 'nda', 'ind'],
    'NORA-IP': ['patent', 'intellectual property', 'ip', 'freedom to operate', 'fto', 'claim', 'prosecution'],
    'NORA-Compliance': ['compliance', 'gcp', 'gmp', 'audit', 'inspection', 'quality'],
    'NORA-Legal': ['contract', 'agreement', 'legal', 'liability', 'indemnification', 'terms'],
    'NORA-Intelligence': ['competitive intelligence', 'patent landscape', 'regulatory intelligence', 'filing']
  };

  for (const [subAgent, words] of Object.entries(keywords)) {
    if (words.some(word => queryLower.includes(word))) {
      return subAgent as NORASubAgent;
    }
  }

  return 'NORA-Regulatory';
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
    if (asset.developmentPhase) message += `- Phase: ${asset.developmentPhase}\n`;
    if (asset.regulatoryPath) message += `- Regulatory Path: ${asset.regulatoryPath}\n`;
    message += '\n';
  }
  if (request.previousResponses && request.previousResponses.length > 0) {
    message += `**Previous Agent Insights**:\n`;
    request.previousResponses.forEach(r => message += `\n**${r.agent}**: ${r.response.substring(0, 500)}...\n`);
    message += '\n';
  }
  message += `Please provide regulatory/legal analysis with citations to FDA guidance and regulations.`;
  return message;
}
