import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, CheckCircle, DollarSign } from 'lucide-react';
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
      <div><h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Events</h2><p className="text-accent-silver/70">Discover and register for upcoming RAYAC events</p></div>
      {events.length === 0 ? <div className="text-center py-12 bg-slate-800/50 rounded-xl"><Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" /><p className="text-slate-400">No events scheduled at this time.</p></div> :
        <div className="space-y-4">{events.map((event, idx) => (
          <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ y: -4 }} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center justify-center bg-gradient-to-br from-primary to-accent-red rounded-lg p-4 text-white"><p className="text-sm font-semibold">{event.month || 'Jan'}</p><p className="text-3xl font-bold">{event.day || '1'}</p><p className="text-xs">2026</p></div>
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2 flex-wrap"><h3 className="text-xl font-semibold text-accent-red">{event.title}</h3>{event.isPaid ? <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs flex items-center gap-1"><DollarSign className="w-3 h-3" /> Paid · {event.currency} {event.price}</span> : <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">Free</span>}</div>
                <p className="text-accent-silver/70 text-sm">{event.description}</p>
                <div className="space-y-2 text-sm"><div className="flex items-center gap-2 text-accent-silver/80"><Clock className="w-4 h-4 text-accent-red" /><span>{event.time || 'Time TBD'}</span></div><div className="flex items-center gap-2 text-accent-silver/80"><MapPin className="w-4 h-4 text-accent-red" /><span>{event.location || 'Location TBD'}</span></div><div className="flex items-center gap-2 text-accent-silver/80"><Calendar className="w-4 h-4 text-accent-red" /><span>{event.date}</span></div></div>
              </div>
              <div className="flex flex-col gap-2">
                {event.isPaid ? (<><Button onClick={() => handlePaidEvent(event)} className="bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg py-2">Register & Pay</Button><Button variant="outline" className="border-primary/50 text-accent-red hover:bg-primary/10 rounded-lg py-2">Details</Button></>) : (
                  <>{rsvpStatus[event.id] === 'done' ? <div className="flex items-center gap-2 text-green-400 font-semibold justify-center py-2"><CheckCircle className="w-5 h-5" />RSVP'd!</div> : <Button onClick={() => handleFreeRSVP(event)} disabled={rsvpStatus[event.id] === 'loading'} className="bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg py-2">{rsvpStatus[event.id] === 'loading' ? 'Processing...' : 'RSVP (Free)'}</Button>}
                  {rsvpStatus[event.id] === 'error' && <p className="text-red-400 text-xs text-center">Failed. Try again.</p>}
                  <Button variant="outline" className="border-primary/50 text-accent-red hover:bg-primary/10 rounded-lg py-2">Details</Button></>
                )}
              </div>
            </div>
          </motion.div>
        ))}</div>}
    </motion.div>
  );
}
