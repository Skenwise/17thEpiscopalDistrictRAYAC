import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMember } from '@/hooks/useMember';
import { sendNotification } from '@/lib/notifications';

interface VolunteerOpportunity {
  id: string;
  title: string;
  location: string;
  timeCommitment: string;
  description: string;
  skills: string[];
  spotsAvailable: number;
}

export default function VolunteerContent() {
  const { member } = useMember();
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [applyStatus, setApplyStatus] = useState<Record<string, 'loading' | 'done' | 'error'>>({});

  const fetchOpportunities = async () => {
    try {
      const q = query(collection(db, 'volunteer_opportunities'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setOpportunities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as VolunteerOpportunity)));
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOpportunities(); }, []);

  const handleApply = async (opportunity: VolunteerOpportunity) => {
    if (!member) {
      alert('Please sign in to apply for volunteer opportunities.');
      return;
    }
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
        `Applied: ${opportunity.title}`,
        `Your application for ${opportunity.title} has been submitted.`
      );
      setApplyStatus(prev => ({ ...prev, [opportunity.id]: 'done' }));
    } catch (error) {
      console.error('Application failed:', error);
      setApplyStatus(prev => ({ ...prev, [opportunity.id]: 'error' }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Volunteer Opportunities</h2>
        <p className="text-accent-silver/70">Make a difference by volunteering with RAYAC</p>
      </div>

      {opportunities.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl">
          <Heart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No volunteer opportunities available at this time.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {opportunities.map((opp, idx) => (
            <motion.div
              key={opp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all"
            >
              <h3 className="text-xl font-semibold text-accent-red mb-2">{opp.title}</h3>
              <p className="text-accent-silver/70 text-sm mb-4">{opp.description}</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-accent-silver/80">
                  <MapPin className="w-4 h-4 text-accent-red" />
                  <span>{opp.location}</span>
                </div>
                <div className="flex items-center gap-2 text-accent-silver/80">
                  <Clock className="w-4 h-4 text-accent-red" />
                  <span>{opp.timeCommitment}</span>
                </div>
                <div className="flex items-center gap-2 text-accent-silver/80">
                  <Users className="w-4 h-4 text-accent-red" />
                  <span>Spots: {opp.spotsAvailable} available</span>
                </div>
                {opp.skills && opp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {opp.skills.map((skill, i) => (
                      <span key={i} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {applyStatus[opp.id] === 'done' ? (
                <div className="flex items-center gap-2 text-green-400 font-semibold justify-center py-2">
                  <CheckCircle className="w-5 h-5" />
                  Applied!
                </div>
              ) : (
                <Button
                  onClick={() => handleApply(opp)}
                  disabled={applyStatus[opp.id] === 'loading'}
                  className="w-full bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg py-2 transition-all disabled:opacity-60"
                >
                  {applyStatus[opp.id] === 'loading' ? 'Processing...' : 'Apply Now'}
                </Button>
              )}
              {applyStatus[opp.id] === 'error' && (
                <p className="text-red-400 text-xs text-center mt-2">Failed. Try again.</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
