import { Bell, MessageSquare, Search, Shield, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useMember } from '@/hooks/useMember';
import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  type: string;
}

interface PortalHeaderProps {
  memberName: string;
  onSectionChange?: (section: string) => void;
}

export default function PortalHeader({ memberName, onSectionChange }: PortalHeaderProps) {
  const { isAdmin } = useAdmin();
  const { member } = useMember();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!member?.userId) return;

    const q = query(
      collection(db, 'notifications', member.userId, 'items'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    });

    return () => unsubscribe();
  }, [member?.userId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = async () => {
    if (!member?.userId) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', member.userId, 'items', n.id), { read: true });
    });
    await batch.commit();
  };

  const markOneRead = async (notifId: string) => {
    if (!member?.userId) return;
    await updateDoc(doc(db, 'notifications', member.userId, 'items', notifId), { read: true });
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'rsvp': return '📅';
      case 'training': return '📚';
      case 'volunteer': return '🤝';
      case 'prayer': return '🙏';
      case 'resource': return '📄';
      default: return '🔔';
    }
  };

  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 backdrop-blur-xl border-b border-slate-700 px-6 lg:px-10 py-5 sticky top-0 z-20 shadow-lg w-full">
      <div className="flex items-center justify-between gap-6">

        {/* Left: Title and Welcome */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold font-heading text-primary-foreground mb-1">Dashboard</h1>
          <div className="flex items-center gap-3">
            <p className="text-primary-foreground/70 text-sm">Welcome back,</p>
            <span className="text-accent-red font-bold">{memberName}</span>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 bg-accent-red rounded-full" />
          </div>
        </motion.div>

        {/* Right: Icons */}
        <div className="flex items-center gap-4 lg:gap-6">

          {/* Search Bar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="hidden md:flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 hover:border-slate-500 transition-all">
            <Search className="w-4 h-4 text-primary-foreground/50" />
            <input type="text" placeholder="Search..." className="bg-transparent text-sm text-primary-foreground placeholder-primary-foreground/40 outline-none w-32" />
          </motion.div>

          {/* Admin Button */}
          {isAdmin && (
            <Link to="/admin">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-accent-red/20 hover:bg-accent-red/30 border border-accent-red/50 text-accent-red font-semibold text-sm px-4 py-2 rounded-xl transition-all"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:block">Admin</span>
              </motion.button>
            </Link>
          )}

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="relative p-2.5 hover:bg-slate-700 rounded-xl transition-all group"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-primary-foreground/70 group-hover:text-accent-red transition-colors" />
              {unreadCount > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1 right-1 w-5 h-5 bg-accent-red rounded-full text-white text-xs font-bold flex items-center justify-center"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-accent-red hover:text-accent-red/80 font-medium transition-colors">
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-5 py-8 text-center">
                        <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markOneRead(notif.id)}
                          className={`px-5 py-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 transition-all ${!notif.read ? 'bg-accent-red/5' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl flex-shrink-0">{getNotifIcon(notif.type)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-sm font-semibold truncate ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                                  {notif.title}
                                </p>
                                {!notif.read && (
                                  <div className="w-2 h-2 bg-accent-red rounded-full flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {notif.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-slate-700">
                    <button
                      onClick={() => { onSectionChange?.('notifications'); setShowNotifications(false); }}
                      className="w-full text-center text-sm text-accent-red hover:text-accent-red/80 font-medium transition-colors"
                    >
                      View all notifications →
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Messages Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSectionChange?.('forum')}
            className="p-2.5 hover:bg-slate-700 rounded-xl transition-all group"
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5 text-primary-foreground/70 group-hover:text-accent-red transition-colors" />
          </motion.button>

          {/* Profile Avatar */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ scale: 1.08 }}
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-primary via-primary to-accent-red flex items-center justify-center text-white font-bold text-base cursor-pointer shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
              aria-label="Profile"
            >
              {memberName.charAt(0).toUpperCase()}
            </motion.button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50"
                >
                  {/* User Info */}
                  <div className="px-5 py-4 border-b border-slate-700">
                    <p className="text-white font-semibold truncate">{memberName}</p>
                    <p className="text-slate-400 text-xs truncate">{member?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => { onSectionChange?.('profile'); setShowProfile(false); }}
                      className="w-full text-left px-5 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 text-sm transition-all"
                    >
                      👤 View Profile
                    </button>
                    <button
                      onClick={() => { onSectionChange?.('notifications'); setShowProfile(false); }}
                      className="w-full text-left px-5 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 text-sm transition-all flex items-center justify-between"
                    >
                      <span>🔔 Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-accent-red text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>
                      )}
                    </button>
                    <button
                      onClick={() => { onSectionChange?.('settings'); setShowProfile(false); }}
                      className="w-full text-left px-5 py-3 text-slate-300 hover:text-white hover:bg-slate-700/50 text-sm transition-all"
                    >
                      ⚙️ Settings
                    </button>
                  </div>

                  <div className="border-t border-slate-700 py-2">
                    <button
                      onClick={() => { setShowProfile(false); document.dispatchEvent(new CustomEvent('portal-signout')); }}
                      className="w-full text-left px-5 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-all"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </header>
  );
}