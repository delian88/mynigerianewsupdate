import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Loader2, ArrowLeft, Upload, Radio, Edit2 } from 'lucide-react';

export default function PodcastEditor() {
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPodcast, setEditingPodcast] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const { data, error } = await supabase.from('podcasts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPodcasts(data || []);
    } catch (error: any) {
      toast.error('Error fetching podcasts: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPodcast({ title: '', description: '', audio_url: '', thumbnail_url: '' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this podcast?')) return;
    try {
      const { error } = await supabaseAdmin.from('podcasts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Podcast deleted');
      fetchPodcasts();
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const handleSave = async () => {
    if (!editingPodcast.title || !editingPodcast.audio_url) {
      return toast.error('Title and Audio File are required');
    }
    try {
      setSaving(true);
      if (editingPodcast.id) {
        const { error } = await supabaseAdmin.from('podcasts').update(editingPodcast).eq('id', editingPodcast.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin.from('podcasts').insert([editingPodcast]);
        if (error) throw error;
      }
      toast.success('Podcast saved');
      setEditingPodcast(null);
      fetchPodcasts();
    } catch (error: any) {
      toast.error('Failed to save podcast: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'thumbnail') => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `podcast-${type}-${Math.random()}.${fileExt}`;
      const filePath = `podcasts/${fileName}`;

      toast.loading(`Uploading ${type}...`, { id: 'upload' });

      const { error: uploadError } = await supabaseAdmin.storage.from('media').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage.from('media').getPublicUrl(filePath);

      setEditingPodcast((prev: any) => ({
        ...prev,
        [type === 'audio' ? 'audio_url' : 'thumbnail_url']: publicUrl
      }));
      toast.success(`${type} uploaded successfully`, { id: 'upload' });
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message, { id: 'upload' });
    }
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-nag-green-primary" size={32} /></div>;

  if (editingPodcast) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-nag-border shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setEditingPodcast(null)} className="flex items-center gap-2 text-nag-gray-deep hover:text-nag-black transition-colors font-medium">
            <ArrowLeft size={20} /> Back to Podcasts
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-nag-green-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Publish Podcast'}
          </button>
        </div>

        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-nag-gray-deep mb-1">Episode Title</label>
            <input
              type="text"
              value={editingPodcast.title}
              onChange={e => setEditingPodcast({ ...editingPodcast, title: e.target.value })}
              className="w-full px-4 py-3 text-lg font-bold rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-nag-gray-deep mb-1">Description</label>
            <textarea
              value={editingPodcast.description || ''}
              onChange={e => setEditingPodcast({ ...editingPodcast, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-nag-gray-bg p-6 rounded-2xl border border-nag-border">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">Audio File (MP3)</h3>
              {editingPodcast.audio_url ? (
                <div className="mb-4">
                  <audio controls className="w-full" src={editingPodcast.audio_url} />
                </div>
              ) : null}
              <label className="cursor-pointer bg-white border border-nag-border px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-all text-sm w-full">
                <Upload size={16} />
                {editingPodcast.audio_url ? 'Replace Audio' : 'Upload Audio'}
                <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio')} />
              </label>
            </div>

            <div className="bg-nag-gray-bg p-6 rounded-2xl border border-nag-border">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">Thumbnail Cover</h3>
              {editingPodcast.thumbnail_url ? (
                <div className="mb-4 aspect-square bg-black rounded-xl overflow-hidden relative">
                  <img src={editingPodcast.thumbnail_url} className="w-full h-full object-cover" alt="Thumbnail" />
                </div>
              ) : null}
              <label className="cursor-pointer bg-white border border-nag-border px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition-all text-sm w-full">
                <Upload size={16} />
                {editingPodcast.thumbnail_url ? 'Replace Thumbnail' : 'Upload Thumbnail'}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail')} />
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-nag-border shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-nag-black tracking-tight mb-2">Podcasts</h1>
          <p className="text-nag-gray-deep">Upload and manage your daily briefings and episodes.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-nag-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-80 transition-all"
        >
          <Plus size={20} />
          New Episode
        </button>
      </div>

      {podcasts.length === 0 ? (
        <div className="text-center py-20 bg-nag-gray-bg rounded-2xl border border-dashed border-nag-border">
          <Radio size={48} className="mx-auto text-nag-gray-deep opacity-30 mb-4" />
          <h3 className="text-xl font-bold text-nag-black mb-2">No podcasts found</h3>
          <p className="text-nag-gray-deep mb-6">You haven't uploaded any episodes yet.</p>
          <button onClick={handleCreateNew} className="text-nag-green-primary font-bold hover:underline">
            Upload your first episode
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.map((podcast) => (
            <div key={podcast.id} className="border border-nag-border rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all">
              <div className="aspect-square bg-nag-gray-bg relative">
                {podcast.thumbnail_url ? (
                  <img src={podcast.thumbnail_url} className="w-full h-full object-cover" alt={podcast.title} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-nag-gray-deep">
                    <Radio size={48} className="opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button onClick={() => setEditingPodcast(podcast)} className="p-2 bg-white/90 backdrop-blur text-blue-600 rounded-lg shadow-sm hover:scale-105 transition-transform">
                    <Trash2 size={16} className="hidden" />
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(podcast.id)} className="p-2 bg-white/90 backdrop-blur text-red-600 rounded-lg shadow-sm hover:scale-105 transition-transform">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <h4 className="font-bold text-lg leading-tight mb-2 line-clamp-1">{podcast.title}</h4>
                <p className="text-sm text-nag-gray-deep line-clamp-2 mb-4">{podcast.description}</p>
                <audio controls className="w-full h-8" src={podcast.audio_url} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
