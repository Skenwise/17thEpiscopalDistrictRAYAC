import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMember } from '@/hooks/useMember';
import { sendNotification } from '@/lib/notifications';

export default function VolunteerContent() {
  const { member } = useMember();
  const [applyStatus, setApplyStatus] = useState<Record<number, 'loading' | 'done' | 'error'>>({});

  const opportunities = [
    { id: 1, title: 'Event Coordinator', description: 'Help organize and coordinate RAYAC events', location: 'Main Office', timeCommitment: '4-6 hours/week', volunteers: 8 },
    { id: 2, title: 'Youth Mentor', description: 'Mentor young leaders and provide guidance', location: 'Various Locations', timeCommitment: '2-3 hours/week', volunteers: 12 },
    { id: 3, title: 'Training Assistant', description: 'Support training program delivery', location: 'Training Center', timeCommitment: '3-4 hours/week', volunteers: 5 },
    { id: 4, title: 'Social Media Manager', description: 'Manage RAYAC social media accounts', location: 'Remote', timeCommitment: '5-8 hours/week', volunteers: 3 },
  ];

  const handleApply = async (opportunity: typeof opportunities[0]) => {
    if (!member) return;
    setApplyStatus(prev => ({ ...prev, [opportunity.id]: 'loading' }));
    try {
      await addDoc(collection(db, 'volunteer_applications'), {
        userId: member.userId,
        userEmail: member.email,
        userName: member.displayName,
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title,
        location: opportunity.location,
        timeCommitment: opportunity.timeCommitment,
        createdAt: serverTimestamp(),
      });

      await sendNotification(
        member.userId,
        'volunteer',
        `Application Received: ${opportunity.title}`,
        `Thank you for applying to volunteer as a ${opportunity.title}. We will review your application and get back to you soon.`
      );
      setApplyStatus(prev => ({ ...prev, [opportunity.id]: 'done' }));
    } catch (error) {
      console.error('Application failed:', error);
      setApplyStatus(prev => ({ ...prev, [opportunity.id]: 'error' }));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Volunteer Opportunities</h2>
        <p className="text-accent-silver/70">Make a difference by volunteering with RAYAC</p>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity, idx) => (
          <motion.div
            key={opportunity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all"
          >
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent-red/20 flex items-center justify-center text-accent-red">
                  <Briefcase className="w-8 h-8" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <h3 className="text-xl font-semibold text-accent-red">{opportunity.title}</h3>
                <p className="text-accent-silver/70 text-sm">{opportunity.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <MapPin className="w-4 h-4 text-accent-red" />
                    <span>{opportunity.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <Clock className="w-4 h-4 text-accent-red" />
                    <span>{opportunity.timeCommitment}</span>
                  </div>
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <Users className="w-4 h-4 text-accent-red" />
                    <span>{opportunity.volunteers} volunteers needed</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2">
                {applyStatus[opportunity.id] === 'done' ? (
                  <div className="flex items-center gap-2 text-green-400 font-semibold justify-center">
                    <CheckCircle className="w-5 h-5" />
                    Applied!
                  </div>
                ) : (
                  <Button
                    onClick={() => handleApply(opportunity)}
                    disabled={applyStatus[opportunity.id] === 'loading'}
                    className="bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg py-2 transition-all disabled:opacity-60"
                  >
                    {applyStatus[opportunity.id] === 'loading' ? 'Saving...' : 'Volunteer'}
                  </Button>
                )}
                {applyStatus[opportunity.id] === 'error' && (
                  <p className="text-red-400 text-xs text-center">Failed. Try again.</p>
                )}
                <Button variant="outline" className="border-primary/50 text-accent-red hover:bg-primary/10 rounded-lg py-2">
                  Learn More
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}