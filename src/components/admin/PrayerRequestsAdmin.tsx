import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, Mail, CheckCircle, Eye, Search, Filter, Square, CheckSquare, X, Heart, Reply } from 'lucide-react';

interface PrayerRequest {
  id: string;
  userName: string;
  userEmail: string;
  message: string;
  status?: 'pending' | 'prayed' | 'responded';
  createdAt?: any;
}

export default function PrayerRequestsAdmin() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  const fetchRequests = async () => {
    try {
      const q = query(collection(db, 'prayer_requests'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        status: doc.data().status || 'pending' 
      } as PrayerRequest));
      setRequests(data);
      setFilteredRequests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...requests];
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, requests]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this prayer request?')) {
      await deleteDoc(doc(db, 'prayer_requests', id));
      fetchRequests();
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleMarkPrayed = async (id: string) => {
    await updateDoc(doc(db, 'prayer_requests', id), { status: 'prayed' });
    fetchRequests();
  };

  const handleMarkResponded = async (id: string) => {
    await updateDoc(doc(db, 'prayer_requests', id), { status: 'responded' });
    fetchRequests();
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.size} prayer requests?`)) {
      for (const id of selectedIds) {
        await deleteDoc(doc(db, 'prayer_requests', id));
      }
      fetchRequests();
      setSelectedIds(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkMarkPrayed = async () => {
    for (const id of selectedIds) {
      await updateDoc(doc(db, 'prayer_requests', id), { status: 'prayed' });
    }
    fetchRequests();
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredRequests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRequests.map(r => r.id)));
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

  const handleEmailReply = () => {
    if (!selectedRequest) return;
    const subject = `Prayer Support - RAYAC`;
    const body = `Dear ${selectedRequest.userName},\n\nThank you for sharing your prayer request with us.\n\n${replyMessage || 'We want you to know that we are praying for you and your needs. May God grant you peace, strength, and comfort during this time.'}\n\nIn His service,\nRAYAC Prayer Team`;
    window.location.href = `mailto:${selectedRequest.userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSelectedRequest(null);
    setReplyMessage('');
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'pending') return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs flex items-center gap-1"><Heart className="w-3 h-3" /> Pending</span>;
    if (status === 'prayed') return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Prayed For</span>;
    return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1"><Mail className="w-3 h-3" /> Responded</span>;
  };

  const getStatusCount = (status: string) => {
    return requests.filter(r => r.status === status).length;
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Prayer Requests</h2>
          <p className="text-slate-400 text-sm">{requests.length} total requests • {filteredRequests.length} shown</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Heart className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{getStatusCount('pending')}</p>
          <p className="text-slate-400 text-sm">Pending</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{getStatusCount('prayed')}</p>
          <p className="text-slate-400 text-sm">Prayed For</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Mail className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{getStatusCount('responded')}</p>
          <p className="text-slate-400 text-sm">Responded</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-accent-red"
          >
            <option value="all">All Status ({requests.length})</option>
            <option value="pending">Pending ({getStatusCount('pending')})</option>
            <option value="prayed">Prayed For ({getStatusCount('prayed')})</option>
            <option value="responded">Responded ({getStatusCount('responded')})</option>
          </select>
          {(searchTerm || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
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
              onClick={handleBulkMarkPrayed}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Mark Prayed ({selectedIds.size})
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
            <p className="text-slate-300 mb-2">Delete <span className="text-accent-red font-bold">{selectedIds.size}</span> prayer requests?</p>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleBulkDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">Yes, Delete</button>
              <button onClick={() => setShowBulkActions(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Prayer Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl">
            <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No prayer requests found.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div key={req.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-accent-red/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <button onClick={() => handleSelectOne(req.id)} className="mt-1 text-slate-400 hover:text-white">
                    {selectedIds.has(req.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                  <div>
                    <p className="text-white font-semibold">{req.userName}</p>
                    <p className="text-slate-400 text-sm">{req.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(req.status)}
                  <p className="text-slate-500 text-xs">
                    {req.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </p>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed ml-8 pl-1 border-l-2 border-accent-red/30 pl-4">{req.message}</p>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 ml-8">
                <button
                  onClick={() => handleMarkPrayed(req.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-sm transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Prayed
                </button>
                <button
                  onClick={() => setSelectedRequest(req)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm transition-colors"
                >
                  <Reply className="w-4 h-4" /> Reply & Pray
                </button>
                <button
                  onClick={() => handleDelete(req.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reply Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-accent-red/30 rounded-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-accent-red">Reply to Prayer Request</h3>
              <button onClick={() => { setSelectedRequest(null); setReplyMessage(''); }} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="mb-4">
              <p className="text-slate-400 text-sm">To: <span className="text-white">{selectedRequest.userName} ({selectedRequest.userEmail})</span></p>
              <p className="text-slate-400 text-sm mt-2">Original Request:</p>
              <p className="text-slate-300 text-sm bg-slate-700 p-3 rounded-lg mt-1">{selectedRequest.message}</p>
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Your Response (Optional)</label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write a personal message of encouragement and prayer..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red resize-none"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleEmailReply} className="flex-1 bg-accent-red hover:bg-accent-red/90 text-white py-2 rounded-lg flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" /> Send Reply & Pray
              </button>
              <button onClick={() => { setSelectedRequest(null); setReplyMessage(''); }} className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
