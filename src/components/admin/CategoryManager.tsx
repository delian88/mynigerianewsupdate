import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { Plus, Trash2, Folder, Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  created_at: string;
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      toast.error('Error fetching categories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return toast.error('Category name is required');
    
    // Check local duplicate
    if (categories.some(c => c.name.toLowerCase() === newName.trim().toLowerCase())) {
      return toast.error('Category already exists');
    }

    try {
      setAdding(true);
      const cleanedName = newName.trim();
      
      const { error } = await supabase
        .from('categories')
        .insert([{ name: cleanedName }]);

      if (error) throw error;
      
      toast.success('Category added successfully');
      setNewName('');
      fetchCategories();

      // Trigger system notification
      await supabase.from('notifications').insert([{
        title: 'New category created',
        message: `Category "${cleanedName}" has been added to the editorial catalog`,
        type: 'success',
        read: false
      }]).catch(err => console.error('Notification insertion failed:', err));

    } catch (err: any) {
      toast.error('Failed to add category: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Category deleted');
      fetchCategories();

      // Trigger system notification
      await supabase.from('notifications').insert([{
        title: 'Category deleted',
        message: `Category "${name}" was removed from the catalog`,
        type: 'warning',
        read: false
      }]).catch(err => console.error('Notification insertion failed:', err));

    } catch (err: any) {
      toast.error('Failed to delete category: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-nag-green-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-8 border border-nag-border shadow-sm animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-black text-nag-black tracking-tight uppercase">Categories</h1>
          <p className="text-xs text-nag-gray-deep font-medium mt-1">Manage editorial catalog classification categories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Add category form */}
        <div className="bg-nag-gray-bg p-6 rounded-2xl border border-nag-border/60 h-fit">
          <h3 className="text-sm font-black text-nag-black uppercase tracking-wider mb-4">Add Category</h3>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-widest text-nag-gray-deep">
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Tech, Health, Politics"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-nag-border focus:ring-2 focus:ring-nag-green-primary outline-none text-sm font-semibold bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full bg-nag-black text-white hover:bg-nag-green-primary py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {adding ? 'Adding...' : 'Add to Catalog'}
            </button>
          </form>
        </div>

        {/* Right column: Categories list */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-black text-nag-black uppercase tracking-wider">Active Categories ({categories.length})</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-nag-border hover:border-nag-green-primary/30 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-nag-gray-bg flex items-center justify-center text-slate-400 group-hover:text-nag-green-primary transition-colors border border-nag-border/40 shadow-sm">
                    <Folder size={16} />
                  </div>
                  <span className="text-sm font-bold text-nag-black">{cat.name}</span>
                </div>
                
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="p-2 text-nag-gray-deep hover:text-red-600 bg-white hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12 bg-nag-gray-bg rounded-xl border border-dashed border-nag-border">
              <Folder size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-nag-gray-deep uppercase">No categories configured</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
