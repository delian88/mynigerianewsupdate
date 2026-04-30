import { Car, Home, Briefcase, Filter, Search, ChevronRight, Tag, MapPin, BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export function MarketplaceHub() {
  const [activeTab, setActiveTab ] = useState<'automotive' | 'realestate' | 'careers'>('automotive');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({
    automotive: { year: 'All', model: 'All', priceRange: 'All' },
    realestate: { type: 'All', bedrooms: 'All', region: 'All' },
    careers: { sector: 'All', location: 'All' }
  });
  const [sortBy, setSortBy] = useState('Newest');

  const tabs = [
    { id: 'automotive', label: 'Automotive', icon: Car },
    { id: 'realestate', label: 'Real Estate', icon: Home },
    { id: 'careers', label: 'Careers', icon: Briefcase },
  ];

  const data = {
    automotive: [
      { id: 'a1', title: '2022 Toyota Prado (TX-L) - Full Option', price: '₦85,000,000', priceVal: 85000000, year: 2022, model: 'Toyota', location: 'Lagos, NG', badge: 'Verified Dealer', img: 'https://images.unsplash.com/photo-1594502329581-473ee937c5e1?q=80&w=600&fit=crop' },
      { id: 'a2', title: 'Mercedes-Benz G63 AMG - Bulletproof', price: '₦180,000,000', priceVal: 180000000, year: 2023, model: 'Mercedes', location: 'Abuja, NG', badge: 'Secure Trade', img: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=600&fit=crop' },
      { id: 'a3', title: 'Toyota Hilux Adventure 2021', price: '₦45,000,000', priceVal: 45000000, year: 2021, model: 'Toyota', location: 'Ikeja, Lagos', badge: 'Accessories', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&fit=crop' },
      { id: 'a4', title: '2021 Lexus RX 350 - Silver', price: '₦45,500,000', priceVal: 45500000, year: 2021, model: 'Lexus', location: 'Port Harcourt', badge: 'Hot', img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=400&fit=crop' },
    ],
    realestate: [
      { id: 'r1', title: '5 Bedroom Luxury Detached Duplex', price: '₦450,000,000', priceVal: 450000000, type: 'Buy', bedrooms: 5, location: 'Victoria Island, Lagos', badge: 'For Sale', img: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600&fit=crop' },
      { id: 'r2', title: 'Luxury 3 Bedroom Apartment - Serviced', price: '₦8,500,000/yr', priceVal: 8500000, type: 'Rent', bedrooms: 3, location: 'Aso Drive, Abuja', badge: 'For Rent', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&fit=crop' },
      { id: 'r3', title: 'Waterfront Commercial Office Space', price: '₦250,000/sqm', priceVal: 250000, type: 'Commercial', bedrooms: 0, location: 'Eko Atlantic, Lagos', badge: 'Commercial', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&fit=crop' },
      { id: 'r4', title: 'Prime 4 Bedroom Terrace House', price: '₦85,000,000', priceVal: 85000000, type: 'Buy', bedrooms: 4, location: 'Lekki Phase 1', badge: 'Hot', img: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&fit=crop' },
    ],
    careers: [
      { id: 'j1', title: 'Senior Software Architect (FinTech)', sector: 'Tech', price: '₦2.5M - ₦4M Monthly', priceVal: 2500000, location: 'Lagos', badge: 'Full-time', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=600&fit=crop' },
      { id: 'j2', title: 'Head of Operations (Logistics)', sector: 'Logistics', price: 'Negotiable', priceVal: 0, location: 'Kano', badge: 'Remote', img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=600&fit=crop' },
      { id: 'j3', title: 'Product Design Lead (EdTech)', sector: 'Tech', price: '₦1.2M+ / Month', priceVal: 1200000, location: 'Remote', badge: 'Freelance', img: 'https://images.unsplash.com/photo-1586769852044-692d6e69a498?q=80&w=600&fit=crop' },
      { id: 'j4', title: 'Financial Analyst (Energy)', sector: 'Energy', price: '₦250,000', priceVal: 250000, location: 'Port Harcourt', badge: 'Internship', img: 'https://images.unsplash.com/photo-1542744094-1a66e4840004?q=80&w=600&fit=crop' },
    ]
  };

  const filteredData = data[activeTab].filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'automotive') {
      const f = filters.automotive;
      return matchesSearch && 
        (f.year === 'All' || item.year.toString() === f.year) &&
        (f.model === 'All' || item.model === f.model) &&
        (f.priceRange === 'All' || (f.priceRange === 'High' ? item.priceVal > 50000000 : item.priceVal <= 50000000));
    }
    
    if (activeTab === 'realestate') {
      const f = filters.realestate;
      return matchesSearch && 
        (f.type === 'All' || item.type === f.type) &&
        (f.bedrooms === 'All' || item.bedrooms.toString() === f.bedrooms) &&
        (f.region === 'All' || item.location.includes(f.region));
    }
    
    if (activeTab === 'careers') {
      const f = filters.careers;
      return matchesSearch && 
        (f.sector === 'All' || item.sector === f.sector) &&
        (f.location === 'All' || item.location === f.location);
    }
    
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'Price High-Low') return b.priceVal - a.priceVal;
    if (sortBy === 'Price Low-High') return a.priceVal - b.priceVal;
    return 0; // Default newest (mocked ordering)
  });

  const handleFilterChange = (category: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [category]: value }
    }));
  };


  return (
    <section id="marketplace-hub" className="bg-white border-y border-nag-border py-20 w-full">
      <div className="container-nag px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-nag-green-primary font-black uppercase tracking-[0.2em] text-[10px]">
              <Tag size={14} /> The Marketplace Hub
            </div>
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter">Marketplace.</h2>
            <p className="text-nag-gray-deep font-medium max-w-2xl text-lg opacity-70">Nigeria's premier secure ecosystem for verified automotive trade, premium real estate, and career growth.</p>
          </div>
          
          <div className="flex bg-nag-gray-bg p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar relative z-30 shadow-sm max-w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                  ? 'bg-white text-nag-black shadow-lg ring-1 ring-black/5' 
                  : 'text-nag-gray-deep opacity-40 hover:opacity-100'
                }`}
              >
                <tab.icon size={14} className="shrink-0" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-6 mb-16">
          <div className="bg-nag-black rounded-[32px] p-4 md:p-6 flex flex-col xl:flex-row gap-4 shadow-2xl shadow-nag-black/10">
            <div className="flex-1 relative flex items-center min-w-0">
              <Search size={18} className="absolute left-5 text-white/40 shrink-0" />
              <input 
                type="text" 
                placeholder={`Search ${activeTab}...`} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 rounded-xl pl-12 pr-4 py-3.5 md:py-5 font-bold text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-nag-green-primary/30 border-transparent border transition-all"
              />
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative group flex-1 sm:flex-none">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto bg-white/10 text-white py-3.5 px-6 md:py-5 rounded-xl border border-white/10 font-black text-[9px] uppercase tracking-widest appearance-none focus:outline-none cursor-pointer hover:bg-white/20 transition-all pr-12"
                >
                  <option className="bg-nag-black">Newest</option>
                  <option className="bg-nag-black">Price High-Low</option>
                  <option className="bg-nag-black">Price Low-High</option>
                </select>
                <Filter size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
              <button className="flex-1 sm:flex-none bg-nag-green-primary text-white py-3.5 px-6 md:px-10 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-nag-green-secondary transition-all shadow-xl shadow-nag-green-primary/20 whitespace-nowrap">
                Post Listing
              </button>
            </div>
          </div>

          {/* Smart Filters */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 md:mx-0 md:px-0 flex-nowrap md:flex-wrap">
            <div className="text-[10px] font-black uppercase tracking-widest text-nag-gray-deep opacity-40 mr-2 flex items-center gap-2 whitespace-nowrap shrink-0">
              <Filter size={12} /> Refine Result:
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              {activeTab === 'automotive' && (
                <>
                  <FilterSelect 
                    label="Year" 
                    options={['All', '2023', '2022', '2021']} 
                    value={filters.automotive.year} 
                    onChange={(val) => handleFilterChange('year', val)} 
                  />
                  <FilterSelect 
                    label="Model" 
                    options={['All', 'Toyota', 'Mercedes', 'Lexus']} 
                    value={filters.automotive.model} 
                    onChange={(val) => handleFilterChange('model', val)} 
                  />
                  <FilterSelect 
                    label="Price Range" 
                    options={['All', 'Under ₦50M', 'Over ₦50M']} 
                    value={filters.automotive.priceRange} 
                    onChange={(val) => handleFilterChange('priceRange', val === 'Under ₦50M' ? 'Low' : val === 'Over ₦50M' ? 'High' : 'All')} 
                  />
                </>
              )}

              {activeTab === 'realestate' && (
                <>
                  <FilterSelect 
                    label="Type" 
                    options={['All', 'Buy', 'Rent', 'Commercial']} 
                    value={filters.realestate.type} 
                    onChange={(val) => handleFilterChange('type', val)} 
                  />
                  <FilterSelect 
                    label="Bedrooms" 
                    options={['All', '3', '4', '5']} 
                    value={filters.realestate.bedrooms} 
                    onChange={(val) => handleFilterChange('bedrooms', val)} 
                  />
                  <FilterSelect 
                    label="Location" 
                    options={['All', 'Lagos', 'Abuja']} 
                    value={filters.realestate.region} 
                    onChange={(val) => handleFilterChange('region', val)} 
                  />
                </>
              )}

              {activeTab === 'careers' && (
                <>
                  <FilterSelect 
                    label="Sector" 
                    options={['All', 'Tech', 'Logistics', 'Energy']} 
                    value={filters.careers.sector} 
                    onChange={(val) => handleFilterChange('sector', val)} 
                  />
                  <FilterSelect 
                    label="Location" 
                    options={['All', 'Lagos', 'Kano', 'Remote', 'Port Harcourt']} 
                    value={filters.careers.location} 
                    onChange={(val) => handleFilterChange('location', val)} 
                  />
                </>
              )}
            </div>

            <button 
              onClick={() => {
                setFilters({
                  automotive: { year: 'All', model: 'All', priceRange: 'All' },
                  realestate: { type: 'All', bedrooms: 'All', region: 'All' },
                  careers: { sector: 'All', location: 'All' }
                });
                setSearchQuery('');
              }}
              className="text-[9px] font-black uppercase tracking-widest text-nag-red hover:opacity-70 transition-all ml-4 whitespace-nowrap shrink-0"
            >
              Reset All
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab + searchQuery + JSON.stringify(filters[activeTab]) + sortBy}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <ListingCard key={item.id} item={item} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-4">
                 <div className="w-16 h-16 rounded-full bg-nag-gray-bg flex items-center justify-center mx-auto text-nag-gray-deep opacity-20">
                    <Search size={32} />
                 </div>
                 <h3 className="text-xl font-display font-black text-nag-black">No results found.</h3>
                 <p className="text-nag-gray-deep text-sm font-medium">Try adjusting your filters or search query to find what you are looking for.</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        
        <div className="mt-12 flex justify-center">
          <button className="flex items-center gap-2 group font-display font-black uppercase text-xs tracking-widest text-nag-green-primary border-b-2 border-nag-green-primary pb-1 hover:gap-4 transition-all">
            See all listings in {activeTab} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}

interface ListingCardProps {
  item: any;
  key?: string | number;
}

function ListingCard({ item }: ListingCardProps) {
  return (
    <div className="group bg-white rounded-3xl border border-nag-border overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full">
      <div className="relative aspect-video md:h-48 overflow-hidden bg-nag-gray-bg">
        <img 
          src={item.image || item.img} 
          alt={item.title} 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform group-hover:scale-110 duration-700" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 md:top-4 md:left-4">
           <div className="flex flex-col gap-2">
             <span className="bg-white/95 backdrop-blur-md text-nag-black text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg flex items-center gap-1.5 md:gap-2 shadow-sm border border-black/5 whitespace-nowrap">
               <BadgeCheck size={12} className="text-nag-green-primary shrink-0" /> {item.badge}
             </span>
             {item.year && (
               <span className="bg-nag-black/80 backdrop-blur-md text-white text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg w-fit">
                 {item.year}
               </span>
             )}
           </div>
        </div>
      </div>
      <div className="p-5 md:p-6 flex flex-col justify-between flex-1 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
             {item.sector && <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-nag-green-primary/10 text-nag-green-primary">{item.sector}</span>}
             {item.type && <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-nag-black/5 text-nag-black">{item.type}</span>}
             {item.bedrooms > 0 && <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-nag-black/5 text-nag-black">{item.bedrooms} Bed</span>}
          </div>
          <h4 className="font-bold text-sm md:text-base text-nag-black leading-tight group-hover:text-nag-green-primary transition-colors line-clamp-2 mb-2">
            {item.title}
          </h4>
          <p className="text-xl md:text-2xl font-display font-black text-nag-green-primary tracking-tight">{item.price}</p>
        </div>
        
        <div className="pt-4 border-t border-nag-gray-light flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <MapPin size={12} /> {item.location}
          </div>
          <div className="w-8 h-8 rounded-full bg-nag-gray-bg flex items-center justify-center group-hover:bg-nag-green-primary group-hover:text-white transition-all">
            <ChevronRight size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSelect({ label, options, value, onChange }: { label: string, options: string[], value: string, onChange: (val: string) => void }) {
  return (
    <div className="relative group">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-nag-gray-bg border border-nag-border text-nag-black text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-nag-green-primary transition-all cursor-pointer hover:bg-white"
      >
        {options.map(opt => (
          <option key={opt}>{opt === 'All' ? `All ${label}s` : opt}</option>
        ))}
      </select>
      <ChevronRight size={12} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-nag-gray-deep opacity-40 pointer-events-none" />
    </div>
  );
}
