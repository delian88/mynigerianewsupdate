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
import { Newspaper, Radio, PlayCircle, Layers, Globe } from 'lucide-react';
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
        <div id="news" className="scroll-mt-40 md:scroll-mt-[168px]">
          <HeroSection />
          <TrendingSection />
        </div>

        {/* Interactive Sections Staggered Entrance */}
        <div className="space-y-12 md:space-y-20 py-6 md:py-10">
          {/* Multimedia/Live Pulse */}
          <section id="multimedia" className="w-full scroll-mt-40 md:scroll-mt-[168px]">
             <div className="container-nag px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {[
                  { icon: PlayCircle, title: 'Original Videos', color: 'text-nag-red', count: 'Latest Releases', img: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N2Zzh6ZzV6ZzV6ZzV6ZzV6ZzV6ZzV6ZzV6ZzV6ZzV6ZzV6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxoY8E0X98k/giphy.gif' },
                  { icon: Radio, title: 'Podcasts', color: 'text-nag-green-primary', count: 'Daily Briefings', img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600&fit=crop' },
                  { icon: Layers, title: 'Infographics', color: 'text-blue-600', count: 'Data Visuals', img: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=600&fit=crop' },
                  { icon: Newspaper, title: 'Photo Stories', color: 'text-purple-600', count: 'Visual News', img: 'https://images.unsplash.com/photo-1504711432869-efd597cdd04d?q=80&w=600&fit=crop' }
                ].map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="group bg-white rounded-2xl border border-nag-border overflow-hidden hover:shadow-2xl transition-all cursor-pointer flex flex-col h-[280px] md:h-[320px]"
                  >
                    <div className="h-32 md:h-40 overflow-hidden relative">
                      <img src={item.img} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-white/90 backdrop-blur-md p-2 rounded-xl">
                        <item.icon size={18} md:size={20} className={item.color} />
                      </div>
                    </div>
                    <div className="p-5 md:p-6 flex flex-col justify-between flex-1">
                      <div>
                        <h4 className="font-black text-lg md:text-xl tracking-tight mb-1 md:mb-2 uppercase">{item.title}</h4>
                        <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-nag-green-primary animate-pulse"></span>
                           <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-nag-gray-deep opacity-60">{item.count}</span>
                        </div>
                      </div>
                      <div className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-nag-green-primary group-hover:translate-x-2 transition-transform">
                        Explore Media →
                      </div>
                    </div>
                  </motion.div>
                ))}
                </div>
             </div>
          </section>

          {/* Marketplace Hub */}
          <div id="marketplace" className="scroll-mt-40 md:scroll-mt-[168px]">
            <MarketplaceHub />
          </div>

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
          <div id="government" className="scroll-mt-40 md:scroll-mt-[168px]">
            <GovernmentDashboard />
          </div>

          {/* Special Reports */}
          <div id="special-reports" className="scroll-mt-40 md:scroll-mt-[168px]">
            <SpecialReports />
          </div>

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

