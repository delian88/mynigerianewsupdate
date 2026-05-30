import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Upload, Save, Loader2 } from 'lucide-react';

export default function SettingsEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: '',
    logo_url: '',
    about_us_text: '',
    contact_email: '',
    contact_phone: '',
    contact_address: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSettings(data);
    } catch (error: any) {
      toast.error('Error fetching settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Math.random()}.${fileExt}`;
      const filePath = `settings/${fileName}`;

      toast.loading('Uploading logo...', { id: 'upload' });

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);

      setSettings(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success('Logo uploaded', { id: 'upload' });
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message, { id: 'upload' });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (settings.id) {
        const { error } = await supabase.from('site_settings').update(settings).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_settings').insert([settings]);
        if (error) throw error;
      }
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error('Failed to save settings: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-nag-green-primary" size={32} /></div>;

  return (
    <div className="bg-white rounded-3xl p-8 border border-nag-border shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-nag-black tracking-tight mb-2">Site Settings</h1>
          <p className="text-nag-gray-deep">Manage your public website information and branding.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-nag-green-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-nag-gray-bg p-6 rounded-2xl border border-nag-border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">Logo</h3>
            <div className="flex items-center gap-6">
              {settings.logo_url ? (
                <div className="w-24 h-24 bg-white rounded-xl border border-nag-border flex items-center justify-center overflow-hidden">
                  <img src={settings.logo_url} alt="Logo" className="max-w-full max-h-full p-2" />
                </div>
              ) : (
                <div className="w-24 h-24 bg-white rounded-xl border border-nag-border flex items-center justify-center text-nag-gray-deep text-sm font-medium">
                  No Logo
                </div>
              )}
              <div>
                <label className="cursor-pointer bg-white border border-nag-border px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2 transition-all">
                  <Upload size={16} />
                  Upload New Logo
                  <input type="file" className="hidden" accept="image/*" onChange={handleUploadLogo} />
                </label>
                <p className="text-xs text-nag-gray-deep mt-2">Recommended: 400x100px transparent PNG</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Contact Information</h3>
            <div>
              <label className="block text-sm font-medium text-nag-gray-deep mb-1">Email Address</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={e => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nag-gray-deep mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={e => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-nag-gray-deep mb-1">Physical Address</label>
              <textarea
                value={settings.contact_address}
                onChange={e => setSettings(prev => ({ ...prev, contact_address: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none resize-none"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-bold mb-4">About Us Content</h3>
            <p className="text-sm text-nag-gray-deep mb-4">This text will appear in the About Us section on the homepage.</p>
            <textarea
              value={settings.about_us_text}
              onChange={e => setSettings(prev => ({ ...prev, about_us_text: e.target.value }))}
              className="flex-1 w-full px-4 py-4 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none resize-none min-h-[300px]"
              placeholder="Write the about us content here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
