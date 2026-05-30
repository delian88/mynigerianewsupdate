import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      // 1. Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Fetch user role from profiles
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profileErr || !profile || profile.role !== 'super_admin') {
          // If not super_admin, log them out and reject
          await supabase.auth.signOut();
          throw new Error('Access denied: Super Admin credentials required.');
        }

        // 3. Mark as admin locally (for backward-compatibility) and redirect
        localStorage.setItem('isAdmin', 'true');
        toast.success('Admin authenticated successfully');
        navigate('/admin');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nag-gray-bg flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] w-full max-w-md border border-nag-border overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-nag-green-primary/5 rounded-full blur-3xl" />

        <div className="flex justify-center mb-6 relative z-10">
          <div className="w-16 h-16 bg-nag-black rounded-2xl flex items-center justify-center text-white shadow-md">
            <Lock size={28} />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-display font-black text-center mb-2 text-nag-black uppercase">
          Super Admin Console
        </h2>
        <p className="text-xs text-center text-nag-gray-deep opacity-60 font-medium mb-8">
          Authorized personnel session authorization portal.
        </p>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary/20 focus:border-nag-green-primary outline-none transition-all font-medium text-sm text-nag-black"
                placeholder="admin@mynigeria.news"
                autoFocus
              />
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black">
              Security Token / Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary/20 focus:border-nag-green-primary outline-none transition-all font-medium text-sm text-nag-black"
                placeholder="••••••••"
              />
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nag-black text-white hover:bg-nag-green-primary transition-all font-black uppercase tracking-widest py-4 rounded-xl shadow-lg hover:shadow-nag-green-primary/10 flex items-center justify-center gap-2 text-[10px]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Access Administration Control'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-nag-border flex items-center justify-center gap-2 text-[9px] text-nag-gray-deep font-semibold uppercase tracking-wider relative z-10">
          <ShieldAlert size={12} className="text-nag-red" />
          <span>Secured by Supabase cryptographic auth</span>
        </div>
      </div>
    </div>
  );
}
