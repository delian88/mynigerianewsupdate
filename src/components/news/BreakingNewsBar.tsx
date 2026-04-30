import { motion, AnimatePresence } from 'motion/react';
import { Radio, TrendingUp, Clock, ShieldCheck, ChevronDown, Activity, ArrowUpRight, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';

export function BreakingNewsBar() {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const headlines = [
    "JUST IN: Federal Government announces new minimum wage implementation date — Full details inside.",
    "MARKET UPDATE: Naira gains 2% against USD in early morning trading at parallel market.",
    "ENERGY: Dangote Refinery set to disrupt regional fuel supply chains with first export batch.",
    "SPORTS: Super Eagles coach confirms arrival of 15 players for World Cup qualifiers training camp.",
    "GOVERNANCE: National Assembly invites CBN Governor over new digital banking regulations."
  ];

  return (
    <div className="w-full bg-nag-black text-white h-10 md:h-12 border-b border-white/10 flex items-center overflow-visible sticky top-0 z-[300]">
      {/* Label */}
      <div className="h-full bg-nag-green-primary px-4 md:px-6 flex items-center gap-2 md:gap-3 shrink-0 relative z-20">
        <div className="relative">
          <Radio size={14} className="text-white" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
        </div>
        <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] whitespace-nowrap">Breaking News</span>
      </div>

      {/* Ticker Content */}
      <div className="flex-1 flex items-center overflow-hidden h-full">
        <motion.div 
          animate={{ x: [0, -1500] }}
          transition={{ 
            duration: 60, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex items-center gap-12 md:gap-24 whitespace-nowrap"
        >
          {/* Repeat headlines twice for seamless loop */}
          {[...headlines, ...headlines].map((text, i) => (
            <a 
              key={i} 
              href="#"
              className="flex items-center gap-4 hover:text-nag-green-primary transition-colors group cursor-pointer"
            >
              <span className="text-[10px] md:text-sm font-bold tracking-tight opacity-90 group-hover:opacity-100">{text}</span>
              <div className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-nag-green-primary group-hover:scale-125 transition-transform"></div>
            </a>
          ))}
        </motion.div>
      </div>

      {/* Utilities/Right Side */}
      <div className="hidden lg:flex items-center gap-6 h-full bg-nag-black px-6 shrink-0 border-l border-white/5 relative z-20">
        <div 
          className="relative h-full flex items-center"
          onMouseEnter={() => setShowAnalysis(true)}
          onMouseLeave={() => setShowAnalysis(false)}
        >
          <button 
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all ${
              showAnalysis ? 'bg-nag-green-primary text-white' : 'text-nag-green-primary hover:bg-white/5'
            }`}
          >
            <TrendingUp size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Naira Up</span>
            <ChevronDown size={12} className={`transition-transform duration-300 ${showAnalysis ? 'rotate-180' : ''}`} />
          </button>

          {/* Analysis Dropdown */}
          <AnimatePresence>
            {showAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute top-full right-0 mt-1 w-[380px] bg-white text-nag-black rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-nag-border p-6 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-nag-green-primary/5 rounded-full blur-3xl"></div>
                
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-nag-green-primary mb-1">Market Sentiment</h4>
                      <h3 className="font-display font-black text-xl tracking-tight leading-tight">Naira Recovery Analysis</h3>
                    </div>
                    <div className="bg-nag-green-primary/10 p-2 rounded-xl text-nag-green-primary">
                      <ShieldCheck size={20} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-nag-gray-bg rounded-xl border border-nag-border/50">
                      <p className="text-[9px] font-black uppercase text-nag-gray-deep opacity-40 mb-1">Current Spread</p>
                      <p className="text-xl font-display font-black tracking-tighter">₦1,420 - ₦1,450</p>
                    </div>
                    <div className="p-4 bg-nag-gray-bg rounded-xl border border-nag-border/50">
                      <p className="text-[9px] font-black uppercase text-nag-gray-deep opacity-40 mb-1">Daily Gain</p>
                      <p className="text-xl font-display font-black tracking-tighter text-nag-green-primary">+₦32.50</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                       <div className="w-1 h-1 rounded-full bg-nag-green-primary mt-1.5 shrink-0" />
                       <p className="text-xs font-medium text-nag-gray-deep leading-relaxed">
                         Verified increase in Diaspora inflows following new CBN policy directives on IMTO operations.
                       </p>
                    </div>
                    <div className="flex items-start gap-3">
                       <div className="w-1 h-1 rounded-full bg-nag-green-primary mt-1.5 shrink-0" />
                       <p className="text-xs font-medium text-nag-gray-deep leading-relaxed">
                         Clearing of FX backlogs at the commercial banking level has reduced speculative pressure.
                       </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-nag-border">
                    <button className="w-full py-4 bg-nag-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-nag-black/90 transition-all flex items-center justify-center gap-2 group">
                      Detailed Intelligence Report <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex items-center gap-2 opacity-50">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
        </div>

        <div className="flex items-center gap-2 opacity-80 border-l border-white/10 pl-6">
          <Clock size={14} />
          <span className="text-[10px] font-mono font-medium tracking-widest">{time} WAT</span>
        </div>
      </div>
    </div>
  );
}
