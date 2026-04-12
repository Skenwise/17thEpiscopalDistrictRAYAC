import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useMember } from '@/hooks/useMember';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  productName: string;
  productType: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: any;
  completedAt?: any;
  paymentMethod?: string;
}

export default function GivingContent() {
  const { member } = useMember();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalGiven, setTotalGiven] = useState(0);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    successfulPayments: 0,
    pendingPayments: 0,
  });

  useEffect(() => {
    if (member?.email) {
      fetchPaymentHistory();
    } else {
      setIsLoading(false);
    }
  }, [member]);

  const fetchPaymentHistory = async () => {
    if (!member?.email) return;
    
    setIsLoading(true);
    try {
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('email', '==', member.email),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(paymentsQuery);
      
      const paymentList: Payment[] = [];
      let total = 0;
      let successful = 0;
      let pending = 0;

      snapshot.forEach(doc => {
        const data = doc.data() as Payment;
        paymentList.push({ id: doc.id, ...data });
        
        if (data.status === 'success') {
          total += data.amount || 0;
          successful++;
        } else if (data.status === 'pending') {
          pending++;
        }
      });

      setPayments(paymentList);
      setTotalGiven(total);
      setStats({
        totalTransactions: paymentList.length,
        successfulPayments: successful,
        pendingPayments: pending,
      });
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return 'Completed';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
    return new Date(timestamp).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold font-heading text-accent-red mb-2">Giving History</h2>
        <p className="text-accent-silver/70">Track your contributions and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2"><DollarSign className="w-6 h-6 text-green-400" /><h3 className="text-slate-400 text-sm">Total Given</h3></div>
          <p className="text-3xl font-bold text-white">{member ? `ZMW ${totalGiven.toLocaleString()}` : 'Sign in to view'}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2"><CheckCircle className="w-6 h-6 text-green-400" /><h3 className="text-slate-400 text-sm">Successful Payments</h3></div>
          <p className="text-3xl font-bold text-white">{stats.successfulPayments}</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2"><Clock className="w-6 h-6 text-yellow-400" /><h3 className="text-slate-400 text-sm">Pending Payments</h3></div>
          <p className="text-3xl font-bold text-white">{stats.pendingPayments}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-primary/30 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700"><h3 className="text-white font-semibold flex items-center gap-2"><Calendar className="w-5 h-5 text-accent-red" />Transaction History</h3></div>

        {!member ? (
          <div className="text-center py-12"><DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4" /><p className="text-slate-400">Please sign in to view your giving history.</p><button onClick={() => window.location.href = '/sign-in'} className="mt-4 bg-accent-red hover:bg-accent-red/90 text-white px-6 py-2 rounded-lg">Sign In</button></div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12"><DollarSign className="w-16 h-16 text-slate-600 mx-auto mb-4" /><p className="text-slate-400">No transactions yet.</p><p className="text-slate-500 text-sm mt-2">Your payment history will appear here once you make a purchase or contribution.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Date</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Item</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-slate-400">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-700">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-slate-300 text-sm">{formatDate(payment.createdAt)}</td>
                    <td className="px-6 py-4 text-white text-sm font-medium">{payment.productName || 'N/A'}</td>
                    <td className="px-6 py-4"><span className={`text-xs px-2 py-1 rounded ${payment.productType === 'offering' ? 'bg-purple-500/20 text-purple-400' : payment.productType === 'event' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{payment.productType || 'General'}</span></td>
                    <td className="px-6 py-4 text-green-400 text-sm font-semibold">{payment.currency || 'ZMW'} {payment.amount?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4"><div className="flex items-center gap-2">{getStatusIcon(payment.status)}<span className={`text-sm ${payment.status === 'success' ? 'text-green-400' : payment.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>{getStatusText(payment.status)}</span></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {member && payments.length > 0 && (<div className="flex justify-end"><button onClick={fetchPaymentHistory} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm">Refresh History</button></div>)}
    </motion.div>
  );
}
