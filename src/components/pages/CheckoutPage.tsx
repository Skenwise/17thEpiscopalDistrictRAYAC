import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Check, ArrowRight, Smartphone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const DEFAULT_PRICE = 50;

const getQueryValue = (params: URLSearchParams, key: string, def = ''): string => {
  const v = params.get(key);
  return v ? decodeURIComponent(v) : def;
};

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // product data coming from query string
  const productName = getQueryValue(searchParams, 'product', 'Item');
  const currency = getQueryValue(searchParams, 'currency', 'ZMW');
  const price = parseFloat(getQueryValue(searchParams, 'price', DEFAULT_PRICE.toString())) || DEFAULT_PRICE;
  const paymentStatus = searchParams.get('payment');

  useEffect(() => {
    if (paymentStatus === 'success') {
      setStep('done');
    }
  }, [paymentStatus]);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !phone || !name) {
      setError('Please fill in all fields.');
      return;
    }

    // simple phone validation
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^260\d{9}$/.test(cleanPhone)) {
      setError('Enter a valid Zambian mobile number (e.g. 260971234567)');
      return;
    }

    setIsLoading(true);
    setStep('processing');

    try {
      // use environment variable if available, otherwise fall back to hard-coded URL
      const url = import.meta.env.VITE_CREATE_CHECKOUT_URL ||
        'https://createcheckout-jjsbakbwia-uc.a.run.app';

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone: cleanPhone,
          name,
          amount: price,
          productName,
          paymentMethod,
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

  // redirect to home if no valid price
  useEffect(() => {
    if (price <= 0) {
      navigate('/');
    }
  }, [price, navigate]);

  return (
    <div className="min-h-screen bg-background font-paragraph overflow-x-clip">
      <Header />

      <section className="relative w-full min-h-[70vh] flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-black/90 to-black" />
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px),
                repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)`
            }}
          />
        </div>

        <div className="relative z-10 max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-3 mb-8 px-6 py-3 border border-accent-red/40 rounded-full bg-accent-red/10 backdrop-blur-sm"
          >
            <Crown className="w-4 h-4 text-accent-red" />
            <span className="text-accent-red font-bold tracking-widest uppercase text-sm">{productName}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8 font-light"
          >
            Pay {currency} {price.toFixed(2)}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-paragraph text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
          >
            You will be redirected to Geepay to complete the transaction using your preferred method.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-12 flex justify-center"
          >
            <a href="#unlock">
              <button className="bg-accent-red hover:bg-accent-red/90 text-white font-bold text-lg px-10 py-5 rounded-full transition-all duration-300 shadow-lg hover:shadow-accent-red/30 hover:-translate-y-1 flex items-center gap-3">
                Continue to payment
                <ArrowRight className="w-5 h-5" />
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* payment form copied from hymn-book with minor tweaks */}
      <section id="unlock" className="relative w-full py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-black" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, rgba(255,255,255,0.05) 31px)`
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 border border-accent-red/40 rounded-full bg-accent-red/10">
              <Crown className="w-4 h-4 text-accent-red" />
              <span className="text-accent-red font-bold tracking-widest uppercase text-sm">Unlock {productName}</span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-white mb-4">
              {currency} {price.toFixed(2)}
            </h2>
            <p className="text-white/60 text-lg">One-time payment • Lifetime access • No subscription</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10">
            {step === 'done' ? (
              <div className="text-center py-16">
                <h2 className="font-heading text-3xl text-green-400 mb-4">Thank you!</h2>
                <p className="text-white/80 mb-6">
                  Your payment was successful. You will be redirected back to the app shortly or you may close this window.
                </p>
                <button
                  className="bg-accent-red hover:bg-accent-red/90 text-white px-8 py-3 rounded-full"
                  onClick={() => window.location.reload()}
                >
                  Reload
                </button>
              </div>
            ) : step === 'processing' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-accent-red/30 border-t-accent-red rounded-full animate-spin mx-auto mb-6" />
                <p className="text-white font-heading text-xl mb-2">Creating your checkout...</p>
                <p className="text-white/50 text-sm">You'll be redirected to complete payment securely.</p>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-6">
                <div>
                  <label className="block text-white/70 text-sm font-semibold mb-2 tracking-wide uppercase">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-accent-red/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-semibold mb-2 tracking-wide uppercase">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-accent-red/60 transition-colors"
                  />
                  <p className="text-white/40 text-xs mt-2">Must match the email used in the app.</p>
                </div>

                <div>
                  <label className="block text-white/70 text-sm font-semibold mb-2 tracking-wide uppercase">Mobile Money Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="260971234567"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-accent-red/60 transition-colors"
                  />
                  <p className="text-white/40 text-xs mt-2">MTN or Airtel — 12 digits starting with 260.</p>
                </div>

                <div>
                  <span className="block text-white/70 text-sm font-semibold mb-2 tracking-wide uppercase">Payment method</span>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="method"
                        value="mobile"
                        checked={paymentMethod === 'mobile'}
                        onChange={() => setPaymentMethod('mobile')}
                      />
                      <span className="text-white text-sm">Mobile Money</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="method"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
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
                      <Crown className="w-5 h-5" />
                      Pay {currency} {price.toFixed(2)}
                    </>
                  )}
                </button>

                <div className="flex items-start gap-3 pt-2">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-white/40 text-xs leading-relaxed">
                    Your payment is processed securely by GeePay. After payment is confirmed, your app unlocks automatically — no manual steps needed.
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
