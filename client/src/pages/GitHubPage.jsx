import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  CheckCircle2,
  GitPullRequest,
  ExternalLink,
  RefreshCw,
  Play,
  ShieldAlert,
  Sliders,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

export const GitHubPage = () => {
  const [account, setAccount] = useState({
    connected: true,
    githubUsername: 'rohit-dev',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    connectedAt: '2025-01-20',
    settings: {
      autoReviewPR: true,
      commentOnPR: true,
      reviewOnPush: false,
    },
  });

  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(null);

  const { addToast } = useNotifications();

  const fetchStatus = async () => {
    try {
      const res = await api.get('/github/account');
      if (res.data?.success) {
        setAccount(res.data);
      }
      const repoRes = await api.get('/github/repositories');
      if (repoRes.data?.success) {
        setRepos(repoRes.data.repositories || []);
      }
    } catch (err) {
      console.warn('Using default github status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggle = async (key) => {
    const updated = {
      ...account.settings,
      [key]: !account.settings[key],
    };

    setAccount((prev) => ({ ...prev, settings: updated }));

    try {
      await api.patch('/github/settings', updated);
      addToast('GitHub automation preferences updated', 'success');
    } catch (err) {
      addToast('Failed to update setting', 'error');
    }
  };

  const handleConnectToggle = async () => {
    if (account.connected) {
      if (!window.confirm('Disconnect your GitHub account?')) return;
      try {
        await api.delete('/github/disconnect');
        setAccount((prev) => ({ ...prev, connected: false }));
        addToast('GitHub disconnected', 'info');
      } catch (err) {
        addToast('Failed to disconnect', 'error');
      }
    } else {
      try {
        await api.post('/github/connect', { username: 'rohit-dev' });
        setAccount((prev) => ({ ...prev, connected: true, githubUsername: 'rohit-dev' }));
        addToast('GitHub connected successfully', 'success');
        fetchStatus();
      } catch (err) {
        addToast('Failed to connect GitHub', 'error');
      }
    }
  };

  const handleTriggerManualReview = async (repoName) => {
    setTriggering(repoName);
    try {
      const res = await api.post('/github/trigger-review', {
        repoFullName: repoName,
        prNumber: 42,
        prTitle: 'Add user authentication and JWT validation',
      });
      if (res.data?.success) {
        addToast('Background PR review dispatched! Check AI Code Reviews in a moment.', 'success');
      }
    } catch (err) {
      addToast('Failed to trigger review', 'error');
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header (Matching Reference Image 7) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
            GitHub Integration
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Connect your GitHub account to enable automatic code reviews for pull requests.
          </p>
        </div>

        {account.connected && (
          <Badge variant="success" size="md">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </Badge>
        )}
      </div>

      {/* Account Info Card (Matching Reference Image 7) */}
      <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={account.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="GitHub avatar"
            className="w-12 h-12 rounded-full object-cover border border-[#12D6C5]/40 shrink-0"
          />
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              {account.githubUsername || 'Not Connected'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              {account.connected ? 'Connected on Jan 20, 2025' : 'No account linked'}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleConnectToggle}
          className={account.connected ? 'hover:border-rose-500 hover:text-rose-500' : ''}
        >
          {account.connected ? 'Disconnect' : 'Connect GitHub'}
        </Button>
      </Card>

      {/* Feature Toggles (Matching Reference Image 7) */}
      <Card className="p-5 divide-y divide-[#D8E3EA] dark:divide-[#263849]">
        {/* Toggle 1: Automatic PR Review */}
        <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
          <div>
            <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              Automatic PR Review
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Run AI review automatically when a pull request is opened.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggle('autoReviewPR')}
            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
              account.settings?.autoReviewPR
                ? 'bg-[#089E9A] dark:bg-[#12D6C5]'
                : 'bg-slate-300 dark:bg-[#263849]'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                account.settings?.autoReviewPR ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Comment on PR */}
        <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
          <div>
            <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              Comment on PR
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Post AI review findings as a comment in the pull request.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggle('commentOnPR')}
            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
              account.settings?.commentOnPR
                ? 'bg-[#089E9A] dark:bg-[#12D6C5]'
                : 'bg-slate-300 dark:bg-[#263849]'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                account.settings?.commentOnPR ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Toggle 3: Review on Push */}
        <div className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
          <div>
            <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">
              Review on Push
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mt-0.5">
              Analyze code changes when new commits are pushed.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggle('reviewOnPush')}
            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
              account.settings?.reviewOnPush
                ? 'bg-[#089E9A] dark:bg-[#12D6C5]'
                : 'bg-slate-300 dark:bg-[#263849]'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                account.settings?.reviewOnPush ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>

      {/* Connected Repositories Section */}
      <div className="space-y-3.5">
        <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
          Configured Repositories
        </h3>

        <div className="space-y-3">
          {(repos.length > 0 ? repos : [
            { fullName: 'rohit-dev/devreview-platform', defaultBranch: 'main' },
            { fullName: 'rohit-dev/auth-service', defaultBranch: 'main' },
          ]).map((r, idx) => (
            <Card key={idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {r.fullName}
                  </h4>
                  <p className="text-[11px] text-slate-400">Default branch: {r.defaultBranch || 'main'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  loading={triggering === r.fullName}
                  onClick={() => handleTriggerManualReview(r.fullName)}
                  icon={Play}
                >
                  Trigger Review
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

