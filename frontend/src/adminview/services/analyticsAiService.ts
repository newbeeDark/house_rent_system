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
 * 清除分析聊天历史
 */
export const clearAnalyticsChatHistory = (): void => {
    try {
        sessionStorage.removeItem(ANALYTICS_CHAT_KEY);
    } catch (err) {
        console.error('Error clearing analytics chat history:', err);
    }
};

/**
 * 图表数据接口 - 用于生成AI分析报告
 * Chart data interface for generating AI analysis report
 */
export interface ChartDataForReport {
    label: string;
    value: number;
}

/**
 * AI分析报告生成参数接口
 * Parameters interface for AI analysis report generation
 */
export interface AnalyticsReportParams {
    regionalData: ChartDataForReport[];    // 区域分布数据
    priceData: ChartDataForReport[];       // 价格分布数据
    amenitiesData: ChartDataForReport[];   // 设施数据
    popularityData: ChartDataForReport[];  // 热门区域数据
    popMetric: 'views' | 'applications';   // 热门指标类型
    totalProperties: number;               // 总房产数量
    totalViews: number;                    // 总浏览量
    avgPrice: number;                      // 平均价格
}

/**
 * 生成AI分析报告
 * 调用DeepSeek API分析市场数据并生成专业报告
 * Generate AI analysis report by calling DeepSeek API
 */
export const generateAiAnalysisReport = async (
    params: AnalyticsReportParams
): Promise<string[]> => {
    // 检查AI服务是否已配置
    if (!isAIConfigured()) {
        throw new Error("AI service is not available. Please check your API key configuration.");
    }

    try {
        // 构建分析上下文 - 将图表数据格式化为易于AI理解的文本
        const regionalSummary = params.regionalData
            .slice(0, 8)
            .map(d => `${d.label}: ${d.value} properties`)
            .join(', ');

        const priceSummary = params.priceData
            .map(d => `${d.label}: ${d.value} properties`)
            .join(', ');

        const amenitiesSummary = params.amenitiesData
            .slice(0, 8)
            .map(d => `${d.label}: ${d.value} properties`)
            .join(', ');

        const popularitySummary = params.popularityData
            .slice(0, 6)
            .map(d => `${d.label}: ${d.value} ${params.popMetric}`)
            .join(', ');

        // 构建AI提示词 - 指导AI生成专业的市场分析报告
        const systemPrompt = `You are a professional real estate market analyst. Generate a comprehensive market analysis report based on the provided data.

AREA KNOWLEDGE (for context):
- IOI Resort City: Convenient for shopping, close to IOI City Mall with extensive retail options
- IOI: Convenient for shopping, close to IOI City Mall
- Kajang: Convenient transportation with MRT accessibility, well-connected to KL
- Evo: Close to UKM university, ideal for students
- Bangi: Close to UKM and other universities, popular student housing area
- Savanna: Good ecological environment with green spaces
- Southville City: Large development area with many new properties

OUTPUT FORMAT:
Return EXACTLY 4 paragraphs separated by ||PARA||
- Paragraph 1: Regional distribution analysis (supply concentration, market hotspots)
- Paragraph 2: Pricing analysis (price segment distribution, affordability)
- Paragraph 3: Amenity preferences analysis (tenant expectations, popular features)
- Paragraph 4: Recommendations for landlords and tenants

Keep each paragraph 2-4 sentences. Be specific with data. Do not include any markdown formatting or bullet points.`;

        const userPrompt = `Analyze this property market data:

MARKET OVERVIEW:
- Total Properties Listed: ${params.totalProperties}
- Total Views: ${params.totalViews}
- Average Monthly Rent: RM ${params.avgPrice}

REGIONAL DISTRIBUTION:
${regionalSummary}

PRICE DISTRIBUTION:
${priceSummary}

TOP AMENITIES:
${amenitiesSummary}

DEMAND HEATMAP (by ${params.popMetric}):
${popularitySummary}

Generate a professional 4-paragraph market analysis report.`;

        // 构建消息数组
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        // 调用DeepSeek API生成分析报告
        const response = await chatCompletion(messages, 2000);

        if (!response) {
            throw new Error('Empty response from AI service');
        }

        // 解析AI响应 - 按段落分隔符拆分
        const paragraphs = response
            .split('||PARA||')
            .map(p => p.trim())
            .filter(p => p.length > 0);

        // 确保返回4个段落，不足则补充默认段落
        while (paragraphs.length < 4) {
            paragraphs.push('Analysis data insufficient for this section.');
        }

        return paragraphs.slice(0, 4);
    } catch (error: any) {
        console.error('Error generating AI analysis report:', error);
        throw error;
    }
};
