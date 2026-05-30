import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Settings, FileText, Radio, LogOut, LayoutDashboard, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-nag-gray-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-nag-green-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-nag-gray-deep uppercase tracking-widest animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'super_admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    // Background call to invalidate session on server
    supabase.auth.signOut().catch((err) => {
      console.error('Logout error in background:', err);
    });

    // Instantly clear all Supabase and admin related local storage items
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key === 'isAdmin')) {
        localStorage.removeItem(key);
      }
    }

    toast.success('Logged out successfully');
    
    // Micro-delay to let the clean state write, then force reload
    setTimeout(() => {
      window.location.href = '/';
    }, 50);
  };

  const navItems = [
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Articles', path: '/admin/articles', icon: FileText },
    { name: 'Podcasts', path: '/admin/podcasts', icon: Radio },
    { name: 'Users', path: '/admin/users', icon: UsersIcon },
  ];

  return (
    <div className="flex min-h-screen bg-nag-gray-bg font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-nag-border flex flex-col fixed h-full">
        <div className="p-6 border-b border-nag-border flex items-center gap-3">
          <div className="w-8 h-8 bg-nag-black rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm text-nag-black tracking-tight uppercase leading-none">Super Admin</span>
            <span className="text-[9px] font-semibold text-nag-green-primary tracking-widest uppercase mt-1 leading-none">CMS Panel</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-nag-green-primary text-white' 
                    : 'text-nag-gray-deep hover:bg-nag-gray-bg hover:text-nag-black'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-nag-border">
          <div className="px-4 py-3 mb-2 bg-nag-gray-bg rounded-xl truncate">
            <p className="text-[9px] font-black uppercase text-nag-gray-deep opacity-60">Signed In As</p>
            <p className="text-xs font-bold text-nag-black truncate mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
