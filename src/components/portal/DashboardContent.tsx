import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, BookOpen, Users, Zap, Calendar, Download, Play, ArrowRight, ChevronLeft, X, FileText, Music, MapPin, Clock } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { collection, addDoc, getDocs, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMember } from '@/hooks/useMember';
import { sendNotification } from '@/lib/notifications';

type PortalSection = 'dashboard' | 'profile' | 'events' | 'directory' | 'resources' | 'training' | 'giving' | 'volunteer' | 'reports' | 'forum' | 'media' | 'notifications' | 'store' | 'settings';

interface DashboardProps {
  onSectionChange?: (section: PortalSection) => void;
}

interface Event {
  id: string;
  title: string;
  date: string;
  month: string;
  day: string;
  description: string;
  image: string;
  cta: string;
  featured: boolean;
  location?: string;
  time?: string;
}

interface Resource {
  id: string;
  title: string;
  type: string;
  url: string;
}

export default function DashboardContent({ onSectionChange }: DashboardProps) {
  const { member } = useMember();
  const galleryScrollRef = useRef<HTMLDivElement>(null);

  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [prayerMessage, setPrayerMessage] = useState('');
  const [prayerStatus, setPrayerStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, 'loading' | 'done' | 'error'>>({});

  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(true);

  const galleryImages = [
    { id: 1, title: 'RAYAC Convention 2025', image: 'https://static.wixstatic.com/media/20287c_f8745bcc91a34b8c97a1e24b4b0259ed~mv2.png?originWidth=768&originHeight=576' },
    { id: 2, title: 'Youth Outreach Program', image: 'https://static.wixstatic.com/media/20287c_ff1f2f16447946158d9c326c21b96cab~mv2.png' },
    { id: 3, title: 'Church Activities', image: 'https://static.wixstatic.com/media/20287c_d90e8253a60140f784dc114ebde2755d~mv2.png' },
    { id: 4, title: 'Leadership Training', image: 'https://static.wixstatic.com/media/20287c_69f6c0f98ccc43c7996d26688e9d6cc0~mv2.png?originWidth=768&originHeight=576' },
    { id: 5, title: 'Community Service', image: 'https://static.wixstatic.com/media/20287c_ff1f2f16447946158d9c326c21b96cab~mv2.png' },
    { id: 6, title: 'Youth Convention', image: 'https://static.wixstatic.com/media/20287c_d90e8253a60140f784dc114ebde2755d~mv2.png' },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
        setFeaturedEvents(all.filter(e => e.featured));
        setUpcomingEvents(all.slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    const fetchResources = async () => {
      try {
        const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setResources(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)).slice(0, 4));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingResources(false);
      }
    };

    fetchEvents();
    fetchResources();
  }, []);

  const handlePrayerSubmit = async () => {
    if (!prayerMessage.trim() || !member) return;
    setPrayerStatus('loading');
    try {
      await addDoc(collection(db, 'prayer_requests'), {
        userId: member.userId,
        userEmail: member.email,
        userName: member.displayName,
        message: prayerMessage,
        createdAt: serverTimestamp(),
      });

      await sendNotification(
        member.userId,
        'prayer',
        'Prayer Request Submitted',
        'Your prayer request has been submitted successfully. We will be praying for you and your needs.'
      );
      setPrayerStatus('done');
      setPrayerMessage('');
      setTimeout(() => { setShowPrayerModal(false); setPrayerStatus('idle'); }, 2000);
    } catch {
      setPrayerStatus('error');
    }
  };

  const handleRSVP = async (event: Event) => {
    if (!member) return;
    setRsvpStatus(prev => ({ ...prev, [event.id]: 'loading' }));
    try {
      await addDoc(collection(db, 'rsvps'), {
        userId: member.userId,
        userEmail: member.email,
        userName: member.displayName,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        createdAt: serverTimestamp(),
      });

      await sendNotification(
        member.userId,
        'rsvp',
        `RSVP Confirmed: ${event.title}`,
        'You have successfully RSVP\'d for ${event.title} on ${event.date}.'
      );
      setRsvpStatus(prev => ({ ...prev, [event.id]: 'done' }));
    } catch {
      setRsvpStatus(prev => ({ ...prev, [event.id]: 'error' }));
    }
  };

  const handleShowDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'Audio': return <Music className="w-5 h-5" />;
      case 'PDF': return <FileText className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const quickActions = [
    { id: 1, title: 'Submit Prayer Request', description: 'Share your prayer needs with the community', icon: <Heart className="w-6 h-6" />, color: 'from-destructive/20 to-destructive/5', borderColor: 'border-destructive/30', onClick: () => setShowPrayerModal(true) },
    { id: 2, title: 'Give Offering', description: 'Support RAYAC ministries and programs', icon: <Heart className="w-6 h-6" />, color: 'from-primary/20 to-primary/5', borderColor: 'border-primary/30', onClick: () => window.location.href = '/checkout?product=Offering&price=50&currency=ZMW' },
    { id: 3, title: 'View Directory', description: 'Connect with other members', icon: <Users className="w-6 h-6" />, color: 'from-accent-red/20 to-accent-red/5', borderColor: 'border-accent-red/30', onClick: () => onSectionChange?.('directory') },
    { id: 4, title: 'Join Training', description: 'Enroll in upcoming training programs', icon: <Zap className="w-6 h-6" />, color: 'from-yellow-500/20 to-yellow-500/5', borderColor: 'border-yellow-500/30', onClick: () => onSectionChange?.('training') },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const displayFeatured = featuredEvents.length > 0 ? featuredEvents : [
    { id: 'default-1', title: 'RAYAC Convention 2026', date: 'April 15-18, 2026', month: 'Apr', day: '15', description: 'Join us for the annual RAYAC Convention featuring inspiring speakers, workshops, and networking opportunities.', image: 'https://static.wixstatic.com/media/20287c_ff1f2f16447946158d9c326c21b96cab~mv2.png?originWidth=384&originHeight=256', cta: 'Register Now', featured: true, location: 'Main Auditorium', time: 'All Day' },
    { id: 'default-2', title: 'Youth Leadership Retreat', date: 'March 15-17, 2026', month: 'Mar', day: '15', description: 'An exclusive retreat for young leaders to develop skills and connect with peers.', image: 'https://static.wixstatic.com/media/20287c_d90e8253a60140f784dc114ebde2755d~mv2.png?originWidth=384&originHeight=256', cta: 'Learn More', featured: true, location: 'RAYAC Conference Center', time: '9:00 AM - 5:00 PM' },
  ];

  const displayUpcoming = upcomingEvents.length > 0 ? upcomingEvents : [
    { id: 'u1', title: 'Youth Leadership Retreat', date: 'March 15', month: 'Mar', day: '15', description: 'An exclusive retreat for young leaders.', image: '', cta: '', featured: false, location: 'RAYAC Conference Center', time: '9:00 AM' },
    { id: 'u2', title: 'RAYAC Convention 2026', date: 'April 15', month: 'Apr', day: '15', description: 'Annual RAYAC Convention.', image: '', cta: '', featured: false, location: 'Main Auditorium', time: 'All Day' },
    { id: 'u3', title: 'Training Workshop', date: 'March 22', month: 'Mar', day: '22', description: 'Professional development workshop.', image: '', cta: '', featured: false, location: 'Training Room A', time: '2:00 PM' },
  ];

  return (
    <motion.div className="space-y-10" variants={containerVariants} initial="hidden" animate="visible">

      {/* Featured Announcement Carousel */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 border border-accent-red/30 shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        <motion.div className="absolute top-0 right-0 w-64 h-64 bg-accent-red/10 rounded-full blur-3xl" animate={{ y: [0, 20, 0] }} transition={{ duration: 6, repeat: Infinity }} />

        {isLoadingEvents ? (
          <div className="p-12 text-center text-slate-400">Loading events...</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12 relative z-10">
            <motion.div className="relative h-72 lg:h-96 rounded-2xl overflow-hidden shadow-2xl" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
              {displayFeatured[currentAnnouncement]?.image ? (
                <Image src={displayFeatured[currentAnnouncement].image} alt={displayFeatured[currentAnnouncement].title} className="w-full h-full object-cover" width={400} originWidth={400} originHeight={300} />
              ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-slate-500" />
                </div>
              )}
              <motion.div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} />
            </motion.div>

            <div className="flex flex-col justify-center">
              <motion.div key={currentAnnouncement} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <motion.p className="text-accent-red text-sm font-bold uppercase tracking-widest mb-3" animate={{ letterSpacing: ['0.1em', '0.15em', '0.1em'] }} transition={{ duration: 3, repeat: Infinity }}>
                  Featured Event
                </motion.p>
                <h2 className="text-4xl lg:text-5xl font-bold font-heading text-primary-foreground mb-3 leading-tight">
                  {displayFeatured[currentAnnouncement]?.title}
                </h2>
                <p className="text-primary-foreground/80 text-xl font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent-red" />
                  {displayFeatured[currentAnnouncement]?.date}
                </p>
                <p className="text-primary-foreground/70 mb-8 leading-relaxed text-lg">
                  {displayFeatured[currentAnnouncement]?.description}
                </p>
              </motion.div>

              <div className="flex gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(160, 0, 0, 0.3)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRSVP(displayFeatured[currentAnnouncement])}
                  disabled={rsvpStatus[displayFeatured[currentAnnouncement]?.id] === 'done'}
                  className="bg-gradient-to-r from-primary to-accent-red hover:from-primary/90 hover:to-accent-red/90 disabled:opacity-70 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
                >
                  {rsvpStatus[displayFeatured[currentAnnouncement]?.id] === 'done' ? '✓ RSVP\'d!' : rsvpStatus[displayFeatured[currentAnnouncement]?.id] === 'loading' ? 'Saving...' : displayFeatured[currentAnnouncement]?.cta || 'Register Now'}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShowDetails(displayFeatured[currentAnnouncement])}
                  className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-bold px-8 py-3 rounded-xl transition-all"
                >
                  Details
                </motion.button>
              </div>

              <div className="flex gap-3">
                {displayFeatured.map((_, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setCurrentAnnouncement(idx)}
                    className={`rounded-full transition-all ${idx === currentAnnouncement ? 'bg-gradient-to-r from-primary to-accent-red w-8 h-2.5' : 'bg-primary-foreground/30 w-2.5 h-2.5 hover:bg-primary-foreground/50'}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Go to announcement ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold font-heading text-primary-foreground">Quick Actions</h3>
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronRight className="w-6 h-6 text-accent-red" />
          </motion.div>
        </div>
        <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5" variants={containerVariants}>
          {quickActions.map((action) => (
            <motion.div
              key={action.id}
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
              onClick={action.onClick}
              className={`bg-gradient-to-br ${action.color} border-2 ${action.borderColor} rounded-2xl p-6 cursor-pointer hover:border-accent-red/50 transition-all group relative overflow-hidden`}
            >
              <motion.div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
              <div className="relative z-10">
                <div className="text-accent-red mb-4 group-hover:scale-125 transition-transform duration-300">{action.icon}</div>
                <h4 className="font-bold text-primary-foreground mb-2 text-lg">{action.title}</h4>
                <p className="text-primary-foreground/70 text-sm mb-5">{action.description}</p>
                <div className="flex items-center text-accent-red text-sm font-bold gap-1 group-hover:gap-2 transition-all">
                  Go <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Upcoming Events */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold font-heading text-primary-foreground">Upcoming Events</h3>
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Calendar className="w-6 h-6 text-accent-red" />
          </motion.div>
        </div>
        <motion.div className="grid md:grid-cols-3 gap-5" variants={containerVariants}>
          {displayUpcoming.map((event) => (
            <motion.div
              key={event.id}
              variants={itemVariants}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(200, 16, 46, 0.15)' }}
              className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 rounded-2xl p-6 hover:border-accent-red/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="bg-gradient-to-br from-primary via-primary to-accent-red rounded-xl p-4 text-white shadow-lg">
                  <p className="text-xs font-bold uppercase tracking-wider">{event.month}</p>
                  <p className="text-3xl font-bold">{event.day}</p>
                </motion.div>
                <button
                  onClick={() => handleShowDetails(event)}
                  className="text-xs text-accent-red/70 hover:text-accent-red font-semibold border border-accent-red/30 hover:border-accent-red px-2 py-1 rounded-lg transition-all"
                >
                  Details
                </button>
              </div>
              <h4 className="font-bold text-primary-foreground mb-2 text-lg">{event.title}</h4>
              {event.location && (
                <div className="flex items-center gap-1 text-slate-400 text-xs mb-4">
                  <MapPin className="w-3 h-3" />
                  <span>{event.location}</span>
                </div>
              )}
              {rsvpStatus[event.id] === 'done' ? (
                <div className="w-full text-center text-green-400 font-semibold py-2">✓ RSVP'd!</div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleRSVP(event)}
                  disabled={rsvpStatus[event.id] === 'loading'}
                  className="w-full bg-gradient-to-r from-primary/20 to-accent-red/20 hover:from-primary/30 hover:to-accent-red/30 text-primary-foreground border-2 border-primary/50 rounded-xl py-2.5 font-bold transition-all disabled:opacity-60"
                >
                  {rsvpStatus[event.id] === 'loading' ? 'Saving...' : 'RSVP'}
                </motion.button>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Media Gallery */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold font-heading text-primary-foreground">Media Gallery</h3>
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronRight className="w-6 h-6 text-accent-red" />
          </motion.div>
        </div>
        <div className="relative group">
          <div ref={galleryScrollRef} className="flex gap-5 overflow-x-auto pb-4 scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
            {galleryImages.map((item) => (
              <motion.div key={item.id} variants={itemVariants} whileHover={{ scale: 1.05 }} className="flex-shrink-0 w-64 h-48 rounded-2xl overflow-hidden border-2 border-slate-600 hover:border-accent-red/50 transition-all cursor-pointer group/item relative">
                <Image src={item.image} alt={item.title} className="w-full h-full object-cover" width={256} originWidth={256} originHeight={192} />
                <motion.div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end p-4" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}>
                  <p className="text-primary-foreground font-bold text-sm">{item.title}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => galleryScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2.5 bg-gradient-to-r from-primary to-accent-red text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Scroll left">
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => galleryScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2.5 bg-gradient-to-r from-primary to-accent-red text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Scroll right">
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Resources & Downloads */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold font-heading text-primary-foreground">Resources & Downloads</h3>
          <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <Download className="w-6 h-6 text-accent-red" />
          </motion.div>
        </div>
        {isLoadingResources ? (
          <p className="text-slate-400">Loading resources...</p>
        ) : resources.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 text-center">
            <Download className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No resources uploaded yet.</p>
            <p className="text-slate-500 text-sm mt-1">Check back soon for documents and materials.</p>
          </div>
        ) : (
          <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5" variants={containerVariants}>
            {resources.map((resource) => (
              <motion.div key={resource.id} variants={itemVariants} whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }} className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 rounded-2xl p-6 hover:border-accent-red/50 transition-all group">
                <div className="text-accent-red mb-4 group-hover:scale-125 transition-transform duration-300">{getResourceIcon(resource.type)}</div>
                <h4 className="font-bold text-primary-foreground mb-2 text-lg">{resource.title}</h4>
                <p className="text-primary-foreground/60 text-xs mb-5 uppercase tracking-wider font-semibold">{resource.type}</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => window.open(resource.url, '_blank')} className="w-full bg-gradient-to-r from-primary/20 to-accent-red/20 hover:from-primary/30 hover:to-accent-red/30 text-primary-foreground border-2 border-primary/50 rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold transition-all">
                  <Download className="w-4 h-4" />
                  Download
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Prayer Request Modal */}
      {showPrayerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-accent-red/30 rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-accent-red">Submit Prayer Request</h3>
              <button onClick={() => setShowPrayerModal(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <p className="text-accent-silver/70 text-sm mb-6">Share your prayer needs with the RAYAC community.</p>
            {prayerStatus === 'done' ? (
              <div className="text-center py-4"><p className="text-green-400 font-semibold text-lg">🙏 Prayer request submitted!</p></div>
            ) : (
              <>
                <textarea value={prayerMessage} onChange={(e) => setPrayerMessage(e.target.value)} placeholder="Share your prayer request..." rows={5} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-red resize-none mb-4" />
                {prayerStatus === 'error' && <p className="text-red-400 text-sm mb-4">Failed to submit. Try again.</p>}
                <div className="flex gap-3">
                  <button onClick={() => setShowPrayerModal(false)} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition-all">Cancel</button>
                  <button onClick={handlePrayerSubmit} disabled={prayerStatus === 'loading' || !prayerMessage.trim()} className="flex-1 py-3 rounded-xl bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold transition-all">
                    {prayerStatus === 'loading' ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Event Details Modal */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-accent-red/30 rounded-2xl w-full max-w-lg overflow-hidden">
            {selectedEvent.image && (
              <div className="relative h-48 overflow-hidden">
                <Image src={selectedEvent.image} alt={selectedEvent.title} className="w-full h-full object-cover" width={500} originWidth={500} originHeight={300} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-800/20 to-transparent" />
              </div>
            )}
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-accent-red flex-1">{selectedEvent.title}</h3>
                <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-white ml-4"><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-slate-300">
                  <Calendar className="w-5 h-5 text-accent-red flex-shrink-0" />
                  <span>{selectedEvent.date}</span>
                </div>
                {selectedEvent.time && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <Clock className="w-5 h-5 text-accent-red flex-shrink-0" />
                    <span>{selectedEvent.time}</span>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <MapPin className="w-5 h-5 text-accent-red flex-shrink-0" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}
              </div>

              {selectedEvent.description && (
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{selectedEvent.description}</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowDetailsModal(false)} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 hover:text-white transition-all">
                  Close
                </button>
                <button
                  onClick={() => { handleRSVP(selectedEvent); setShowDetailsModal(false); }}
                  disabled={rsvpStatus[selectedEvent.id] === 'done'}
                  className="flex-1 py-3 rounded-xl bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold transition-all"
                >
                  {rsvpStatus[selectedEvent.id] === 'done' ? '✓ RSVP\'d!' : 'RSVP Now'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}