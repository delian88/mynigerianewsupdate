import { useState } from 'react';
import { TrendingUp, CheckCircle, Bookmark, Share2, ChevronRight, ArrowLeft, ArrowRight, Clock, Eye, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useArticles } from '../../hooks/useArticles';
import { ArticleModal } from './ArticleModal';
import type { Article } from '../../hooks/useArticles';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1200';

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

function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return 'Unknown date';
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return 'Unknown date';
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    };
    try {
      return date.toLocaleDateString('en-NG', options);
    } catch {
      return date.toLocaleDateString(undefined, options);
    }
  } catch {
    return 'Unknown date';
  }
}

const mustRead = [
  {
    type: "Editor's Pick",
    icon: "📌",
    title: "Opinion: Why Nigeria's economic recovery feels real this time — and why it could still fail",
    author: "Prof. Uche Nwankwo",
    readTime: "7 min read",
    color: "border-nag-green-primary"
  },
  {
    type: "Fact Check",
    icon: "✅",
    title: "VERDICT: FALSE — Viral claim that CBN banned dollar accounts for individuals",
    author: "Fact Check Desk",
    readTime: "3 min read",
    color: "border-nag-red"
  }
];

export function TrendingSection({ selectedCategory }: { selectedCategory?: string | null }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const { articles, loading, incrementView } = useArticles({ limit: 8, category: selectedCategory || undefined });

  // Defaults shown while loading or when DB is empty
  const defaultTrending = [
    {
      id: 'default-1',
      title: 'Senate approves N35 trillion supplementary budget — full breakdown',
      view_count: 15432,
      category: 'Politics',
      content: 'The massive fiscal injection aims to tackle infrastructure deficits and social welfare programs across all 36 states.',
      excerpt: 'The massive fiscal injection aims to tackle infrastructure deficits and social welfare programs across all 36 states.',
      cover_image_url: FALLBACK_IMAGE,
      published_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      created_at: new Date().toISOString(),
      source_url: null,
    },
    {
      id: 'default-2',
      title: 'Dangote Refinery begins fuel export — what this means for consumers',
      view_count: 12801,
      category: 'Business',
      content: 'Local production reaches a milestone as the first batch of refined petroleum products leaves the Lekki Free Trade Zone.',
      excerpt: 'Local production reaches a milestone as the first batch of refined petroleum products leaves the Lekki Free Trade Zone.',
      cover_image_url: 'https://images.unsplash.com/photo-1768564206500-5cddb1fea679?w=700&auto=format&fit=crop&q=60',
      published_at: new Date(Date.now() - 5 * 3600000).toISOString(),
      created_at: new Date().toISOString(),
      source_url: null,
    },
  ];

  const trendingStories = articles.length > 0 ? articles : defaultTrending;
  const current = trendingStories[activeIndex] ?? trendingStories[0];

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    incrementView(article.id);
  };

  const prev = () => setActiveIndex(i => (i - 1 + trendingStories.length) % trendingStories.length);
  const next = () => setActiveIndex(i => (i + 1) % trendingStories.length);

  // Auto-advance
  useState(() => {
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  });

  return (
    <>
      <ArticleModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />

      <section className="w-full py-8 md:py-12 bg-white border-b border-nag-border overflow-hidden">
        <div className="container-nag px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">

          {/* ── Left: Trending Carousel ─────────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-nag-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-nag-green-primary/10 flex items-center justify-center text-nag-green-primary">
                  <TrendingUp size={20} />
                </div>
                <h2 className="text-xl md:text-2xl font-display font-black tracking-tighter uppercase">Trending &amp; Most Read</h2>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={prev} className="p-2 rounded-full bg-nag-gray-bg hover:bg-nag-green-primary hover:text-white transition-all shadow-sm" aria-label="Previous article">
                  <ArrowLeft size={16} />
                </button>
                <button onClick={next} className="p-2 rounded-full bg-nag-gray-bg hover:bg-nag-green-primary hover:text-white transition-all shadow-sm" aria-label="Next article">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Main Carousel Card */}
            <div
              className="relative h-[320px] md:h-[420px] flex items-center rounded-3xl overflow-hidden border border-nag-border cursor-pointer group"
              onClick={() => current && handleArticleClick(current as Article)}
            >
              {/* Background Image */}
              <AnimatePresence>
                <motion.div
                  key={`bg-${activeIndex}`}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                  className="absolute inset-0 z-0"
                >
                  <img
                    src={current?.cover_image_url || FALLBACK_IMAGE}
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
                </motion.div>
              </AnimatePresence>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="w-full relative z-20 px-8 md:px-12"
                >
                  <div className="flex gap-6 md:gap-10 items-start">
                    <div className="text-5xl md:text-8xl font-display font-black text-white/10 group-hover:text-nag-green-primary/30 transition-colors shrink-0 pt-1">
                      {String(activeIndex + 1).padStart(2, '0')}
                    </div>
                    <div className="space-y-3 md:space-y-5 flex-1">
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-nag-green-primary text-white text-[9px] font-black uppercase tracking-widest mb-3">
                          {current?.category || 'News'}
                        </span>
                        <h3 className="text-2xl md:text-4xl font-bold leading-tight text-white group-hover:text-nag-green-primary transition-colors tracking-tighter line-clamp-3">
                          {current?.title}
                        </h3>
                      </div>

                      <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed max-w-2xl line-clamp-2">
                        {current?.excerpt || (current?.content || '').replace(/<[^>]+>/g, '').substring(0, 200)}
                      </p>

                      {/* Meta row: date + views + CTA */}
                      <div className="flex items-center gap-4 flex-wrap text-[10px] md:text-xs font-black uppercase tracking-widest">
                        {/* Relative time */}
                        <span className="flex items-center gap-1.5 text-white/50">
                          <Clock size={11} />
                          {current ? timeAgo(current.published_at) : ''}
                        </span>

                        {/* Actual date */}
                        <span className="flex items-center gap-1.5 text-white/40">
                          <Calendar size={11} />
                          {current ? formatShortDate(current.published_at) : ''}
                        </span>

                        {/* Views */}
                        <span className="flex items-center gap-1.5 text-white/50">
                          <Eye size={11} />
                          {(current?.view_count || 0).toLocaleString()} views
                        </span>

                        <button className="flex items-center gap-2 text-nag-green-primary hover:gap-3 transition-all ml-auto">
                          Read Full Article <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Pagination dots */}
            <div className="flex items-center gap-2 mt-4 pt-2 mb-8">
              {trendingStories.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Go to article ${i + 1}`}
                  className={`h-1 transition-all rounded-full ${activeIndex === i ? 'w-8 bg-nag-green-primary' : 'w-2 bg-nag-border hover:bg-nag-gray-deep'}`}
                />
              ))}
            </div>

            {/* Article mini-list (below carousel) */}
            {articles.length > 0 && (
              <div className="space-y-3 mb-8">
                {articles.slice(0, 4).map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => handleArticleClick(article)}
                    className="flex gap-4 items-center p-3 rounded-2xl hover:bg-nag-gray-bg transition-all cursor-pointer group border border-transparent hover:border-nag-border"
                  >
                    {article.cover_image_url && (
                      <img
                        src={article.cover_image_url}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black text-nag-green-primary uppercase tracking-widest">{article.category}</span>
                      <p className="text-sm font-bold text-nag-black line-clamp-2 group-hover:text-nag-green-primary transition-colors tracking-tight">{article.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><Clock size={9} /> {timeAgo(article.published_at)}</span>
                        <span className="flex items-center gap-1"><Calendar size={9} /> {formatShortDate(article.published_at)}</span>
                        <span className="flex items-center gap-1"><Eye size={9} /> {(article.view_count || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Newsletter CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-nag-black rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="relative z-10 space-y-2 max-w-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-nag-green-primary/20 flex items-center justify-center text-nag-green-primary">
                    <CheckCircle size={16} />
                  </div>
                  <h4 className="font-display font-black text-xl tracking-tight uppercase">Stay Briefed.</h4>
                </div>
                <p className="text-xs text-white/50 font-medium leading-relaxed">
                  Strategic intelligence delivered to your inbox every morning. Join 50,000+ decision makers who start their day with The Collective.
                </p>
              </div>
              <div className="relative z-10 flex-shrink-0">
                <button className="px-8 py-4 bg-nag-green-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-nag-green-secondary transition-all shadow-lg shadow-nag-green-primary/20">
                  Join the Collective
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-nag-green-primary/10 rounded-full blur-3xl" />
            </motion.div>
          </div>

          {/* ── Right: Must Read + Ad ──────────────────────────────────── */}
          <div className="lg:col-span-4 lg:border-l lg:border-nag-border lg:pl-10">
            <h2 className="text-xl md:text-2xl font-display font-black tracking-tighter uppercase mb-6 md:mb-8 text-nag-black border-b border-nag-border pb-4">
              Must Read Today
            </h2>

            <div className="space-y-4 md:space-y-5">
              {mustRead.map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i}
                  className={`group p-5 md:p-6 rounded-2xl bg-nag-gray-bg border-l-4 ${item.color} hover:bg-white hover:shadow-xl transition-all cursor-pointer relative overflow-hidden`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-nag-black opacity-80">{item.type}</span>
                  </div>
                  <h3 className="text-sm md:text-base font-bold leading-tight mb-4 group-hover:text-nag-green-primary transition-colors tracking-tight">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between pt-4 border-t border-nag-border/50">
                    <div className="text-[9px] md:text-[10px] space-y-0.5">
                      <p className="font-black text-nag-black">{item.author}</p>
                      <p className="font-medium text-nag-gray-deep opacity-60">{item.readTime}</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-nag-gray-deep group-hover:bg-nag-green-primary group-hover:text-white transition-all shadow-sm">
                      <Share2 size={12} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Latest from DB — right column */}
            {articles.slice(4, 7).length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-nag-gray-deep border-b border-nag-border pb-2">Latest</h3>
                {articles.slice(4, 7).map((article) => (
                  <div
                    key={article.id}
                    onClick={() => handleArticleClick(article)}
                    className="cursor-pointer group"
                  >
                    <span className="text-[9px] font-black text-nag-green-primary uppercase tracking-widest">{article.category}</span>
                    <p className="text-sm font-bold text-nag-black line-clamp-2 group-hover:text-nag-green-primary transition-colors">{article.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={9} /> {timeAgo(article.published_at)}</span>
                      <span className="flex items-center gap-1"><Calendar size={9} /> {formatShortDate(article.published_at)}</span>
                      <span className="flex items-center gap-1"><Eye size={9} /> {(article.view_count || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ad Slot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="mt-6 p-8 rounded-3xl bg-nag-green-primary/5 border border-nag-green-primary/20 flex flex-col items-center text-center space-y-4 group cursor-pointer transition-all hover:bg-nag-green-primary/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-nag-green-primary/20 flex items-center justify-center text-nag-green-primary shadow-sm group-hover:scale-110 transition-transform">
                <TrendingUp size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-black text-xl tracking-tight text-nag-black uppercase">Advertise Here</h4>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-nag-green-primary">Reach 12.4M monthly readers</p>
              </div>
              <p className="text-xs text-nag-gray-deep font-medium opacity-60 leading-relaxed max-w-[200px]">
                Partner with Nigeria's most trusted strategic intelligence collective.
              </p>
              <button className="text-[9px] font-black uppercase tracking-widest text-nag-green-primary border-b border-nag-green-primary pb-1 flex items-center gap-2">
                Media Kit 2026 <ChevronRight size={12} />
              </button>
            </motion.div>
          </div>

        </div>
      </section>
    </>
  );
}
