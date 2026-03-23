import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Enrollment {
  id: string;
  userName: string;
  userEmail: string;
  trainingTitle: string;
  trainingLevel: string;
  createdAt?: any;
}

export default function EnrollmentsAdmin() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'training_enrollments'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setEnrollments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Enrollment)));
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
        <h2 className="text-2xl font-bold text-white">Training Enrollments</h2>
        <p className="text-slate-400 text-sm">{enrollments.length} total enrollments</p>
      </div>

      {isLoading ? <p className="text-slate-400">Loading...</p> : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Member</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Training</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Level</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{e.userName}</p>
                    <p className="text-slate-400">{e.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-accent-red font-medium">{e.trainingTitle}</td>
                  <td className="px-6 py-4">
                    <span className="bg-primary/20 text-accent-red px-2 py-1 rounded text-xs font-semibold">{e.trainingLevel}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {e.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No enrollments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}