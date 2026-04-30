import { Mail, Facebook, Twitter, Instagram, Youtube, Newspaper, ChevronRight } from 'lucide-react';

export function Footer() {
  const links = [
    { title: 'Quick Links', items: ['About Us', 'Contact Us', 'Advertise', 'Privacy Policy', 'Terms of Service', 'Career'] },
    { title: 'Sections', items: ['News', 'Politics', 'Business', 'Life & Style', 'Sports', 'Opinion'] },
    { title: 'Marketplace', items: ['Sell a Car', 'Buy Property', 'Post a Job', 'Verified Sellers', 'Marketplace Apps'] },
    { title: 'Government', items: ['Passport Help', 'Tax Compliance', 'CAC Registration', 'Data Portal', 'Project Tracker'] },
  ];

  return (
    <footer className="bg-nag-black pt-24 pb-40 md:pb-24 border-t border-white/5 w-full">
      <div className="container-nag px-6 md:px-12">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-16 mb-20">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
               <div className="w-12 h-12 bg-nag-green-primary rounded-xl flex items-center justify-center">
                 <span className="text-white font-black text-2xl font-display">N</span>
               </div>
               <h3 className="font-display font-black text-xl text-white tracking-tight">
                 MYNIGERIA<span className="text-nag-green-primary">.NEWS</span>
               </h3>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Nigeria's independent unified digital ecosystem for news excellence, marketplace innovation, and civic engagement.
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:bg-nag-green-primary hover:text-white transition-all">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Links cols */}
          {links.map((group, i) => (
            <div key={i} className="lg:col-span-1 space-y-6">
               <h4 className="text-white font-black uppercase tracking-widest text-xs">{group.title}</h4>
               <ul className="space-y-3">
                 {group.items.map((item, j) => (
                   <li key={j}>
                     <a href="#" className="text-white/40 hover:text-nag-green-secondary text-sm transition-colors flex items-center gap-2 group">
                       <ChevronRight size={10} className=" opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" /> {item}
                     </a>
                   </li>
                 ))}
               </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="bg-nag-green-primary/10 rounded-3xl p-8 md:p-12 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-display font-black text-white">The Morning Pulse.</h3>
            <p className="text-white/60">Get the best of MYNIGERIA.NEWS delivered to your inbox every morning.</p>
          </div>
          <div className="w-full md:w-auto flex items-center bg-white/5 rounded-2xl p-1.5 border border-white/5 focus-within:border-nag-green-primary transition-all">
             <input 
               type="email" 
               placeholder="Enter your email address" 
               className="bg-transparent px-4 py-2 text-white focus:outline-none w-full md:w-64 text-sm" 
             />
             <button className="bg-nag-green-primary text-white font-black uppercase text-[10px] tracking-widest px-6 py-3 rounded-xl hover:bg-nag-green-secondary transition-all">
               Subscribe
             </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
          <p>© 2026 MYNIGERIA MEDIA NETWORK. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Safety</a>
            <a href="#" className="hover:text-white transition-colors">Press Area</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
