import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, AlertCircle, Info, Trash2, Calendar, Heart, BookOpen, Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMember } from '@/hooks/useMember';

interface Notification {
  id: string;
  type: 'event' | 'training' | 'announcement' | 'order' | 'rsvp' | 'prayer' | 'volunteer';
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
}

const getNotificationIcon = (type: string, read: boolean) => {
  const iconClass = read ? 'text-accent-silver/60' : 'text-accent-red';
  switch (type) {
    case 'event':
      return <Calendar className={`w-5 h-5 ${iconClass}`} />;
    case 'training':
      return <BookOpen className={`w-5 h-5 ${iconClass}`} />;
    case 'volunteer':
      return <Users className={`w-5 h-5 ${iconClass}`} />;
    case 'prayer':
      return <Heart className={`w-5 h-5 ${iconClass}`} />;
    case 'order':
      return <CheckCircle className={`w-5 h-5 ${iconClass}`} />;
    case 'announcement':
      return <Info className={`w-5 h-5 ${iconClass}`} />;
    default:
      return <Bell className={`w-5 h-5 ${iconClass}`} />;
  }
};

export default function NotificationsContent() {
  const { member } = useMember();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!member) {
      setIsLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'notifications', member.userId, 'items'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const notifs = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [member]);

  const markAsRead = async (notificationId: string) => {
    if (!member) return;
    try {
      await updateDoc(doc(db, 'notifications', member.userId, 'items', notificationId), {
        read: true
      });
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!member) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        if (!notification.read) {
          const ref = doc(db, 'notifications', member.userId, 'items', notification.id);
          batch.update(ref, { read: true });
        }
      });
      await batch.commit();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!member) return;
    try {
      await deleteDoc(doc(db, 'notifications', member.userId, 'items', notificationId));
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Please sign in to view your notifications.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Notifications</h2>
          <p className="text-accent-silver/70">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {notifications.length > 0 && unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="border-primary/50 text-accent-red hover:bg-primary/10 rounded-lg px-4 py-2"
          >
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl">
          <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No notifications yet.</p>
          <p className="text-slate-500 text-sm mt-1">When you receive notifications, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, idx) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-xl p-4 border transition-all cursor-pointer ${
                notification.read
                  ? 'bg-slate-800/50 border-slate-700'
                  : 'bg-gradient-to-br from-primary/20 to-accent-red/10 border-primary/40'
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                  notification.read
                    ? 'bg-slate-700/50'
                    : 'bg-primary/30'
                }`}>
                  {getNotificationIcon(notification.type, notification.read)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold mb-1 ${notification.read ? 'text-slate-400' : 'text-accent-red'}`}>
                    {notification.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-2">{notification.message}</p>
                  <p className="text-slate-500 text-xs">{formatDate(notification.createdAt)}</p>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex gap-2">
                  {!notification.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                      className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                    >
                      <CheckCircle className="w-5 h-5 text-accent-red" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-slate-500 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}