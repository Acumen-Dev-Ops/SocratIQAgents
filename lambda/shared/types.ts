// SocratIQ Multi-Agent System - Shared TypeScript Types
// Created: October 22, 2025

/**
 * Core domain agent types
 */
export type AgentName = 'VERA' | 'FINN' | 'NORA' | 'CLIA' | 'Sophie';

export type VERASubAgent =
  | 'VERA-Product'
  | 'VERA-Clinical'
  | 'VERA-Biomarker'
  | 'VERA-CMC'
  | 'VERA-Strategic'
  | 'VERA-Development';

export type FINNSubAgent =
  | 'FINN-Budget'
  | 'FINN-Pricing'
  | 'FINN-Exit'
  | 'FINN-Partnerships'
  | 'FINN-Risk'
  | 'FINN-ROI';

export type NORASubAgent =
  | 'NORA-Regulatory'
  | 'NORA-IP'
  | 'NORA-Legal'
  | 'NORA-FedScout'
  | 'NORA-Compliance'
  | 'NORA-Intelligence';

export type CLIASubAgent =
  | 'CLIA-Market'
  | 'CLIA-Clinical'
  | 'CLIA-Timeline'
  | 'CLIA-Competitive'
  | 'CLIA-Operations';

export type SubAgentName = VERASubAgent | FINNSubAgent | NORASubAgent | CLIASubAgent;

/**
 * Asset context provided with queries
 */
export interface AssetContext {
  assetId: string;
  productName?: string;
  indication?: string;
  developmentPhase?: string;
  mechanismOfAction?: string;
  targetPopulation?: string;
  peakSales?: number;
  cashRunway?: number;
  fundingStatus?: string;
  regulatoryPath?: string;
  [key: string]: any;
}

/**
 * Corpus document structure
 */
export interface CorpusDocument {
  title: string;
  url: string;
  excerpt: string;
  relevanceScore: number;
  source: string;
  legalStatus: string;
  dateAccessed: string;
  category?: string;
  metadata?: Record<string, any>;
}

/**
 * Source citation in agent responses
 */
export interface SourceCitation {
  title: string;
  url: string;
  excerpt?: string;
  relevanceScore?: number;
}

/**
 * Agent request payload
 */
export interface AgentRequest {
  query: string;
  assetContext?: AssetContext;
  subAgent?: SubAgentName;
  metadata?: Record<string, any>;
  previousResponses?: AgentResponse[];
}

/**
 * Agent response payload
 */
export interface AgentResponse {
  agent: AgentName;
  subAgent?: SubAgentName;
  response: string;
  sources: SourceCitation[];
  confidence: number;
  timestamp: string;
  traceId?: string;
  metadata?: Record<string, any>;
}

/**
 * Sophie query classification result
 */
export interface AgentPlan {
  agents: AgentName[];
  invocationPattern: 'parallel' | 'sequential';
  reasoning: string;
  priority?: number;
}

/**
 * Sophie synthesis result
 */
export interface SophieSynthesis {
  recommendation: string;
  mechanisticAnalysis?: string;
  deterministicScoring?: string;
  probabilisticRisk?: string;
  confidence: number;
  sources: SourceCitation[];
  agentContributions: Record<AgentName, string>;
  traceId: string;
  conflicts?: string[];
  timestamp: string;
}

/**
 * Bedrock Claude request parameters
 */
export interface BedrockClaudeRequest {
  systemPrompt: string;
  userMessage: string;
  corpusContext?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

/**
 * Bedrock Claude response
 */
export interface BedrockClaudeResponse {
  content: string;
  stopReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  confidence?: number;
}

/**
 * Corpus retrieval parameters
 */
export interface CorpusRetrievalParams {
  bucket: string;
  query: string;
  subAgent?: SubAgentName;
  maxResults?: number;
  minRelevanceScore?: number;
}

/**
 * Lambda invocation result
 */
export interface LambdaInvocationResult {
  statusCode: number;
  payload: any;
  functionError?: string;
  logResult?: string;
}

/**
 * Trace metadata for audit trail
 */
export interface TraceMetadata {
  traceId: string;
  userId?: string;
  assetId?: string;
  agentsInvoked: AgentName[];
  timestamp: string;
  duration: number;
  success: boolean;
  errorMessage?: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  traceId?: string;
  timestamp: string;
}
