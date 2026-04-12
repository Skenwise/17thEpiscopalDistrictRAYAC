import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, MessageCircle, Heart } from 'lucide-react';

interface Thread {
  id: string;
  title: string;
  author: string;
  category: string;
  replies: number;
  likes: number;
  createdAt?: any;
}

export default function ForumAdmin() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchThreads = async () => {
    try {
      const q = query(collection(db, 'forum_threads'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setThreads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Thread)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchThreads(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this thread?')) {
      try {
        await deleteDoc(doc(db, 'forum_threads', id));
        fetchThreads();
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Forum Manager</h2>
        <p className="text-slate-400 text-sm">{threads.length} total threads</p>
      </div>

      {isLoading ? (
        <p className="text-slate-400">Loading...</p>
      ) : threads.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl">
          <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No forum threads yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <div key={thread.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-between gap-4 hover:border-accent-red/30 transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-white font-semibold">{thread.title}</h3>
                  <span className="bg-primary/20 text-accent-red px-2 py-0.5 rounded text-xs">{thread.category}</span>
                </div>
                <p className="text-slate-400 text-sm">By {thread.author}</p>
                <div className="flex gap-4 mt-2 text-slate-500 text-xs">
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {thread.replies} replies</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {thread.likes} likes</span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(thread.id)}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
