import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, CheckCircle, DollarSign, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMember } from '@/hooks/useMember';
import { sendNotification } from '@/lib/notifications';
import { useNavigate } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  date: string;
  month: string;
  day: string;
  time: string;
  location: string;
  description: string;
  image: string;
  cta: string;
  featured: boolean;
  isPaid: boolean;
  price: number;
  currency: string;
  paymentLink?: string;
}

export default function EventsContent() {
  const { member } = useMember();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState<Record<string, 'loading' | 'done' | 'error'>>({});

  const fetchEvents = async () => {
    try {
      const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleFreeRSVP = async (event: Event) => {
    if (!member) { alert('Please sign in to RSVP.'); return; }
    setRsvpStatus(prev => ({ ...prev, [event.id]: 'loading' }));
    try {
      await addDoc(collection(db, 'rsvps'), {
        userId: member.userId,
        userEmail: member.email,
        userName: member.displayName,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        isPaid: false,
        amountPaid: 0,
        createdAt: serverTimestamp(),
      });
      await sendNotification(member.userId, 'rsvp', `RSVP Confirmed: ${event.title}`, `You have successfully RSVP'd for ${event.title}.`);
      setRsvpStatus(prev => ({ ...prev, [event.id]: 'done' }));
    } catch (error) { setRsvpStatus(prev => ({ ...prev, [event.id]: 'error' })); }
  };

  const handlePaidEvent = (event: Event) => {
    if (!member) { alert('Please sign in to register.'); navigate('/sign-in?source=website'); return; }
    const paymentUrl = event.paymentLink || `/website-checkout?product=${encodeURIComponent(event.title)}&price=${event.price}&currency=${event.currency}&source=website&type=event&itemId=${event.id}`;
    navigate(paymentUrl);
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" /></div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Events</h2>
        <p className="text-accent-silver/70">Discover and register for upcoming RAYAC events</p>
      </div>
      
      {events.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/50 rounded-xl">
          <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No events scheduled at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl overflow-hidden hover:border-primary/50 transition-all group"
            >
              {/* Event Image */}
              {event.image ? (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                  {event.featured && (
                    <span className="absolute top-4 right-4 bg-accent-red text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Featured
                    </span>
                  )}
                  {event.isPaid && (
                    <span className="absolute bottom-4 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> {event.currency} {event.price}
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative h-48 bg-gradient-to-br from-primary/30 to-accent-red/30 flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-white/30" />
                  {event.featured && (
                    <span className="absolute top-4 right-4 bg-accent-red text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      Featured
                    </span>
                  )}
                  {event.isPaid && (
                    <span className="absolute bottom-4 right-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> {event.currency} {event.price}
                    </span>
                  )}
                </div>
              )}
              
              {/* Event Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-gradient-to-br from-primary to-accent-red text-white text-xs font-bold px-2 py-1 rounded">
                        {event.month || 'JAN'} {event.day || '1'}
                      </span>
                      <h3 className="text-xl font-semibold text-accent-red">{event.title}</h3>
                    </div>
                    {!event.isPaid && (
                      <span className="inline-block bg-blue-500/20 text-blue-400 text-xs font-semibold px-2 py-0.5 rounded">
                        Free Event
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-accent-silver/70 text-sm mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <Clock className="w-4 h-4 text-accent-red" />
                    <span>{event.time || 'Time TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <MapPin className="w-4 h-4 text-accent-red" />
                    <span className="truncate">{event.location || 'Location TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-accent-silver/80">
                    <Calendar className="w-4 h-4 text-accent-red" />
                    <span>{event.date}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-4">
                  {event.isPaid ? (
                    <>
                      <Button 
                        onClick={() => handlePaidEvent(event)} 
                        className="flex-1 bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg py-2 transition-all"
                      >
                        Register & Pay
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-primary/50 text-accent-red hover:bg-primary/10 rounded-lg py-2"
                        onClick={() => window.open(`/event/${event.id}`, '_blank')}
                      >
                        Details
                      </Button>
                    </>
                  ) : (
                    <>
                      {rsvpStatus[event.id] === 'done' ? (
                        <div className="flex-1 flex items-center justify-center gap-2 text-green-400 font-semibold py-2 border border-green-400/30 rounded-lg bg-green-400/10">
                          <CheckCircle className="w-4 h-4" /> RSVP'd!
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleFreeRSVP(event)} 
                          disabled={rsvpStatus[event.id] === 'loading'} 
                          className="flex-1 bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg py-2 transition-all"
                        >
                          {rsvpStatus[event.id] === 'loading' ? 'Processing...' : 'RSVP (Free)'}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="border-primary/50 text-accent-red hover:bg-primary/10 rounded-lg py-2"
                        onClick={() => window.open(`/event/${event.id}`, '_blank')}
                      >
                        Details
                      </Button>
                    </>
                  )}
                </div>
                {rsvpStatus[event.id] === 'error' && (
                  <p className="text-red-400 text-xs text-center mt-2">Failed. Try again.</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}