import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

import LandingPage        from '@/components/landing/LandingPage';
import LoginPage          from '@/components/auth/LoginPage';
import RegisterPage       from '@/components/auth/RegisterPage';
import ForgotPasswordPage from '@/components/auth/ForgotPasswordPage';
import MailSentPage       from '@/components/auth/MailSentPage';
import AccountCreatedPage from '@/components/auth/AccountCreatedPage';

const ArtistOnboarding     = lazy(() => import('@/pages/ArtistOnboarding'));
const OrgOnboarding        = lazy(() => import('@/pages/OrgOnboarding'));
const ArtistDashboard      = lazy(() => import('@/pages/ArtistDashboard'));
const OrgDashboard         = lazy(() => import('@/pages/OrgDashboard'));
const PortfolioPage        = lazy(() => import('@/pages/PortfolioPage'));
const NetworkPage          = lazy(() => import('@/pages/NetworkPage'));
const OpportunitiesPage    = lazy(() => import('@/pages/OpportunitiesPage'));
const ApplicationsPage     = lazy(() => import('@/pages/ApplicationsPage'));
const NotificationsPage    = lazy(() => import('@/pages/NotificationsPage'));
const SettingsPage         = lazy(() => import('@/pages/SettingsPage'));
const SupportPage          = lazy(() => import('@/pages/SupportPage'));
const SharePortfolioPage   = lazy(() => import('@/pages/SharePortfolioPage'));
const OrgOpportunitiesPage = lazy(() => import('@/pages/OrgOpportunitiesPage'));
const OrgApplicationsPage  = lazy(() => import('@/pages/OrgApplicationsPage'));
const PublicPortfolioPage  = lazy(() => import('@/pages/PublicPortfolioPage'));
const OrgProfilePage       = lazy(() => import('@/pages/OrgProfilePage'));

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return children;
  if (!user?.is_onboarded) {
    return <Navigate to={user?.role === 'artist' ? '/onboarding/artist' : '/onboarding/organization'} replace />;
  }
  return <Navigate to={user?.role === 'artist' ? '/dashboard' : '/org/dashboard'} replace />;
};

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D0D0D] gap-4">
    <div style={{ width:44, height:44, border:'3px solid rgba(139,105,20,0.2)', borderTopColor:'#8B6914', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    <p style={{ fontFamily:'Cormorant Garamond, serif', fontSize:16, color:'rgba(255,255,255,0.3)' }}>Loading…</p>
  </div>
);

function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();
  useEffect(() => { if (isAuthenticated) fetchMe(); }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration:3500, style:{ fontFamily:'var(--font-body)', fontSize:'14px', borderRadius:'10px', boxShadow:'0 4px 20px rgba(0,0,0,0.12)' }, success:{ iconTheme:{ primary:'#8B6914', secondary:'#fff' } }, error:{ iconTheme:{ primary:'#EF4444', secondary:'#fff' } } }} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/portfolio/public/:token" element={<PublicPortfolioPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password/sent" element={<MailSentPage />} />
          <Route path="/register/success" element={<PrivateRoute><AccountCreatedPage /></PrivateRoute>} />
          <Route path="/onboarding/artist" element={<PrivateRoute><ArtistOnboarding /></PrivateRoute>} />
          <Route path="/onboarding/organization" element={<PrivateRoute><OrgOnboarding /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><ArtistDashboard /></PrivateRoute>} />
          <Route path="/portfolio" element={<PrivateRoute><PortfolioPage /></PrivateRoute>} />
          <Route path="/portfolio/share" element={<PrivateRoute><SharePortfolioPage /></PrivateRoute>} />
          <Route path="/network" element={<PrivateRoute><NetworkPage /></PrivateRoute>} />
          <Route path="/opportunities" element={<PrivateRoute><OpportunitiesPage /></PrivateRoute>} />
          <Route path="/applications" element={<PrivateRoute><ApplicationsPage /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
          <Route path="/org/dashboard" element={<PrivateRoute><OrgDashboard /></PrivateRoute>} />
          <Route path="/org/profile" element={<PrivateRoute><OrgProfilePage /></PrivateRoute>} />
          <Route path="/org/opportunities" element={<PrivateRoute><OrgOpportunitiesPage /></PrivateRoute>} />
          <Route path="/org/applications" element={<PrivateRoute><OrgApplicationsPage /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/support" element={<PrivateRoute><SupportPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
