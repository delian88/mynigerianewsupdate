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
const MediaManager = lazy(() => import('./components/admin/MediaManager'));
const UserManagement = lazy(() => import('./components/admin/UserManagement'));
const CategoryManager = lazy(() => import('./components/admin/CategoryManager'));
const CarMarketplaceEditor = lazy(() => import('./components/admin/CarMarketplaceEditor'));
const AutomotiveCatalog = lazy(() => import('./pages/AutomotiveCatalog'));

// Lazy load public media pages
const VideosPage = lazy(() => import('./pages/VideosPage'));
const PodcastsPage = lazy(() => import('./pages/PodcastsPage'));
const InfographicsPage = lazy(() => import('./pages/InfographicsPage'));
const PhotosPage = lazy(() => import('./pages/PhotosPage'));

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/automotive" element={
          <Suspense fallback={<div className="flex justify-center py-24"><div className="w-8 h-8 rounded-full border-4 border-nag-green-primary border-t-transparent animate-spin"></div></div>}>
            <AutomotiveCatalog />
          </Suspense>
        } />
        
        {/* Public Media Pages */}
        <Route path="/videos" element={
          <Suspense fallback={<div className="flex justify-center py-24"><div className="w-8 h-8 rounded-full border-4 border-nag-green-primary border-t-transparent animate-spin"></div></div>}>
            <VideosPage />
          </Suspense>
        } />
        <Route path="/podcasts" element={
          <Suspense fallback={<div className="flex justify-center py-24"><div className="w-8 h-8 rounded-full border-4 border-nag-green-primary border-t-transparent animate-spin"></div></div>}>
            <PodcastsPage />
          </Suspense>
        } />
        <Route path="/infographics" element={
          <Suspense fallback={<div className="flex justify-center py-24"><div className="w-8 h-8 rounded-full border-4 border-nag-green-primary border-t-transparent animate-spin"></div></div>}>
            <InfographicsPage />
          </Suspense>
        } />
        <Route path="/photos" element={
          <Suspense fallback={<div className="flex justify-center py-24"><div className="w-8 h-8 rounded-full border-4 border-nag-green-primary border-t-transparent animate-spin"></div></div>}>
            <PhotosPage />
          </Suspense>
        } />
        
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
          <Route path="media" element={<MediaManager />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="cars" element={<CarMarketplaceEditor />} />
        </Route>
      </Routes>
    </Router>
  );
}
