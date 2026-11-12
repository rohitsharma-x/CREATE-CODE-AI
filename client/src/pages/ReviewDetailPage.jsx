import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FileCode2,
  GitPullRequest,
  GitBranch,
  Bug,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  ChevronRight,
  Filter,
  Check,
  Send,
  Play,
  Terminal,
  Copy,
  Clock,
  Cpu,
  TrendingUp,
  Sparkles,
  Loader2,
  Code2,
  FileCheck,
  Layers,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const ReviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [review, setReview] = useState(null);
  const [activeTab, setActiveTab] = useState('review'); // 'review', 'files', 'comments'
  const [severityFilter, setSeverityFilter] = useState('all');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loading, setLoading] = useState(true);

  // Code inspection & Execution state
  const [codeView, setCodeView] = useState('optimized'); // 'optimized' | 'original'
  const [copied, setCopied] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [customStdin, setCustomStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await api.get(`/reviews/${id}`);
        if (res.data?.success) {
          setReview(res.data.review);
          // Default to original view if no optimized code
          if (!res.data.review.optimizedCode && res.data.review.rawCode) {
            setCodeView('original');
          }
        }
      } catch (err) {
        addToast('Review not found', 'error');
        navigate('/reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReview();
  }, [id, addToast, navigate]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/reviews/${id}/comments`, { text: commentText });
      if (res.data?.success) {
        setReview((prev) => ({ ...prev, comments: res.data.comments }));
        setCommentText('');
        addToast('Comment added', 'success');
      }
    } catch (err) {
      addToast('Failed to add comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    addToast('Code copied to clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = async (codeToRun) => {
    const code = codeToRun || (codeView === 'optimized' ? (review?.optimizedCode || review?.rawCode) : review?.rawCode);
    if (!code) {
      addToast('No code available to execute', 'warning');
      return;
    }

    setExecuting(true);
    try {
      const res = await api.post('/code/execute', {
        sourceCode: code,
        language: review?.language || 'javascript',
        stdin: customStdin,
      });

      const execData = res.data?.execution || res.data?.result;
      if (res.data?.success && execData) {
        setExecutionResult(execData);
        const isPass = execData.status === 'Accepted' || execData.statusCode === 3;
        addToast(`Execution finished: ${execData.status || 'Done'}`, isPass ? 'success' : 'warning');
      } else {
        addToast(res.data?.message || 'Code execution failed', 'error');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Execution request failed', 'error');
    } finally {
      setExecuting(false);
    }
  };

  const handleSendToPlayground = (codeToSend) => {
    const code = codeToSend || (codeView === 'optimized' ? (review?.optimizedCode || review?.rawCode) : review?.rawCode);
    navigate('/playground', {
      state: {
        initialCode: code,
        initialLanguage: review?.language || 'javascript',
      },
    });
  };

  if (loading || !review) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading review analysis...
      </div>
    );
  }

  const findings = review.findings || [];
  const filteredFindings = findings.filter((f) => {
    if (severityFilter === 'all') return true;
    return f.severity === severityFilter;
  });

  const displayCode = codeView === 'optimized'
    ? (review.optimizedCode || review.rawCode || '// No code available')
    : (review.rawCode || review.optimizedCode || '// No code available');

  return (
    <div className="space-y-6">
      {/* Breadcrumb (Matching Reference Image 6) */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/reviews" className="hover:text-[#089E9A] dark:hover:text-[#12D6C5]">
          Code Reviews
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#0F172A] dark:text-[#F1F5F9]">Review #CR-{review.reviewNumber || (review._id && review._id.slice(-4)) || '101'}</span>
      </div>

      {/* PR Header (Matching Reference Image 6) */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <GitPullRequest className="w-6 h-6" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  {review.title}
                </h2>
                <Badge variant={review.status === 'completed' ? 'success' : 'info'}>
                  {review.status === 'completed' ? 'Analyzed & Ready' : review.status}
                </Badge>
                {review.isAlreadyOptimal && (
                  <Badge variant="success">⚡ Already Optimal</Badge>
                )}
              </div>

              {/* Repo and branch pills */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-[#94A3B8]">
                <span className="flex items-center gap-1.5 font-mono">
                  <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
                  {review.repository || 'standalone-code'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-mono">
                  <GitBranch className="w-3.5 h-3.5 text-sky-400" />
                  {review.branch?.base || 'main'} &lt;— {review.branch?.head || 'feature/optimization'}
                </span>
                <span>•</span>
                <span className="capitalize font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#172636] text-slate-600 dark:text-[#94A3B8]">
                  {review.language || 'javascript'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSendToPlayground()}
              icon={Terminal}
            >
              Open in Playground
            </Button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#D8E3EA] dark:border-[#263849]">
          <button
            onClick={() => setActiveTab('review')}
            className={`pb-2 text-xs font-semibold uppercase tracking-wider relative transition-colors ${
              activeTab === 'review'
                ? 'text-[#089E9A] dark:text-[#12D6C5]'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            AI Review &amp; Optimization
            {activeTab === 'review' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#089E9A] dark:bg-[#12D6C5] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={`pb-2 text-xs font-semibold uppercase tracking-wider relative transition-colors ${
              activeTab === 'files'
                ? 'text-[#089E9A] dark:text-[#12D6C5]'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Files Changed ({(review.filesChanged || []).length || 1})
            {activeTab === 'files' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#089E9A] dark:bg-[#12D6C5] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-2 text-xs font-semibold uppercase tracking-wider relative transition-colors ${
              activeTab === 'comments'
                ? 'text-[#089E9A] dark:text-[#12D6C5]'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Comments ({(review.comments || []).length})
            {activeTab === 'comments' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#089E9A] dark:bg-[#12D6C5] rounded-full" />
            )}
          </button>
        </div>
      </Card>

      {/* Tab: AI Review */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {/* Optimal Code Banner if code was already optimal */}
          {review.isAlreadyOptimal && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs">Code Is Already Optimal</h4>
                <p className="text-xs text-emerald-400/90 mt-1 leading-relaxed">
                  {review.optimalExplanation ||
                    'This code already operates at optimal algorithmic complexity, adheres to secure clean-coding standards, and correctly handles boundary conditions without redundant overhead.'}
                </p>
              </div>
            </div>
          )}

          {/* Two Overview Cards (Matching Reference Image 6) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Card: AI Code Review Summary */}
            <Card className="lg:col-span-6 p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
                AI Code Review Summary
              </h3>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                  <div className="flex items-center gap-3">
                    <Bug className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold">{review.summary?.bugsCount ?? 0} Bugs Found</span>
                  </div>
                  <span className="text-[11px] font-semibold text-rose-400">Logical &amp; Boundary</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold">{review.summary?.securityCount ?? 0} Security Issue</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-400">Sanitization &amp; Safety</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold">{review.summary?.improvementsCount ?? 0} Improvements</span>
                  </div>
                  <span className="text-[11px] font-semibold text-sky-400">Readability &amp; Style</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-bold">Code Optimization ({review.summary?.optimizationsCount ?? 1})</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400">Performance Tuned</span>
                </div>
              </div>
            </Card>

            {/* Right Card: Review Details & Scores (Matching Reference Image 6) */}
            <Card className="lg:col-span-6 p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  Review Details
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-[#089E9A] dark:text-[#12D6C5]">
                    {review.overallScore || 86}
                  </span>
                  <span className="text-xs text-slate-400">/100</span>
                </div>
              </div>

              {/* Overall Score Progress Bar */}
              <div>
                <div className="w-full h-2 bg-slate-100 dark:bg-[#172636] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#12D6C5] rounded-full transition-all duration-500"
                    style={{ width: `${review.overallScore || 86}%` }}
                  />
                </div>
              </div>

              {/* Sub-Metrics Breakdown */}
              <div className="space-y-3 pt-2 text-xs font-medium">
                <div>
                  <div className="flex justify-between text-slate-500 dark:text-[#94A3B8] mb-1">
                    <span>Code Quality</span>
                    <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      {review.metrics?.codeQuality || 88}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#172636] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${review.metrics?.codeQuality || 88}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 dark:text-[#94A3B8] mb-1">
                    <span>Security</span>
                    <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      {review.metrics?.security || 80}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#172636] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${review.metrics?.security || 80}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 dark:text-[#94A3B8] mb-1">
                    <span>Performance</span>
                    <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      {review.metrics?.performance || 85}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#172636] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 rounded-full"
                      style={{ width: `${review.metrics?.performance || 85}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-500 dark:text-[#94A3B8] mb-1">
                    <span>Maintainability</span>
                    <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      {review.metrics?.maintainability || 90}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#172636] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full"
                      style={{ width: `${review.metrics?.maintainability || 90}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Section: Complexity Comparison */}
          {(review.complexityComparison || review.metrics) && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#089E9A] dark:text-[#12D6C5]" />
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    Time &amp; Space Complexity Comparison
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Algorithmic Profiling
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Complexity */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#172636]/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Original Complexity
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Time: {review.complexityComparison?.originalTime || 'O(n²)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Space: {review.complexityComparison?.originalSpace || 'O(1)'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                    Nested traversals or redundant operations create performance bottlenecks on large input sets.
                  </p>
                </div>

                {/* Optimized Complexity */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Optimized Complexity</span>
                    <Badge variant="success">Recommended</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Time: {review.complexityComparison?.optimizedTime || 'O(n)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-300">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Space: {review.complexityComparison?.optimizedSpace || 'O(1)'}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-300/80 leading-relaxed pt-1">
                    {review.complexityComparison?.explanation ||
                      'Reduced execution cycles by replacing nested iterations with linear scans or direct indexing.'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Section: Optimized Code & Live Execution */}
          <Card className="overflow-hidden">
            {/* Header with Switcher and Action Buttons */}
            <div className="p-4 bg-slate-50 dark:bg-[#172636] border-b border-[#D8E3EA] dark:border-[#263849] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCodeView('optimized')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    codeView === 'optimized'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white dark:bg-[#111E2B] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ⚡ Optimized Code
                </button>
                <button
                  type="button"
                  onClick={() => setCodeView('original')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    codeView === 'original'
                      ? 'bg-[#089E9A] dark:bg-[#12D6C5] text-white dark:text-[#080F17] shadow-sm'
                      : 'bg-white dark:bg-[#111E2B] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Original Code
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Toggle Stdin */}
                <button
                  type="button"
                  onClick={() => setShowStdin(!showStdin)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    showStdin
                      ? 'bg-[#12D6C5]/15 border-[#12D6C5]/40 text-[#089E9A] dark:text-[#12D6C5]'
                      : 'bg-white dark:bg-[#111E2B] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Custom stdin
                </button>

                {/* Run Code Button */}
                <Button
                  size="sm"
                  onClick={() => handleRunCode()}
                  disabled={executing}
                  icon={executing ? Loader2 : Play}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {executing ? 'Executing...' : 'Run Code'}
                </Button>

                {/* Send to Playground Button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendToPlayground()}
                  icon={Terminal}
                >
                  Send to Playground
                </Button>

                {/* Copy Code Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyCode(displayCode)}
                  icon={copied ? Check : Copy}
                >
                  {copied ? 'Copied!' : 'Copy Code'}
                </Button>
              </div>
            </div>

            {/* Optional Custom Stdin */}
            {showStdin && (
              <div className="p-3 bg-slate-100 dark:bg-[#13202E] border-b border-[#D8E3EA] dark:border-[#263849]">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Custom Standard Input (stdin)
                </label>
                <textarea
                  rows={2}
                  value={customStdin}
                  onChange={(e) => setCustomStdin(e.target.value)}
                  placeholder="Provide arguments or stdin lines for execution..."
                  className="w-full p-2 text-xs font-mono rounded-lg bg-white dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
                />
              </div>
            )}

            {/* Code Body */}
            <div className="relative">
              <pre className="p-4 text-xs font-mono text-[#F1F5F9] bg-[#09111A] overflow-x-auto leading-relaxed max-h-[460px]">
                <code>{displayCode}</code>
              </pre>
            </div>

            {/* Actual Live Execution Output Console */}
            {executionResult && (
              <div className="border-t border-slate-800 bg-[#060B11] p-4 text-xs font-mono">
                <div className="flex flex-wrap items-center justify-between pb-2 mb-2 border-b border-slate-800 gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        executionResult.status === 'Accepted' || executionResult.statusCode === 3
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span className="font-bold text-slate-200">
                      Actual Execution Output (Judge0 / Native Execution)
                    </span>
                    <Badge
                      variant={
                        executionResult.status === 'Accepted' || executionResult.statusCode === 3
                          ? 'success'
                          : 'error'
                      }
                    >
                      {executionResult.status || 'Executed'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                    {(executionResult.time || executionResult.executionTime) && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {executionResult.time || executionResult.executionTime}
                      </span>
                    )}
                    {executionResult.memory && (
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {executionResult.memory}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  {executionResult.compileOutput && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-rose-400 mb-1">
                        Compilation Output:
                      </div>
                      <pre className="text-rose-400 bg-rose-950/30 p-2.5 rounded-lg whitespace-pre-wrap">
                        {executionResult.compileOutput}
                      </pre>
                    </div>
                  )}

                  {executionResult.stderr && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-amber-400 mb-1">
                        Runtime Stderr:
                      </div>
                      <pre className="text-amber-400 bg-amber-950/30 p-2.5 rounded-lg whitespace-pre-wrap">
                        {executionResult.stderr}
                      </pre>
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">
                      Standard Output:
                    </div>
                    <pre className="text-emerald-300 bg-emerald-950/20 p-2.5 rounded-lg whitespace-pre-wrap">
                      {executionResult.stdout || 'Program executed with no standard output.'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Section: Optimization Suggestions */}
          {review.optimizationSuggestions && review.optimizationSuggestions.length > 0 && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
                <Zap className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  Optimization Suggestions &amp; Architectural Improvements
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {review.optimizationSuggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] flex items-start gap-2.5"
                  >
                    <Check className="w-4 h-4 text-[#089E9A] dark:text-[#12D6C5] shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
                      {suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Section: Test Cases (Normal, Boundary, Edge) */}
          {review.testCases && review.testCases.length > 0 && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    Verified Test Cases (Normal, Boundary &amp; Edge)
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {review.testCases.length} Test Suites
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {review.testCases.map((tc, idx) => {
                  const badgeColor =
                    tc.type === 'boundary'
                      ? 'warning'
                      : tc.type === 'edge'
                      ? 'error'
                      : 'info';

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Badge variant={badgeColor}>
                            {(tc.type || 'normal').toUpperCase()}
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-mono">Case #{idx + 1}</span>
                        </div>
                        <h5 className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                          {tc.description || 'Test validation'}
                        </h5>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono">
                        <div className="p-1.5 rounded bg-black/30 text-sky-400 truncate">
                          <span className="text-slate-500 mr-1 select-none">In:</span>
                          {tc.input}
                        </div>
                        <div className="p-1.5 rounded bg-black/30 text-emerald-400 truncate">
                          <span className="text-slate-500 mr-1 select-none">Out:</span>
                          {tc.expectedOutput}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Detailed Findings List (Errors, Bugs, Security) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                Review Findings &amp; Errors ({filteredFindings.length})
              </h3>

              {/* Severity filter */}
              <div className="flex items-center gap-1.5">
                {['all', 'critical', 'high', 'medium'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setSeverityFilter(sev)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold uppercase transition-all ${
                      severityFilter === sev
                        ? 'bg-[#089E9A] dark:bg-[#12D6C5] text-white dark:text-[#080F17]'
                        : 'bg-slate-100 dark:bg-[#172636] text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3.5">
              {filteredFindings.map((finding, idx) => (
                <Card key={idx} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={finding.severity === 'critical' || finding.severity === 'high' ? 'error' : 'warning'}>
                          {finding.severity}
                        </Badge>
                        <Badge variant="neutral">{finding.category}</Badge>
                        <span className="text-xs font-mono text-slate-400">
                          {finding.file}:{finding.lineStart}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                        {finding.title}
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
                    {finding.description}
                  </p>

                  {finding.suggestion && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] text-xs">
                      <span className="font-bold text-[#089E9A] dark:text-[#12D6C5] mr-1">
                        Recommendation:
                      </span>
                      {finding.suggestion}
                    </div>
                  )}

                  {finding.suggestedCode && (
                    <div className="rounded-xl overflow-hidden border border-emerald-500/25 bg-[#09111A]">
                      <div className="px-3 py-1.5 bg-emerald-500/10 border-b border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400 flex items-center justify-between">
                        <span>Suggested Code Replacement</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(finding.suggestedCode)}
                          className="hover:underline flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Copy Snippet
                        </button>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-[#F1F5F9] overflow-x-auto">
                        <code>{finding.suggestedCode}</code>
                      </pre>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Files Changed */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          {(review.filesChanged || []).map((file, idx) => (
            <Card key={idx} className="overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 dark:bg-[#172636] border-b border-[#D8E3EA] dark:border-[#263849] flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                  {file.filename}
                </span>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-emerald-500 font-bold">+{file.additions || 0}</span>
                  <span className="text-rose-500 font-bold">-{file.deletions || 0}</span>
                </div>
              </div>
              <pre className="p-4 font-mono text-xs text-[#F1F5F9] bg-[#09111A] overflow-x-auto leading-relaxed">
                <code>{file.patch || review.rawCode}</code>
              </pre>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Comments */}
      {activeTab === 'comments' && (
        <Card className="p-5 space-y-6">
          <div className="space-y-4">
            {(review.comments || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No comments posted yet.
              </p>
            ) : (
              review.comments.map((c, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849]">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-[#0F172A] dark:text-[#F1F5F9]">{c.authorName || 'Developer'}</span>
                    <span className="text-slate-400 text-[10px]">{new Date(c.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8]">{c.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Leave a comment on this review..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
            />
            <Button type="submit" size="sm" loading={submittingComment} icon={Send}>
              Comment
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
