import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMember } from '@/hooks/useMember';
import { sendNotification } from '@/lib/notifications';

interface Training {
  id: string;
  title: string;
  level: string;
  description: string;
  duration: string;
  price: number;
  currency: string;
  isPaid: boolean;
  maxParticipants: number;
  startDate: string;
  endDate: string;
}

export default function TrainingContent() {
  const { member } = useMember();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollStatus, setEnrollStatus] = useState<Record<string, 'loading' | 'done' | 'error'>>({});

  const fetchTrainings = async () => {
    try {
      const q = query(collection(db, 'trainings'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setTrainings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Training)));
    } catch (error) {
      console.error('Failed to fetch trainings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTrainings(); }, []);

  const handleEnroll = async (training: Training) => {
    if (!member) {
      alert('Please sign in to enroll in trainings.');
      return;
    }
    setEnrollStatus(prev => ({ ...prev, [training.id]: 'loading' }));
    try {
      await addDoc(collection(db, 'training_enrollments'), {
        userId: member.userId,
        userEmail: member.email,
        userName: member.displayName,
        trainingId: training.id,
        trainingTitle: training.title,
        trainingLevel: training.level,
        createdAt: serverTimestamp(),
      });
      await sendNotification(
        member.userId,
        'training',
        `Enrolled: ${training.title}`,
        `You have successfully enrolled in ${training.title}.`
      );
      setEnrollStatus(prev => ({ ...prev, [training.id]: 'done' }));
    } catch (error) {
      console.error('Enrollment failed:', error);
      setEnrollStatus(prev => ({ ...prev, [training.id]: 'error' }));
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
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Training Programs</h2>
        <p className="text-accent-silver/70">Develop your skills with our training programs</p>
      </div>

      {trainings.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No training programs available at this time.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {trainings.map((training, idx) => (
            <motion.div
              key={training.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-accent-red">{training.title}</h3>
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">{training.level}</span>
              </div>
              <p className="text-accent-silver/70 text-sm mb-4">{training.description}</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2 text-accent-silver/80">
                  <Clock className="w-4 h-4 text-accent-red" />
                  <span>Duration: {training.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-accent-silver/80">
                  <Users className="w-4 h-4 text-accent-red" />
                  <span>Max: {training.maxParticipants} participants</span>
                </div>
                {training.isPaid && (
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <DollarSign className="w-4 h-4 text-accent-red" />
                    <span>Price: {training.currency} {training.price}</span>
                  </div>
                )}
              </div>
              {enrollStatus[training.id] === 'done' ? (
                <div className="flex items-center gap-2 text-green-400 font-semibold justify-center py-2">
                  <CheckCircle className="w-5 h-5" />
                  Enrolled!
                </div>
              ) : (
                <Button
                  onClick={() => handleEnroll(training)}
                  disabled={enrollStatus[training.id] === 'loading'}
                  className="w-full bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg py-2 transition-all disabled:opacity-60"
                >
                  {enrollStatus[training.id] === 'loading' ? 'Processing...' : 'Enroll Now'}
                </Button>
              )}
              {enrollStatus[training.id] === 'error' && (
                <p className="text-red-400 text-xs text-center mt-2">Failed. Try again.</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
