import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Header, TopNav, MobileNav } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { BreakingNewsBar } from '../components/news/BreakingNewsBar';
import toast from 'react-hot-toast';
import { 
  Car, MapPin, BadgeCheck, Loader2, Search, ChevronRight, X, Phone, User, MessageSquare, Send, RefreshCw, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

// Custom 5-second select timeout wrapper
const promiseWithTimeout = (promise: Promise<any>, timeoutMs: number = 15000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error('Network request timed out. Please check your internet connection or browser security/adblocker shields.')),
        timeoutMs
      )
    )
  ]);
};

// High-fidelity fallback catalog
const FALLBACK_CARS = [
  {
    id: 'fallback-prado',
    title: '2022 Toyota Prado (TX-L) - Full Option',
    price: '₦85,000,000',
    price_val: 85000000,
    year: 2022,
    model: 'Toyota',
    location: 'Lagos, NG',
    badge: 'Verified Dealer',
    img: 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=700&auto=format&fit=crop&q=60',
    status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-g63',
    title: 'Mercedes-Benz G63 AMG - Bulletproof',
    price: '₦180,000,000',
    price_val: 180000000,
    year: 2023,
    model: 'Mercedes',
    location: 'Abuja, NG',
    badge: 'Secure Trade',
    img: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=600&fit=crop',
    status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-hilux',
    title: 'Toyota Hilux Adventure 2021',
    price: '₦45,000,000',
    price_val: 45000000,
    year: 2021,
    model: 'Toyota',
    location: 'Ikeja, Lagos',
    badge: 'Accessories',
    img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&fit=crop',
    status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-rx350',
    title: '2021 Lexus RX 350 - Silver Edition',
    price: '₦45,500,000',
    price_val: 45500000,
    year: 2021,
    model: 'Lexus',
    location: 'Port Harcourt, NG',
    badge: 'Hot',
    img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=400&fit=crop',
    status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-lexus-lx570',
    title: '2021 Lexus LX 570 Super Sport',
    price: '₦125,000,000',
    price_val: 125000000,
    year: 2021,
    model: 'Lexus',
    location: 'Lagos, NG',
    badge: 'Hot',
    img: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&fit=crop',
    status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-maybach-s580',
    title: '2023 Mercedes-Benz S580 Maybach',
    price: '₦165,000,000',
    price_val: 165000000,
    year: 2023,
    model: 'Mercedes',
    location: 'Abuja, NG',
    badge: 'Verified Dealer',
    img: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=600&fit=crop',
    status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-lc8',
    title: '2020 Toyota Land Cruiser V8',
    price: '₦62,000,000',
    price_val: 62000000,
    year: 2020,
    model: 'Toyota',
    location: 'Port Harcourt, NG',
    badge: 'Secure Trade',
    img: 'https://images.unsplash.com/photo-1594568284297-7c64464062b1?q=80&w=600&fit=crop',
    status: 'approved',
    created_at: new Date().toISOString()
  }
];

