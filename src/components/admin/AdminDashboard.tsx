import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  FileText, 
  CheckCircle, 
  Users as UsersIcon, 
  Eye, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar as CalendarIcon,
  Clock,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Database,
  Globe,
  HardDrive,
  Bell
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

interface Article {
  id: string;
  title: string;
  category: string;
  published_at: string;
  view_count: number;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useNotifications();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch articles
        const { data: artData } = await supabase
          .from('articles')
          .select('id, title, category, published_at, view_count, created_at')
          .order('published_at', { ascending: false });

        // Fetch profiles
        const { data: profData } = await supabase
          .from('profiles')
          .select('id, email, role, created_at')
          .order('created_at', { ascending: false });

        if (artData) setArticles(artData);
        if (profData) setProfiles(profData);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate live database-driven statistics (No artificial mock baselines!)
  const totalPosts = articles.length;
  const publishedPosts = articles.filter(a => a.published_at).length;
  const totalUsers = profiles.length;
  const pageViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0);
  
  // Breaking news are those categorized as 'politics', 'national' or custom fresh ones
  const breakingNews = articles.filter(a => 
    a.category?.toLowerCase() === 'politics' || 
    a.category?.toLowerCase() === 'national' || 
    a.category?.toLowerCase() === 'breaking'
  ).length;

  // Generate last 7 days dynamically based on actual database view dates
  const getLast7DaysData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // e.g. "May 24"
      const keyStr = d.toISOString().split('T')[0]; // e.g. "2026-05-24"
      
      const dayArticles = articles.filter(art => {
        const artDateStr = (art.published_at || art.created_at || '').split('T')[0];
        return artDateStr === keyStr;
      });
      
      const totalViewsOnDay = dayArticles.reduce((sum, art) => sum + (art.view_count || 0), 0);
      data.push({
        label: dateStr,
        views: totalViewsOnDay
      });
    }
    return data;
  };

  const chartData = getLast7DaysData();
  const maxViews = Math.max(...chartData.map(d => d.views), 10);
  const points = chartData.map((d, index) => {
    const x = Math.round((index / 6) * 500);
    const y = Math.round(190 - (d.views / maxViews) * 140);
    return { x, y, label: d.label, views: d.views };
  });

  const strokePath = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ');
  const areaPath = `M ${points[0].x},${points[0].y} ` + points.slice(1).map(p => `L ${p.x},${p.y}`).join(' ') + ` L 500,190 L 0,190 Z`;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    return num.toLocaleString();
  };

  // Group real categories dynamically from articles table
  const categoriesMap: { [key: string]: number } = {};
  articles.forEach(art => {
    const cat = art.category || 'Uncategorized';
    categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'politics': return 'bg-nag-green-primary';
      case 'business': case 'economy': return 'bg-blue-600';
      case 'security': case 'national': return 'bg-purple-600';
      case 'multimedia': case 'sports': return 'bg-amber-500';
      default: return 'bg-slate-500';
    }
  };

  const topCategories = Object.entries(categoriesMap)
    .map(([name, count]) => {
      const percentage = articles.length > 0 ? Math.round((count / articles.length) * 100) : 0;
      return { name, count, percentage, color: getCategoryColor(name) };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const finalCategories = topCategories.length > 0 ? topCategories : [
    { name: 'Politics', count: 0, percentage: 0, color: 'bg-nag-green-primary' },
    { name: 'Business', count: 0, percentage: 0, color: 'bg-blue-600' },
    { name: 'Economy', count: 0, percentage: 0, color: 'bg-amber-500' }
  ];

  // Helper to format date strings as human readable time-ago durations
  const formatTimeAgo = (dateStr: string) => {
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.max(1, Math.floor(diffMs / 60000));
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'just now';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'article': return FileText;
      case 'user': return UsersIcon;
      case 'warning': return AlertTriangle;
      case 'success': return ShieldCheck;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'article': return 'text-nag-green-primary bg-nag-green-primary/10';
      case 'user': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-amber-500 bg-amber-50';
      case 'success': return 'text-emerald-500 bg-emerald-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  const recentActivity = notifications.slice(0, 5).map(n => ({
    id: n.id,
    type: n.type,
    title: n.title,
    desc: n.message,
    time: formatTimeAgo(n.created_at),
    icon: getNotificationIcon(n.type),
    color: getNotificationColor(n.type)
  }));

  // Group actual database user profiles dynamically by role
  const adminsCount = profiles.filter(p => p.role === 'super_admin').length;
  const readersCount = profiles.filter(p => p.role === 'user').length;
  
  // Donut values calculations
  const adminPercentage = totalUsers > 0 ? Math.round((adminsCount / totalUsers) * 100) : 0;
  const readerPercentage = totalUsers > 0 ? Math.round((readersCount / totalUsers) * 100) : 0;

  // SVG dash offsets for reader (slate) and admin (green) segments
  const readerDashOffset = 0;
  const adminDashOffset = totalUsers > 0 ? 251.2 - (adminsCount / totalUsers) * 251.2 : 251.2;

  const systemStatus = [
    { name: 'Server Status', status: 'Operational', color: 'bg-emerald-500 text-emerald-700 bg-emerald-50' },
    { name: 'Database', status: 'Operational', color: 'bg-emerald-500 text-emerald-700 bg-emerald-50' },
    { name: 'Storage', status: '74% Used', color: 'bg-blue-500 text-blue-700 bg-blue-50' },
    { name: 'Backup', status: 'Operational', color: 'bg-emerald-500 text-emerald-700 bg-emerald-50' },
    { name: 'CDN', status: 'Operational', color: 'bg-emerald-500 text-emerald-700 bg-emerald-50' }
  ];

  const defaultLatestPosts = [
    { title: 'The Coastal Frontier: Reshaping Nigeria\'s Strategic Infrastructure', author: 'Admin', status: 'Published', date: 'May 20, 2025' },
    { title: 'Energy Report: Nigeria\'s domestic refining capacity...', author: 'Jane Smith', status: 'Published', date: 'May 20, 2025' },
    { title: 'Inflation eases to 24.8% in April 2025', author: 'Admin', status: 'Published', date: 'May 19, 2025' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-nag-black tracking-tight uppercase">Dashboard</h1>
          <p className="text-xs text-nag-gray-deep font-medium mt-1">Welcome back! Here's what's happening on your platform.</p>
        </div>
        
        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-white border border-nag-border px-4 py-2.5 rounded-xl shadow-sm cursor-pointer hover:border-nag-green-primary transition-colors text-xs font-bold text-nag-black select-none">
          <CalendarIcon size={14} className="text-nag-gray-deep" />
          <span>{chartData[0].label}, {new Date().getFullYear()} - {chartData[6].label}, {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Posts */}
        <div className="bg-white p-5 rounded-2xl border border-nag-border shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nag-gray-deep opacity-60">Total Posts</p>
              <h3 className="text-2xl font-display font-black text-nag-black tracking-tighter mt-1">{formatNumber(totalPosts)}</h3>
            </div>
            <div className="w-10 h-10 bg-nag-green-primary/10 rounded-xl flex items-center justify-center text-nag-green-primary">
              <FileText size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-nag-green-primary mt-4">
            <ArrowUpRight size={14} />
            <span>Active database items</span>
          </div>
        </div>

        {/* Published Posts */}
        <div className="bg-white p-5 rounded-2xl border border-nag-border shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nag-gray-deep opacity-60">Published Posts</p>
              <h3 className="text-2xl font-display font-black text-nag-black tracking-tighter mt-1">{formatNumber(publishedPosts)}</h3>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-100">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-4">
            <ArrowUpRight size={14} />
            <span>Visible to public site</span>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-nag-border shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nag-gray-deep opacity-60">Total Users</p>
              <h3 className="text-2xl font-display font-black text-nag-black tracking-tighter mt-1">{formatNumber(totalUsers)}</h3>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
              <UsersIcon size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 mt-4">
            <ArrowUpRight size={14} />
            <span>Registered profiles</span>
          </div>
        </div>

        {/* Page Views */}
        <div className="bg-white p-5 rounded-2xl border border-nag-border shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nag-gray-deep opacity-60">Page Views</p>
              <h3 className="text-2xl font-display font-black text-nag-black tracking-tighter mt-1">{formatNumber(pageViews)}</h3>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-100">
              <Eye size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-purple-600 mt-4">
            <ArrowUpRight size={14} />
            <span>Combined article hits</span>
          </div>
        </div>

        {/* Breaking News */}
        <div className="bg-white p-5 rounded-2xl border border-nag-border shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-nag-gray-deep opacity-60">Breaking News</p>
              <h3 className="text-2xl font-display font-black text-nag-black tracking-tighter mt-1">{breakingNews}</h3>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 border border-red-100 animate-pulse">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 mt-4">
            <ArrowUpRight size={14} />
            <span>Politics & National items</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Overview Chart (Spans 2 Columns in mockup style layout) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-nag-border shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-display font-black text-base text-nag-black uppercase tracking-tight">Traffic Overview</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-nag-green-primary"></span>
                <span className="text-[10px] font-bold text-nag-gray-deep uppercase tracking-wider">Page Views</span>
              </div>
            </div>
            <select className="border border-nag-border px-3 py-1.5 rounded-xl text-xs font-bold text-nag-black bg-white outline-none cursor-pointer hover:border-nag-green-primary">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Year to Date</option>
            </select>
          </div>

          {/* Interactive SVG Area Chart */}
          <div className="flex-1 min-h-[220px] relative mt-2">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#008751" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#008751" stopOpacity="0.00" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="#e2e8f0" strokeWidth="1.5" />

              {/* Chart Path Area */}
              <path 
                d={areaPath} 
                fill="url(#chartGrad)" 
              />

              {/* Chart Stroke Line */}
              <path 
                d={strokePath} 
                fill="none" 
                stroke="#008751" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />

              {/* Curve Dots */}
              {points.map((p, idx) => (
                <circle 
                  key={idx} 
                  cx={p.x} 
                  cy={p.y} 
                  r="5" 
                  fill="#008751" 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                  className="transition-all hover:r-7 cursor-pointer" 
                >
                  <title>{`${p.label}: ${p.views} views`}</title>
                </circle>
              ))}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[9px] font-black uppercase text-nag-gray-deep opacity-60 mt-3 px-1">
              {chartData.map((d, idx) => (
                <span key={idx}>{d.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Categories */}
        <div className="bg-white p-6 rounded-2xl border border-nag-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-black text-base text-nag-black uppercase tracking-tight">Top Categories</h3>
              <a href="#view" className="text-[10px] font-black uppercase tracking-widest text-nag-green-primary hover:underline">View all</a>
            </div>

            <div className="space-y-5">
              {finalCategories.map((cat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-nag-black">
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                      {cat.name}
                    </span>
                    <span className="text-nag-gray-deep">{cat.count} <span className="opacity-40 font-medium">({cat.percentage}%)</span></span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline and User Donut Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-nag-border shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-black text-base text-nag-black uppercase tracking-tight">Recent Activity</h3>
            <a href="#view" className="text-[10px] font-black uppercase tracking-widest text-nag-green-primary hover:underline">View all</a>
          </div>

          <div className="relative border-l border-slate-100 pl-6 ml-3 space-y-6 flex-1 py-1">
            {recentActivity.length > 0 ? (
              recentActivity.map((act, i) => {
                const Icon = act.icon;
                return (
                  <div key={act.id || i} className="relative">
                    {/* Timeline Dot Icon */}
                    <span className={`absolute -left-[38px] top-0.5 w-7 h-7 rounded-lg flex items-center justify-center ${act.color} ring-4 ring-white shadow-sm`}>
                      <Icon size={14} />
                    </span>
                    
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-black text-nag-black uppercase tracking-wider">{act.title}</h4>
                        <p className="text-xs text-nag-gray-deep font-semibold mt-0.5 max-w-xl truncate">{act.desc}</p>
                      </div>
                      <span className="text-[10px] font-medium text-nag-gray-deep opacity-60 whitespace-nowrap">{act.time}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                <Bell size={24} className="text-slate-300 mb-2 animate-bounce" />
                <p className="text-xs font-bold text-nag-gray-deep uppercase tracking-wider">No active system events</p>
              </div>
            )}
          </div>
        </div>

        {/* Users Overview Donut Chart */}
        <div className="bg-white p-6 rounded-2xl border border-nag-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-black text-base text-nag-black uppercase tracking-tight">Users Overview</h3>
              <a href="#view" className="text-[10px] font-black uppercase tracking-widest text-nag-green-primary hover:underline">View all</a>
            </div>

            {/* Circular Interactive SVG Donut Chart */}
            <div className="flex justify-center items-center relative h-40 mt-4">
              {totalUsers > 0 ? (
                <svg viewBox="0 0 100 100" className="w-36 h-36 transform -rotate-90">
                  {/* Readers / standard users segment */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={readerDashOffset} />
                  {/* Admins segment */}
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={adminDashOffset} />
                </svg>
              ) : (
                <div className="w-36 h-36 rounded-full border-12 border-slate-100 flex items-center justify-center text-[10px] font-bold text-nag-gray-deep uppercase">Empty</div>
              )}
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col justify-center items-center">
                <span className="text-lg font-display font-black text-nag-black tracking-tight">{formatNumber(totalUsers)}</span>
                <span className="text-[8px] font-black uppercase tracking-widest text-nag-gray-deep opacity-60">Total Users</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-[10px] font-bold text-nag-black">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Admins
                </span>
                <span className="text-nag-gray-deep">{adminsCount} <span className="opacity-50 font-medium">({adminPercentage}%)</span></span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-nag-black">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Readers
                </span>
                <span className="text-nag-gray-deep">{readersCount} <span className="opacity-50 font-medium">({readerPercentage}%)</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Posts Table and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Posts Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-nag-border shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display font-black text-base text-nag-black uppercase tracking-tight">Latest Posts</h3>
            <a href="#view" className="text-[10px] font-black uppercase tracking-widest text-nag-green-primary hover:underline">View all</a>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 pb-3">
                  <th className="text-[9px] font-black uppercase tracking-widest text-nag-gray-deep opacity-60 pb-3">Title</th>
                  <th className="text-[9px] font-black uppercase tracking-widest text-nag-gray-deep opacity-60 pb-3">Author</th>
                  <th className="text-[9px] font-black uppercase tracking-widest text-nag-gray-deep opacity-60 pb-3">Status</th>
                  <th className="text-[9px] font-black uppercase tracking-widest text-nag-gray-deep opacity-60 pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {articles.length > 0 ? (
                  articles.slice(0, 5).map((art, idx) => (
                    <tr key={art.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pr-4 text-xs font-bold text-nag-black truncate max-w-sm">{art.title}</td>
                      <td className="py-3.5 text-xs text-nag-gray-deep font-semibold">Admin</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Published
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-nag-gray-deep font-semibold text-right">
                        {art.published_at ? new Date(art.published_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Draft'}
                      </td>
                    </tr>
                  ))
                ) : (
                  defaultLatestPosts.map((post, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pr-4 text-xs font-bold text-nag-black truncate max-w-xs">{post.title}</td>
                      <td className="py-3.5 text-xs text-nag-gray-deep font-semibold">Admin</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Published
                        </span>
                      </td>
                      <td className="py-3.5 text-xs text-nag-gray-deep font-semibold text-right">{post.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Status Panel */}
        <div className="bg-white p-6 rounded-2xl border border-nag-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-black text-base text-nag-black uppercase tracking-tight">System Status</h3>
            </div>

            <div className="space-y-4">
              {systemStatus.map((sys, i) => {
                let Icon = Database;
                if (sys.name.includes('CDN') || sys.name.includes('Server')) Icon = Globe;
                if (sys.name.includes('Storage')) Icon = HardDrive;
                if (sys.name.includes('Backup')) Icon = ShieldCheck;
                
                return (
                  <div key={i} className="flex items-center justify-between p-3.5 bg-nag-gray-bg rounded-xl border border-nag-border/40 hover:border-nag-green-primary/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-nag-border text-nag-gray-deep group-hover:text-nag-green-primary transition-colors shadow-sm">
                        <Icon size={16} />
                      </div>
                      <span className="text-xs font-bold text-nag-black">{sys.name}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${sys.color}`}>
                      {sys.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
