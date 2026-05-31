import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  cover_image_url: string | null;
  category: string;
  source_url?: string | null;
  published_at: string;
  created_at: string;
  view_count: number;
}

interface UseArticlesOptions {
  limit?: number;
  category?: string;
}

export function useArticles({ limit = 10, category }: UseArticlesOptions = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetch = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('articles')
          .select('*')
          // Order by created_at so articles without published_at still appear
          .order('created_at', { ascending: false })
          .limit(limit);

        if (category) {
          query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (mounted) {
          // Normalise: ensure published_at always has a value (fall back to created_at)
          const normalised = (data || []).map(a => ({
            ...a,
            published_at: a.published_at || a.created_at,
          }));
          setArticles(normalised);
        }
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetch();
    return () => { mounted = false; };
  }, [limit, category]);

  /** Increment view count via DB RPC, then update local state */
  const incrementView = async (articleId: string) => {
    await supabase.rpc('increment_view_count', { article_id: articleId });
    setArticles(prev =>
      prev.map(a => a.id === articleId ? { ...a, view_count: a.view_count + 1 } : a)
    );
  };

  return { articles, loading, error, incrementView };
}
