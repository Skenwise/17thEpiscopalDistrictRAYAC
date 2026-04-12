import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, getDocs, addDoc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMember } from '@/hooks/useMember';

interface Thread {
  id: string;
  title: string;
  author: string;
  replies: number;
  likes: number;
  lastActive: string;
  category: string;
}

const CATEGORIES = ['Leadership', 'Events', 'Community', 'Prayer', 'Training', 'General'];

export default function CommunityForumContent() {
  const { member } = useMember();
  const [searchTerm, setSearchTerm] = useState('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'General' });
  const [error, setError] = useState('');

  const fetchThreads = async () => {
    try {
      const q = query(collection(db, 'forum_threads'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const firestoreThreads = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastActive: doc.data().createdAt?.toDate?.()?.toLocaleDateString() || 'Just now',
      } as Thread));

      if (firestoreThreads.length === 0) {
        setThreads([
          { id: '1', title: 'Tips for Effective Youth Leadership', author: 'John Doe', replies: 12, likes: 45, lastActive: '2 hours ago', category: 'Leadership' },
          { id: '2', title: "Upcoming Youth Conference - Who's Attending?", author: 'Sarah Johnson', replies: 8, likes: 23, lastActive: '4 hours ago', category: 'Events' },
          { id: '3', title: 'Best Practices for Community Outreach', author: 'Michael Smith', replies: 15, likes: 52, lastActive: '1 day ago', category: 'Community' },
          { id: '4', title: 'Prayer Requests and Encouragement', author: 'Emily Brown', replies: 6, likes: 34, lastActive: '3 hours ago', category: 'Prayer' },
        ]);
      } else {
        setThreads(firestoreThreads);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchThreads(); }, []);

  const handleNewThread = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!member) return;
    setIsSubmitting(true);
    setError('');
    try {
      await addDoc(collection(db, 'forum_threads'), {
        title: form.title,
        category: form.category,
        author: member.displayName,
        userId: member.userId,
        replies: 0,
        likes: 0,
        createdAt: serverTimestamp(),
      });
      setForm({ title: '', category: 'General' });
      setShowModal(false);
      fetchThreads();
    } catch {
      setError('Failed to post. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = threads.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Community Forum</h2>
          <p className="text-accent-silver/70">Connect, discuss, and share with fellow members</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg px-6 py-2">New Thread</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-silver/50" />
        <Input type="text" placeholder="Search discussions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-slate-800 border-primary/30 text-accent-silver rounded-lg" />
      </div>

      <div className="space-y-4">
        {isLoading ? <p className="text-accent-silver/70">Loading...</p> : filtered.map((thread, idx) => (
          <motion.div key={thread.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -4 }} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1"><h3 className="text-lg font-semibold text-accent-red mb-2">{thread.title}</h3><p className="text-accent-silver/70 text-sm">Started by <span className="text-accent-red font-semibold">{thread.author}</span></p></div>
              <div className="bg-primary/20 px-3 py-1 rounded text-accent-red text-xs font-semibold whitespace-nowrap">{thread.category}</div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-primary/20">
              <div className="flex gap-6 text-sm text-accent-silver/70"><div className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-accent-red" /><span>{thread.replies} replies</span></div><div className="flex items-center gap-2"><Heart className="w-4 h-4 text-accent-red" /><span>{thread.likes} likes</span></div></div>
              <p className="text-accent-silver/60 text-xs">{thread.lastActive}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-accent-red/30 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6"><h3 className="text-2xl font-bold text-accent-red">New Thread</h3><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button></div>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <div className="space-y-4">
              <div><label className="block text-slate-400 text-sm mb-2">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What's on your mind?" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red" /></div>
              <div><label className="block text-slate-400 text-sm mb-2">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-accent-red">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="flex gap-3 pt-2"><button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white">Cancel</button><button onClick={handleNewThread} disabled={isSubmitting || !form.title.trim()} className="flex-1 py-3 rounded-xl bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold">{isSubmitting ? 'Posting...' : 'Post Thread'}</button></div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
