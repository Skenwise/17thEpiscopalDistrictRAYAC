import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/hooks/useAdmin';
import { Trash2, Plus, Shield } from 'lucide-react';

interface Admin {
  id: string;
  email: string;
  addedBy: string;
  createdAt?: any;
}

const DEFAULT_ADMINS = ['pgilbertmwanza@gmail.com', 'sage.kona.dev@gmail.com'];

export default function AdminsManager() {
  const { adminEmail } = useAdmin();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAdmins = async () => {
    try {
      const snap = await getDocs(collection(db, 'admins'));
      setAdmins(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Admin)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleAddAdmin = async () => {
    if (!newEmail.trim()) return;
    setError('');
    setSuccess('');
    setIsAdding(true);
    try {
      await addDoc(collection(db, 'admins'), {
        email: newEmail.trim(),
        addedBy: adminEmail,
        createdAt: serverTimestamp(),
      });
      setSuccess(`${newEmail} added as admin.`);
      setNewEmail('');
      fetchAdmins();
    } catch (error) {
      setError('Failed to add admin. Try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    try {
      await deleteDoc(doc(db, 'admins', adminId));
      fetchAdmins();
    } catch (error) {
      setError('Failed to remove admin.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Manage Admins</h2>
        <p className="text-slate-400 text-sm">Add or remove admin access</p>
      </div>

      {/* Default Admins */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent-red" /> Default Admins
        </h3>
        <div className="space-y-3">
          {DEFAULT_ADMINS.map((email) => (
            <div key={email} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <p className="text-white text-sm">{email}</p>
              <span className="text-xs text-accent-red font-semibold bg-accent-red/10 px-2 py-1 rounded">Default</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Admin */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Add New Admin</h3>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-400 text-sm mb-4">{success}</p>}
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="admin@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
          />
          <button
            onClick={handleAddAdmin}
            disabled={isAdding || !newEmail.trim()}
            className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            {isAdding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Additional Admins */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Additional Admins</h3>
        {isLoading ? <p className="text-slate-400">Loading...</p> : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div>
                  <p className="text-white text-sm">{admin.email}</p>
                  <p className="text-slate-500 text-xs">Added by {admin.addedBy}</p>
                </div>
                <button
                  onClick={() => handleRemoveAdmin(admin.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {admins.length === 0 && (
              <p className="text-slate-400 text-sm">No additional admins added yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}