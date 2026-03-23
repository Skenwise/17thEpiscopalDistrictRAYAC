import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Bell, Eye, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SettingsContent() {
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [pwError, setPwError] = useState('');

  const handleUpdatePassword = async () => {
    setPwError('');
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      setPwError('All fields are required.'); return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPwError('New passwords do not match.'); return;
    }
    if (passwords.newPass.length < 6) {
      setPwError('Password must be at least 6 characters.'); return;
    }

    setPwStatus('loading');
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error('Not authenticated');

      const credential = EmailAuthProvider.credential(user.email, passwords.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwords.newPass);

      setPwStatus('done');
      setPasswords({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setPwStatus('idle'), 3000);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        setPwError('Current password is incorrect.');
      } else {
        setPwError('Failed to update password. Try again.');
      }
      setPwStatus('error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Settings</h2>
        <p className="text-accent-silver/70">Manage your account and preferences</p>
      </div>

      {/* Account Settings */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-accent-red mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5" /> Change Password
        </h3>

        {pwStatus === 'done' && (
          <div className="flex items-center gap-2 text-green-400 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span>Password updated successfully!</span>
          </div>
        )}
        {pwError && <p className="text-red-400 text-sm mb-4">{pwError}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-accent-silver/70 text-sm mb-2">Current Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="bg-slate-700 border-primary/30 text-accent-silver placeholder:text-accent-silver/50 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-accent-silver/70 text-sm mb-2">New Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              className="bg-slate-700 border-primary/30 text-accent-silver placeholder:text-accent-silver/50 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-accent-silver/70 text-sm mb-2">Confirm New Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="bg-slate-700 border-primary/30 text-accent-silver placeholder:text-accent-silver/50 rounded-lg"
            />
          </div>
          <Button
            onClick={handleUpdatePassword}
            disabled={pwStatus === 'loading'}
            className="bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold rounded-lg px-6 py-2 transition-all"
          >
            {pwStatus === 'loading' ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-accent-red mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5" /> Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Email Notifications', description: 'Receive updates via email' },
            { label: 'Event Reminders', description: 'Get reminded about upcoming events' },
            { label: 'Training Updates', description: 'Notifications about new training programs' },
            { label: 'Newsletter', description: 'Weekly newsletter and announcements' },
            { label: 'Order Updates', description: 'Updates about your store orders' },
          ].map((pref, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-primary/10 rounded-lg transition-colors">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <div>
                <p className="text-accent-silver/80 font-medium">{pref.label}</p>
                <p className="text-accent-silver/60 text-sm">{pref.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-accent-red mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5" /> Privacy Settings
        </h3>
        <div className="space-y-4">
          {[
            { label: 'Profile Visibility', description: 'Allow other members to see your profile' },
            { label: 'Show Contact Info', description: 'Display your email and phone in directory' },
            { label: 'Activity Status', description: "Show when you're online" },
          ].map((setting, idx) => (
            <label key={idx} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-primary/10 rounded-lg transition-colors">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <div>
                <p className="text-accent-silver/80 font-medium">{setting.label}</p>
                <p className="text-accent-silver/60 text-sm">{setting.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-accent-red mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5" /> Two-Factor Authentication
        </h3>
        <p className="text-accent-silver/70 text-sm mb-4">Add an extra layer of security to your account.</p>
        <Button className="bg-primary/30 hover:bg-primary/50 text-accent-red border border-primary/50 rounded-lg px-6 py-2 transition-all">
          Enable 2FA
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-gradient-to-br from-red-950/30 to-red-900/10 border border-red-500/30 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h3>
        <p className="text-accent-silver/70 text-sm mb-4">These actions cannot be undone. Please proceed with caution.</p>
        <div className="flex gap-3">
          <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg px-6 py-2">
            Download My Data
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-6 py-2 transition-all">
            Delete Account
          </Button>
        </div>
      </div>
    </motion.div>
  );
}