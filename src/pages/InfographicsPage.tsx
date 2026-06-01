import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Header, TopNav, MobileNav } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { BreakingNewsBar } from '../components/news/BreakingNewsBar';
import { FileImage, X, Sparkles, Loader2, ZoomIn, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InfographicsPage() {
  const [infographics, setInfographics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGraphic, setActiveGraphic] = useState<any>(null);
  
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState<'automotive' | 'realestate' | 'careers'>('automotive');

  useEffect(() => {
    fetchInfographics();
  }, []);

  const fetchInfographics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('infographics').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setInfographics(data || []);
    } catch (err: any) {
      console.error('[InfographicsPage] Error fetching infographics:', err);
    } finally {
      setLoading(false);
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
            <FileImage className="text-blue-600" size={36} /> Data Infographics
          </h1>
          <p className="text-nag-gray-deep mt-1 text-sm font-semibold max-w-xl">
            Complex Nigerian financial, cultural, and political stories explained clearly through rigorous high-fidelity data visualization.
          </p>
        </div>

        {/* Infographic Catalog Listings */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-nag-green-primary" size={40} />
            <p className="text-nag-gray-deep text-xs font-bold uppercase tracking-wider animate-pulse">Analyzing statistics library...</p>
          </div>
        ) : infographics.length === 0 ? (
          <div className="text-center py-20 bg-white border border-nag-border rounded-[32px] max-w-xl mx-auto">
            <FileImage size={48} className="mx-auto text-nag-gray-deep opacity-35 mb-3" />
            <h3 className="text-lg font-black text-nag-black uppercase">No infographics found</h3>
            <p className="text-xs text-nag-gray-deep font-semibold">Check back shortly for latest visual charts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {infographics.map((graphic) => (
              <motion.div 
                key={graphic.id}
                onClick={() => setActiveGraphic(graphic)}
                whileHover={{ y: -8 }}
                className="group bg-white border border-nag-border rounded-[32px] overflow-hidden hover:shadow-2xl hover:border-nag-green-primary/30 transition-all duration-500 cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-nag-gray-bg border-b border-nag-border shrink-0">
                  <img 
                    src={graphic.image_url} 
                    alt={graphic.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-lg text-blue-600 scale-90 group-hover:scale-100 transition-all duration-300">
                      <ZoomIn size={20} />
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-base leading-snug text-nag-black line-clamp-2 group-hover:text-nag-green-primary transition-colors">
                      {graphic.title}
                    </h4>
                    <p className="text-xs text-nag-gray-deep font-semibold opacity-70 mt-2 line-clamp-3 leading-relaxed">
                      {graphic.description}
                    </p>
                  </div>

                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1 group-hover:gap-1.5 transition-all border-t border-nag-border/60 pt-3">
                    Zoom Infographic →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </main>
      <Footer />

      {/* ─── FULLSCREEN DETAILED LIGHTBOX ZOOM ─── */}
      <AnimatePresence>
        {activeGraphic && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Blur Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
              onClick={() => setActiveGraphic(null)} 
            />

            {/* Lightbox Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-white rounded-[36px] overflow-hidden border border-nag-border shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] z-[1010] max-w-5xl w-full flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Close Overlay */}
              <button 
                onClick={() => setActiveGraphic(null)}
                className="absolute top-4 right-4 z-50 p-2.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer border border-white/10"
              >
                <X size={18} />
              </button>

              {/* Graphic Display Area */}
              <div className="w-full md:w-2/3 bg-nag-gray-bg flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-[500px]">
                <img 
                  className="w-full h-full object-contain max-h-[80vh] hover:scale-110 transition-transform duration-500 cursor-zoom-in" 
                  src={activeGraphic.image_url} 
                  alt="High Definition Data Visual" 
                />
              </div>

              {/* Specification and Excerpt sidebar */}
              <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-between bg-white border-t md:border-t-0 md:border-l border-nag-border/60">
                <div className="space-y-4">
                  <span className="bg-blue-600/10 text-blue-600 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg w-fit">
                    Data Infographic
                  </span>
                  <h3 className="text-xl font-black text-nag-black tracking-tight leading-tight uppercase">
                    {activeGraphic.title}
                  </h3>
                  <p className="text-xs md:text-sm text-nag-gray-deep font-semibold leading-relaxed border-t border-nag-border pt-4">
                    {activeGraphic.description}
                  </p>
                </div>

                <a 
                  href={activeGraphic.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 mt-6 bg-nag-black hover:bg-opacity-90 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} /> Open Full Size Asset
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
