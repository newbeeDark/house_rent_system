import React, { useRef, useState, useEffect } from 'react';
import { AdminCloseIcon, AdminDownloadIcon } from './UI/AdminIcons';
import { useAuth } from '../../context/AuthContext';

interface ChartData {
    label: string;
    value: number;
    color?: string;
}

interface AnalyticsReportProps {
    isOpen: boolean;
    onClose: () => void;
    // Chart data
    regionalData: ChartData[];
    priceData: ChartData[];
    amenitiesData: ChartData[];
    popularityData: ChartData[];
    popMetric: 'views' | 'applications';
    // Stats
    totalProperties: number;
    totalViews: number;
}

// Session storage keys
const AI_ANALYSIS_CACHE_KEY = 'admin_analytics_ai_summary';
const AI_CONTEXT_CACHE_KEY = 'admin_analytics_ai_context';

// Simulated AI Analysis paragraphs (to save tokens)
const SIMULATED_AI_PARAGRAPHS = [
    "The property market shows strong concentration in Southville City and IOI Resort City, which together account for over 60% of listed properties. This suggests these are key development areas with higher supply. However, demand metrics reveal a notable disconnect: IOI Resort City leads significantly with 47 average views per property, indicating high tenant interest relative to supply, while Southville City, despite having the most listings, averages only 7 views, suggesting possible oversupply or less competitive offerings.",

    "Pricing is predominantly in the premium segment, with 18 properties above RM 1500 and an average rent of RM 1521. The market heavily caters to higher budgets, with limited availability below RM 1000. Affordability is a concern for budget-conscious tenants, as options are scarce.",

    "Amenity preferences are clear and nearly universal. Security, gym, pool, and parking are standard expectations, present in over 85% of properties. In-unit features like washing machines and air conditioning are also essential, highlighting a tenant preference for convenience and modern comforts.",

    "For landlords, properties in IOI Resort City are in high demand; ensuring competitive pricing and promoting amenities could secure tenants quickly. In Southville City, differentiation through value or enhanced features may be necessary due to lower per-listing interest. For tenants, budget options are extremely limited; those seeking lower rents may need to expand their search to less saturated areas like Kajang or Bangi. Prioritizing properties with the top amenities will align with market standards."
];

