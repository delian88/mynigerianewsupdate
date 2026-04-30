import { motion } from 'motion/react';
import { Mail, Globe, MapPin, Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="py-24 bg-nag-gray-bg w-full border-t border-nag-border">
      <div className="container-nag px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-[2px] bg-nag-green-primary"></div>
                <span className="text-nag-green-primary font-display font-black uppercase tracking-[0.4em] text-[10px]">The Collective</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-black text-nag-black leading-tight tracking-tighter">
                Defining the <br /> National Lens.
              </h2>
            </div>
            
            <p className="text-nag-black text-xl md:text-2xl font-medium leading-relaxed max-w-3xl">
              MyNigeria.News is Nigeria's premier strategic editorial collective, unifying regional excellence with national intelligence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
               <div className="space-y-4">
                  <h4 className="font-black uppercase tracking-widest text-xs text-nag-green-primary">Our Mission</h4>
                  <p className="text-nag-gray-deep font-medium leading-relaxed">
                    To bridge the informational gap across the federation by providing verified data, deep analysis, and a unified platform for diverse regional voices.
                  </p>
               </div>
               <div className="space-y-4">
                  <h4 className="font-black uppercase tracking-widest text-xs text-nag-green-primary">Editorial Integrity</h4>
                  <p className="text-nag-gray-deep font-medium leading-relaxed">
                    Every report undergoes a three-tier verification process, leveraging on-ground intelligence and cross-border data audits.
                  </p>
               </div>
            </div>

            <div className="flex flex-wrap gap-12 pt-8">
               <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-black uppercase tracking-widest text-nag-gray-deep opacity-40">Monthly Readers</span>
                 <span className="text-4xl font-display font-black text-nag-black uppercase">12.4M</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-black uppercase tracking-widest text-nag-gray-deep opacity-40">Regional Bureaus</span>
                 <span className="text-4xl font-display font-black text-nag-black uppercase">36+</span>
               </div>
               <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-black uppercase tracking-widest text-nag-gray-deep opacity-40">Global Partners</span>
                 <span className="text-4xl font-display font-black text-nag-black uppercase">15</span>
               </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white p-8 md:p-12 rounded-[40px] border border-nag-border shadow-3xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-nag-green-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="relative z-10 space-y-10">
                 <div className="space-y-2">
                    <h3 className="font-display font-black text-3xl tracking-tight text-nag-black">Connect with us</h3>
                    <p className="text-nag-gray-deep font-medium">Join the intelligence network.</p>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-4 group/item cursor-pointer">
                       <div className="w-12 h-12 rounded-2xl bg-nag-gray-bg flex items-center justify-center text-nag-gray-deep group-hover/item:bg-nag-green-primary group-hover/item:text-white transition-all shadow-sm">
                         <Mail size={20} />
                       </div>
                       <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-nag-gray-deep opacity-40">Editorial Desk</p>
                         <p className="text-base font-bold text-nag-black">briefing@mynigeria.news</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 group/item cursor-pointer">
                       <div className="w-12 h-12 rounded-2xl bg-nag-gray-bg flex items-center justify-center text-nag-gray-deep group-hover/item:bg-nag-green-primary group-hover/item:text-white transition-all shadow-sm">
                         <MapPin size={20} />
                       </div>
                       <div>
                         <p className="text-[9px] font-black uppercase tracking-widest text-nag-gray-deep opacity-40">Headquarters</p>
                         <p className="text-base font-bold text-nag-black">Ikoyi, Lagos, Nigeria</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-nag-border flex items-center gap-4">
                    <button className="flex-1 bg-nag-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-nag-green-primary transition-all">
                      Subscribe Now
                    </button>
                    <div className="flex items-center gap-2">
                      {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
                        <button key={i} className="w-10 h-10 rounded-lg bg-nag-gray-bg flex items-center justify-center text-nag-gray-deep hover:text-nag-green-primary transition-colors">
                          <Icon size={18} />
                        </button>
                      ))}
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
