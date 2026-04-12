import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, updateDoc, doc, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, MessageCircle, Heart, Edit, Pin, Lock, Unlock, Search, Filter, Square, CheckSquare, Eye, X, Check } from 'lucide-react';

interface Thread {
  id: string;
  title: string;
  author: string;
  category: string;
  replies: number;
  likes: number;
  isPinned?: boolean;
  isLocked?: boolean;
  createdAt?: any;
}

const CATEGORIES = ['Leadership', 'Events', 'Community', 'Prayer', 'Training', 'General'];

export default function ForumAdmin() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [filteredThreads, setFilteredThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingThread, setEditingThread] = useState<Thread | null>(null);
  const [editForm, setEditForm] = useState({ title: '', category: '' });

  const fetchThreads = async () => {
    try {
      const q = query(collection(db, 'forum_threads'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        isPinned: doc.data().isPinned || false,
        isLocked: doc.data().isLocked || false
      } as Thread));
      setThreads(data);
      setFilteredThreads(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchThreads(); }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...threads];
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    
    setFilteredThreads(filtered);
  }, [searchTerm, categoryFilter, threads]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this thread? All replies will also be deleted.')) {
      await deleteDoc(doc(db, 'forum_threads', id));
      fetchThreads();
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleTogglePin = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'forum_threads', id), { isPinned: !currentStatus });
    fetchThreads();
  };

  const handleToggleLock = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'forum_threads', id), { isLocked: !currentStatus });
    fetchThreads();
  };

  const handleEdit = async () => {
    if (!editingThread) return;
    await updateDoc(doc(db, 'forum_threads', editingThread.id), {
      title: editForm.title,
      category: editForm.category,
    });
    setEditingThread(null);
    fetchThreads();
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.size} threads?`)) {
      for (const id of selectedIds) {
        await deleteDoc(doc(db, 'forum_threads', id));
      }
      fetchThreads();
      setSelectedIds(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkPin = async () => {
    for (const id of selectedIds) {
      await updateDoc(doc(db, 'forum_threads', id), { isPinned: true });
    }
    fetchThreads();
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredThreads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredThreads.map(t => t.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const getCategoryCount = (category: string) => {
    return threads.filter(t => t.category === category).length;
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Forum Manager</h2>
          <p className="text-slate-400 text-sm">{threads.length} total threads • {filteredThreads.length} shown</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <MessageCircle className="w-6 h-6 text-accent-red mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{threads.length}</p>
          <p className="text-slate-400 text-sm">Total Threads</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Pin className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{threads.filter(t => t.isPinned).length}</p>
          <p className="text-slate-400 text-sm">Pinned</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Lock className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{threads.filter(t => t.isLocked).length}</p>
          <p className="text-slate-400 text-sm">Locked</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{threads.reduce((sum, t) => sum + (t.likes || 0), 0)}</p>
          <p className="text-slate-400 text-sm">Total Likes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search threads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-accent-red"
          >
            <option value="all">All Categories ({threads.length})</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat} ({getCategoryCount(cat)})</option>
            ))}
          </select>
          {(searchTerm || categoryFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
        
        {selectedIds.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkActions(true)}
              className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})
            </button>
            <button
              onClick={handleBulkPin}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Pin className="w-4 h-4" /> Pin ({selectedIds.size})
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-accent-red/30 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-accent-red">Confirm Bulk Delete</h3>
              <button onClick={() => setShowBulkActions(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-300 mb-2">Delete <span className="text-accent-red font-bold">{selectedIds.size}</span> threads?</p>
            <p className="text-slate-400 text-sm mb-6">All replies and likes will also be deleted.</p>
            <div className="flex gap-3">
              <button onClick={handleBulkDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">Yes, Delete</button>
              <button onClick={() => setShowBulkActions(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Thread Modal */}
      {editingThread && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-accent-red/30 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-accent-red">Edit Thread</h3>
              <button onClick={() => setEditingThread(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-slate-400 text-sm mb-1">Title</label><input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" /></div>
              <div><label className="block text-slate-400 text-sm mb-1">Category</label><select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">{CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleEdit} className="flex-1 bg-accent-red hover:bg-accent-red/90 text-white py-2 rounded-lg">Save Changes</button>
              <button onClick={() => setEditingThread(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Threads Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr className="border-b border-slate-700">
                <th className="px-6 py-4 text-left">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-white">
                    {selectedIds.size === filteredThreads.length && filteredThreads.length > 0 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Thread</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Author</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Category</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Stats</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Status</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredThreads.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No threads found</td></tr>
              ) : (
                filteredThreads.map((thread) => (
                  <tr key={thread.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => handleSelectOne(thread.id)} className="text-slate-400 hover:text-white">
                        {selectedIds.has(thread.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{thread.title}</p>
                      <p className="text-slate-400 text-xs">{thread.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{thread.author}</td>
                    <td className="px-6 py-4"><span className="bg-primary/20 text-accent-red px-2 py-1 rounded text-xs">{thread.category}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3 text-slate-400 text-xs">
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {thread.replies || 0}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {thread.likes || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {thread.isPinned && <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs flex items-center gap-1"><Pin className="w-3 h-3" />Pinned</span>}
                        {thread.isLocked && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs flex items-center gap-1"><Lock className="w-3 h-3" />Locked</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingThread(thread); setEditForm({ title: thread.title, category: thread.category }); }} className="p-1.5 hover:bg-blue-500/20 rounded-lg text-blue-400"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleTogglePin(thread.id, thread.isPinned || false)} className={`p-1.5 rounded-lg ${thread.isPinned ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-yellow-500/20 text-slate-400 hover:text-yellow-400'}`}><Pin className="w-4 h-4" /></button>
                        <button onClick={() => handleToggleLock(thread.id, thread.isLocked || false)} className={`p-1.5 rounded-lg ${thread.isLocked ? 'bg-red-500/20 text-red-400' : 'hover:bg-red-500/20 text-slate-400 hover:text-red-400'}`}><Lock className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(thread.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
