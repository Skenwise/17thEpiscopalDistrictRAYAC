import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, Download, Filter, Mail, CheckSquare, Square, Search, Calendar, Users, ArrowLeft } from 'lucide-react';

interface RSVP {
  id: string;
  userName: string;
  userEmail: string;
  eventTitle: string;
  eventDate: string;
  createdAt?: any;
}

export default function RSVPsAdmin() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [filteredRsvps, setFilteredRsvps] = useState<RSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [events, setEvents] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const fetchRSVPs = async () => {
    try {
      const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVP));
      setRsvps(data);
      setFilteredRsvps(data);
      
      // Extract unique event names for filter
      const uniqueEvents = [...new Set(data.map(r => r.eventTitle))];
      setEvents(uniqueEvents);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRSVPs(); }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...rsvps];
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (eventFilter !== 'all') {
      filtered = filtered.filter(r => r.eventTitle === eventFilter);
    }
    
    setFilteredRsvps(filtered);
  }, [searchTerm, eventFilter, rsvps]);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this RSVP?')) {
      await deleteDoc(doc(db, 'rsvps', id));
      fetchRSVPs();
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.size} RSVPs?`)) {
      for (const id of selectedIds) {
        await deleteDoc(doc(db, 'rsvps', id));
      }
      fetchRSVPs();
      setSelectedIds(new Set());
      setShowBulkActions(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredRsvps.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRsvps.map(r => r.id)));
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
    const headers = ['Member Name', 'Email', 'Event', 'Event Date', 'Registered Date'];
    const rows = filteredRsvps.map(r => [
      r.userName,
      r.userEmail,
      r.eventTitle,
      r.eventDate,
      r.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvps_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const emailAttendees = () => {
    const emails = filteredRsvps.map(r => r.userEmail).join(',');
    window.location.href = `mailto:${emails}?subject=Event%20Update%20from%20RAYAC&body=Dear%20member%2C%0A%0AThank%20you%20for%20your%20RSVP...`;
  };

  const getEventStats = () => {
    const stats: Record<string, number> = {};
    rsvps.forEach(r => {
      stats[r.eventTitle] = (stats[r.eventTitle] || 0) + 1;
    });
    return stats;
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" /></div>;
  }

  const eventStats = getEventStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Event RSVPs</h2>
          <p className="text-slate-400 text-sm">{rsvps.length} total RSVPs • {filteredRsvps.length} shown</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={emailAttendees} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Mail className="w-4 h-4" /> Email All
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <Users className="w-6 h-6 text-accent-red mb-2" />
          <p className="text-2xl font-bold text-white">{rsvps.length}</p>
          <p className="text-slate-400 text-sm">Total RSVPs</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <Calendar className="w-6 h-6 text-accent-red mb-2" />
          <p className="text-2xl font-bold text-white">{events.length}</p>
          <p className="text-slate-400 text-sm">Unique Events</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <Users className="w-6 h-6 text-accent-red mb-2" />
          <p className="text-2xl font-bold text-white">{selectedIds.size}</p>
          <p className="text-slate-400 text-sm">Selected</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="w-6 h-6 mb-2" />
          <p className="text-2xl font-bold text-white">{filteredRsvps.length}</p>
          <p className="text-slate-400 text-sm">After Filters</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
            />
          </div>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-accent-red"
          >
            <option value="all">All Events ({rsvps.length})</option>
            {events.map(event => (
              <option key={event} value={event}>{event} ({eventStats[event]})</option>
            ))}
          </select>
          {(searchTerm || eventFilter !== 'all') && (
            <button
              onClick={() => { setSearchTerm(''); setEventFilter('all'); }}
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
            <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.size})
          </button>
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
            <p className="text-slate-300 mb-2">Are you sure you want to delete <span className="text-accent-red font-bold">{selectedIds.size}</span> RSVPs?</p>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={handleBulkDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">Yes, Delete</button>
              <button onClick={() => setShowBulkActions(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* RSVPs Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50">
              <tr className="border-b border-slate-700">
                <th className="px-6 py-4 text-left">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-white">
                    {selectedIds.size === filteredRsvps.length && filteredRsvps.length > 0 ? 
                      <CheckSquare className="w-5 h-5" /> : 
                      <Square className="w-5 h-5" />
                    }
                  </button>
                </th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Member</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Event</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Event Date</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Registered</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRsvps.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No RSVPs found</td></tr>
              ) : (
                filteredRsvps.map((rsvp) => (
                  <tr key={rsvp.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <button onClick={() => handleSelectOne(rsvp.id)} className="text-slate-400 hover:text-white">
                        {selectedIds.has(rsvp.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{rsvp.userName}</p>
                      <p className="text-slate-400 text-xs">{rsvp.userEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-accent-red font-medium">{rsvp.eventTitle}</td>
                    <td className="px-6 py-4 text-slate-400">{rsvp.eventDate}</td>
                    <td className="px-6 py-4 text-slate-400">
                      {rsvp.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(rsvp.id)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Summary Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-accent-red" />Event Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(eventStats).map(([event, count]) => (
            <div key={event} className="flex justify-between items-center p-3 bg-slate-700/30 rounded-lg">
              <span className="text-slate-300 text-sm truncate max-w-[150px]">{event}</span>
              <span className="text-accent-red font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
