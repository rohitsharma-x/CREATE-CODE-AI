import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  ShieldAlert,
  Bug,
  FileCode2,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Card } from '../components/common/Card';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export const AnalyticsPage = () => {
  const { isDark } = useTheme();
  const [range, setRange] = useState('30');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/analytics/overview?range=${range}`);
        if (res.data?.success) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.warn('Using analytics fallback data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [range]);

  const metrics = analytics?.metrics || {
    reviewsCompleted: 124,
    reviewsChange: '+18%',
    bugsFound: 37,
    bugsChange: '-24%',
    securityIssues: 9,
    securityChange: '-40%',
    codeQuality: 92,
    qualityChange: '+6%',
  };

  const trendData = analytics?.qualityTrend || [
    { date: 'Jan 1', score: 62 },
    { date: 'Jan 6', score: 68 },
    { date: 'Jan 11', score: 74 },
    { date: 'Jan 16', score: 81 },
    { date: 'Jan 21', score: 86 },
    { date: 'Jan 26', score: 89 },
    { date: 'Jan 30', score: 92 },
  ];

  const distributionData = analytics?.issueDistribution?.data || [
    { name: 'Bugs', count: 17, percentage: 37, color: '#EF4444' },
    { name: 'Security', count: 9, percentage: 20, color: '#F59E0B' },
    { name: 'Performance', count: 8, percentage: 17, color: '#38BDF8' },
    { name: 'Other', count: 12, percentage: 26, color: '#94A3B8' },
  ];

  const barData = [
    { name: 'Mon', reviews: 14, issues: 5 },
    { name: 'Tue', reviews: 22, issues: 8 },
    { name: 'Wed', reviews: 19, issues: 4 },
    { name: 'Thu', reviews: 27, issues: 9 },
    { name: 'Fri', reviews: 31, issues: 6 },
    { name: 'Sat', reviews: 12, issues: 2 },
    { name: 'Sun', reviews: 8, issues: 1 },
  ];

  const gridColor = isDark ? '#263849' : '#E2E8F0';
  const textColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <div className="space-y-6">
      {/* Header (Matching Reference Image 8) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
            Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Track code quality, personal developer productivity and AI usage.
          </p>
        </div>

        {/* Time range selector */}
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-3.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] text-[#0F172A] dark:text-[#F1F5F9] focus:outline-none font-bold"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* 4 Metric Cards with Change Badges (Matching Reference Image 8) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Reviews Completed */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
              Reviews Completed
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              {metrics.reviewsChange}
            </span>
          </div>
          <div className="text-2xl font-black text-[#0F172A] dark:text-[#F1F5F9]">
            {metrics.reviewsCompleted}
          </div>
        </Card>

        {/* Bugs Found */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
              Bugs Found
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
              <TrendingDown className="w-3 h-3" />
              {metrics.bugsChange}
            </span>
          </div>
          <div className="text-2xl font-black text-[#0F172A] dark:text-[#F1F5F9]">
            {metrics.bugsFound}
          </div>
        </Card>

        {/* Security Issues */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
              Security Issues
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
              <TrendingDown className="w-3 h-3" />
              {metrics.securityChange}
            </span>
          </div>
          <div className="text-2xl font-black text-[#0F172A] dark:text-[#F1F5F9]">
            {metrics.securityIssues}
          </div>
        </Card>

        {/* Code Quality */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#94A3B8]">
              Code Quality
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
              <TrendingUp className="w-3 h-3" />
              {metrics.qualityChange}
            </span>
          </div>
          <div className="text-2xl font-black text-[#0F172A] dark:text-[#F1F5F9]">
            {metrics.codeQuality}%
          </div>
        </Card>
      </div>

      {/* Charts Grid (Matching Reference Image 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Quality Trend Line Chart */}
        <Card className="lg:col-span-7 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              Code Quality Trend
            </h3>
            <span className="text-xs font-mono text-[#089E9A] dark:text-[#12D6C5] font-bold">
              Avg: {metrics.codeQuality}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="date" stroke={textColor} fontSize={11} tickLine={false} />
                <YAxis domain={[50, 100]} stroke={textColor} fontSize={11} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#111E2B' : '#FFFFFF',
                    borderColor: isDark ? '#263849' : '#D8E3EA',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    color: isDark ? '#F1F5F9' : '#0F172A',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#12D6C5"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#12D6C5', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#38BDF8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Right: Issue Distribution Donut Chart */}
        <Card className="lg:col-span-5 p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              Issue Distribution
            </h3>
            <span className="text-xs text-slate-400 font-semibold">46 Total Issues</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-64">
            <div className="w-48 h-48 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#111E2B' : '#FFFFFF',
                      borderColor: isDark ? '#263849' : '#D8E3EA',
                      borderRadius: '0.75rem',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Total Count */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-[#0F172A] dark:text-[#F1F5F9]">
                  46
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase">
                  Total
                </span>
              </div>
            </div>

            {/* Legend (Matching Screenshot 8) */}
            <div className="space-y-2.5 text-xs font-medium w-full sm:w-auto">
              {distributionData.map((d, i) => (
                <div key={i} className="flex items-center justify-between sm:justify-start gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-slate-600 dark:text-[#94A3B8]">{d.name}</span>
                  </div>
                  <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    ({d.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Throughput Bar Chart */}
      <Card className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
          Weekly Review &amp; Issue Resolution Activity
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" stroke={textColor} fontSize={11} tickLine={false} />
              <YAxis stroke={textColor} fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#111E2B' : '#FFFFFF',
                  borderColor: isDark ? '#263849' : '#D8E3EA',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="reviews" name="Reviews Completed" fill="#12D6C5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="issues" name="Issues Resolved" fill="#38BDF8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

