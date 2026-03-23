import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PrayerRequest {
  id: string;
  userName: string;
  userEmail: string;
  message: string;
  createdAt?: any;
}

export default function PrayerRequestsAdmin() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'prayer_requests'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PrayerRequest)));
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
        <h2 className="text-2xl font-bold text-white">Prayer Requests</h2>
        <p className="text-slate-400 text-sm">{requests.length} total requests</p>
      </div>

      {isLoading ? <p className="text-slate-400">Loading...</p> : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-accent-red/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{req.userName}</p>
                  <p className="text-slate-400 text-sm">{req.userEmail}</p>
                </div>
                <p className="text-slate-500 text-xs">
                  {req.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                </p>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">{req.message}</p>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-slate-400 text-center py-8">No prayer requests yet.</p>
          )}
        </div>
      )}
    </div>
  );
}