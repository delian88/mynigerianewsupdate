import { useState, useEffect, useRef } from 'react';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { 
  Play, Radio, Image as ImageIcon, FileImage, Plus, Edit2, Trash2, 
  Save, Loader2, ArrowLeft, Upload, Check, Video, Film, Eye, Sparkles
} from 'lucide-react';

const promiseWithTimeout = (promise: Promise<any>, timeoutMs: number = 15000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Database request timed out'));
    }, timeoutMs);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

const FALLBACK_VIDEOS = [
  {
    id: 'f-vid-1',
    title: 'Lagos Tech Boom: Africa\'s Silicon Valley',
    description: 'A deep dive into how Lagos has transformed into the leading technology startup ecosystem on the African continent, showcasing top founders, innovators, and modern digital workspaces.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-laptop-keyboard-close-up-42247-large.mp4',
    cover_image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=600&fit=crop',
    duration: '14:20',
    views: 1250,
  },
  {
    id: 'f-vid-2',
    title: 'The Future of Oil & Gas in Nigeria',
    description: 'An investigative documentary on the transition towards cleaner energy sources in West Africa\'s leading oil producing nation, exploring biofuels and solar micro-grids.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-refinery-at-night-with-bright-lights-41584-large.mp4',
    cover_image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&fit=crop',
    duration: '18:45',
    views: 850,
  },
  {
    id: 'f-vid-3',
    title: 'Escrow Trade & The Gig Economy',
    description: 'A visual guide explaining how vetted escrow transactions protect freelancers and buyers in the fast-growing Nigerian remote workspace.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-businessman-signing-a-contract-42243-large.mp4',
    cover_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&fit=crop',
    duration: '10:15',
    views: 2100,
  }
];

const FALLBACK_INFOGRAPHICS = [
  {
    id: 'f-info-1',
    title: 'Naira Exchange Rate Trend Analysis',
    description: 'An in-depth data visualization showing the performance and stabilization indices of the Nigerian Naira against major global currencies (USD, EUR, GBP) over the last 12 months.',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&fit=crop'
  },
  {
    id: 'f-info-2',
    title: 'Top Agricultural Exports of Nigeria',
    description: 'Rigorous data mapping showing major cash crop distributions, export volume indicators, and geographical target markets across Europe and Asia.',
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&fit=crop'
  },
  {
    id: 'f-info-3',
    title: 'Lagos Mass Transit Infrastructure Growth',
    description: 'Visual statistics showing passenger volume shifts and transit speed gains since the expansion of the Blue and Red rail lines in Lagos State.',
    image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&fit=crop'
  }
];

