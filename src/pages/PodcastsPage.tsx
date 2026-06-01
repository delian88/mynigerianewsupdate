import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Header, TopNav, MobileNav } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { BreakingNewsBar } from '../components/news/BreakingNewsBar';
import { Radio, Play, Pause, Volume2, SkipBack, SkipForward, Loader2, Sparkles, Disc, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PodcastsPage() {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Audio Player States
  const [currentEpisode, setCurrentEpisode] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState<'automotive' | 'realestate' | 'careers'>('automotive');

  useEffect(() => {
    fetchPodcasts();
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('podcasts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPodcasts(data || []);
      if (data && data.length > 0) {
        setCurrentEpisode(data[0]);
      }
    } catch (err: any) {
      console.error('[PodcastsPage] Error fetching podcasts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayEpisode = (episode: any) => {
    if (currentEpisode?.id === episode.id) {
      togglePlay();
    } else {
      setCurrentEpisode(episode);
      setIsPlaying(true);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.warn('Autoplay blocked:', e));
        }
      }, 50);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.warn('Play interrupted:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const formatTime = (timeSecs: number) => {
    if (isNaN(timeSecs)) return '0:00';
    const mins = Math.floor(timeSecs / 60);
    const secs = Math.floor(timeSecs % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-12 mt-16 md:mt-20 mb-32">
        
        {/* Page Banner Header */}
        <div className="mb-12 border-b border-nag-border pb-6">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-nag-green-primary mb-2">
            <Sparkles size={14} /> Explore Media
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-nag-black tracking-tight uppercase flex items-center gap-3">
            <Radio className="text-nag-green-primary" size={36} /> Podcasts & Audio Briefs
          </h1>
          <p className="text-nag-gray-deep mt-1 text-sm font-semibold max-w-xl">
            Listen to expert analysis, daily newsletters, and investigative reports compiled by the frontlines of Nigerian journalism.
          </p>
        </div>

        {/* Podcast Catalog Listings */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-nag-green-primary" size={40} />
            <p className="text-nag-gray-deep text-xs font-bold uppercase tracking-wider animate-pulse">Accessing audio catalog...</p>
          </div>
        ) : podcasts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-nag-border rounded-[32px] max-w-xl mx-auto">
            <Radio size={48} className="mx-auto text-nag-gray-deep opacity-35 mb-3 animate-pulse" />
            <h3 className="text-lg font-black text-nag-black uppercase">No podcasts uploaded</h3>
            <p className="text-xs text-nag-gray-deep font-semibold">Check back shortly for latest audio episodes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {podcasts.map((episode) => {
              const isCurrent = currentEpisode?.id === episode.id;
              return (
                <div 
                  key={episode.id}
                  onClick={() => handlePlayEpisode(episode)}
                  className={`group bg-white border rounded-[32px] overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between h-full ${
                    isCurrent ? 'border-nag-green-primary ring-2 ring-nag-green-primary/10' : 'border-nag-border'
                  }`}
                >
                  <div className="aspect-square bg-nag-gray-bg relative overflow-hidden shrink-0 border-b border-nag-border">
                    {episode.thumbnail_url ? (
                      <img 
                        src={episode.thumbnail_url} 
                        alt={episode.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-nag-gray-deep">
                        <Radio size={48} className="opacity-20" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/15 transition-all">
                      <div className="w-16 h-16 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-nag-green-primary group-hover:text-white transition-all duration-300">
                        {isCurrent && isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-nag-gray-deep opacity-70 mb-1">
                        <Calendar size={11} className="text-nag-green-primary" /> {new Date(episode.published_at || episode.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <h4 className="font-bold text-sm md:text-base leading-snug text-nag-black line-clamp-1 group-hover:text-nag-green-primary transition-colors">
                        {episode.title}
                      </h4>
                      <p className="text-xs text-nag-gray-deep font-semibold opacity-70 mt-1.5 line-clamp-2 leading-relaxed">
                        {episode.description}
                      </p>
                    </div>

                    <span className="text-[9px] font-black uppercase tracking-widest text-nag-green-primary flex items-center gap-1 group-hover:gap-1.5 transition-all border-t border-nag-border/60 pt-3">
                      {isCurrent && isPlaying ? 'Playing Briefing...' : 'Listen Episode →'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
      <Footer />

      {/* ─── HIDDEN AUDIO ELEMENT ─── */}
      {currentEpisode && (
        <audio
          ref={audioRef}
          src={currentEpisode.audio_url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* ─── FLOATING AUDIO CONTROLLER DOCK ─── */}
      <AnimatePresence>
        {currentEpisode && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-4 right-4 md:left-8 md:right-8 z-[900] bg-nag-black text-white rounded-[32px] border border-white/10 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto"
          >
            
            {/* Left: Thumbnail and details */}
            <div className="flex items-center gap-4 w-full md:w-1/3 min-w-0">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden shrink-0 bg-zinc-800 border border-white/10 relative">
                {currentEpisode.thumbnail_url ? (
                  <img src={currentEpisode.thumbnail_url} className="w-full h-full object-cover" alt="Thumb" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <Radio size={20} />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Disc className="animate-spin text-nag-green-secondary" size={18} />
                  </div>
                )}
              </div>
              <div className="leading-tight truncate flex-1">
                <span className="text-[8px] font-black uppercase text-nag-green-secondary tracking-widest">Active Playing briefing</span>
                <h4 className="font-bold text-xs md:text-sm text-white truncate uppercase mt-0.5">{currentEpisode.title}</h4>
                <p className="text-[10px] text-zinc-400 font-semibold truncate mt-0.5">{currentEpisode.description || 'No description provided'}</p>
              </div>
            </div>

            {/* Center: Controls and timeline slider */}
            <div className="flex flex-col items-center gap-1.5 w-full md:w-1/2">
              <div className="flex items-center gap-4">
                <button onClick={skipBackward} className="text-zinc-400 hover:text-white transition-colors cursor-pointer focus:outline-none">
                  <SkipBack size={18} />
                </button>
                <button 
                  onClick={togglePlay} 
                  className="w-10 h-10 rounded-full bg-white text-nag-black flex items-center justify-center shadow-lg hover:scale-105 hover:bg-nag-green-secondary hover:text-white transition-all cursor-pointer focus:outline-none"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>
                <button onClick={skipForward} className="text-zinc-400 hover:text-white transition-colors cursor-pointer focus:outline-none">
                  <SkipForward size={18} />
                </button>
              </div>
              
              <div className="flex items-center gap-2.5 w-full text-[10px] font-bold text-zinc-400 select-none">
                <span>{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-nag-green-secondary focus:outline-none"
                />
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Volume & dashboard indicator */}
            <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
              <Volume2 size={16} className="text-zinc-500" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={e => setVolume(Number(e.target.value))}
                className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-nag-green-secondary focus:outline-none"
              />
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
