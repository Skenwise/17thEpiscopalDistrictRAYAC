import { Bell, MessageSquare, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface PortalHeaderProps {
  memberName: string;
}

export default function PortalHeader({ memberName }: PortalHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 backdrop-blur-xl border-b border-slate-700 px-6 lg:px-10 py-5 sticky top-0 z-20 shadow-lg w-full">
      <div className="flex items-center justify-between gap-6">
        {/* Left: Title and Welcome */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1"
        >
          <h1 className="text-3xl lg:text-4xl font-bold font-heading text-primary-foreground mb-1">Dashboard</h1>
          <div className="flex items-center gap-3">
            <p className="text-primary-foreground/70 text-sm">Welcome back,</p>
            <span className="text-accent-red font-bold">{memberName}</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-accent-red rounded-full"
            />
          </div>
        </motion.div>

        {/* Right: Search, Icons and Profile */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Search Bar - Hidden on mobile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:flex items-center gap-2 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-2 hover:border-slate-500 transition-all"
          >
            <Search className="w-4 h-4 text-primary-foreground/50" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-primary-foreground placeholder-primary-foreground/40 outline-none w-32"
            />
          </motion.div>

          {/* Notification Bell */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2.5 hover:bg-slate-700 rounded-xl transition-all group"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-primary-foreground/70 group-hover:text-accent-red transition-colors" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-accent-red rounded-full shadow-lg shadow-accent-red/50"
            />
          </motion.button>

          {/* Messages Icon */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 hover:bg-slate-700 rounded-xl transition-all group"
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5 text-primary-foreground/70 group-hover:text-accent-red transition-colors" />
          </motion.button>

          {/* Profile Photo Circle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-primary via-primary to-accent-red flex items-center justify-center text-white font-bold text-base cursor-pointer shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
            aria-label="Profile"
          >
            {memberName.charAt(0).toUpperCase()}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
