import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, BookOpen, Users, Zap, Calendar, Download, Play, ArrowRight, ChevronLeft } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function DashboardContent() {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const galleryScrollRef = useRef<HTMLDivElement>(null);

  const announcements = [
    {
      id: 1,
      title: 'RAYAC Convention 2026',
      date: 'April 15-18, 2026',
      description: 'Join us for the annual RAYAC Convention featuring inspiring speakers, workshops, and networking opportunities.',
      image: 'https://static.wixstatic.com/media/20287c_ff1f2f16447946158d9c326c21b96cab~mv2.png?originWidth=384&originHeight=256',
      cta: 'Register Now',
    },
    {
      id: 2,
      title: 'Youth Leadership Retreat',
      date: 'March 15-17, 2026',
      description: 'An exclusive retreat for young leaders to develop skills and connect with peers.',
      image: 'https://static.wixstatic.com/media/20287c_d90e8253a60140f784dc114ebde2755d~mv2.png?originWidth=384&originHeight=256',
      cta: 'Learn More',
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: 'Submit Prayer Request',
      description: 'Share your prayer needs with the community',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-destructive/20 to-destructive/5',
      borderColor: 'border-destructive/30',
    },
    {
      id: 2,
      title: 'Give Offering',
      description: 'Support RAYAC ministries and programs',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-primary/20 to-primary/5',
      borderColor: 'border-primary/30',
    },
    {
      id: 3,
      title: 'View Directory',
      description: 'Connect with other members',
      icon: <Users className="w-6 h-6" />,
      color: 'from-accent-red/20 to-accent-red/5',
      borderColor: 'border-accent-red/30',
    },
    {
      id: 4,
      title: 'Join Training',
      description: 'Enroll in upcoming training programs',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500/20 to-yellow-500/5',
      borderColor: 'border-yellow-500/30',
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Youth Leadership Retreat',
      date: 'March 15',
      month: 'Mar',
      day: '15',
    },
    {
      id: 2,
      title: 'RAYAC Convention 2026',
      date: 'April 15',
      month: 'Apr',
      day: '15',
    },
    {
      id: 3,
      title: 'Training Workshop',
      date: 'March 22',
      month: 'Mar',
      day: '22',
    },
  ];

  const resources = [
    {
      id: 1,
      title: 'RAYAC Constitution',
      type: 'PDF',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 2,
      title: 'Sermon Audio',
      type: 'Audio',
      icon: <Play className="w-5 h-5" />,
    },
    {
      id: 3,
      title: 'Training Materials',
      type: 'PDF',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      id: 4,
      title: 'Leadership Guides',
      type: 'PDF',
      icon: <BookOpen className="w-5 h-5" />,
    },
  ];

  const galleryImages = [
    {
      id: 1,
      title: 'RAYAC Convention 2025',
      image: 'https://static.wixstatic.com/media/20287c_f8745bcc91a34b8c97a1e24b4b0259ed~mv2.png?originWidth=768&originHeight=576',
    },
    {
      id: 2,
      title: 'Youth Outreach Program',
      image: 'https://static.wixstatic.com/media/20287c_ff1f2f16447946158d9c326c21b96cab~mv2.png',
    },
    {
      id: 3,
      title: 'Church Activities',
      image: 'https://static.wixstatic.com/media/20287c_d90e8253a60140f784dc114ebde2755d~mv2.png',
    },
    {
      id: 4,
      title: 'Leadership Training',
      image: 'https://static.wixstatic.com/media/20287c_69f6c0f98ccc43c7996d26688e9d6cc0~mv2.png?originWidth=768&originHeight=576',
    },
    {
      id: 5,
      title: 'Community Service',
      image: 'https://static.wixstatic.com/media/20287c_ff1f2f16447946158d9c326c21b96cab~mv2.png',
    },
    {
      id: 6,
      title: 'Youth Convention',
      image: 'https://static.wixstatic.com/media/20287c_d90e8253a60140f784dc114ebde2755d~mv2.png',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      className="space-y-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Featured Announcement Carousel */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 border border-accent-red/30 shadow-xl hover:shadow-2xl transition-all duration-300"
      >
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 right-0 w-64 h-64 bg-accent-red/10 rounded-full blur-3xl"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12 relative z-10">
          {/* Image */}
          <motion.div
            className="relative h-72 lg:h-96 rounded-2xl overflow-hidden shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={announcements[currentAnnouncement].image}
              alt={announcements[currentAnnouncement].title}
              className="w-full h-full object-cover"
              width={400}
              originWidth={400}
              originHeight={300}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>

          {/* Content */}
          <div className="flex flex-col justify-center">
            <motion.div
              key={currentAnnouncement}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.p
                className="text-accent-red text-sm font-bold uppercase tracking-widest mb-3"
                animate={{ letterSpacing: ['0.1em', '0.15em', '0.1em'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Featured Event
              </motion.p>
              <h2 className="text-4xl lg:text-5xl font-bold font-heading text-primary-foreground mb-3 leading-tight">
                {announcements[currentAnnouncement].title}
              </h2>
              <p className="text-primary-foreground/80 text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent-red" />
                {announcements[currentAnnouncement].date}
              </p>
              <p className="text-primary-foreground/70 mb-8 leading-relaxed text-lg">
                {announcements[currentAnnouncement].description}
              </p>
            </motion.div>

            <div className="flex gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(160, 0, 0, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-primary to-accent-red hover:from-primary/90 hover:to-accent-red/90 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
              >
                {announcements[currentAnnouncement].cta}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 font-bold px-8 py-3 rounded-xl transition-all"
              >
                Details
              </motion.button>
            </div>

            {/* Carousel Indicators */}
            <div className="flex gap-3">
              {announcements.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentAnnouncement(idx)}
                  className={`rounded-full transition-all ${
                    idx === currentAnnouncement
                      ? 'bg-gradient-to-r from-primary to-accent-red w-8 h-2.5'
                      : 'bg-primary-foreground/30 w-2.5 h-2.5 hover:bg-primary-foreground/50'
                  }`}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={`Go to announcement ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold font-heading text-primary-foreground">Quick Actions</h3>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronRight className="w-6 h-6 text-accent-red" />
          </motion.div>
        </div>
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
        >
          {quickActions.map((action, idx) => (
            <motion.div
              key={action.id}
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
              className={`bg-gradient-to-br ${action.color} border-2 ${action.borderColor} rounded-2xl p-6 cursor-pointer hover:border-accent-red/50 transition-all group relative overflow-hidden`}
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />

              <div className="relative z-10">
                <div className="text-accent-red mb-4 group-hover:scale-125 transition-transform duration-300">
                  {action.icon}
                </div>
                <h4 className="font-bold text-primary-foreground mb-2 text-lg">{action.title}</h4>
                <p className="text-primary-foreground/70 text-sm mb-5">{action.description}</p>
                <button className="flex items-center text-accent-red text-sm font-bold group-hover:gap-2 transition-all hover:scale-105">
                  Go <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Upcoming Events */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold font-heading text-primary-foreground">Upcoming Events</h3>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Calendar className="w-6 h-6 text-accent-red" />
          </motion.div>
        </div>
        <motion.div
          className="grid md:grid-cols-3 gap-5"
          variants={containerVariants}
        >
          {upcomingEvents.map((event, idx) => (
            <motion.div
              key={event.id}
              variants={itemVariants}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(200, 16, 46, 0.15)' }}
              className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 rounded-2xl p-6 hover:border-accent-red/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="bg-gradient-to-br from-primary via-primary to-accent-red rounded-xl p-4 text-white shadow-lg"
                  aria-label={`Date: ${event.month} ${event.day}`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">{event.month}</p>
                  <p className="text-3xl font-bold">{event.day}</p>
                </motion.button>
              </div>
              <h4 className="font-bold text-primary-foreground mb-5 text-lg">{event.title}</h4>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-primary/20 to-accent-red/20 hover:from-primary/30 hover:to-accent-red/30 text-primary-foreground border-2 border-primary/50 rounded-xl py-2.5 font-bold transition-all"
              >
                RSVP
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Media Gallery */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold font-heading text-primary-foreground">Media Gallery</h3>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronRight className="w-6 h-6 text-accent-red" />
          </motion.div>
        </div>
        
        {/* Horizontal Scrolling Carousel */}
        <div className="relative group">
          {/* Scroll Container */}
          <div
            ref={galleryScrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scroll-smooth"
            style={{ scrollBehavior: 'smooth' }}
          >
            {galleryImages.map((item, idx) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 w-64 h-48 rounded-2xl overflow-hidden border-2 border-slate-600 hover:border-accent-red/50 transition-all cursor-pointer group/item relative"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  width={256}
                  originWidth={256}
                  originHeight={192}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end p-4"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <p className="text-primary-foreground font-bold text-sm">{item.title}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Left Scroll Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (galleryScrollRef.current) {
                galleryScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
              }
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 p-2.5 bg-gradient-to-r from-primary to-accent-red hover:from-primary/90 hover:to-accent-red/90 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          {/* Right Scroll Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (galleryScrollRef.current) {
                galleryScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
              }
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 p-2.5 bg-gradient-to-r from-primary to-accent-red hover:from-primary/90 hover:to-accent-red/90 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Resources & Downloads */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl font-bold font-heading text-primary-foreground">Resources & Downloads</h3>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Download className="w-6 h-6 text-accent-red" />
          </motion.div>
        </div>
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
          variants={containerVariants}
        >
          {resources.map((resource, idx) => (
            <motion.div
              key={resource.id}
              variants={itemVariants}
              whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
              className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 rounded-2xl p-6 hover:border-accent-red/50 transition-all group"
            >
              <div className="text-accent-red mb-4 group-hover:scale-125 transition-transform duration-300">
                {resource.icon}
              </div>
              <h4 className="font-bold text-primary-foreground mb-2 text-lg">{resource.title}</h4>
              <p className="text-primary-foreground/60 text-xs mb-5 uppercase tracking-wider font-semibold">{resource.type}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-primary/20 to-accent-red/20 hover:from-primary/30 hover:to-accent-red/30 text-primary-foreground border-2 border-primary/50 rounded-xl py-2.5 flex items-center justify-center gap-2 font-bold transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
