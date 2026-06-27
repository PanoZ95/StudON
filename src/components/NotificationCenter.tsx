import React, { Dispatch, SetStateAction } from 'react';
import { NotificationItem } from '../types';
import { Bell, Check, Trash, CheckSquare, Heart, MessageSquare, Calendar, GraduationCap, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  setNotifications: Dispatch<SetStateAction<NotificationItem[]>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setNotificationCount: Dispatch<SetStateAction<number>>;
}

export default function NotificationCenter({
  notifications,
  setNotifications,
  isOpen,
  setIsOpen,
  setNotificationCount
}: NotificationCenterProps) {

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, isUnread: false })));
    setNotificationCount(0);
  };

  const handleAcceptInvite = (notifId: string) => {
    setNotifications(prev => prev.map(notif => {
      if (notif.id === notifId) {
        return {
          ...notif,
          isUnread: false,
          metadata: {
            ...notif.metadata,
            status: 'accepted'
          }
        };
      }
      return notif;
    }));

    // Recalculate unread count
    setTimeout(() => {
      setNotificationCount(prev => Math.max(0, prev - 1));
    }, 100);
  };

  const handleDeclineInvite = (notifId: string) => {
    setNotifications(prev => prev.map(notif => {
      if (notif.id === notifId) {
        return {
          ...notif,
          isUnread: false,
          metadata: {
            ...notif.metadata,
            status: 'declined'
          }
        };
      }
      return notif;
    }));

    // Recalculate unread count
    setTimeout(() => {
      setNotificationCount(prev => Math.max(0, prev - 1));
    }, 100);
  };

  const handleDeleteNotif = (notifId: string) => {
    const target = notifications.find(n => n.id === notifId);
    if (target?.isUnread) {
      setNotificationCount(prev => Math.max(0, prev - 1));
    }
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500 fill-current" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-primary-container" />;
      case 'meet':
        return <Calendar className="w-4 h-4 text-secondary-container" />;
      case 'course':
        return <GraduationCap className="w-4 h-4 text-[#FFD700]" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-xs">
          {/* Backdrop click closer */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsOpen(false)} />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative z-10 w-full max-w-md h-full bg-[#12141C] border-l border-outline-variant/30 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
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

            {/* Quick Actions */}
            <div className="p-3 bg-surface-container-low border-b border-outline-variant/10 flex justify-between items-center text-xs">
              <span className="text-on-surface-variant font-medium">
                {notifications.filter(n => n.isUnread).length} μη αναγνωσμένες
              </span>
              <button
                onClick={handleMarkAllAsRead}
                disabled={!notifications.some(n => n.isUnread)}
                className="text-primary-container hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                Σήμανση όλων ως αναγνωσμένα
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notifications.length > 0 ? (
                notifications.map((notif) => {
                  const status = notif.metadata?.status;
                  return (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-xl relative overflow-hidden transition-all duration-300 border flex gap-3 items-start group ${
                        notif.isUnread
                          ? 'bg-surface-container border-primary-container/20 shadow-[0_2px_12px_rgba(0,240,255,0.03)]'
                          : 'bg-surface-container-high/40 border-outline-variant/10 opacity-75'
                      }`}
                    >
                      {/* Unread strip indicator */}
                      {notif.isUnread && (
                        <div className="absolute left-0 top-0 w-1 h-full bg-primary-container" />
                      )}

                      {/* Icon category */}
                      <div className="p-2 bg-surface-container-lowest rounded-lg shrink-0 flex items-center justify-center border border-outline-variant/10">
                        {getIcon(notif.type)}
                      </div>

                      {/* Info & metadata */}
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-xs text-primary-fixed-dim truncate">
                            {notif.title}
                          </h4>
                          <span className="text-[9px] text-on-surface-variant font-mono shrink-0 ml-2">
                            {notif.timeAgo}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface leading-normal">
                          {notif.message}
                        </p>

                        {/* Invitation Accept/Decline actions */}
                        {notif.metadata?.showAcceptDecline && (
                          <div className="pt-2 border-t border-outline-variant/10 flex gap-2">
                            {status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAcceptInvite(notif.id)}
                                  className="flex-1 py-1.5 bg-primary-container text-on-primary-container font-semibold text-[10px] rounded hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all cursor-pointer text-center"
                                >
                                  Αποδοχη
                                </button>
                                <button
                                  onClick={() => handleDeclineInvite(notif.id)}
                                  className="flex-1 py-1.5 border border-outline-variant/30 hover:bg-white/5 text-on-surface-variant font-semibold text-[10px] rounded transition-all cursor-pointer text-center"
                                >
                                  Απορριψη
                                </button>
                              </>
                            )}
                            {status === 'accepted' && (
                              <div className="text-xs text-green-400 font-semibold flex items-center gap-1 font-mono">
                                <Check className="w-3.5 h-3.5" /> Αποδεχτήκατε την πρόσκληση!
                              </div>
                            )}
                            {status === 'declined' && (
                              <div className="text-xs text-on-surface-variant italic font-semibold">
                                Απορρίφθηκε
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Delete notification trigger */}
                      <button
                        onClick={() => handleDeleteNotif(notif.id)}
                        className="p-1 rounded text-on-surface-variant hover:text-red-400 hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-16 text-on-surface-variant">
                  <Bell className="w-12 h-12 text-outline/30 mx-auto mb-3" />
                  <p className="text-sm">Δεν έχετε νέες ειδοποιήσεις.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
