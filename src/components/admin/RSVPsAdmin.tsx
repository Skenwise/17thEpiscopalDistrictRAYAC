import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface RSVP {
  id: string;
  userName: string;
  userEmail: string;
  eventTitle: string;
  eventDate: string;
  createdAt?: any;
}

export default function RSVPsAdmin() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(collection(db, 'rsvps'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setRsvps(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RSVP)));
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
        <h2 className="text-2xl font-bold text-white">Event RSVPs</h2>
        <p className="text-slate-400 text-sm">{rsvps.length} total RSVPs</p>
      </div>

      {isLoading ? <p className="text-slate-400">Loading...</p> : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Member</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Event</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Date</th>
                <th className="text-left px-6 py-4 text-slate-400 font-semibold">Registered</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((rsvp) => (
                <tr key={rsvp.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{rsvp.userName}</p>
                    <p className="text-slate-400">{rsvp.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-accent-red font-medium">{rsvp.eventTitle}</td>
                  <td className="px-6 py-4 text-slate-400">{rsvp.eventDate}</td>
                  <td className="px-6 py-4 text-slate-400">
                    {rsvp.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </td>
                </tr>
              ))}
              {rsvps.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No RSVPs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}