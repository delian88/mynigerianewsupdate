import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Clock, Eye, Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Article } from '../../hooks/useArticles';
import { ArticleModal } from './ArticleModal';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SUGGESTIONS = [
  'Naira',
  'Dangote',
  'Politics',
  'Budget',
  'Infrastructure',
  'Business'
];

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return 'Recently';
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return 'Recently';
    const diff = Date.now() - date.getTime();
    if (diff < 0) return 'Just now';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return 'Recently';
  }
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Article[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Debounced search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setSearching(true);
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .or(`title.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleResultClick = (article: Article) => {
    setSelectedArticle(article);
  };

  return (
    <>
      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-xl flex flex-col p-6 md:p-12 overflow-y-auto"
          >
            {/* Header / Close button */}
            <div className="flex justify-between items-center max-w-5xl w-full mx-auto mb-10 md:mb-16">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-nag-green-primary">Search Intel</span>
              <button
                onClick={onClose}
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>

            {/* Input & Search Area */}
            <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col">
              <div className="relative mb-8 md:mb-12">
                <Search size={32} className="absolute left-0 top-1/2 -translate-y-1/2 text-white/30 hidden md:block" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type to search global intelligence or national news..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full md:pl-12 pr-4 py-4 md:py-6 text-xl md:text-4xl font-display font-black text-white bg-transparent border-b-2 border-white/10 focus:border-nag-green-primary outline-none transition-all placeholder:text-white/20 tracking-tight"
                />
                
                {searching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-nag-green-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Suggestions / Results Grid */}
              <div className="flex-1">
                {query.trim() === '' ? (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-4">Trending Searches</h4>
                      <div className="flex flex-wrap gap-2.5">
                        {POPULAR_SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-5 py-2.5 bg-white/5 hover:bg-nag-green-primary hover:text-white border border-white/5 rounded-xl text-xs font-bold text-white/80 transition-all cursor-pointer"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                        {searching ? 'Searching...' : `Search Results (${results.length})`}
                      </h4>
                    </div>

                    {results.length === 0 && !searching ? (
                      <div className="py-20 text-center space-y-4">
                        <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-white/30 mx-auto">
                          <Newspaper size={24} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-white uppercase">No reports matched</h3>
                          <p className="text-xs text-white/40">Try searching for alternative topics or check spelling.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {results.map((article, i) => (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={article.id}
                            onClick={() => handleResultClick(article)}
                            className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group flex gap-4"
                          >
                            {article.cover_image_url && (
                              <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-white/5 border border-white/5">
                                <img
                                  src={article.cover_image_url}
                                  alt={article.title}
                                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform group-hover:scale-105 duration-500"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              </div>
                            )}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <span className="text-[8px] font-black text-nag-green-primary uppercase tracking-[0.2em] block mb-1">
                                  {article.category || 'News'}
                                </span>
                                <h3 className="text-sm font-bold text-white leading-snug group-hover:text-nag-green-primary transition-colors line-clamp-2">
                                  {article.title}
                                </h3>
                              </div>
                              <div className="flex items-center gap-4 text-[10px] text-white/40 font-semibold mt-2">
                                <span className="flex items-center gap-1">
                                  <Clock size={10} /> {timeAgo(article.published_at)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye size={10} /> {(article.view_count || 0).toLocaleString()} views
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-center shrink-0 w-8 text-white/20 group-hover:text-nag-green-primary group-hover:translate-x-1 transition-all">
                              <ArrowRight size={16} />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
