// SocratIQ Multi-Agent System - Corpus Retrieval Module
// Created: October 22, 2025

import { S3Client, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { CorpusDocument, CorpusRetrievalParams, SubAgentName } from './types';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });

/**
 * Retrieve relevant documents from agent's S3 corpus bucket
 *
 * Phase 1: Simple keyword-based retrieval with term frequency scoring
 * Phase 2: Can be enhanced with embeddings-based semantic search
 */
export async function retrieveFromCorpus(params: CorpusRetrievalParams): Promise<CorpusDocument[]> {
  const {
    bucket,
    query,
    subAgent,
    maxResults = 5,
    minRelevanceScore = 0.1
  } = params;

  try {
    // 1. List all documents in the corpus bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: 'documents/'
    });

    const listResponse = await s3Client.send(listCommand);

    if (!listResponse.Contents || listResponse.Contents.length === 0) {
      console.log(`No documents found in bucket: ${bucket}`);
      return [];
    }

    // 2. Retrieve and score each document
    const scoredDocuments: CorpusDocument[] = [];

    for (const object of listResponse.Contents) {
      if (!object.Key || object.Key.endsWith('/')) continue;

      try {
        // Fetch document content
        const getCommand = new GetObjectCommand({
          Bucket: bucket,
          Key: object.Key
        });

        const getResponse = await s3Client.send(getCommand);
        const content = await streamToString(getResponse.Body);

        // Score relevance
        const relevanceScore = calculateRelevanceScore(query, content, subAgent);

        if (relevanceScore >= minRelevanceScore) {
          scoredDocuments.push({
            title: extractTitle(content) || object.Key.split('/').pop() || 'Untitled',
            url: extractUrl(content) || `s3://${bucket}/${object.Key}`,
            excerpt: extractRelevantExcerpt(content, query, 500),
            relevanceScore,
            source: extractSource(content) || 'Internal Corpus',
            legalStatus: extractLegalStatus(content) || 'Unknown',
            dateAccessed: new Date().toISOString(),
            category: object.Key.split('/')[1] || 'general',
            metadata: {
              s3Key: object.Key,
              s3Bucket: bucket,
              lastModified: object.LastModified?.toISOString(),
              size: object.Size
            }
          });
        }
      } catch (error) {
        console.error(`Error retrieving document ${object.Key}:`, error);
        continue;
      }
    }

    // 3. Sort by relevance and return top results
    const topDocuments = scoredDocuments
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    console.log(`Retrieved ${topDocuments.length} relevant documents from ${bucket}`);

    return topDocuments;

  } catch (error) {
    console.error('Error retrieving corpus documents:', error);
    throw new Error(`Corpus retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate relevance score using simple term frequency
 * Higher score = more relevant to the query
 */
function calculateRelevanceScore(query: string, content: string, subAgent?: SubAgentName): number {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();

  let score = 0;

  // Term frequency scoring
  for (const term of queryTerms) {
    const regex = new RegExp(term, 'gi');
    const matches = contentLower.match(regex);
    if (matches) {
      score += matches.length * 0.1;
    }
  }

  // Boost score for sub-agent specific keywords
  if (subAgent) {
    const subAgentKeywords = getSubAgentKeywords(subAgent);
    for (const keyword of subAgentKeywords) {
      if (contentLower.includes(keyword.toLowerCase())) {
        score += 0.5;
      }
    }
  }

  // Normalize score to 0-1 range
  return Math.min(score / 10, 1);
}

/**
 * Get keywords associated with each sub-agent for relevance boosting
 */
function getSubAgentKeywords(subAgent: SubAgentName): string[] {
  const keywordMap: Record<string, string[]> = {
    // VERA sub-agents
    'VERA-Product': ['product', 'positioning', 'differentiation', 'formulation', 'delivery'],
    'VERA-Clinical': ['trial', 'protocol', 'enrollment', 'endpoint', 'phase', 'recruitment'],
    'VERA-Biomarker': ['biomarker', 'diagnostic', 'companion', 'cdx', 'patient selection'],
    'VERA-CMC': ['manufacturing', 'cmc', 'scale-up', 'supply chain', 'gmp'],
    'VERA-Strategic': ['partnership', 'licensing', 'alliance', 'collaboration', 'deal'],
    'VERA-Development': ['crada', 'federal', 'sbir', 'sttr', 'government', 'nih', 'dod'],

    // FINN sub-agents
    'FINN-Budget': ['budget', 'burn rate', 'runway', 'cost', 'expense'],
    'FINN-Pricing': ['pricing', 'reimbursement', 'payer', 'icer', 'qaly'],
    'FINN-Exit': ['exit', 'acquisition', 'm&a', 'valuation', 'comparable'],
    'FINN-Partnerships': ['deal terms', 'milestone', 'royalty', 'upfront', 'payment'],
    'FINN-Risk': ['risk', 'sensitivity', 'scenario', 'probability', 'monte carlo'],
    'FINN-ROI': ['roi', 'npv', 'rnpv', 'irr', 'wacc', 'discount rate'],

    // NORA sub-agents
    'NORA-Regulatory': ['fda', 'ema', 'regulatory', 'approval', 'pathway', '505b2', 'bla'],
    'NORA-IP': ['patent', 'intellectual property', 'claim', 'prosecution', 'freedom to operate'],
    'NORA-Legal': ['contract', 'agreement', 'compliance', 'liability', 'indemnification'],
    'NORA-FedScout': ['federal', 'crada', 'government', 'nih', 'dod', 'technology transfer'],
    'NORA-Compliance': ['compliance', 'regulation', 'gcp', 'gmp', 'audit', 'inspection'],
    'NORA-Intelligence': ['competitive intelligence', 'patent landscape', 'regulatory intelligence'],

    // CLIA sub-agents
    'CLIA-Market': ['market', 'epidemiology', 'prevalence', 'incidence', 'patient population'],
    'CLIA-Clinical': ['clinical trial', 'study design', 'comparator', 'endpoints'],
    'CLIA-Timeline': ['timeline', 'milestone', 'gannt', 'critical path', 'schedule'],
    'CLIA-Competitive': ['competitive', 'landscape', 'competitor', 'pipeline', 'benchmark'],
    'CLIA-Operations': ['operations', 'cro', 'site selection', 'logistics', 'vendor']
  };

  return keywordMap[subAgent] || [];
}

/**
 * Extract relevant excerpt from document content
 */
function extractRelevantExcerpt(content: string, query: string, maxLength: number): string {
  const queryTerms = query.toLowerCase().split(/\s+/);
  const sentences = content.split(/[.!?]\s+/);

  // Find sentences containing query terms
  const relevantSentences = sentences.filter(sentence => {
    const sentenceLower = sentence.toLowerCase();
    return queryTerms.some(term => sentenceLower.includes(term));
  });

  if (relevantSentences.length === 0) {
    // Return first few sentences if no match
    return sentences.slice(0, 3).join('. ').substring(0, maxLength) + '...';
  }

  // Return most relevant sentences
  const excerpt = relevantSentences.slice(0, 3).join('. ');
  return excerpt.length > maxLength
    ? excerpt.substring(0, maxLength) + '...'
    : excerpt;
}

/**
 * Extract title from markdown document
 */
function extractTitle(content: string): string | null {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : null;
}

/**
 * Extract source URL from document metadata
 */
function extractUrl(content: string): string | null {
  const urlMatch = content.match(/\*\*Source URL\*\*:\s*(.+)$/m);
  return urlMatch ? urlMatch[1].trim() : null;
}

/**
 * Extract source attribution from document
 */
function extractSource(content: string): string | null {
  const sourceMatch = content.match(/\*\*Source\*\*:\s*(.+)$/m);
  return sourceMatch ? sourceMatch[1].trim() : null;
}

/**
 * Extract legal status from document metadata
 */
function extractLegalStatus(content: string): string | null {
  const legalMatch = content.match(/\*\*Legal Status\*\*:\s*(.+)$/m);
  return legalMatch ? legalMatch[1].trim() : null;
}

/**
 * Convert AWS SDK stream to string
 */
async function streamToString(stream: any): Promise<string> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf-8');
}

/**
 * Retrieve attribution metadata for legal compliance
 */
export async function retrieveAttributionMetadata(bucket: string): Promise<any> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: 'CORPUS_ATTRIBUTION_METADATA.json'
    });

    const response = await s3Client.send(command);
    const content = await streamToString(response.Body);

    return JSON.parse(content);
  } catch (error) {
    console.error('Error retrieving attribution metadata:', error);
    return null;
  }
}
