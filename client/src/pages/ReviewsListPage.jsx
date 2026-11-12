import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCode2,
  GitPullRequest,
  Search,
  Plus,
  ArrowRight,
  ShieldAlert,
  Bug,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

export const ReviewsListPage = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New review form
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const fetchReviews = async () => {
    try {
      const res = await api.get('/reviews');
      if (res.data?.success) {
        setReviews(res.data.reviews || []);
      }
    } catch (err) {
      console.warn('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        title: title || 'Standalone Code Review',
        code,
        language,
        filename: language === 'python' ? 'main.py' : language === 'cpp' ? 'main.cpp' : 'main.js',
      });
      if (res.data?.success) {
        addToast('Code review completed!', 'success');
        setModalOpen(false);
        setCode('');
        setTitle('');
        navigate(`/reviews/${res.data.review._id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = reviews.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      (r.repository || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
            AI Code Reviews
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Deep static and generative AI reviews of pull requests, commits, and code files.
          </p>
        </div>

        <Button size="sm" onClick={() => setModalOpen(true)} icon={Plus}>
          New Review
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search reviews by title or repo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
        />
      </div>

      {/* Reviews list */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No reviews found. Click "New Review" to analyze your code!
          </div>
        ) : (
          filtered.map((r) => (
            <Card
              key={r._id}
              hover
              onClick={() => navigate(`/reviews/${r._id}`)}
              className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5] font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  #{r.reviewNumber || 101}
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] group-hover:text-[#089E9A] dark:group-hover:text-[#12D6C5] transition-colors">
                      {r.title}
                    </h3>
                    <Badge variant={r.status === 'completed' ? 'success' : 'info'}>
                      {r.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-[#94A3B8]">
                    <span className="font-mono">{r.repository || 'standalone-code'}</span>
                    <span>•</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Summary pills */}
                  <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold">
                    <span className="text-rose-400 flex items-center gap-1">
                      <Bug className="w-3.5 h-3.5" />
                      {r.summary?.bugsCount || 0} Bugs
                    </span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      {r.summary?.securityCount || 0} Security
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Gauge */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#D8E3EA] dark:border-[#263849]">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-semibold">Score</div>
                  <div className="text-xl font-black text-[#089E9A] dark:text-[#12D6C5]">
                    {r.overallScore}/100
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Review Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New AI Code Review">
        <form onSubmit={handleCreateReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
              Review Title
            </label>
            <input
              type="text"
              placeholder="e.g. Auth Service Loop Verification"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
              Programming Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none text-[#0F172A] dark:text-[#F1F5F9]"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="typescript">TypeScript</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
              Code to Review *
            </label>
            <textarea
              rows={8}
              required
              placeholder="Paste code snippet to analyze for bugs, security vulnerabilities, and optimizations..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 font-mono text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D8E3EA] dark:border-[#263849]">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={submitting}>
              Start AI Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

