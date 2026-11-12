import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Sliders,
  KeyRound,
  Cpu,
  CheckCircle2,
  Upload,
  Lock,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

export const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addToast } = useNotifications();

  const [activeTab, setActiveTab] = useState('profile'); // profile, accounts, preferences, security, usage

  // Profile form state (Matching Reference Image 9)
  const [fullName, setFullName] = useState(user?.name || 'Rohit Sharma');
  const [username, setUsername] = useState(user?.username || 'rohit-dev');
  const [email, setEmail] = useState(user?.email || 'rohit.sharma@example.com');
  const [bio, setBio] = useState(user?.bio || 'Full-stack developer | MERN | Open Source');
  const [avatar, setAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [savingProfile, setSavingProfile] = useState(false);

  // Security form state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Preferences form state
  const [defaultLang, setDefaultLang] = useState(user?.defaultLanguage || 'javascript');
  const [defaultMode, setDefaultMode] = useState(user?.defaultAiMode || 'Debug');

  // API Usage
  const [usage, setUsage] = useState({
    aiRequests: 42,
    codeExecutions: 18,
    reviewsCount: 24,
    limits: { aiRequests: 500, codeExecutions: 200, reviewsCount: 100 },
  });

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setUsername(user.username || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      if (user.avatar) setAvatar(user.avatar);
      if (user.apiUsage) setUsage(user.apiUsage);
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.patch('/settings/profile', {
        name: fullName,
        username,
        bio,
        avatar,
      });
      if (res.data?.success) {
        updateUser(res.data.user);
        addToast('Profile updated successfully', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currPassword || !newPassword) return;

    setChangingPass(true);
    try {
      const res = await api.post('/settings/change-password', {
        currentPassword: currPassword,
        newPassword,
      });
      if (res.data?.success) {
        addToast('Password changed successfully', 'success');
        setCurrPassword('');
        setNewPassword('');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setChangingPass(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      const res = await api.patch('/settings/preferences', {
        themePreference: theme,
        defaultLanguage: defaultLang,
        defaultAiMode: defaultMode,
      });
      if (res.data?.success) {
        updateUser(res.data.user);
        addToast('Preferences saved successfully', 'success');
      }
    } catch (err) {
      addToast('Failed to save preferences', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
          Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
          Manage your personal developer profile, connected accounts, preferences, and API quotas.
        </p>
      </div>

      {/* Tabs Bar (Matching Reference Image 9) */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-[#D8E3EA] dark:border-[#263849]">
        {[
          { id: 'profile', label: 'Profile' },
          { id: 'accounts', label: 'Accounts' },
          { id: 'preferences', label: 'Preferences' },
          { id: 'security', label: 'Security' },
          { id: 'usage', label: 'API Usage' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-[#089E9A] dark:bg-[#12D6C5] text-white dark:text-[#080F17]'
                : 'text-slate-500 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#172636]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab (Matching Reference Image 9) */}
      {activeTab === 'profile' && (
        <Card className="p-6 max-w-2xl">
          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6 pb-6 border-b border-[#D8E3EA] dark:border-[#263849]">
              <img
                src={avatar}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#12D6C5]/50 shadow-md"
              />
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    const url = prompt('Enter image URL for avatar:', avatar);
                    if (url) setAvatar(url);
                  }}
                  icon={Upload}
                >
                  Update Photo
                </Button>
                <p className="text-[11px] text-slate-400">
                  Recommended: Square JPG or PNG, at least 300x300px
                </p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#172636]/50 border border-[#D8E3EA] dark:border-[#263849] text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" loading={savingProfile}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <Card className="p-6 max-w-2xl space-y-5">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
            Connected Accounts
          </h3>

          <div className="p-4 rounded-xl border border-[#D8E3EA] dark:border-[#263849] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#12D6C5]/10 flex items-center justify-center font-bold">
                GH
              </div>
              <div>
                <div className="text-xs font-bold">GitHub Account</div>
                <div className="text-[11px] text-slate-400">rohit-dev • Connected</div>
              </div>
            </div>
            <Badge variant="success">Active</Badge>
          </div>

          <div className="p-4 rounded-xl border border-[#D8E3EA] dark:border-[#263849] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
                G
              </div>
              <div>
                <div className="text-xs font-bold">Google Account</div>
                <div className="text-[11px] text-slate-400">{user?.email || 'rohit.sharma@example.com'}</div>
              </div>
            </div>
            <Badge variant="teal">Linked</Badge>
          </div>
        </Card>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <Card className="p-6 max-w-2xl space-y-5">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
            Platform Preferences
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1.5">Color Theme</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-4 py-2 rounded-xl font-bold border transition-all ${
                    theme === 'dark'
                      ? 'bg-[#12D6C5] text-[#080F17] border-[#12D6C5]'
                      : 'border-[#263849] text-slate-400'
                  }`}
                >
                  Dark Theme (#080F17)
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-4 py-2 rounded-xl font-bold border transition-all ${
                    theme === 'light'
                      ? 'bg-[#089E9A] text-white border-[#089E9A]'
                      : 'border-[#D8E3EA] text-slate-600'
                  }`}
                >
                  Light Theme (#F3F7FA)
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1.5">Default Programming Language</label>
              <select
                value={defaultLang}
                onChange={(e) => setDefaultLang(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1.5">Default AI Chat Mode</label>
              <select
                value={defaultMode}
                onChange={(e) => setDefaultMode(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none"
              >
                <option value="Debug">Debug</option>
                <option value="Optimize">Optimize</option>
                <option value="Explain">Explain</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button size="sm" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="p-6 max-w-2xl">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
              Change Password
            </h3>

            <div>
              <label className="block text-xs font-semibold mb-1.5">Current Password</label>
              <input
                type="password"
                required
                value={currPassword}
                onChange={(e) => setCurrPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" size="sm" loading={changingPass}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* API Usage Tab */}
      {activeTab === 'usage' && (
        <Card className="p-6 max-w-2xl space-y-5">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
            Monthly API Quota &amp; Usage
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>AI Chat &amp; Analysis Requests</span>
                <span>{usage.aiRequests} / {usage.limits?.aiRequests || 500}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#172636] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#12D6C5] rounded-full"
                  style={{ width: `${(usage.aiRequests / (usage.limits?.aiRequests || 500)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Judge0 Code Executions</span>
                <span>{usage.codeExecutions} / {usage.limits?.codeExecutions || 200}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#172636] rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{ width: `${(usage.codeExecutions / (usage.limits?.codeExecutions || 200)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Full PR Code Reviews</span>
                <span>{usage.reviewsCount} / {usage.limits?.reviewsCount || 100}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-[#172636] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${(usage.reviewsCount / (usage.limits?.reviewsCount || 100)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

