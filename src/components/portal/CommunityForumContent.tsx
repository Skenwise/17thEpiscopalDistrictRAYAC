import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Heart, Search, X, Reply, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { collection, getDocs, addDoc, orderBy, query, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
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
  createdAt?: any;
  content?: string;
}

interface Reply {
  id: string;
  threadId: string;
  author: string;
  userId: string;
  content: string;
  createdAt: any;
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
  
  // Reply modal state
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState<Reply[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchThreads = async () => {
    try {
      const q = query(collection(db, 'forum_threads'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const firestoreThreads = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastActive: doc.data().createdAt?.toDate?.()?.toLocaleDateString() || 'Just now',
      } as Thread));
      setThreads(firestoreThreads);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReplies = async (threadId: string) => {
    try {
      const q = query(
        collection(db, 'forum_threads', threadId, 'replies'),
        orderBy('createdAt', 'asc')
      );
      const snap = await getDocs(q);
      const repliesData = snap.docs.map(doc => ({
        id: doc.id,
        threadId,
        ...doc.data(),
      } as Reply));
      setReplies(repliesData);
    } catch (error) {
      console.error('Failed to fetch replies:', error);
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

  const handleReply = async () => {
    if (!replyContent.trim()) {
      setError('Reply content is required.');
      return;
    }
    if (!member || !selectedThread) return;
    
    setIsSubmittingReply(true);
    setError('');
    try {
      // Add reply to subcollection
      await addDoc(collection(db, 'forum_threads', selectedThread.id, 'replies'), {
        author: member.displayName,
        userId: member.userId,
        content: replyContent,
        createdAt: serverTimestamp(),
      });
      
      // Increment reply count on thread
      const threadRef = doc(db, 'forum_threads', selectedThread.id);
      await updateDoc(threadRef, {
        replies: increment(1),
        lastActive: new Date().toISOString(),
      });
      
      setReplyContent('');
      fetchReplies(selectedThread.id);
      fetchThreads(); // Refresh to update reply count
    } catch (error) {
      console.error('Failed to post reply:', error);
      setError('Failed to post reply. Try again.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const openThread = async (thread: Thread) => {
    setSelectedThread(thread);
    setShowReplies(true);
    await fetchReplies(thread.id);
  };

  const closeThread = () => {
    setSelectedThread(null);
    setShowReplies(false);
    setReplyContent('');
    setReplies([]);
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

  const filtered = threads.filter(t =>
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Community Forum</h2>
          <p className="text-accent-silver/70">Connect, discuss, and share with fellow members</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg px-6 py-2">New Thread</Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-silver/50" />
        <Input type="text" placeholder="Search discussions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-slate-800 border-primary/30 text-accent-silver rounded-lg" />
      </div>

      {/* Threads List */}
      {threads.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl">
          <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No forum threads yet.</p>
          <p className="text-slate-500 text-sm mt-2">Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((thread, idx) => (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              onClick={() => openThread(thread)}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-accent-red mb-2">{thread.title}</h3>
                  <p className="text-accent-silver/70 text-sm">Started by <span className="text-accent-red font-semibold">{thread.author}</span></p>
                </div>
                <div className="bg-primary/20 px-3 py-1 rounded text-accent-red text-xs font-semibold whitespace-nowrap">{thread.category}</div>
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
      )}

      {/* Thread Detail Modal with Replies */}
      {showReplies && selectedThread && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-accent-red/30 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-accent-red">{selectedThread.title}</h3>
                <p className="text-slate-400 text-sm mt-1">Started by {selectedThread.author}</p>
              </div>
              <button onClick={closeThread} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Replies List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {replies.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No replies yet.</p>
                  <p className="text-slate-500 text-sm">Be the first to reply!</p>
                </div>
              ) : (
                replies.map((reply) => (
                  <div key={reply.id} className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-accent-red font-semibold text-sm">{reply.author}</span>
                      <span className="text-slate-500 text-xs">{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-slate-300 text-sm">{reply.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Reply Form */}
            <div className="border-t border-slate-700 p-6">
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <div className="flex gap-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  rows={2}
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red resize-none"
                />
                <button
                  onClick={handleReply}
                  disabled={isSubmittingReply || !replyContent.trim()}
                  className="px-6 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                  {isSubmittingReply ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-5 h-5" />}
                  Reply
                </button>
              </div>
              {!member && (
                <p className="text-slate-400 text-sm mt-3 text-center">
                  Please <a href="/sign-in" className="text-accent-red hover:underline">sign in</a> to reply.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* New Thread Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-accent-red/30 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-accent-red">New Thread</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What's on your mind?" className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red" />
              </div>
              <div>
                <label className="block text-slate-400 text-sm mb-2">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-accent-red">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white">Cancel</button>
                <button onClick={handleNewThread} disabled={isSubmitting || !form.title.trim()} className="flex-1 py-3 rounded-xl bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold">
                  {isSubmitting ? 'Posting...' : 'Post Thread'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}