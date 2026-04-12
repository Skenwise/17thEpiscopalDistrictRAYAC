import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Check, ArrowRight, User as UserIcon, Mail, Phone } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const quickAmounts = [10, 20, 50, 100, 200, 500];

interface OfferingFormProps {
  onSuccess?: () => void;
  fund?: string;
}

export default function OfferingForm({ onSuccess, fund = 'General Fund' }: OfferingFormProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        setName(user.displayName || '');
        setEmail(user.email || '');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!name || !email) { setError('Please ensure your name and email are correct.'); return; }
    if (!phone) { setError('Please enter your mobile money number.'); return; }
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) { setError('Please enter a valid offering amount.'); return; }

    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^260\d{9}$/.test(cleanPhone)) {
      setError('Enter a valid Zambian mobile number (e.g. 260971234567)');
      return;
    }

    setIsLoading(true);
    setStep('processing');

    try {
      const url = import.meta.env.VITE_CREATE_CHECKOUT_URL ||
        'https://create-checkout-jjsbakbwia-uc.a.run.app';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone: cleanPhone,
          name,
          amount: parsedAmount,
          productName: `Offering — ${fund}`,
          paymentMethod,
          productType: 'offering',
        }),
      });

      const data = await response.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setStep('form');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" /></div>;
  }

  if (step === 'done') {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-3xl text-green-400 mb-4">Thank You!</h2>
        <p className="text-white/80 mb-2">Your offering to <span className="text-accent-red font-semibold">{fund}</span> has been received.</p>
        <p className="text-white/50 text-sm mb-8">May God bless your generosity.</p>
        {onSuccess && (
          <button onClick={onSuccess} className="bg-accent-red hover:bg-accent-red/90 text-white px-6 py-2 rounded-lg">
            Back to Giving
          </button>
        )}
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin mx-auto mb-6" />
        <p className="text-white text-xl mb-2">Processing your offering...</p>
        <p className="text-white/50 text-sm">You'll be redirected to complete payment securely.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      <div>
        <label className="block text-white/70 text-sm font-semibold mb-3 tracking-wide uppercase">
          Offering Amount (ZMW)
        </label>
        <div className="flex flex-wrap gap-3 mb-4">
          {quickAmounts.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(String(a))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                amount === String(a)
                  ? 'bg-accent-red border-accent-red text-white'
                  : 'bg-white/10 border-white/20 text-white/70 hover:border-accent-red/50'
              }`}
            >
              K{a}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50 font-semibold">K</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter custom amount..."
            min="1"
            className="w-full bg-white/10 border border-white/20 rounded-xl pl-8 pr-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-accent-red/60 transition-colors"
          />
        </div>
        {amount && parseFloat(amount) > 0 && (
          <p className="text-accent-red text-sm mt-2 font-semibold">
            Giving K{parseFloat(amount).toFixed(2)} to {fund}
          </p>
        )}
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Your Information</h3>
          {!editMode && (
            <button type="button" onClick={() => setEditMode(true)} className="text-accent-red text-sm hover:underline">
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <UserIcon className="w-5 h-5 text-white/40" />
            <div className="flex-1">
              {editMode ? (
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white" />
              ) : (
                <div><p className="text-white/50 text-xs">Name</p><p className="text-white">{name || 'Not signed in'}</p></div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-white/40" />
            <div className="flex-1">
              {editMode ? (
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white" />
              ) : (
                <div><p className="text-white/50 text-xs">Email</p><p className="text-white">{email || 'Not signed in'}</p></div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-white/40" />
            <div className="flex-1">
              <div>
                <p className="text-white/50 text-xs">Mobile Money Number *</p>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="260971234567" className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30" />
                <p className="text-white/40 text-xs mt-1">MTN or Airtel — 12 digits starting with 260.</p>
              </div>
            </div>
          </div>
        </div>

        {editMode && (
          <button type="button" onClick={() => setEditMode(false)} className="mt-4 text-green-400 text-sm hover:underline">
            ✓ Save & Continue
          </button>
        )}
      </div>

      <div>
        <span className="block text-white/70 text-sm font-semibold mb-2 tracking-wide uppercase">Payment Method</span>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="method" value="mobile" checked={paymentMethod === 'mobile'} onChange={() => setPaymentMethod('mobile')} />
            <span className="text-white text-sm">Mobile Money</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="method" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
            <span className="text-white text-sm">Card</span>
          </label>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4"><p className="text-red-400 text-sm">{error}</p></div>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-accent-red hover:bg-accent-red/90 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl transition-all flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
        ) : (
          <><Heart className="w-5 h-5" /> Give {amount && parseFloat(amount) > 0 ? `K${parseFloat(amount).toFixed(2)}` : 'Now'}</>
        )}
      </button>
    </form>
  );
}
