import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldAlert,
  GitPullRequest,
  Terminal,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useNotifications } from '../context/NotificationContext';

export const NotificationsPage = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
            Notifications
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            System notifications, code review completions, and security alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button size="sm" variant="outline" onClick={markAllAsRead} icon={CheckCircle2}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No notifications at this time.
          </div>
        ) : (
          notifications.map((n) => (
            <Card
              key={n._id}
              className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                !n.read ? 'border-[#089E9A] dark:border-[#12D6C5]/50 bg-[#12D6C5]/5' : ''
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#172636] flex items-center justify-center text-[#089E9A] dark:text-[#12D6C5] shrink-0 font-bold">
                  {n.type === 'pr_review_completed' ? (
                    <GitPullRequest className="w-5 h-5 text-sky-400" />
                  ) : n.type === 'security_issue_detected' ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400" />
                  ) : (
                    <Bell className="w-5 h-5 text-[#12D6C5]" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      {n.title}
                    </h4>
                    {!n.read && <Badge variant="teal" size="sm">New</Badge>}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8] mt-0.5">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {n.link && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      markAsRead(n._id);
                      navigate(n.link);
                    }}
                    icon={ExternalLink}
                  >
                    View
                  </Button>
                )}
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="p-2 text-slate-400 hover:text-emerald-400"
                    title="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

