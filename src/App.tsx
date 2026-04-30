/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Header, TopNav, MobileNav } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { About } from './components/layout/About';
import { HeroSection } from './components/news/HeroSection';
import { BreakingNewsBar } from './components/news/BreakingNewsBar';
import { TrendingSection } from './components/news/TrendingSection';
import { SpecialReports } from './components/news/SpecialReports';
import { MarketplaceHub } from './components/marketplace/MarketplaceHub';
import { GovernmentDashboard } from './components/gov/GovernmentDashboard';
import { Newspaper, Radio, PlayCircle, Layers, Globe, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

export default function App() {
  const [showIntelligence, setShowIntelligence] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-nag-green-primary selection:text-white bg-nag-gray-bg">
      {/* Premium Notification Layer */}
      <BreakingNewsBar />

      {/* Global Layout Wrapper */}
      <Header showIntelligence={showIntelligence} setShowIntelligence={setShowIntelligence} />
      <TopNav showIntelligence={showIntelligence} setShowIntelligence={setShowIntelligence} />
      <MobileNav />

      <main className="flex-1">
        {/* News Section */}
        <motion.div 
          id="news" 
          className="scroll-mt-40 md:scroll-mt-[168px]"
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroSection />
          <TrendingSection />
        </motion.div>

        {/* Interactive Sections Staggered Entrance */}
        <div className="space-y-12 md:space-y-20 py-6 md:py-10">
          {/* Multimedia/Live Pulse */}
          <section id="multimedia" className="w-full scroll-mt-40 md:scroll-mt-[168px]">
            <div className="container-nag px-6 md:px-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {[
                  { 
                    icon: PlayCircle, 
                    title: 'Original Videos', 
                    subtitle: 'LATEST RELEASES',
                    color: 'text-nag-red', 
                    desc: 'Deep-dive documentaries and investigative journalism in 4K.',
                    img: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=800&auto=format&fit=crop' 
                  },
                  { 
                    icon: Radio, 
                    title: 'Podcasts', 
                    subtitle: 'DAILY BRIEFINGS',
                    color: 'text-nag-green-primary', 
                    desc: 'Expert analysis on the move. Briefings from our top editors.',
                    img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=800&auto=format&fit=crop' 
                  },
                  { 
                    icon: Layers, 
                    title: 'Infographics', 
                    subtitle: 'DATA VISUALS',
                    color: 'text-blue-600', 
                    desc: 'Complex Nigerian stories told through rigorous data visualization.',
                    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop' 
                  },
                  { 
                    icon: Newspaper, 
                    title: 'Photo Stories', 
                    subtitle: 'VISUAL NEWS',
                    color: 'text-purple-600', 
                    desc: 'Capturing the essence of the nation through the lens of photojournalism.',
                    img: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?q=80&w=800&auto=format&fit=crop' 
                  }
                ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: false, margin: "-50px" }}
                    transition={{ 
                      delay: i * 0.1,
                      duration: 0.9, 
                      ease: [0.16, 1, 0.3, 1] 
                    }}
                    whileHover={{ y: -12, scale: 1.02 }}
                    key={i} 
                    className="group relative h-[420px] md:h-[460px] rounded-[40px] overflow-hidden bg-white border border-nag-border hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] hover:border-nag-green-primary/30 transition-all duration-700 cursor-pointer flex flex-col"
                  >
                    {/* Top Image Section */}
                    <div className="h-2/5 overflow-hidden relative">
                      <img 
                        src={item.img} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                      />
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
                      <div className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg">
                        <item.icon size={20} className={item.color} />
                      </div>
                    </div>

                    {/* Bottom Content Section */}
                    <div className="h-3/5 p-6 md:p-8 flex flex-col justify-between bg-white relative z-20">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-nag-green-primary mb-1">
                            {item.subtitle}
                          </p>
                          <h4 className="text-xl md:text-2xl font-black text-nag-black tracking-tighter uppercase leading-tight group-hover:text-nag-green-primary transition-colors">
                            {item.title}
                          </h4>
                        </div>
                        <p className="text-nag-gray-deep font-medium text-xs md:text-sm opacity-70 leading-relaxed line-clamp-3">
                          {item.desc}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-nag-green-primary group-hover:gap-4 transition-all">
                        Explore Media <ChevronRight size={14} />
                      </div>
                    </div>
                  </motion.div>
                ))}

              </div>
            </div>
          </section>

          {/* Marketplace Hub */}
          <motion.div 
            id="marketplace" 
            className="scroll-mt-40 md:scroll-mt-[168px]"
            initial={{ opacity: 0, scale: 0.98, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <MarketplaceHub />
          </motion.div>

          {/* Media Network Aggregator */}
          <section id="media-network" className="w-full py-12 md:py-16 bg-white border-y border-nag-border scroll-mt-40 md:scroll-mt-[168px]">
            <div className="container-nag px-6 md:px-12">
              <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 mb-12 md:mb-16">
                <div className="bg-nag-gray-bg px-4 py-1.5 md:px-5 md:py-2 rounded-full flex items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-nag-gray-deep">
                  <Layers size={14} className="text-nag-green-primary" /> The Premium Media Network
                </div>
                <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter leading-tight max-w-4xl">
                  Access Nigerian Strategic Editorials.
                </h2>
                <p className="text-nag-gray-deep font-medium max-w-2xl text-base md:text-lg opacity-70">A unified feed from BusinessDay, Vanguard, Channels TV, Arise News, Premium Times and Nairametrics.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8 items-center bg-white">
                {[
                  { name: 'BusinessDay', color: '#1C355E' },
                  { name: 'Vanguard', color: '#FFDE00' },
                  { name: 'Daily Trust', color: '#008751' },
                  { name: 'Guardian', color: '#0077C8' },
                  { name: 'Punch', color: '#EC1C24' },
                  { name: 'Premium Times', color: '#0056B3' },
                  { name: 'Channels TV', color: '#144799' },
                  { name: 'Arise News', color: '#D11414' },
                  { name: 'TVC News', color: '#B22222' },
                  { name: 'NTA', color: '#006400' },
                  { name: 'Nairametrics', color: '#E86121' },
                  { name: 'Proshare', color: '#C52026' }
                ].map((brand, i) => (
                  <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    key={i}
                    className="flex flex-col items-center gap-2 md:gap-3 group cursor-pointer transition-all"
                  >
                    <div className="w-full h-12 md:h-16 bg-white rounded-xl md:rounded-2xl flex items-center justify-center border border-nag-border group-hover:border-transparent group-hover:shadow-2xl p-2 md:p-4 transition-all duration-500 ring-1 ring-nag-border/50"
                      style={{
                        borderLeft: `4px solid ${brand.color}`,
                        boxShadow: `0 10px 30px -10px ${brand.color}30`
                      }}
                    >
                      <span
                        className="font-display font-black text-[9px] md:text-[11px] uppercase tracking-tight text-nag-black text-center transition-colors"
                        style={{ color: brand.color }}
                      >
                        {brand.name}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>


          {/* Government Dashboard */}
          <motion.div 
            id="government" 
            className="scroll-mt-40 md:scroll-mt-[168px]"
            initial={{ opacity: 0, scale: 0.98, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <GovernmentDashboard />
          </motion.div>

          {/* Special Reports */}
          <motion.div 
            id="special-reports" 
            className="scroll-mt-40 md:scroll-mt-[168px]"
            initial={{ opacity: 0, scale: 0.98, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <SpecialReports />
          </motion.div>

          {/* About Section */}
          <div id="about" className="scroll-mt-40 md:scroll-mt-[168px]">
            <About />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

