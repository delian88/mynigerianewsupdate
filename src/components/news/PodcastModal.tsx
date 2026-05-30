import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, Volume2, VolumeX, Music, Clock, Calendar, AlertCircle } from 'lucide-react';
import { usePodcasts, DBPodcast } from '../../hooks/usePodcasts';

interface PodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function PodcastModal({ isOpen, onClose }: PodcastModalProps) {
  const { podcasts, loading, error } = usePodcasts();
  const [currentEpisode, setCurrentEpisode] = useState<DBPodcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Auto-set the first episode as default once loaded
  useEffect(() => {
    if (podcasts.length > 0 && !currentEpisode) {
      setCurrentEpisode(podcasts[0]);
    }
  }, [podcasts, currentEpisode]);

  // Control Audio Playback
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error('Playback failed:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentEpisode]);

  // Handle Mute & Volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const selectEpisode = (episode: DBPodcast) => {
    setCurrentEpisode(episode);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const togglePlay = () => {
    if (!currentEpisode && podcasts.length > 0) {
      setCurrentEpisode(podcasts[0]);
    }
    setIsPlaying(!isPlaying);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // Optionally play next episode
    const currentIndex = podcasts.findIndex((p) => p.id === currentEpisode?.id);
    if (currentIndex !== -1 && currentIndex + 1 < podcasts.length) {
      selectEpisode(podcasts[currentIndex + 1]);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="fixed inset-0 z-[510] flex items-center justify-center p-4 md:p-6"
            onClick={onClose}
          >
            <div
              className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-[0_40px_120px_rgba(0,0,0,0.35)] overflow-hidden flex flex-col h-[90vh] md:h-[80vh] border border-nag-border"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-20 w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-nag-black hover:bg-white transition-all shadow-lg hover:scale-105"
              >
                <X size={18} />
              </button>

              {/* Inner Layout */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                
                {/* ── Left Side: Player Control Panel ── */}
                <div className="w-full md:w-5/12 bg-nag-gray-bg border-r border-nag-border p-8 flex flex-col justify-between overflow-y-auto">
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-2px bg-nag-green-primary"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-nag-green-primary">
                        NOW PLAYING
                      </span>
                    </div>

                    {currentEpisode ? (
                      <div className="space-y-6 text-center md:text-left">
                        {/* Thumbnail */}
                        <div className="w-48 h-48 md:w-full md:h-64 mx-auto rounded-2xl overflow-hidden shadow-md border border-nag-border bg-white relative group">
                          {currentEpisode.thumbnail_url ? (
                            <img
                              src={currentEpisode.thumbnail_url}
                              alt={currentEpisode.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-nag-green-primary/30">
                              <Music size={64} className="animate-pulse" />
                            </div>
                          )}
                        </div>

                        {/* Title and Date */}
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-nag-gray-deep flex items-center gap-1.5 justify-center md:justify-start">
                            <Calendar size={12} className="text-nag-green-primary" />
                            {formatDate(currentEpisode.published_at)}
                          </span>
                          <h2 className="text-xl md:text-2xl font-black text-nag-black leading-snug line-clamp-2">
                            {currentEpisode.title}
                          </h2>
                          <p className="text-xs md:text-sm text-nag-gray-deep font-medium leading-relaxed opacity-70 line-clamp-3">
                            {currentEpisode.description || 'No description available for this episode.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-nag-gray-deep opacity-60">
                        <Music size={48} className="mx-auto mb-4" />
                        <p className="font-bold text-sm">Select an episode to start listening</p>
                      </div>
                    )}
                  </div>

                  {/* HTML5 Audio Tag */}
                  {currentEpisode && (
                    <audio
                      ref={audioRef}
                      src={currentEpisode.audio_url}
                      onTimeUpdate={onTimeUpdate}
                      onLoadedMetadata={onLoadedMetadata}
                      onEnded={onAudioEnded}
                    />
                  )}

                  {/* Audio Controls Console */}
                  <div className="mt-8 space-y-4">
                    {/* Time progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-nag-gray-deep tracking-wider">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-nag-green-primary"
                        aria-label="Seek timeline"
                      />
                    </div>

                    {/* Controls Row */}
                    <div className="flex items-center justify-between">
                      {/* Volume Slider */}
                      <div className="flex items-center gap-2 w-28 group">
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-nag-gray-deep hover:text-nag-black transition-colors"
                          aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.05}
                          value={volume}
                          onChange={(e) => {
                            setVolume(Number(e.target.value));
                            setIsMuted(false);
                          }}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-nag-green-primary opacity-60 group-hover:opacity-100 transition-opacity"
                          aria-label="Adjust volume"
                        />
                      </div>

                      {/* Main Play Button */}
                      <button
                        onClick={togglePlay}
                        className="w-14 h-14 rounded-full bg-nag-black text-white hover:bg-nag-green-primary flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95"
                        aria-label={isPlaying ? 'Pause' : 'Play'}
                      >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-1" fill="currentColor" />}
                      </button>

                      {/* Info / Badge placeholder */}
                      <span className="text-[9px] font-black uppercase tracking-widest text-nag-green-primary bg-nag-green-primary/10 px-2 py-1 rounded-md">
                        AAC Audio
                      </span>
                    </div>
                  </div>

                </div>

                {/* ── Right Side: Episode List ── */}
                <div className="w-full md:w-7/12 p-8 flex flex-col overflow-hidden bg-white">
                  <div className="mb-6 flex items-center gap-2 border-b border-nag-border pb-4">
                    <Music size={20} className="text-nag-green-primary" />
                    <h3 className="text-lg md:text-xl font-display font-black tracking-tight text-nag-black uppercase">
                      All Episodes ({podcasts.length})
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-48 space-y-2">
                        <div className="w-8 h-8 border-4 border-t-nag-green-primary border-nag-border rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-nag-gray-deep">Loading latest briefings...</p>
                      </div>
                    ) : error ? (
                      <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-semibold">
                        <AlertCircle size={20} />
                        <span>Failed to load: {error}</span>
                      </div>
                    ) : podcasts.length === 0 ? (
                      <div className="text-center py-20 bg-nag-gray-bg rounded-2xl border border-dashed border-nag-border">
                        <p className="text-sm font-bold text-nag-gray-deep">No podcast episodes available yet.</p>
                      </div>
                    ) : (
                      podcasts.map((episode) => {
                        const isCurrent = currentEpisode?.id === episode.id;
                        return (
                          <div
                            key={episode.id}
                            onClick={() => selectEpisode(episode)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 group ${
                              isCurrent
                                ? 'bg-nag-green-primary/5 border-nag-green-primary/30 shadow-md shadow-nag-green-primary/5'
                                : 'bg-white border-nag-border hover:bg-nag-gray-bg hover:border-nag-green-primary/20 hover:shadow-md'
                            }`}
                          >
                            {/* Thumbnail or Play State icon */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-nag-border shrink-0 bg-white relative flex items-center justify-center">
                              {episode.thumbnail_url ? (
                                <img
                                  src={episode.thumbnail_url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Music size={20} className="text-nag-gray-deep opacity-30" />
                              )}
                              
                              {/* Overlay Play Indicator */}
                              <div className={`absolute inset-0 bg-nag-black/40 flex items-center justify-center text-white transition-opacity ${isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                {isCurrent && isPlaying ? (
                                  <div className="flex gap-0.5 items-end h-4 w-4">
                                    <div className="w-0.5 bg-white h-2 animate-[pulse_0.8s_infinite_alternate]" />
                                    <div className="w-0.5 bg-white h-4 animate-[pulse_0.6s_infinite_alternate_delay-150]" />
                                    <div className="w-0.5 bg-white h-3 animate-[pulse_0.7s_infinite_alternate_delay-300]" />
                                  </div>
                                ) : (
                                  <Play size={16} fill="currentColor" />
                                )}
                              </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <span className="text-[9px] font-bold text-nag-gray-deep uppercase tracking-wider block">
                                {formatDate(episode.published_at)}
                              </span>
                              <h4 className={`text-sm font-bold tracking-tight line-clamp-1 transition-colors ${isCurrent ? 'text-nag-green-primary' : 'text-nag-black group-hover:text-nag-green-primary'}`}>
                                {episode.title}
                              </h4>
                              {episode.description && (
                                <p className="text-xs text-nag-gray-deep line-clamp-1 font-medium opacity-60 leading-none">
                                  {episode.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
