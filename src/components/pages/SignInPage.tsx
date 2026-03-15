import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SignInPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Try to redirect back to app via deep link
      window.location.href = 'rayac-hymn://auth-callback';

      // Fallback — go to homepage after short delay
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/';
setTimeout(() => navigate(redirect), 1500);
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many attempts. Please try again later.');
          break;
        default:
          setError('Sign in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="w-full py-16 bg-gradient-to-br from-black to-black/80">
        <div className="max-w-[100rem] mx-auto px-6 text-center">
          <div className="bg-accent-red/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-accent-red" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl text-white mb-3">
            Sign In
          </h1>
          <p className="font-paragraph text-white/80 text-lg max-w-xl mx-auto">
            Sign in to your RAYAC account to access the full AME Church Hymn Book.
          </p>
        </div>
      </section>

      <section className="w-full py-16">
        <div className="max-w-md mx-auto px-6">
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="your.email@example.com"
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-accent-red transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 text-gray-800 focus:outline-none focus:border-accent-red transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-accent-red hover:bg-accent-red/90 disabled:opacity-60 text-white font-semibold text-lg rounded-xl transition-all duration-300"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/join" className="text-accent-red font-semibold hover:underline">
                  Create Account
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