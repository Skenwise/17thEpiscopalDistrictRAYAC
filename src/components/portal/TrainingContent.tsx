import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Users, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMember } from '@/hooks/useMember';
import { sendNotification } from '@/lib/notifications';

export default function TrainingContent() {
  const { member } = useMember();
  const [enrollStatus, setEnrollStatus] = useState<Record<number, 'loading' | 'done' | 'error'>>({});

  const trainings = [
    { id: 1, title: 'Youth Leadership Fundamentals', description: 'Learn the basics of effective youth leadership', duration: '4 weeks', level: 'Beginner', participants: 32, status: 'ongoing', progress: 60 },
    { id: 2, title: 'Conflict Resolution Skills', description: 'Master techniques for resolving conflicts peacefully', duration: '2 weeks', level: 'Intermediate', participants: 18, status: 'upcoming', progress: 0 },
    { id: 3, title: 'Public Speaking Mastery', description: 'Develop confidence and skills in public speaking', duration: '3 weeks', level: 'Intermediate', participants: 25, status: 'upcoming', progress: 0 },
    { id: 4, title: 'Event Management Excellence', description: 'Plan and execute successful events', duration: '5 weeks', level: 'Advanced', participants: 15, status: 'completed', progress: 100 },
  ];

  const handleEnroll = async (training: typeof trainings[0]) => {
    if (!member) return;
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
        `Enrollment Confirmed: ${training.title}`,
        `You have successfully enrolled in ${training.title} (${training.level}).`
      );
      setEnrollStatus(prev => ({ ...prev, [training.id]: 'done' }));
    } catch (error) {
      console.error('Enrollment failed:', error);
      setEnrollStatus(prev => ({ ...prev, [training.id]: 'error' }));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Training Programs</h2>
        <p className="text-accent-silver/70">Develop your skills with our comprehensive training programs</p>
      </div>

      <div className="space-y-4">
        {trainings.map((training, idx) => (
          <motion.div
            key={training.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all"
          >
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center justify-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-lg ${
                  training.status === 'completed' ? 'bg-green-500/20 text-green-400'
                  : training.status === 'ongoing' ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {training.progress}%
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <h3 className="text-xl font-semibold text-accent-red">{training.title}</h3>
                <p className="text-accent-silver/70 text-sm">{training.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <Clock className="w-4 h-4 text-accent-red" />
                    <span>{training.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <Users className="w-4 h-4 text-accent-red" />
                    <span>{training.participants} participants</span>
                  </div>
                  <div className="px-2 py-1 bg-primary/20 rounded text-accent-red text-xs font-semibold">
                    {training.level}
                  </div>
                </div>
                {training.status !== 'completed' && (
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-primary to-accent-red h-2 rounded-full transition-all" style={{ width: `${training.progress}%` }} />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center gap-2">
                {training.status === 'completed' ? (
                  <div className="flex items-center gap-2 text-green-400 font-semibold">
                    <CheckCircle className="w-5 h-5" /> Completed
                  </div>
                ) : enrollStatus[training.id] === 'done' ? (
                  <div className="flex items-center gap-2 text-green-400 font-semibold justify-center">
                    <CheckCircle className="w-5 h-5" />
                    Enrolled!
                  </div>
                ) : (
                  <Button
                    onClick={() => handleEnroll(training)}
                    disabled={enrollStatus[training.id] === 'loading'}
                    className={`font-semibold rounded-lg py-2 transition-all disabled:opacity-60 ${
                      training.status === 'ongoing'
                        ? 'bg-accent-red hover:bg-accent-red/90 text-white'
                        : 'bg-primary/30 hover:bg-primary/50 text-accent-red border border-primary/50'
                    }`}
                  >
                    {enrollStatus[training.id] === 'loading' ? 'Saving...' : training.status === 'ongoing' ? 'Continue' : 'Enroll'}
                  </Button>
                )}
                {enrollStatus[training.id] === 'error' && (
                  <p className="text-red-400 text-xs text-center">Failed. Try again.</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}