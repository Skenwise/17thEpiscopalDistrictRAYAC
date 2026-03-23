import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Upload, Link, Trash2, Download, FileText, Music, BookOpen } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'PDF' | 'Audio' | 'Video' | 'Other';
  url: string;
  storagePath?: string;
  uploadType: 'file' | 'link';
  createdAt?: any;
}

export default function ResourcesAdmin() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [uploadType, setUploadType] = useState<'file' | 'link'>('link');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'PDF' as Resource['type'],
    url: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchResources = async () => {
    try {
      const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setResources(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (uploadType === 'link' && !form.url.trim()) { setError('URL is required.'); return; }
    if (uploadType === 'file' && !selectedFile) { setError('Please select a file.'); return; }

    setError('');
    setIsSubmitting(true);

    try {
      let downloadUrl = form.url;
      let storagePath = '';

      if (uploadType === 'file' && selectedFile) {
        storagePath = `resources/${Date.now()}_${selectedFile.name}`;
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
            },
            reject,
            async () => {
              downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve();
            }
          );
        });
      }

      await addDoc(collection(db, 'resources'), {
        title: form.title,
        description: form.description,
        type: form.type,
        url: downloadUrl,
        storagePath,
        uploadType,
        createdAt: serverTimestamp(),
      });

      setSuccess('Resource added successfully!');
      setForm({ title: '', description: '', type: 'PDF', url: '' });
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchResources();
      setActiveTab('list');
    } catch (error) {
      console.error(error);
      setError('Failed to add resource. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (resource: Resource) => {
    try {
      if (resource.storagePath) {
        await deleteObject(ref(storage, resource.storagePath));
      }
      await deleteDoc(doc(db, 'resources', resource.id));
      fetchResources();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Audio': return <Music className="w-5 h-5" />;
      case 'PDF': return <FileText className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Resources Manager</h2>
          <p className="text-slate-400 text-sm">{resources.length} total resources</p>
        </div>
        <button
          onClick={() => setActiveTab(activeTab === 'list' ? 'add' : 'list')}
          className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white font-semibold px-6 py-3 rounded-xl transition-all"
        >
          {activeTab === 'list' ? <><Upload className="w-5 h-5" /> Add Resource</> : '← Back to List'}
        </button>
      </div>

      {activeTab === 'add' ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
          <h3 className="text-white font-semibold text-lg">Add New Resource</h3>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <div>
            <label className="block text-slate-400 text-sm mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Resource title"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as Resource['type'] })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-accent-red"
            >
              <option value="PDF">PDF</option>
              <option value="Audio">Audio</option>
              <option value="Video">Video</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Upload Type Toggle */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Upload Method</label>
            <div className="flex gap-3">
              <button
                onClick={() => setUploadType('link')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  uploadType === 'link' ? 'bg-accent-red text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                <Link className="w-4 h-4" /> External Link
              </button>
              <button
                onClick={() => setUploadType('file')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  uploadType === 'file' ? 'bg-accent-red text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                <Upload className="w-4 h-4" /> Upload File
              </button>
            </div>
          </div>

          {uploadType === 'link' ? (
            <div>
              <label className="block text-slate-400 text-sm mb-2">URL *</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
              />
            </div>
          ) : (
            <div>
              <label className="block text-slate-400 text-sm mb-2">File *</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white file:bg-accent-red file:text-white file:border-0 file:rounded-lg file:px-4 file:py-1 file:mr-4 file:cursor-pointer"
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-accent-red h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{uploadProgress}% uploaded</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all"
          >
            {isSubmitting ? 'Saving...' : 'Add Resource'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading ? <p className="text-slate-400">Loading...</p> : (
            <>
              {resources.map((resource) => (
                <div key={resource.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-between gap-4 hover:border-accent-red/30 transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-accent-red">{getIcon(resource.type)}</div>
                    <div>
                      <h3 className="text-white font-semibold">{resource.title}</h3>
                      <p className="text-slate-400 text-sm">{resource.description}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="bg-primary/20 text-accent-red px-2 py-0.5 rounded text-xs">{resource.type}</span>
                        <span className="bg-slate-700 text-slate-400 px-2 py-0.5 rounded text-xs">{resource.uploadType === 'file' ? 'Uploaded' : 'Link'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                    <a>
                      <Download className="w-5 h-5" />
                    </a>
                    <button
                      onClick={() => handleDelete(resource)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
              {resources.length === 0 && (
                <p className="text-slate-400 text-center py-8">No resources yet. Add your first one!</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}