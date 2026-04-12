import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Plus, Trash2, Edit, X, DollarSign, Upload, Calendar as CalendarIcon, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

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
  isPaid: boolean;
  price: number;
  currency: string;
  paymentLink?: string;
}

const LOCATIONS = [
  'RAYAC Conference Center',
  'Main Auditorium',
  'Training Room A',
  'Online (Zoom)',
  'Church Hall',
  'Other (type manually)'
];

export default function EventsAdmin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [customLocation, setCustomLocation] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

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
    isPaid: false,
    price: 0,
    currency: 'ZMW',
    paymentLink: '',
  });

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    if (startDate) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[startDate.getMonth()];
      const day = startDate.getDate().toString();
      let dateString = `${month} ${day}`;
      if (endDate && endDate !== startDate) {
        const endMonth = monthNames[endDate.getMonth()];
        const endDay = endDate.getDate();
        dateString = `${month} ${day} - ${endMonth} ${endDay}, ${startDate.getFullYear()}`;
      } else {
        dateString = `${month} ${day}, ${startDate.getFullYear()}`;
      }
      const timeString = `${startTime} - ${endTime}`;
      setForm(prev => ({ ...prev, date: dateString, month: month, day: day, time: timeString }));
    }
  }, [startDate, endDate, startTime, endTime]);

  useEffect(() => {
    if (selectedLocation === 'Other (type manually)') {
      setForm(prev => ({ ...prev, location: customLocation }));
    } else if (selectedLocation) {
      setForm(prev => ({ ...prev, location: selectedLocation }));
    }
  }, [selectedLocation, customLocation]);

  const resetForm = () => {
    setForm({ title: '', date: '', month: '', day: '', time: '', location: '', description: '', image: '', cta: 'Register Now', featured: false, isPaid: false, price: 0, currency: 'ZMW', paymentLink: '' });
    setStartDate(null); setEndDate(null); setStartTime('09:00'); setEndTime('17:00'); setSelectedLocation(''); setCustomLocation(''); setEditingEvent(null); setError('');
  };

  const startEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({
      title: event.title, date: event.date, month: event.month, day: event.day, time: event.time || '',
      location: event.location || '', description: event.description || '', image: event.image || '',
      cta: event.cta || 'Register Now', featured: event.featured || false,
      isPaid: event.isPaid || false, price: event.price || 0, currency: event.currency || 'ZMW', paymentLink: event.paymentLink || '',
    });
    setSelectedLocation(event.location || '');
    setActiveTab('add');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingImage(true);
    try {
      const imageRef = ref(storage, `events/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setForm(prev => ({ ...prev, image: url }));
      setSuccess('Image uploaded!'); setTimeout(() => setSuccess(''), 2000);
    } catch (error) { setError('Failed to upload image.'); } finally { setUploadingImage(false); }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!startDate) { setError('Please select a date.'); return; }
    if (form.isPaid && form.price <= 0) { setError('Please set a valid price.'); return; }
    setError(''); setIsSubmitting(true);
    try {
      const eventData = {
        title: form.title, date: form.date, month: form.month, day: form.day, time: form.time,
        location: form.location, description: form.description, image: form.image, cta: form.cta,
        featured: form.featured, isPaid: form.isPaid, price: form.price, currency: form.currency,
        paymentLink: form.paymentLink || (form.isPaid ? `/website-checkout?product=${encodeURIComponent(form.title)}&price=${form.price}&currency=${form.currency}` : ''),
      };
      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), { ...eventData, updatedAt: serverTimestamp() });
        setSuccess('Event updated!');
      } else {
        await addDoc(collection(db, 'events'), { ...eventData, createdAt: serverTimestamp() });
        setSuccess('Event added!');
      }
      resetForm(); fetchEvents();
      setTimeout(() => { setSuccess(''); setActiveTab('list'); setEditingEvent(null); }, 2000);
    } catch (error) { setError('Failed to save event.'); } finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this event?')) {
      try { await deleteDoc(doc(db, 'events', id)); fetchEvents(); } catch (error) { console.error(error); }
    }
  };

  const cancelEdit = () => { resetForm(); setActiveTab('list'); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-white">Events Manager</h2><p className="text-slate-400 text-sm">{events.length} total events</p></div>
        {activeTab === 'list' && <button onClick={() => { resetForm(); setActiveTab('add'); }} className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white font-semibold px-6 py-3 rounded-xl"><Plus className="w-5 h-5" /> Add Event</button>}
      </div>

      {activeTab === 'add' ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between"><h3 className="text-white font-semibold text-lg">{editingEvent ? 'Edit Event' : 'Add New Event'}</h3><button onClick={cancelEdit} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div>
          {error && <p className="text-red-400 text-sm">{error}</p>}{success && <p className="text-green-400 text-sm">{success}</p>}
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className="block text-slate-400 text-sm mb-2">Event Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white" /></div>
            <div><label className="block text-slate-400 text-sm mb-2">Date Range *</label><DatePicker selectsRange startDate={startDate || undefined} endDate={endDate || undefined} onChange={(update: [Date | null, Date | null]) => { const [start, end] = update; setStartDate(start); setEndDate(end); }} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white" placeholderText="Select date range" dateFormat="MMM d, yyyy" /></div>
            <div><label className="block text-slate-400 text-sm mb-2">Time Range</label><div className="flex gap-2"><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white" /><span className="text-white self-center">to</span><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white" /></div></div>
            <div><label className="block text-slate-400 text-sm mb-2">Location</label><select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"><option value="">Select location</option>{LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}</select></div>
            {selectedLocation === 'Other (type manually)' && <div><label className="block text-slate-400 text-sm mb-2">Custom Location</label><input type="text" value={customLocation} onChange={(e) => setCustomLocation(e.target.value)} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white" /></div>}
            <div><label className="block text-slate-400 text-sm mb-2">CTA Button Text</label><input type="text" value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white" /></div>
            <div><label className="block text-slate-400 text-sm mb-2">Event Image</label><div className="flex gap-2"><input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white" /><label className="px-4 py-3 bg-slate-600 rounded-xl cursor-pointer"><Upload className="w-5 h-5 text-white" /><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} /></label></div>{uploadingImage && <p className="text-slate-400 text-xs mt-1">Uploading...</p>}</div>
          </div>
          <div><label className="block text-slate-400 text-sm mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white resize-none" /></div>
          
          <div className="border-t border-slate-700 pt-4"><h4 className="text-white font-semibold mb-3 flex items-center gap-2"><DollarSign className="w-5 h-5 text-accent-red" />Payment Settings</h4><label className="flex items-center gap-3 cursor-pointer mb-4"><input type="checkbox" checked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-slate-300 text-sm font-medium">This is a paid event</span></label>
          {form.isPaid && (<div className="grid md:grid-cols-2 gap-4"><div><label className="block text-slate-400 text-sm mb-2">Price *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white" /></div><div><label className="block text-slate-400 text-sm mb-2">Currency</label><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"><option value="ZMW">Zambian Kwacha (ZMW)</option><option value="USD">US Dollar (USD)</option></select></div></div>)}</div>
          
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-slate-300 text-sm font-medium">Show in Featured Carousel on Dashboard</span></label>
          
          <div className="flex gap-3"><button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl">{isSubmitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Add Event')}</button><button onClick={cancelEdit} className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl">Cancel</button></div>
        </div>
      ) : (
        <div className="space-y-4">{isLoading ? <p className="text-slate-400">Loading...</p> : events.map((event) => (<div key={event.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-between gap-4 hover:border-accent-red/30 transition-all"><div className="flex items-center gap-4 flex-1"><div className="bg-gradient-to-br from-primary to-accent-red rounded-xl p-3 text-white text-center min-w-[60px]"><p className="text-xs font-bold">{event.month || 'Jan'}</p><p className="text-2xl font-bold">{event.day || '1'}</p></div><div className="flex-1"><h3 className="text-white font-semibold">{event.title}</h3><p className="text-slate-400 text-sm">{event.date} · {event.location}</p><div className="flex flex-wrap gap-2 mt-1">{event.featured && <span className="bg-accent-red/20 text-accent-red px-2 py-0.5 rounded text-xs font-semibold">Featured</span>}{event.isPaid ? <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1"><DollarSign className="w-3 h-3" /> Paid · {event.currency} {event.price}</span> : <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-semibold">Free</span>}</div></div></div><div className="flex items-center gap-2"><button onClick={() => startEdit(event)} className="p-2 hover:bg-blue-500/20 rounded-lg"><Edit className="w-5 h-5 text-slate-400 hover:text-blue-400" /></button><button onClick={() => handleDelete(event.id)} className="p-2 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-5 h-5 text-slate-400 hover:text-red-400" /></button></div></div>))}</div>
      )}
    </div>
  );
}
