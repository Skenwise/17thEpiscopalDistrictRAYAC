import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Plus, Trash2, Edit, X, Upload, DollarSign } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  image: string;
  category: string;
  inStock: boolean;
  createdAt?: any;
}

const CATEGORIES = ['Hymn Book', 'Books', 'Merchandise', 'Digital Downloads', 'Other'];

export default function StoreAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: '',
    price: 0,
    currency: 'ZMW',
    description: '',
    image: '',
    category: 'Hymn Book',
    inStock: true,
  });

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'store_products'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const imageRef = ref(storage, `store/${Date.now()}_${file.name}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      setForm(prev => ({ ...prev, image: url }));
      setSuccess('Image uploaded successfully!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      setError('Failed to upload image. Try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      price: 0,
      currency: 'ZMW',
      description: '',
      image: '',
      category: 'Hymn Book',
      inStock: true,
    });
    setEditingItem(null);
    setError('');
  };

  const startEdit = (item: Product) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      price: item.price,
      currency: item.currency,
      description: item.description,
      image: item.image,
      category: item.category,
      inStock: item.inStock,
    });
    setActiveTab('add');
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      setError('Name and description are required.');
      return;
    }
    if (form.price <= 0) {
      setError('Price must be greater than 0.');
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
        await updateDoc(doc(db, 'store_products', editingItem.id), data);
        setSuccess('Product updated successfully!');
      } else {
        await addDoc(collection(db, 'store_products'), {
          ...data,
          createdAt: serverTimestamp(),
        });
        setSuccess('Product added successfully!');
      }
      resetForm();
      fetchProducts();
      setTimeout(() => { 
        setSuccess(''); 
        setActiveTab('list');
        setEditingItem(null);
      }, 2000);
    } catch (error) {
      setError('Failed to save product. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'store_products', id));
        fetchProducts();
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
          <h2 className="text-2xl font-bold text-white">Store Manager</h2>
          <p className="text-slate-400 text-sm">{products.length} total products</p>
        </div>
        {activeTab === 'list' && (
          <button
            onClick={() => { resetForm(); setActiveTab('add'); }}
            className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" /> Add Product
          </button>
        )}
      </div>

      {activeTab === 'add' ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">
              {editingItem ? 'Edit Product' : 'Add New Product'}
            </h3>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-400 text-sm mb-2">Product Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="AME Church Hymn Book"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors" />
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Price *</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                placeholder="50"
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

            <div>
              <label className="block text-slate-400 text-sm mb-2">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-accent-red transition-colors">
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-sm mb-2">Product Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="Image URL or upload"
                  className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red transition-colors"
                />
                <label className={`px-4 py-3 bg-slate-600 rounded-xl cursor-pointer hover:bg-slate-500 transition-colors ${uploadingImage ? 'opacity-50' : ''}`}>
                  <Upload className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                </label>
              </div>
              {uploadingImage && <p className="text-slate-400 text-xs mt-1">Uploading...</p>}
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer mt-6">
                <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                  className="w-4 h-4 rounded" />
                <span className="text-slate-300 text-sm font-medium">In Stock</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2">Description *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Product description..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red resize-none transition-colors" />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="flex-1 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all">
              {isSubmitting ? 'Saving...' : (editingItem ? 'Update Product' : 'Add Product')}
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
              {products.map((item) => (
                <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center justify-between gap-4 hover:border-accent-red/30 transition-all">
                  <div className="flex gap-4 flex-1">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{item.name}</h3>
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs">{item.category}</span>
                        {!item.inStock && (
                          <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs">Out of Stock</span>
                        )}
                      </div>
                      <p className="text-green-400 text-sm font-semibold">{item.currency} {item.price}</p>
                      <p className="text-slate-400 text-sm">{item.description.substring(0, 100)}...</p>
                    </div>
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
              {products.length === 0 && (
                <p className="text-slate-400 text-center py-8">No products yet. Add your first one!</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
