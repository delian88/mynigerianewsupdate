import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { 
  Car, Tag, Plus, Edit2, Trash2, Save, Loader2, Image as ImageIcon, 
  MapPin, Calendar, DollarSign, List, Shield, Check, Trash
} from 'lucide-react';

export default function CarMarketplaceEditor() {
  const [activeTab, setActiveTab] = useState<'cars' | 'plans'>('cars');
  const [cars, setCars] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Car editing states
  const [editingCar, setEditingCar] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Plan editing states
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'cars') {
        const { data, error } = await supabase
          .from('marketplace_cars')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setCars(data || []);
      } else {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });
        if (error) throw error;
        setPlans(data || []);
      }
    } catch (err: any) {
      toast.error('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Car Actions
  const handleAddNewCar = () => {
    setEditingCar({
      title: '',
      price: '',
      price_val: 0,
      year: new Date().getFullYear(),
      model: '',
      location: '',
      badge: 'Verified Dealer',
      img: '',
      status: 'approved'
    });
  };

  const handleCarImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
          setEditingCar((prev: any) => ({ ...prev, img: dataUrl }));
          toast.success('Listing thumbnail processed successfully!');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar.title) return toast.error('Title is required');
    if (!editingCar.price) return toast.error('Price label is required (e.g. ₦10,000,000)');
    if (!editingCar.price_val) return toast.error('Price numeric value is required for sorting');
    if (!editingCar.img) return toast.error('Car image is required');

    setSaving(true);
    try {
      if (editingCar.id) {
        const { error } = await supabase
          .from('marketplace_cars')
          .update(editingCar)
          .eq('id', editingCar.id);
        if (error) throw error;
        toast.success('Vehicle listing updated successfully');
      } else {
        const { error } = await supabase
          .from('marketplace_cars')
          .insert([editingCar]);
        if (error) throw error;
        toast.success('Vehicle listing created successfully');
      }
      setEditingCar(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to save vehicle: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this vehicle listing?')) return;
    try {
      const { error } = await supabase
        .from('marketplace_cars')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Vehicle listing deleted');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete listing: ' + err.message);
    }
  };

  // Plan Actions
  const handleAddNewPlan = () => {
    setEditingPlan({
      name: '',
      price: '',
      duration_days: 30,
      features: []
    });
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setEditingPlan((prev: any) => ({
      ...prev,
      features: [...(prev.features || []), newFeature.trim()]
    }));
    setNewFeature('');
  };

  const handleRemoveFeature = (idx: number) => {
    setEditingPlan((prev: any) => ({
      ...prev,
      features: prev.features.filter((_: any, i: number) => i !== idx)
    }));
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan.name) return toast.error('Plan name is required');
    if (editingPlan.price === undefined || editingPlan.price === '') return toast.error('Plan price is required');

    setSaving(true);
    try {
      const payload = {
        ...editingPlan,
        price: parseFloat(editingPlan.price)
      };

      if (editingPlan.id) {
        const { error } = await supabase
          .from('subscription_plans')
          .update(payload)
          .eq('id', editingPlan.id);
        if (error) throw error;
        toast.success('Subscription plan updated successfully');
      } else {
        const { error } = await supabase
          .from('subscription_plans')
          .insert([payload]);
        if (error) throw error;
        toast.success('Subscription plan created successfully');
      }
      setEditingPlan(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to save plan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan? Users on this plan will not be deleted.')) return;
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Subscription plan deleted');
      fetchData();
    } catch (err: any) {
      toast.error('Failed to delete plan: ' + err.message);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-nag-border shadow-sm">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-nag-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-nag-black tracking-tight mb-2 uppercase flex items-center gap-3">
            <Car size={32} className="text-nag-green-primary" /> Car Marketplace
          </h1>
          <p className="text-nag-gray-deep">
            Manage seeded/posted cars catalog and create premium advertisement subscription plans.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-nag-gray-bg p-1 rounded-xl shadow-inner shrink-0">
          <button
            onClick={() => setActiveTab('cars')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'cars'
                ? 'bg-white text-nag-black shadow'
                : 'text-nag-gray-deep opacity-60 hover:opacity-100'
            }`}
          >
            <List size={14} /> Cars Catalog
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'plans'
                ? 'bg-white text-nag-black shadow'
                : 'text-nag-gray-deep opacity-60 hover:opacity-100'
            }`}
          >
            <Shield size={14} /> Subscription Plans
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-nag-green-primary" size={32} /></div>
      ) : activeTab === 'cars' ? (
        // ─── CARS CATALOG VIEW ───
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black uppercase text-nag-black tracking-widest">Active Car Advertisements</h3>
            <button
              onClick={handleAddNewCar}
              className="bg-nag-black hover:bg-opacity-90 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <Plus size={16} /> Add New Car
            </button>
          </div>

          {cars.length === 0 ? (
            <div className="text-center py-20 bg-nag-gray-bg rounded-2xl border border-dashed border-nag-border">
              <Car size={48} className="mx-auto text-nag-gray-deep opacity-35 mb-4 animate-pulse" />
              <h3 className="text-xl font-black text-nag-black mb-1">Catalog is empty</h3>
              <p className="text-nag-gray-deep text-sm font-medium">Add some vehicle listings or seed default cars to populate the grid.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-nag-border">
              <table className="w-full text-left">
                <thead className="bg-nag-gray-bg border-b border-nag-border">
                  <tr>
                    <th className="p-4 font-bold text-xs text-nag-gray-deep uppercase tracking-wider">Thumbnail &amp; Title</th>
                    <th className="p-4 font-bold text-xs text-nag-gray-deep uppercase tracking-wider">Specs &amp; Category</th>
                    <th className="p-4 font-bold text-xs text-nag-gray-deep uppercase tracking-wider">Price Label</th>
                    <th className="p-4 font-bold text-xs text-nag-gray-deep uppercase tracking-wider">Location</th>
                    <th className="p-4 font-bold text-xs text-nag-gray-deep uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nag-border">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-nag-gray-bg border border-nag-border shrink-0">
                          <img src={car.img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-nag-black truncate max-w-xs">{car.title}</p>
                          <span className={`inline-block px-1.5 py-0.5 mt-1 rounded text-[8px] font-black uppercase tracking-wider ${
                            car.badge === 'Verified Dealer' ? 'bg-nag-green-primary/10 text-nag-green-primary' :
                            car.badge === 'Secure Trade' ? 'bg-blue-50 text-blue-600' :
                            car.badge === 'Accessories' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {car.badge}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-xs font-bold text-nag-black">{car.year} {car.model}</p>
                        <p className="text-[9px] text-nag-gray-deep font-semibold uppercase mt-0.5 tracking-wider">Status: {car.status}</p>
                      </td>
                      <td className="p-4 font-display font-black text-sm text-nag-green-primary">
                        {car.price}
                      </td>
                      <td className="p-4 text-xs font-semibold text-nag-gray-deep flex items-center gap-1 mt-2.5">
                        <MapPin size={11} /> {car.location}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setEditingCar(car)}
                          className="p-2 text-nag-gray-deep hover:text-blue-600 bg-white rounded-lg border border-transparent hover:border-blue-200 transition-all cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCar(car.id)}
                          className="p-2 text-nag-gray-deep hover:text-red-600 bg-white rounded-lg border border-transparent hover:border-red-200 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        // ─── SUBSCRIPTION PLANS VIEW ───
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black uppercase text-nag-black tracking-widest">Active Subscription Tiers</h3>
            <button
              onClick={handleAddNewPlan}
              className="bg-nag-black hover:bg-opacity-90 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <Plus size={16} /> Create New Plan
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="relative group bg-white border border-nag-border rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-nag-green-primary px-2.5 py-1 rounded bg-nag-green-primary/10">
                      {plan.duration_days} Days Active
                    </span>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingPlan(plan)}
                        className="p-1.5 bg-nag-gray-bg hover:bg-blue-50 text-nag-gray-deep hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1.5 bg-nag-gray-bg hover:bg-red-50 text-nag-gray-deep hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-nag-black leading-tight">{plan.name}</h4>
                    <p className="text-3xl font-display font-black text-nag-green-primary tracking-tight mt-1.5">
                      ₦{plan.price.toLocaleString()}
                    </p>
                  </div>
                  <ul className="space-y-2 pt-2 border-t border-nag-border/60">
                    {plan.features?.map((feat: string, fIdx: number) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs font-semibold text-nag-gray-deep">
                        <Check size={14} className="text-nag-green-primary shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── CAR MODAL DIALOG ─── */}
      {editingCar && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingCar(null)} />
          <div className="relative bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-nag-border shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] z-[1010] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black uppercase tracking-widest text-nag-black mb-6">
              {editingCar.id ? 'Modify Vehicle Listing' : 'Publish New Vehicle Listing'}
            </h3>
            <form onSubmit={handleSaveCar} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1">Vehicle Listing Title</label>
                <input
                  type="text"
                  required
                  value={editingCar.title}
                  onChange={(e) => setEditingCar({ ...editingCar, title: e.target.value })}
                  placeholder="e.g. 2023 Mercedes-Benz G63 AMG - Bulletproof"
                  className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1">Model Brand</label>
                  <input
                    type="text"
                    required
                    value={editingCar.model}
                    onChange={(e) => setEditingCar({ ...editingCar, model: e.target.value })}
                    placeholder="e.g. Mercedes"
                    className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1">Manufacture Year</label>
                  <input
                    type="number"
                    required
                    value={editingCar.year}
                    onChange={(e) => setEditingCar({ ...editingCar, year: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1">Price Label</label>
                  <input
                    type="text"
                    required
                    value={editingCar.price}
                    onChange={(e) => setEditingCar({ ...editingCar, price: e.target.value })}
                    placeholder="e.g. ₦180,000,000"
                    className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1">Price Value (For Sorting)</label>
                  <input
                    type="number"
                    required
                    value={editingCar.price_val || ''}
                    onChange={(e) => setEditingCar({ ...editingCar, price_val: parseInt(e.target.value) })}
                    placeholder="e.g. 180000000"
                    className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={editingCar.location}
                    onChange={(e) => setEditingCar({ ...editingCar, location: e.target.value })}
                    placeholder="e.g. Abuja, NG"
                    className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1">Ad Validation Badge</label>
                  <select
                    value={editingCar.badge}
                    onChange={(e) => setEditingCar({ ...editingCar, badge: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs bg-white"
                  >
                    <option value="Verified Dealer">Verified Dealer</option>
                    <option value="Secure Trade">Secure Trade</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Hot">Hot</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1">Vehicle Image</label>
                <div className="flex gap-4 items-center">
                  <div className="w-24 h-16 rounded-xl border border-nag-border bg-nag-gray-bg flex items-center justify-center overflow-hidden shrink-0">
                    {editingCar.img ? (
                      <img src={editingCar.img} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-nag-border hover:bg-nag-gray-bg text-nag-black font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon size={14} /> Upload Listing Image
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleCarImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <p className="text-[9px] text-gray-400 mt-1">Image will be compressed to optimized 16:9 thumbnail automatically</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-nag-border mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-nag-green-primary hover:bg-nag-green-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-nag-green-primary/10 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Publish Listing'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCar(null)}
                  className="py-3 px-6 border border-nag-border hover:bg-nag-gray-bg text-nag-black font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PLAN MODAL DIALOG ─── */}
      {editingPlan && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingPlan(null)} />
          <div className="relative bg-white rounded-3xl p-6 md:p-8 max-w-xl w-full border border-nag-border shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] z-[1010] max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black uppercase tracking-widest text-nag-black mb-6">
              {editingPlan.id ? 'Configure Pricing Tier' : 'Create Pricing Tier'}
            </h3>
            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  placeholder="e.g. Premium Dealer Monthly"
                  className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1">Price (₦ Naira)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: e.target.value })}
                    placeholder="e.g. 15000"
                    className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    value={editingPlan.duration_days}
                    onChange={(e) => setEditingPlan({ ...editingPlan, duration_days: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-bold text-xs"
                  />
                </div>
              </div>

              {/* Plan Features */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-nag-black mb-1.5">Plan Features Checklist</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="e.g. Priority Placement in Grid"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none font-semibold text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2.5 bg-nag-black hover:bg-opacity-95 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <ul className="mt-3 space-y-2 max-h-40 overflow-y-auto border border-nag-border/60 p-3 rounded-xl bg-nag-gray-bg/40">
                  {editingPlan.features?.length > 0 ? (
                    editingPlan.features.map((feat: string, idx: number) => (
                      <li key={idx} className="flex items-center justify-between gap-3 text-xs bg-white px-3 py-1.5 rounded-lg border border-nag-border/40">
                        <span className="font-semibold text-nag-gray-deep">{feat}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash size={12} />
                        </button>
                      </li>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs font-semibold text-gray-400">No features specified yet.</div>
                  )}
                </ul>
              </div>

              <div className="flex gap-3 pt-4 border-t border-nag-border mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-nag-green-primary hover:bg-nag-green-secondary text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-nag-green-primary/10 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Saving...' : 'Save Plan'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="py-3 px-6 border border-nag-border hover:bg-nag-gray-bg text-nag-black font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
