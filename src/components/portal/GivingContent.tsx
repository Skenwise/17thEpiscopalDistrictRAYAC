import { motion } from 'framer-motion';
import { Heart, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GivingContent() {
  const givingOptions = [
    { id: 1, title: 'General Fund', description: 'Support RAYAC operations and programs', icon: <Heart className="w-8 h-8" />, color: 'from-red-500/20 to-red-500/5' },
    { id: 2, title: 'Youth Programs', description: 'Invest in youth development and training', icon: <Users className="w-8 h-8" />, color: 'from-blue-500/20 to-blue-500/5' },
    { id: 3, title: 'Scholarship Fund', description: 'Help deserving youth access education', icon: <TrendingUp className="w-8 h-8" />, color: 'from-green-500/20 to-green-500/5' },
  ];

  const stats = [
    { label: 'Total Raised', value: '$45,230' },
    { label: 'Active Donors', value: '128' },
    { label: 'Programs Funded', value: '12' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Give to RAYAC</h2>
        <p className="text-accent-silver/70">Support our mission to empower youth and strengthen communities</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 text-center"
          >
            <p className="text-accent-silver/60 text-sm mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-accent-red">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-accent-red mb-4">Choose Where to Give</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {givingOptions.map((option, idx) => (
            <motion.div key={option.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className={`bg-gradient-to-br ${option.color} border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all`}
            >
              <div className="text-accent-red mb-4">{option.icon}</div>
              <h4 className="text-lg font-semibold text-accent-red mb-2">{option.title}</h4>
              <p className="text-accent-silver/70 text-sm mb-6">{option.description}</p>
              <Button
                onClick={() => window.location.href = `/checkout?product=${encodeURIComponent(option.title)}&price=50&currency=ZMW`}
                className="w-full bg-accent-red hover:bg-accent-red/90 text-white font-semibold rounded-lg py-2 transition-all"
              >
                Give Now
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-accent-red mb-4">Your Giving History</h3>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6">
          <div className="space-y-4">
            {[
              { date: 'March 10, 2026', amount: '$50', fund: 'General Fund' },
              { date: 'February 28, 2026', amount: '$100', fund: 'Youth Programs' },
              { date: 'February 15, 2026', amount: '$25', fund: 'Scholarship Fund' },
            ].map((donation, idx) => (
              <div key={idx} className="flex justify-between items-center pb-4 border-b border-primary/20 last:border-0">
                <div>
                  <p className="text-accent-red font-semibold">{donation.fund}</p>
                  <p className="text-accent-silver/60 text-sm">{donation.date}</p>
                </div>
                <p className="text-accent-red font-bold text-lg">{donation.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary/10 to-accent-red/5 border border-primary/30 rounded-xl p-6">
        <p className="text-accent-silver/80 text-sm">
          <span className="text-accent-red font-semibold">Tax Deductible:</span> RAYAC is a registered 501(c)(3) nonprofit organization. Your donations are tax-deductible. Tax ID: 12-3456789
        </p>
      </div>
    </motion.div>
  );
}