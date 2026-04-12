import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Download, TrendingUp, DollarSign, Users, Calendar, Activity, PieChart, ArrowUp, ArrowDown, ShoppingBag, Heart } from 'lucide-react';

interface ReportData {
  totalMembers: number;
  newMembersThisMonth: number;
  newMembersLastMonth: number;
  totalPayments: number;
  totalOfferings: number;
  monthlyRevenue: { month: string; amount: number }[];
  topProducts: { name: string; amount: number; count: number }[];
  eventStats: { name: string; registrations: number }[];
  paymentMethodStats: { method: string; amount: number; count: number }[];
}

export default function ReportsAdmin() {
  const [reportData, setReportData] = useState<ReportData>({
    totalMembers: 0,
    newMembersThisMonth: 0,
    newMembersLastMonth: 0,
    totalPayments: 0,
    totalOfferings: 0,
    monthlyRevenue: [],
    topProducts: [],
    eventStats: [],
    paymentMethodStats: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'all' | 'year' | 'quarter'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Get date boundaries
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Total members
      const usersSnap = await getDocs(collection(db, 'users'));
      const totalMembers = usersSnap.size;

      // New members this month vs last month
      const newThisMonthSnap = await getDocs(query(collection(db, 'users'), where('createdAt', '>=', startOfMonth)));
      const newLastMonthSnap = await getDocs(query(collection(db, 'users'), where('createdAt', '>=', startOfLastMonth), where('createdAt', '<=', endOfLastMonth)));
      const newMembersThisMonth = newThisMonthSnap.size;
      const newMembersLastMonth = newLastMonthSnap.size;

      // Get all successful payments
      const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('status', '==', 'success')));
      
      let totalPayments = 0;
      let totalOfferings = 0;
      let monthlyRevenue: Record<string, number> = {};
      let productSales: Record<string, { amount: number; count: number }> = {};
      let eventRegistrations: Record<string, number> = {};
      let paymentMethods: Record<string, { amount: number; count: number }> = {};

      paymentsSnap.forEach(doc => {
        const data = doc.data();
        const amount = data.amount || 0;
        const productName = data.productName || 'Unknown';
        const productType = data.productType || 'general';
        const method = data.paymentMethod || 'unknown';
        const date = data.createdAt?.toDate?.() || new Date();
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });

        // Monthly revenue
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + amount;

        // Separate offerings vs payments
        if (productType === 'offering' || productName.toLowerCase().includes('offering')) {
          totalOfferings += amount;
        } else {
          totalPayments += amount;
        }

        // Product sales
        if (!productName.toLowerCase().includes('offering')) {
          if (!productSales[productName]) productSales[productName] = { amount: 0, count: 0 };
          productSales[productName].amount += amount;
          productSales[productName].count++;
        }

        // Event registrations
        if (productType === 'event') {
          eventRegistrations[productName] = (eventRegistrations[productName] || 0) + 1;
        }

        // Payment methods
        paymentMethods[method] = paymentMethods[method] || { amount: 0, count: 0 };
        paymentMethods[method].amount += amount;
        paymentMethods[method].count++;
      });

      // Format monthly revenue
      const monthlyRevenueArray = Object.entries(monthlyRevenue)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const aMonth = a.month.split(' ')[0];
          const bMonth = b.month.split(' ')[0];
          return months.indexOf(aMonth) - months.indexOf(bMonth);
        })
        .slice(-12);

      // Top products
      const topProducts = Object.entries(productSales)
        .map(([name, data]) => ({ name, amount: data.amount, count: data.count }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Event stats
      const eventStats = Object.entries(eventRegistrations)
        .map(([name, registrations]) => ({ name, registrations }))
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 5);

      // Payment method stats
      const paymentMethodStats = Object.entries(paymentMethods)
        .map(([method, data]) => ({ method, amount: data.amount, count: data.count }));

      setReportData({
        totalMembers,
        newMembersThisMonth,
        newMembersLastMonth,
        totalPayments,
        totalOfferings,
        monthlyRevenue: monthlyRevenueArray,
        topProducts,
        eventStats,
        paymentMethodStats,
      });
    } catch (error) {
      console.error('Failed to fetch report data:', error);
      setError('Failed to load report data. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const revenueRows = reportData.monthlyRevenue.map(r => [r.month, r.amount]);
    const csvContent = [
      ['=== REVENUE REPORT ==='],
      ['Month', 'Amount (ZMW)'],
      ...revenueRows,
      [],
      ['=== TOP PRODUCTS ==='],
      ['Product', 'Revenue (ZMW)', 'Units Sold'],
      ...reportData.topProducts.map(p => [p.name, p.amount, p.count]),
      [],
      ['=== EVENT REGISTRATIONS ==='],
      ['Event', 'Registrations'],
      ...reportData.eventStats.map(e => [e.name, e.registrations]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const memberGrowthPercent = reportData.newMembersLastMonth > 0 
    ? ((reportData.newMembersThisMonth - reportData.newMembersLastMonth) / reportData.newMembersLastMonth * 100).toFixed(1)
    : reportData.newMembersThisMonth > 0 ? '100' : '0';

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" /></div>;
  }

  if (error) {
    return <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center"><p className="text-red-400">{error}</p><button onClick={fetchReportData} className="mt-4 bg-accent-red hover:bg-accent-red/90 text-white px-6 py-2 rounded-lg">Retry</button></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Financial Reports</h2>
          <p className="text-slate-400 text-sm">Real-time financial and member analytics</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button onClick={fetchReportData} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors">
            <Activity className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-accent-red" />
            <span className={`text-sm flex items-center gap-1 ${Number(memberGrowthPercent) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {Number(memberGrowthPercent) >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {Math.abs(Number(memberGrowthPercent))}%
            </span>
          </div>
          <p className="text-2xl font-bold text-white">{reportData.totalMembers}</p>
          <p className="text-slate-400 text-sm">Total Members</p>
          <p className="text-slate-500 text-xs mt-1">+{reportData.newMembersThisMonth} this month</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <DollarSign className="w-6 h-6 text-green-400 mb-2" />
          <p className="text-2xl font-bold text-white">ZMW {reportData.totalPayments.toLocaleString()}</p>
          <p className="text-slate-400 text-sm">Total Payments</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <Heart className="w-6 h-6 text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-white">ZMW {reportData.totalOfferings.toLocaleString()}</p>
          <p className="text-slate-400 text-sm">Total Offerings</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <TrendingUp className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-2xl font-bold text-white">ZMW {(reportData.totalPayments + reportData.totalOfferings).toLocaleString()}</p>
          <p className="text-slate-400 text-sm">Total Revenue</p>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-accent-red" />Monthly Revenue</h3>
        {reportData.monthlyRevenue.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No revenue data available</p>
        ) : (
          <div className="space-y-3">
            {reportData.monthlyRevenue.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{item.month}</span>
                  <span className="text-white font-semibold">ZMW {item.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-accent-red h-2 rounded-full" style={{ width: `${Math.min(100, (item.amount / Math.max(...reportData.monthlyRevenue.map(r => r.amount))) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-accent-red" />Top Selling Products</h3>
          {reportData.topProducts.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No product sales yet</p>
          ) : (
            <div className="space-y-3">
              {reportData.topProducts.map((product, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm">{product.name}</p>
                    <p className="text-slate-500 text-xs">{product.count} units sold</p>
                  </div>
                  <p className="text-green-400 font-semibold">ZMW {product.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Registrations */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-accent-red" />Top Events</h3>
          {reportData.eventStats.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No event registrations yet</p>
          ) : (
            <div className="space-y-3">
              {reportData.eventStats.map((event, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <p className="text-white text-sm">{event.name}</p>
                  <p className="text-blue-400 font-semibold">{event.registrations} registrations</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-accent-red" />Payment Methods</h3>
        <div className="grid grid-cols-2 gap-4">
          {reportData.paymentMethodStats.map((method, idx) => (
            <div key={idx} className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm capitalize">{method.method || 'Mobile Money'}</p>
              <p className="text-white font-bold text-xl">ZMW {method.amount.toLocaleString()}</p>
              <p className="text-slate-500 text-xs">{method.count} transactions</p>
            </div>
          ))}
          {reportData.paymentMethodStats.length === 0 && (
            <p className="text-slate-400 text-center col-span-2 py-4">No payment data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
