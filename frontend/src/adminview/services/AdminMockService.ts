import { supabase } from '../../lib/supabase';
import type { 
    Property, 
    Tenant, 
    MaintenanceRequest, 
    RevenueData, 
    ActivityLog 
} from "../types/AdminTypes";

// --- Helper to simulate network delay (Optional, can be removed for production) ---
// const simulateLatency = async <T>(data: T, _min = 300, _max = 800): Promise<T> => {
//     return data; // No latency for real data
// };

// --- REAL DATA SOURCES via Supabase ---

// 1. Dashboard Summary Stats
export const fetchDashboardStats = async () => {
    const { data, error } = await supabase.rpc('get_dashboard_summary');
    if (error) {
        console.error('Error fetching dashboard stats:', error);
        return { total_views: 0, total_users: 0, new_listings_this_month: 0 };
    }
    return data;
};

// 2. Views Chart Data (Replaces Revenue Chart)
export const fetchRevenueChartData = async (): Promise<Record<'year' | 'month' | 'week', RevenueData>> => {
    // Helper to format date
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    };

    // Fetch 365 days of data for client-side processing
    const { data: rawData, error } = await supabase.rpc('get_daily_views_stats', { days_limit: 365 });
    
    if (error) {
        console.error('Error fetching view stats:', error);
        return {
            year: { period: 'year', values: [], labels: [] },
            month: { period: 'month', values: [], labels: [] },
            week: { period: 'week', values: [], labels: [] }
        };
    }

    // Process for Week (Last 7 days)
    const weekData = (rawData || []).slice(-7);
    const weekChart: RevenueData = {
        period: 'week',
        values: weekData.map((d: any) => d.count),
        labels: weekData.map((d: any) => formatDate(d.view_date))
    };

    // Process for Month (Last 30 days)
    const monthData = (rawData || []).slice(-30);
    const monthChart: RevenueData = {
        period: 'month',
        values: monthData.map((d: any) => d.count),
        labels: monthData.map((d: any) => formatDate(d.view_date))
    };

    // Process for Year (Aggregate by month)
    // For year view, we use MOCK data as requested, because real data might be too sparse for a good demo
    // The user requested: "为year视图添加mock数据"
    const yearChart: RevenueData = {
        period: 'year',
        values: [450, 520, 480, 610, 590, 720, 850, 910, 880, 750, 690, 580], // Mock values
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    };

    return {
        year: yearChart,
        month: monthChart,
        week: weekChart
    };
};

// 3. Activity Logs (Replaces mock logs with Complaints)
export const fetchActivityLogs = async (): Promise<ActivityLog[]> => {
    const { data, error } = await supabase
        .from('complaints')
        .select(`
            id,
            category,
            description,
            created_at,
            status,
            target_type
        `)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching complaints:', error);
        return [];
    }

    return data.map((item: any) => ({
        id: item.id,
        text: item.category, // e.g. "Fraud / Scam"
        sub: item.description.substring(0, 30) + (item.description.length > 30 ? '...' : ''),
        time: new Date(item.created_at).toLocaleDateString(), // Simple date format
        type: item.status === 'open' ? 'alert' : 'info'
    }));
};

// --- Legacy / Other Functions (Keep or update as needed) ---

export const fetchAnalyticsProperties = async (): Promise<Property[]> => {
    // For now, fetch real properties
    const { data, error } = await supabase
        .from('properties')
        .select('*');
    
    if (error) return [];
    
    // Map DB fields to Frontend types if necessary
    return data.map((p: any) => ({
        ...p,
        type: p.category, // Map category -> type
        amenities: p.amenities || [],
        views_count: p.views_count || 0,
        applications_count: p.applications_count || 0
    }));
};

export const fetchListingProperties = async (): Promise<Property[]> => {
    return fetchAnalyticsProperties();
};

export const fetchTenants = async (): Promise<Tenant[]> => {
     // Mock for now, or implement real fetch
    return [];
};

export const fetchMaintenanceRequests = async (): Promise<MaintenanceRequest[]> => {
    // Mock for now
    return [];
};
