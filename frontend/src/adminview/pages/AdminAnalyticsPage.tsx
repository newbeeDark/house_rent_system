import React, { useState, useEffect, useMemo } from "react";
import { AdminDownloadIcon, AdminBarChartIcon, AdminLineChartIcon, AdminPieChartIcon } from "../components/UI/AdminIcons";
import { Card } from "../components/UI";
import { NeoLineChart, NeoDonutChart, NeoBarChart } from "../components/Charts";
import { fetchAnalyticsProperties } from "../services/AdminMockService";
import type { Property } from "../types/AdminTypes";
import { supabase } from "../../lib/supabase";
import { SparkleIcon } from "../../components/AIFunction";
import { AnalyticsAIChatModal } from "../components/AnalyticsAIChatModal";
import { AdminAnalyticsReport } from "../components/AdminAnalyticsReport";

const BASE_PALETTE = ["#0C45A4", "#E07A1F", "#4CC4F9", "#1FAFA2", "#CFC6B8", "#7EDFCC", "#ECDECB", "#E7E2D6", "#F5FAEA", "#EAF1DC"];
const applyPalette = (data: { label: string, value: number }[]) => data.map((item, i) => ({ ...item, color: BASE_PALETTE[i % BASE_PALETTE.length] }));

const ChartControls = ({
    activeType,
    onChangeType,
    filters,
    children
}: {
    activeType: 'bar' | 'line' | 'donut',
    onChangeType: (t: 'bar' | 'line' | 'donut') => void,
    filters?: React.ReactNode,
    children?: React.ReactNode
}) => (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex-1">{children}</div>
        <div className="flex items-center gap-3">
            {filters && (
                <div className="flex items-center gap-2">
                    {filters}
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                </div>
            )}
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button onClick={() => onChangeType('donut')} className={`p-1.5 rounded-md transition-all ${activeType === 'donut' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><AdminPieChartIcon width={16} height={16} /></button>
                <button onClick={() => onChangeType('bar')} className={`p-1.5 rounded-md transition-all ${activeType === 'bar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><AdminBarChartIcon width={16} height={16} /></button>
                <button onClick={() => onChangeType('line')} className={`p-1.5 rounded-md transition-all ${activeType === 'line' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><AdminLineChartIcon width={16} height={16} /></button>
            </div>
        </div>
    </div>
);

export const AnalyticsPage = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAIChat, setShowAIChat] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const [regionChartType, setRegionChartType] = useState<'donut' | 'bar' | 'line'>('donut');
    const [priceChartType, setPriceChartType] = useState<'bar' | 'line' | 'donut'>('bar');
    const [amenitiesChartType, setAmenitiesChartType] = useState<'bar' | 'line' | 'donut'>('bar');
    const [popChartType, setPopChartType] = useState<'bar' | 'line' | 'donut'>('bar');

    const [regionFilter, setRegionFilter] = useState('All');
    const [priceFilter, setPriceFilter] = useState('All');
    const [amenityFilter, setAmenityFilter] = useState('All');
    const [popMetric, setPopMetric] = useState<'views' | 'applications'>('views');

    // Separate state for application heatmap data
    const [applicationHeatmapData, setApplicationHeatmapData] = useState<{ label: string, value: number }[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchAnalyticsProperties();
            setProperties(data);
            setIsLoading(false);
        };
        loadData();
    }, []);

    // Fetch real application heatmap data when metric is 'applications'
    useEffect(() => {
        const fetchAppHeatmap = async () => {
            if (popMetric === 'applications') {
                const { data, error } = await supabase.rpc('get_application_heatmap_by_area');
                if (error) {
                    console.error("Error fetching app heatmap:", error);
                } else if (data) {
                    // Map RPC result to chart format
                    const formatted = data.map((item: any) => ({
                        label: item.area || 'Unknown',
                        value: item.count
                    }));
                    setApplicationHeatmapData(formatted);
                }
            }
        };
        fetchAppHeatmap();
    }, [popMetric]);

    const regionalData = useMemo(() => {
        if (!properties.length) return [];
        const filtered = regionFilter === 'All' ? properties : properties.filter(p => p.type === regionFilter);
        const counts: Record<string, number> = {};
        filtered.forEach(p => { const area = p.area || "Unknown"; counts[area] = (counts[area] || 0) + 1; });
        return applyPalette(Object.entries(counts).map(([area, count]) => ({ label: area, value: count })).sort((a, b) => b.value - a.value));
    }, [regionFilter, properties]);

    const priceData = useMemo(() => {
        if (!properties.length) return [];
        const filtered = priceFilter === 'All' ? properties : properties.filter(p => p.area === priceFilter);
        const bins = { '< RM 500': 0, 'RM 500 - 1000': 0, 'RM 1000 - 1500': 0, '> RM 1500': 0 };
        filtered.forEach(p => {
            if (p.price < 500) bins['< RM 500']++;
            else if (p.price < 1000) bins['RM 500 - 1000']++;
            else if (p.price < 1500) bins['RM 1000 - 1500']++;
            else bins['> RM 1500']++;
        });
        return applyPalette(Object.keys(bins).map(label => ({ label, value: bins[label as keyof typeof bins] })).sort((a, b) => b.value - a.value));
    }, [priceFilter, properties]);

    const amenitiesData = useMemo(() => {
        if (!properties.length) return [];
        const filtered = amenityFilter === 'All' ? properties : properties.filter(p => p.furnished === amenityFilter.toLowerCase());
        const counts: Record<string, number> = {};
        filtered.forEach(p => { p.amenities?.forEach(am => { counts[am] = (counts[am] || 0) + 1; }); });
        return applyPalette(Object.entries(counts).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6));
    }, [amenityFilter, properties]);

    const popularityData = useMemo(() => {
        // If metric is 'applications', use the real data fetched from RPC
        if (popMetric === 'applications') {
            if (!applicationHeatmapData.length) return [];
            return applyPalette([...applicationHeatmapData]);
        }

        // Views logic
        if (!properties.length) return [];
        const areaStats: Record<string, { total: number, count: number }> = {};
        properties.forEach(p => {
            const area = p.area || "Unknown";
            if (!areaStats[area]) areaStats[area] = { total: 0, count: 0 };
            areaStats[area].total += (p.views_count || 0);
            areaStats[area].count += 1;
        });
        return applyPalette(Object.entries(areaStats).map(([area, stat]) => ({
            label: area,
            value: Math.round(stat.total / stat.count)
        })).sort((a, b) => b.value - a.value));
    }, [popMetric, properties, applicationHeatmapData]);

    // Calculate totals for report
    const totalProperties = properties.length;
    const totalViews = properties.reduce((sum, p) => sum + (p.views_count || 0), 0);

    const categories = Array.from(new Set(properties.map(p => p.type)));
    const areas = Array.from(new Set(properties.map(p => p.area || "Unknown")));
    const selectStyle = "admin-select";

    if (isLoading) return <div className="text-center p-10 text-slate-400">Loading analytics...</div>;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Analytics <span className="text-blue-500">Hub</span></h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">Real-time market intelligence & performance metrics</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* AI Chat Button */}
                    <button
                        onClick={() => setShowAIChat(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        title="Ask AI about analytics"
                    >
                        <SparkleIcon size={18} />
                        <span className="font-semibold text-sm">Ask AI</span>
                    </button>
                    {/* Export Report Button */}
                    <button
                        onClick={() => setShowReport(true)}
                        className="admin-btn bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform"
                    >
                        <AdminDownloadIcon width={18} height={18} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Analytics AI Chat Modal */}
            <AnalyticsAIChatModal isOpen={showAIChat} onClose={() => setShowAIChat(false)} />

            {/* Analytics Report Modal */}
            <AdminAnalyticsReport
                isOpen={showReport}
                onClose={() => setShowReport(false)}
                regionalData={regionalData}
                priceData={priceData}
                amenitiesData={amenitiesData}
                popularityData={popularityData}
                popMetric={popMetric}
                totalProperties={totalProperties}
                totalViews={totalViews}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border border-blue-100 shadow-[0_4px_20px_-12px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_30px_-12px_rgba(59,130,246,0.4)] transition-shadow">
                    <ChartControls
                        activeType={regionChartType} onChangeType={setRegionChartType}
                        filters={
                            <select className={selectStyle} value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
                                <option value="All">All Categories</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        }
                    >
                        <h3 className="text-lg font-bold text-slate-800">Regional Distribution</h3>
                        <p className="text-xs text-slate-400 font-mono">SUPPLY_BY_ZONE</p>
                    </ChartControls>
                    <div className="h-64 w-full flex items-center justify-center p-4">
                        {regionChartType === 'donut' && <NeoDonutChart data={regionalData} />}
                        {regionChartType === 'bar' && <div className="w-full h-full"><NeoBarChart data={regionalData} color="#0C45A4" /></div>}
                        {regionChartType === 'line' && <div className="w-full h-full"><NeoLineChart data={regionalData.map(d => d.value)} labels={regionalData.map(d => d.label)} color="#0C45A4" height={220} /></div>}
                    </div>
                </Card>

                <Card className="border border-emerald-100 shadow-[0_4px_20px_-12px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_30px_-12px_rgba(16,185,129,0.4)] transition-shadow">
                    <ChartControls
                        activeType={priceChartType} onChangeType={setPriceChartType}
                        filters={
                            <select className={selectStyle} value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
                                <option value="All">All Areas</option>
                                {areas.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        }
                    >
                        <h3 className="text-lg font-bold text-slate-800">Rent Price Index</h3>
                        <p className="text-xs text-slate-400 font-mono">PRICE_SEGMENTATION_MYR</p>
                    </ChartControls>
                    <div className="h-64 w-full flex items-center justify-center p-4">
                        {priceChartType === 'bar' && <div className="w-full h-full"><NeoBarChart data={priceData} color="#1FAFA2" /></div>}
                        {priceChartType === 'donut' && <NeoDonutChart data={priceData} />}
                        {priceChartType === 'line' && <div className="w-full h-full"><NeoLineChart data={priceData.map(d => d.value)} labels={priceData.map(d => d.label)} color="#1FAFA2" height={220} /></div>}
                    </div>
                </Card>

                <Card className="border border-orange-100 shadow-[0_4px_20px_-12px_rgba(249,115,22,0.3)] hover:shadow-[0_8px_30px_-12px_rgba(249,115,22,0.4)] transition-shadow">
                    <ChartControls
                        activeType={amenitiesChartType} onChangeType={setAmenitiesChartType}
                        filters={
                            <select className={selectStyle} value={amenityFilter} onChange={(e) => setAmenityFilter(e.target.value)}>
                                <option value="All">Any Furnishing</option>
                                <option value="Full">Fully Furnished</option>
                                <option value="Half">Partially Furnished</option>
                                <option value="None">Not Furnished</option>
                            </select>
                        }
                    >
                        <h3 className="text-lg font-bold text-slate-800">Feature Frequency</h3>
                        <p className="text-xs text-slate-400 font-mono">AMENITY_SATURATION</p>
                    </ChartControls>
                    <div className="h-64 w-full flex items-center justify-center p-4">
                        {amenitiesChartType === 'bar' && <div className="w-full h-full"><NeoBarChart data={amenitiesData} color="#E07A1F" /></div>}
                        {amenitiesChartType === 'donut' && <NeoDonutChart data={amenitiesData} />}
                        {amenitiesChartType === 'line' && <div className="w-full h-full"><NeoLineChart data={amenitiesData.map(d => d.value)} labels={amenitiesData.map(d => d.label)} color="#E07A1F" height={220} /></div>}
                    </div>
                </Card>

                <Card className="border border-purple-100 shadow-[0_4px_20px_-12px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_30px_-12px_rgba(139,92,246,0.4)] transition-shadow">
                    <ChartControls
                        activeType={popChartType} onChangeType={setPopChartType}
                        filters={
                            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                                <button onClick={() => setPopMetric('views')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${popMetric === 'views' ? 'bg-white shadow-sm text-purple-600' : 'text-slate-400 hover:text-purple-400'}`}>Views</button>
                                <button onClick={() => setPopMetric('applications')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${popMetric === 'applications' ? 'bg-white shadow-sm text-pink-600' : 'text-slate-400 hover:text-pink-400'}`}>Apps</button>
                            </div>
                        }
                    >
                        <h3 className="text-lg font-bold text-slate-800">Demand Heatmap</h3>
                        <p className="text-xs text-slate-400 font-mono">REGIONAL_TRAFFIC_METRICS</p>
                    </ChartControls>
                    <div className="h-64 w-full flex items-center justify-center p-4">
                        {popChartType === 'bar' && <div className="w-full h-full"><NeoBarChart data={popularityData} color={popMetric === 'views' ? '#4CC4F9' : '#0C45A4'} /></div>}
                        {popChartType === 'donut' && <NeoDonutChart data={popularityData} />}
                        {popChartType === 'line' && <div className="w-full h-full"><NeoLineChart data={popularityData.map(d => d.value)} labels={popularityData.map(d => d.label)} color={popMetric === 'views' ? '#4CC4F9' : '#0C45A4'} height={220} /></div>}
                    </div>
                </Card>
            </div>
        </div>
    );
};
