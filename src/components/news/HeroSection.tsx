import { Clock, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function HeroSection() {
  return (
    <section className="w-full py-6 md:py-10">
      <div className="container-nag px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 h-full lg:min-h-[600px]">
        {/* Main Feature */}
        <div className="lg:col-span-8 group relative overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/20 border border-nag-border flex flex-col min-h-[350px] md:min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 pointer-events-none"></div>
          <img
            src="https://images.unsplash.com/photo-1749058387715-1efad0eadc8c?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxhZ29zJTIwbmlnZXJpYXxlbnwwfHwwfHx8MA%3D%3D"
            alt="Lagos Urban Architecture"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 p-6 md:p-12 z-20 w-full space-y-3 md:space-y-4">
            <span className="inline-block px-4 py-1.5 bg-nag-green-primary text-white text-[9px] md:text-[10px] font-black uppercase rounded-lg tracking-[0.2em] shadow-lg">Special Investigation</span>
            <h1 className="text-white text-3xl sm:text-4xl md:text-6xl font-display font-black leading-[1.1] md:leading-[1] mb-2 md:mb-4 max-w-4xl tracking-tighter group-hover:text-nag-green-secondary transition-colors cursor-pointer drop-shadow-2xl">
              The Coastal Frontier: Reshaping Nigeria's Strategic Infrastructure.
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-4 md:gap-6 border-t border-white/10 pt-4 md:pt-6">
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-gray-300 text-[9px] md:text-[10px] font-black uppercase tracking-widest opacity-90">
                <span className="flex items-center gap-2 text-white"><div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-nag-green-primary/50 border border-white/20 flex items-center justify-center">OA</div> Olumide Adebayo</span>
                <span className="text-nag-green-secondary hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5"><Clock size={10} /> 12 Minutes Ago</span>
              </div>
              <div className="text-white/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                Read Full Story <ChevronRight size={14} className="text-nag-green-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Side Featured (Secondary News grid pattern) */}
        <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6 overflow-hidden">
          {[
            { tag: 'Government', title: 'Senate finalizes new minimum wage structure for civil servants', time: '45m ago', img: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?q=80&w=600&fit=crop' },
            { tag: 'Intelligence', title: "Energy Report: Nigeria's domestic refining capacity projected to double by 2025", time: '1h ago', img: 'https://images.unsplash.com/photo-1546878347-4d35c66bc4c3?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8b2lsJTIwcmVmaW5hcnl8ZW58MHx8MHx8fDA%3D' },
            { tag: 'Economy', title: 'Infrastructure: Major upgrades commissioned for Port Harcourt Sea Port terminals', time: '3h ago', img: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?q=80&w=600&fit=crop' }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 md:p-5 border border-nag-border flex gap-4 md:gap-5 hover:shadow-xl transition-all cursor-pointer group flex-1">
              <div className="relative shrink-0 w-24 sm:w-32 h-24 sm:h-auto overflow-hidden rounded-2xl bg-gray-100 border border-nag-border">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform group-hover:scale-110 duration-700" />
              </div>
              <div className="flex flex-col justify-between py-0.5 md:py-1 flex-1">
                <span className="text-[8px] md:text-[9px] font-black text-nag-green-primary uppercase tracking-[0.2em] leading-none mb-1 md:mb-2">{item.tag}</span>
                <h3 className="text-sm md:text-base font-bold leading-tight group-hover:text-nag-green-primary transition-colors line-clamp-2 sm:line-clamp-3 tracking-tight">
                  {item.title}
                </h3>
                <span className="text-[9px] md:text-[10px] font-bold text-gray-400 italic mt-1 md:mt-2 flex items-center gap-1">
                  <Clock size={10} /> {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

