import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const REQUEST_TIMEOUT_MS = 15000;

let genAI = null;
if (API_KEY && API_KEY.trim().length > 0) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

/**
 * Executes a promise with a timeout
 */
async function withTimeout(promise, ms = REQUEST_TIMEOUT_MS) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`AI service request timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extracts and cleans JSON from AI text response
 */
function extractJSON(text) {
  if (!text) return null;
  // Try raw parse first
  try {
    return JSON.parse(text);
  } catch (e) {
    // Look for markdown code fence ```json ... ``` or brackets [ ... ] / { ... }
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (err) {
        // continue
      }
    }

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(text.slice(firstBrace, lastBrace + 1));
      } catch (err) {
        // continue
      }
    }

    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(text.slice(firstBracket, lastBracket + 1));
      } catch (err) {
        // continue
      }
    }
  }
  return null;
}

/**
 * Generate standard text with timeout and 1 retry
 */
export async function generateText(prompt, systemInstruction = '', fallbackText = '') {
  if (!genAI) {
    console.warn('[AIService] No GEMINI_API_KEY configured. Using friendly fallback.');
    return fallbackText || 'AI recommendations are currently running in standard mode without an external API key.';
  }

  const runCall = async () => {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemInstruction || undefined,
    });
    const result = await withTimeout(model.generateContent(prompt));
    const response = await result.response;
    return response.text();
  };

  try {
    return await runCall();
  } catch (err1) {
    console.warn(`[AIService] First attempt failed: ${err1.message}. Retrying once...`);
    try {
      return await runCall();
    } catch (err2) {
      console.error(`[AIService] Second attempt failed: ${err2.message}. Using fallback.`);
      return fallbackText;
    }
  }
}

/**
 * Generate validated JSON using a Zod schema with timeout and 1 retry
 */
export async function generateJSON(prompt, zodSchema, fallbackData = null, systemInstruction = '') {
  if (!genAI) {
    console.warn('[AIService] No GEMINI_API_KEY configured. Returning fallback JSON.');
    return fallbackData;
  }

  const jsonPrompt = `${prompt}

IMPORTANT: You MUST respond ONLY with a valid JSON object matching the requested schema. Do not include markdown code block tags or extra commentary.`;

  const runCall = async (extraHint = '') => {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction: systemInstruction || undefined,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await withTimeout(model.generateContent(extraHint ? `${jsonPrompt}\n${extraHint}` : jsonPrompt));
    const response = await result.response;
    const text = response.text();
    const parsed = extractJSON(text);
    if (!parsed) {
      throw new Error('Failed to parse response as JSON');
    }

    if (zodSchema) {
      const validated = zodSchema.safeParse(parsed);
      if (!validated.success) {
        throw new Error(`Schema validation failed: ${validated.error.message}`);
      }
      return validated.data;
    }
    return parsed;
  };

  try {
    return await runCall();
  } catch (err1) {
    console.warn(`[AIService] Attempt 1 failed: ${err1.message}. Retrying once with strict schema reminder...`);
    try {
      return await runCall('Reminder: Return purely valid, well-formed JSON matching the exact structure.');
    } catch (err2) {
      console.error(`[AIService] Attempt 2 failed: ${err2.message}. Falling back gracefully.`);
      return fallbackData;
    }
  }
}

export default {
  generateText,
  generateJSON,
};
