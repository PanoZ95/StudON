import React, { useState, useEffect } from 'react';
import { Bell, Trash, CheckSquare, Heart, MessageSquare, Calendar, Info, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
  AppNotification,
} from '../lib/notifications';

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onUnreadCountChange: (count: number) => void;
}

export default function NotificationCenter({ userId, isOpen, setIsOpen, onUnreadCountChange }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();

    const unsubscribe = subscribeToNotifications(userId, () => {
      load();
    });

    return unsubscribe;
  }, [userId]);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchNotifications(userId);
      setNotifications(data);
      onUnreadCountChange(data.filter((n) => n.isUnread).length);
    } catch {
      // Σε περίπτωση αποτυχίας, αφήνουμε ό,τι ήδη υπάρχει στο state
    } finally {
      setLoading(false);
    }
  }

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    onUnreadCountChange(0);
    try {
      await markAllAsRead(userId);
    } catch {
      load();
    }
  };

  const handleNotifClick = async (notif: AppNotification) => {
    if (!notif.isUnread) return;
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isUnread: false } : n)));
    onUnreadCountChange(notifications.filter((n) => n.isUnread && n.id !== notif.id).length);
    try {
      await markAsRead(notif.id);
    } catch {
      load();
    }
  };

  const handleDelete = async (notifId: string) => {
    const target = notifications.find((n) => n.id === notifId);
    setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    if (target?.isUnread) {
      onUnreadCountChange(notifications.filter((n) => n.isUnread && n.id !== notifId).length);
    }
    try {
      await deleteNotification(notifId);
    } catch {
      load();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-current" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-primary-container" />;
      case 'meet':
        return <Calendar className="w-4 h-4 text-secondary-container" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-xs">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)} />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative z-10 w-full max-w-md h-full bg-[#12141C] border-l border-outline-variant/30 flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="p-5 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary-container" />
                <h3 className="font-display font-bold text-lg text-primary-fixed-dim">Κέντρο Ειδοποιήσεων</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-surface-container-low border-b border-outline-variant/10 flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">
                {notifications.filter((n) => n.isUnread).length} μη αναγνωσμένες
              </span>
              <button
                onClick={handleMarkAllAsRead}
                disabled={!notifications.some((n) => n.isUnread)}
                className="text-primary-container hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Σήμανση όλων ως αναγνωσμένα
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-5 h-5 text-primary-container animate-spin" />
                </div>
              )}

              {!loading && notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    className={`p-4 rounded-xl relative overflow-hidden transition-all duration-300 border flex gap-3 items-start group cursor-pointer ${
                      notif.isUnread
                        ? 'bg-surface-container border-primary-container/20 shadow-[0_2px_12px_rgba(0,240,255,0.03)]'
                        : 'bg-surface-container-high/40 border-outline-variant/10 opacity-75'
                    }`}
                  >
                    {notif.isUnread && <div className="absolute left-0 top-0 w-1 h-full bg-primary-container" />}

                    <div className="p-2 bg-surface-container-lowest rounded-lg shrink-0 flex items-center justify-center border border-outline-variant/10">
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-xs text-primary-fixed-dim truncate">{notif.title}</h4>
                        <span className="text-[9px] text-on-surface-variant font-mono shrink-0 ml-2">{notif.timeAgo}</span>
                      </div>
                      <p className="text-xs text-on-surface leading-normal">{notif.message}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notif.id);
                      }}
                      className="p-1 rounded text-on-surface-variant hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                !loading && (
                  <div className="text-center py-16 text-on-surface-variant">
                    <Bell className="w-12 h-12 text-outline/30 mx-auto mb-3" />
                    <p className="text-sm">Δεν έχετε νέες ειδοποιήσεις.</p>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
