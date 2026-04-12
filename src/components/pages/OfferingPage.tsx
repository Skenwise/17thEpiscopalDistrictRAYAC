import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Check, ArrowRight, User as UserIcon, Mail, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const quickAmounts = [10, 20, 50, 100, 200, 500];

export default function OfferingPage() {
  const [searchParams] = useSearchParams();
  const fund = searchParams.get('fund') ? decodeURIComponent(searchParams.get('fund')!) : 'General Fund';
  const presetAmount = searchParams.get('amount');
  const paymentStatus = searchParams.get('payment');

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(presetAmount || '');
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');
  const [editMode, setEditMode] = useState(false);

  // Get logged-in user
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

  useEffect(() => {
    if (paymentStatus === 'success') setStep('done');
  }, [paymentStatus]);

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
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-paragraph overflow-x-clip">
      <Header />

      <section className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-black/90 to-black" />
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px),
                repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)`
            }}
          />
        </div>

        <div className="relative z-10 max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-8 px-6 py-3 border border-accent-red/40 rounded-full bg-accent-red/10 backdrop-blur-sm"
          >
            <Heart className="w-4 h-4 text-accent-red" />
            <span className="text-accent-red font-bold tracking-widest uppercase text-sm">{fund}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl md:text-7xl text-white leading-[1.1] mb-6 font-light"
          >
            Give an Offering
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-paragraph text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
          >
            Your generosity supports RAYAC's mission to empower youth and strengthen communities across the 17th Episcopal District.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-10 flex justify-center"
          >
            <a href="#offering-form">
              <button className="bg-accent-red hover:bg-accent-red/90 text-white font-bold text-lg px-10 py-5 rounded-full transition-all duration-300 shadow-lg hover:shadow-accent-red/30 hover:-translate-y-1 flex items-center gap-3">
                Give Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      <section id="offering-form" className="relative w-full py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-black" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, rgba(255,255,255,0.05) 31px)`
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 border border-accent-red/40 rounded-full bg-accent-red/10">
              <Heart className="w-4 h-4 text-accent-red" />
              <span className="text-accent-red font-bold tracking-widest uppercase text-sm">{fund}</span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-white mb-4">Your Offering</h2>
            <p className="text-white/60 text-lg">Enter any amount — every contribution makes a difference</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10">
            {step === 'done' ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="font-heading text-3xl text-green-400 mb-4">Thank You!</h2>
                <p className="text-white/80 mb-2">Your offering to <span className="text-accent-red font-semibold">{fund}</span> has been received.</p>
                <p className="text-white/50 text-sm mb-8">May God bless your generosity.</p>
                <button
                  className="bg-accent-red hover:bg-accent-red/90 text-white px-8 py-3 rounded-full"
                  onClick={() => window.location.href = '/portal'}
                >
                  Back to Portal
                </button>
              </div>
            ) : step === 'processing' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin mx-auto mb-6" />
                <p className="text-white font-heading text-xl mb-2">Processing your offering...</p>
                <p className="text-white/50 text-sm">You'll be redirected to complete payment securely.</p>
              </div>
            ) : (
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
                      <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="text-accent-red text-sm hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <UserIcon className="w-5 h-5 text-white/40" />
                      <div className="flex-1">
                        {editMode ? (
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent-red/60"
                          />
                        ) : (
                          <div>
                            <p className="text-white/50 text-xs">Name</p>
                            <p className="text-white">{name || 'Not signed in'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-white/40" />
                      <div className="flex-1">
                        {editMode ? (
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent-red/60"
                          />
                        ) : (
                          <div>
                            <p className="text-white/50 text-xs">Email</p>
                            <p className="text-white">{email || 'Not signed in'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-white/40" />
                      <div className="flex-1">
                        <div>
                          <p className="text-white/50 text-xs">Mobile Money Number *</p>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="260971234567"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent-red/60"
                          />
                          <p className="text-white/40 text-xs mt-1">MTN or Airtel — 12 digits starting with 260.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {editMode && (
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="mt-4 text-green-400 text-sm hover:underline"
                    >
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

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-accent-red hover:bg-accent-red/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-red/30 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5" />
                      Give {amount && parseFloat(amount) > 0 ? `K${parseFloat(amount).toFixed(2)}` : 'Now'}
                    </>
                  )}
                </button>

                <div className="flex items-start gap-3 pt-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-white/40 text-xs leading-relaxed">
                    Your offering is processed securely by GeePay. RAYAC is grateful for your generosity and support.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
