import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BookOpen, Check, Crown, Music, Star, ArrowRight, Smartphone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PRICE_ZMW = 50;

const FadeInUp = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const features = [
  { icon: Music, title: "100+ Traditional Hymns", desc: "Complete collection of AME Church hymns, fully searchable and organized." },
  { icon: BookOpen, title: "Offline Access", desc: "Download hymns for offline use. No internet required during worship." },
  { icon: Star, title: "Save Favourites", desc: "Bookmark your favourite hymns for quick access during service." },
  { icon: Crown, title: "Lifetime Access", desc: "One-time payment. No subscriptions, no recurring charges. Ever." },
];

const steps = [
  { num: "01", title: "Sign In", desc: "Create your account or sign in with your email." },
  { num: "02", title: "Pay via Mobile Money", desc: "Pay securely using MTN or Airtel Mobile Money." },
  { num: "03", title: "App Unlocks Instantly", desc: "Open the app — your full access is already active." },
];

export default function HymnBookPage() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'processing'>('form');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !phone || !name) {
      setError('Please fill in all fields.');
      return;
    }

    // Validate Zambian phone number (12 digits starting with 260)
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^260\d{9}$/.test(cleanPhone)) {
      setError('Enter a valid Zambian mobile number (e.g. 260971234567)');
      return;
    }

    setIsLoading(true);
    setStep('processing');

    try {
      const response = await fetch('https://us-central1-districtrayac.cloudfunctions.net/createCheckout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone: cleanPhone, name }),
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

  return (
    <div className="min-h-screen bg-background font-paragraph overflow-x-clip">
      <Header />

      {/* --- HERO --- */}
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
            <BookOpen className="w-4 h-4 text-accent-red" />
            <span className="text-accent-red font-bold tracking-widest uppercase text-sm">AME Church Hymn Book</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl text-white leading-[1.1] mb-8 font-light"
          >
            Every Hymn. <br />
            <span className="text-accent-red italic font-normal">In Your Pocket.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-paragraph text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed"
          >
            The complete 17th Episcopal District hymnal — digitized, searchable, and always available. One payment, lifetime access.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-12 flex justify-center"
          >
            <a href="#unlock">
              <button className="bg-accent-red hover:bg-accent-red/90 text-white font-bold text-lg px-10 py-5 rounded-full transition-all duration-300 shadow-lg hover:shadow-accent-red/30 hover:-translate-y-1 flex items-center gap-3">
                Get Full Access
                <ArrowRight className="w-5 h-5" />
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section className="relative w-full py-32 bg-white">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <FadeInUp className="text-center mb-20">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-[2px] w-16 bg-secondary" />
              <span className="text-primary font-bold tracking-widest uppercase">What You Get</span>
              <div className="h-[2px] w-16 bg-secondary" />
            </div>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-primary leading-tight">
              Everything You Need <br />
              <span className="text-secondary">for Worship.</span>
            </h2>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <FadeInUp key={f.title} delay={i * 0.1}>
                <div className="group p-8 border border-gray-100 rounded-2xl hover:border-accent-red/30 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="w-14 h-14 bg-primary/5 group-hover:bg-accent-red/10 rounded-xl flex items-center justify-center mb-6 transition-colors duration-300">
                    <f.icon className="w-7 h-7 text-primary group-hover:text-accent-red transition-colors duration-300" />
                  </div>
                  <h3 className="font-heading text-xl text-primary mb-3">{f.title}</h3>
                  <p className="text-secondary text-sm leading-relaxed">{f.desc}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="relative w-full py-32 bg-gray-50">
        <div className="max-w-[100rem] mx-auto px-6 md:px-12 lg:px-24">
          <FadeInUp className="text-center mb-20">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-[2px] w-16 bg-secondary" />
              <span className="text-primary font-bold tracking-widest uppercase">How It Works</span>
              <div className="h-[2px] w-16 bg-secondary" />
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-primary">
              Three Simple Steps
            </h2>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-[1px] bg-gradient-to-r from-transparent via-accent-red/30 to-transparent" />

            {steps.map((s, i) => (
              <FadeInUp key={s.num} delay={i * 0.15}>
                <div className="text-center relative">
                  <div className="w-24 h-24 rounded-full border-2 border-accent-red/20 bg-white flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="font-heading text-2xl text-accent-red font-bold">{s.num}</span>
                  </div>
                  <h3 className="font-heading text-xl text-primary mb-3">{s.title}</h3>
                  <p className="text-secondary text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </div>
              </FadeInUp>
            ))}
          </div>

          <FadeInUp delay={0.3} className="mt-12 flex justify-center">
            <div className="flex items-center gap-3 px-6 py-4 bg-primary/5 rounded-xl border border-primary/10">
              <Smartphone className="w-5 h-5 text-primary" />
              <p className="text-sm text-secondary">
                Don't have the app yet?{' '}
                <a href="#" className="text-accent-red font-semibold hover:underline">Download it free</a>
                {' '}on Google Play.
              </p>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* --- PAYMENT FORM --- */}
      <section id="unlock" className="relative w-full py-32 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-black to-black" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.05) 30px, rgba(255,255,255,0.05) 31px)`
          }}
        />

        <div className="relative z-10 max-w-2xl mx-auto px-6">
          <FadeInUp className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 border border-accent-red/40 rounded-full bg-accent-red/10">
              <Crown className="w-4 h-4 text-accent-red" />
              <span className="text-accent-red font-bold tracking-widest uppercase text-sm">Unlock Full Access</span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-white mb-4">
              ZMW {PRICE_ZMW}.00
            </h2>
            <p className="text-white/60 text-lg">One-time payment • Lifetime access • No subscription</p>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10">
              {step === 'processing' ? (
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
                        Pay ZMW {PRICE_ZMW}.00 — Get Full Access
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
          </FadeInUp>
        </div>
      </section>

      <Footer />
    </div>
  );
}