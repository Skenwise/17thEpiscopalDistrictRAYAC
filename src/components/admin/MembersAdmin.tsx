import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Mail, Phone, Church } from 'lucide-react';

interface Member {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  conference?: string;
  district?: string;
  localChurch?: string;
  premiumUnlocked?: boolean;
  createdAt?: any;
}

export default function MembersAdmin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setMembers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
      } catch (error) {
        console.error('Failed to fetch members:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const filtered = members.filter(m =>
    m.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    m.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.conference?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Members</h2>
          <p className="text-slate-400 text-sm">{members.length} total members</p>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search by name, email or conference..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red"
      />

      {isLoading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((member) => (
            <div key={member.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-accent-red/30 transition-all">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent-red flex items-center justify-center text-white font-bold text-lg">
                    {member.displayName?.charAt(0).toUpperCase() || 'M'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{member.displayName}</h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Mail className="w-4 h-4" />
                      <span>{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  {member.conference && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Church className="w-4 h-4 text-accent-red" />
                      <span>{member.conference}</span>
                    </div>
                  )}
                  {member.localChurch && (
                    <p className="text-slate-500">{member.localChurch}</p>
                  )}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    member.premiumUnlocked
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {member.premiumUnlocked ? 'Premium' : 'Free'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-slate-400 text-center py-8">No members found.</p>
          )}
        </div>
      )}
    </div>
  );
}