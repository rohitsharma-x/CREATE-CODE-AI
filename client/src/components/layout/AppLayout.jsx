import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ToastContainer } from '../common/ToastContainer';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const AppLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);

  // New project form state
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLang, setProjLang] = useState('JavaScript');
  const [projStack, setProjStack] = useState('MERN');
  const [creating, setCreating] = useState(false);

  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projName.trim()) return;

    setCreating(true);
    try {
      const res = await api.post('/projects', {
        name: projName,
        description: projDesc,
        languages: [projLang],
        techStack: projStack.split(',').map((s) => s.trim()),
      });
      if (res.data?.success) {
        addToast('Project created successfully!', 'success');
        setNewProjectModalOpen(false);
        setProjName('');
        setProjDesc('');
        navigate(`/projects/${res.data.project._id}`);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F7FA] dark:bg-[#080F17] text-[#0F172A] dark:text-[#F1F5F9] flex transition-colors duration-200">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        mobileOpen={mobileOpen}
        closeMobile={() => setMobileOpen(false)}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Navbar
          openMobile={() => setMobileOpen(true)}
          isCollapsed={isCollapsed}
          onNewProjectClick={() => setNewProjectModalOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      <ToastContainer />

      {/* New Project Modal */}
      <Modal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. CreateCode Platform"
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of the repository and architecture..."
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] text-[#0F172A] dark:text-[#F1F5F9]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] mb-1.5">
                Primary Language
              </label>
              <select
                value={projLang}
                onChange={(e) => setProjLang(e.target.value)}
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
                Tech Stack Tags
              </label>
              <input
                type="text"
                placeholder="e.g. MERN, Docker, Redis"
                value={projStack}
                onChange={(e) => setProjStack(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-[#172636] border border-[#D8E3EA] dark:border-[#263849] focus:outline-none text-[#0F172A] dark:text-[#F1F5F9]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#D8E3EA] dark:border-[#263849]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNewProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              loading={creating}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

