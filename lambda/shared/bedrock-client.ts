// SocratIQ Multi-Agent System - AWS Bedrock Client Module
// Created: October 22, 2025

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { BedrockClaudeRequest, BedrockClaudeResponse } from './types';

const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1'
});

// Bedrock model configuration
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'us.anthropic.claude-3-5-sonnet-20241022-v2:0';
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.1;

/**
 * Invoke AWS Bedrock Claude 3.5 Sonnet model
 * Returns structured response with content and usage metrics
 */
export async function invokeClaude(request: BedrockClaudeRequest): Promise<BedrockClaudeResponse> {
  const {
    systemPrompt,
    userMessage,
    corpusContext,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    topP = 0.9
  } = request;

  try {
    // Build the complete user message with corpus context
    let fullUserMessage = userMessage;

    if (corpusContext && corpusContext.trim().length > 0) {
      fullUserMessage = `
<corpus_context>
${corpusContext}
</corpus_context>

<user_query>
${userMessage}
</user_query>

Please provide a detailed, evidence-based response using the corpus context above. Always cite specific sources when making claims.
`;
    }

    // Prepare Bedrock request payload
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: maxTokens,
      temperature: temperature,
      top_p: topP,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: fullUserMessage
        }
      ]
    };

    console.log(`Invoking Bedrock model: ${MODEL_ID}`);
    console.log(`Tokens requested: ${maxTokens}, Temperature: ${temperature}`);

    // Invoke Bedrock
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(payload)
    });

    const response = await bedrockClient.send(command);

    // Parse response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    console.log(`Bedrock response received. Stop reason: ${responseBody.stop_reason}`);
    console.log(`Token usage - Input: ${responseBody.usage.input_tokens}, Output: ${responseBody.usage.output_tokens}`);

    // Extract content from response
    const content = responseBody.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n');

    // Calculate confidence score based on response characteristics
    const confidence = calculateConfidence(content, responseBody);

    return {
      content,
      stopReason: responseBody.stop_reason,
      usage: {
        inputTokens: responseBody.usage.input_tokens,
        outputTokens: responseBody.usage.output_tokens
      },
      confidence
    };

  } catch (error) {
    console.error('Error invoking Bedrock Claude:', error);

    if (error instanceof Error) {
      // Handle specific Bedrock errors
      if (error.message.includes('ThrottlingException')) {
        throw new Error('Bedrock rate limit exceeded. Please retry after a moment.');
      }
      if (error.message.includes('ValidationException')) {
        throw new Error('Invalid request parameters for Bedrock model.');
      }
    }

    throw new Error(`Bedrock invocation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Calculate confidence score based on response characteristics
 * Returns value between 0-1
 */
function calculateConfidence(content: string, responseBody: any): number {
  let confidence = 0.7; // Base confidence

  // Boost confidence if response includes source citations
  const citationCount = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
  confidence += Math.min(citationCount * 0.05, 0.2);

  // Boost confidence if response is substantive (not too short)
  if (content.length > 500) {
    confidence += 0.05;
  }

  // Reduce confidence if response stopped due to max tokens (incomplete)
  if (responseBody.stop_reason === 'max_tokens') {
    confidence -= 0.15;
  }

  // Reduce confidence if response includes uncertainty phrases
  const uncertaintyPhrases = [
    'not sure',
    'unclear',
    'unknown',
    'insufficient information',
    'cannot determine',
    'may or may not',
    'it depends'
  ];

  const contentLower = content.toLowerCase();
  const uncertaintyCount = uncertaintyPhrases.filter(phrase =>
    contentLower.includes(phrase)
  ).length;

  confidence -= uncertaintyCount * 0.05;

  // Ensure confidence stays within 0-1 range
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Invoke Claude for query classification (used by Sophie)
 * Returns JSON response for routing decisions
 */
export async function invokeClaudeForClassification(
  userQuery: string,
  systemPrompt: string
): Promise<any> {
  try {
    const response = await invokeClaude({
      systemPrompt,
      userMessage: userQuery,
      maxTokens: 1000,
      temperature: 0 // Use deterministic temperature for classification
    });

    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Classification response did not contain valid JSON');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error in query classification:', error);
    throw error;
  }
}

/**
 * Health check function to verify Bedrock connectivity
 */
export async function testBedrockConnection(): Promise<boolean> {
  try {
    const response = await invokeClaude({
      systemPrompt: 'You are a helpful assistant.',
      userMessage: 'Reply with "OK" if you can read this message.',
      maxTokens: 100,
      temperature: 0
    });

    return response.content.includes('OK');
  } catch (error) {
    console.error('Bedrock connection test failed:', error);
    return false;
  }
}
