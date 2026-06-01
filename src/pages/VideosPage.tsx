import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Header, TopNav, MobileNav } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { BreakingNewsBar } from '../components/news/BreakingNewsBar';
import { Film, Eye, Clock, X, Sparkles, Loader2, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VideosPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<any>(null);
  
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState<'automotive' | 'realestate' | 'careers'>('automotive');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('videos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setVideos(data || []);
    } catch (err: any) {
      console.error('[VideosPage] Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayVideo = async (video: any) => {
    const updatedViews = (video.views || 0) + 1;
    setActiveVideo({ ...video, views: updatedViews });
    
    try {
      // Increment views count dynamically in Supabase via RPC to support public views increment safely
      await supabase.rpc('increment_video_views', { video_id: video.id });
      
      // Update local state to reflect view count immediately
      setVideos(prev => prev.map(v => v.id === video.id ? { ...v, views: updatedViews } : v));
    } catch (err) {
      console.error('Views increment failed:', err);
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
            <Film className="text-nag-red" size={36} /> Original Videos
          </h1>
          <p className="text-nag-gray-deep mt-1 text-sm font-semibold max-w-xl">
            Deep-dive documentaries, investigative reporting, and high-fidelity video releases from the frontlines of Nigerian news.
          </p>
        </div>

        {/* Video Catalog Listings */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-nag-green-primary" size={40} />
            <p className="text-nag-gray-deep text-xs font-bold uppercase tracking-wider animate-pulse">Consulting video servers...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 bg-white border border-nag-border rounded-[32px]">
            <Film size={48} className="mx-auto text-nag-gray-deep opacity-35 mb-3" />
            <h3 className="text-lg font-black text-nag-black uppercase">No videos published</h3>
            <p className="text-xs text-nag-gray-deep font-semibold">Check back shortly for latest documentary releases.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <motion.div 
                key={video.id}
                onClick={() => handlePlayVideo(video)}
                whileHover={{ y: -8 }}
                className="group bg-white border border-nag-border rounded-[32px] overflow-hidden hover:shadow-2xl hover:border-nag-green-primary/30 transition-all duration-500 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-video relative overflow-hidden bg-black shrink-0">
                  <img 
                    src={video.cover_image_url} 
                    alt={video.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/15 transition-all">
                    <div className="w-14 h-14 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-nag-red group-hover:text-white transition-all duration-300">
                      <Play size={20} className="ml-1" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm px-2.5 py-1 text-white text-[9px] font-black tracking-widest rounded-lg flex items-center gap-1">
                    <Clock size={10} /> {video.duration || '0:00'}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                  <div>
                    <h4 className="font-bold text-base leading-snug text-nag-black line-clamp-2 group-hover:text-nag-green-primary transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-xs text-nag-gray-deep font-semibold opacity-70 mt-2 line-clamp-3 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-nag-border pt-4">
                    <span className="text-[9px] font-black uppercase text-nag-gray-deep tracking-wider flex items-center gap-1">
                      <Eye size={12} className="text-nag-green-primary" /> {video.views || 0} Views
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-nag-red flex items-center gap-1 group-hover:gap-1.5 transition-all">
                      Play Now →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </main>
      <Footer />

      {/* ─── FULLSCREEN IMMERSIVE VIDEO PLAYER OVERLAY ─── */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Blur Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
              onClick={() => setActiveVideo(null)} 
            />

            {/* Video Container Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-nag-black rounded-[36px] overflow-hidden border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] z-[1010] max-w-4xl w-full flex flex-col"
            >
              {/* Close Overlay */}
              <button 
                onClick={() => setActiveVideo(null)}
                className="absolute top-4 right-4 z-50 p-2.5 bg-black/60 hover:bg-nag-red text-white rounded-full transition-colors cursor-pointer border border-white/10"
              >
                <X size={18} />
              </button>

              {/* Video Player */}
              <div className="aspect-video bg-black w-full relative">
                <video 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain" 
                  src={activeVideo.video_url} 
                />
              </div>

              {/* Details Pane */}
              <div className="p-6 md:p-8 bg-zinc-900 border-t border-white/10 text-white space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="bg-nag-red text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg w-fit">
                      Documentary
                    </span>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight uppercase mt-2.5">
                      {activeVideo.title}
                    </h3>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black uppercase text-white/50 tracking-wider">Total Views</p>
                    <p className="text-2xl font-display font-black text-nag-green-secondary tracking-tight mt-0.5">
                      {activeVideo.views || 0}
                    </p>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-zinc-400 font-semibold leading-relaxed border-t border-white/5 pt-4">
                  {activeVideo.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
