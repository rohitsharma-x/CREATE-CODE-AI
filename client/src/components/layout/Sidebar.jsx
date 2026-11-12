import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileCode2,
  MessageSquareCode,
  Terminal,
  GitBranch,
  ShieldAlert,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const Sidebar = ({ isCollapsed, toggleCollapse, mobileOpen, closeMobile }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'AI Code Reviews', path: '/reviews', icon: FileCode2 },
    { name: 'AI Coding Chat', path: '/chat', icon: MessageSquareCode },
    { name: 'Code Playground', path: '/playground', icon: Terminal },
    { name: 'GitHub', path: '/github', icon: GitBranch },
    { name: 'Issues & Security', path: '/issues', icon: ShieldAlert },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-white dark:bg-[#0D1722] border-r border-[#D8E3EA] dark:border-[#263849] transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#D8E3EA] dark:border-[#263849]">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#12D6C5]/10 border border-[#12D6C5]/30 flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5] shrink-0 font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-base tracking-tight text-[#0F172A] dark:text-[#F1F5F9] whitespace-nowrap">
                CreateCode <span className="text-[#089E9A] dark:text-[#12D6C5]">AI</span>
              </span>
            )}
          </NavLink>

          <button
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#172636] transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeMobile}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-[#089E9A]/10 dark:bg-[#12D6C5]/10 text-[#089E9A] dark:text-[#12D6C5] font-semibold'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-[#172636]/60'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
            >
              <item.icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}

              {/* Notification Badge */}
              {item.badge > 0 && (
                <span
                  className={`flex items-center justify-center rounded-full bg-rose-500 text-white font-bold text-[10px] shrink-0 ${
                    isCollapsed ? 'absolute top-1.5 right-2 w-4 h-4' : 'ml-auto px-1.5 py-0.5 min-w-5 h-5'
                  }`}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-[#D8E3EA] dark:border-[#263849]">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849]/60 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name || 'User avatar'}
              className="w-9 h-9 rounded-full object-cover border border-[#12D6C5]/40 shrink-0"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] truncate">
                  {user?.name || 'Rohit Sharma'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate">
                  @{user?.username || 'rohit-dev'}
                </p>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

