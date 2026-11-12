import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  Plus,
  ArrowRight,
  GitBranch,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

export const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('All'); // 'All', 'Active', 'Completed'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal create
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [lang, setLang] = useState('JavaScript');
  const [stack, setStack] = useState('MERN');
  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      if (res.data?.success) {
        setProjects(res.data.projects || []);
      }
    } catch (err) {
      console.warn('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      const res = await api.post('/projects', {
        name,
        description: desc,
        languages: [lang],
        techStack: stack.split(',').map((s) => s.trim()),
      });
      if (res.data?.success) {
        addToast('Project created successfully', 'success');
        setModalOpen(false);
        setName('');
        setDesc('');
        fetchProjects();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      addToast('Project deleted', 'info');
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      addToast('Failed to delete project', 'error');
    }
  };

  // Filter projects
  const filtered = projects.filter((p) => {
    if (filter === 'Active' && p.status !== 'Active') return false;
    if (filter === 'Completed' && p.status !== 'Completed') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchStack = (p.techStack || []).some((s) => s.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchStack) return false;
    }
    return true;
  });

  const allCount = projects.length;
  const activeCount = projects.filter((p) => p.status === 'Active').length;
  const completedCount = projects.filter((p) => p.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header controls (Matching Reference Image 4) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
            Projects
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Manage your development workspaces, connected repositories, and reviews.
          </p>
        </div>

        <Button size="sm" onClick={() => setModalOpen(true)} icon={Plus}>
          New Project
        </Button>
      </div>

      {/* Tabs and Search Bar (Matching Reference Image 4) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'All'
                ? 'bg-[#089E9A] dark:bg-[#12D6C5] text-white dark:text-[#080F17]'
                : 'bg-slate-100 dark:bg-[#172636] text-slate-600 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#1f3348]'
            }`}
          >
            All ({allCount})
          </button>
          <button
            onClick={() => setFilter('Active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'Active'
                ? 'bg-[#089E9A] dark:bg-[#12D6C5] text-white dark:text-[#080F17]'
                : 'bg-slate-100 dark:bg-[#172636] text-slate-600 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#1f3348]'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilter('Completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'Completed'
                ? 'bg-[#089E9A] dark:bg-[#12D6C5] text-white dark:text-[#080F17]'
                : 'bg-slate-100 dark:bg-[#172636] text-slate-600 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#1f3348]'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
          />
        </div>
      </div>

      {/* Project Cards Grid (Matching Reference Image 4) */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No projects found matching current criteria.
          </div>
        ) : (
          filtered.map((proj) => (
            <Card
              key={proj._id}
              hover
              onClick={() => navigate(`/projects/${proj._id}`)}
              className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              {/* Left Info */}
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5] shrink-0 font-bold group-hover:scale-105 transition-transform">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9] group-hover:text-[#089E9A] dark:group-hover:text-[#12D6C5] transition-colors">
                      {proj.name}
                    </h3>
                    <Badge variant={proj.status === 'Active' ? 'success' : proj.status === 'Completed' ? 'info' : 'warning'}>
                      {proj.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 max-w-xl">
                    {proj.description || 'No description provided.'}
                  </p>

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {(proj.techStack || ['MERN']).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 dark:bg-[#172636] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-[#263849]"
                      >
                        {tag}
                      </span>
                    ))}
                    {proj.githubRepo?.fullName && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium text-sky-400 bg-sky-500/10 border border-sky-500/20">
                        <GitBranch className="w-3 h-3" />
                        {proj.githubRepo.fullName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Progress bar & Actions */}
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#D8E3EA] dark:border-[#263849]">
                <div className="w-36 text-right">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] mb-1">
                    <span>Progress</span>
                    <span>{proj.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-[#172636] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#12D6C5] rounded-full transition-all duration-300"
                      style={{ width: `${proj.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleDelete(proj._id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Project Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Authentication Service"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of purpose and architecture..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
                Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none text-[#0F172A] dark:text-[#F1F5F9]"
              >
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
                <option value="TypeScript">TypeScript</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
                Tech Stack
              </label>
              <input
                type="text"
                placeholder="Node.js, Express, JWT"
                value={stack}
                onChange={(e) => setStack(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none text-[#0F172A] dark:text-[#F1F5F9]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D8E3EA] dark:border-[#263849]">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={creating}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

