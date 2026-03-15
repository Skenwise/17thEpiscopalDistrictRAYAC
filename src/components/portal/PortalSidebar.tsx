import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import {
  User, Calendar, Users, BookOpen, Zap, Heart, Handshake,
  BarChart3, MessageCircle, Image as ImageIcon, Bell, ShoppingBag,
  Settings, LogOut, Home,
} from 'lucide-react';
import { motion } from 'framer-motion';

type PortalSection = 'dashboard' | 'profile' | 'events' | 'directory' | 'resources' | 'training' | 'giving' | 'volunteer' | 'reports' | 'forum' | 'media' | 'notifications' | 'store' | 'settings';

interface PortalSidebarProps {
  activeSection: PortalSection;
  onSectionChange: (section: PortalSection) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: Array<{ id: PortalSection; label: string; icon: React.ReactNode }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  { id: 'events', label: 'Events', icon: <Calendar className="w-5 h-5" /> },
  { id: 'directory', label: 'Members Directory', icon: <Users className="w-5 h-5" /> },
  { id: 'resources', label: 'Resources', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'training', label: 'Training', icon: <Zap className="w-5 h-5" /> },
  { id: 'giving', label: 'Giving', icon: <Heart className="w-5 h-5" /> },
  { id: 'volunteer', label: 'Volunteer', icon: <Handshake className="w-5 h-5" /> },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'forum', label: 'Community Forum', icon: <MessageCircle className="w-5 h-5" /> },
  { id: 'media', label: 'Media', icon: <ImageIcon className="w-5 h-5" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { id: 'store', label: 'Store / Shop', icon: <ShoppingBag className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

const SidebarContent = ({ activeSection, onSectionChange, onClose, handleLogout }: {
  activeSection: PortalSection;
  onSectionChange: (section: PortalSection) => void;
  onClose: () => void;
  handleLogout: () => void;
}) => (
  <div className="p-6 space-y-6">
    <div className="mb-2">
      <h1 className="text-3xl font-bold font-heading text-primary-foreground mb-2">RAYAC</h1>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-accent-red rounded-full animate-pulse" />
        <p className="text-xs text-primary-foreground/60 uppercase tracking-widest">Members Portal</p>
      </div>
    </div>

    <div className="h-px bg-gradient-to-r from-primary-foreground/20 via-primary-foreground/40 to-primary-foreground/20" />

    <nav className="space-y-1">
      {menuItems.map((item, idx) => (
        <motion.button
          key={item.id}
          onClick={() => { onSectionChange(item.id); onClose(); }}
          whileHover={{ x: 6 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
            activeSection === item.id
              ? 'bg-gradient-to-r from-accent-red/30 to-accent-red/10 text-primary-foreground border border-accent-red/50 shadow-lg shadow-accent-red/20'
              : 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10'
          }`}
        >
          {activeSection === item.id && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute inset-0 bg-gradient-to-r from-accent-red/20 to-transparent rounded-xl"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <span className={`relative z-10 transition-all ${activeSection === item.id ? 'text-accent-red scale-110' : 'text-primary-foreground/50 group-hover:text-primary-foreground'}`}>
            {item.icon}
          </span>
          <span className="text-sm font-medium relative z-10">{item.label}</span>
        </motion.button>
      ))}
    </nav>

    <div className="h-px bg-gradient-to-r from-primary-foreground/20 via-primary-foreground/40 to-primary-foreground/20" />

    <motion.button
      onClick={handleLogout}
      whileHover={{ x: 6 }}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-primary-foreground/70 hover:text-accent-red hover:bg-accent-red/10 transition-all duration-300 group"
    >
      <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
      <span className="text-sm font-medium">Log Out</span>
    </motion.button>
  </div>
);

export default function PortalSidebar({ activeSection, onSectionChange, isOpen, onClose }: PortalSidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/sign-in');
  };

  return (
    <>
      {/* Desktop sidebar — always visible, static */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 overflow-y-auto">
        <SidebarContent
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onClose={() => {}}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 lg:hidden z-30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Mobile sidebar — slide in/out */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="lg:hidden fixed w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 overflow-y-auto z-40 shadow-2xl"
      >
        <SidebarContent
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          onClose={onClose}
          handleLogout={handleLogout}
        />
      </motion.aside>
    </>
  );
}