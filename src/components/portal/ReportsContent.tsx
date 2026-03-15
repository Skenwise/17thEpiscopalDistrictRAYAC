import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportsContent() {
  const reports = [
    { id: 1, title: 'Annual Report 2025', description: 'Comprehensive overview of RAYAC activities and achievements', date: 'December 2025', type: 'PDF', icon: <BarChart3 className="w-6 h-6" /> },
    { id: 2, title: 'Membership Statistics', description: 'Current membership data and growth trends', date: 'March 2026', type: 'PDF', icon: <Users className="w-6 h-6" /> },
    { id: 3, title: 'Financial Report Q1 2026', description: 'Financial performance and budget allocation', date: 'March 2026', type: 'PDF', icon: <TrendingUp className="w-6 h-6" /> },
    { id: 4, title: 'Event Impact Report', description: 'Analysis of events held and their impact', date: 'February 2026', type: 'PDF', icon: <Calendar className="w-6 h-6" /> },
  ];

  const stats = [
    { label: 'Total Members', value: '1,245', change: '+12%' },
    { label: 'Active Events', value: '24', change: '+8%' },
    { label: 'Volunteer Hours', value: '3,450', change: '+25%' },
    { label: 'Programs', value: '18', change: '+3%' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Reports</h2>
        <p className="text-accent-silver/70">Access RAYAC reports and statistics</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6"
          >
            <p className="text-accent-silver/60 text-sm mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-accent-red">{stat.value}</p>
              <p className="text-green-400 text-sm font-semibold">{stat.change}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-semibold text-accent-red mb-4">Available Reports</h3>
        <div className="space-y-4">
          {reports.map((report, idx) => (
            <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6 hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="text-accent-red">{report.icon}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-accent-red mb-1">{report.title}</h4>
                    <p className="text-accent-silver/70 text-sm mb-2">{report.description}</p>
                    <div className="flex gap-4 text-xs text-accent-silver/60">
                      <span>{report.date}</span>
                      <span className="bg-primary/20 px-2 py-1 rounded">{report.type}</span>
                    </div>
                  </div>
                </div>
                <Button className="bg-primary/30 hover:bg-primary/50 text-accent-red border border-primary/50 rounded-lg px-6 py-2 transition-all">
                  Download
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}