export const AdminAnalyticsReport: React.FC<AnalyticsReportProps> = ({
    isOpen,
    onClose,
    regionalData,
    priceData,
    amenitiesData,
    popularityData,
    popMetric,
    totalProperties,
    totalViews
}) => {
    const { user } = useAuth();
    const reportRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // Typewriter animation state
    const [displayedParagraphs, setDisplayedParagraphs] = useState<string[]>([]);
    const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [generationComplete, setGenerationComplete] = useState(false);

    // Format current date
    const reportDate = new Date().toLocaleDateString('en-MY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Calculate analytics summaries
    const getTopAreas = () => {
        return regionalData.slice(0, 5).map(d => d.label);
    };

    const getAveragePrice = () => {
        const priceRanges: Record<string, number> = {
            '< RM 500': 350,
            'RM 500 - 1000': 750,
            'RM 1000 - 1500': 1250,
            '> RM 1500': 1750
        };
        let totalValue = 0;
        let totalCount = 0;
        priceData.forEach(d => {
            const avgPrice = priceRanges[d.label] || 1000;
            totalValue += avgPrice * d.value;
            totalCount += d.value;
        });
        return totalCount > 0 ? Math.round(totalValue / totalCount) : 0;
    };

    const getMostPopularAmenities = () => {
        return amenitiesData.slice(0, 4).map(d => d.label);
    };

    const getHottestAreas = () => {
        return popularityData.slice(0, 3).map(d => `${d.label} (${d.value} ${popMetric})`);
    };

    // Build data context for session storage
    const buildDataContext = () => {
        return `
Property Market Analytics Data:
- Total Properties: ${totalProperties}
- Total Views: ${totalViews}
- Average Price: RM ${getAveragePrice()}/month
- Top Areas: ${getTopAreas().join(', ')}
- Popular Amenities: ${getMostPopularAmenities().join(', ')}
`;
    };

    // Save context to sessionStorage
    const saveContextToSession = (summary: string) => {
        try {
            const context = {
                dataContext: buildDataContext(),
                aiSummary: summary,
                timestamp: new Date().toISOString(),
                stats: {
                    totalProperties,
                    totalViews,
                    avgPrice: getAveragePrice(),
                    topAreas: getTopAreas(),
                    topAmenities: getMostPopularAmenities()
                }
            };
            sessionStorage.setItem(AI_CONTEXT_CACHE_KEY, JSON.stringify(context));
        } catch (e) {
            console.warn('Failed to save AI context to session:', e);
        }
    };

    // Fast simulated AI generation - completes in ~2 seconds
    const startSimulatedGeneration = async () => {
        // Check cache first
        const cacheKey = `${AI_ANALYSIS_CACHE_KEY}_${totalProperties}_${totalViews}`;
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                setDisplayedParagraphs(SIMULATED_AI_PARAGRAPHS);
                setGenerationComplete(true);
                saveContextToSession(SIMULATED_AI_PARAGRAPHS.join('\n\n'));
                return;
            }
        } catch (e) {
            console.warn('Cache read error:', e);
        }

        setIsGenerating(true);
        setDisplayedParagraphs([]);
        setCurrentParagraphIndex(0);
        setCurrentCharIndex(0);

        // Short loading delay - 500ms
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsGenerating(false);
        setIsTyping(true);
    };

    // Fast typewriter effect - ~2 seconds total for all paragraphs
    useEffect(() => {
        if (!isTyping || currentParagraphIndex >= SIMULATED_AI_PARAGRAPHS.length) {
            if (isTyping && currentParagraphIndex >= SIMULATED_AI_PARAGRAPHS.length) {
                setIsTyping(false);
                setGenerationComplete(true);
                // Cache and save to session
                const fullText = SIMULATED_AI_PARAGRAPHS.join('\n\n');
                const cacheKey = `${AI_ANALYSIS_CACHE_KEY}_${totalProperties}_${totalViews}`;
                try {
                    sessionStorage.setItem(cacheKey, fullText);
                } catch (e) {
                    console.warn('Cache write error:', e);
                }
                saveContextToSession(fullText);
            }
            return;
        }

        const currentParagraph = SIMULATED_AI_PARAGRAPHS[currentParagraphIndex];

        if (currentCharIndex < currentParagraph.length) {
            // FAST: Type 15 characters at a time, 20ms interval = ~2 sec total
            const timeout = setTimeout(() => {
                const nextCharIndex = Math.min(currentCharIndex + 15, currentParagraph.length);
                setDisplayedParagraphs(prev => {
                    const newParagraphs = [...prev];
                    newParagraphs[currentParagraphIndex] = currentParagraph.slice(0, nextCharIndex);
                    return newParagraphs;
                });
                setCurrentCharIndex(nextCharIndex);
            }, 20);

            return () => clearTimeout(timeout);
        } else {
            // Move to next paragraph quickly
            const timeout = setTimeout(() => {
                setCurrentParagraphIndex(prev => prev + 1);
                setCurrentCharIndex(0);
            }, 100);

            return () => clearTimeout(timeout);
        }
    }, [isTyping, currentParagraphIndex, currentCharIndex, totalProperties, totalViews]);

    // Auto-start generation when modal opens
    useEffect(() => {
        if (isOpen && !generationComplete && !isGenerating && !isTyping && displayedParagraphs.length === 0) {
            startSimulatedGeneration();
        }
    }, [isOpen]);

    // Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setIsTyping(false);
            setIsGenerating(false);
        }
    }, [isOpen]);

    // Handle click outside to close
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Print/Export - open new window with printable content
    const handleExportPDF = async () => {
        setIsPrinting(true);

        // Short loading delay
        await new Promise(resolve => setTimeout(resolve, 800));

        try {
            const printWindow = window.open('', '_blank', 'width=900,height=700');
            if (!printWindow) {
                alert('Please allow pop-ups to export the report.');
                setIsPrinting(false);
                return;
            }

            const fullAnalysis = SIMULATED_AI_PARAGRAPHS.join('</p><p style="margin-top: 12px;">');

            const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Analytics Report - ${reportDate}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: white;
            color: #1e293b;
            padding: 40px;
            line-height: 1.6;
        }
        .report-header {
            text-align: center;
            padding-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
            margin-bottom: 30px;
        }
        .report-header h1 { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
        .report-header .subtitle { font-size: 14px; color: #64748b; }
        .report-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 30px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .stat-card {
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .stat-card.green { background: linear-gradient(135deg, #10b981, #14b8a6); }
        .stat-card.purple { background: linear-gradient(135deg, #8b5cf6, #a855f7); }
        .stat-value { font-size: 32px; font-weight: 800; margin-bottom: 5px; }
        .stat-label { font-size: 12px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 16px; font-weight: 700; color: #374151; margin-bottom: 12px; }
        .data-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 25px; }
        .data-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 15px; }
        .data-card h4 { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 10px; }
        .data-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
        .data-item:last-child { border-bottom: none; }
        .data-label { color: #64748b; }
        .data-value { font-weight: 600; color: #1e293b; }
        .ai-summary {
            background: linear-gradient(135deg, #fef3c7, #fde68a);
            border: 1px solid #fbbf24;
            border-radius: 12px;
            padding: 20px;
            margin-top: 25px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .ai-summary h3 { font-size: 15px; font-weight: 700; color: #92400e; margin-bottom: 12px; }
        .ai-summary p { font-size: 12px; color: #78350f; line-height: 1.7; margin-top: 10px; }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 10px;
            color: #94a3b8;
        }
        @media print {
            body { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>🏠 Property Analytics Report</h1>
        <p class="subtitle">Comprehensive Market Intelligence Summary</p>
    </div>
    
    <div class="report-meta">
        <span><strong>Generated:</strong> ${reportDate}</span>
        <span><strong>Report By:</strong> ${user?.name || 'Admin'}</span>
        <span><strong>Data Period:</strong> Current Snapshot</span>
    </div>
    
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">${totalProperties}</div>
            <div class="stat-label">Total Properties</div>
        </div>
        <div class="stat-card green">
            <div class="stat-value">${totalViews.toLocaleString()}</div>
            <div class="stat-label">Total Views</div>
        </div>
        <div class="stat-card purple">
            <div class="stat-value">RM ${getAveragePrice()}</div>
            <div class="stat-label">Avg. Monthly Rent</div>
        </div>
    </div>
    
    <div class="data-grid">
        <div class="data-card">
            <h4>📍 Regional Distribution</h4>
            ${regionalData.slice(0, 6).map(d => `
                <div class="data-item">
                    <span class="data-label">${d.label}</span>
                    <span class="data-value">${d.value} properties</span>
                </div>
            `).join('')}
        </div>
        
        <div class="data-card">
            <h4>💰 Price Distribution</h4>
            ${priceData.map(d => `
                <div class="data-item">
                    <span class="data-label">${d.label}</span>
                    <span class="data-value">${d.value} properties</span>
                </div>
            `).join('')}
        </div>
        
        <div class="data-card">
            <h4>✨ Top Amenities</h4>
            ${amenitiesData.slice(0, 6).map(d => `
                <div class="data-item">
                    <span class="data-label">${d.label}</span>
                    <span class="data-value">${d.value} properties</span>
                </div>
            `).join('')}
        </div>
        
        <div class="data-card">
            <h4>🔥 Demand Heatmap (${popMetric === 'views' ? 'Views' : 'Applications'})</h4>
            ${popularityData.slice(0, 6).map(d => `
                <div class="data-item">
                    <span class="data-label">${d.label}</span>
                    <span class="data-value">${d.value} ${popMetric}</span>
                </div>
            `).join('')}
        </div>
    </div>
    
    <div class="ai-summary">
        <h3>🤖 AI Market Analysis</h3>
        <p>${fullAnalysis}</p>
    </div>
    
    <div class="footer">
        <p>Generated by House Rent System Admin Panel • ${new Date().getFullYear()}</p>
        <p>This report contains data accurate as of the generation timestamp.</p>
    </div>
    
    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                    window.close();
                };
            }, 300);
        };
    </script>
</body>
</html>
`;

            printWindow.document.write(printContent);
            printWindow.document.close();
        } catch (error) {
            console.error('Error printing:', error);
            alert('Failed to print report. Please try again.');
        } finally {
            setIsPrinting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 overflow-y-auto"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 mb-8"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h3 className="text-xl font-bold text-white">📊 Analytics Report</h3>
                        <p className="text-slate-300 text-xs mt-0.5">{reportDate}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportPDF}
                            disabled={isPrinting || !generationComplete}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-lg hover:bg-slate-100 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPrinting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Preparing...</span>
                                </>
                            ) : (
                                <>
                                    <AdminDownloadIcon width={16} height={16} />
                                    <span>Export PDF</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <AdminCloseIcon className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                <div ref={reportRef} className="p-6 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-5 rounded-xl text-center">
                            <div className="text-3xl font-black">{totalProperties}</div>
                            <div className="text-xs uppercase tracking-wider opacity-80 mt-1">Total Properties</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 rounded-xl text-center">
                            <div className="text-3xl font-black">{totalViews.toLocaleString()}</div>
                            <div className="text-xs uppercase tracking-wider opacity-80 mt-1">Total Views</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-5 rounded-xl text-center">
                            <div className="text-3xl font-black">RM {getAveragePrice()}</div>
                            <div className="text-xs uppercase tracking-wider opacity-80 mt-1">Avg. Monthly Rent</div>
                        </div>
                    </div>

                    {/* Key Insights */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <span className="text-lg">📍</span> Top Areas
                            </h4>
                            <div className="space-y-2">
                                {getTopAreas().map((area, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-slate-700">{area}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <span className="text-lg">✨</span> Popular Amenities
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {getMostPopularAmenities().map((amenity, i) => (
                                    <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Hottest Areas */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span className="text-lg">🔥</span> Hottest Areas ({popMetric === 'views' ? 'By Views' : 'By Applications'})
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {getHottestAreas().map((area, i) => (
                                <span key={i} className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-semibold border border-orange-200">
                                    {area}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* AI Analysis Section - Fast Typewriter */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-xl p-5">
                        <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-4">
                            <span className="text-lg">🤖</span> AI Market Analysis
                            {isGenerating && (
                                <span className="ml-2 text-xs font-normal text-amber-600 animate-pulse">
                                    Initializing...
                                </span>
                            )}
                            {isTyping && !isGenerating && (
                                <span className="ml-2 text-xs font-normal text-amber-600">
                                    Generating...
                                </span>
                            )}
                            {generationComplete && (
                                <span className="ml-2 text-xs font-normal text-emerald-600">
                                    ✓ Complete
                                </span>
                            )}
                        </h4>

                        {isGenerating ? (
                            <div className="flex items-center gap-3 text-amber-700 py-4">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <span className="text-sm">Analyzing market data...</span>
                            </div>
                        ) : (
                            <div className="prose prose-sm text-amber-900 max-w-none space-y-3">
                                {displayedParagraphs.map((paragraph, index) => (
                                    <p key={index} className="leading-relaxed">
                                        {paragraph}
                                        {isTyping && index === currentParagraphIndex && (
                                            <span className="inline-block w-0.5 h-4 bg-amber-600 ml-0.5 animate-pulse"></span>
                                        )}
                                    </p>
                                ))}
                                {displayedParagraphs.length === 0 && !isGenerating && (
                                    <p className="text-amber-700 text-sm italic">
                                        Preparing analysis...
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Report Meta */}
                    <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-200">
                        <p>Report generated by <strong>{user?.name || 'Admin'}</strong> on {reportDate}</p>
                        <p>House Rent System • Analytics Dashboard</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsReport;
