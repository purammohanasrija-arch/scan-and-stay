import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Mail, MessageSquare, CheckCheck, Sparkles, Clock } from 'lucide-react';
import { NotificationItem } from '../../types';
import { api } from '../../services/api';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshCount: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onRefreshCount,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'whatsapp' | 'email'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
      onRefreshCount();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      onRefreshCount();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === 'whatsapp') return n.channel === 'whatsapp';
    if (activeTab === 'email') return n.channel === 'email';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Alerts & Dispatch Hub</h3>
              <p className="text-[11px] text-slate-400">Email & WhatsApp Notifications</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleMarkAllRead}
              className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 text-xs flex items-center gap-1 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="text-[11px]">Read All</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-slate-800 px-4 pt-2 gap-2 bg-slate-950/40">
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'whatsapp', label: '💬 WhatsApp' },
            { id: 'email', label: '✉️ Email' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-teal-400 text-teal-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading alerts...</div>
          ) : filteredNotifs.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No notifications found in this inbox.</p>
            </div>
          ) : (
            filteredNotifs.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  item.channel === 'whatsapp'
                    ? 'bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                } ${!item.is_read ? 'ring-1 ring-teal-500/30' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {item.channel === 'whatsapp' ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        WhatsApp Dispatch
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email Service
                      </span>
                    )}
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">{item.message}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};
