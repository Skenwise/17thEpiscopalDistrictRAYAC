import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Calendar, DollarSign, TrendingUp, CheckCircle, Clock, Activity } from 'lucide-react';

interface DashboardStats {
  totalMembers: number;
  newMembersThisMonth: number;
  totalEvents: number;
  upcomingEvents: number;
  totalRSVPs: number;
  totalOfferings: number;
  totalPayments: number;
  recentPayments: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    newMembersThisMonth: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalRSVPs: 0,
    totalOfferings: 0,
    totalPayments: 0,
    recentPayments: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Get total members - this should always work
      let totalMembers = 0;
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        totalMembers = usersSnapshot.size;
      } catch (e) {
        console.warn('Could not fetch users:', e);
      }

      // Get new members this month
      let newMembersThisMonth = 0;
      try {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const newMembersQuery = query(
          collection(db, 'users'),
          where('createdAt', '>=', startOfMonth)
        );
        const newMembersSnapshot = await getDocs(newMembersQuery);
        newMembersThisMonth = newMembersSnapshot.size;
      } catch (e) {
        console.warn('Could not fetch new members:', e);
      }

      // Get total events
      let totalEvents = 0;
      try {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        totalEvents = eventsSnapshot.size;
      } catch (e) {
        console.warn('Could not fetch events:', e);
      }

      // Get upcoming events - simplified (no date filter to avoid errors)
      let upcomingEvents = 0;
      try {
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        upcomingEvents = eventsSnapshot.size;
      } catch (e) {
        console.warn('Could not fetch upcoming events:', e);
      }

      // Get total RSVPs
      let totalRSVPs = 0;
      try {
        const rsvpsSnapshot = await getDocs(collection(db, 'rsvps'));
        totalRSVPs = rsvpsSnapshot.size;
      } catch (e) {
        console.warn('Could not fetch RSVPs:', e);
      }

      // Get payments
      let totalOfferings = 0;
      let totalPayments = 0;
      let recentPayments = [];
      
      try {
        const paymentsQuery = query(collection(db, 'payments'), where('status', '==', 'success'));
        const paymentsSnapshot = await getDocs(paymentsQuery);
        
        paymentsSnapshot.forEach(doc => {
          const data = doc.data();
          const amount = data.amount || 0;
          if (data.productType === 'offering' || data.productName?.toLowerCase().includes('offering')) {
            totalOfferings += amount;
          } else {
            totalPayments += amount;
          }
        });

        // Get recent payments - simplified without orderBy to avoid errors
        const recentSnapshot = await getDocs(query(collection(db, 'payments'), limit(10)));
        recentPayments = recentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn('Could not fetch payments:', e);
      }

      setStats({
        totalMembers,
        newMembersThisMonth,
        totalEvents,
        upcomingEvents,
        totalRSVPs,
        totalOfferings,
        totalPayments,
        recentPayments,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
        <p className="text-red-400">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 bg-accent-red hover:bg-accent-red/90 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Members', value: stats.totalMembers, icon: Users, color: 'bg-blue-500' },
    { title: 'New This Month', value: stats.newMembersThisMonth, icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'bg-purple-500' },
    { title: 'Total Events', value: stats.upcomingEvents, icon: Clock, color: 'bg-yellow-500' },
    { title: 'Total RSVPs', value: stats.totalRSVPs, icon: CheckCircle, color: 'bg-teal-500' },
    { title: 'Offerings (ZMW)', value: `K${stats.totalOfferings.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-500' },
    { title: 'Payments (ZMW)', value: `K${stats.totalPayments.toLocaleString()}`, icon: Activity, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-slate-400 text-sm">Real-time statistics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-accent-red/30 transition-all">
            <div className={`p-3 rounded-xl ${stat.color} bg-opacity-20 inline-block`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mt-4">{stat.value}</h3>
            <p className="text-slate-400 text-sm mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent-red" />
            Recent Transactions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {stats.recentPayments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                stats.recentPayments.map((payment, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-white text-sm">{payment.productName || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{payment.email}</td>
                    <td className="px-6 py-4 text-green-400 text-sm font-semibold">
                      {payment.currency || 'ZMW'} {payment.amount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">
                      {payment.createdAt?.toDate?.()?.toLocaleDateString() || 'Pending'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={fetchDashboardData}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Refresh Data
        </button>
      </div>
    </div>
  );
}
