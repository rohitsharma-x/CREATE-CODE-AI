import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  Bell,
  Menu,
  User as UserIcon,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../common/Button';

export const Navbar = ({ openMobile, isCollapsed, onNewProjectClick }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markAllAsRead } = useNotifications();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute page title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/projects/')) return 'Project Details';
    if (path === '/projects') return 'Projects';
    if (path.startsWith('/reviews/')) return 'Code Review';
    if (path === '/reviews') return 'AI Code Reviews';
    if (path === '/chat') return 'AI Coding Chat';
    if (path === '/playground') return 'Code Playground';
    if (path === '/github') return 'GitHub Integration';
    if (path === '/issues') return 'Issues & Security';
    if (path === '/analytics') return 'Analytics';
    if (path === '/notifications') return 'Notifications';
    if (path === '/settings') return 'Settings';
    return 'Dashboard';
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="h-16 bg-white/80 dark:bg-[#0D1722]/80 backdrop-blur-md border-b border-[#D8E3EA] dark:border-[#263849] sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Left: Mobile trigger & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={openMobile}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#172636]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9] tracking-tight hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center: Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="max-w-md w-full mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, reviews, findings..."
            className="w-full pl-10 pr-4 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] text-[#0F172A] dark:text-[#F1F5F9] placeholder-slate-400 focus:outline-none focus:border-[#089E9A] dark:focus:border-[#12D6C5] focus:ring-1 focus:ring-[#12D6C5]/30 transition-all"
          />
        </div>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Quick New Project Button */}
        {onNewProjectClick && (
          <Button
            size="sm"
            onClick={onNewProjectClick}
            icon={Plus}
            className="hidden sm:inline-flex"
          >
            New Project
          </Button>
        )}

        {/* Theme Toggle (Dark/Light) */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-[#172636] transition-colors border border-transparent hover:border-[#D8E3EA] dark:hover:border-[#263849]"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-[#12D6C5] transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-[#089E9A] transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Notifications Icon & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-[#F1F5F9] hover:bg-slate-100 dark:hover:bg-[#172636] transition-colors relative border border-transparent hover:border-[#D8E3EA] dark:hover:border-[#263849]"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] rounded-2xl shadow-xl py-3 z-50 animate-fade-in">
              <div className="flex items-center justify-between px-4 pb-2 border-b border-[#D8E3EA] dark:border-[#263849]">
                <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-[#089E9A] dark:text-[#12D6C5] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-[#D8E3EA] dark:divide-[#263849]/50">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No new notifications.</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        setNotifDropdownOpen(false);
                        if (n.link) navigate(n.link);
                      }}
                      className="p-3 hover:bg-slate-50 dark:hover:bg-[#172636] cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9]">{n.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] line-clamp-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="pt-2 px-3 border-t border-[#D8E3EA] dark:border-[#263849] text-center">
                <button
                  onClick={() => {
                    setNotifDropdownOpen(false);
                    navigate('/notifications');
                  }}
                  className="text-xs text-[#089E9A] dark:text-[#12D6C5] font-medium hover:underline"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#172636] transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name || 'Avatar'}
              className="w-7 h-7 rounded-full object-cover border border-[#12D6C5]/40"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111E2B] border border-[#D8E3EA] dark:border-[#263849] rounded-xl shadow-xl py-2 z-50 animate-fade-in text-xs font-medium">
              <div className="px-4 py-2 border-b border-[#D8E3EA] dark:border-[#263849] mb-1">
                <p className="font-bold text-[#0F172A] dark:text-[#F1F5F9] truncate">{user?.name || 'Rohit Sharma'}</p>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] truncate">{user?.email || 'rohit.sharma@example.com'}</p>
              </div>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#172636] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                Profile
              </button>

              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-600 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#172636] hover:text-[#0F172A] dark:hover:text-[#F1F5F9] transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>

              <div className="my-1 border-t border-[#D8E3EA] dark:border-[#263849]" />

              <button
                onClick={async () => {
                  setProfileDropdownOpen(false);
                  await logout();
                  navigate('/auth');
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

