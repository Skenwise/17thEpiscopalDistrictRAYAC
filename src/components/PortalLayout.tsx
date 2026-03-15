import { useState } from 'react';
import { useMember } from '@/hooks/useMember';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import PortalHeader from '@/components/portal/PortalHeader';
import PortalSidebar from '@/components/portal/PortalSidebar';

type PortalSection = 'dashboard' | 'profile' | 'events' | 'directory' | 'resources' | 'training' | 'giving' | 'volunteer' | 'reports' | 'forum' | 'media' | 'notifications' | 'store' | 'settings';

interface PortalLayoutProps {
  children: React.ReactNode;
  activeSection: PortalSection;
  onSectionChange: (section: PortalSection) => void;
}

export default function PortalLayout({ children, activeSection, onSectionChange }: PortalLayoutProps) {
  const { member } = useMember();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-accent-red/10 rounded-full blur-3xl"
          animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      <div className="flex h-screen overflow-hidden relative z-10">
        {/* Single Sidebar — static on desktop, slide-in on mobile */}
        <PortalSidebar
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center gap-4 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-primary-foreground/70 hover:text-accent-red transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <PortalHeader memberName={member?.displayName || member?.email || 'Member'} />
            </div>
          </div>

          <main className="flex-1 overflow-auto w-full">
            <div className="p-6 lg:p-10 w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}