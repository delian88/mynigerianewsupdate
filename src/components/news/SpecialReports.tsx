import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'motion/react';
import { ArrowUpRight, BookOpen, Shield, Zap, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { ArticleModal } from './ArticleModal';

const promiseWithTimeout = (promise: Promise<any>, timeoutMs: number = 10000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Strategic Intelligence request timed out'));
    }, timeoutMs);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

const FALLBACK_REPORTS = [
  {
    id: 'f-rep-1',
    title: 'The Lithium Rush: Environmental Cost of the New Energy Frontier',
    category: 'Investigation',
    excerpt: 'An 8-month deep dive into mining operations across Northern Nigeria and the impact on local ecosystems.',
    content: '<p>An 8-month deep dive into mining operations across Northern Nigeria and the impact on local ecosystems.</p>',
    author: 'Adebayo Tiamiyu',
    published_at: '2026-05-28T08:00:00Z',
    created_at: '2026-05-28T08:00:00Z',
    cover_image_url: 'https://media.istockphoto.com/id/2181114788/photo/3d-illustration-of-lithium-ion-battery-packs-on-a-production-line-in-a-manufacturing-facility.webp?a=1&b=1&s=612x612&w=0&k=20&c=nrrtG5CskFXp19TF8Qw5V9Y0DhWjPyVpJbSd-r1rXFY='
  },
  {
    id: 'f-rep-2',
    title: 'Urban Resilience: Lagos 2050 Infrastructure Roadmap',
    category: 'In-Depth',
    excerpt: 'Analyzing the strategic urban planning projects aimed at making Lagos a global megacity by mid-century.',
    content: '<p>Analyzing the strategic urban planning projects aimed at making Lagos a global megacity by mid-century.</p>',
    author: 'Chioma Okereke',
    published_at: '2026-05-15T08:00:00Z',
    created_at: '2026-05-15T08:00:00Z',
    cover_image_url: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFnb3MlMjBuaWdlcmlhfGVufDB8fDB8fHww'
  }
];

