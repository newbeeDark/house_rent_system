import { useState, useEffect } from "react";
import { AdminBuildingIcon, AdminUsersIcon, AdminFileTextIcon, AdminEyeIcon } from "../components/UI/AdminIcons";
import { Card, StatCard } from "../components/UI";
import { NeoLineChart } from "../components/Charts";
import { 
    fetchRevenueChartData, 
    fetchActivityLogs,
    fetchDashboardStats
} from "../services/AdminMockService";
import type { RevenueData, ActivityLog } from "../types/AdminTypes";

export const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  const [revenueMap, setRevenueMap] = useState<Record<'year' | 'month' | 'week', RevenueData> | null>(null);
  const [revenueView, setRevenueView] = useState<'year' | 'month' | 'week'>('week'); // Default to week
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [dashboardStats, setDashboardStats] = useState({ total_views: 0, total_users: 0, new_listings_this_month: 0 });
  
  // Reuse this state for "New Listings" period toggle (mock logic for Qr/Yr since we only have month stats)
  const [listingMetric, setListingMetric] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');

  useEffect(() => {
    const loadData = async () => {
        try {
            const [revData, actData, statsData] = await Promise.all([
                fetchRevenueChartData(),
                fetchActivityLogs(),
                fetchDashboardStats()
            ]);
            setRevenueMap(revData);
            setActivityLogs(actData);
            setDashboardStats(statsData);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  if (isLoading) {
      return (
        <div className="w-full h-96 flex items-center justify-center text-slate-400">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-200 rounded-full mb-3"></div>
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
        </div>
      );
  }

  const currentChartData = revenueMap ? revenueMap[revenueView] : { values: [], labels: [] };
  
  let chartColor = '#4f46e5';
  if (revenueView === 'month') chartColor = '#0ea5e9';
  if (revenueView === 'week') chartColor = '#8b5cf6';

  return (
    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 1. Total Views (was Total Properties/Active Issues) */}
        <StatCard 
            title="Total Views" 
            value={dashboardStats.total_views.toLocaleString()} 
            trend="+12%" 
            trendUp={true} 
            icon={AdminEyeIcon} 
        />

        {/* 2. Registered Users (was Occupancy Rate) */}
        <StatCard 
            title="Registered Users" 
            value={dashboardStats.total_users.toLocaleString()} 
            trend="+5%" 
            trendUp={true} 
            icon={AdminUsersIcon} 
        />
        
        {/* 3. New Listings (was Revenue) */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-indigo-600 border border-indigo-100/50 shadow-sm">
                    <AdminFileTextIcon width={24} height={24} />
                </div>
                <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    {(['monthly', 'quarterly', 'annual'] as const).map((period) => (
                        <button
                            key={period}
                            onClick={() => setListingMetric(period)}
                            className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                                listingMetric === period 
                                ? 'bg-white shadow-sm text-blue-600' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {period === 'monthly' ? 'Mo' : period === 'quarterly' ? 'Qr' : 'Yr'}
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 mb-1 capitalize">{listingMetric} New Listings</p>
                {/* Note: We currently only fetch 'this month'. For Qr/Yr we might need extra logic or RPC updates. 
                    For now, showing monthly data as a placeholder or extrapolated if needed. 
                    Since user asked for 'New Listings Count' and our RPC gives 'new_listings_this_month', 
                    we display that. */}
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
                    {listingMetric === 'monthly' ? dashboardStats.new_listings_this_month : 
                     listingMetric === 'quarterly' ? dashboardStats.new_listings_this_month * 3 : 
                     dashboardStats.new_listings_this_month * 12} 
                     {/* ^ Placeholder logic for Qr/Yr since we lack historical creation stats in RPC */}
                </h3>
                <div className="flex items-center text-xs font-bold mt-2 text-emerald-600">
                   <span className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 mr-1.5">
                       +8%
                   </span>
                   <span className="text-slate-400 font-medium">vs last period</span>
                </div>
            </div>
        </Card>

        {/* 4. Total Properties (Kept as is, useful stat) */}
        <StatCard title="Total Properties" value="24" trend="+2" trendUp={true} icon={AdminBuildingIcon} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <Card className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Views Overview</h3>
              <p className="text-sm text-slate-500">Property views traffic over time</p>
            </div>
            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
              {(['year', 'month', 'week'] as const).map((v) => (
                  <button 
                    key={v}
                    onClick={() => setRevenueView(v)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-all duration-200 ${revenueView === v ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    {v}
                  </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 px-2">
            <NeoLineChart 
                key={revenueView} 
                data={currentChartData.values} 
                color={chartColor} 
                height={250} 
            />
          </div>
          
          <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium px-2 uppercase tracking-wider">
             {currentChartData.labels.map((label, i) => {
                 if (revenueView === 'week') return <span key={i}>{label}</span>;
                 const step = Math.floor(currentChartData.labels.length / (revenueView === 'month' ? 6 : 12));
                 return i % (step || 1) === 0 ? <span key={i}>{label}</span> : null;
             })}
          </div>
        </Card>

        {/* Recent Activity -> Recent Complaints */}
        <Card>
           <h3 className="text-lg font-bold mb-6 text-slate-800">Recent Complaints</h3>
           <div className="space-y-6">
             {activityLogs.length > 0 ? activityLogs.map((item) => (
                 <div key={item.id} className="flex items-start gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                      <div className={`mt-2 w-2 h-2 rounded-full flex-shrink-0 shadow-sm ${
                          item.type === 'alert' ? 'bg-rose-500 shadow-rose-200' :
                          'bg-blue-500 shadow-blue-200'
                      }`} />
                      <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">{item.text}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-100 px-2 py-1 rounded-md">{item.time}</span>
                  </div>
              )) : (
                <div className="text-center text-slate-400 py-10">
                    No recent complaints
                </div>
              )}
           </div>
           <button onClick={() => window.location.href = '/admin/maintenance'} className="w-full mt-8 py-2.5 text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100">
               View All Complaints
           </button>
        </Card>
      </div>
    </div>
  );
};
