import { chatCompletion, isAIConfigured } from '../../lib/deepseek';

/**
 * Analytics-specific AI service
 * Separate from the main property search AI to focus on
 * market analytics, charts, and area information
 */

// Session storage key for analytics chat
const ANALYTICS_CHAT_KEY = 'analytics_ai_chat_session';

export interface AnalyticsChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// Area characteristics knowledge base
const AREA_KNOWLEDGE = {
    'IOI Resort City': 'Convenient for shopping, close to IOI City Mall with extensive retail options',
    'IOI': 'Convenient for shopping, close to IOI City Mall with extensive retail options',
    'Kajang': 'Convenient transportation with MRT accessibility, well-connected to KL',
    'Evo': 'Close to UKM university, ideal for students',
    'Bangi': 'Close to UKM and other universities, popular student housing area',
    'Savanna': 'Good ecological environment with green spaces and natural surroundings',
    'Southville City': 'Large development area with many new properties, growing community'
};

/**
 * Build system prompt for analytics AI
 * Focuses on market analysis, NOT property search
 */
const buildAnalyticsSystemPrompt = (): string => {
    // Get analytics context from session storage
    let analyticsContext = '';

    try {
        const contextData = sessionStorage.getItem('admin_analytics_ai_context');
        if (contextData) {
            const context = JSON.parse(contextData);
            analyticsContext = `
CURRENT MARKET STATISTICS:
- Total Properties Listed: ${context.stats?.totalProperties || 'N/A'}
- Total Views: ${context.stats?.totalViews || 'N/A'}
- Average Monthly Rent: RM ${context.stats?.avgPrice || 'N/A'}
- Top Areas by Supply: ${context.stats?.topAreas?.join(', ') || 'N/A'}
- Most Popular Amenities: ${context.stats?.topAmenities?.join(', ') || 'N/A'}

MARKET ANALYSIS SUMMARY:
${context.aiSummary || 'Analysis not yet generated'}

RAW DATA CONTEXT:
${context.dataContext || ''}
`;
        }
    } catch (e) {
        console.warn('Could not read analytics context:', e);
    }

    // Area knowledge base
    const areaInfo = Object.entries(AREA_KNOWLEDGE)
        .map(([area, desc]) => `- ${area}: ${desc}`)
        .join('\n');

    return `You are an analytics assistant for a property rental management dashboard. You help administrators understand market trends, statistics, and area information.

YOUR ROLE:
1. Answer questions about market analytics, charts, and statistics
2. Provide insights about rental areas and their characteristics
3. Explain price trends, supply/demand patterns, and amenity preferences
4. Help interpret the dashboard charts and data

IMPORTANT - YOU SHOULD NOT:
- Help find specific properties or recommend listings
- Provide property links or IDs
- Answer questions like "Find me a studio" or "What's available under RM500"
- Handle property search requests (redirect these to the main property search)

If someone asks to find a property, politely explain: "I'm the analytics assistant focused on market data and trends. For property searches, please use the main search feature or the AI assistant on the homepage."

AREA CHARACTERISTICS (for reference when discussing locations):
${areaInfo}
${analyticsContext}
GUIDELINES:
- Focus on data analysis and market insights
- Use the statistics and chart data provided above
- When discussing areas, mention their unique characteristics
- Be informative about pricing trends and supply patterns
- Keep responses professional and data-driven`;
};

/**
 * Send message to analytics AI
 */
export const sendAnalyticsMessage = async (
    userMessage: string,
    chatHistory: AnalyticsChatMessage[]
): Promise<string> => {
    if (!isAIConfigured()) {
        return "❌ AI service is not available. Please check your API key configuration.";
    }

    try {
        const systemPrompt = buildAnalyticsSystemPrompt();

        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            { role: 'system', content: systemPrompt }
        ];

        // Add recent conversation history (last 6 messages to save tokens)
        chatHistory.slice(-6).forEach(msg => {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        });

        // Add current user message
        messages.push({
            role: 'user',
            content: userMessage
        });

        const response = await chatCompletion(messages, 1500);
        return response || "I apologize, but I couldn't generate a response. Please try again.";
    } catch (error: any) {
        console.error('Error calling Analytics AI:', error);

        if (error.message?.includes('quota') || error.message?.includes('limit')) {
            return "⚠️ API quota exceeded. Please try again later.";
        }

        return `❌ Error: ${error.message || 'Failed to get AI response'}`;
    }
};

/**
 * Save analytics chat history to session storage
 */
export const saveAnalyticsChatHistory = (messages: AnalyticsChatMessage[]): void => {
    try {
        sessionStorage.setItem(ANALYTICS_CHAT_KEY, JSON.stringify(messages));
    } catch (err) {
        console.error('Error saving analytics chat history:', err);
    }
};

/**
 * Load analytics chat history from session storage
 */
export const loadAnalyticsChatHistory = (): AnalyticsChatMessage[] => {
    try {
        const stored = sessionStorage.getItem(ANALYTICS_CHAT_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }));
        }
    } catch (err) {
        console.error('Error loading analytics chat history:', err);
    }
    return [];
};

/**
 * Clear analytics chat history
 */
export const clearAnalyticsChatHistory = (): void => {
    try {
        sessionStorage.removeItem(ANALYTICS_CHAT_KEY);
    } catch (err) {
        console.error('Error clearing analytics chat history:', err);
    }
};
