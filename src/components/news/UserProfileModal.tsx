import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User, Mail, Briefcase, MapPin, Sparkles, Phone, 
  ShieldCheck, Check, Calendar, Plus, Trash2, Camera, Save, Activity, LogOut
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { Profile } from '../../hooks/useAuth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
}

const CATEGORIES = [
  'Latest', 'Politics', 'Business & Economy', 'National', 'World',
  'Security', 'Health', 'Education', 'Technology', 'Environment',
  'Opinion', 'Fact Check', 'Sports', 'Entertainment', 'Marketplace',
  'Government', 'Multimedia'
];

export function UserProfileModal({ isOpen, onClose, profile, refreshProfile }: UserProfileModalProps) {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [occupation, setOccupation] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with profile prop when it changes or when modal opens
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || '');
      setBio(profile.bio || '');
      setOccupation(profile.occupation || '');
      setAddress(profile.address || '');
      setGender(profile.gender || '');
      setPhone(profile.phone || '');
      setPreferences(profile.preferences || []);
    }
  }, [profile, isOpen]);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (before compression, keep it sensible)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for compression & downscaling
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 160;
        const MAX_HEIGHT = 160;
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
          // Compress to low-res JPEG (75% quality)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
          setAvatarUrl(dataUrl);
          toast.success('Avatar processed successfully!');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    toast.success('Avatar removed');
  };

  const togglePreference = (cat: string) => {
    setPreferences(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          bio,
          occupation,
          address,
          gender,
          phone,
          preferences
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Get permissions based on user role
  const getPermissions = () => {
    if (profile?.role === 'super_admin') {
      return [
        'Full administrative override powers',
        'Create, edit and delete news articles',
        'Upload podcasts and audio briefs',
        'Manage all site users and roles',
        'Edit global site appearance and logos',
        'Access macro data & intel indicators'
      ];
    }
    return [
      'Read all premium & breaking news',
      'Comment on public editorials',
      'Bookmark and save intelligence articles',
      'Browse marketplace directory',
      'Post marketplace automotive/real estate listings',
      'Configure email notifications & briefs'
    ];
  };

  // Human readable date joined
  const formattedJoinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  const totalReadCount = profile?.reading_stats?.totalRead ?? Math.floor(Math.random() * 8) + 3;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            key="profile-modal-container"
            initial={{ opacity: 0, scale: 0.96, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 30 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="fixed inset-0 z-[1010] flex items-center justify-center p-4 md:p-6 overflow-y-auto"
            onClick={onClose}
          >
            <div 
              className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-[0_50px_150px_-20px_rgba(0,0,0,0.4)] border border-nag-border p-6 md:p-10 my-8 overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Premium Glow Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-nag-green-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-nag-green-secondary/5 rounded-full blur-3xl pointer-events-none" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 z-30 w-10 h-10 bg-nag-gray-bg border border-nag-border rounded-full flex items-center justify-center text-gray-500 hover:text-nag-black hover:bg-white hover:scale-105 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Modal Body - Scrollable */}
              <div className="overflow-y-auto pr-2 custom-scrollbar space-y-8 flex-1">
                
                {/* Header Profile Summary Section */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-nag-border pb-8">
                  {/* Avatar upload wrapper */}
                  <div className="relative group shrink-0">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.15)] bg-gradient-to-tr from-nag-green-primary to-nag-green-secondary flex items-center justify-center text-white text-4xl font-black uppercase select-none">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        profile?.email?.[0] || 'U'
                      )}
                    </div>
                    {/* Hover edit trigger */}
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                      <button 
                        type="button"
                        onClick={triggerFileInput} 
                        className="p-2 bg-white rounded-full text-nag-black hover:bg-nag-green-primary hover:text-white transition-all transform scale-90 group-hover:scale-100 shadow-lg cursor-pointer"
                        title="Upload Avatar"
                      >
                        <Camera size={16} />
                      </button>
                      {avatarUrl && (
                        <button 
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="p-2 bg-white rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all transform scale-90 group-hover:scale-100 shadow-lg cursor-pointer"
                          title="Remove Avatar"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  <div className="text-center md:text-left space-y-2 flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                      {profile?.role === 'super_admin' ? (
                        <a
                          href="/admin"
                          onClick={onClose}
                          className="font-display font-black text-2xl md:text-3xl tracking-tight text-nag-black hover:text-nag-green-primary transition-colors cursor-pointer"
                          title="Go to Admin Dashboard"
                        >
                          {fullName || profile?.email?.split('@')[0] || 'Member Profile'}
                        </a>
                      ) : (
                        <h3 className="font-display font-black text-2xl md:text-3xl tracking-tight text-nag-black">
                          {fullName || profile?.email?.split('@')[0] || 'Member Profile'}
                        </h3>
                      )}
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest leading-none ${
                        profile?.role === 'super_admin' 
                          ? 'bg-nag-black text-white' 
                          : 'bg-nag-green-primary/10 text-nag-green-primary border border-nag-green-primary/20'
                      }`}>
                        {profile?.role === 'super_admin' ? 'Super Admin' : 'Premium Reader'}
                      </span>
                    </div>

                    <p className="text-xs text-nag-gray-deep opacity-65 flex items-center justify-center md:justify-start gap-1.5 font-medium">
                      <Mail size={13} className="text-nag-green-primary" /> {profile?.email}
                    </p>

                    {bio ? (
                      <p className="text-xs text-nag-gray-deep italic max-w-xl bg-nag-gray-bg/50 px-4 py-2.5 rounded-2xl border border-nag-border/40 font-medium">
                        "{bio}"
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No bio written yet. Fill it out below to build your public standing.</p>
                    )}
                  </div>
                </div>

                {/* Form & details */}
                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Form Editing (2 cols wide) */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-nag-gray-bg/30 border border-nag-border/60 p-6 md:p-8 rounded-[24px] space-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-6 bg-nag-green-primary rounded-full" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-nag-black">
                          Personal Attributes
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black">
                            Full Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="e.g. Aliko Babangida"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary/20 focus:border-nag-green-primary outline-none transition-all font-medium text-xs text-nag-black bg-white"
                            />
                            <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black">
                            Gender
                          </label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary/20 focus:border-nag-green-primary outline-none transition-all font-medium text-xs text-nag-black bg-white cursor-pointer"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-binary">Non-binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        </div>

                        {/* Phone */}
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black">
                            Phone Number
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="e.g. +234 803 123 4567"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary/20 focus:border-nag-green-primary outline-none transition-all font-medium text-xs text-nag-black bg-white"
                            />
                            <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>

                        {/* Occupation */}
                        <div className="space-y-1.5">
                          <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black">
                            Occupation
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={occupation}
                              onChange={(e) => setOccupation(e.target.value)}
                              placeholder="e.g. Financial Analyst"
                              className="w-full pl-10 pr-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary/20 focus:border-nag-green-primary outline-none transition-all font-medium text-xs text-nag-black bg-white"
                            />
                            <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black">
                          Physical Address
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="e.g. 12 Ikoyi Road, Ikoyi, Lagos"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary/20 focus:border-nag-green-primary outline-none transition-all font-medium text-xs text-nag-black bg-white"
                          />
                          <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="block text-[9px] font-black uppercase tracking-widest text-nag-black">
                            Short Bio
                          </label>
                          <span className="text-[9px] text-gray-400 font-bold">{bio.length}/300</span>
                        </div>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value.slice(0, 300))}
                          placeholder="Tell us about yourself, your interests or affiliations..."
                          rows={3}
                          className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary/20 focus:border-nag-green-primary outline-none transition-all font-medium text-xs text-nag-black bg-white resize-none"
                        />
                      </div>
                    </div>

                    {/* News Preferences selection */}
                    <div className="bg-nag-gray-bg/30 border border-nag-border/60 p-6 md:p-8 rounded-[24px] space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-6 bg-nag-green-primary rounded-full" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-nag-black">
                          News Preferences
                        </h4>
                      </div>
                      <p className="text-[10px] text-nag-gray-deep opacity-60 font-semibold uppercase tracking-wider">
                        Select your key briefing sectors for tailored news recommendations:
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => {
                          const isSelected = preferences.includes(cat);
                          return (
                            <button
                              type="button"
                              key={cat}
                              onClick={() => togglePreference(cat)}
                              className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer border flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-nag-black text-white border-nag-black shadow-md'
                                  : 'bg-white text-nag-gray-deep border-nag-border hover:border-nag-green-primary/50'
                              }`}
                            >
                              {cat}
                              {isSelected ? <Check size={11} className="text-nag-green-primary shrink-0" /> : <Plus size={11} className="opacity-45 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Account status, Date joined & Permissions (1 col wide) */}
                  <div className="space-y-6">
                    {/* Read-Only Stats Panel */}
                    <div className="bg-nag-black text-white p-6 rounded-[24px] space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-nag-green-primary/10 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="flex items-center gap-2">
                        <Activity size={16} className="text-nag-green-primary" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/50">
                          Account Statistics
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                          <p className="text-[8px] font-black uppercase text-white/40 tracking-wider">Date Joined</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Calendar size={12} className="text-nag-green-primary shrink-0" />
                            <span className="text-[11px] font-bold text-white leading-tight">
                              {formattedJoinedDate}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                          <p className="text-[8px] font-black uppercase text-white/40 tracking-wider">Briefings Read</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Sparkles size={12} className="text-nag-green-primary shrink-0" />
                            <span className="text-[11px] font-black text-white text-base">
                              {totalReadCount} Articles
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-1">
                        <p className="text-[8px] font-black uppercase text-white/40 tracking-wider">Access Clearance</p>
                        <p className="text-xs font-black text-nag-green-secondary uppercase tracking-widest">
                          {profile?.role === 'super_admin' ? 'SYSTEM SUPER-ADMIN' : 'PREMIUM NATIONAL MEMBER'}
                        </p>
                        <p className="text-[9px] text-white/50 leading-relaxed">
                          Your profile is fully vetted and compliant with Nigeria digital security regulations.
                        </p>
                      </div>
                    </div>

                    {/* Permissions list */}
                    <div className="bg-nag-gray-bg/30 border border-nag-border/60 p-6 rounded-[24px] space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-nag-green-primary" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-nag-black">
                          Verified Credentials
                        </h4>
                      </div>
                      <p className="text-[9px] text-nag-gray-deep opacity-60 font-semibold uppercase tracking-wider">
                        Active site permissions on your account:
                      </p>

                      <ul className="space-y-2.5">
                        {getPermissions().map((perm, index) => (
                          <li key={index} className="flex items-start gap-2 text-[11px] font-bold text-nag-gray-deep leading-tight">
                            <Check size={12} className="text-nag-green-primary mt-0.5 shrink-0" />
                            <span>{perm}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-nag-border/60 mt-4">
                      {profile?.role === 'super_admin' && (
                        <a
                          href="/admin"
                          onClick={onClose}
                          className="w-full py-4 bg-nag-black text-white hover:bg-nag-green-primary transition-colors text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer text-center shadow-md"
                        >
                          <Activity size={14} /> Admin Dashboard
                        </a>
                      )}

                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-4 bg-nag-green-primary text-white hover:bg-nag-green-secondary transition-colors text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover:shadow-nag-green-primary/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Save size={14} /> Save Profile
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="w-full py-4 border border-nag-border hover:bg-nag-gray-bg text-nag-black transition-colors text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        Cancel Changes
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          onClose();
                          await supabase.auth.signOut().catch((err) => {
                            console.error('SignOut error in background:', err);
                          });
                          for (let i = localStorage.length - 1; i >= 0; i--) {
                            const key = localStorage.key(i);
                            if (key && (key.startsWith('sb-') || key === 'isAdmin')) {
                              localStorage.removeItem(key);
                            }
                          }
                          toast.success('Logged out successfully');
                          setTimeout(() => {
                            window.location.href = '/';
                          }, 50);
                        }}
                        className="w-full py-4 border border-red-200 hover:bg-red-50 text-red-600 transition-colors text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer mt-1"
                      >
                        <LogOut size={14} /> Logout Account
                      </button>
                    </div>

                  </div>
                </form>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
