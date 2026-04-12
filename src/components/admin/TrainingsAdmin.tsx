import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Trash2, Edit, X, DollarSign } from 'lucide-react';

interface Training {
  id: string;
  title: string;
  level: string;
  description: string;
  duration: string;
  price: number;
  currency: string;
  isPaid: boolean;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  createdAt?: any;
}

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Leadership', 'Certificate'];

export default function TrainingsAdmin() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState<Training | null>(null);

  const [form, setForm] = useState({
    title: '',
    level: 'Beginner',
    description: '',
    duration: '',
    price: 0,
    currency: 'ZMW',
    isPaid: false,
    maxParticipants: 50,
    startDate: '',
    endDate: '',
  });

  const fetchTrainings = async () => {
    try {
      const q = query(collection(db, 'trainings'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setTrainings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Training)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTrainings(); }, []);

  const resetForm = () => {
    setForm({
      title: '',
      level: 'Beginner',
      description: '',
      duration: '',
      price: 0,
      currency: 'ZMW',
      isPaid: false,
      maxParticipants: 50,
      startDate: '',
      endDate: '',
    });
    setEditingItem(null);
    setError('');
  };

  const startEdit = (item: Training) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      level: item.level,
      description: item.description,
      duration: item.duration,
      price: item.price,
      currency: item.currency,
      isPaid: item.isPaid,
      maxParticipants: item.maxParticipants,
      startDate: item.startDate,
      endDate: item.endDate,
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
        ...form,
        updatedAt: serverTimestamp(),
      };

      if (editingItem) {
        await updateDoc(doc(db, 'trainings', editingItem.id), data);
        setSuccess('Training updated successfully!');
      } else {
        await addDoc(collection(db, 'trainings'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        setSuccess('Training added successfully!');
      }
      resetForm();
      fetchTrainings();
      setTimeout(() => { 
        setSuccess(''); 
        setActiveTab('list');
        setEditingItem(null);
      }, 2000);
    } catch (error) {
      setError('Failed to save training. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this training?')) {
      try {
        await deleteDoc(doc(db, 'trainings', id));
        fetchTrainings();
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
          <h2 className="text-2xl font-bold text-white">Trainings Manager</h2>
          <p className="text-slate-400 text-sm">{trainings.length} total trainings</p>
        </div>
        {activeTab === 'list' && (
          <button
            onClick={() => { resetForm(); setActiveTab('add'); }}
            className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" /> Add Training
          </button>
        )}
      </div>

      {activeTab === 'add' ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">
              {editingItem ? 'Edit Training' : 'Add New Training'}
            </h3>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-sm mb-2">Training Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Youth Leadership Training"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Level</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-accent-red transition-colors">
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Duration</label>
              <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="2 days / 4 weeks / 3 months"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-accent-red transition-colors" />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-accent-red transition-colors" />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Max Participants</label>
              <input type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: parseInt(e.target.value) })}
                placeholder="50"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Training description..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red resize-none transition-colors" />
          </div>

          <div className="border-t border-slate-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input type="checkbox" checked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
                className="w-4 h-4 rounded" />
              <span className="text-slate-300 text-sm font-medium">This is a paid training</span>
            </label>

            {form.isPaid && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Price</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    placeholder="100"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-accent-red transition-colors">
                    <option value="ZMW">Zambian Kwacha (ZMW)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex-1 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all">
              {isSubmitting ? 'Saving...' : (editingItem ? 'Update Training' : 'Add Training')}
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
              {trainings.map((item) => (
                <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-between gap-4 hover:border-accent-red/30 transition-all">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-semibold">{item.title}</h3>
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">{item.level}</span>
                      {item.isPaid && (
                        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">Paid</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{item.description.substring(0, 100)}...</p>
                    <p className="text-slate-500 text-xs mt-2">Duration: {item.duration} | Max: {item.maxParticipants} participants</p>
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
              {trainings.length === 0 && (
                <p className="text-slate-400 text-center py-8">No trainings yet. Add your first one!</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
