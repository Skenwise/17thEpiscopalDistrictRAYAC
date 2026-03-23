import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMember } from '@/hooks/useMember';
import { sendNotification } from '@/lib/notifications';

export default function EventsContent() {
  const { member } = useMember();
  const [rsvpStatus, setRsvpStatus] = useState<Record<number, 'loading' | 'done' | 'error'>>({});

  const events = [
    { id: 1, title: 'Youth Leadership Retreat', date: 'March 15-17, 2026', time: '9:00 AM - 5:00 PM', location: 'RAYAC Conference Center', attendees: 45, description: 'An exclusive retreat for young leaders to develop skills and connect with peers.', month: 'Mar', day: '15' },
    { id: 2, title: 'RAYAC Convention 2026', date: 'April 15-18, 2026', time: 'All Day', location: 'Main Auditorium', attendees: 200, description: 'Annual convention featuring inspiring speakers, workshops, and networking.', month: 'Apr', day: '15' },
    { id: 3, title: 'Training Workshop', date: 'March 22, 2026', time: '2:00 PM - 4:00 PM', location: 'Training Room A', attendees: 30, description: 'Professional development workshop for all members.', month: 'Mar', day: '22' },
  ];

  const handleRSVP = async (event: typeof events[0]) => {
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
        `You have successfully RSVP'd for ${event.title} on ${event.date}.`
      );
      setRsvpStatus(prev => ({ ...prev, [event.id]: 'done' }));
    } catch (error) {
      console.error('RSVP failed:', error);
      setRsvpStatus(prev => ({ ...prev, [event.id]: 'error' }));
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Events</h2>
        <p className="text-accent-silver/70">Discover and register for upcoming RAYAC events</p>
      </div>

      <div className="space-y-4">
        {events.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all"
          >
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent-red rounded-lg p-4 text-white">
                <p className="text-sm font-semibold">{event.month}</p>
                <p className="text-3xl font-bold">{event.day}</p>
                <p className="text-xs">2026</p>
              </div>

              <div className="md:col-span-2 space-y-3">
                <h3 className="text-xl font-semibold text-accent-red">{event.title}</h3>
                <p className="text-accent-silver/70 text-sm">{event.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <Clock className="w-4 h-4 text-accent-red" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <MapPin className="w-4 h-4 text-accent-red" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <Users className="w-4 h-4 text-accent-red" />
                    <span>{event.attendees} attendees</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2">
                {rsvpStatus[event.id] === 'done' ? (
                  <div className="flex items-center gap-2 text-green-400 font-semibold justify-center">
                    <CheckCircle className="w-5 h-5" />
                    RSVP'd!
                  </div>
                ) : (
                  <Button
                    onClick={() => handleRSVP(event)}
                    disabled={rsvpStatus[event.id] === 'loading'}
                    className="bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg py-2 transition-all disabled:opacity-60"
                  >
                    {rsvpStatus[event.id] === 'loading' ? 'Saving...' : 'RSVP'}
                  </Button>
                )}
                {rsvpStatus[event.id] === 'error' && (
                  <p className="text-red-400 text-xs text-center">Failed. Try again.</p>
                )}
                <Button variant="outline" className="border-primary/50 text-accent-red hover:bg-primary/10 rounded-lg py-2">
                  Details
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}