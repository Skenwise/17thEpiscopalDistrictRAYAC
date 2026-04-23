import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMember } from '@/hooks/useMember';
import { BookOpen, Video, FileText, Play, ExternalLink } from 'lucide-react';

interface Enrollment {
  id: string;
  trainingId: string;
  trainingTitle: string;
  trainingLevel: string;
  isElearning: boolean;
  status?: string;
  createdAt: any;
}

interface Training {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  materials: Array<{ title: string; url: string; type: string }>;
  isElearning: boolean;
}

export default function MyLearnings() {
  const { member } = useMember();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [trainings, setTrainings] = useState<Record<string, Training>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);

  useEffect(() => {
    if (member) {
      fetchMyEnrollments();
    }
  }, [member]);

  const fetchMyEnrollments = async () => {
    if (!member) return;
    
    try {
      const q = query(
        collection(db, 'training_enrollments'),
        where('userId', '==', member.userId)
      );
      const snap = await getDocs(q);
      const myEnrollments = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Enrollment));
      
      setEnrollments(myEnrollments);
      
      // Fetch the actual training details for each enrollment
      const trainingIds = [...new Set(myEnrollments.map(e => e.trainingId))];
      const trainingData: Record<string, Training> = {};
      
      for (const trainingId of trainingIds) {
        const trainingSnap = await getDocs(
          query(collection(db, 'trainings'), where('__name__', '==', trainingId))
        );
        if (!trainingSnap.empty) {
          const doc = trainingSnap.docs[0];
          trainingData[trainingId] = { id: doc.id, ...doc.data() } as Training;
        }
      }
      
      setTrainings(trainingData);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const eLearningEnrollments = enrollments.filter(e => e.isElearning);
  const inPersonEnrollments = enrollments.filter(e => !e.isElearning);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Please sign in to view your learnings.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">My Learnings</h2>
        <p className="text-accent-silver/70">Continue your training courses</p>
      </div>

      {/* Selected Training View */}
      {selectedTraining ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedTraining(null)}
            className="text-accent-red hover:underline mb-4"
          >
            ← Back to My Courses
          </button>
          
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4">{selectedTraining.title}</h3>
            
            {/* Video Player */}
            {selectedTraining.videoUrl && (
              <div className="mb-6">
                <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden bg-slate-900">
                  <iframe
                    src={getYouTubeEmbedUrl(selectedTraining.videoUrl)}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={selectedTraining.title}
                  />
                </div>
              </div>
            )}
            
            {/* Materials */}
            {selectedTraining.materials && selectedTraining.materials.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-red" />
                  Course Materials
                </h4>
                <div className="space-y-2">
                  {selectedTraining.materials.map((material, i) => (
                    <a
                      key={i}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-white">{material.title}</span>
                      <ExternalLink className="w-4 h-4 text-accent-red" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* E-Learning Courses */}
          {eLearningEnrollments.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-400" />
                Online Courses
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {eLearningEnrollments.map((enrollment) => {
                  const training = trainings[enrollment.trainingId];
                  return (
                    <motion.div
                      key={enrollment.id}
                      whileHover={{ y: -4 }}
                      className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-lg font-semibold text-white">{enrollment.trainingTitle}</h4>
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                          {enrollment.status || 'Enrolled'}
                        </span>
                      </div>
                      
                      {training && (
                        <button
                          onClick={() => setSelectedTraining(training)}
                          className="flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white px-4 py-2 rounded-lg transition-colors mt-4"
                        >
                          <Play className="w-4 h-4" />
                          Continue Learning
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* In-Person Trainings */}
          {inPersonEnrollments.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">In-Person Trainings</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {inPersonEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="text-lg font-semibold text-white">{enrollment.trainingTitle}</h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        enrollment.status === 'completed' 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {enrollment.status || 'Enrolled'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">Level: {enrollment.trainingLevel}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {enrollments.length === 0 && (
            <div className="text-center py-12 bg-slate-800/50 rounded-xl">
              <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">You haven't enrolled in any trainings yet.</p>
              <a href="/portal/trainings" className="text-accent-red hover:underline">
                Browse Available Trainings →
              </a>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}