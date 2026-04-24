import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Member {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  conference?: string;
  district?: string;
  localChurch?: string;
  premiumUnlocked?: boolean;
}

export default function DirectoryContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('displayName', 'asc'));
        const snap = await getDocs(q);
        const membersList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
        setMembers(membersList);
      } catch (error) {
        console.error('Failed to fetch members:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'M';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredMembers = members.filter(
    (member) =>
      member.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.conference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.localChurch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Members Directory</h2>
        <p className="text-accent-silver/70">Connect with other RAYAC members</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-silver/50" />
        <Input
          type="text"
          placeholder="Search members by name, email, conference, or church..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800 border-primary/30 text-accent-silver placeholder:text-accent-silver/50 rounded-lg"
        />
      </div>

      {members.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl">
          <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No members found.</p>
          <p className="text-slate-500 text-sm mt-1">Members will appear here once they join.</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-accent-silver/70">No members found matching your search.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent-red flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg shadow-primary/30">
                {getInitials(member.displayName || member.email || 'Member')}
              </div>
              <h3 className="text-lg font-semibold text-accent-red mb-1">
                {member.displayName || 'Member'}
              </h3>
              {member.conference && (
                <p className="text-accent-silver/70 text-sm mb-2">{member.conference}</p>
              )}
              {member.localChurch && (
                <p className="text-accent-silver/60 text-xs mb-3">{member.localChurch}</p>
              )}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-accent-silver/80 text-sm">
                  <Mail className="w-4 h-4 text-accent-red" />
                  <a href={`mailto:${member.email}`} className="hover:text-accent-red transition-colors truncate">
                    {member.email}
                  </a>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-accent-silver/80 text-sm">
                    <Phone className="w-4 h-4 text-accent-red" />
                    <a href={`tel:${member.phone}`} className="hover:text-accent-red transition-colors">
                      {member.phone}
                    </a>
                  </div>
                )}
              </div>
              <button
                onClick={() => window.location.href = `mailto:${member.email}`}
                className="w-full bg-primary/30 hover:bg-primary/50 text-accent-red border border-primary/50 rounded-lg py-2 text-sm font-semibold transition-all"
              >
                Send Message
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}