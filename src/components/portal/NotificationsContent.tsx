import { motion } from 'framer-motion';
import { Bell, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationsContent() {
  const notifications = [
    {
      id: 1,
      type: 'event',
      title: 'New Event: Youth Leadership Retreat',
      message: 'A new event has been added to the calendar. Registration is now open.',
      date: '2 hours ago',
      read: false,
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: 2,
      type: 'training',
      title: 'Training Update: Public Speaking Mastery',
      message: 'The Public Speaking Mastery training is starting next week. Enroll now!',
      date: '5 hours ago',
      read: false,
      icon: <AlertCircle className="w-5 h-5" />,
    },
    {
      id: 3,
      type: 'announcement',
      title: 'RAYAC Convention 2026 Registration Open',
      message: 'Early bird registration for the annual convention is now available.',
      date: '1 day ago',
      read: true,
      icon: <Info className="w-5 h-5" />,
    },
    {
      id: 4,
      type: 'order',
      title: 'Order Confirmation',
      message: 'Your order for RAYAC T-shirt has been confirmed and is being processed.',
      date: '2 days ago',
      read: true,
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      id: 5,
      type: 'announcement',
      title: 'New Resources Available',
      message: 'Check out the new training materials and leadership guides in the Resources section.',
      date: '3 days ago',
      read: true,
      icon: <Info className="w-5 h-5" />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Notifications</h2>
          <p className="text-accent-silver/70">Stay updated with the latest news and announcements</p>
        </div>
        <Button variant="outline" className="border-primary/50 text-accent-red hover:bg-primary/10 rounded-lg px-4 py-2">
          Mark All as Read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification, idx) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`rounded-xl p-4 border transition-all ${
              notification.read
                ? 'bg-secondary/20 border-primary/20'
                : 'bg-gradient-to-br from-primary/20 to-accent-red/10 border-primary/40'
            }`}
          >
            <div className="flex gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                notification.read
                  ? 'bg-primary/20 text-accent-silver/60'
                  : 'bg-primary/30 text-accent-red'
              }`}>
                {notification.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold mb-1 ${notification.read ? 'text-accent-silver/80' : 'text-accent-red'}`}>
                  {notification.title}
                </h3>
                <p className="text-accent-silver/70 text-sm mb-2">{notification.message}</p>
                <p className="text-accent-silver/50 text-xs">{notification.date}</p>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex gap-2">
                {!notification.read && (
                  <button className="p-2 hover:bg-primary/20 rounded-lg transition-colors">
                    <CheckCircle className="w-5 h-5 text-accent-red" />
                  </button>
                )}
                <button className="p-2 hover:bg-destructive/20 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5 text-accent-silver/60 hover:text-destructive" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
