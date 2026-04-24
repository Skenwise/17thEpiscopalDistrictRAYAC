import { useEffect, useState } from 'react';
import { 
  collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, orderBy, query 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Plus, Trash2, Edit, X, Upload, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import ImageLightbox from '@/components/ui/ImageLightbox';

interface GalleryImage {
  id: string;
  title: string;
  image: string;
  storagePath: string;
  order: number;
  createdAt?: any;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  storagePath?: string;
  error?: string;
}

export default function MediaGalleryAdmin() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState<GalleryImage | null>(null);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  
  const [batchTitle, setBatchTitle] = useState('');
  const [useBatchTitle, setUseBatchTitle] = useState(true);

  const [form, setForm] = useState({
    title: '',
    image: '',
  });

  const fetchImages = async () => {
    try {
      const q = query(collection(db, 'gallery_images'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc, index) => ({ 
        id: doc.id, 
        ...doc.data(), 
        order: doc.data().order ?? index 
      } as GalleryImage));
      setImages(data);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchImages(); }, []);

  const resetForm = () => {
    setForm({ title: '', image: '' });
    setUploadingFiles([]);
    setUploadedImageUrls([]);
    setBatchTitle('');
    setEditingItem(null);
    setError('');
    setIsUploading(false);
  };

  const startEdit = (item: GalleryImage) => {
    setEditingItem(item);
    setForm({ title: item.title, image: item.image });
    setUploadedImageUrls([item.image]);
    setActiveTab('add');
  };

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    const newUploadingFiles: UploadingFile[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type: ${file.name}. Only JPEG, PNG, GIF, WEBP allowed.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`File too large: ${file.name}. Maximum size is 10MB.`);
        continue;
      }
      newUploadingFiles.push({
        file,
        progress: 0,
        status: 'pending'
      });
    }

    if (newUploadingFiles.length === 0) return;

    setUploadingFiles(newUploadingFiles);
    setIsUploading(true);
    setError('');
    setUploadedImageUrls([]);

    const urls: string[] = [];
    const updatedFiles = [...newUploadingFiles];

    for (let i = 0; i < updatedFiles.length; i++) {
      const uploadFile = updatedFiles[i];
      uploadFile.status = 'uploading';
      setUploadingFiles([...updatedFiles]);

      try {
        const timestamp = Date.now();
        const safeFileName = uploadFile.file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const storagePath = `gallery/${timestamp}_${i}_${safeFileName}`;
        const storageRef = ref(storage, storagePath);
        
        await uploadBytes(storageRef, uploadFile.file);
        const url = await getDownloadURL(storageRef);
        
        uploadFile.status = 'success';
        uploadFile.url = url;
        uploadFile.storagePath = storagePath;
        uploadFile.progress = 100;
        urls.push(url);
        
        setUploadingFiles([...updatedFiles]);
      } catch (err: any) {
        console.error(`Failed to upload ${uploadFile.file.name}:`, err);
        uploadFile.status = 'error';
        uploadFile.error = err.code === 'storage/unauthorized' 
          ? 'Permission denied' 
          : 'Upload failed';
        setUploadingFiles([...updatedFiles]);
      }
    }

    setUploadedImageUrls(urls);
    setIsUploading(false);

    if (useBatchTitle && batchTitle && urls.length > 0) {
      setForm({ ...form, title: batchTitle });
    }
  };

  const removeFileFromQueue = (index: number) => {
    const newFiles = uploadingFiles.filter((_, i) => i !== index);
    setUploadingFiles(newFiles);
    
    const newUrls = newFiles
      .filter(f => f.status === 'success' && f.url)
      .map(f => f.url as string);
    setUploadedImageUrls(newUrls);
  };

  const handleSubmit = async () => {
    if (!useBatchTitle && !form.title.trim()) {
      setError('Title is required.');
      return;
    }
    
    if (useBatchTitle && !batchTitle.trim() && !editingItem) {
      setError('Batch title is required.');
      return;
    }
    
    if (uploadedImageUrls.length === 0 && !editingItem) {
      setError('Please upload at least one image.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (editingItem) {
        const imageData = {
          title: form.title,
          image: uploadedImageUrls[0] || form.image,
          storagePath: editingItem.storagePath || '',
          updatedAt: serverTimestamp(),
        };

        if (uploadedImageUrls[0] && editingItem.storagePath && uploadedImageUrls[0] !== editingItem.image) {
          try {
            await deleteObject(ref(storage, editingItem.storagePath));
          } catch (e) {
            console.warn('Could not delete old image:', e);
          }
        }
        await updateDoc(doc(db, 'gallery_images', editingItem.id), imageData);
        setSuccess('Image updated successfully!');
      } else {
        const baseOrder = images.length;
        const successfulUploads = uploadingFiles.filter(f => f.status === 'success');
        
        for (let i = 0; i < successfulUploads.length; i++) {
          const uploadFile = successfulUploads[i];
          
          if (!uploadFile.url || !uploadFile.storagePath) continue;
          
          const title = useBatchTitle 
            ? `${batchTitle} ${successfulUploads.length > 1 ? `(${i + 1})` : ''}`.trim()
            : form.title;
          
          await addDoc(collection(db, 'gallery_images'), {
            title: title || uploadFile.file.name.replace(/\.[^/.]+$/, ''),
            image: uploadFile.url,
            storagePath: uploadFile.storagePath,
            order: baseOrder + i,
            createdAt: serverTimestamp(),
          });
        }
        
        setSuccess(`${successfulUploads.length} image${successfulUploads.length > 1 ? 's' : ''} added successfully!`);
      }

      resetForm();
      fetchImages();
      setTimeout(() => {
        setSuccess('');
        setActiveTab('list');
        setEditingItem(null);
      }, 2000);
    } catch (error: any) {
      console.error('Save failed:', error);
      setError(error.code === 'permission-denied'
        ? 'You do not have permission to save.'
        : 'Failed to save images. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: GalleryImage) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    
    try {
      if (item.storagePath) {
        try {
          await deleteObject(ref(storage, item.storagePath));
          console.log('Deleted from storage:', item.storagePath);
        } catch (e: any) {
          if (e.code === 'storage/object-not-found') {
            console.warn('File already deleted from storage:', item.storagePath);
          } else {
            throw e;
          }
        }
      }
      
      await deleteDoc(doc(db, 'gallery_images', item.id));
      console.log('Deleted from Firestore:', item.id);
      
      fetchImages();
      setSuccess('Image deleted successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error: any) {
      console.error('Failed to delete:', error);
      setError('Failed to delete image: ' + error.message);
    }
  };

  const moveImage = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const updatedImages = [...images];
    [updatedImages[index], updatedImages[newIndex]] = [updatedImages[newIndex], updatedImages[index]];

    for (let i = 0; i < updatedImages.length; i++) {
      await updateDoc(doc(db, 'gallery_images', updatedImages[i].id), { order: i });
    }

    fetchImages();
  };

  const cancelEdit = () => { 
    resetForm(); 
    setActiveTab('list'); 
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Media Gallery Manager</h2>
          <p className="text-slate-400 text-sm">{images.length} total images</p>
        </div>
        {activeTab === 'list' && (
          <button
            onClick={() => { resetForm(); setActiveTab('add'); }}
            className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" /> Add Images
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {activeTab === 'add' ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">
              {editingItem ? 'Edit Image' : 'Add New Images'}
            </h3>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">{error}</p>}

          {!editingItem && (
            <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={useBatchTitle}
                  onChange={(e) => setUseBatchTitle(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-accent-red focus:ring-accent-red"
                />
                <span>Use same title for all images</span>
              </label>
              
              {useBatchTitle ? (
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Batch Title *</label>
                  <input
                    type="text"
                    value={batchTitle}
                    onChange={(e) => setBatchTitle(e.target.value)}
                    placeholder="e.g., Annual Conference 2024"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
                  />
                  <p className="text-slate-500 text-xs mt-1">Images will be numbered automatically</p>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Default Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Image title"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
                  />
                </div>
              )}
            </div>
          )}

          {editingItem && (
            <div>
              <label className="block text-slate-400 text-sm mb-2">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Image title"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-400 text-sm mb-2">
              {editingItem ? 'Replace Image' : 'Select Images'} (JPEG, PNG, GIF, WEBP - Max 10MB each)
            </label>
            
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/jpg"
              onChange={handleMultipleImageUpload}
              multiple={!editingItem}
              disabled={isUploading}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white file:bg-accent-red file:text-white file:border-0 file:rounded-lg file:px-4 file:py-1 file:mr-4 file:cursor-pointer disabled:opacity-50"
            />

            {uploadingFiles.length > 0 && (
              <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                {uploadingFiles.map((file, index) => (
                  <div key={index} className="bg-slate-700/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {file.status === 'uploading' && (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent-red border-t-transparent" />
                        )}
                        {file.status === 'success' && (
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        )}
                        {file.status === 'error' && (
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                        <span className="text-white text-sm truncate">{file.file.name}</span>
                      </div>
                      {file.status !== 'uploading' && (
                        <button
                          onClick={() => removeFileFromQueue(index)}
                          className="text-slate-400 hover:text-red-400 ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {file.status === 'error' && (
                      <p className="text-red-400 text-xs mt-1">{file.error}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {uploadedImageUrls.length > 0 && (
              <div className="mt-4">
                <p className="text-slate-400 text-sm mb-2">
                  {uploadedImageUrls.length} image{uploadedImageUrls.length > 1 ? 's' : ''} ready
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {uploadedImageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
                        alt={`Preview ${index + 1}`} 
                        className="w-full h-20 object-cover rounded-lg border border-slate-600"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading || (uploadedImageUrls.length === 0 && !editingItem)}
              className="flex-1 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : editingItem ? 'Update Image' : `Add ${uploadedImageUrls.length} Image${uploadedImageUrls.length !== 1 ? 's' : ''}`}
            </button>
            <button
              onClick={cancelEdit}
              className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {isLoading ? (
            <p className="text-slate-400">Loading...</p>
          ) : images.length === 0 ? (
            <div className="text-center py-12 bg-slate-800/50 rounded-xl">
              <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No images in gallery yet.</p>
              <button
                onClick={() => { resetForm(); setActiveTab('add'); }}
                className="mt-4 bg-accent-red hover:bg-accent-red/90 text-white px-4 py-2 rounded-lg"
              >
                Add Your First Images
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-accent-red/30 transition-all group cursor-pointer"
                  onClick={() => {
                    setLightboxIndex(idx);
                    setLightboxOpen(true);
                  }}
                >
                  <div className="relative h-40 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveImage(idx, 'up'); }}
                          disabled={idx === 0}
                          className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 text-slate-400 hover:text-white"
                        >
                          ↑
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveImage(idx, 'down'); }}
                          disabled={idx === images.length - 1}
                          className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 text-slate-400 hover:text-white"
                        >
                          ↓
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                          className="p-1 hover:bg-blue-500/20 rounded text-slate-400 hover:text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                          className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxOpen && (
        <ImageLightbox
          images={images.map(img => ({ id: img.id, title: img.title, image: img.image }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}