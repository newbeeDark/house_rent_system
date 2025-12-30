/**
 * Centralized DeepSeek AI SDK Helper Module
 * 
 * This is the ONLY place where the DeepSeek AI SDK should be initialized.
 * All AI API calls throughout the application should use functions from this module.
 * 
 * DeepSeek API uses OpenAI-compatible format.
 * 
 * Usage:
 *   import { askAI, deepseekModel } from '@/lib/deepseek';
 *   const response = await askAI("Your prompt here");
 */

import OpenAI from "openai";

// Get API key from Vite environment variables
const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY as string;

if (!apiKey) {
    console.error(
        "VITE_DEEPSEEK_API_KEY is not set. Please add it to your .env file:\n" +
        "VITE_DEEPSEEK_API_KEY=your_api_key_here"
    );
}

// Initialize the OpenAI SDK with DeepSeek base URL
const openai = apiKey ? new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Required for browser-side usage
}) : null;

// DeepSeek model name
export const DEEPSEEK_MODEL = "deepseek-chat";

/**
 * Simple text generation function using DeepSeek
 * @param prompt - The text prompt to send to DeepSeek
 * @param systemPrompt - Optional system prompt for context
 * @returns The generated text response
 * @throws Error if the API call fails
 */
export async function askAI(prompt: string, systemPrompt?: string): Promise<string> {
    if (!openai) {
        throw new Error("DeepSeek API is not configured. Please check your API key.");
    }

    try {
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

        if (systemPrompt) {
            messages.push({ role: "system", content: systemPrompt });
        }
        messages.push({ role: "user", content: prompt });

        const completion = await openai.chat.completions.create({
            model: DEEPSEEK_MODEL,
            messages: messages,
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error: any) {
        console.error("DeepSeek API Error:", error);

        if (error.message?.includes('quota') || error.message?.includes('limit') || error.status === 429) {
            throw new Error("API quota exceeded. Please try again later.");
        }
        if (error.message?.includes('API_KEY') || error.message?.includes('invalid') || error.status === 401) {
            throw new Error("Invalid API key. Please check your configuration.");
        }

        throw new Error(error.message || "Failed to generate response from DeepSeek");
    }
}

/**
 * Chat completion with full message history (for RAG and conversations)
 * @param messages - Array of chat messages
 * @param maxTokens - Optional maximum tokens for response
 * @returns The generated text response
 */
export async function chatCompletion(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    maxTokens?: number
): Promise<string> {
    if (!openai) {
        throw new Error("DeepSeek API is not configured. Please check your API key.");
    }

    try {
        const completion = await openai.chat.completions.create({
            model: DEEPSEEK_MODEL,
            messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
            ...(maxTokens && { max_tokens: maxTokens })
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error: any) {
        console.error("DeepSeek API Error:", error);
        throw new Error(error.message || "Failed to generate response from DeepSeek");
    }
}

/**
 * Test the DeepSeek API connection
 * @returns Object with success status and message
 */
export async function testAIConnection(): Promise<{ success: boolean; message: string }> {
    if (!openai) {
        return { success: false, message: "API key not configured" };
    }

    try {
        const completion = await openai.chat.completions.create({
            model: DEEPSEEK_MODEL,
            messages: [{ role: "user", content: "Say 'API OK' in exactly 2 words." }],
            max_tokens: 10,
        });

        const text = completion.choices[0]?.message?.content || "";
        return { success: true, message: text || "Connected" };
    } catch (error: any) {
        return { success: false, message: error.message || "Connection failed" };
    }
}

/**
 * Check if the DeepSeek API is properly configured
 */
export function isAIConfigured(): boolean {
    return !!apiKey && !!openai;
}

/**
 * Get the OpenAI client instance (for advanced usage)
 */
export function getOpenAIClient(): OpenAI | null {
    return openai;
}
