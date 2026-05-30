import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'user' | 'article';
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch real notifications from the table
      const { data: dbNotifs, error: notifErr } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (notifErr) throw notifErr;

      // 2. Fetch recent articles
      const { data: articles } = await supabase
        .from('articles')
        .select('id, title, category, published_at, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // 3. Fetch recent profiles (users)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      // Filter out mock seeded notifications from dbNotifs
      const realDbNotifs = (dbNotifs || []).filter(n => 
        !n.message.includes('john.doe@example.com') &&
        !n.message.includes('civil servants') &&
        !n.message.includes('AWS S3') &&
        !n.message.includes('reported') &&
        !n.title.includes('Breaking news ticker updated')
      );

      // Generate dynamic notifications from actual articles in the DB
      const articleNotifs = (articles || []).map(art => ({
        id: `art-${art.id}`,
        title: 'New article published',
        message: art.title,
        type: 'article' as const,
        read: true,
        created_at: art.published_at || art.created_at
      }));

      // Generate dynamic notifications from actual user profiles in the DB
      const profileNotifs = (profiles || []).map(prof => ({
        id: `prof-${prof.id}`,
        title: 'New user registered',
        message: `${prof.email} signed up`,
        type: 'user' as const,
        read: true,
        created_at: prof.created_at
      }));

      // Combine all real, dynamic elements and sort by date descending
      const combined = [...realDbNotifs, ...articleNotifs, ...profileNotifs]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 15);

      setNotifications(combined);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const channelId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(`realtime:notifications:${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev]);

            // Show custom styled toast alert
            toast(`${newNotif.title}\n${newNotif.message}`, {
              duration: 5000,
              icon: '🔔',
              style: {
                borderRadius: '16px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                fontWeight: 'bold',
                boxShadow: '0 20px 50px rgba(0,0,0,0.08)',
                padding: '12px 16px'
              }
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotif = payload.new as Notification;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedNotif.id ? updatedNotif : n))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper: determine if an ID is synthetic (not a real DB row)
  const isSyntheticId = (id: string) =>
    id.startsWith('art-') || id.startsWith('prof-');

  // Mark specific notification as read
  const markAsRead = async (id: string) => {
    // Always update local state immediately for instant UI feedback
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Only persist to DB for real notification rows
    if (isSyntheticId(id)) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const unreadNotifs = notifications.filter((n) => !n.read);
    if (unreadNotifs.length === 0) return;

    // Immediately update all to read in local state
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success('All notifications marked as read');

    // Only persist real (non-synthetic) IDs to DB
    const realUnreadIds = unreadNotifs
      .filter((n) => !isSyntheticId(n.id))
      .map((n) => n.id);

    if (realUnreadIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', realUnreadIds);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking all as read in DB:', err);
    }
  };

  // Helper to add new notifications programmatically from client
  const addNotification = async (title: string, message: string, type = 'info') => {
    try {
      const { error } = await supabase.from('notifications').insert([
        {
          title,
          message,
          type,
          read: false,
        },
      ]);
      if (error) throw error;
    } catch (err) {
      console.error('Error inserting notification:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  };
}
