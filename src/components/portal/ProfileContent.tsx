import { useMember } from '@/hooks/useMember';
import { motion } from 'framer-motion';
import { Mail, Phone, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileContent() {
  const { member } = useMember();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold font-heading text-accent-red">My Profile</h2>
        <Button className="bg-primary/30 hover:bg-primary/50 text-accent-red border border-primary/50 rounded-lg px-6 py-2 flex items-center gap-2">
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </Button>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent-red flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-primary/30 mb-4">
              {(member?.displayName || 'M').charAt(0).toUpperCase()}
            </div>
            <p className="text-accent-silver/70 text-sm">
              Member since {member?.memberSince || new Date().getFullYear()}
            </p>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-accent-silver/60 text-sm uppercase tracking-wider mb-1">Full Name</p>
              <p className="text-2xl font-semibold text-accent-red">{member?.displayName || 'Member'}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-accent-silver/60 text-sm uppercase tracking-wider mb-1">Email</p>
                <div className="flex items-center gap-2 text-accent-silver/80">
                  <Mail className="w-4 h-4 text-accent-red" />
                  <p>{member?.email || 'Not provided'}</p>
                </div>
              </div>
              <div>
                <p className="text-accent-silver/60 text-sm uppercase tracking-wider mb-1">Phone</p>
                <div className="flex items-center gap-2 text-accent-silver/80">
                  <Phone className="w-4 h-4 text-accent-red" />
                  <p>{member?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-accent-silver/60 text-sm uppercase tracking-wider mb-1">Status</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <p className="text-accent-silver/80 font-semibold">Active Member</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-accent-red mb-4">Membership Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-accent-silver/60">Conference:</span>
              <span className="text-accent-silver/80">{member?.conference || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-accent-silver/60">District:</span>
              <span className="text-accent-silver/80">{member?.district || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-accent-silver/60">Local Church:</span>
              <span className="text-accent-silver/80">{member?.localChurch || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-accent-silver/60">Hymn Book:</span>
              <span className={member?.premiumUnlocked ? 'text-green-400 font-semibold' : 'text-accent-red/70'}>
                {member?.premiumUnlocked ? 'Unlocked ✓' : 'Free Preview'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-accent-red mb-4">Preferences</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-accent-silver/80">Email Notifications</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-accent-silver/80">Event Reminders</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-accent-silver/80">Newsletter</span>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}