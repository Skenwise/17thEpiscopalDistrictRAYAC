import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Trash2, Edit, X } from 'lucide-react';

interface VolunteerOpportunity {
  id: string;
  title: string;
  location: string;
  timeCommitment: string;
  description: string;
  skills: string[];
  spotsAvailable: number;
  createdAt?: any;
}

export default function VolunteerAdmin() {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState<VolunteerOpportunity | null>(null);

  const [form, setForm] = useState({
    title: '',
    location: '',
    timeCommitment: '',
    description: '',
    skills: '',
    spotsAvailable: 5,
  });

  const fetchOpportunities = async () => {
    try {
      const q = query(collection(db, 'volunteer_opportunities'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setOpportunities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VolunteerOpportunity)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOpportunities(); }, []);

  const resetForm = () => {
    setForm({
      title: '',
      location: '',
      timeCommitment: '',
      description: '',
      skills: '',
      spotsAvailable: 5,
    });
    setEditingItem(null);
    setError('');
  };

  const startEdit = (item: VolunteerOpportunity) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      location: item.location,
      timeCommitment: item.timeCommitment,
      description: item.description,
      skills: item.skills?.join(', ') || '',
      spotsAvailable: item.spotsAvailable,
    });
    setActiveTab('add');
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const data = {
        title: form.title,
        location: form.location,
        timeCommitment: form.timeCommitment,
        description: form.description,
        skills: form.skills.split(',').map(s => s.trim()).filter(s => s),
        spotsAvailable: form.spotsAvailable,
        updatedAt: serverTimestamp(),
      };

      if (editingItem) {
        await updateDoc(doc(db, 'volunteer_opportunities', editingItem.id), data);
        setSuccess('Opportunity updated successfully!');
      } else {
        await addDoc(collection(db, 'volunteer_opportunities'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        setSuccess('Opportunity added successfully!');
      }
      resetForm();
      fetchOpportunities();
      setTimeout(() => { 
        setSuccess(''); 
        setActiveTab('list');
        setEditingItem(null);
      }, 2000);
    } catch (error) {
      setError('Failed to save opportunity. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await deleteDoc(doc(db, 'volunteer_opportunities', id));
        fetchOpportunities();
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const cancelEdit = () => {
    resetForm();
    setActiveTab('list');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Volunteer Manager</h2>
          <p className="text-slate-400 text-sm">{opportunities.length} total opportunities</p>
        </div>
        {activeTab === 'list' && (
          <button
            onClick={() => { resetForm(); setActiveTab('add'); }}
            className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" /> Add Opportunity
          </button>
        )}
      </div>

      {activeTab === 'add' ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">
              {editingItem ? 'Edit Opportunity' : 'Add New Opportunity'}
            </h3>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-sm mb-2">Opportunity Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Event Setup Crew"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="RAYAC Conference Center"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Time Commitment</label>
              <input type="text" value={form.timeCommitment} onChange={(e) => setForm({ ...form, timeCommitment: e.target.value })}
                placeholder="Weekends, 4 hours/day"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Spots Available</label>
              <input type="number" value={form.spotsAvailable} onChange={(e) => setForm({ ...form, spotsAvailable: parseInt(e.target.value) })}
                placeholder="5"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 text-sm mb-2">Required Skills (comma separated)</label>
              <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="Teamwork, Communication, Leadership"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the volunteer opportunity..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red resize-none transition-colors" />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex-1 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all">
              {isSubmitting ? 'Saving...' : (editingItem ? 'Update Opportunity' : 'Add Opportunity')}
            </button>
            <button onClick={cancelEdit}
              className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading ? <p className="text-slate-400">Loading...</p> : (
            <>
              {opportunities.map((item) => (
                <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-between gap-4 hover:border-accent-red/30 transition-all">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <p className="text-slate-400 text-sm">{item.location} · {item.timeCommitment}</p>
                    <p className="text-slate-500 text-xs mt-1">Spots: {item.spotsAvailable} | Skills: {item.skills?.join(', ')}</p>
                    <p className="text-slate-400 text-sm mt-2">{item.description.substring(0, 100)}...</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(item)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-slate-400 hover:text-blue-400">
                      <Edit className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {opportunities.length === 0 && (
                <p className="text-slate-400 text-center py-8">No volunteer opportunities yet. Add your first one!</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
