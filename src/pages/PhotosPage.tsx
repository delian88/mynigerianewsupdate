import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Header, TopNav, MobileNav } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { BreakingNewsBar } from '../components/news/BreakingNewsBar';
import { ImageIcon, X, Sparkles, Loader2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PhotosPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Gallery Slideshow state
  const [activeStory, setActiveStory] = useState<any>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState<'automotive' | 'realestate' | 'careers'>('automotive');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('photo_stories').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setStories(data || []);
    } catch (err: any) {
      console.error('[PhotosPage] Error fetching stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStory = (story: any) => {
    setActiveStory(story);
    setCurrentSlideIndex(0);
  };

  const handleNextSlide = () => {
    if (activeStory && activeStory.images) {
      setCurrentSlideIndex(prev => (prev + 1) % activeStory.images.length);
    }
  };

  const handlePrevSlide = () => {
    if (activeStory && activeStory.images) {
      setCurrentSlideIndex(prev => (prev - 1 + activeStory.images.length) % activeStory.images.length);
    }
  };

  return (
    <div className="min-h-screen bg-nag-gray-bg flex flex-col font-sans">
      <BreakingNewsBar />
      <Header showIntelligence={showIntelligence} setShowIntelligence={setShowIntelligence} />
      <TopNav 
        showIntelligence={showIntelligence} 
        setShowIntelligence={setShowIntelligence} 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        activeMarketplaceTab={activeMarketplaceTab}
        setActiveMarketplaceTab={setActiveMarketplaceTab}
      />
      <MobileNav 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        activeMarketplaceTab={activeMarketplaceTab}
        setActiveMarketplaceTab={setActiveMarketplaceTab}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-12 mt-16 md:mt-20">
        
        {/* Page Banner Header */}
        <div className="mb-12 border-b border-nag-border pb-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-nag-green-primary mb-2">
            <Sparkles size={14} /> Explore Media
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-nag-black tracking-tight uppercase flex items-center gap-3">
            <ImageIcon className="text-purple-600" size={36} /> Photo Stories
          </h1>
          <p className="text-nag-gray-deep mt-1 text-sm font-semibold max-w-xl">
            Capturing the cultural essence, architectural rise, and everyday street scenes of Nigeria through the lens of dedicated photojournalism.
          </p>
        </div>

        {/* Stories Catalog Listings */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-nag-green-primary" size={40} />
            <p className="text-nag-gray-deep text-xs font-bold uppercase tracking-wider animate-pulse">Browsing photographic archives...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20 bg-white border border-nag-border rounded-[32px] max-w-xl mx-auto">
            <ImageIcon size={48} className="mx-auto text-nag-gray-deep opacity-35 mb-3" />
            <h3 className="text-lg font-black text-nag-black uppercase">No photo stories uploaded</h3>
            <p className="text-xs text-nag-gray-deep font-semibold">Check back shortly for latest visual stories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <motion.div 
                key={story.id}
                onClick={() => handleOpenStory(story)}
                whileHover={{ y: -8 }}
                className="group bg-white border border-nag-border rounded-[32px] overflow-hidden hover:shadow-2xl hover:border-nag-green-primary/30 transition-all duration-500 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-video relative overflow-hidden bg-nag-gray-bg border-b border-nag-border shrink-0">
                  <img 
                    src={story.cover_image_url} 
                    alt={story.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute bottom-3 right-3 bg-black/85 backdrop-blur-sm px-2.5 py-1 text-white text-[9px] font-black tracking-widest rounded-lg flex items-center gap-1 shadow-sm">
                    <BookOpen size={10} /> {story.images?.length || 0} Photos
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-base leading-snug text-nag-black line-clamp-2 group-hover:text-nag-green-primary transition-colors">
                      {story.title}
                    </h4>
                    <p className="text-xs text-nag-gray-deep font-semibold opacity-70 mt-2 line-clamp-3 leading-relaxed">
                      {story.description}
                    </p>
                  </div>

                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 flex items-center gap-1 group-hover:gap-1.5 transition-all border-t border-nag-border/60 pt-3">
                    Open Photo Essay →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </main>
      <Footer />

      {/* ─── FULLSCREEN DETAILED PHOTO SLIDESHOW OVERLAY ─── */}
      <AnimatePresence>
        {activeStory && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Blur Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/95 backdrop-blur-md" 
              onClick={() => setActiveStory(null)} 
            />

            {/* Slider Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-zinc-950 text-white rounded-[36px] overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] z-[1010] max-w-4xl w-full flex flex-col max-h-[90vh]"
            >
              {/* Close Overlay */}
              <button 
                onClick={() => setActiveStory(null)}
                className="absolute top-4 right-4 z-50 p-2.5 bg-black/60 hover:bg-nag-red text-white rounded-full transition-colors cursor-pointer border border-white/10"
              >
                <X size={18} />
              </button>

              {/* Photo Display View */}
              <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                {activeStory.images && activeStory.images.length > 0 ? (
                  <>
                    <img 
                      className="w-full h-full object-contain max-h-[70vh] transition-all select-none" 
                      src={activeStory.images[currentSlideIndex]} 
                      alt={`Slide ${currentSlideIndex + 1}`} 
                    />

                    {/* Prev Arrow */}
                    <button 
                      onClick={handlePrevSlide}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-white hover:text-black text-white rounded-full transition-all cursor-pointer border border-white/10 shadow-lg"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    {/* Next Arrow */}
                    <button 
                      onClick={handleNextSlide}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-white hover:text-black text-white rounded-full transition-all cursor-pointer border border-white/10 shadow-lg"
                    >
                      <ChevronRight size={20} />
                    </button>

                    {/* Indicator dots badge */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 select-none">
                      <span>{currentSlideIndex + 1}</span>
                      <span className="opacity-55">/</span>
                      <span className="opacity-55">{activeStory.images.length}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-zinc-500 py-24">No images attached to this photo story.</div>
                )}
              </div>

              {/* Footer Excerpt details */}
              <div className="p-6 md:p-8 bg-zinc-900 border-t border-white/10 text-white space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="bg-purple-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg w-fit">
                      Photo Journalism Story
                    </span>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight uppercase mt-2.5">
                      {activeStory.title}
                    </h3>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-zinc-400 font-semibold leading-relaxed border-t border-white/5 pt-4">
                  {activeStory.description}
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
