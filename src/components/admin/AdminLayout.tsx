import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import {
  LayoutDashboard, Users, Calendar, BookOpen, Handshake, Download,
  Heart, Shield, LogOut, Menu, ShoppingBag, GraduationCap, MessageCircle,
  BarChart3, Image as ImageIcon,
} from 'lucide-react';
import { useState } from 'react';

type AdminSection = 'dashboard' | 'members' | 'rsvps' | 'enrollments' | 'volunteers' | 'resources' | 'events' | 'prayers' | 'admins' | 'trainings' | 'volunteer' | 'store' | 'forum' | 'reports' | 'gallery';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const menuItems = [
  { id: 'dashboard' as AdminSection, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'members' as AdminSection, label: 'Members', icon: <Users className="w-5 h-5" /> },
  { id: 'events' as AdminSection, label: 'Events Manager', icon: <Calendar className="w-5 h-5" /> },
  { id: 'trainings' as AdminSection, label: 'Trainings', icon: <GraduationCap className="w-5 h-5" /> },
  { id: 'volunteer' as AdminSection, label: 'Volunteer', icon: <Handshake className="w-5 h-5" /> },
  { id: 'store' as AdminSection, label: 'Store', icon: <ShoppingBag className="w-5 h-5" /> },
  { id: 'forum' as AdminSection, label: 'Forum', icon: <MessageCircle className="w-5 h-5" /> },
  { id: 'gallery' as AdminSection, label: 'Media Gallery', icon: <ImageIcon className="w-5 h-5" /> },
  { id: 'rsvps' as AdminSection, label: 'RSVPs', icon: <Calendar className="w-5 h-5" /> },
  { id: 'enrollments' as AdminSection, label: 'Training Enrollments', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'volunteers' as AdminSection, label: 'Volunteer Applications', icon: <Handshake className="w-5 h-5" /> },
  { id: 'resources' as AdminSection, label: 'Resources', icon: <Download className="w-5 h-5" /> },
  { id: 'prayers' as AdminSection, label: 'Prayer Requests', icon: <Heart className="w-5 h-5" /> },
  { id: 'reports' as AdminSection, label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'admins' as AdminSection, label: 'Manage Admins', icon: <Shield className="w-5 h-5" /> },
];

export default function AdminLayout({ children, activeSection, onSectionChange }: AdminLayoutProps) {
  const navigate = useNavigate();
  const { adminEmail } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/sign-in');
  };

  const SidebarContent = () => (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div><h1 className="text-2xl font-bold font-heading text-white mb-1">Admin Panel</h1><p className="text-xs text-slate-400 truncate">{adminEmail}</p></div>
      <div className="h-px bg-slate-700" />
      <nav className="space-y-1 flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => { onSectionChange(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${activeSection === item.id ? 'bg-accent-red/20 text-white border border-accent-red/50' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
            <span className={activeSection === item.id ? 'text-accent-red' : ''}>{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="h-px bg-slate-700" />
      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-accent-red hover:bg-accent-red/10 transition-all"><LogOut className="w-5 h-5" /><span className="text-sm font-medium">Log Out</span></button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-slate-800 border-r border-slate-700"><SidebarContent /></aside>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {sidebarOpen && <aside className="fixed w-64 h-screen bg-slate-800 border-r border-slate-700 z-40 lg:hidden"><SidebarContent /></aside>}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white"><Menu className="w-6 h-6" /></button>
          <h2 className="text-lg font-semibold text-white capitalize">{menuItems.find(m => m.id === activeSection)?.label}</h2>
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}