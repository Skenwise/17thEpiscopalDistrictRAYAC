import { useEffect, useState, useRef } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Upload, Link, Trash2, Download, FileText, Music, BookOpen, Edit, X, Search, Filter, CheckSquare, Square } from 'lucide-react';

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

const TYPE_OPTIONS = ['PDF', 'Audio', 'Video', 'Other'];

export default function ResourcesAdmin() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [uploadType, setUploadType] = useState<'file' | 'link'>('link');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
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
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
      setResources(data);
      setFilteredResources(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...resources];
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }
    
    setFilteredResources(filtered);
  }, [searchTerm, typeFilter, resources]);

  const resetForm = () => {
    setForm({ title: '', description: '', type: 'PDF', url: '' });
    setSelectedFile(null);
    setUploadProgress(0);
    setEditingResource(null);
    setUploadType('link');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (resource: Resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title,
      description: resource.description || '',
      type: resource.type,
      url: resource.url,
    });
    setUploadType(resource.uploadType);
    setActiveTab('add');
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (uploadType === 'link' && !form.url.trim()) { setError('URL is required.'); return; }
    if (uploadType === 'file' && !selectedFile && !editingResource) { setError('Please select a file.'); return; }

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

      const resourceData = {
        title: form.title,
        description: form.description,
        type: form.type,
        url: downloadUrl,
        storagePath: uploadType === 'file' ? storagePath : '',
        uploadType,
        updatedAt: serverTimestamp(),
      };

      if (editingResource) {
        // If updating and there was an old file, delete it
        if (editingResource.storagePath && uploadType === 'file' && selectedFile) {
          await deleteObject(ref(storage, editingResource.storagePath));
        }
        await updateDoc(doc(db, 'resources', editingResource.id), resourceData);
        setSuccess('Resource updated successfully!');
      } else {
        await addDoc(collection(db, 'resources'), {
          ...resourceData,
          createdAt: serverTimestamp(),
        });
        setSuccess('Resource added successfully!');
      }

      resetForm();
      fetchResources();
      setTimeout(() => {
        setSuccess('');
        setActiveTab('list');
        setEditingResource(null);
      }, 2000);
    } catch (error) {
      console.error(error);
      setError('Failed to save resource. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (resource: Resource) => {
    if (confirm(`Delete "${resource.title}"?`)) {
      try {
        if (resource.storagePath) {
          await deleteObject(ref(storage, resource.storagePath));
        }
        await deleteDoc(doc(db, 'resources', resource.id));
        fetchResources();
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(resource.id);
          return newSet;
        });
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedIds.size} resources?`)) {
      for (const id of selectedIds) {
        const resource = resources.find(r => r.id === id);
        if (resource?.storagePath) {
          await deleteObject(ref(storage, resource.storagePath));
        }
        await deleteDoc(doc(db, 'resources', id));
      }
      fetchResources();
      setSelectedIds(new Set());
      setShowBulkActions(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredResources.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResources.map(r => r.id)));
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

  const getIcon = (type: string) => {
    switch (type) {
      case 'Audio': return <Music className="w-5 h-5" />;
      case 'PDF': return <FileText className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getTypeCount = (type: string) => {
    return resources.filter(r => r.type === type).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Resources Manager</h2>
          <p className="text-slate-400 text-sm">{resources.length} total resources • {filteredResources.length} shown</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'list' && (
            <button
              onClick={() => { resetForm(); setActiveTab('add'); }}
              className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              <Upload className="w-5 h-5" /> Add Resource
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-white">{resources.length}</p>
          <p className="text-slate-400 text-xs">Total</p>
        </div>
        {TYPE_OPTIONS.map(type => (
          <div key={type} className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-white">{getTypeCount(type)}</p>
            <p className="text-slate-400 text-xs">{type}</p>
          </div>
        ))}
      </div>

      {activeTab === 'add' ? (
        // Add/Edit Form
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">
              {editingResource ? 'Edit Resource' : 'Add New Resource'}
            </h3>
            <button onClick={() => { resetForm(); setActiveTab('list'); }} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

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
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Brief description"
              rows={2}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red resize-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as Resource['type'] })}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-accent-red"
            >
              {TYPE_OPTIONS.map(type => <option key={type} value={type}>{type}</option>)}
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
              <label className="block text-slate-400 text-sm mb-2">File {!editingResource && '*'}</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white file:bg-accent-red file:text-white file:border-0 file:rounded-lg file:px-4 file:py-1 file:mr-4 file:cursor-pointer"
              />
              {editingResource && editingResource.uploadType === 'file' && !selectedFile && (
                <p className="text-slate-400 text-xs mt-1">Current file exists. Choose a new file to replace it.</p>
              )}
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

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all"
            >
              {isSubmitting ? 'Saving...' : (editingResource ? 'Update Resource' : 'Add Resource')}
            </button>
            <button
              onClick={() => { resetForm(); setActiveTab('list'); }}
              className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // List View
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-accent-red"
              >
                <option value="all">All Types ({resources.length})</option>
                {TYPE_OPTIONS.map(type => (
                  <option key={type} value={type}>{type} ({getTypeCount(type)})</option>
                ))}
              </select>
              {(searchTerm || typeFilter !== 'all') && (
                <button
                  onClick={() => { setSearchTerm(''); setTypeFilter('all'); }}
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

          {/* Resources Table */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50">
                  <tr className="border-b border-slate-700">
                    <th className="px-6 py-4 text-left">
                      <button onClick={handleSelectAll} className="text-slate-400 hover:text-white">
                        {selectedIds.size === filteredResources.length && filteredResources.length > 0 ? 
                          <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />
                        }
                      </button>
                    </th>
                    <th className="text-left px-6 py-4 text-slate-400 font-semibold">Type</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-semibold">Title</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-semibold">Description</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-semibold">Source</th>
                    <th className="text-left px-6 py-4 text-slate-400 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No resources found</td></tr>
                  ) : (
                    filteredResources.map((resource) => (
                      <tr key={resource.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <button onClick={() => handleSelectOne(resource.id)} className="text-slate-400 hover:text-white">
                            {selectedIds.has(resource.id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-accent-red">{getIcon(resource.type)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-medium">{resource.title}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">
                          {resource.description || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded ${resource.uploadType === 'file' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {resource.uploadType === 'file' ? 'Uploaded' : 'External Link'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                              <Download className="w-4 h-4" />
                            </a>
                            <button onClick={() => startEdit(resource)} className="p-1.5 hover:bg-blue-500/20 rounded-lg text-blue-400">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(resource)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400">
                              <Trash2 className="w-4 h-4" />
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
        </>
      )}

      {/* Bulk Delete Modal */}
      {showBulkActions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-accent-red/30 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-accent-red">Confirm Bulk Delete</h3>
              <button onClick={() => setShowBulkActions(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-slate-300 mb-2">Delete <span className="text-accent-red font-bold">{selectedIds.size}</span> resources?</p>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone. Files will be removed from storage.</p>
            <div className="flex gap-3">
              <button onClick={handleBulkDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">Yes, Delete</button>
              <button onClick={() => setShowBulkActions(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
