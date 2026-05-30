import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Settings, FileText, Radio, LogOut, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    toast.success('Logged out successfully');
    window.location.href = '/';
  };

  const navItems = [
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Articles', path: '/admin/articles', icon: FileText },
    { name: 'Podcasts', path: '/admin/podcasts', icon: Radio },
  ];

  return (
    <div className="flex min-h-screen bg-nag-gray-bg font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-nag-border flex flex-col fixed h-full">
        <div className="p-6 border-b border-nag-border flex items-center gap-3">
          <div className="w-8 h-8 bg-nag-black rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard size={18} />
          </div>
          <span className="font-black text-lg text-nag-black tracking-tight">CMS Admin</span>
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
