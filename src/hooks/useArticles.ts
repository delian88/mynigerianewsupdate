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

    const loadArticles = async () => {
      try {
        setLoading(true);
        console.log('[useArticles] VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('[useArticles] Querying articles for:', { limit, category });
        
        let query = supabase
          .from('articles')
          .select('*')
          // Order by created_at so articles without published_at still appear
          .order('created_at', { ascending: false })
          .limit(limit);

        if (category) {
          if (category === 'Business & Economy') {
            query = query.or('category.eq.Business,category.eq.Economy');
          } else {
            query = query.eq('category', category);
          }
        }

        const { data, error } = await query;
        console.log('[useArticles] Query result:', { count: data?.length, error });
        
        if (error) throw error;
        if (mounted) {
          // If no articles exist in the database, trigger RSS fetch in the background automatically
          if ((!data || data.length === 0) && !category) {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            if (supabaseUrl && anonKey) {
              console.log('[useArticles] Database is empty, triggering edge function fetch...');
              window.fetch(`${supabaseUrl}/functions/v1/fetch-news`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${anonKey}`,
                },
                body: JSON.stringify({}),
              })
                .then(async (res) => {
                  console.log('[useArticles] Edge function response status:', res.status);
                  if (res.ok) {
                    const { data: newData } = await query;
                    console.log('[useArticles] Post-fetch query result:', { count: newData?.length });
                    if (mounted && newData && newData.length > 0) {
                      setArticles(newData.map(a => ({
                        ...a,
                        published_at: a.published_at || a.created_at,
                      })));
                    }
                  }
                })
                .catch((err) => console.error('[useArticles] Failed to auto-fetch news:', err));
            }
          }

          // Normalise: ensure published_at always has a value (fall back to created_at)
          const normalised = (data || []).map(a => ({
            ...a,
            published_at: a.published_at || a.created_at,
          }));
          setArticles(normalised);
        }
      } catch (err: any) {
        console.error('[useArticles] Error fetching articles:', err);
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadArticles();
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
