import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Application {
  id: string;
  userName: string;
  userEmail: string;
  opportunityTitle: string;
  location: string;
  timeCommitment: string;
  createdAt?: any;
}

export default function VolunteersAdmin() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'volunteer_applications'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setApplications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application)));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Volunteer Applications</h2>
        <p className="text-slate-400 text-sm">{applications.length} total applications</p>
      </div>

      {isLoading ? <p className="text-slate-400">Loading...</p> : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Member</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Role</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Location</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Commitment</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Applied</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{app.userName}</p>
                    <p className="text-slate-400">{app.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-accent-red font-medium">{app.opportunityTitle}</td>
                  <td className="px-6 py-4 text-slate-400">{app.location}</td>
                  <td className="px-6 py-4 text-slate-400">{app.timeCommitment}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {app.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400">No applications yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}