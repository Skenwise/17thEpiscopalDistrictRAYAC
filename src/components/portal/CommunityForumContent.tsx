import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CommunityForumContent() {
  const [searchTerm, setSearchTerm] = useState('');

  const threads = [
    { id: 1, title: 'Tips for Effective Youth Leadership', author: 'John Doe', replies: 12, likes: 45, lastActive: '2 hours ago', category: 'Leadership' },
    { id: 2, title: "Upcoming Youth Conference - Who's Attending?", author: 'Sarah Johnson', replies: 8, likes: 23, lastActive: '4 hours ago', category: 'Events' },
    { id: 3, title: 'Best Practices for Community Outreach', author: 'Michael Smith', replies: 15, likes: 52, lastActive: '1 day ago', category: 'Community' },
    { id: 4, title: 'Prayer Requests and Encouragement', author: 'Emily Brown', replies: 6, likes: 34, lastActive: '3 hours ago', category: 'Prayer' },
  ];

  const filtered = threads.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Community Forum</h2>
          <p className="text-accent-silver/70">Connect, discuss, and share with fellow members</p>
        </div>
        <Button className="bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg px-6 py-2 transition-all">
          New Thread
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-silver/50" />
        <Input
          type="text"
          placeholder="Search discussions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800 border-primary/30 text-accent-silver placeholder:text-accent-silver/50 rounded-lg"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((thread, idx) => (
          <motion.div
            key={thread.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-accent-red mb-2">{thread.title}</h3>
                <p className="text-accent-silver/70 text-sm">
                  Started by <span className="text-accent-red font-semibold">{thread.author}</span>
                </p>
              </div>
              <div className="bg-primary/20 px-3 py-1 rounded text-accent-red text-xs font-semibold whitespace-nowrap">
                {thread.category}
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-primary/20">
              <div className="flex gap-6 text-sm text-accent-silver/70">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-accent-red" />
                  <span>{thread.replies} replies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-accent-red" />
                  <span>{thread.likes} likes</span>
                </div>
              </div>
              <p className="text-accent-silver/60 text-xs">{thread.lastActive}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}