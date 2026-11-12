import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  FileCode2,
  Bug,
  ShieldAlert,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  GitPullRequest,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import api from '../services/api';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    activeProjects: 8,
    codeReviews: 24,
    bugsDetected: 12,
    securityIssues: 6,
  });

  const [activities, setActivities] = useState([
    {
      id: 1,
      title: 'AI review completed for Auth Service',
      time: '5 min ago',
      type: 'review',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      link: '/reviews',
    },
    {
      id: 2,
      title: 'New comment on PR #42',
      time: '18 min ago',
      type: 'comment',
      icon: GitPullRequest,
      color: 'text-sky-400',
      link: '/github',
    },
    {
      id: 3,
      title: 'Bug detected in user.js',
      time: '35 min ago',
      type: 'bug',
      icon: Bug,
      color: 'text-rose-400',
      link: '/issues',
    },
    {
      id: 4,
      title: 'Created project Alpha',
      time: '1 hr ago',
      type: 'project',
      icon: FolderKanban,
      color: 'text-[#12D6C5]',
      link: '/projects',
    },
  ]);

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projRes, reviewRes, issueRes] = await Promise.all([
          api.get('/projects'),
          api.get('/reviews'),
          api.get('/issues'),
        ]);

        if (projRes.data?.success) {
          setProjects(projRes.data.projects || []);
        }

        const revCount = reviewRes.data?.count || 24;
        const issues = issueRes.data?.issues || [];
        const bugsCount = issues.filter((i) => i.category === 'bug' && i.status === 'open').length || 12;
        const secCount = issues.filter((i) => i.category === 'security' && i.status === 'open').length || 6;

        setMetrics({
          activeProjects: projRes.data?.count || 8,
          codeReviews: revCount,
          bugsDetected: bugsCount,
          securityIssues: secCount,
        });
      } catch (err) {
        console.warn('Dashboard data fetch fallback used');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Rohit';

  return (
    <div className="space-y-6">
      {/* Welcome Banner (Matching Reference Image 3) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight">
            Hi, {firstName} 👋
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Here's what's happening with your projects today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => navigate('/projects')}
            icon={Plus}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards (Matching Reference Image 3) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Projects */}
        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9] leading-none">
              {metrics.activeProjects}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">
              Active Projects
            </div>
          </div>
        </Card>

        {/* Code Reviews */}
        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-[#12D6C5]/10 border border-[#12D6C5]/20 flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5] shrink-0">
            <FileCode2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9] leading-none">
              {metrics.codeReviews}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">
              Code Reviews
            </div>
          </div>
        </Card>

        {/* Bugs Detected */}
        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9] leading-none">
              {metrics.bugsDetected}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">
              Bugs Detected
            </div>
          </div>
        </Card>

        {/* Security Issues */}
        <Card className="p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9] leading-none">
              {metrics.securityIssues}
            </div>
            <div className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">
              Security Issues
            </div>
          </div>
        </Card>
      </div>

      {/* Main Two-Column Section (Recent Activity + Project Progress) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Activity */}
        <Card className="lg:col-span-7 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8E3EA] dark:border-[#263849] mb-4">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              Recent Activity
            </h3>
            <button
              onClick={() => navigate('/notifications')}
              className="text-xs font-semibold text-[#089E9A] dark:text-[#12D6C5] hover:underline"
            >
              View all
            </button>
          </div>

          <div className="space-y-4">
            {activities.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  onClick={() => navigate(act.link)}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#172636] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#172636] flex items-center justify-center ${act.color} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-[#94A3B8]">
                        {act.time}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Project Progress Donut Gauge */}
        <Card className="lg:col-span-5 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#D8E3EA] dark:border-[#263849] mb-4">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              Project Progress
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            {/* Donut progress visual */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Track */}
                <path
                  className="text-slate-100 dark:text-[#172636]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                {/* Completed Stroke (72%) */}
                <path
                  className="text-emerald-400"
                  strokeDasharray="72, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#0F172A] dark:text-[#F1F5F9]">
                  72%
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Overall
                </span>
              </div>
            </div>

            {/* Legend (Matching Screenshot 3) */}
            <div className="space-y-2 text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-600 dark:text-[#94A3B8]">Completed:</span>
                <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">72%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-slate-600 dark:text-[#94A3B8]">In Progress:</span>
                <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">18%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-slate-600 dark:text-[#94A3B8]">Pending:</span>
                <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">10%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#D8E3EA] dark:border-[#263849] flex justify-end">
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-semibold text-[#089E9A] dark:text-[#12D6C5] hover:underline inline-flex items-center gap-1"
            >
              View detailed roadmap <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </Card>
      </div>

      {/* Quick Launchpad Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Card
          hover
          onClick={() => navigate('/chat')}
          className="p-5 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#12D6C5]/10 border border-[#12D6C5]/20 flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">AI Coding Chat</h4>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Pair programmer with 7 AI modes</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Card>

        <Card
          hover
          onClick={() => navigate('/playground')}
          className="p-5 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">Code Playground</h4>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Run multi-language code & tests</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Card>

        <Card
          hover
          onClick={() => navigate('/reviews')}
          className="p-5 flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">AI Code Review</h4>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Review pull requests & snippets</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Card>
      </div>
    </div>
  );
};

const ChevronRight = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

