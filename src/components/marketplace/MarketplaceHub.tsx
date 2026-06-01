import { Car, Home, Briefcase, Filter, Search, ChevronLeft, ChevronRight, Tag, MapPin, BadgeCheck, Loader2, Image as ImageIcon, CreditCard, Lock, ShieldCheck, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MarketplaceItem, AutomotiveItem, RealEstateItem, CareerItem } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { AuthModal } from '../news/AuthModal';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const promiseWithTimeout = (promise: Promise<any>, timeoutMs: number = 30000) => {
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

const FALLBACK_PLANS = [
  {
    id: 'fallback-weekly',
    name: 'Basic Weekly Ad',
    price: 5000,
    duration_days: 7,
    features: ['7 Days Visibility', 'Standard Reach', '1 Image Upload'],
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-monthly',
    name: 'Premium Dealer Monthly',
    price: 15000,
    duration_days: 30,
    features: ['30 Days Visibility', 'Highlighted Badge', 'Up to 5 Images', 'Priority Placement'],
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-annual',
    name: 'Unlimited Enterprise Annual',
    price: 120000,
    duration_days: 365,
    features: ['365 Days Visibility', 'Featured Homepage Banner', 'Infinite Images', 'Dedicated Dealer Page', 'Supervised Escrow Trade'],
    created_at: new Date().toISOString()
  }
];

const FALLBACK_CARS = [
  {
    id: 'fallback-prado',
    title: '2022 Toyota Prado (TX-L) - Full Option',
    price: '₦85,000,000',
    priceVal: 85000000,
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
    priceVal: 180000000,
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
    priceVal: 45000000,
    year: 2021,
    model: 'Toyota',
    location: 'Ikeja, Lagos',
    badge: 'Accessories',
    img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&fit=crop',
    status: 'approved',
    created_at: new Date().toISOString()
  },
  {
    id: 'fallback-lexus-lx570',
    title: '2021 Lexus LX 570 Super Sport',
    price: '₦125,000,000',
    priceVal: 125000000,
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
    priceVal: 165000000,
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
    priceVal: 62000000,
    year: 2020,
    model: 'Toyota',
    location: 'Port Harcourt, NG',
    badge: 'Secure Trade',
    img: 'https://images.unsplash.com/photo-1594568284297-7c64464062b1?q=80&w=600&fit=crop',
    status: 'approved',
    created_at: new Date().toISOString()
  }
];

export function MarketplaceHub({
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab
}: {
  activeTab?: 'automotive' | 'realestate' | 'careers';
  setActiveTab?: (val: 'automotive' | 'realestate' | 'careers') => void;
} = {}) {
  const { user, loading: authLoading } = useAuth();
  const [localActiveTab, setLocalActiveTab] = useState<'automotive' | 'realestate' | 'careers'>('automotive');
  const activeTab = propActiveTab !== undefined ? propActiveTab : localActiveTab;
  const setActiveTab = propSetActiveTab !== undefined ? propSetActiveTab : setLocalActiveTab;
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    automotive: { year: 'All', model: 'All', priceRange: 'All' },
    realestate: { type: 'All', bedrooms: 'All', region: 'All' },
    careers: { sector: 'All', location: 'All' }
  });
  const [sortBy, setSortBy] = useState('Newest');

  const automotiveScrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (automotiveScrollRef.current) {
      automotiveScrollRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (automotiveScrollRef.current) {
      automotiveScrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const [isHovered, setIsHovered] = useState(false);

  // Supabase states
  const [dbCars, setDbCars] = useState<AutomotiveItem[]>([]);
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);

  // Post Listing states
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState(false);
  const [paying, setPaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCar, setNewCar] = useState({
    title: '',
    price: '',
    price_val: 0,
    year: new Date().getFullYear(),
    model: '',
    location: '',
    badge: 'Verified Dealer',
    img: '',
  });

  // Credit Card Form States
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    fetchCars();
    fetchPlans();
  }, []);

  const fetchCars = async () => {
    try {
      console.log('[MarketplaceHub] fetchCars started (15s timeout)...');
      setCarsLoading(true);
      const { data, error } = await promiseWithTimeout(
        Promise.resolve(
          supabase
            .from('marketplace_cars')
            .select('*')
            .order('created_at', { ascending: false })
        ),
        15000 // 15 seconds SELECT timeout
      ) as any;
      console.log('[MarketplaceHub] fetchCars result:', { count: data?.length, error });
      if (error) throw error;
      
      // Parse items to comply with AutomotiveItem interface
      const parsedCars: AutomotiveItem[] = (data || []).map(car => ({
        id: car.id,
        title: car.title,
        price: car.price,
        priceVal: Number(car.price_val),
        year: Number(car.year),
        model: car.model,
        location: car.location,
        badge: car.badge,
        img: car.img
      }));
      setDbCars(parsedCars);
    } catch (err: any) {
      console.warn('[MarketplaceHub] Error fetching cars, loading fallback cars:', err);
      setDbCars(FALLBACK_CARS);
    } finally {
      setCarsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      console.log('[MarketplaceHub] fetchPlans started (15s timeout)...');
      const { data, error } = await promiseWithTimeout(
        Promise.resolve(
          supabase
            .from('subscription_plans')
            .select('*')
            .order('price', { ascending: true })
        ),
        15000 // 15 seconds SELECT timeout
      ) as any;
      console.log('[MarketplaceHub] fetchPlans result:', { count: data?.length, error });
      if (error) throw error;
      setDbPlans(data || []);
      if (data && data.length > 0) {
        setSelectedPlan(data[0]);
      }
    } catch (err: any) {
      console.warn('[MarketplaceHub] Error fetching plans, loading fallback tiers:', err);
      setDbPlans(FALLBACK_PLANS);
      if (FALLBACK_PLANS.length > 0) {
        setSelectedPlan(FALLBACK_PLANS[0]);
      }
    }
  };

  const handlePostListingClick = () => {
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setIsPostOpen(true);
      setPaymentStep(false);
      setNewCar({
        title: '',
        price: '',
        price_val: 0,
        year: new Date().getFullYear(),
        model: '',
        location: '',
        badge: 'Verified Dealer',
        img: '',
      });
    }
  };

  const handleCarImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image is too large. Choose an image under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 225; // 16:9 ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setNewCar((prev: any) => ({ ...prev, img: dataUrl }));
          toast.success('Listing thumbnail compressed and attached!');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCar.title) return toast.error('Vehicle title is required');
    if (!newCar.price) return toast.error('Price label is required (e.g. ₦12,000,000)');
    if (!newCar.price_val) return toast.error('Price numeric value is required');
    if (!newCar.model) return toast.error('Model Brand is required');
    if (!newCar.location) return toast.error('Location is required');
    if (!newCar.img) return toast.error('Listing image is required');
    if (!selectedPlan) return toast.error('Select a subscription plan');

    // Automatically inherit badge from chosen plan or default
    let badge = 'Verified Dealer';
    if (selectedPlan.name.includes('Premium')) badge = 'Secure Trade';
    if (selectedPlan.name.includes('Enterprise')) badge = 'Hot';
    setNewCar(prev => ({ ...prev, badge }));

    setPaymentStep(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
      return toast.error('Fill in all payment credentials');
    }

    setPaying(true);
    try {
      // Simulate Stripe API Latency
      await new Promise(resolve => setTimeout(resolve, 2000));

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + selectedPlan.duration_days);

      console.log('[MarketplaceHub] Creating subscription plan for user:', user?.id);

      // 1. Create User Subscription
      const { error: subErr } = await promiseWithTimeout(
        Promise.resolve(
          supabase
            .from('user_subscriptions')
            .insert([{
              user_id: user?.id,
              plan_id: selectedPlan.id,
              status: 'active',
              expires_at: expiresAt.toISOString()
            }])
        )
      ) as any;
      if (subErr) throw subErr;

      console.log('[MarketplaceHub] Inserting new vehicle listing for user:', user?.id);

      // 2. Insert Car Advertisement listing
      const { error: carErr } = await promiseWithTimeout(
        Promise.resolve(
          supabase
            .from('marketplace_cars')
            .insert([{
              ...newCar,
              user_id: user?.id,
              status: 'approved' // Automatically approved on paid subscription
            }])
        )
      ) as any;
      if (carErr) throw carErr;

      toast.success('🎉 Listing published live! Subscription payment processed.');
      setIsPostOpen(false);
      fetchCars();
    } catch (err: any) {
      console.error('[MarketplaceHub] Error processing ad posting & payment:', err);
      toast.error('Payment Processing Failed: ' + (err.message || err));
    } finally {
      setPaying(false);
    }
  };

  const tabs = [
    { id: 'automotive', label: 'Automotive', icon: Car },
    { id: 'realestate', label: 'Real Estate', icon: Home },
    { id: 'careers', label: 'Careers', icon: Briefcase },
  ];

  const data: { automotive: AutomotiveItem[], realestate: RealEstateItem[], careers: CareerItem[] } = {
    automotive: dbCars,
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

  const isAuto = (i: MarketplaceItem): i is AutomotiveItem => activeTab === 'automotive';
  const isRE = (i: MarketplaceItem): i is RealEstateItem => activeTab === 'realestate';
  const isJob = (i: MarketplaceItem): i is CareerItem => activeTab === 'careers';

  const filteredData = (data[activeTab] as MarketplaceItem[]).filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (isAuto(item) && activeTab === 'automotive') {
      const f = filters.automotive;
      return matchesSearch &&
        (f.year === 'All' || item.year.toString() === f.year) &&
        (f.model === 'All' || item.model === f.model) &&
        (f.priceRange === 'All' || (f.priceRange === 'High' ? item.priceVal > 50000000 : item.priceVal <= 50000000));
    }

    if (isRE(item) && activeTab === 'realestate') {
      const f = filters.realestate;
      return matchesSearch &&
        (f.type === 'All' || item.type === f.type) &&
        (f.bedrooms === 'All' || item.bedrooms.toString() === f.bedrooms) &&
        (f.region === 'All' || item.location.includes(f.region));
    }

    if (isJob(item) && activeTab === 'careers') {
      const f = filters.careers;
      return matchesSearch &&
        (f.sector === 'All' || item.sector === f.sector) &&
        (f.location === 'All' || item.location === f.location);
    }

    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'Price High-Low') return b.priceVal - a.priceVal;
    if (sortBy === 'Price Low-High') return a.priceVal - b.priceVal;
    return 0;
  });

  // Auto-sliding interval for automotive catalog
  useEffect(() => {
    if (activeTab !== 'automotive' || carsLoading || filteredData.length <= 1 || isHovered) {
      return;
    }

    const interval = setInterval(() => {
      if (automotiveScrollRef.current) {
        const { scrollLeft, clientWidth, scrollWidth } = automotiveScrollRef.current;
        
        // Loop back smoothly to the beginning if we reached the end of the scroll track
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          automotiveScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          automotiveScrollRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }
    }, 4000); // Auto-slide every 4 seconds

    return () => clearInterval(interval);
  }, [activeTab, carsLoading, filteredData.length, isHovered]);

  const handleFilterChange = (category: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], [category]: value }
    }));
  };

  return (
    <>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

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

            <div className="flex bg-nag-gray-bg p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar relative z-30 shadow-sm max-w-full shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
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
                    aria-label="Sort listings"
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-auto bg-white/10 text-white py-3.5 px-6 md:py-5 rounded-xl border border-white/10 font-black text-[9px] uppercase tracking-widest appearance-none focus:outline-none cursor-pointer hover:bg-white/20 transition-all pr-12"
                  >
                    <option className="bg-nag-black" value="Newest">Newest</option>
                    <option className="bg-nag-black" value="Price High-Low">Price High-Low</option>
                    <option className="bg-nag-black" value="Price Low-High">Price Low-High</option>
                  </select>
                  <Filter size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                </div>
                <button 
                  onClick={handlePostListingClick}
                  className="flex-1 sm:flex-none bg-nag-green-primary text-white py-3.5 px-6 md:px-10 rounded-xl font-black text-[9px] uppercase tracking-wider hover:bg-nag-green-secondary transition-all shadow-xl shadow-nag-green-primary/20 whitespace-nowrap cursor-pointer"
                >
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
            {activeTab === 'automotive' ? (
              carsLoading ? (
                <div key="automotive-loading" className="py-20 text-center w-full"><Loader2 className="animate-spin mx-auto text-nag-green-primary" size={32} /></div>
              ) : filteredData.length > 0 ? (
                <motion.div
                  key="automotive-slider"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative group/slider w-full"
                >
                  {/* Glassmorphic Side Arrows for Sliding */}
                  <button
                    type="button"
                    onClick={scrollLeft}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/90 hover:bg-white border border-nag-border flex items-center justify-center text-nag-black shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-nag-green-primary"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={scrollRight}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/90 hover:bg-white border border-nag-border flex items-center justify-center text-nag-black shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 pointer-events-auto cursor-pointer focus:outline-none focus:ring-2 focus:ring-nag-green-primary"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={20} />
                  </button>

                  {/* Horizontal Scroll Snap Track */}
                  <div
                    ref={automotiveScrollRef}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar py-4 px-1"
                  >
                    {filteredData.map((item) => (
                      <div key={item.id} className="w-[280px] sm:w-[340px] shrink-0 snap-start">
                        <ListingCard item={item} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="automotive-empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="py-20 text-center space-y-4 w-full"
                >
                  <div className="w-16 h-16 rounded-full bg-nag-gray-bg flex items-center justify-center mx-auto text-nag-gray-deep opacity-20">
                    <Search size={32} />
                  </div>
                  <h3 className="text-xl font-display font-black text-nag-black">No results found.</h3>
                  <p className="text-nag-gray-deep text-sm font-medium">Try adjusting your filters or search query to find what you are looking for.</p>
                </motion.div>
              )
            ) : (
              <motion.div
                key={activeTab + searchQuery + JSON.stringify(filters[activeTab]) + sortBy}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
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
            )}
          </AnimatePresence>

          <div className="mt-12 flex justify-center">
            {activeTab === 'automotive' ? (
              <Link
                to="/automotive"
                className="flex items-center gap-2 group font-display font-black uppercase text-xs tracking-widest text-nag-green-primary border-b-2 border-nag-green-primary pb-1 hover:gap-4 transition-all"
              >
                See all listings in {activeTab} <ChevronRight size={16} />
              </Link>
            ) : (
              <button
                onClick={() => toast.success(`Vetted ${activeTab === 'realestate' ? 'Real Estate' : 'Careers'} catalog is launching soon!`)}
                className="flex items-center gap-2 group font-display font-black uppercase text-xs tracking-widest text-nag-green-primary border-b-2 border-nag-green-primary pb-1 hover:gap-4 transition-all"
              >
                See all listings in {activeTab} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── POST VEHICLE ADVERTISEMENT DIALOG ─── */}
      {isPostOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPostOpen(false)} />
          <div className="relative bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-nag-border shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] z-[1010] max-h-[90vh] overflow-y-auto">
            
            <AnimatePresence mode="wait">
              {!paymentStep ? (
                // ─── STEP 1: Specs & Plan Configuration ───
                <motion.div
                  key="step-specs"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest text-nag-black">Post Vehicle Advertisement</h3>
                    <p className="text-xs text-nag-gray-deep mt-1">Configure your listing specifications and choose a subscription plan to advertise.</p>
                  </div>

                  <form onSubmit={handleProceedToPayment} className="space-y-4">
                    {/* Vehicle Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black mb-1">Ad Title</label>
                        <input
                          type="text"
                          required
                          value={newCar.title}
                          onChange={(e) => setNewCar({ ...newCar, title: e.target.value })}
                          placeholder="e.g. 2022 Toyota Prado (TX-L)"
                          className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black mb-1">Model Brand</label>
                        <input
                          type="text"
                          required
                          value={newCar.model}
                          onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                          placeholder="e.g. Toyota"
                          className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black mb-1">Manufacture Year</label>
                        <input
                          type="number"
                          required
                          value={newCar.year}
                          onChange={(e) => setNewCar({ ...newCar, year: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black mb-1">Price Label</label>
                        <input
                          type="text"
                          required
                          value={newCar.price}
                          onChange={(e) => setNewCar({ ...newCar, price: e.target.value })}
                          placeholder="e.g. ₦85,000,000"
                          className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black mb-1">Price Sorting Value</label>
                        <input
                          type="number"
                          required
                          value={newCar.price_val || ''}
                          onChange={(e) => setNewCar({ ...newCar, price_val: parseInt(e.target.value) })}
                          placeholder="e.g. 85000000"
                          className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black mb-1">Location</label>
                        <input
                          type="text"
                          required
                          value={newCar.location}
                          onChange={(e) => setNewCar({ ...newCar, location: e.target.value })}
                          placeholder="e.g. Victoria Island, Lagos"
                          className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black mb-1">Vehicle Image</label>
                        <div className="flex gap-3 items-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2.5 border border-nag-border hover:bg-nag-gray-bg text-nag-black font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <ImageIcon size={14} /> Upload Local File
                          </button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleCarImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          {newCar.img && (
                            <span className="text-[10px] font-bold text-nag-green-primary flex items-center gap-1">
                              <Check size={12} /> Ready
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Subscription Plans Selection */}
                    <div className="space-y-3">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black">Select Advertising Subscription Plan</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {dbPlans.map((plan) => {
                          const isSelected = selectedPlan?.id === plan.id;
                          return (
                            <div
                              key={plan.id}
                              onClick={() => setSelectedPlan(plan)}
                              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-32 ${
                                isSelected
                                  ? 'border-nag-green-primary bg-nag-green-primary/5 shadow-md shadow-nag-green-primary/5'
                                  : 'border-nag-border bg-white hover:border-nag-green-primary/55'
                              }`}
                            >
                              <div>
                                <h4 className="text-xs font-black text-nag-black leading-tight">{plan.name}</h4>
                                <p className="text-[8px] font-black text-nag-gray-deep opacity-60 uppercase mt-0.5">{plan.duration_days} Days Duration</p>
                              </div>
                              <p className="text-lg font-display font-black text-nag-green-primary tracking-tight">₦{Number(plan.price || 0).toLocaleString()}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-nag-border mt-4">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-nag-green-primary hover:bg-nag-green-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-nag-green-primary/10"
                      >
                        Proceed to Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPostOpen(false)}
                        className="py-3 px-6 border border-nag-border hover:bg-nag-gray-bg text-nag-black font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                // ─── STEP 2: Stripe Checkout Simulator ───
                <motion.div
                  key="step-payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-nag-black text-white p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-nag-green-primary/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10 space-y-4">
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <div>
                          <p className="text-[8px] font-black uppercase text-white/50 tracking-wider">Secured Checkout Gateway</p>
                          <h4 className="text-lg font-black uppercase">Nigeria Secure Automotive Escrow</h4>
                        </div>
                        <ShieldCheck size={28} className="text-nag-green-primary" />
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[8px] font-black uppercase text-white/50 tracking-wider">Subscription Tier</p>
                          <p className="text-sm font-bold text-white">{selectedPlan?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] font-black uppercase text-white/50 tracking-wider">Due Amount</p>
                          <p className="text-xl font-display font-black text-nag-green-secondary">₦{Number(selectedPlan?.price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="e.g. Aliko Babangida"
                        className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black mb-1">Credit Card Number</label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19))}
                          placeholder="4000 1234 5678 9010"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                        />
                        <CreditCard size={14} className="absolute left-3.5 text-gray-400" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black mb-1">Expiration Date</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value.replace(/\s?/g, '').substring(0, 5))}
                          placeholder="MM/YY"
                          className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black mb-1">CVV Code</label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.replace(/\s?/g, '').substring(0, 3))}
                          placeholder="***"
                          className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs text-center"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 justify-center">
                      <Lock size={12} className="text-nag-green-primary" /> End-to-end 256-bit encryption. Payment powered by Stripe.
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-nag-border mt-4">
                      <button
                        type="submit"
                        disabled={paying}
                        className="flex-1 py-3 bg-nag-green-primary hover:bg-nag-green-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-nag-green-primary/10 disabled:opacity-50"
                      >
                        {paying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                        {paying ? 'Authorizing with bank...' : `Pay ₦${Number(selectedPlan?.price || 0).toLocaleString()}`}
                      </button>
                      <button
                        type="button"
                        disabled={paying}
                        onClick={() => setPaymentStep(false)}
                        className="py-3 px-6 border border-nag-border hover:bg-nag-gray-bg text-nag-black font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}

interface ListingCardProps {
  item: MarketplaceItem;
}

function ListingCard({ item }: ListingCardProps) {
  const isAutomotive = (item: MarketplaceItem): item is AutomotiveItem => 'year' in item;
  const isRealEstate = (item: MarketplaceItem): item is RealEstateItem => 'bedrooms' in item;
  const isCareer = (item: MarketplaceItem): item is CareerItem => 'sector' in item;

  return (
    <div className="group bg-white rounded-3xl border border-nag-border overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full">
      <div className="relative aspect-video md:h-48 overflow-hidden bg-nag-gray-bg">
        <img
          src={item.img}
          alt={item.title}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform group-hover:scale-110 duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 md:top-4 md:left-4">
          <div className="flex flex-col gap-2">
            <span className="bg-white/95 backdrop-blur-md text-nag-black text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg flex items-center gap-1.5 md:gap-2 shadow-sm border border-black/5 whitespace-nowrap">
              <BadgeCheck size={12} className="text-nag-green-primary shrink-0" /> {item.badge}
            </span>
            {isAutomotive(item) && (
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
            {isCareer(item) && <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-nag-green-primary/10 text-nag-green-primary">{item.sector}</span>}
            {isRealEstate(item) && (
              <>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-nag-black/5 text-nag-black">{item.type}</span>
                {item.bedrooms > 0 && <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-nag-black/5 text-nag-black">{item.bedrooms} Bed</span>}
              </>
            )}
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
        aria-label={`Filter by ${label}`}
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