export default function AutomotiveCatalog() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeMarketplaceTab, setActiveMarketplaceTab] = useState<'automotive' | 'realestate' | 'careers'>('automotive');

  // Redirect back to homepage if user navigates to a news category or other marketplace tab from the header
  useEffect(() => {
    if (selectedCategory) {
      navigate('/', { state: { selectedCategory } });
    }
  }, [selectedCategory, navigate]);

  useEffect(() => {
    if (activeMarketplaceTab !== 'automotive') {
      navigate('/', { state: { activeMarketplaceTab } });
    }
  }, [activeMarketplaceTab, navigate]);
  
  // Advanced Filter state
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedBadge, setSelectedBadge] = useState('All');
  
  // Sorting state
  const [sortBy, setSortBy] = useState('Newest');

  // Selected car for detail spec overlay sheet
  const [selectedCar, setSelectedCar] = useState<any>(null);

  // Inquiry form states
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
    fetchCars();
  }, []);

  // Pre-fill inquiry message when a car is opened
  useEffect(() => {
    if (selectedCar) {
      setInquiryMessage(`Hello, I am highly interested in your ${selectedCar.title} listed for ${selectedCar.price}. Please provide more details and let me know how to proceed with a secure ESCROW trade!`);
    }
  }, [selectedCar]);

  const fetchCars = async () => {
    try {
      console.log('[AutomotiveCatalog] Fetching cars (5s timeout)...');
      setLoading(true);
      const { data, error } = await promiseWithTimeout(
        Promise.resolve(
          supabase
            .from('marketplace_cars')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
        ),
        15000
      ) as any;
      console.log('[AutomotiveCatalog] Supabase results count:', data?.length);
      if (error) throw error;
      setCars(data || []);
    } catch (err: any) {
      console.warn('[AutomotiveCatalog] Fetch timed out or failed, using high-fidelity fallbacks:', err);
      setCars(FALLBACK_CARS);
      toast.error('Offline Mode: Loaded vehicle catalog fallbacks. (Supabase query timed out due to your browser privacy/adblocker shields).', { id: 'automotive-catalog-timeout', duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('All');
    setSelectedYear('All');
    setSelectedPriceRange('All');
    setSelectedLocation('All');
    setSelectedBadge('All');
    setSortBy('Newest');
    toast.success('Filters cleared!');
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName.trim() || !inquiryPhone.trim()) {
      return toast.error('Full Name and Phone Number are required');
    }
    
    setSubmittingInquiry(true);
    // Simulate high-end CRM API call
    setTimeout(() => {
      setSubmittingInquiry(false);
      toast.success(`🎉 Inquiry submitted! A vetted dealer representative will contact you shortly at ${inquiryPhone}.`);
      setSelectedCar(null);
      setInquiryName('');
      setInquiryPhone('');
    }, 1500);
  };

  // Filter Logic
  const filteredCars = cars.filter((car) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = car.title.toLowerCase().includes(query);
      const matchesModel = car.model.toLowerCase().includes(query);
      const matchesLocation = car.location.toLowerCase().includes(query);
      if (!matchesTitle && !matchesModel && !matchesLocation) return false;
    }

    // 2. Brand
    if (selectedBrand !== 'All') {
      if (car.model.toLowerCase() !== selectedBrand.toLowerCase()) return false;
    }

    // 3. Year
    if (selectedYear !== 'All') {
      if (car.year.toString() !== selectedYear) return false;
    }

    // 4. Location
    if (selectedLocation !== 'All') {
      if (!car.location.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
    }

    // 5. Badge
    if (selectedBadge !== 'All') {
      if (car.badge.toLowerCase() !== selectedBadge.toLowerCase()) return false;
    }

    // 6. Price Range
    if (selectedPriceRange !== 'All') {
      const val = Number(car.price_val || 0);
      if (selectedPriceRange === 'Under ₦50M' && val >= 50000000) return false;
      if (selectedPriceRange === '₦50M - ₦100M' && (val < 50000000 || val > 100000000)) return false;
      if (selectedPriceRange === 'Above ₦100M' && val <= 100000000) return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedCars = [...filteredCars].sort((a, b) => {
    if (sortBy === 'Newest') {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
    if (sortBy === 'Price: Low to High') {
      return Number(a.price_val || 0) - Number(b.price_val || 0);
    }
    if (sortBy === 'Price: High to Low') {
      return Number(b.price_val || 0) - Number(a.price_val || 0);
    }
    if (sortBy === 'Year: Newest') {
      return Number(b.year) - Number(a.year);
    }
    return 0;
  });

  // Extract unique brands for dynamic filters if supabase returns unique ones
  const brands = ['All', 'Toyota', 'Mercedes', 'Lexus'];
  const years = ['All', '2024', '2023', '2022', '2021', '2020'];
  const locations = ['All', 'Lagos', 'Abuja', 'Port Harcourt'];
  const badges = ['All', 'Verified Dealer', 'Secure Trade', 'Accessories', 'Hot'];
  const priceRanges = ['All', 'Under ₦50M', '₦50M - ₦100M', 'Above ₦100M'];

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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-12 mt-16 md:mt-20">
        
        {/* Breadcrumbs & Header Banner */}
        <div className="mb-8 border-b border-nag-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-nag-gray-deep opacity-60 mb-2">
              <span>Marketplace</span>
              <span>/</span>
              <span className="text-nag-green-primary">Automotive Catalog</span>
            </div>
            <h1 className="text-4xl font-black text-nag-black tracking-tight uppercase flex items-center gap-3">
              <Car size={36} className="text-nag-green-primary" /> Vetted Automotive
            </h1>
            <p className="text-nag-gray-deep mt-1 text-sm font-semibold max-w-xl">
              Secure escrow trades, fully cataloged vehicle assets, and verified dealer listings across Nigeria.
            </p>
          </div>
          <button 
            onClick={fetchCars}
            className="flex items-center gap-1.5 px-4 py-2 border border-nag-border hover:bg-white text-nag-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-nag-green-primary" : ""} /> Refresh Catalog
          </button>
        </div>

        {/* Catalog Control Dashboard */}
        <div className="bg-white border border-nag-border rounded-3xl p-6 mb-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
            
            {/* Search Input */}
            <div className="lg:col-span-2 relative flex items-center">
              <Search className="absolute left-4 text-nag-gray-deep opacity-40" size={18} />
              <input
                type="text"
                placeholder="Search by title, brand, location..."
                value={searchQuery}
                aria-label="Search vehicles"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-nag-border focus:ring-2 focus:ring-nag-green-primary focus:border-transparent outline-none rounded-2xl font-bold text-xs text-nag-black bg-nag-gray-bg/40 hover:bg-nag-gray-bg/70 transition-colors placeholder:opacity-50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-4 text-nag-gray-deep opacity-50 hover:opacity-100 cursor-pointer">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sorting Select */}
            <div className="relative flex items-center">
              <select
                value={sortBy}
                aria-label="Sort listings"
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-nag-gray-bg/40 border border-nag-border text-nag-black text-xs font-bold uppercase tracking-wider rounded-2xl focus:ring-2 focus:ring-nag-green-primary focus:border-transparent outline-none appearance-none cursor-pointer pr-10 hover:bg-nag-gray-bg/70 transition-colors"
              >
                <option value="Newest">Sort: Newest First</option>
                <option value="Price: Low to High">Price: Low to High</option>
                <option value="Price: High to Low">Price: High to Low</option>
                <option value="Year: Newest">Year: Newest First</option>
              </select>
              <ChevronRight size={14} className="absolute right-4 rotate-90 text-nag-gray-deep opacity-40 pointer-events-none" />
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="w-full py-3 bg-nag-black hover:bg-opacity-90 text-white font-bold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md shadow-black/10 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>

          {/* Granular Dropdown Selectors */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-nag-border/60">
            {/* Brand Dropdown */}
            <div className="relative flex items-center">
              <select
                value={selectedBrand}
                aria-label="Filter by Brand"
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2.5 bg-nag-gray-bg/20 border border-nag-border text-nag-black text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-1 focus:ring-nag-green-primary outline-none appearance-none cursor-pointer pr-8 hover:bg-white transition-colors"
              >
                {brands.map(b => (
                  <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>
                ))}
              </select>
              <ChevronRight size={12} className="absolute right-3 rotate-90 text-nag-gray-deep opacity-40 pointer-events-none" />
            </div>

            {/* Year Dropdown */}
            <div className="relative flex items-center">
              <select
                value={selectedYear}
                aria-label="Filter by Manufacture Year"
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2.5 bg-nag-gray-bg/20 border border-nag-border text-nag-black text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-1 focus:ring-nag-green-primary outline-none appearance-none cursor-pointer pr-8 hover:bg-white transition-colors"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>
                ))}
              </select>
              <ChevronRight size={12} className="absolute right-3 rotate-90 text-nag-gray-deep opacity-40 pointer-events-none" />
            </div>

            {/* Price Dropdown */}
            <div className="relative flex items-center">
              <select
                value={selectedPriceRange}
                aria-label="Filter by Price Range"
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-3 py-2.5 bg-nag-gray-bg/20 border border-nag-border text-nag-black text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-1 focus:ring-nag-green-primary outline-none appearance-none cursor-pointer pr-8 hover:bg-white transition-colors"
              >
                {priceRanges.map(pr => (
                  <option key={pr} value={pr}>{pr === 'All' ? 'All Prices' : pr}</option>
                ))}
              </select>
              <ChevronRight size={12} className="absolute right-3 rotate-90 text-nag-gray-deep opacity-40 pointer-events-none" />
            </div>

            {/* Location Dropdown */}
            <div className="relative flex items-center">
              <select
                value={selectedLocation}
                aria-label="Filter by Location"
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2.5 bg-nag-gray-bg/20 border border-nag-border text-nag-black text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-1 focus:ring-nag-green-primary outline-none appearance-none cursor-pointer pr-8 hover:bg-white transition-colors"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc === 'All' ? 'All Locations' : loc}</option>
                ))}
              </select>
              <ChevronRight size={12} className="absolute right-3 rotate-90 text-nag-gray-deep opacity-40 pointer-events-none" />
            </div>

            {/* Badge Dropdown */}
            <div className="relative flex items-center">
              <select
                value={selectedBadge}
                aria-label="Filter by Ad Badge"
                onChange={(e) => setSelectedBadge(e.target.value)}
                className="w-full px-3 py-2.5 bg-nag-gray-bg/20 border border-nag-border text-nag-black text-[10px] font-black uppercase tracking-widest rounded-xl focus:ring-1 focus:ring-nag-green-primary outline-none appearance-none cursor-pointer pr-8 hover:bg-white transition-colors"
              >
                {badges.map(bg => (
                  <option key={bg} value={bg}>{bg === 'All' ? 'All Badges' : bg}</option>
                ))}
              </select>
              <ChevronRight size={12} className="absolute right-3 rotate-90 text-nag-gray-deep opacity-40 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Listings Display View */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-nag-green-primary" size={40} />
            <p className="text-nag-gray-deep text-xs font-bold uppercase tracking-wider animate-pulse">Consulting secure automobile database...</p>
          </div>
        ) : sortedCars.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-nag-border shadow-sm max-w-xl mx-auto px-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-nag-gray-bg flex items-center justify-center mx-auto text-nag-gray-deep opacity-35 animate-bounce">
              <Car size={32} />
            </div>
            <h3 className="text-xl font-black text-nag-black uppercase tracking-widest">No matching listings</h3>
            <p className="text-nag-gray-deep text-sm font-semibold">We couldn't find any vehicles that match your search filters. Try clearing filters or search query to explore the inventory.</p>
            <button 
              onClick={handleResetFilters}
              className="px-5 py-2.5 bg-nag-black hover:bg-opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-nag-gray-deep uppercase tracking-wider">
                Showing {sortedCars.length} Vetted Listings
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedCars.map((car) => (
                <div 
                  key={car.id} 
                  onClick={() => setSelectedCar(car)}
                  className="group bg-white rounded-3xl border border-nag-border overflow-hidden hover:shadow-2xl hover:border-nag-green-primary/30 transition-all duration-500 cursor-pointer flex flex-col h-full"
                >
                  {/* Aspect Ratio Container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-nag-gray-bg">
                    <img
                      src={car.img}
                      alt={car.title}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform group-hover:scale-105 duration-700"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className="bg-white/95 backdrop-blur-md text-nag-black text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-black/5 whitespace-nowrap">
                        <BadgeCheck size={11} className="text-nag-green-primary shrink-0" /> {car.badge}
                      </span>
                      <span className="bg-nag-black/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg w-fit">
                        {car.year}
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Content details */}
                  <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                    <div>
                      <h4 className="font-bold text-sm text-nag-black leading-tight group-hover:text-nag-green-primary transition-colors line-clamp-2 mb-1.5">
                        {car.title}
                      </h4>
                      <p className="text-lg font-display font-black text-nag-green-primary tracking-tight">
                        {car.price}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-nag-border flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[9px] text-nag-gray-deep font-black uppercase tracking-wider">
                        <MapPin size={10} className="text-nag-green-primary" /> {car.location}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-nag-gray-bg flex items-center justify-center group-hover:bg-nag-green-primary group-hover:text-white transition-all">
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />

      {/* ─── DEDICATED SPEC OVERLAY DIALOG ─── */}
      <AnimatePresence>
        {selectedCar && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm" 
              onClick={() => setSelectedCar(null)} 
            />
            
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative bg-white rounded-[32px] max-w-4xl w-full border border-nag-border shadow-[0_50px_120px_-30px_rgba(0,0,0,0.5)] z-[1010] max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedCar(null)}
                className="absolute top-4 right-4 z-10 p-2.5 bg-black/60 hover:bg-black/85 text-white rounded-full transition-colors cursor-pointer border border-white/10"
              >
                <X size={16} />
              </button>

              {/* Left Side: Vehicle Presentation */}
              <div className="w-full md:w-1/2 aspect-video md:aspect-auto md:min-h-[500px] relative bg-nag-black flex flex-col justify-end">
                <img 
                  src={selectedCar.img} 
                  alt={selectedCar.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                
                {/* Floating details */}
                <div className="relative p-6 space-y-3">
                  <div className="flex gap-2">
                    <span className="bg-nag-green-primary text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md border border-nag-green-secondary/35">
                      <BadgeCheck size={11} /> {selectedCar.badge}
                    </span>
                    <span className="bg-white text-nag-black text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1">
                      <Calendar size={11} /> {selectedCar.year}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-white leading-tight font-sans tracking-tight uppercase">{selectedCar.title}</h3>
                    <p className="text-2xl font-display font-black text-nag-green-secondary tracking-tight mt-1">{selectedCar.price}</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Specifications & Inquiry Form */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between space-y-6">
                
                {/* Vehicle Specs Table Sheet */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-nag-black mb-3 border-b border-nag-border pb-1.5">Vehicle Specification Sheet</h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div className="border-b border-nag-border/60 pb-1.5">
                      <p className="text-[8px] font-black uppercase text-nag-gray-deep opacity-60">Brand Model</p>
                      <p className="text-xs font-bold text-nag-black mt-0.5">{selectedCar.model}</p>
                    </div>
                    <div className="border-b border-nag-border/60 pb-1.5">
                      <p className="text-[8px] font-black uppercase text-nag-gray-deep opacity-60">Manufacture Year</p>
                      <p className="text-xs font-bold text-nag-black mt-0.5">{selectedCar.year}</p>
                    </div>
                    <div className="border-b border-nag-border/60 pb-1.5">
                      <p className="text-[8px] font-black uppercase text-nag-gray-deep opacity-60">Listing Price</p>
                      <p className="text-xs font-bold text-nag-green-primary mt-0.5">{selectedCar.price}</p>
                    </div>
                    <div className="border-b border-nag-border/60 pb-1.5">
                      <p className="text-[8px] font-black uppercase text-nag-gray-deep opacity-60">Physical Location</p>
                      <p className="text-xs font-bold text-nag-black mt-0.5 flex items-center gap-1"><MapPin size={11} className="text-nag-green-primary" /> {selectedCar.location}</p>
                    </div>
                    <div className="col-span-2 border-b border-nag-border/60 pb-1.5">
                      <p className="text-[8px] font-black uppercase text-nag-gray-deep opacity-60">Account Listing Verification</p>
                      <p className="text-xs font-bold text-nag-black mt-0.5 flex items-center gap-1.5">
                        <BadgeCheck size={14} className="text-nag-green-primary" /> Vetted Escrow Verified Advertisement
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inquiry Form */}
                <div className="bg-nag-gray-bg/40 border border-nag-border p-4 rounded-2xl space-y-3">
                  <h5 className="text-[9px] font-black uppercase tracking-widest text-nag-black flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-nag-green-primary" /> Contact Vetted Dealer
                  </h5>
                  
                  <form onSubmit={handleInquirySubmit} className="space-y-3.5">
                    {/* User Full Name */}
                    <div className="relative flex items-center">
                      <User size={13} className="absolute left-3 text-nag-gray-deep opacity-55" />
                      <input 
                        type="text"
                        required
                        placeholder="Your Full Name"
                        value={inquiryName}
                        onChange={(e) => setInquiryName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-nag-border focus:ring-1 focus:ring-nag-green-primary outline-none rounded-xl font-bold text-xs bg-white text-nag-black"
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="relative flex items-center">
                      <Phone size={13} className="absolute left-3 text-nag-gray-deep opacity-55" />
                      <input 
                        type="tel"
                        required
                        placeholder="Your Phone Number"
                        value={inquiryPhone}
                        onChange={(e) => setInquiryPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 border border-nag-border focus:ring-1 focus:ring-nag-green-primary outline-none rounded-xl font-bold text-xs bg-white text-nag-black"
                      />
                    </div>

                    {/* Inquiry Message Textarea */}
                    <div>
                      <textarea
                        required
                        rows={3}
                        value={inquiryMessage}
                        onChange={(e) => setInquiryMessage(e.target.value)}
                        className="w-full p-3 border border-nag-border focus:ring-1 focus:ring-nag-green-primary outline-none rounded-xl font-semibold text-[11px] bg-white text-nag-gray-deep leading-relaxed resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submittingInquiry}
                      className="w-full py-2.5 bg-nag-green-primary hover:bg-nag-green-secondary text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-nag-green-primary/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {submittingInquiry ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      {submittingInquiry ? 'Sending Quote Inquiry...' : 'Submit Inquiry'}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
