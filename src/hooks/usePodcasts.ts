import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DBPodcast {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  thumbnail_url: string | null;
  published_at: string;
  created_at: string;
}

export function usePodcasts() {
  const [podcasts, setPodcasts] = useState<DBPodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPodcasts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('podcasts')
          .select('*')
          .order('published_at', { ascending: false });

        if (error) throw error;
        if (mounted) setPodcasts(data || []);
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPodcasts();
    return () => {
      mounted = false;
    };
  }, []);

  return { podcasts, loading, error };
}
