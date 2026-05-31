import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        
        if (data.user) {
          await supabase.from('notifications').insert([{
            title: 'New user registered',
            message: `${email} created a new premium account`,
            type: 'user',
            read: false
          }]);
        }
        
        if (data.user && data.session === null) {
          // If Supabase has email confirmation enabled
          toast.success('Registration successful! Please confirm your email address.');
          onClose();
        } else {
          toast.success('Account created and logged in!');
          onClose();

          const isAdminEmail = email === 'admin@mynigeria.news' || email === 'superadmin@mynigeria.news';
          if (isAdminEmail) {
            localStorage.setItem('isAdmin', 'true');
            window.location.href = '/admin';
          } else if (data.user) {
            // Fetch role just in case
            const { data: profile } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .single();

            if (profile?.role === 'super_admin') {
              localStorage.setItem('isAdmin', 'true');
              window.location.href = '/admin';
            }
          }
        }
      } else {
        // Sign In — no extra profile round-trip, redirect immediately
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success('Logged in successfully!');
        onClose();

        // Redirect to admin immediately if email matches known admin addresses.
        // For all other users, useAuth's onAuthStateChange will fetch profile
        // in the background and the UI updates reactively.
        if (data.user) {
          const isAdminEmail =
            email === 'admin@mynigeria.news' ||
            email === 'superadmin@mynigeria.news';

          if (isAdminEmail) {
            localStorage.setItem('isAdmin', 'true');
            window.location.href = '/admin';
          } else {
            // Non-blocking: check role quickly from the session metadata first,
            // fall back to a single lightweight profile query.
            const userMeta = data.user.user_metadata;
            if (userMeta?.role === 'super_admin') {
              localStorage.setItem('isAdmin', 'true');
              window.location.href = '/admin';
            } else {
              // Fire profile query without blocking the UI
              supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()
                .then(({ data: prof }) => {
                  if (prof?.role === 'super_admin') {
                    localStorage.setItem('isAdmin', 'true');
                    window.location.href = '/admin';
                  }
                });
            }
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            key="auth-modal"
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[510] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-md bg-white rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.35)] border border-nag-border p-8 md:p-10 overflow-hidden">
              {/* Design Glow Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-nag-green-primary/5 rounded-full blur-3xl" />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-20 w-8 h-8 bg-nag-gray-bg border border-nag-border rounded-full flex items-center justify-center text-gray-500 hover:text-nag-black hover:bg-white transition-all"
              >
                <X size={16} />
              </button>

              {/* Title & Icon Header */}
              <div className="flex flex-col items-center text-center mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-nag-green-primary/10 flex items-center justify-center text-nag-green-primary mb-4 shadow-sm">
                  {isSignUp ? <UserPlus size={24} /> : <LogIn size={24} />}
                </div>
                <h3 className="font-display font-black text-2xl md:text-3xl tracking-tight text-nag-black uppercase">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h3>
                <p className="text-xs text-nag-gray-deep opacity-60 font-medium mt-1.5 max-w-[240px]">
                  {isSignUp 
                    ? 'Join Nigeria\'s leading strategic news and intelligence network.' 
                    : 'Access your premium dashboard, news feed, and marketplace.'}
                </p>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. name@domain.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary/20 focus:border-nag-green-primary outline-none transition-all font-medium text-sm text-nag-black"
                    />
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary/20 focus:border-nag-green-primary outline-none transition-all font-medium text-sm text-nag-black"
                    />
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-nag-black text-white hover:bg-nag-green-primary transition-colors text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-nag-green-primary/10 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    isSignUp ? 'Create Premium Account' : 'Login'
                  )}
                </button>
              </form>

              {/* Mode Toggle Footer */}
              <div className="mt-8 pt-6 border-t border-nag-border flex items-center justify-center text-xs font-medium text-nag-gray-deep relative z-10">
                <span>
                  {isSignUp ? 'Already have an account?' : 'New to MyNigeria.News?'}
                </span>
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="ml-1.5 text-nag-green-primary font-bold hover:underline transition-all"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up Free'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
