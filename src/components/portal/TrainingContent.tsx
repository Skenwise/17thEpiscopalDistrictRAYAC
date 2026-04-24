import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Users, DollarSign, CheckCircle, Video, FileText, Download, Play, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
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
  isElearning: boolean;
  videoUrl: string;
  materials: { title: string; url: string; type: string }[];
}

export default function TrainingContent() {
  const { member } = useMember();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [enrollStatus, setEnrollStatus] = useState<Record<string, 'loading' | 'done' | 'error'>>({});
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [iframeError, setIframeError] = useState<Record<string, boolean>>({});

  // Fetch trainings and existing enrollments
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all trainings
        const q = query(collection(db, 'trainings'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const trainingsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Training));
        setTrainings(trainingsData);

        // Fetch user's existing enrollments if logged in
        if (member) {
          const enrollmentsQuery = query(
            collection(db, 'training_enrollments'),
            where('userId', '==', member.userId)
          );
          const enrollmentsSnap = await getDocs(enrollmentsQuery);
          const enrolledSet = new Set<string>();
          enrollmentsSnap.docs.forEach(doc => {
            const data = doc.data();
            enrolledSet.add(data.trainingId);
          });
          setEnrolledIds(enrolledSet);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [member]);

  const handleEnroll = async (training: Training) => {
    if (!member) {
      alert('Please sign in to enroll in trainings.');
      return;
    }

    if (enrolledIds.has(training.id)) {
      alert('You are already enrolled in this training.');
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
        isElearning: training.isElearning || false,
        createdAt: serverTimestamp(),
      });
      
      setEnrolledIds(prev => new Set([...prev, training.id]));
      setEnrollStatus(prev => ({ ...prev, [training.id]: 'done' }));
      
      await sendNotification(
        member.userId,
        'training',
        `Enrolled: ${training.title}`,
        `You have successfully enrolled in ${training.title}.`
      );
      
      setTimeout(() => {
        setEnrollStatus(prev => ({ ...prev, [training.id]: undefined }));
      }, 2000);
    } catch (error) {
      console.error('Enrollment failed:', error);
      setEnrollStatus(prev => ({ ...prev, [training.id]: 'error' }));
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
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

  const handleIframeError = (trainingId: string) => {
    setIframeError(prev => ({ ...prev, [trainingId]: true }));
  };

  const isEnrolled = (trainingId: string) => enrolledIds.has(trainingId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Main Training List */}
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
            {trainings.map((training, idx) => {
              const alreadyEnrolled = isEnrolled(training.id);
              const showEnrolled = enrollStatus[training.id] === 'done' || alreadyEnrolled;
              
              return (
                <motion.div
                  key={training.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all cursor-pointer"
                  onClick={() => alreadyEnrolled && training.isElearning && setSelectedTraining(training)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold text-accent-red">{training.title}</h3>
                      {training.isElearning && (
                        <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                          <Video className="w-3 h-3" /> Online
                        </span>
                      )}
                    </div>
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">{training.level}</span>
                  </div>

                  <p className="text-accent-silver/70 text-sm mb-4">{training.description}</p>

                  {training.isElearning && training.videoUrl && !alreadyEnrolled && (
                    <div className="mb-4">
                      <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden bg-slate-900">
                        <iframe
                          src={getYouTubeEmbedUrl(training.videoUrl)}
                          className="absolute top-0 left-0 w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={training.title}
                        />
                      </div>
                    </div>
                  )}

                  {training.isElearning && training.materials && training.materials.length > 0 && !alreadyEnrolled && (
                    <div className="mb-4">
                      <p className="text-slate-400 text-xs font-semibold mb-2 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Course Materials ({training.materials.length})
                      </p>
                      <div className="space-y-1">
                        {training.materials.slice(0, 2).map((material, i) => (
                          <a
                            key={i}
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-accent-red hover:underline text-sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Download className="w-3 h-3" />
                            {material.title}
                          </a>
                        ))}
                        {training.materials.length > 2 && (
                          <p className="text-slate-500 text-xs">+{training.materials.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-accent-silver/80">
                      <Clock className="w-4 h-4 text-accent-red" />
                      <span>Duration: {training.duration}</span>
                    </div>
                    {!training.isElearning && (
                      <div className="flex items-center gap-2 text-accent-silver/80">
                        <Users className="w-4 h-4 text-accent-red" />
                        <span>Max: {training.maxParticipants} participants</span>
                      </div>
                    )}
                    {training.isPaid && (
                      <div className="flex items-center gap-2 text-accent-silver/80">
                        <DollarSign className="w-4 h-4 text-accent-red" />
                        <span>Price: {training.currency} {training.price}</span>
                      </div>
                    )}
                  </div>

                  {showEnrolled ? (
                    <div className="flex items-center gap-2 text-green-400 font-semibold justify-center py-2 border border-green-400/30 rounded-lg bg-green-400/10">
                      <CheckCircle className="w-4 h-4" />
                      {training.isElearning ? 'Click to Continue Learning →' : 'Already Enrolled!'}
                    </div>
                  ) : (
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleEnroll(training); }}
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
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Training Detail Modal - Same as MyLearnings */}
      {selectedTraining && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-accent-red/30 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-accent-red">{selectedTraining.title}</h3>
              <button onClick={() => setSelectedTraining(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Video Player with graceful fallback */}
              {selectedTraining.videoUrl && (
                <div>
                  {iframeError[selectedTraining.id] ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6 text-center">
                      <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                      <h4 className="text-white font-semibold mb-2">Video Unavailable</h4>
                      <p className="text-slate-400 text-sm mb-4">
                        This video cannot be embedded due to the website's security settings.
                      </p>
                      <a
                        href={selectedTraining.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-accent-red hover:bg-accent-red/90 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Video in New Tab
                      </a>
                    </div>
                  ) : (
                    <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden bg-slate-900">
                      <iframe
                        src={getYouTubeEmbedUrl(selectedTraining.videoUrl)}
                        className="absolute top-0 left-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedTraining.title}
                        onError={() => handleIframeError(selectedTraining.id)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {selectedTraining.description && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">About this course</h4>
                  <p className="text-slate-400">{selectedTraining.description}</p>
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

            <div className="border-t border-slate-700 p-6">
              <button
                onClick={() => setSelectedTraining(null)}
                className="w-full bg-accent-red hover:bg-accent-red/90 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}