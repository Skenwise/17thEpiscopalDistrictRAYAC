import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function DirectoryContent() {
  const [searchTerm, setSearchTerm] = useState('');

  const members = [
    { id: 1, name: 'John Doe', role: 'Youth Leader', email: 'john@rayac.org', phone: '+1 (555) 123-4567', initials: 'JD' },
    { id: 2, name: 'Sarah Johnson', role: 'Training Coordinator', email: 'sarah@rayac.org', phone: '+1 (555) 234-5678', initials: 'SJ' },
    { id: 3, name: 'Michael Smith', role: 'Volunteer Coordinator', email: 'michael@rayac.org', phone: '+1 (555) 345-6789', initials: 'MS' },
    { id: 4, name: 'Emily Brown', role: 'Events Manager', email: 'emily@rayac.org', phone: '+1 (555) 456-7890', initials: 'EB' },
  ];

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          placeholder="Search members by name or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800 border-primary/30 text-accent-silver placeholder:text-accent-silver/50 rounded-lg"
        />
      </div>

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
              {member.initials}
            </div>
            <h3 className="text-lg font-semibold text-accent-red mb-1">{member.name}</h3>
            <p className="text-accent-silver/70 text-sm mb-4">{member.role}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-accent-silver/80 text-sm">
                <Mail className="w-4 h-4 text-accent-red" />
                <a href={`mailto:${member.email}`} className="hover:text-accent-red transition-colors">{member.email}</a>
              </div>
              <div className="flex items-center gap-2 text-accent-silver/80 text-sm">
                <Phone className="w-4 h-4 text-accent-red" />
                <a href={`tel:${member.phone}`} className="hover:text-accent-red transition-colors">{member.phone}</a>
              </div>
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

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-accent-silver/70">No members found matching your search.</p>
        </div>
      )}
    </motion.div>
  );
}