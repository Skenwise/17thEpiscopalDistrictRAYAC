import { useEffect, useState } from 'react';
import { collection, getDocs, deleteDoc, updateDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Trash2, CheckCircle, XCircle, Eye, Mail, Phone } from 'lucide-react';

interface Application {
  id: string;
  userName: string;
  userEmail: string;
  opportunityTitle: string;
  location: string;
  timeCommitment: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
}

export default function VolunteersAdmin() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchApplications = async () => {
    try {
      const q = query(collection(db, 'volunteer_applications'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setApplications(snap.docs.map(doc => ({ id: doc.id, ...doc.data(), status: doc.data().status || 'pending' } as Application)));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this application?')) {
      await deleteDoc(doc(db, 'volunteer_applications', id));
      fetchApplications();
    }
  };

  const handleStatus = async (id: string, status: 'approved' | 'rejected') => {
    await updateDoc(doc(db, 'volunteer_applications', id), { status });
    fetchApplications();
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'pending') return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">Pending</span>;
    if (status === 'approved') return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">Approved</span>;
    return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">Rejected</span>;
  };

  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-bold text-white">Volunteer Applications</h2><p className="text-slate-400 text-sm">{applications.length} total applications</p></div>

      {isLoading ? <p className="text-slate-400">Loading...</p> : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50">
                <tr className="border-b border-slate-700">
                  <th className="text-left px-6 py-4 text-slate-400 font-semibold">Member</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-semibold">Role</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-semibold">Location</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-semibold">Status</th>
                  <th className="text-left px-6 py-4 text-slate-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{app.userName}</p>
                      <p className="text-slate-400 text-xs">{app.userEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-accent-red font-medium">{app.opportunityTitle}</td>
                    <td className="px-6 py-4 text-slate-400">{app.location}</td>
                    <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setSelectedApp(app)} className="p-1.5 hover:bg-blue-500/20 rounded-lg text-blue-400"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleStatus(app.id, 'approved')} className="p-1.5 hover:bg-green-500/20 rounded-lg text-green-400"><CheckCircle className="w-4 h-4" /></button>
                        <button onClick={() => handleStatus(app.id, 'rejected')} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400"><XCircle className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(app.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-accent-red/30 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between mb-4"><h3 className="text-xl font-bold text-accent-red">Application Details</h3><button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-white">✕</button></div>
            <div className="space-y-3">
              <p><span className="text-slate-400">Name:</span> <span className="text-white">{selectedApp.userName}</span></p>
              <p><span className="text-slate-400">Email:</span> <span className="text-white">{selectedApp.userEmail}</span></p>
              <p><span className="text-slate-400">Role:</span> <span className="text-accent-red">{selectedApp.opportunityTitle}</span></p>
              <p><span className="text-slate-400">Location:</span> <span className="text-white">{selectedApp.location}</span></p>
              <p><span className="text-slate-400">Commitment:</span> <span className="text-white">{selectedApp.timeCommitment}</span></p>
              <p><span className="text-slate-400">Status:</span> {getStatusBadge(selectedApp.status)}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => window.location.href = `mailto:${selectedApp.userEmail}`} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"><Mail className="w-4 h-4" />Email</button>
              <button onClick={() => setSelectedApp(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
