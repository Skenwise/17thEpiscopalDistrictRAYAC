import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  month: string;
  day: string;
  time: string;
  location: string;
  description: string;
  image: string;
  cta: string;
  featured: boolean;
  createdAt?: any;
}

export default function EventsAdmin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: '',
    date: '',
    month: '',
    day: '',
    time: '',
    location: '',
    description: '',
    image: '',
    cta: 'Register Now',
    featured: false,
  });

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.date.trim()) {
      setError('Title and date are required.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'events'), {
        ...form,
        createdAt: serverTimestamp(),
      });
      setSuccess('Event added successfully!');
      setForm({ title: '', date: '', month: '', day: '', time: '', location: '', description: '', image: '', cta: 'Register Now', featured: false });
      fetchEvents();
      setTimeout(() => { setSuccess(''); setActiveTab('list'); }, 2000);
    } catch (error) {
      setError('Failed to add event. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Events Manager</h2>
          <p className="text-slate-400 text-sm">{events.length} total events</p>
        </div>
        <button
          onClick={() => setActiveTab(activeTab === 'list' ? 'add' : 'list')}
          className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white font-semibold px-6 py-3 rounded-xl transition-all"
        >
          {activeTab === 'list' ? <><Plus className="w-5 h-5" /> Add Event</> : '← Back to List'}
        </button>
      </div>

      {activeTab === 'add' ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
          <h3 className="text-white font-semibold text-lg">Add New Event</h3>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-2">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Event title"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Date * (e.g. April 15-18, 2026)</label>
              <input type="text" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                placeholder="April 15-18, 2026"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Month (e.g. Apr)</label>
              <input type="text" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}
                placeholder="Apr"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Day (e.g. 15)</label>
              <input type="text" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}
                placeholder="15"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Time</label>
              <input type="text" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })}
                placeholder="9:00 AM - 5:00 PM"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="RAYAC Conference Center"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">CTA Button Text</label>
              <input type="text" value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })}
                placeholder="Register Now"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red" />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-2">Image URL</label>
              <input type="url" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red" />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Event description..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red resize-none" />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 rounded" />
            <span className="text-slate-300 text-sm font-medium">Show in Featured Carousel on Dashboard</span>
          </label>

          <button onClick={handleSubmit} disabled={isSubmitting}
            className="w-full bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all">
            {isSubmitting ? 'Saving...' : 'Add Event'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading ? <p className="text-slate-400">Loading...</p> : (
            <>
              {events.map((event) => (
                <div key={event.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-between gap-4 hover:border-accent-red/30 transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-gradient-to-br from-primary to-accent-red rounded-xl p-3 text-white text-center min-w-[60px]">
                      <p className="text-xs font-bold">{event.month}</p>
                      <p className="text-2xl font-bold">{event.day}</p>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{event.title}</h3>
                      <p className="text-slate-400 text-sm">{event.date} · {event.location}</p>
                      {event.featured && (
                        <span className="bg-accent-red/20 text-accent-red px-2 py-0.5 rounded text-xs font-semibold">Featured</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(event.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-slate-400 text-center py-8">No events yet. Add your first one!</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}