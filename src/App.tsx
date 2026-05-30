import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicSite from './pages/PublicSite';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';

// Lazy load admin pages so they don't bloat the public bundle
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const SettingsEditor = lazy(() => import('./components/admin/SettingsEditor'));
const ArticleEditor = lazy(() => import('./components/admin/ArticleEditor'));
const PodcastEditor = lazy(() => import('./components/admin/PodcastEditor'));
const UserManagement = lazy(() => import('./components/admin/UserManagement'));
const CategoryManager = lazy(() => import('./components/admin/CategoryManager'));

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<PublicSite />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLogin />
          </Suspense>
        } />
        
        <Route path="/admin" element={
          <Suspense fallback={<div>Loading...</div>}>
            <AdminLayout />
          </Suspense>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="settings" element={<SettingsEditor />} />
          <Route path="articles" element={<ArticleEditor />} />
          <Route path="podcasts" element={<PodcastEditor />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="categories" element={<CategoryManager />} />
        </Route>
      </Routes>
    </Router>
  );
}