export function SpecialReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchSpecialReports = async () => {
      try {
        setLoading(true);
        const { data, error } = await promiseWithTimeout(
          Promise.resolve(
            supabase
              .from('articles')
              .select('*')
              .eq('is_special_report', true)
              .order('created_at', { ascending: false })
          ),
          8000
        ) as any;
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setReports(data);
        } else {
          setReports(FALLBACK_REPORTS);
        }
      } catch (err) {
        console.warn('[SpecialReports] Failed to fetch special reports, loading fallbacks:', err);
        setReports(FALLBACK_REPORTS);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialReports();
  }, []);

  // Carousel Auto-Sliding Loop
  useEffect(() => {
    if (isHovered || reports.length <= 1 || loading) return;

    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;
        // If we are near the end, loop smoothly back to start
        if (scrollLeft + clientWidth >= scrollWidth - 15) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Advance by about half a card width for beautiful fluid movement
          carouselRef.current.scrollTo({ left: scrollLeft + clientWidth * 0.45, behavior: 'smooth' });
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isHovered, reports, loading]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.75;
      const target = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      carouselRef.current.scrollTo({ left: target, behavior: 'smooth' });
    }
  };

  return (
    <section id="special-reports" className="py-24 bg-white w-full overflow-hidden select-none">
      <div className="container-nag px-6 md:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-[2px] bg-nag-green-primary"></div>
              <span className="text-nag-green-primary font-display font-black uppercase tracking-[0.4em] text-[10px]">Strategic Intelligence</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black text-nag-black leading-tight tracking-tighter">Special Reports.</h2>
          </div>
          <p className="text-nag-gray-deep font-medium max-w-xl text-lg opacity-70">
            Our premium investigative unit delivers rigorous, data-driven journalism that goes beneath the surface of the day's headlines.
          </p>
        </div>

        {/* Carousel / Slider Container */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="animate-spin text-nag-green-primary" size={32} />
            <p className="text-nag-gray-deep text-[10px] font-black uppercase tracking-widest animate-pulse">Compiling briefings...</p>
          </div>
        ) : (
          <div className="relative group/carousel">
            
            {/* Nav Arrows */}
            {reports.length > 1 && (
              <>
                <button
                  onClick={() => handleScroll('left')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 text-nag-black border border-nag-border flex items-center justify-center shadow-lg backdrop-blur hover:bg-nag-green-primary hover:text-white transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={() => handleScroll('right')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 text-nag-black border border-nag-border flex items-center justify-center shadow-lg backdrop-blur hover:bg-nag-green-primary hover:text-white transition-all cursor-pointer opacity-0 group-hover/carousel:opacity-100"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Slider track */}
            <div
              ref={carouselRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-6"
            >
              {reports.map((report, i) => (
                <motion.div
                  key={report.id || i}
                  onClick={() => setSelectedArticle(report)}
                  whileHover={{ y: -8 }}
                  className="min-w-[85vw] sm:min-w-[55vw] lg:min-w-[42vw] flex-shrink-0 group relative h-[500px] md:h-[600px] rounded-[40px] overflow-hidden cursor-pointer snap-start transition-all duration-300"
                >
                  {/* Gray-to-Color cover image */}
                  <img
                    src={report.cover_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&fit=crop'}
                    alt={report.title}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-nag-black via-nag-black/45 to-transparent"></div>

                  {/* Card Content Overlay */}
                  <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <span className="px-4 py-2 rounded-xl bg-nag-green-primary/20 backdrop-blur-md border border-nag-green-primary/30 text-nag-green-primary text-[10px] font-black uppercase tracking-widest">
                        {report.category || 'Special Report'}
                      </span>
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:bg-nag-green-primary group-hover:border-nag-green-primary group-hover:text-white transition-all">
                        <ArrowUpRight size={24} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-black text-white leading-tight tracking-tight group-hover:text-nag-green-secondary transition-colors line-clamp-3 uppercase">
                        {report.title}
                      </h3>
                      <p className="text-white/60 text-xs md:text-sm font-medium max-w-xl group-hover:text-white transition-colors line-clamp-3 leading-relaxed">
                        {report.excerpt || report.description || 'Access details inside our Strategic Fact-Checking unit.'}
                      </p>
                      
                      <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-xs uppercase">
                            {(report.author || 'Ed').split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Directed By</p>
                            <p className="text-xs font-bold text-white">{report.author || 'MyNigeria Editorial'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Published</p>
                          <p className="text-xs font-bold text-white">
                            {new Date(report.published_at || report.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Cards Footer section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: BookOpen, 
              title: 'Archived Dossiers', 
              subtitle: 'INVESTIGATIVE ARCHIVE',
              desc: 'Access 2,000+ deep-dive investigative files recorded since 2018.',
              img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=800&fit=crop'
            },
            { 
              icon: Zap, 
              title: 'Real-time Pulse', 
              subtitle: 'LIVE INTELLIGENCE',
              desc: 'Live data visualizations for trending national security & fiscal indices.',
              img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&fit=crop'
            },
            { 
              icon: Shield, 
              title: 'Vetted Evidence', 
              subtitle: 'FACT-CHECKING UNIT',
              desc: 'Our rigorous internal review process ensures multi-source verification.',
              img: 'https://images.unsplash.com/photo-1454165833767-027ff33027ef?q=80&w=800&fit=crop'
            }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -12 }}
              className="group relative h-[320px] md:h-[350px] rounded-[40px] overflow-hidden bg-white border border-nag-border hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:border-nag-green-primary/30 transition-all duration-700 cursor-pointer"
            >
              <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 grayscale">
                <img src={item.img} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white"></div>
              
              <div className="relative h-full p-8 flex flex-col justify-between z-10">
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-nag-gray-bg border border-nag-border flex items-center justify-center text-nag-green-primary group-hover:bg-nag-green-primary group-hover:text-white transition-all duration-500 shadow-sm">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-nag-green-primary mb-2">
                      {item.subtitle}
                    </p>
                    <h4 className="text-2xl font-black text-nag-black tracking-tighter uppercase leading-tight">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-nag-gray-deep font-medium opacity-60 text-sm leading-relaxed max-w-[240px] group-hover:opacity-100 transition-opacity">
                    {item.desc}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-nag-green-primary group-hover:gap-4 transition-all">
                  Explore Hub <ChevronRight size={14} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Dynamic Immersive TipTap ArticleModal Popups */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}

    </section>
  );
}