const FALLBACK_PHOTOS = [
  {
    id: 'f-photo-1',
    title: 'Portraits of the Niger Delta',
    description: 'A hauntingly beautiful visual documentary chronicling daily lives, cultural heritage, and ecological struggles of delta communities.',
    cover_image_url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=600&fit=crop',
    images: ["https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=600&fit=crop", "https://images.unsplash.com/photo-1542362567-b07eac79094d?q=80&w=600&fit=crop", "https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?q=80&w=600&fit=crop"]
  },
  {
    id: 'f-photo-2',
    title: 'Durbar Festival: Culture in Motion',
    description: 'Stunning action photography capturing the equestrian pageantry, colorful royal regalia, and centuries-old traditions of northern Nigeria.',
    cover_image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600&fit=crop',
    images: ["https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600&fit=crop", "https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=600&fit=crop", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&fit=crop"]
  }
];

const FALLBACK_PODCASTS = [
  {
    id: 'f-pod-1',
    title: 'MyNigeria Daily Briefing: News Flash',
    description: 'Today\'s top headlines: Naira stabilization indicators, Lagos tech infrastructure investments, and international export policy updates.',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    thumbnail_url: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=600&fit=crop'
  }
];

export default function MediaManager() {
  const [activeTab, setActiveTab] = useState<'videos' | 'podcasts' | 'infographics' | 'photos'>('videos');
  const [videos, setVideos] = useState<any[]>([]);
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [infographics, setInfographics] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Edit records state
  const [editingItem, setEditingItem] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setEditingItem(null);
    try {
      if (activeTab === 'videos') {
        const { data, error } = await promiseWithTimeout(
          Promise.resolve(
            supabase.from('videos').select('*').order('created_at', { ascending: false })
          ),
          10000
        ) as any;
        if (error) throw error;
        setVideos(data || []);
      } else if (activeTab === 'podcasts') {
        const { data, error } = await promiseWithTimeout(
          Promise.resolve(
            supabase.from('podcasts').select('*').order('created_at', { ascending: false })
          ),
          10000
        ) as any;
        if (error) throw error;
        setPodcasts(data || []);
      } else if (activeTab === 'infographics') {
        const { data, error } = await promiseWithTimeout(
          Promise.resolve(
            supabase.from('infographics').select('*').order('created_at', { ascending: false })
          ),
          10000
        ) as any;
        if (error) throw error;
        setInfographics(data || []);
      } else if (activeTab === 'photos') {
        const { data, error } = await promiseWithTimeout(
          Promise.resolve(
            supabase.from('photo_stories').select('*').order('created_at', { ascending: false })
          ),
          10000
        ) as any;
        if (error) throw error;
        setPhotos(data || []);
      }
    } catch (err: any) {
      console.warn('[MediaManager] Failed to fetch data from Supabase, loading offline catalog:', err);
      toast.error('Offline Mode: Loaded local offline library catalog. (Supabase connection timed out due to your browser privacy/adblocker shields).', { id: 'media-timeout', duration: 6000 });
      
      // Load offline fallbacks
      if (activeTab === 'videos') {
        setVideos(FALLBACK_VIDEOS);
      } else if (activeTab === 'podcasts') {
        setPodcasts(FALLBACK_PODCASTS);
      } else if (activeTab === 'infographics') {
        setInfographics(FALLBACK_INFOGRAPHICS);
      } else if (activeTab === 'photos') {
        setPhotos(FALLBACK_PHOTOS);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    if (activeTab === 'videos') {
      setEditingItem({ title: '', description: '', video_url: '', cover_image_url: '', duration: '0:00' });
    } else if (activeTab === 'podcasts') {
      setEditingItem({ title: '', description: '', audio_url: '', thumbnail_url: '' });
    } else if (activeTab === 'infographics') {
      setEditingItem({ title: '', description: '', image_url: '' });
    } else if (activeTab === 'photos') {
      setEditingItem({ title: '', description: '', cover_image_url: '', images: [] });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${activeTab.slice(0, -1)}?`)) return;
    try {
      const table = activeTab === 'photos' ? 'photo_stories' : activeTab;
      const { error } = await supabaseAdmin.from(table).delete().eq('id', id);
      if (error) throw error;
      toast.success(`${activeTab.slice(0, -1).toUpperCase()} deleted successfully`);
      fetchData();
    } catch (err: any) {
      console.error('[MediaManager] Delete failed:', err);
      toast.error('Failed to delete: ' + err.message);
    }
  };

  const handleSave = async () => {
    if (!editingItem.title) return toast.error('Title is required');
    
    // Validations based on active tab
    if (activeTab === 'videos') {
      if (!editingItem.video_url || !editingItem.cover_image_url) {
        return toast.error('Both Video and Cover Image are required');
      }
    } else if (activeTab === 'podcasts') {
      if (!editingItem.audio_url || !editingItem.thumbnail_url) {
        return toast.error('Both Audio File and Thumbnail are required');
      }
    } else if (activeTab === 'infographics') {
      if (!editingItem.image_url) {
        return toast.error('Infographic image is required');
      }
    } else if (activeTab === 'photos') {
      if (!editingItem.cover_image_url) {
        return toast.error('Cover image is required');
      }
    }

    try {
      setSaving(true);
      const table = activeTab === 'photos' ? 'photo_stories' : activeTab;
      
      const payload = { ...editingItem };
      if (activeTab === 'photos' && !payload.images) {
        payload.images = [];
      }

      if (editingItem.id) {
        const { error } = await supabaseAdmin.from(table).update(payload).eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Media entry updated successfully');
      } else {
        const { error } = await supabaseAdmin.from(table).insert([payload]);
        if (error) throw error;
        toast.success('Media entry published successfully');
      }
      setEditingItem(null);
      fetchData();
    } catch (err: any) {
      console.error('[MediaManager] Save failed:', err);
      toast.error('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSingleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'cover' | 'audio' | 'infographic') => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      // Enforce file size locks (8MB for images, 100MB for video assets)
      const maxSize = type === 'video' ? 100 * 1024 * 1024 : 8 * 1024 * 1024;
      if (file.size > maxSize) {
        return toast.error(`File is too large. Max size allowed: ${type === 'video' ? '100MB' : '8MB'}`);
      }

      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `media-${type}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `media_hub/${activeTab}/${fileName}`;

      toast.loading(`Uploading ${type} asset...`, { id: 'media-upload' });

      const { error: uploadError } = await supabaseAdmin.storage.from('media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage.from('media').getPublicUrl(filePath);

      setEditingItem((prev: any) => {
        if (activeTab === 'videos') {
          return {
            ...prev,
            [type === 'video' ? 'video_url' : 'cover_image_url']: publicUrl
          };
        } else if (activeTab === 'podcasts') {
          return {
            ...prev,
            [type === 'audio' ? 'audio_url' : 'thumbnail_url']: publicUrl
          };
        } else if (activeTab === 'infographics') {
          return {
            ...prev,
            image_url: publicUrl
          };
        } else if (activeTab === 'photos') {
          return {
            ...prev,
            cover_image_url: publicUrl
          };
        }
        return prev;
      });

      toast.success(`${type.toUpperCase()} uploaded and processed!`, { id: 'media-upload' });
    } catch (err: any) {
      console.error('[MediaManager] Upload error:', err);
      toast.error('Upload failed: ' + err.message, { id: 'media-upload' });
    } finally {
      setUploading(false);
    }
  };

  const handleMultiplePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const files = Array.from(e.target.files);
      
      setUploading(true);
      toast.loading(`Uploading ${files.length} photos...`, { id: 'media-multi-upload' });

      const uploadedUrls: string[] = [];

      for (const file of files) {
        if (file.size > 8 * 1024 * 1024) {
          toast.error(`File "${file.name}" exceeds 8MB. Skipped.`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `gallery-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `media_hub/photos/galleries/${fileName}`;

        const { error: uploadError } = await supabaseAdmin.storage.from('media').upload(filePath, file);
        if (uploadError) {
          console.error('Gallery file upload failed:', uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabaseAdmin.storage.from('media').getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
      }

      setEditingItem((prev: any) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls]
      }));

      toast.success(`🎉 ${uploadedUrls.length} gallery photos added successfully!`, { id: 'media-multi-upload' });
    } catch (err: any) {
      console.error('[MediaManager] Multi-upload error:', err);
      toast.error('Gallery uploads failed: ' + err.message, { id: 'media-multi-upload' });
    } finally {
      setUploading(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    setEditingItem((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, idx: number) => idx !== index)
    }));
    toast.success('Gallery photo removed');
  };

  const tabs = [
    { id: 'videos', label: 'Original Videos', icon: Film },
    { id: 'podcasts', label: 'Podcasts', icon: Radio },
    { id: 'infographics', label: 'Infographics', icon: FileImage },
    { id: 'photos', label: 'Photo Stories', icon: ImageIcon },
  ];

  return (
    <div className="space-y-8 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-nag-border p-6 md:p-8 rounded-[32px] shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-nag-green-primary mb-1">
            <Sparkles size={14} /> Publishing Suite
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-nag-black tracking-tight uppercase flex items-center gap-2">
            Media Hub Manager
          </h1>
          <p className="text-nag-gray-deep font-semibold text-xs mt-1">
            Host documentaries, play briefings, view graphics, and write stories in Nigeria's leading digital workspace.
          </p>
        </div>
        {!editingItem && (
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3.5 bg-nag-black hover:bg-opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
          >
            <Plus size={16} /> New {activeTab.slice(0, -1).toUpperCase()}
          </button>
        )}
      </div>

      {/* Tabs Menu Section */}
      {!editingItem && (
        <div className="flex border border-nag-border bg-white p-2 rounded-2xl gap-2 overflow-x-auto no-scrollbar shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-nag-black text-white shadow-md'
                  : 'text-nag-gray-deep hover:bg-nag-gray-bg/50 hover:text-nag-black'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Primary Workspace */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-nag-green-primary" size={40} />
          <p className="text-nag-gray-deep text-xs font-bold uppercase tracking-wider animate-pulse">
            Consulting media library...
          </p>
        </div>
      ) : editingItem ? (
        
        // ─── EDITOR PANEL ───
        <div className="bg-white border border-nag-border p-6 md:p-8 rounded-[32px] shadow-sm space-y-8">
          <div className="flex justify-between items-center border-b border-nag-border pb-6">
            <button
              onClick={() => setEditingItem(null)}
              className="flex items-center gap-1.5 text-nag-gray-deep hover:text-nag-black transition-colors font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              <ArrowLeft size={16} /> Back to Library
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="flex items-center gap-2 px-6 py-3 bg-nag-green-primary hover:bg-nag-green-secondary text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Publishing...' : 'Publish Media'}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Form Inputs (Left) */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-nag-black mb-2">Media Title</label>
                <input
                  type="text"
                  required
                  placeholder={`e.g. Daily Nigeria Highlights`}
                  value={editingItem.title}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full px-4 py-3 border border-nag-border focus:ring-2 focus:ring-nag-green-primary focus:border-transparent outline-none rounded-xl font-bold text-sm bg-nag-gray-bg/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-nag-black mb-2">Description / Excerpt</label>
                <textarea
                  placeholder="Provide a detailed editorial summary about this media content..."
                  value={editingItem.description || ''}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-nag-border focus:ring-2 focus:ring-nag-green-primary focus:border-transparent outline-none rounded-xl font-semibold text-sm bg-nag-gray-bg/20 resize-none leading-relaxed"
                />
              </div>

              {activeTab === 'videos' && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-nag-black mb-2">Video Duration (e.g. 14:20)</label>
                  <input
                    type="text"
                    placeholder="Duration"
                    value={editingItem.duration || ''}
                    onChange={e => setEditingItem({ ...editingItem, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-nag-border focus:ring-2 focus:ring-nag-green-primary focus:border-transparent outline-none rounded-xl font-bold text-sm bg-nag-gray-bg/20"
                  />
                </div>
              )}
            </div>

            {/* Asset Upload Forms (Right) */}
            <div className="space-y-6">
              
              {/* VIDEO TAB ASSETS */}
              {activeTab === 'videos' && (
                <>
                  {/* Video File Upload */}
                  <div className="bg-nag-gray-bg/40 border border-nag-border p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-nag-black flex items-center gap-1.5">
                      <Film size={15} /> Video Clip (MP4)
                    </h4>
                    {editingItem.video_url ? (
                      <div className="aspect-video rounded-xl bg-black overflow-hidden relative border border-nag-border">
                        <video controls className="w-full h-full object-cover" src={editingItem.video_url} />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => videoInputRef.current?.click()}
                      className="w-full py-3 bg-white hover:bg-nag-gray-bg/60 border border-nag-border hover:border-nag-green-primary/40 text-nag-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Upload size={14} /> {editingItem.video_url ? 'Replace Video' : 'Upload Video File'}
                    </button>
                    <input
                      type="file"
                      ref={videoInputRef}
                      accept="video/mp4"
                      className="hidden"
                      onChange={e => handleSingleFileUpload(e, 'video')}
                    />
                  </div>

                  {/* Video Thumbnail Upload */}
                  <div className="bg-nag-gray-bg/40 border border-nag-border p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-nag-black flex items-center gap-1.5">
                      <ImageIcon size={15} /> Video Cover Image
                    </h4>
                    {editingItem.cover_image_url ? (
                      <div className="aspect-video rounded-xl overflow-hidden relative border border-nag-border shadow-sm">
                        <img className="w-full h-full object-cover" src={editingItem.cover_image_url} alt="Cover Preview" />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 bg-white hover:bg-nag-gray-bg/60 border border-nag-border hover:border-nag-green-primary/40 text-nag-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Upload size={14} /> {editingItem.cover_image_url ? 'Replace Cover' : 'Upload Cover Image'}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleSingleFileUpload(e, 'cover')}
                    />
                  </div>
                </>
              )}

              {/* PODCAST TAB ASSETS */}
              {activeTab === 'podcasts' && (
                <>
                  {/* Audio Upload */}
                  <div className="bg-nag-gray-bg/40 border border-nag-border p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-nag-black flex items-center gap-1.5">
                      <Radio size={15} /> Episode Audio File
                    </h4>
                    {editingItem.audio_url ? (
                      <div className="pt-2">
                        <audio controls className="w-full" src={editingItem.audio_url} />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => audioInputRef.current?.click()}
                      className="w-full py-3 bg-white hover:bg-nag-gray-bg/60 border border-nag-border hover:border-nag-green-primary/40 text-nag-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Upload size={14} /> {editingItem.audio_url ? 'Replace Audio' : 'Upload Audio MP3'}
                    </button>
                    <input
                      type="file"
                      ref={audioInputRef}
                      accept="audio/*"
                      className="hidden"
                      onChange={e => handleSingleFileUpload(e, 'audio')}
                    />
                  </div>

                  {/* Thumbnail Cover */}
                  <div className="bg-nag-gray-bg/40 border border-nag-border p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-nag-black flex items-center gap-1.5">
                      <ImageIcon size={15} /> Thumbnail Cover
                    </h4>
                    {editingItem.thumbnail_url ? (
                      <div className="aspect-square bg-black rounded-xl overflow-hidden relative border border-nag-border">
                        <img className="w-full h-full object-cover" src={editingItem.thumbnail_url} alt="Cover Preview" />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 bg-white hover:bg-nag-gray-bg/60 border border-nag-border hover:border-nag-green-primary/40 text-nag-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Upload size={14} /> {editingItem.thumbnail_url ? 'Replace Thumbnail' : 'Upload Thumbnail Cover'}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleSingleFileUpload(e, 'cover')}
                    />
                  </div>
                </>
              )}

              {/* INFOGRAPHIC TAB ASSET */}
              {activeTab === 'infographics' && (
                <div className="bg-nag-gray-bg/40 border border-nag-border p-5 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black uppercase text-nag-black flex items-center gap-1.5">
                    <FileImage size={15} /> Infographic Image Asset
                  </h4>
                  {editingItem.image_url ? (
                    <div className="aspect-[4/3] rounded-xl overflow-hidden relative border border-nag-border">
                      <img className="w-full h-full object-cover" src={editingItem.image_url} alt="Infographic Preview" />
                    </div>
                  ) : null}
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 bg-white hover:bg-nag-gray-bg/60 border border-nag-border hover:border-nag-green-primary/40 text-nag-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Upload size={14} /> {editingItem.image_url ? 'Replace Image' : 'Upload Chart Image'}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={e => handleSingleFileUpload(e, 'infographic')}
                  />
                </div>
              )}

              {/* PHOTO STORIES TAB ASSETS */}
              {activeTab === 'photos' && (
                <>
                  {/* Photo Story Cover Image */}
                  <div className="bg-nag-gray-bg/40 border border-nag-border p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-nag-black flex items-center gap-1.5">
                      <ImageIcon size={15} /> Primary Cover Photo
                    </h4>
                    {editingItem.cover_image_url ? (
                      <div className="aspect-video rounded-xl overflow-hidden relative border border-nag-border shadow-sm">
                        <img className="w-full h-full object-cover" src={editingItem.cover_image_url} alt="Cover Preview" />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 bg-white hover:bg-nag-gray-bg/60 border border-nag-border hover:border-nag-green-primary/40 text-nag-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Upload size={14} /> {editingItem.cover_image_url ? 'Replace Cover' : 'Upload Cover Image'}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleSingleFileUpload(e, 'cover')}
                    />
                  </div>

                  {/* Multi-photo Gallery Upload */}
                  <div className="bg-nag-gray-bg/40 border border-nag-border p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-nag-black flex items-center gap-1.5">
                      <ImageIcon size={15} /> Story Photo Gallery ({editingItem.images?.length || 0} Images)
                    </h4>
                    {editingItem.images && editingItem.images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 border border-nag-border/60 bg-white p-2.5 rounded-xl max-h-48 overflow-y-auto no-scrollbar">
                        {editingItem.images.map((img: string, idx: number) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-nag-border">
                            <img className="w-full h-full object-cover" src={img} alt="Gallery Thumb" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer text-[8px] font-bold"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => multiFileInputRef.current?.click()}
                      className="w-full py-3 bg-white hover:bg-nag-gray-bg/60 border border-nag-border hover:border-nag-green-primary/40 text-nag-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} /> Upload Story Photos
                    </button>
                    <input
                      type="file"
                      ref={multiFileInputRef}
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleMultiplePhotoUpload}
                    />
                  </div>
                </>
              )}

            </div>
          </div>
        </div>

      ) : (

        // ─── LIST VIEW PANEL ───
        <div className="bg-white border border-nag-border p-6 md:p-8 rounded-[32px] shadow-sm">
          
          {/* Main Inventory Displays */}
          {activeTab === 'videos' && (
            videos.length === 0 ? (
              <EmptyState icon={Film} title="No Videos found" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(item => (
                  <div key={item.id} className="border border-nag-border rounded-3xl overflow-hidden hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                    <div className="aspect-video bg-nag-gray-bg relative">
                      <img className="w-full h-full object-cover" src={item.cover_image_url} alt={item.title} />
                      <span className="absolute bottom-3 right-3 bg-black/70 px-2.5 py-1 text-white text-[9px] font-black rounded-lg">
                        {item.duration || '0:00'}
                      </span>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => setEditingItem(item)} className="p-2 bg-white/95 backdrop-blur text-blue-600 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/5">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/95 backdrop-blur text-red-600 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/5">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-bold text-sm leading-snug line-clamp-2 text-nag-black">{item.title}</h4>
                        <p className="text-xs text-nag-gray-deep opacity-80 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] text-nag-gray-deep font-black uppercase border-t border-nag-border pt-3">
                        <Eye size={12} className="text-nag-green-primary" /> {item.views || 0} Views
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'podcasts' && (
            podcasts.length === 0 ? (
              <EmptyState icon={Radio} title="No Podcasts found" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {podcasts.map(item => (
                  <div key={item.id} className="border border-nag-border rounded-3xl overflow-hidden hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                    <div className="aspect-square bg-nag-gray-bg relative">
                      {item.thumbnail_url ? (
                        <img className="w-full h-full object-cover" src={item.thumbnail_url} alt={item.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-nag-gray-deep">
                          <Radio size={48} className="opacity-15" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => setEditingItem(item)} className="p-2 bg-white/95 backdrop-blur text-blue-600 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/5">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/95 backdrop-blur text-red-600 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/5">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-bold text-sm leading-snug line-clamp-1 text-nag-black">{item.title}</h4>
                        <p className="text-xs text-nag-gray-deep opacity-80 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                      </div>
                      <audio controls className="w-full h-7 mt-2" src={item.audio_url} />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'infographics' && (
            infographics.length === 0 ? (
              <EmptyState icon={FileImage} title="No Infographics found" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {infographics.map(item => (
                  <div key={item.id} className="border border-nag-border rounded-3xl overflow-hidden hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                    <div className="aspect-[4/3] bg-nag-gray-bg relative border-b border-nag-border">
                      <img className="w-full h-full object-cover" src={item.image_url} alt={item.title} />
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => setEditingItem(item)} className="p-2 bg-white/95 backdrop-blur text-blue-600 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/5">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/95 backdrop-blur text-red-600 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/5">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-sm leading-snug line-clamp-2 text-nag-black">{item.title}</h4>
                      <p className="text-xs text-nag-gray-deep opacity-80 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'photos' && (
            photos.length === 0 ? (
              <EmptyState icon={ImageIcon} title="No Photo Stories found" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map(item => (
                  <div key={item.id} className="border border-nag-border rounded-3xl overflow-hidden hover:shadow-lg transition-all bg-white flex flex-col justify-between">
                    <div className="aspect-video bg-nag-gray-bg relative">
                      <img className="w-full h-full object-cover" src={item.cover_image_url} alt={item.title} />
                      <span className="absolute bottom-3 right-3 bg-black/70 px-2.5 py-1 text-white text-[9px] font-black rounded-lg">
                        {item.images?.length || 0} Gallery Photos
                      </span>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button onClick={() => setEditingItem(item)} className="p-2 bg-white/95 backdrop-blur text-blue-600 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/5">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/95 backdrop-blur text-red-600 rounded-lg shadow-sm hover:scale-105 transition-transform cursor-pointer border border-black/5">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-sm leading-snug line-clamp-2 text-nag-black">{item.title}</h4>
                      <p className="text-xs text-nag-gray-deep opacity-80 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

function EmptyState({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="text-center py-24 bg-nag-gray-bg/40 rounded-[28px] border border-dashed border-nag-border max-w-lg mx-auto px-6 space-y-3">
      <div className="w-16 h-16 rounded-full bg-nag-gray-bg flex items-center justify-center mx-auto text-nag-gray-deep opacity-20">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-black text-nag-black uppercase tracking-wider">{title}</h3>
      <p className="text-xs text-nag-gray-deep font-semibold">You haven't uploaded any media elements under this tab section yet. Click the publish button to publish your first content.</p>
    </div>
  );
}
