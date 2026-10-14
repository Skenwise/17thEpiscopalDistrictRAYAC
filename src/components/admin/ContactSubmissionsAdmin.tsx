import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, Mail, Phone, User, MessageSquare, Eye } from 'lucide-react';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
  createdAt?: any;
}

export default function ContactSubmissionsAdmin() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);

  const fetchSubmissions = async () => {
    try {
      const q = query(collection(db, 'contact_submissions'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setSubmissions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactSubmission)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this submission?')) {
      await deleteDoc(doc(db, 'contact_submissions', id));
      fetchSubmissions();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Contact Submissions</h2>
        <p className="text-slate-400 text-sm">{submissions.length} total messages</p>
      </div>

      {isLoading ? (
        <p className="text-slate-400">Loading...</p>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl">
          <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No contact submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-accent-red/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-accent-red/20 p-2 rounded-lg">
                      <User className="w-5 h-5 text-accent-red" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{sub.name}</p>
                      <p className="text-slate-400 text-sm">{sub.email}</p>
                    </div>
                  </div>
                  {sub.phone && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                      <Phone className="w-4 h-4" />
                      <span>{sub.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                    <Mail className="w-4 h-4" />
                    <span>Interested in: {sub.interest}</span>
                  </div>
                  <p className="text-slate-300 text-sm bg-slate-700/50 p-3 rounded-lg mt-2">
                    {sub.message}
                  </p>
                  <p className="text-slate-500 text-xs mt-2">
                    {sub.createdAt?.toDate?.()?.toLocaleString() || 'N/A'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(sub)} className="p-2 hover:bg-blue-500/20 rounded-lg text-slate-400 hover:text-blue-400">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(sub.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-accent-red/30 rounded-2xl p-6 max-w-lg w-full">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold text-accent-red">Contact Details</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-3">
              <p><span className="text-slate-400">Name:</span> <span className="text-white">{selected.name}</span></p>
              <p><span className="text-slate-400">Email:</span> <span className="text-white">{selected.email}</span></p>
              <p><span className="text-slate-400">Phone:</span> <span className="text-white">{selected.phone || 'N/A'}</span></p>
              <p><span className="text-slate-400">Interest:</span> <span className="text-white">{selected.interest}</span></p>
              <p><span className="text-slate-400">Message:</span></p>
              <p className="text-white bg-slate-700 p-3 rounded-lg">{selected.message}</p>
              <p className="text-slate-500 text-xs">{selected.createdAt?.toDate?.()?.toLocaleString()}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => window.location.href = `mailto:${selected.email}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">Reply via Email</button>
              <button onClick={() => setSelected(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
