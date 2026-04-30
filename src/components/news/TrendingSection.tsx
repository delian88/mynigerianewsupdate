import { useState, useEffect } from 'react';
import { TrendingUp, CheckCircle, Bookmark, Share2, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function TrendingSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const trendingStories = [
    {
      id: "01",
      title: "Senate approves N35 trillion supplementary budget — full breakdown",
      reads: "15,432 reads",
      category: "Politics",
      excerpt: "The massive fiscal injection aims to tackle infrastructure deficits and social welfare programs across all 36 states.",
      image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "02",
      title: "Dangote Refinery begins fuel export — what this means for consumers",
      reads: "12,801 reads",
      category: "Business",
      excerpt: "Local production reaches a milestone as the first batch of refined petroleum products leaves the Lekki Free Trade Zone for international markets.",
      image: "https://images.unsplash.com/photo-1537122905058-29cf9009a397?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "03",
      title: "JAMB 2025: Full list of cut-off marks for all federal universities",
      reads: "10,340 reads",
      category: "Education",
      excerpt: "University Admissions Board releases official benchmarks for the upcoming academic session with significant changes for competitive courses.",
      image: "https://images.unsplash.com/photo-1523050337456-5d55f210d2ee?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "04",
      title: "NIN deadline: Step-by-step guide to linking your ID to your bank account",
      reads: "9,217 reads",
      category: "Government",
      excerpt: "Regulatory bodies enforce the final phase of identity verification. Here is how to ensure your financial assets remain accessible.",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200"
    },
    {
      id: "05",
      title: "Super Eagles squad list for May friendlies — 5 new faces in latest call-up",
      reads: "8,990 reads",
      category: "Sports",
      excerpt: "Coach Eguavoen introduces fresh talent for the upcoming international friendlies as Nigeria prepares for the World Cup qualifiers.",
      image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200"
    }
  ];

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
      icon: "📌",
      title: "VERDICT: FALSE — Viral claim that CBN banned dollar accounts for individuals",
      author: "Fact Check Desk",
      readTime: "3 min read",
      color: "border-nag-red"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trendingStories.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [trendingStories.length]);

  return (
    <section className="w-full py-8 md:py-12 bg-white border-b border-nag-border overflow-hidden">
      <div className="container-nag px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        
        {/* Left: Trending & Most Read Carousel */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between mb-6 md:mb-8 border-b border-nag-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-nag-green-primary/10 flex items-center justify-center text-nag-green-primary">
                <TrendingUp size={20} />
              </div>
              <h2 className="text-xl md:text-2xl font-display font-black tracking-tighter uppercase">Trending & Most Read</h2>
            </div>
            
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => setActiveIndex((prev) => (prev - 1 + trendingStories.length) % trendingStories.length)}
                 className="p-2 rounded-full bg-nag-gray-bg hover:bg-nag-green-primary hover:text-white transition-all shadow-sm"
               >
                 <ArrowLeft size={16} />
               </button>
               <button 
                 onClick={() => setActiveIndex((prev) => (prev + 1) % trendingStories.length)}
                 className="p-2 rounded-full bg-nag-gray-bg hover:bg-nag-green-primary hover:text-white transition-all shadow-sm"
               >
                 <ArrowRight size={16} />
               </button>
            </div>
          </div>

          <div className="relative h-[320px] md:h-[400px] flex items-center rounded-3xl overflow-hidden border border-nag-border">
            {/* Dynamic Background Image */}
            <AnimatePresence>
              <motion.div 
                key={`bg-${activeIndex}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 z-0"
              >
                <img 
                  src={trendingStories[activeIndex].image} 
                  alt="" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full relative z-20 px-8 md:px-12"
              >
                <div className="flex gap-6 md:gap-10 items-start cursor-pointer group">
                  <div className="text-5xl md:text-8xl font-display font-black text-white/10 group-hover:text-nag-green-primary/30 transition-colors shrink-0 pt-1">
                    {trendingStories[activeIndex].id}
                  </div>
                  <div className="space-y-4 md:space-y-6 flex-1">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-nag-green-primary text-white text-[9px] font-black uppercase tracking-widest mb-3">
                        {trendingStories[activeIndex].category}
                      </span>
                      <h3 className="text-2xl md:text-4xl font-bold leading-tight text-white group-hover:text-nag-green-primary transition-colors tracking-tighter">
                        {trendingStories[activeIndex].title}
                      </h3>
                    </div>
                    
                    <p className="text-white/60 text-sm md:text-base font-medium leading-relaxed max-w-2xl line-clamp-2 md:line-clamp-3">
                      {trendingStories[activeIndex].excerpt}
                    </p>

                    <div className="flex items-center gap-6 text-[10px] md:text-xs font-black uppercase tracking-widest">
                       <span className="text-white/40">{trendingStories[activeIndex].reads}</span>
                       <button className="flex items-center gap-2 text-nag-green-primary hover:gap-3 transition-all">
                         Read Insight <ChevronRight size={14} />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Pagination Indicators */}
          <div className="flex items-center gap-2 mt-auto pt-6 mb-8">
            {trendingStories.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1 transition-all rounded-full ${activeIndex === i ? 'w-8 bg-nag-green-primary' : 'w-2 bg-nag-border hover:bg-nag-gray-deep'}`}
              />
            ))}
          </div>

          {/* Compact Newsletter CTA Moved Here */}
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
             
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-nag-green-primary/10 rounded-full blur-3xl"></div>
          </motion.div>
        </div>

        {/* Right: Must Read Today */}
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
        </div>

      </div>
    </section>
  );
}
