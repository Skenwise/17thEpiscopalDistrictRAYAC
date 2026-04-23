import { useEffect, useState } from 'react';
import { 
  collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, orderBy, query 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Plus, Trash2, Edit, X, DollarSign, Link as LinkIcon, Upload, FileText, Video } from 'lucide-react';

// Updated Training interface with e-learning fields
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
  // E-learning fields
  isElearning: boolean;
  videoUrl: string;
  materials: Array<{
    title: string;
    url: string;
    type: 'file' | 'link';
  }>;
  createdAt?: any;
}

// Material entry for form handling
interface MaterialEntry {
  title: string;
  url: string;
  type: 'file' | 'link';
  file?: File;
}

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Leadership', 'Certificate'];
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

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
    // E-learning fields
    isElearning: false,
    videoUrl: '',
    materials: [] as Array<{ title: string; url: string; type: 'file' | 'link' }>,
  });

  // State for adding new materials
  const [newMaterial, setNewMaterial] = useState<MaterialEntry>({
    title: '',
    url: '',
    type: 'link',
  });
  const [isUploadingMaterial, setIsUploadingMaterial] = useState(false);

  const fetchTrainings = async () => {
    try {
      const q = query(collection(db, 'trainings'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setTrainings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Training)));
    } catch (error) {
      console.error('Failed to fetch trainings:', error);
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
      isElearning: false,
      videoUrl: '',
      materials: [],
    });
    setNewMaterial({ title: '', url: '', type: 'link' });
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
      isElearning: item.isElearning || false,
      videoUrl: item.videoUrl || '',
      materials: item.materials || [],
    });
    setActiveTab('add');
  };

  // Handle file upload to Firebase Storage
  const handleFileUpload = async (file: File, title: string): Promise<string | null> => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('Only PDF, DOC, DOCX, PPT, PPTX files are allowed.');
      return null;
    }

    try {
      setIsUploadingMaterial(true);
      const fileRef = ref(storage, `training-materials/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      return await getDownloadURL(fileRef);
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload file. Please try again.');
      return null;
    } finally {
      setIsUploadingMaterial(false);
    }
  };

  // Add material to form state
  const addMaterial = async () => {
    if (!newMaterial.title.trim()) {
      setError('Material title is required.');
      return;
    }

    let url = newMaterial.url;

    if (newMaterial.type === 'file' && newMaterial.file) {
      const uploadedUrl = await handleFileUpload(newMaterial.file, newMaterial.title);
      if (!uploadedUrl) return;
      url = uploadedUrl;
    } else if (newMaterial.type === 'link' && !newMaterial.url.trim()) {
      setError('Please provide a valid URL for the material.');
      return;
    }

    setForm(prev => ({
      ...prev,
      materials: [...prev.materials, { title: newMaterial.title, url, type: newMaterial.type }]
    }));

    setNewMaterial({ title: '', url: '', type: 'link' });
    setError('');
  };

  // Remove material from form state
  const removeMaterial = (index: number) => {
    setForm(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    // Validation for e-learning fields
    if (form.isElearning && !form.videoUrl.trim()) {
      setError('Video URL is required for e-learning courses.');
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
      console.error('Save failed:', error);
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
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Training description..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red resize-none transition-colors" />
          </div>

          {/* E-learning Toggle */}
          <div className="border-t border-slate-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.isElearning} 
                onChange={(e) => setForm({ ...form, isElearning: e.target.checked })}
                className="w-4 h-4 rounded accent-accent-red" 
              />
              <span className="text-slate-300 text-sm font-medium">This is an E-learning Course</span>
            </label>
          </div>

          {/* Conditional Fields based on isElearning */}
          {form.isElearning ? (
            <div className="space-y-4 bg-slate-700/30 p-4 rounded-xl border border-slate-600">
              <div>
                <label className="block text-slate-400 text-sm mb-2">Video URL (YouTube/Vimeo) *</label>
                <div className="relative">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="url" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full pl-10 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
                </div>
                <p className="text-slate-500 text-xs mt-1">Use the standard YouTube or Vimeo embed URL</p>
              </div>

              {/* Course Materials Section */}
              <div className="pt-4 border-t border-slate-600">
                <label className="block text-slate-300 text-sm font-medium mb-3">Course Materials</label>
                
                {/* Add Material Form */}
                <div className="grid md:grid-cols-4 gap-3 mb-3">
                  <div className="md:col-span-2">
                    <input type="text" value={newMaterial.title} onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
                      placeholder="Material title"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-accent-red" />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <select value={newMaterial.type} onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value as 'file'|'link', url: ''})}
                      className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-accent-red">
                      <option value="link">External Link</option>
                      <option value="file">Upload File</option>
                    </select>
                    {newMaterial.type === 'link' ? (
                      <input type="url" value={newMaterial.url} onChange={(e) => setNewMaterial({...newMaterial, url: e.target.value})}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-accent-red" />
                    ) : (
                      <input type="file" onChange={(e) => setNewMaterial({...newMaterial, file: e.target.files?.[0] || undefined})}
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-accent-red file:text-white hover:file:bg-accent-red/90" />
                    )}
                  </div>
                </div>
                <button onClick={addMaterial} disabled={isUploadingMaterial}
                  className="flex items-center gap-2 text-sm text-accent-red hover:text-accent-red/90 font-medium disabled:opacity-60">
                  <Plus className="w-4 h-4" /> {isUploadingMaterial ? 'Uploading...' : 'Add Material'}
                </button>

                {/* Materials List */}
                {form.materials.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {form.materials.map((mat, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          {mat.type === 'file' ? <FileText className="w-4 h-4 text-blue-400" /> : <LinkIcon className="w-4 h-4 text-green-400" />}
                          <div>
                            <p className="text-white text-sm font-medium">{mat.title}</p>
                            <p className="text-slate-500 text-xs truncate max-w-xs">{mat.url}</p>
                          </div>
                        </div>
                        <button onClick={() => removeMaterial(idx)} className="text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // In-person training fields (hidden when e-learning is enabled)
            <div className="grid md:grid-cols-2 gap-4">
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
                <input type="number" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: parseInt(e.target.value) || 50 })}
                  placeholder="50"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
              </div>
            </div>
          )}

          {/* Pricing Section */}
          <div className="border-t border-slate-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input type="checkbox" checked={form.isPaid} onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
                className="w-4 h-4 rounded accent-accent-red" />
              <span className="text-slate-300 text-sm font-medium">This is a paid training</span>
            </label>

            {form.isPaid && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      placeholder="100"
                      className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
                  </div>
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
                      {item.isElearning && (
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs">E-Learning</span>
                      )}
                      {item.isPaid && (
                        <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">Paid</span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm">{item.description.substring(0, 100)}...</p>
                    <p className="text-slate-500 text-xs mt-2">
                      {item.isElearning 
                        ? `Video course • ${item.materials?.length || 0} materials` 
                        : `Duration: ${item.duration} | Max: ${item.maxParticipants} participants`
                      }
                    </p>
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