import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Eye, ExternalLink, Tag } from 'lucide-react';
import type { Article } from '../../hooks/useArticles';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return '';
  }
}

export function ArticleModal({ article, onClose }: ArticleModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (article) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [article]);

  return (
    <AnimatePresence>
      {article && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[510] flex items-start justify-center overflow-y-auto py-8 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.35)] overflow-hidden">

              {/* Cover Image */}
              {article.cover_image_url && (
                <div className="relative h-72 md:h-96 overflow-hidden">
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-nag-black hover:bg-white transition-all shadow-lg"
              >
                <X size={18} />
              </button>

              {/* Content */}
              <div className={`px-6 md:px-12 pb-12 ${!article.cover_image_url ? 'pt-16' : 'pt-6'}`}>

                {/* Meta Top */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-nag-green-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                    <Tag size={10} />
                    {article.category || 'News'}
                  </span>

                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                    <Clock size={12} />
                    {timeAgo(article.published_at)}
                  </span>

                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                    <Eye size={12} />
                    {(article.view_count || 0).toLocaleString()} views
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-4xl font-display font-black text-nag-black leading-tight tracking-tighter mb-4">
                  {article.title}
                </h1>

                {/* Date */}
                <p className="text-xs text-gray-400 font-medium mb-8 flex items-center gap-2">
                  <Clock size={12} />
                  Published: {formatDate(article.published_at)}
                </p>

                {/* Article Body */}
                <div
                  className="prose prose-lg max-w-none text-nag-gray-deep leading-relaxed
                    prose-headings:font-black prose-headings:text-nag-black prose-headings:tracking-tight
                    prose-a:text-nag-green-primary prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                    prose-p:mb-4 prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: article.content || '<p>No content available.</p>' }}
                />

                {/* Source Link */}
                {article.source_url && (
                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <a
                      href={article.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-nag-green-primary hover:text-nag-black transition-colors"
                    >
                      <ExternalLink size={14} />
                      Read Original Source
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
