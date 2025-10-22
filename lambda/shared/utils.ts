// SocratIQ Multi-Agent System - Utility Functions
// Created: October 22, 2025

import { v4 as uuidv4 } from 'uuid';
import { TraceMetadata, AgentName, ErrorResponse } from './types';

/**
 * Generate unique trace ID for request tracking
 */
export function generateTraceId(): string {
  return `trace-${Date.now()}-${uuidv4().substring(0, 8)}`;
}

/**
 * Create trace metadata for audit trail
 */
export function createTraceMetadata(params: {
  traceId: string;
  userId?: string;
  assetId?: string;
  agentsInvoked: AgentName[];
  startTime: number;
  success: boolean;
  errorMessage?: string;
}): TraceMetadata {
  return {
    traceId: params.traceId,
    userId: params.userId,
    assetId: params.assetId,
    agentsInvoked: params.agentsInvoked,
    timestamp: new Date().toISOString(),
    duration: Date.now() - params.startTime,
    success: params.success,
    errorMessage: params.errorMessage
  };
}

/**
 * Format error response consistently
 */
export function formatErrorResponse(params: {
  error: string;
  message: string;
  statusCode: number;
  traceId?: string;
}): ErrorResponse {
  return {
    error: params.error,
    message: params.message,
    statusCode: params.statusCode,
    traceId: params.traceId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Build Lambda response object
 */
export function buildLambdaResponse(statusCode: number, body: any): any {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

/**
 * Parse Lambda event body (handles both direct invocation and API Gateway)
 */
export function parseLambdaEvent(event: any): any {
  // Direct Lambda invocation
  if (event.query || event.message) {
    return event;
  }

  // API Gateway invocation
  if (event.body) {
    try {
      return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    } catch (error) {
      throw new Error('Invalid JSON in request body');
    }
  }

  throw new Error('Unable to parse Lambda event');
}

/**
 * Validate required fields in request
 */
export function validateRequest(data: any, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Extract confidence level from text response
 * Looks for phrases like "high confidence", "60-80% probability", etc.
 */
export function extractConfidenceFromText(text: string): number {
  const confidencePhrases = {
    'high confidence': 0.9,
    'very confident': 0.9,
    'strong evidence': 0.85,
    'moderate confidence': 0.7,
    'medium confidence': 0.7,
    'some confidence': 0.6,
    'low confidence': 0.4,
    'uncertain': 0.3,
    'highly uncertain': 0.2
  };

  const textLower = text.toLowerCase();

  // Check for explicit confidence phrases
  for (const [phrase, score] of Object.entries(confidencePhrases)) {
    if (textLower.includes(phrase)) {
      return score;
    }
  }

  // Check for percentage expressions (e.g., "60-80% probability")
  const percentMatch = textLower.match(/(\d+)[-–](\d+)%/);
  if (percentMatch) {
    const low = parseInt(percentMatch[1]);
    const high = parseInt(percentMatch[2]);
    return (low + high) / 200; // Convert to 0-1 scale and take average
  }

  // Check for single percentage (e.g., "75% confidence")
  const singlePercentMatch = textLower.match(/(\d+)%/);
  if (singlePercentMatch) {
    return parseInt(singlePercentMatch[1]) / 100;
  }

  // Default confidence if no explicit mention
  return 0.75;
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Sleep for specified milliseconds (useful for retry logic)
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Exponential backoff retry logic
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delayMs = baseDelayMs * Math.pow(2, attempt);
      console.log(`Attempt ${attempt + 1} failed. Retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }

  throw lastError || new Error('Retry failed with unknown error');
}

/**
 * Log to CloudWatch with structured format
 */
export function logInfo(message: string, metadata?: any): void {
  console.log(JSON.stringify({
    level: 'INFO',
    message,
    timestamp: new Date().toISOString(),
    ...metadata
  }));
}

export function logError(message: string, error?: any, metadata?: any): void {
  console.error(JSON.stringify({
    level: 'ERROR',
    message,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    timestamp: new Date().toISOString(),
    ...metadata
  }));
}

export function logWarning(message: string, metadata?: any): void {
  console.warn(JSON.stringify({
    level: 'WARNING',
    message,
    timestamp: new Date().toISOString(),
    ...metadata
  }));
}

/**
 * Sanitize user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/[{}]/g, '') // Remove curly braces
    .trim();
}

/**
 * Check if environment variables are set
 */
export function checkRequiredEnvVars(requiredVars: string[]): void {
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): string {
  const change = ((newValue - oldValue) / oldValue) * 100;
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

/**
 * Deep clone object (simple JSON-based approach)
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
