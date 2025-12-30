import { supabase } from '../../lib/supabase';
import {
    chatCompletion,
    testAIConnection,
    isAIConfigured
} from '../../lib/deepseek';

// Types - matching actual database schema
export interface Property {
    id: string;
    title: string;
    price: number;
    address: string;  // Database uses 'address' not 'location'
    area?: string;
    category?: string;  // Database uses 'category' not 'type'
    beds: number;  // Database uses 'beds' not 'bedrooms'
    bathrooms?: number;
    status?: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Storage Keys
const CHAT_HISTORY_KEY = 'ai_chat_session';

/**
 * Test if the DeepSeek API is available and working
 * Uses the centralized deepseek.ts helper
 */
export const testAPIConnection = async (): Promise<{ success: boolean; message: string }> => {
    if (!isAIConfigured()) {
        return { success: false, message: "API key not configured" };
    }
    return testAIConnection();
};

/**
 * Fetch top 30 available properties from Supabase for RAG context
 * Uses correct database column names
 */
export const fetchPropertiesForRAG = async (): Promise<Property[]> => {
    try {
        const { data, error } = await supabase
            .from('properties')
            .select('id, title, price, address, area, category, beds, bathrooms, status')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) {
            console.error('Error fetching properties for RAG:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Error in fetchPropertiesForRAG:', err);
        return [];
    }
};

/**
 * Get analytics context from sessionStorage (set by AdminAnalyticsReport)
 */
const getAnalyticsContext = (): string => {
    try {
        const contextData = sessionStorage.getItem('admin_analytics_ai_context');
        if (contextData) {
            const context = JSON.parse(contextData);
            return `

MARKET ANALYTICS CONTEXT (from admin analytics):
- Total Properties: ${context.stats?.totalProperties || 'N/A'}
- Total Views: ${context.stats?.totalViews || 'N/A'}
- Average Price: RM ${context.stats?.avgPrice || 'N/A'}/month
- Top Areas: ${context.stats?.topAreas?.join(', ') || 'N/A'}
- Popular Amenities: ${context.stats?.topAmenities?.join(', ') || 'N/A'}

AI MARKET SUMMARY:
${context.aiSummary || 'No summary available'}
`;
        }
    } catch (e) {
        console.warn('Could not read analytics context:', e);
    }
    return '';
};

/**
 * Build system prompt with property context including IDs for linking
 */
const buildSystemPrompt = (properties: Property[]): string => {
    // Include property ID so AI can format links
    const propertyContext = properties.map(p =>
        `- [ID:${p.id}] "${p.title}": RM${p.price}/month, ${p.address}${p.area ? ` (${p.area})` : ''}, ${p.category || 'N/A'}, ${p.beds} bed${p.bathrooms ? `, ${p.bathrooms} bath` : ''}`
    ).join('\n');

    // Get analytics context if available
    const analyticsContext = getAnalyticsContext();

    return `You are an intelligent housing rental assistant for a university student housing platform near UKM (Universiti Kebangsaan Malaysia) in Bangi, Selangor, Malaysia.

Your role is to:
1. Help users find suitable rental properties based on their needs (budget, location, room type, etc.)
2. Answer questions about properties, rental processes, and the local area
3. Provide helpful recommendations based on available listings
4. If asked about market trends, analytics, or statistics, use the MARKET ANALYTICS CONTEXT below

AVAILABLE PROPERTIES (Real-time data from our database):
${propertyContext || 'No properties currently available.'}
${analyticsContext}
IMPORTANT FORMATTING RULES:
- When recommending a specific property, ALWAYS format it as a clickable link using this exact format: [Property Title](/property/PROPERTY_ID)
- Example: If recommending property with ID "abc123" and title "Cozy Studio", write: [Cozy Studio](/property/abc123)
- This format creates clickable links for users to view property details
- Always include the link when mentioning a specific property from the list

GUIDELINES:
- Be friendly, professional, and helpful
- When recommending properties, mention specific listings from the available data above WITH LINKS
- Format prices in Malaysian Ringgit (RM)
- If a user's requirements cannot be matched, suggest alternatives or ask clarifying questions
- Keep responses concise but informative
- You can discuss general rental advice, area information, or nearby amenities
- If asked about analytics or market trends, reference the MARKET ANALYTICS CONTEXT data
- If asked about something outside housing/rental topics, politely redirect to housing-related assistance

Remember: Only recommend properties from the AVAILABLE PROPERTIES list above and always include clickable links.`;
};

/**
 * Send message to DeepSeek AI with RAG context
 * Uses the centralized chatCompletion from src/lib/deepseek.ts
 */
export const sendMessageToAI = async (
    userMessage: string,
    chatHistory: ChatMessage[]
): Promise<string> => {
    if (!isAIConfigured()) {
        return "❌ AI service is not available. Please check your API key configuration.";
    }

    try {
        // Fetch latest properties for context
        const properties = await fetchPropertiesForRAG();

        // Build system prompt with RAG context
        const systemPrompt = buildSystemPrompt(properties);

        // Build messages array for chat completion
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            { role: 'system', content: systemPrompt }
        ];

        // Add recent conversation history (last 10 messages)
        chatHistory.slice(-10).forEach(msg => {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        });

        // Add current user message
        messages.push({
            role: 'user',
            content: `${userMessage}\n\nRemember to format any property recommendations as clickable links using [Title](/property/ID) format.`
        });

        // Generate response using DeepSeek
        const response = await chatCompletion(messages);

        return response || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error: any) {
        console.error('Error calling DeepSeek AI:', error);

        if (error.message?.includes('quota') || error.message?.includes('limit')) {
            return "⚠️ API quota exceeded. Please try again later.";
        }
        if (error.message?.includes('API_KEY') || error.message?.includes('invalid')) {
            return "❌ Invalid API key. Please check your configuration.";
        }

        return `❌ Error: ${error.message || 'Failed to get AI response'}`;
    }
};

/**
 * Save chat history to localStorage
 */
export const saveChatHistory = (messages: ChatMessage[]): void => {
    try {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (err) {
        console.error('Error saving chat history:', err);
    }
};

/**
 * Load chat history from localStorage
 */
export const loadChatHistory = (): ChatMessage[] => {
    try {
        const stored = localStorage.getItem(CHAT_HISTORY_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Convert timestamp strings back to Date objects
            return parsed.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }));
        }
    } catch (err) {
        console.error('Error loading chat history:', err);
    }
    return [];
};

/**
 * Clear chat history from localStorage
 * Call this in your logout function
 */
export const clearChatHistory = (): void => {
    try {
        localStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (err) {
        console.error('Error clearing chat history:', err);
    }
};
