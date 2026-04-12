import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, updateDoc, doc, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, Download, Search, Mail, CheckCircle, Square, CheckSquare, Award, Users } from 'lucide-react';

interface Enrollment {
  id: string;
  userName: string;
  userEmail: string;
  trainingTitle: string;
  trainingLevel: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  certificateIssued?: boolean;
  createdAt?: any;
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'yellow' },
  { value: 'confirmed', label: 'Confirmed', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
];

export default function EnrollmentsAdmin() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [success, setSuccess] = useState('');

  const fetchEnrollments = async () => {
    try {
      const q = query(collection(db, 'training_enrollments'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        status: doc.data().status || 'pending',
        certificateIssued: doc.data().certificateIssued || false
      } as Enrollment));
      setEnrollments(data);
      setFilteredEnrollments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEnrollments(); }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...enrollments];
    
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.trainingTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }
    
    setFilteredEnrollments(filtered);
  }, [searchTerm, statusFilter, enrollments]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this enrollment?')) {
      await deleteDoc(doc(db, 'training_enrollments', id));
      fetchEnrollments();
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, 'training_enrollments', id), { status });
    fetchEnrollments();
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.size} enrollments?`)) {
      for (const id of selectedIds) {
        await deleteDoc(doc(db, 'training_enrollments', id));
      }
      fetchEnrollments();
      setSelectedIds(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkStatus = async (status: string) => {
    for (const id of selectedIds) {
      await updateDoc(doc(db, 'training_enrollments', id), { status });
    }
    fetchEnrollments();
    setSelectedIds(new Set());
    setShowBulkActions(false);
    setSuccess(`${selectedIds.size} enrollments updated to ${status}`);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredEnrollments.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEnrollments.map(e => e.id)));
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

  const exportToCSV = () => {
    const headers = ['Member Name', 'Email', 'Training', 'Level', 'Status', 'Enrolled Date'];
    const rows = filteredEnrollments.map(e => [
      e.userName,
      e.userEmail,
      e.trainingTitle,
      e.trainingLevel,
      e.status || 'pending',
      e.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enrollments_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const emailEnrollees = () => {
    const emails = filteredEnrollments.map(e => e.userEmail).join(',');
    window.location.href = `mailto:${emails}?subject=Training%20Update%20from%20RAYAC&body=Dear%20participant%2C%0A%0AThank%20you%20for%20your%20interest%20in%20our%20training%20programs...`;
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'pending') return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">Pending</span>;
    if (status === 'confirmed') return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">Confirmed</span>;
    if (status === 'completed') return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Completed</span>;
    return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">Cancelled</span>;
  };

  const getStatusCount = (status: string) => enrollments.filter(e => e.status === status).length;

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Training Enrollments</h2>
          <p className="text-slate-400 text-sm">{enrollments.length} total enrollments • {filteredEnrollments.length} shown</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={emailEnrollees} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Mail className="w-4 h-4" /> Email All
          </button>
        </div>
      </div>

      {success && <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4"><p className="text-green-400 text-sm">{success}</p></div>}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-accent-red mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{enrollments.length}</p>
          <p className="text-slate-400 text-sm">Total Enrollments</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{getStatusCount('completed')}</p>
          <p className="text-slate-400 text-sm">Completed</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Award className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{getStatusCount('confirmed')}</p>
          <p className="text-slate-400 text-sm">Confirmed</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{getStatusCount('pending')}</p>
          <p className="text-slate-400 text-sm">Pending</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or training..."
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
            <option value="all">All Status ({enrollments.length})</option>
            <option value="pending">Pending ({getStatusCount('pending')})</option>
            <option value="confirmed">Confirmed ({getStatusCount('confirmed')})</option>
            <option value="completed">Completed ({getStatusCount('completed')})</option>
            <option value="cancelled">Cancelled ({getStatusCount('cancelled')})</option>
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
          <button
            onClick={() => setShowBulkActions(true)}
            className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Actions ({selectedIds.size})
          </button>
        )}
      </div>

      {/* Bulk Actions Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-accent-red/30 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-accent-red">Bulk Actions</h3>
              <button onClick={() => setShowBulkActions(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-300 mb-4">{selectedIds.size} enrollments selected</p>
            <div className="space-y-2">
              <button onClick={() => handleBulkStatus('confirmed')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Mark as Confirmed</button>
              <button onClick={() => handleBulkStatus('completed')} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">Mark as Completed</button>
              <button onClick={() => handleBulkStatus('cancelled')} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">Mark as Cancelled</button>
              <button onClick={handleBulkDelete} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* Enrollments Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr className="border-b border-slate-700">
                <th className="px-6 py-4 text-left">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-white">
                    {selectedIds.size === filteredEnrollments.length && filteredEnrollments.length > 0 ? 
                      <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />
                    }
                  </button>
                </th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Member</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Training</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Level</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Status</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Enrolled</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No enrollments found</td></tr>
              ) : (
                filteredEnrollments.map((e) => (
                  <tr key={e.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => handleSelectOne(e.id)} className="text-slate-400 hover:text-white">
                        {selectedIds.has(e.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{e.userName}</p>
                      <p className="text-slate-400 text-xs">{e.userEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-accent-red font-medium">{e.trainingTitle}</td>
                    <td className="px-6 py-4">
                      <span className="bg-primary/20 text-accent-red px-2 py-1 rounded text-xs">{e.trainingLevel}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(e.status)}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {e.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <select
                          value={e.status || 'pending'}
                          onChange={(s) => handleUpdateStatus(e.id, s.target.value)}
                          className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-white"
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
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
