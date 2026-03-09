import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { BookOpen, User, Mail, Lock, Phone, MapPin, Church, Users, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const CONFERENCES = [
  'South East Zambia Conference (SEZC)',
  'South West Zambia Conference (SWZC)',
  'Zambezi Conference',
  'North East Zambia Conference (NEZC)',
  'North West Zambia Conference (NWZC)',
  'East Africa Conference (EAC)',
  'Great Lakes Conference (GLC)',
  'Katanga Conference',
  'Kananga Conference',
  'Mbujimayi Conference',
  'Congo River Conference (CRC)',
  'Burundi Conference',
];

export default function JoinPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    conference: '',
    district: '',
    localChurch: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      // Create Firebase Auth account
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(user, { displayName: formData.fullName });

      // Check if they paid before signing up
      let premiumUnlocked = false;
      try {
        const pendingRef = doc(db, 'pendingUnlocks', formData.email);
        const pendingDoc = await getDoc(pendingRef);
        if (pendingDoc.exists()) {
          premiumUnlocked = true;
          await deleteDoc(pendingRef);
        }
      } catch (_) {}

      // Save member profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: formData.email,
        displayName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        conference: formData.conference,
        district: formData.district,
        localChurch: formData.localChurch,
        premiumUnlocked,
        createdAt: new Date(),
        memberSince: new Date().getFullYear(),
      });

      setSuccess(true);

      // Redirect to app via deep link after 2 seconds
      setTimeout(() => navigate('sign-in'), 1500);

    } catch (err: any) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please sign in instead.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setError('Password must be at least 6 characters.');
          break;
        default:
          setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 max-w-md"
          >
            <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="font-heading text-3xl text-accent-red mb-4">Welcome to RAYAC!</h2>
            <p className="font-paragraph text-gray-700 mb-2">
              Your account has been created successfully.
            </p>
            <p className="font-paragraph text-gray-500 text-sm">
              Redirecting you back to the app...
            </p>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="w-full py-16 bg-gradient-to-br from-black to-black/80">
        <div className="max-w-[100rem] mx-auto px-6 text-center">
          <div className="bg-accent-red/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-accent-red" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl text-white mb-3">
            Join RAYAC
          </h1>
          <p className="font-paragraph text-white/80 text-lg max-w-xl mx-auto">
            Create your membership account to access the full AME Church Hymn Book and connect with the RAYAC community.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="w-full py-16">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl border border-accent-red/20 p-8 md:p-12"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Personal Info */}
              <div>
                <h3 className="font-heading text-xl text-accent-red mb-4 flex items-center gap-2">
                  <User className="h-5 w-5" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-accent-red transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Phone Number *
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+260 XXX XXX XXX"
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-accent-red transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address *
                    </label>
                    <input
                      name="address"
                      type="text"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-accent-red transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Church Info */}
              <div>
                <h3 className="font-heading text-xl text-accent-red mb-4 flex items-center gap-2">
                  <Church className="h-5 w-5" /> Church Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Users className="h-3 w-3" /> Conference *
                    </label>
                    <select
                      name="conference"
                      required
                      value={formData.conference}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-accent-red transition-colors bg-white"
                    >
                      <option value="">Select your conference...</option>
                      {CONFERENCES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">District *</label>
                    <input
                      name="district"
                      type="text"
                      required
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="e.g. Lusaka District"
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-accent-red transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Local Church Name *</label>
                    <input
                      name="localChurch"
                      type="text"
                      required
                      value={formData.localChurch}
                      onChange={handleChange}
                      placeholder="e.g. Bethel AME Church"
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-accent-red transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Account */}
              <div>
                <h3 className="font-heading text-xl text-accent-red mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5" /> Account Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address *</label>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-accent-red transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Password *
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 6 characters"
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-accent-red transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Confirm Password *
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className="w-full h-12 px-4 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-accent-red transition-colors"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold text-lg rounded-xl transition-all duration-300"
              >
                {isLoading ? 'Creating Account...' : 'Create RAYAC Account'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/sign-in" className="text-accent-red font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}