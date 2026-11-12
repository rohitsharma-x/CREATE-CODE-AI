import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Bug,
  Zap,
  CheckCircle2,
  Search,
  Filter,
  Check,
  X,
  FileCode2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

export const IssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0, critical: 0 });
  const [statusFilter, setStatusFilter] = useState('open');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const { addToast } = useNotifications();

  const fetchIssues = async () => {
    try {
      const res = await api.get('/issues');
      if (res.data?.success) {
        setIssues(res.data.issues || []);
        setStats(res.data.stats || { total: 0, open: 0, resolved: 0, critical: 0 });
      }
    } catch (err) {
      console.warn('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.patch(`/issues/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        setIssues((prev) =>
          prev.map((iss) => (iss._id === id ? { ...iss, status: newStatus } : iss))
        );
        addToast(`Issue marked as ${newStatus}`, 'success');
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const filtered = issues.filter((iss) => {
    if (statusFilter !== 'All' && iss.status !== statusFilter) return false;
    if (severityFilter !== 'All' && iss.severity !== severityFilter.toLowerCase()) return false;
    if (categoryFilter !== 'All' && iss.category !== categoryFilter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        iss.title.toLowerCase().includes(q) ||
        iss.description.toLowerCase().includes(q) ||
        (iss.file || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
          Issues &amp; Security Findings
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
          Track, inspect, and resolve code vulnerabilities, runtime risks, and performance bottlenecks.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold">{stats.critical || 2}</div>
            <div className="text-xs text-slate-400">Critical Findings</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold">{stats.open || 3}</div>
            <div className="text-xs text-slate-400">Open Issues</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold">{stats.resolved || 1}</div>
            <div className="text-xs text-slate-400">Resolved Issues</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold">{stats.total || 4}</div>
            <div className="text-xs text-slate-400">Total Scanned</div>
          </div>
        </Card>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849]">
        {/* Status buttons */}
        <div className="flex items-center gap-2">
          {['open', 'resolved', 'dismissed', 'All'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? 'bg-[#089E9A] dark:bg-[#12D6C5] text-white dark:text-[#080F17]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
          />
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No issues match current filters.
          </div>
        ) : (
          filtered.map((iss) => (
            <Card key={iss._id} className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Badge variant={iss.severity === 'critical' || iss.severity === 'high' ? 'error' : 'warning'}>
                    {iss.severity}
                  </Badge>
                  <Badge variant="neutral">{iss.category}</Badge>
                  <span className="text-xs font-mono text-slate-400">
                    {iss.file}{iss.lineStart ? `:${iss.lineStart}` : ''}
                  </span>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2">
                  {iss.status === 'open' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(iss._id, 'resolved')}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" /> Resolve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(iss._id, 'dismissed')}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg font-semibold bg-slate-100 dark:bg-[#172636] text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Dismiss
                      </button>
                    </>
                  ) : (
                    <Badge variant={iss.status === 'resolved' ? 'success' : 'neutral'}>
                      {iss.status}
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  {iss.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-1">
                  {iss.description}
                </p>
              </div>

              {iss.suggestedFix && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] text-xs">
                  <span className="font-bold text-[#089E9A] dark:text-[#12D6C5] mr-1.5">
                    Recommended Fix:
                  </span>
                  {iss.suggestedFix}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

