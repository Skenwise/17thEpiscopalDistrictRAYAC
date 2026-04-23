import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, orderBy, query, where } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Plus, Trash2, Edit, X, DollarSign, Upload, Calendar as CalendarIcon, Clock, Search, Filter, Copy, Download, Square, CheckSquare, Eye, EyeOff, Repeat, Image as ImageIcon } from 'lucide-react';
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
  status?: 'draft' | 'published' | 'cancelled';
  isRecurring?: boolean;
  recurringPattern?: string;
}

const LOCATIONS = [
  'RAYAC Conference Center',
  'Main Auditorium',
  'Training Room A',
  'Online (Zoom)',
  'Church Hall',
  'Other (type manually)'
];

const STATUS_OPTIONS = [
  { value: 'published', label: 'Published', color: 'green' },
  { value: 'draft', label: 'Draft', color: 'yellow' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
];

export default function EventsAdmin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [recurringCount, setRecurringCount] = useState(3);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    status: 'published' as 'draft' | 'published' | 'cancelled',
    isRecurring: false,
    recurringPattern: 'weekly',
  });

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data(), status: doc.data().status || 'published' } as Event));
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    let filtered = [...events];
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }
    setFilteredEvents(filtered);
  }, [searchTerm, statusFilter, events]);

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
    setForm({ title: '', date: '', month: '', day: '', time: '', location: '', description: '', image: '', cta: 'Register Now', featured: false, isPaid: false, price: 0, currency: 'ZMW', paymentLink: '', status: 'published', isRecurring: false, recurringPattern: 'weekly' });
    setStartDate(null); setEndDate(null); setStartTime('09:00'); setEndTime('17:00'); setSelectedLocation(''); setCustomLocation(''); setEditingEvent(null); setError(''); setImagePreview(null);
  };

  const startEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({
      title: event.title, date: event.date, month: event.month, day: event.day, time: event.time || '',
      location: event.location || '', description: event.description || '', image: event.image || '',
      cta: event.cta || 'Register Now', featured: event.featured || false,
      isPaid: event.isPaid || false, price: event.price || 0, currency: event.currency || 'ZMW', 
      paymentLink: event.paymentLink || '', status: event.status || 'published',
      isRecurring: false, recurringPattern: 'weekly',
    });
    setImagePreview(event.image || null);
    setSelectedLocation(event.location || '');
    setActiveTab('add');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, GIF, or WEBP images only.');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }
    
    setUploadingImage(true);
    setError('');
    setUploadProgress(0);
    
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    try {
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storagePath = `events/${timestamp}_${safeFileName}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            setError(`Upload failed: ${error.message}`);
            reject(error);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            setForm(prev => ({ ...prev, image: url }));
            setSuccess('Image uploaded successfully!');
            setTimeout(() => setSuccess(''), 3000);
            resolve();
          }
        );
      });
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image: '' }));
    setImagePreview(null);
    setSuccess('Image removed');
    setTimeout(() => setSuccess(''), 2000);
  };

  const duplicateEvent = async (event: Event) => {
    const newTitle = `${event.title} (Copy)`;
    const eventData = {
      title: newTitle, date: event.date, month: event.month, day: event.day, time: event.time,
      location: event.location, description: event.description, image: event.image, cta: event.cta,
      featured: false, isPaid: event.isPaid, price: event.price, currency: event.currency,
      paymentLink: event.paymentLink, status: 'draft',
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, 'events'), eventData);
    fetchEvents();
    setSuccess(`Event duplicated as "${newTitle}"`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!startDate && !editingEvent) { setError('Please select a date.'); return; }
    if (form.isPaid && form.price <= 0) { setError('Please set a valid price.'); return; }
    setError(''); setIsSubmitting(true);
    
    try {
      const eventData = {
        title: form.title, date: form.date, month: form.month, day: form.day, time: form.time,
        location: form.location, description: form.description, image: form.image, cta: form.cta,
        featured: form.featured, isPaid: form.isPaid, price: form.price, currency: form.currency,
        paymentLink: form.paymentLink || (form.isPaid ? `/website-checkout?product=${encodeURIComponent(form.title)}&price=${form.price}&currency=${form.currency}` : ''),
        status: form.status,
      };
      
      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), { ...eventData, updatedAt: serverTimestamp() });
        setSuccess('Event updated!');
        resetForm();
        fetchEvents();
        setTimeout(() => { setSuccess(''); setActiveTab('list'); setEditingEvent(null); }, 2000);
      } else if (form.isRecurring && startDate) {
        setShowRecurringModal(true);
        setIsSubmitting(false);
        return;
      } else {
        await addDoc(collection(db, 'events'), { ...eventData, createdAt: serverTimestamp() });
        setSuccess('Event added!');
        resetForm();
        fetchEvents();
        setTimeout(() => { setSuccess(''); setActiveTab('list'); }, 2000);
      }
    } catch (error) { setError('Failed to save event.'); } finally { if (!form.isRecurring) setIsSubmitting(false); }
  };

  const createRecurringEvents = async () => {
    if (!startDate || recurringCount < 1) return;
    const newEvents = [];
    const baseEvent = {
      title: form.title, month: '', day: '', time: `${startTime} - ${endTime}`,
      location: form.location, description: form.description, image: form.image,
      cta: form.cta, featured: form.featured, isPaid: form.isPaid, price: form.price,
      currency: form.currency, paymentLink: form.paymentLink, status: form.status,
    };
    
    for (let i = 0; i < recurringCount; i++) {
      const newDate = new Date(startDate);
      if (form.recurringPattern === 'weekly') newDate.setDate(startDate.getDate() + (i * 7));
      else if (form.recurringPattern === 'biweekly') newDate.setDate(startDate.getDate() + (i * 14));
      else if (form.recurringPattern === 'monthly') newDate.setMonth(startDate.getMonth() + i);
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[newDate.getMonth()];
      const day = newDate.getDate();
      const dateString = `${month} ${day}, ${newDate.getFullYear()}`;
      
      newEvents.push({
        ...baseEvent,
        title: i === 0 ? form.title : `${form.title} (Week ${i + 1})`,
        date: dateString,
        month: month,
        day: day.toString(),
        createdAt: serverTimestamp(),
      });
    }
    
    for (const event of newEvents) {
      await addDoc(collection(db, 'events'), event);
    }
    setShowRecurringModal(false);
    resetForm();
    fetchEvents();
    setSuccess(`${recurringCount} recurring events created!`);
    setTimeout(() => setSuccess(''), 2000);
    setActiveTab('list');
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this event?')) {
      try { await deleteDoc(doc(db, 'events', id)); fetchEvents(); } 
      catch (error) { console.error(error); }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.size} events?`)) {
      for (const id of selectedIds) { await deleteDoc(doc(db, 'events', id)); }
      fetchEvents(); setSelectedIds(new Set()); setShowBulkActions(false);
    }
  };

  const handleBulkStatus = async (status: 'published' | 'draft' | 'cancelled') => {
    for (const id of selectedIds) { await updateDoc(doc(db, 'events', id), { status }); }
    fetchEvents(); setSelectedIds(new Set()); setShowBulkActions(false);
    setSuccess(`${selectedIds.size} events updated to ${status}`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredEvents.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredEvents.map(e => e.id)));
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Date', 'Location', 'Status', 'Type', 'Price', 'Featured'];
    const rows = filteredEvents.map(e => [e.title, e.date, e.location, e.status || 'published', e.isPaid ? 'Paid' : 'Free', e.isPaid ? `${e.currency} ${e.price}` : '-', e.featured ? 'Yes' : 'No']);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `events_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'published') return <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">Published</span>;
    if (status === 'draft') return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs">Draft</span>;
    return <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs">Cancelled</span>;
  };

  const getStatusCount = (status: string) => events.filter(e => e.status === status).length;

  const cancelEdit = () => { resetForm(); setActiveTab('list'); };

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h2 className="text-2xl font-bold text-white">Events Manager</h2><p className="text-slate-400 text-sm">{events.length} total events • {filteredEvents.length} shown</p></div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"><Download className="w-4 h-4" /> Export CSV</button>
          {activeTab === 'list' && <button onClick={() => { resetForm(); setActiveTab('add'); }} className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white font-semibold px-6 py-3 rounded-xl"><Plus className="w-5 h-5" /> Add Event</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-white">{events.length}</p><p className="text-slate-400 text-sm">Total Events</p></div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-white">{getStatusCount('published')}</p><p className="text-slate-400 text-sm">Published</p></div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-white">{getStatusCount('draft')}</p><p className="text-slate-400 text-sm">Draft</p></div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center"><p className="text-2xl font-bold text-white">{events.filter(e => e.isPaid).length}</p><p className="text-slate-400 text-sm">Paid Events</p></div>
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
            
            {/* Enhanced Image Upload Section */}
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-sm mb-2">Event Image</label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <div className="flex gap-2">
                    <input type="text" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Image URL or upload a file" className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500" />
                    <label className={`px-4 py-3 bg-slate-600 rounded-xl cursor-pointer hover:bg-slate-500 transition-colors flex items-center gap-2 ${uploadingImage ? 'opacity-50' : ''}`}>
                      <Upload className="w-5 h-5 text-white" />
                      <span className="text-white text-sm hidden md:inline">Upload</span>
                      <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/jpg" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                    </label>
                    {form.image && (
                      <button onClick={removeImage} className="px-3 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  {uploadingImage && (
                    <div className="mt-2">
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div className="bg-accent-red h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{Math.round(uploadProgress)}% uploaded</p>
                    </div>
                  )}
                  <p className="text-slate-500 text-xs mt-2">Supported formats: JPEG, PNG, GIF, WEBP. Max size: 10MB</p>
                </div>
                {imagePreview && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-700 flex-shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
            
            <div><label className="block text-slate-400 text-sm mb-2">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white">{STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
            <div><label className="flex items-center gap-3 cursor-pointer mt-6"><input type="checkbox" checked={form.isRecurring} onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-slate-300 text-sm font-medium flex items-center gap-2"><Repeat className="w-4 h-4" />Create recurring event series</span></label></div>
          </div>
          <div><label className="block text-slate-400 text-sm mb-2">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white resize-none" /></div>
          
          <div className="border-t border-slate-700 pt-4"><h4 className="text-white font-semibold mb-3 flex items-center gap-2"><DollarSign className="w-5 h-5 text-accent-red" />Payment Settings</h4><label className="flex items-center gap-3 cursor-pointer mb-4"><input type="checkbox" checked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-slate-300 text-sm font-medium">This is a paid event</span></label>
          {form.isPaid && (<div className="grid md:grid-cols-2 gap-4"><div><label className="block text-slate-400 text-sm mb-2">Price *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white" /></div><div><label className="block text-slate-400 text-sm mb-2">Currency</label><select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"><option value="ZMW">Zambian Kwacha (ZMW)</option><option value="USD">US Dollar (USD)</option></select></div></div>)}</div>
          
          <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-slate-300 text-sm font-medium">Show in Featured Carousel on Dashboard</span></label>
          
          <div className="flex gap-3"><button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl">{isSubmitting ? 'Saving...' : (editingEvent ? 'Update Event' : 'Add Event')}</button><button onClick={cancelEdit} className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl">Cancel</button></div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white" /></div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"><option value="all">All Status ({events.length})</option><option value="published">Published ({getStatusCount('published')})</option><option value="draft">Draft ({getStatusCount('draft')})</option><option value="cancelled">Cancelled ({getStatusCount('cancelled')})</option></select>
              {(searchTerm || statusFilter !== 'all') && <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm">Clear Filters</button>}
            </div>
            {selectedIds.size > 0 && <button onClick={() => setShowBulkActions(true)} className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white px-4 py-2 rounded-lg"><Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})</button>}
          </div>

          {showBulkActions && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-slate-800 border border-accent-red/30 rounded-2xl p-6 max-w-md w-full"><div className="flex justify-between mb-4"><h3 className="text-xl font-bold text-accent-red">Bulk Actions</h3><button onClick={() => setShowBulkActions(false)} className="text-slate-400 hover:text-white">✕</button></div><p className="text-slate-300 mb-4">{selectedIds.size} events selected</p><div className="space-y-2"><button onClick={() => handleBulkStatus('published')} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">Mark as Published</button><button onClick={() => handleBulkStatus('draft')} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg">Mark as Draft</button><button onClick={() => handleBulkStatus('cancelled')} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">Mark as Cancelled</button><button onClick={handleBulkDelete} className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">Delete All</button></div></div></div>)}

          {showRecurringModal && (<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-slate-800 border border-accent-red/30 rounded-2xl p-6 max-w-md w-full"><div className="flex justify-between mb-4"><h3 className="text-xl font-bold text-accent-red">Create Recurring Events</h3><button onClick={() => setShowRecurringModal(false)} className="text-slate-400 hover:text-white">✕</button></div><p className="text-slate-300 mb-2">How many events to create?</p><input type="number" value={recurringCount} onChange={(e) => setRecurringCount(parseInt(e.target.value) || 1)} min={1} max={12} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white mb-4" /><div className="flex gap-3"><button onClick={createRecurringEvents} className="flex-1 bg-accent-red hover:bg-accent-red/90 text-white py-2 rounded-lg">Create {recurringCount} Events</button><button onClick={() => setShowRecurringModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Cancel</button></div></div></div>)}

          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50"><tr className="border-b border-slate-700"><th className="px-6 py-4 text-left"><button onClick={handleSelectAll}>{selectedIds.size === filteredEvents.length && filteredEvents.length > 0 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button></th><th className="text-left px-6 py-4 text-slate-400">Event</th><th className="text-left px-6 py-4 text-slate-400">Date</th><th className="text-left px-6 py-4 text-slate-400">Location</th><th className="text-left px-6 py-4 text-slate-400">Status</th><th className="text-left px-6 py-4 text-slate-400">Price</th><th className="text-left px-6 py-4 text-slate-400">Actions</th></tr></thead>
                <tbody>{filteredEvents.map((event) => (<tr key={event.id} className="border-b border-slate-700/50 hover:bg-slate-700/30"><td className="px-6 py-4"><button onClick={() => handleSelectOne(event.id)}>{selectedIds.has(event.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button></td><td className="px-6 py-4"><div className="flex items-center gap-2"><h3 className="text-white font-medium">{event.title}</h3>{event.featured && <span className="bg-accent-red/20 text-accent-red px-2 py-0.5 rounded text-xs">Featured</span>}</div></td><td className="px-6 py-4 text-slate-300">{event.date}</td><td className="px-6 py-4 text-slate-300">{event.location}</td><td className="px-6 py-4">{getStatusBadge(event.status)}</td><td className="px-6 py-4">{event.isPaid ? <span className="text-green-400">{event.currency} {event.price}</span> : <span className="text-slate-400">Free</span>}</td><td className="px-6 py-4"><div className="flex gap-2"><button onClick={() => startEdit(event)} className="p-1.5 hover:bg-blue-500/20 rounded-lg"><Edit className="w-4 h-4 text-blue-400" /></button><button onClick={() => duplicateEvent(event)} className="p-1.5 hover:bg-purple-500/20 rounded-lg"><Copy className="w-4 h-4 text-purple-400" /></button><button onClick={() => handleDelete(event.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button></div></td></tr>))}</tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
