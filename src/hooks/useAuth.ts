import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  role: 'super_admin' | 'user';
  created_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      const isAdminEmail = userEmail === 'admin@mynigeria.news' || userEmail === 'superadmin@mynigeria.news';

      if (data && !error) {
        const mergedProfile = { ...data } as Profile;
        if (isAdminEmail) {
          mergedProfile.role = 'super_admin';
        }
        setProfile(mergedProfile);
      } else {
        if (isAdminEmail) {
          setProfile({
            id: uid,
            email: userEmail || '',
            role: 'super_admin',
            created_at: new Date().toISOString()
          });
        } else {
          setProfile(null);
        }
      }
    } catch {
      const isAdminEmail = userEmail === 'admin@mynigeria.news' || userEmail === 'superadmin@mynigeria.news';
      if (isAdminEmail) {
        setProfile({
          id: uid,
          email: userEmail || '',
          role: 'super_admin',
          created_at: new Date().toISOString()
        });
      } else {
        setProfile(null);
      }
    }
  };

  useEffect(() => {
    // Single source of truth: onAuthStateChange handles both the initial
    // session (INITIAL_SESSION event) and all subsequent auth changes.
    // This avoids a duplicate fetchProfile on page load.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}
