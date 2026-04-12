import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Mail, Phone, Church, Crown, Search, Filter, Trash2, Edit, X, Check, Download, Square, CheckSquare } from 'lucide-react';

interface Member {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  conference?: string;
  district?: string;
  localChurch?: string;
  premiumUnlocked?: boolean;
  memberSince?: number;
  createdAt?: any;
}

export default function MembersAdmin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [premiumFilter, setPremiumFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    phone: '',
    conference: '',
    district: '',
    localChurch: '',
    premiumUnlocked: false,
  });

  const fetchMembers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
      setFilteredMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...members];
    
    if (search) {
      filtered = filtered.filter(m => 
        m.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        m.email?.toLowerCase().includes(search.toLowerCase()) ||
        m.conference?.toLowerCase().includes(search.toLowerCase()) ||
        m.localChurch?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (premiumFilter !== 'all') {
      filtered = filtered.filter(m => 
        premiumFilter === 'premium' ? m.premiumUnlocked === true : m.premiumUnlocked !== true
      );
    }
    
    setFilteredMembers(filtered);
  }, [search, premiumFilter, members]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this member? This action cannot be undone.')) {
      await deleteDoc(doc(db, 'users', id));
      fetchMembers();
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleTogglePremium = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, 'users', id), { premiumUnlocked: !currentStatus });
    fetchMembers();
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.size} members? This action cannot be undone.`)) {
      for (const id of selectedIds) {
        await deleteDoc(doc(db, 'users', id));
      }
      fetchMembers();
      setSelectedIds(new Set());
      setShowBulkActions(false);
    }
  };

  const handleBulkTogglePremium = async () => {
    for (const id of selectedIds) {
      const member = members.find(m => m.id === id);
      await updateDoc(doc(db, 'users', id), { premiumUnlocked: !member?.premiumUnlocked });
    }
    fetchMembers();
    setSelectedIds(new Set());
    setShowBulkActions(false);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredMembers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMembers.map(m => m.id)));
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

  const startEdit = (member: Member) => {
    setEditingMember(member);
    setEditForm({
      displayName: member.displayName || '',
      phone: member.phone || '',
      conference: member.conference || '',
      district: member.district || '',
      localChurch: member.localChurch || '',
      premiumUnlocked: member.premiumUnlocked || false,
    });
  };

  const saveEdit = async () => {
    if (!editingMember) return;
    await updateDoc(doc(db, 'users', editingMember.id), {
      displayName: editForm.displayName,
      phone: editForm.phone,
      conference: editForm.conference,
      district: editForm.district,
      localChurch: editForm.localChurch,
      premiumUnlocked: editForm.premiumUnlocked,
    });
    setEditingMember(null);
    fetchMembers();
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Conference', 'District', 'Local Church', 'Premium', 'Member Since'];
    const rows = filteredMembers.map(m => [
      m.displayName || '',
      m.email,
      m.phone || '',
      m.conference || '',
      m.district || '',
      m.localChurch || '',
      m.premiumUnlocked ? 'Yes' : 'No',
      m.memberSince || m.createdAt?.toDate?.()?.getFullYear() || 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPremiumCount = () => members.filter(m => m.premiumUnlocked === true).length;
  const getFreeCount = () => members.filter(m => m.premiumUnlocked !== true).length;

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Members</h2>
          <p className="text-slate-400 text-sm">{members.length} total members • {filteredMembers.length} shown</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-accent-red mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{members.length}</p>
          <p className="text-slate-400 text-sm">Total Members</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Crown className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{getPremiumCount()}</p>
          <p className="text-slate-400 text-sm">Premium Members</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{getFreeCount()}</p>
          <p className="text-slate-400 text-sm">Free Members</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, conference, church..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
            />
          </div>
          <select
            value={premiumFilter}
            onChange={(e) => setPremiumFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-accent-red"
          >
            <option value="all">All Members ({members.length})</option>
            <option value="premium">Premium ({getPremiumCount()})</option>
            <option value="free">Free ({getFreeCount()})</option>
          </select>
          {(search || premiumFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setPremiumFilter('all'); }}
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
              onClick={handleBulkTogglePremium}
              className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Crown className="w-4 h-4" /> Toggle Premium ({selectedIds.size})
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
            <p className="text-slate-300 mb-2">Delete <span className="text-accent-red font-bold">{selectedIds.size}</span> members?</p>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone. All member data will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={handleBulkDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">Yes, Delete</button>
              <button onClick={() => setShowBulkActions(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-accent-red/30 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-accent-red">Edit Member</h3>
              <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-slate-400 text-sm mb-1">Full Name</label><input type="text" value={editForm.displayName} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" /></div>
              <div><label className="block text-slate-400 text-sm mb-1">Phone</label><input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" /></div>
              <div><label className="block text-slate-400 text-sm mb-1">Conference</label><input type="text" value={editForm.conference} onChange={(e) => setEditForm({ ...editForm, conference: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" /></div>
              <div><label className="block text-slate-400 text-sm mb-1">District</label><input type="text" value={editForm.district} onChange={(e) => setEditForm({ ...editForm, district: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" /></div>
              <div><label className="block text-slate-400 text-sm mb-1">Local Church</label><input type="text" value={editForm.localChurch} onChange={(e) => setEditForm({ ...editForm, localChurch: e.target.value })} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white" /></div>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editForm.premiumUnlocked} onChange={(e) => setEditForm({ ...editForm, premiumUnlocked: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-slate-300 text-sm">Premium Member</span></label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={saveEdit} className="flex-1 bg-accent-red hover:bg-accent-red/90 text-white py-2 rounded-lg">Save Changes</button>
              <button onClick={() => setEditingMember(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr className="border-b border-slate-700">
                <th className="px-6 py-4 text-left">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-white">
                    {selectedIds.size === filteredMembers.length && filteredMembers.length > 0 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Member</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Contact</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Conference</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Status</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No members found</td></tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => handleSelectOne(member.id)} className="text-slate-400 hover:text-white">
                        {selectedIds.has(member.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent-red flex items-center justify-center text-white font-bold">
                          {member.displayName?.charAt(0).toUpperCase() || 'M'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.displayName || 'No name'}</p>
                          <p className="text-slate-400 text-xs">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.phone && <p className="text-slate-300 text-sm flex items-center gap-1"><Phone className="w-3 h-3" /> {member.phone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 text-sm">{member.conference || '-'}</p>
                      {member.localChurch && <p className="text-slate-500 text-xs">{member.localChurch}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${member.premiumUnlocked ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                        <Crown className="w-3 h-3" /> {member.premiumUnlocked ? 'Premium' : 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(member)} className="p-1.5 hover:bg-blue-500/20 rounded-lg text-blue-400"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleTogglePremium(member.id, member.premiumUnlocked || false)} className="p-1.5 hover:bg-yellow-500/20 rounded-lg text-yellow-400"><Crown className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(member.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
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
