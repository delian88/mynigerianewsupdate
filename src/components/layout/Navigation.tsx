import { Search, Bell, User, Menu, X, ChevronDown, Rocket, ExternalLink, Globe, TrendingUp, TrendingDown, Activity, BarChart3, LogIn, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useAuth } from '../../hooks/useAuth';
import { AuthModal } from '../news/AuthModal';
import { SearchModal } from '../news/SearchModal';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export function Header({ showIntelligence, setShowIntelligence }: { showIntelligence: boolean, setShowIntelligence: (val: boolean) => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { settings } = useSiteSettings();
  const { user, profile } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <header 
        id="global-header"
        className={`h-[64px] bg-white border-b sticky top-10 md:top-12 z-[500] flex items-center transition-all duration-300 ${
          isScrolled ? 'border-nag-border shadow-sm' : 'border-nag-gray-light'
        }`}
      >
        <div className="container-nag px-6 md:px-12 flex items-center justify-between relative">
          {/* Intel Hub Trigger - Removed from here to move after About */}
          <div className="hidden lg:flex items-center gap-4">
             {/* Placeholder or nothing to keep spacing if needed, but we have logo centered */}
          </div>

          {/* Logo (Centered) */}
          <a href="#news" className="flex absolute left-1/2 -translate-x-1/2 items-center gap-2 md:gap-3 cursor-pointer group shrink-0">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Site Logo" className="h-8 md:h-10 object-contain transition-transform group-hover:scale-105" />
            ) : (
              <>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-nag-green-primary rounded flex items-center justify-center transition-transform group-hover:scale-105">
                  <span className="text-white font-bold text-base md:text-xl font-display">N</span>
                </div>
                <span className="font-display font-black text-lg md:text-2xl tracking-tighter text-nag-black leading-none whitespace-nowrap">
                  MYNIGERIA<span className="text-nag-green-primary">.NEWS</span>
                </span>
              </>
            )}
          </a>

          {/* Action Icons */}
          <div className="flex items-center gap-3 md:gap-6 shrink-0 relative">
            <button
              id="search-trigger"
              aria-label="Open search"
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-500 hover:text-nag-green-primary transition-colors p-2 cursor-pointer"
            >
              <Search size={18} />
            </button>
            <button id="notifications-trigger" aria-label="View notifications" className="relative text-gray-500 hover:text-nag-green-primary transition-colors p-2 hidden sm:block">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-nag-red border-2 border-white rounded-full"></span>
            </button>

            {user ? (
              <div className="relative hidden sm:block z-50">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-8 h-8 rounded-full bg-nag-green-primary text-white font-black hover:bg-nag-green-secondary transition-all flex items-center justify-center cursor-pointer text-xs uppercase"
                >
                  {user.email?.[0] || 'U'}
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-nag-border p-4 z-[600] pointer-events-auto space-y-3"
                    >
                      <div className="text-xs text-nag-gray-deep border-b border-nag-border pb-2">
                        <a
                          href="/admin"
                          className="font-bold text-nag-black truncate hover:text-nag-green-primary transition-colors block cursor-pointer"
                        >
                          {user.email}
                        </a>
                        <p className="capitalize text-[9px] text-nag-green-primary mt-0.5 font-black tracking-widest">{profile?.role || 'User'}</p>
                      </div>
                      {profile?.role === 'super_admin' && (
                        <a
                          href="/admin"
                          className="block text-xs font-bold text-nag-black hover:text-nag-green-primary transition-colors py-1.5 cursor-pointer pointer-events-auto"
                        >
                          Super Admin Dashboard
                        </a>
                      )}
                      <button
                        onClick={() => {
                          // Background call to invalidate session on server
                          supabase.auth.signOut().catch((err) => {
                            console.error('SignOut error in background:', err);
                          });

                          // Instantly clear all Supabase and admin related local storage items
                          for (let i = localStorage.length - 1; i >= 0; i--) {
                            const key = localStorage.key(i);
                            if (key && (key.startsWith('sb-') || key === 'isAdmin')) {
                              localStorage.removeItem(key);
                            }
                          }

                          toast.success('Logged out successfully');
                          setIsDropdownOpen(false);
                          
                          // Micro-delay to let the clean state write, then force reload
                          setTimeout(() => {
                            window.location.href = '/';
                          }, 50);
                        }}
                        className="w-full text-left text-xs font-bold text-red-600 hover:text-red-700 transition-colors py-1.5 flex items-center gap-2 border-t border-nag-border/50 pt-2 mt-1 cursor-pointer pointer-events-auto"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hidden sm:block px-4 py-2 bg-nag-black text-white hover:bg-nag-green-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm animate-fade-in"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export function TopNav({ showIntelligence, setShowIntelligence }: { showIntelligence: boolean, setShowIntelligence: (val: boolean) => void }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const stats = [
    { label: 'Market Naira', val: '₦1,620', change: '+2.4%', color: 'text-nag-green-primary', trend: 'up' },
    { label: 'Bonny Light', val: '$88.40', change: '-1.3%', color: 'text-nag-red', trend: 'down' },
    { label: 'Inflation', val: '33.2%', change: '+0.5%', color: 'text-nag-red', trend: 'up' },
    { label: 'Cement (Dangote)', val: '₦8,100', change: '-0.8%', color: 'text-nag-green-secondary', trend: 'down' }
  ];

  const menuItems = [
    { 
      id: 'news', 
      label: 'News',
      columns: [
        { title: 'CATEGORIES', items: ['Latest', 'Politics', 'Business & Economy', 'National', 'World'] },
        { title: 'SPECIAL', items: ['Security', 'Health', 'Education', 'Technology', 'Environment'] },
        { title: 'ENGAGEMENT', items: ['Opinion', 'Fact Check', 'Sports', 'Entertainment'] }
      ]
    },
    { 
      id: 'marketplace', 
      label: 'Marketplace',
      columns: [
        { title: 'AUTOMOTIVE', items: ['Buy Cars', 'Sell Cars', 'Auto Accessories', 'Spare Parts'] },
        { title: 'REAL ESTATE', items: ['For Rent', 'For Sale', 'Short Let', 'Land'] },
        { title: 'CAREERS', items: ['Full-time Jobs', 'Remote', 'Freelance', 'Internships'] }
      ]
    },
    { 
      id: 'government', 
      label: 'Government',
      columns: [
        { title: 'SERVICES', items: ['Ministries & Agencies', 'Public Services', 'NIN Enrolment', 'Passport Application', 'CAC Registration'] },
        { title: 'ACCOUNTABILITY', items: ['Budgets & Expenditure', 'Procurement & Contracts', 'Projects Tracker', 'FOI Tools'] },
        { title: 'CITIZEN GUIDES', items: ['Elections Hub', '2027 Candidates', 'INEC Updates', 'Voter Registration'] }
      ]
    },
    { 
      id: 'special-reports', 
      label: 'Special Reports',
      columns: [
        { title: 'INVESTIGATIONS', items: ['Deep Dives', 'Undercover', 'Financial Crime', 'Rights Watch'] },
        { title: 'REGIONAL', items: ['Lagos Watch', 'Abuja Insights', 'Northern Frontier', 'Delta Focus'] },
        { title: 'SERIES', items: ['Corruption Files', 'Climate Crisis', 'Future of Work', 'Tech Impact'] }
      ]
    },
    { 
      id: 'multimedia', 
      label: 'Multimedia',
      columns: [
        { title: 'CONTENT', items: ['Videos', 'Podcasts', 'Infographics', 'Photo Stories'] }
      ]
    },
    { 
      id: 'media-network', 
      label: 'Nigerian Media Network',
      columns: [
        { title: 'NEWSPAPERS', items: ['BusinessDay', 'Vanguard', 'Daily Trust', 'Guardian', 'Punch', 'Premium Times'] },
        { title: 'TV & RADIO', items: ['Channels TV', 'Arise News', 'TVC News', 'NTA', 'Nigeria Info FM', 'RayPower FM'] },
        { title: 'DIGITAL & FINANCE', items: ['InvestorKing', 'Nairametrics', 'Proshare', 'BellaNaija', 'Pulse Nigeria', 'Legit.ng'] }
      ]
    },
    { id: 'about', label: 'About' },
  ];

  return (
    <nav className="h-[56px] bg-white border-b border-gray-100 hidden md:flex items-center justify-center sticky top-[104px] md:top-[112px] z-40 shrink-0">
      <div className="container-nag h-full flex items-center justify-center px-6 md:px-12 gap-8">
      {menuItems.map((item, idx) => (
        <div 
          key={item.id}
          className="h-full relative"
          onMouseEnter={() => setActiveMenu(item.id)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <a 
            href={`#${item.id}`}
            onClick={(e) => {
              if (item.columns) {
                // For mega menus, we might want to prevent default if they are just triggers
                // but usually user expects to click and go to the main category too
              }
            }}
            className={`text-xs h-full flex items-center px-2 transition-all font-black uppercase tracking-widest gap-1 ${
              activeMenu === item.id 
              ? 'text-nag-green-primary' 
              : 'text-gray-600 hover:text-nag-green-primary'
            }`}
          >
            {item.label}
            {item.columns && <ChevronDown size={12} className={`transition-transform duration-200 ${activeMenu === item.id ? 'rotate-180' : ''}`} />}
          </a>
          
          {/* Mega Menu Dropdown */}
          <AnimatePresence>
            {activeMenu === item.id && item.columns && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                className={`absolute top-[calc(100%+1px)] bg-white/95 backdrop-blur-xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-nag-border rounded-2xl p-8 md:p-10 z-[100] grid gap-12 md:gap-16 ${
                  idx < 2 ? 'left-0' : idx > menuItems.length - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                } ${
                  item.columns.length === 1 ? 'grid-cols-1 min-w-[240px]' : 
                  item.columns.length === 2 ? 'grid-cols-2 min-w-[500px]' : 
                  'grid-cols-3 min-w-[700px] lg:min-w-[800px]'
                }`}
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-nag-green-primary to-transparent opacity-30"></div>
                
                {item.columns.map((col, idx) => (
                  <div key={idx} className="space-y-6 relative">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-nag-green-primary"></div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-nag-black/40">
                        {col.title}
                      </h4>
                    </div>
                    <ul className="space-y-1">
                      {col.items.map((sub, sIdx) => (
                        <li key={sIdx}>
                          <a 
                            href="#" 
                            className="group flex items-center justify-between py-2 px-3 -mx-3 rounded-xl hover:bg-nag-green-primary/5 transition-all"
                          >
                            <span className="text-[14px] font-bold text-nag-gray-deep group-hover:text-nag-black transition-colors">
                              {sub}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronDown size={12} className="-rotate-90 text-nag-green-primary" />
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

                {/* Bottom Accent / Newsletter Promo for News specifically */}
                {item.id === 'news' && (
                  <div className="col-span-full pt-8 mt-4 border-t border-nag-border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-nag-green-primary/10 rounded-lg text-nag-green-primary">
                        <Rocket size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-nag-black">Morning Intelligence</p>
                        <p className="text-xs text-nag-gray-deep font-medium">Get the 5-minute daily briefing for professionals.</p>
                      </div>
                    </div>
                    <button className="px-5 py-2.5 bg-nag-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-nag-black/90 transition-all">
                      Subscribe Free
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Intel Hub Widget (After About) */}
      <div className="h-full relative flex items-center ml-2">
        <button 
          onClick={() => setShowIntelligence(!showIntelligence)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 border ${
            showIntelligence 
              ? 'bg-nag-black text-white border-nag-black shadow-lg shadow-nag-black/20' 
              : 'bg-nag-green-primary/5 text-nag-green-primary border-nag-green-primary/20 hover:bg-nag-green-primary hover:text-white'
          }`}
        >
          <div className="relative">
            <Activity size={12} />
            {showIntelligence && <span className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-nag-green-primary rounded-full animate-ping"></span>}
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">Intel Hub</span>
          <ChevronDown size={10} className={`transition-transform duration-300 ${showIntelligence ? 'rotate-180' : ''}`} />
        </button>

        {/* Intelligence Dropdown Panel Positioning */}
        <AnimatePresence>
          {showIntelligence && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-[120%] right-0 w-[320px] md:w-[400px] bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.12)] border border-nag-border p-5 md:p-6 overflow-hidden z-[110]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-nag-green-primary/5 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-black text-lg md:text-xl tracking-tighter text-nag-black leading-tight">Data Intelligence</h3>
                    <p className="text-[9px] font-black uppercase tracking-widest text-nag-gray-deep opacity-40">Real-time Regional Indicators</p>
                  </div>
                  <div className="flex items-center gap-2 text-nag-green-primary p-1.5 bg-nag-green-primary/5 rounded-lg">
                    <Globe size={12} className="animate-pulse" />
                    <span className="text-[9px] font-black uppercase">Live</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {stats.map((stat, i) => (
                    <div key={i} className="p-3 md:p-4 bg-nag-gray-bg rounded-xl border border-nag-border/50 hover:border-nag-green-primary/30 transition-all group">
                       <div className="flex items-center justify-between mb-1.5">
                         <span className="text-[8px] font-black uppercase tracking-widest text-nag-gray-deep opacity-60">{stat.label}</span>
                         {stat.trend === 'up' ? <TrendingUp size={10} className="text-nag-green-primary" /> : <TrendingDown size={10} className="text-nag-red" />}
                       </div>
                       <div className="text-lg md:text-xl font-display font-black text-nag-black tracking-tighter">{stat.val}</div>
                       <div className={`text-[9px] font-black mt-0.5 ${stat.color}`}>{stat.change}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-nag-black rounded-xl p-4 md:p-5 flex items-center justify-between group cursor-pointer hover:bg-nag-black/90 transition-colors">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-nag-green-primary">
                        <BarChart3 size={16} />
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-white/40 tracking-widest leading-none mb-1">Macro Monitor</p>
                        <p className="text-xs font-bold text-white uppercase">Regional Risk Index</p>
                      </div>
                   </div>
                   <ChevronDown className="-rotate-90 text-white/20 group-hover:text-nag-green-primary transition-colors" size={14} />
                </div>

                <button className="w-full py-3 text-[9px] font-black uppercase tracking-[0.2em] text-nag-green-primary border border-nag-green-primary/20 rounded-xl hover:bg-nag-green-primary hover:text-white transition-all">
                  Intelligence Hub
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </nav>
  );
}

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, profile } = useAuth();

  const menuItems = [
    { 
      id: 'news', 
      label: 'News',
      items: ['Politics', 'Business', 'National', 'World', 'Security', 'Health', 'Sports']
    },
    { 
      id: 'marketplace', 
      label: 'Marketplace',
      items: ['Buy/Sell Cars', 'Automotive', 'Real Estate', 'Careers', 'Jobs']
    },
    { 
      id: 'government', 
      label: 'Government',
      items: ['NIN Enrolment', 'Passport Portal', 'CAC Registration', 'Budget Tracker', 'Projects']
    },
    { 
      id: 'special-reports', 
      label: 'Special Reports',
      items: ['Deep Dives', 'Investigations', 'Lagos Watch', 'Northern Frontier']
    },
    { 
      id: 'multimedia', 
      label: 'Multimedia',
      items: ['Videos', 'Podcasts', 'Infographics', 'Photo Stories']
    },
  ];

  const handleProfileClick = () => {
    if (user) {
      setIsOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  return (
    <>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t z-[201] md:hidden flex justify-around items-center py-3 px-6 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] pb-safe">
        <button onClick={() => setIsOpen(true)} className="flex flex-col items-center gap-1 text-nag-gray-deep active:scale-95 transition-transform">
          <Menu size={20} className="text-nag-black" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Menu</span>
        </button>
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center gap-1 text-nag-gray-deep opacity-60 active:scale-95 transition-transform cursor-pointer"
        >
          <Search size={20} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Search</span>
        </button>
        <div className="relative -mt-10 bg-nag-green-primary w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-[0_10px_20px_rgba(33,185,116,0.3)] border-4 border-white active:scale-90 transition-transform">
          <span className="font-display font-black text-xl">N</span>
        </div>
        <button className="flex flex-col items-center gap-1 text-nag-gray-deep opacity-60 active:scale-95 transition-transform">
          <Bell size={20} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Alerts</span>
        </button>
        <button onClick={handleProfileClick} className="flex flex-col items-center gap-1 text-nag-gray-deep active:scale-95 transition-transform">
          {user ? (
            <div className="w-5 h-5 rounded-full bg-nag-green-primary text-white font-black flex items-center justify-center text-[10px] uppercase">
              {user.email?.[0] || 'U'}
            </div>
          ) : (
            <User size={20} className="text-nag-black opacity-60" />
          )}
          <span className="text-[9px] font-black uppercase tracking-tighter">
            {user ? 'Profile' : 'Sign In'}
          </span>
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-nag-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-16 w-[85%] max-w-[320px] bg-white z-[70] md:hidden overflow-y-auto flex flex-col"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-nag-green-primary rounded flex items-center justify-center text-white font-bold">N</div>
                  <span className="font-display font-black tracking-tighter">MYNIGERIA.NEWS</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-nag-gray-bg rounded-lg text-nag-gray-deep">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-8">
                {menuItems.map((menu) => (
                  <div key={menu.id} className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-nag-green-primary tracking-[0.2em]">{menu.label}</h4>
                    <ul className="space-y-3">
                      {menu.items.map((link, idx) => (
                        <li key={idx}>
                          <a 
                            href={`#${menu.id}`} 
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-bold text-nag-black hover:text-nag-green-primary transition-colors flex items-center justify-between"
                          >
                            {link}
                            <ChevronDown size={14} className="-rotate-90 opacity-20" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-nag-gray-bg space-y-4 mt-auto">
                {user ? (
                  <div className="space-y-3 bg-white p-4 rounded-2xl border border-nag-border shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-nag-green-primary text-white font-black flex items-center justify-center text-xs uppercase">
                        {user.email?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="text-xs font-bold text-nag-black truncate hover:text-nag-green-primary transition-colors block cursor-pointer"
                        >
                          {user.email}
                        </a>
                        <p className="text-[9px] font-semibold text-nag-green-primary uppercase tracking-widest leading-none mt-0.5">{profile?.role || 'User'}</p>
                      </div>
                    </div>
                    {profile?.role === 'super_admin' && (
                      <a
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="w-full py-3 bg-nag-black text-white hover:bg-nag-green-primary transition-colors text-[9px] font-black uppercase tracking-widest rounded-xl shadow-md flex items-center justify-center"
                      >
                        Super Admin Dashboard
                      </a>
                    )}
                    <button
                      onClick={() => {
                        // Background call to invalidate session on server
                        supabase.auth.signOut().catch((err) => {
                          console.error('SignOut error in background:', err);
                        });

                        // Instantly clear all Supabase and admin related local storage items
                        for (let i = localStorage.length - 1; i >= 0; i--) {
                          const key = localStorage.key(i);
                          if (key && (key.startsWith('sb-') || key === 'isAdmin')) {
                            localStorage.removeItem(key);
                          }
                        }

                        toast.success('Logged out successfully');
                        setIsOpen(false);
                        
                        // Micro-delay to let the clean state write, then force reload
                        setTimeout(() => {
                          window.location.href = '/';
                        }, 50);
                      }}
                      className="w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer pointer-events-auto"
                    >
                      <LogOut size={12} /> Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsAuthOpen(true);
                    }}
                    className="w-full py-3.5 bg-nag-black text-white hover:bg-nag-green-primary text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn size={14} /> Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
