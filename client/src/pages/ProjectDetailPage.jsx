import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  FileCode2,
  MessageSquareCode,
  Bug,
  ShieldAlert,
  ArrowLeft,
  GitBranch,
  ExternalLink,
  Plus,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const [project, setProject] = useState(null);
  const [related, setRelated] = useState({ reviews: [], chats: [], issues: [] });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'reviews', 'chats', 'issues'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        if (res.data?.success) {
          setProject(res.data.project);
          setRelated(res.data.related || { reviews: [], chats: [], issues: [] });
        }
      } catch (err) {
        addToast('Project not found', 'error');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, addToast, navigate]);

  if (loading || !project) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Loading project details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {project.name}
              </h2>
              <Badge variant={project.status === 'Active' ? 'success' : 'info'}>
                {project.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
              {project.description || 'No description'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/playground')}
            icon={Play}
          >
            Open Playground
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/chat')}
            icon={MessageSquareCode}
          >
            Start AI Chat
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#D8E3EA] dark:border-[#263849]">
        {['overview', 'reviews', 'chats', 'issues'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-all relative ${
              activeTab === tab
                ? 'text-[#089E9A] dark:text-[#12D6C5]'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#089E9A] dark:bg-[#12D6C5] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-5 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Tech Stack &amp; Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {(project.languages || []).map((l, i) => (
                  <Badge key={i} variant="teal">{l}</Badge>
                ))}
                {(project.techStack || []).map((s, i) => (
                  <span key={i} className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-[#172636] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#263849]">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span>Completion Progress</span>
                <span className="text-[#089E9A] dark:text-[#12D6C5]">{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#172636] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#12D6C5] rounded-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Connected GitHub Repository
              </h3>
              {project.githubRepo?.fullName ? (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <GitBranch className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-mono font-semibold">{project.githubRepo.fullName}</span>
                  </div>
                  <Badge variant="success">Auto Review Enabled</Badge>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#D8E3EA] dark:border-[#263849] text-center text-xs text-slate-400">
                  No repository linked yet. Connect from the GitHub Integration page.
                </div>
              )}
            </div>
          </Card>

          {/* Quick Metrics */}
          <div className="space-y-4">
            <Card className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#12D6C5]/10 border border-[#12D6C5]/20 flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5]">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold">{related.reviews.length}</div>
                <div className="text-xs text-slate-400 font-medium">Code Reviews</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold">{related.issues.length}</div>
                <div className="text-xs text-slate-400 font-medium">Open Findings</div>
              </div>
            </Card>

            <Card className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <MessageSquareCode className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-bold">{related.chats.length}</div>
                <div className="text-xs text-slate-400 font-medium">AI Pair Chats</div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <Card className="p-5">
          <div className="space-y-3">
            {related.reviews.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No reviews yet. Run a review on your code snippet or PR!
              </div>
            ) : (
              related.reviews.map((rev) => (
                <div
                  key={rev._id}
                  onClick={() => navigate(`/reviews/${rev._id}`)}
                  className="p-3.5 rounded-xl border border-[#D8E3EA] dark:border-[#263849] hover:bg-slate-50 dark:hover:bg-[#172636] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#12D6C5]/10 text-[#12D6C5] flex items-center justify-center font-bold text-xs">
                      #{rev.reviewNumber}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">{rev.title}</p>
                      <p className="text-[11px] text-slate-400">Score: {rev.overallScore}/100 • {rev.reviewType}</p>
                    </div>
                  </div>
                  <Badge variant="teal">{rev.status}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Chats Tab */}
      {activeTab === 'chats' && (
        <Card className="p-5">
          <div className="space-y-3">
            {related.chats.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No chat conversations yet. Start a chat with the AI Pair Programmer!
              </div>
            ) : (
              related.chats.map((c) => (
                <div
                  key={c._id}
                  onClick={() => navigate(`/chat?id=${c._id}`)}
                  className="p-3.5 rounded-xl border border-[#D8E3EA] dark:border-[#263849] hover:bg-slate-50 dark:hover:bg-[#172636] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">{c.title}</p>
                    <p className="text-[11px] text-slate-400">{c.mode} • {c.language}</p>
                  </div>
                  <Badge variant="neutral">{c.mode}</Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <Card className="p-5">
          <div className="space-y-3">
            {related.issues.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No open issues detected for this project.
              </div>
            ) : (
              related.issues.map((iss) => (
                <div
                  key={iss._id}
                  className="p-3.5 rounded-xl border border-[#D8E3EA] dark:border-[#263849] flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">{iss.title}</p>
                    <p className="text-[11px] text-slate-400">{iss.file}:{iss.lineStart} — {iss.description}</p>
                  </div>
                  <Badge variant={iss.severity === 'critical' ? 'error' : 'warning'}>
                    {iss.severity}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

