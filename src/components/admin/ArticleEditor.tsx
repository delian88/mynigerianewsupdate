import { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Plus, Edit2, Trash2, Image as ImageIcon, Save, Loader2, ArrowLeft, RefreshCw, Eye, FileText } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export default function ArticleEditor() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);

  const handleFetchNews = async () => {
    if (!SERVICE_KEY) {
      toast.error('Service role key not configured in .env');
      return;
    }
    try {
      setFetching(true);
      toast.loading('Fetching latest news from RSS feeds…', { id: 'fetch-news' });
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/fetch-news`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SERVICE_KEY}`,
          },
          body: JSON.stringify({}),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      toast.success(
        `✅ Fetched ${data.fetched ?? 0} articles (${data.inserted ?? 0} new)`,
        { id: 'fetch-news', duration: 5000 }
      );
      fetchArticles();
    } catch (err: any) {
      toast.error('Fetch failed: ' + err.message, { id: 'fetch-news' });
    } finally {
      setFetching(false);
    }
  };

  // Editor setup
  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] border border-nag-border rounded-xl p-4',
      },
    },
  });

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleAddNewCategoryFromEditor = async (name: string) => {
    const cleaned = name.trim();
    if (!cleaned) return;

    if (categories.some(c => c.name.toLowerCase() === cleaned.toLowerCase())) {
      setEditingArticle((prev: any) => ({ ...prev, category: cleaned }));
      return;
    }

    try {
      const { error } = await supabase.from('categories').insert([{ name: cleaned }]);
      if (error) throw error;

      toast.success(`Category "${cleaned}" added!`);

      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (data) setCategories(data);
      setEditingArticle((prev: any) => ({ ...prev, category: cleaned }));

      // Trigger system notification
      try {
        await supabase.from('notifications').insert([{
          title: 'New category created',
          message: `Category "${cleaned}" has been added via the Article Editor`,
          type: 'success',
          read: false
        }]);
      } catch (err) {
        console.error('Notification insertion failed:', err);
      }

    } catch (err: any) {
      toast.error('Failed to add category: ' + err.message);
    }
  };

  useEffect(() => {
    if (editor && editingArticle) {
      editor.commands.setContent(editingArticle.content || '');
    }
  }, [editingArticle, editor]);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast.error('Error fetching articles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingArticle({ title: '', category: '', cover_image_url: '', content: '' });
    if (editor) editor.commands.setContent('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      const { error } = await supabaseAdmin.from('articles').delete().eq('id', id);
      if (error) throw error;
      toast.success('Article deleted');
      fetchArticles();
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const handleSave = async () => {
    if (!editingArticle.title) return toast.error('Title is required');
    try {
      setSaving(true);
      const content = editor?.getHTML();
      const payload = { ...editingArticle, content };

      if (editingArticle.id) {
        const { error } = await supabaseAdmin.from('articles').update(payload).eq('id', editingArticle.id);
        if (error) throw error;
        
        // Dynamic Notification: Article Updated
        await supabaseAdmin.from('notifications').insert([{
          title: 'Article updated',
          message: `"${payload.title}" has been modified.`,
          type: 'info',
          read: false
        }]);
      } else {
        const { error } = await supabaseAdmin.from('articles').insert([payload]);
        if (error) throw error;
        
        // Dynamic Notification: New Article Published
        await supabaseAdmin.from('notifications').insert([{
          title: 'New article published',
          message: payload.title,
          type: 'article',
          read: false
        }]);
      }
      toast.success('Article saved');
      setEditingArticle(null);
      fetchArticles();
    } catch (error: any) {
      toast.error('Failed to save article: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addImage = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        toast.loading('Uploading image...', { id: 'img-upload' });
        const fileExt = file.name.split('.').pop();
        const fileName = `article-${Math.random()}.${fileExt}`;
        const filePath = `articles/${fileName}`;

        const { error } = await supabaseAdmin.storage.from('media').upload(filePath, file);
        if (error) throw error;

        const { data: { publicUrl } } = supabaseAdmin.storage.from('media').getPublicUrl(filePath);
        
        editor?.chain().focus().setImage({ src: publicUrl }).run();
        toast.success('Image added', { id: 'img-upload' });
      } catch (error: any) {
        toast.error('Upload failed: ' + error.message, { id: 'img-upload' });
      }
    };
    fileInput.click();
  };

  if (loading) return <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-nag-green-primary" size={32} /></div>;

  if (editingArticle) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-nag-border shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setEditingArticle(null)} className="flex items-center gap-2 text-nag-gray-deep hover:text-nag-black transition-colors font-medium">
            <ArrowLeft size={20} /> Back to Articles
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-nag-green-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Publish Article'}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-nag-gray-deep mb-1">Article Title</label>
            <input
              type="text"
              value={editingArticle.title}
              onChange={e => setEditingArticle({ ...editingArticle, title: e.target.value })}
              className="w-full px-4 py-4 text-2xl font-black rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none"
              placeholder="Enter a compelling title..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-nag-gray-deep mb-1">Category</label>
              <select
                value={editingArticle.category || ''}
                onChange={e => {
                  if (e.target.value === '__new__') {
                    const name = prompt('Enter the new category name:');
                    if (name) {
                      handleAddNewCategoryFromEditor(name);
                    }
                  } else {
                    setEditingArticle({ ...editingArticle, category: e.target.value });
                  }
                }}
                className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none bg-white font-semibold text-sm cursor-pointer"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                <option value="__new__" className="text-nag-green-primary font-black">+ Add New Category...</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-nag-gray-deep mb-1">Cover Image URL (Optional)</label>
              <input
                type="text"
                value={editingArticle.cover_image_url || ''}
                onChange={e => setEditingArticle({ ...editingArticle, cover_image_url: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-nag-gray-deep mb-2 flex justify-between items-end">
              <span>Article Content</span>
              <button 
                onClick={addImage}
                className="flex items-center gap-2 text-xs bg-nag-gray-bg hover:bg-gray-200 text-nag-black px-3 py-1.5 rounded-lg transition-colors font-bold"
              >
                <ImageIcon size={14} /> Insert Image
              </button>
            </label>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-nag-border shadow-sm">
      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-nag-black tracking-tight mb-2">News Articles</h1>
          <p className="text-nag-gray-deep">Manage, publish, and edit your editorial content.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleFetchNews}
            disabled={fetching}
            className="bg-nag-green-primary text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {fetching ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            {fetching ? 'Fetching…' : 'Fetch Latest News'}
          </button>
          <button
            onClick={handleCreateNew}
            className="bg-nag-black text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-opacity-80 transition-all"
          >
            <Plus size={20} />
            New Article
          </button>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 bg-nag-gray-bg rounded-2xl border border-dashed border-nag-border">
          <FileText size={48} className="mx-auto text-nag-gray-deep opacity-30 mb-4" />
          <h3 className="text-xl font-bold text-nag-black mb-2">No articles found</h3>
          <p className="text-nag-gray-deep mb-6">You haven't published any articles yet.</p>
          <button onClick={handleCreateNew} className="text-nag-green-primary font-bold hover:underline">
            Write your first article
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-nag-border">
          <table className="w-full text-left">
            <thead className="bg-nag-gray-bg border-b border-nag-border">
              <tr>
                <th className="p-4 font-bold text-sm text-nag-gray-deep">Title</th>
                <th className="p-4 font-bold text-sm text-nag-gray-deep">Category</th>
                <th className="p-4 font-bold text-sm text-nag-gray-deep">Published</th>
                <th className="p-4 font-bold text-sm text-nag-gray-deep">
                  <span className="flex items-center gap-1"><Eye size={14} /> Views</span>
                </th>
                <th className="p-4 font-bold text-sm text-nag-gray-deep text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nag-border">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-nag-black max-w-xs">
                    <p className="line-clamp-2 text-sm">{article.title}</p>
                  </td>
                  <td className="p-4 text-sm text-nag-gray-deep">
                    <span className="bg-white border border-nag-border px-2 py-1 rounded-md text-xs font-bold uppercase">{article.category || 'Uncategorized'}</span>
                  </td>
                  <td className="p-4 text-sm text-nag-gray-deep whitespace-nowrap">
                    {new Date(article.published_at || article.created_at).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td className="p-4 text-sm text-nag-gray-deep">
                    <span className="flex items-center gap-1 font-bold">
                      <Eye size={13} className="text-nag-green-primary" />
                      {(article.view_count || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => setEditingArticle(article)} className="p-2 text-nag-gray-deep hover:text-blue-600 bg-white rounded-lg border border-transparent hover:border-blue-200 transition-all">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(article.id)} className="p-2 text-nag-gray-deep hover:text-red-600 bg-white rounded-lg border border-transparent hover:border-red-200 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
