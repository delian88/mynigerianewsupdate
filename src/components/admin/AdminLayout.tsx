import { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Folder, 
  User, 
  Image, 
  Layers, 
  MessageSquare, 
  Users as UsersIcon, 
  Shield, 
  Menu as MenuIcon, 
  Tag, 
  Zap, 
  Mail, 
  Settings, 
  BarChart3, 
  ClipboardList, 
  Database,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Radio
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useNotifications } from '../../hooks/useNotifications';

export default function AdminLayout() {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

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
    supabase.auth.signOut().catch((err) => {
      console.error('Logout error in background:', err);
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
  };

  interface MenuItem {
    name: string;
    path: string;
    icon: any;
    badge?: string;
  }

  interface MenuSection {
    title: string;
    items: MenuItem[];
  }

  const menuSections: MenuSection[] = [
    {
      title: 'Navigation',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Content Management',
      items: [
        { name: 'Posts', path: '/admin/articles', icon: FileText },
        { name: 'Podcasts', path: '/admin/podcasts', icon: Radio },
        { name: 'Categories', path: '/admin/categories', icon: Folder },
        { name: 'Authors', path: '#authors', icon: User },
        { name: 'Media Library', path: '#media', icon: Image },
        { name: 'Pages', path: '#pages', icon: Layers },
        { name: 'Comments', path: '#comments', icon: MessageSquare },
      ]
    },
    {
      title: 'User Management',
      items: [
        { name: 'Users', path: '/admin/users', icon: UsersIcon },
        { name: 'Roles & Permissions', path: '#roles', icon: Shield },
      ]
    },
    {
      title: 'Publishing',
      items: [
        { name: 'Menus', path: '#menus', icon: MenuIcon },
        { name: 'Tags', path: '#tags', icon: Tag },
        { name: 'Breaking News', path: '#breaking', icon: Zap },
        { name: 'Newsletter', path: '#newsletter', icon: Mail },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Settings', path: '/admin/settings', icon: Settings },
        { name: 'Analytics', path: '#analytics', icon: BarChart3 },
        { name: 'Audit Logs', path: '#audit', icon: ClipboardList },
        { name: 'Backup & Tools', path: '#backup', icon: Database },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-nag-gray-bg font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside 
        className={`bg-white border-r border-nag-border flex flex-col fixed h-full z-[100] transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo Header */}
        <div className="p-5 border-b border-nag-border flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden select-none">
            <div className="w-9 h-9 bg-nag-green-primary rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm shadow-nag-green-primary/20">
              <span className="font-display text-lg">N</span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-none truncate">
                <span className="font-display font-black text-sm text-nag-black tracking-tighter uppercase">
                  MYNIGERIA<span className="text-nag-green-primary">.NEWS</span>
                </span>
                <span className="text-[9px] font-black text-nag-green-primary tracking-widest uppercase mt-0.5">
                  Super Admin
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              {!isCollapsed && (
                <h4 className="text-[8px] font-black uppercase tracking-[0.25em] text-nag-gray-deep opacity-45 px-3">
                  {section.title}
                </h4>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const isDummy = item.path.startsWith('#');
                  
                  const linkContent = (
                    <>
                      <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-nag-black transition-colors'} />
                      {!isCollapsed && (
                        <span className="flex-1 text-xs font-bold truncate">{item.name}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase bg-nag-gray-bg text-nag-gray-deep border border-nag-border/60">
                          {item.badge}
                        </span>
                      )}
                    </>
                  );

                  if (isDummy) {
                    return (
                      <button
                        key={item.name}
                        onClick={() => toast('Feature coming soon in full production CMS', { icon: '⚙️' })}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-500 hover:bg-nag-gray-bg hover:text-nag-black transition-colors group cursor-pointer ${
                          isCollapsed ? 'justify-center' : ''
                        }`}
                      >
                        {linkContent}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer ${
                        isActive 
                          ? 'bg-nag-green-primary text-white shadow-md shadow-nag-green-primary/10' 
                          : 'text-slate-600 hover:bg-nag-gray-bg hover:text-nag-black'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    >
                      {linkContent}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-nag-border space-y-2">
          {/* Collapse Trigger */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-slate-500 hover:bg-nag-gray-bg hover:text-nag-black transition-colors cursor-pointer text-xs font-bold"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!isCollapsed && <span>Collapse Menu</span>}
          </button>

          {/* Sidebar Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-xs font-bold"
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout Panel</span>}
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: isCollapsed ? '80px' : '256px' }}
      >
        {/* Sticky Top Header Bar */}
        <header className="h-[68px] bg-white border-b border-nag-border sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
          {/* Hamburger trigger */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-nag-black hover:bg-nag-gray-bg transition-colors cursor-pointer"
          >
            <MenuIcon size={20} />
          </button>

          {/* Center Search Input */}
          <div className="relative max-w-md w-full hidden md:block">
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full pl-10 pr-12 py-2 rounded-xl border border-nag-border bg-nag-gray-bg focus:bg-white focus:ring-2 focus:ring-nag-green-primary/10 focus:border-nag-green-primary outline-none transition-all text-xs font-bold text-nag-black"
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border bg-white border-nag-border text-[9px] font-black uppercase text-slate-400 select-none shadow-sm">
              Ctrl K
            </kbd>
          </div>

          {/* Right Action Icons & Profile Card */}
          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-nag-black hover:bg-nag-gray-bg transition-all cursor-pointer"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-nag-red text-[8px] font-black text-white flex items-center justify-center rounded-full ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Real-time Notifications List Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-nag-border p-4 z-[200] space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-nag-border">
                    <span className="text-[10px] font-black uppercase tracking-wider text-nag-black">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => markAllAsRead()}
                        className="text-[9px] font-black uppercase text-nag-green-primary hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto space-y-2.5 no-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            if (!notif.read) markAsRead(notif.id);
                          }}
                          className={`flex items-start gap-3 p-2 rounded-xl transition-all cursor-pointer ${
                            notif.read ? 'opacity-60 bg-transparent' : 'bg-nag-gray-bg border border-nag-border/40 hover:border-nag-green-primary/20'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.read ? 'bg-slate-300' : 'bg-nag-green-primary animate-pulse'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-nag-black uppercase tracking-wider leading-none">{notif.title}</p>
                            <p className="text-[10px] text-nag-gray-deep font-semibold mt-0.5 truncate leading-tight">{notif.message}</p>
                            <p className="text-[8px] text-slate-400 font-medium mt-1">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-6 text-center text-xs font-bold text-nag-gray-deep opacity-60 uppercase">No new alerts</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-3.5 pl-6 border-l border-nag-border relative group select-none">
              <div className="w-9 h-9 rounded-full bg-nag-green-primary/10 border border-nag-green-primary/30 flex items-center justify-center text-nag-green-primary font-black uppercase text-xs shadow-sm group-hover:scale-105 transition-transform">
                {(user?.email || 'S')[0]}
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-xs font-black text-nag-black leading-none uppercase">Super Admin</span>
                <span className="text-[9px] font-bold text-nag-gray-deep leading-none mt-1 opacity-70">
                  {user?.email || 'superadmin@mynigeria.news'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Render Container */}
        <main className="flex-1 p-8">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-nag-border py-4 px-8 bg-white flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold text-nag-gray-deep opacity-60">
          <span>&copy; {new Date().getFullYear()} MYNIGERIA.NEWS. All rights reserved.</span>
          <span className="mt-1 sm:mt-0">Version 2.1.0</span>
        </footer>
      </div>
    </div>
  );
}
