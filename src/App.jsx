import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { homeFor } from '@/utils/homeFor';

import LandingPage        from '@/components/landing/LandingPage';
import LoginPage          from '@/components/auth/LoginPage';
import RegisterPage       from '@/components/auth/RegisterPage';
import ForgotPasswordPage from '@/components/auth/ForgotPasswordPage';
import MailSentPage       from '@/components/auth/MailSentPage';
import AccountCreatedPage from '@/components/auth/AccountCreatedPage';

const ResetPasswordPage    = lazy(() => import('@/components/auth/ResetPasswordPage'));
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
const OrgProfilePage              = lazy(() => import('@/pages/OrgProfilePage'));
const OrgFormsPage                = lazy(() => import('@/pages/OrgFormsPage'));
const OrgEventsPage               = lazy(() => import('@/pages/OrgEventsPage'));
const OrgEventDetailPage          = lazy(() => import('@/pages/OrgEventDetailPage'));
const CheckInPage                 = lazy(() => import('@/pages/CheckInPage'));
const ViewApplicationInfoPage     = lazy(() => import('@/pages/ViewApplicationInfoPage'));
const CallForArtistsPage          = lazy(() => import('@/pages/CallForArtistsPage'));
const ActivateAccountPage         = lazy(() => import('@/pages/ActivateAccountPage'));
const AdminOverviewPage           = lazy(() => import('@/pages/admin/AdminOverviewPage'));
const EventPage                   = lazy(() => import('@/pages/EventPage'));
const OrderConfirmationPage       = lazy(() => import('@/pages/OrderConfirmationPage'));

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return children;
  return <Navigate to={homeFor(user)} replace />;
};

/* is_staff is the ONLY signal that an account may see /admin. Admin
   accounts carry an ordinary role (often organization, sometimes blank),
   so a role check would both admit and reject the wrong people.

   A 403 from any admin endpoint means "not an admin" — including the
   case where someone's staff flag is revoked mid-session — and the
   screens surface that themselves; this guard only covers the
   first paint. */
const StaffRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return null;                      // /me still in flight
  if (!user.is_staff) return <Navigate to={homeFor(user)} replace />;
  return children;
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
          <Route path="/apply/:slug" element={<CallForArtistsPage />} />
          <Route path="/activate/:token" element={<ActivateAccountPage />} />
          {/* Events & Ticketing — public, no auth (attendees are not users) */}
          <Route path="/events/:slug" element={<EventPage />} />
          <Route path="/events/order/:reference" element={<OrderConfirmationPage />} />
          {/* Paystack can also return to a bare callback with ?reference= */}
          <Route path="/events/order" element={<OrderConfirmationPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/forgot-password/sent" element={<MailSentPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register/success" element={<PrivateRoute><AccountCreatedPage /></PrivateRoute>} />
          <Route path="/onboarding/artist" element={<PrivateRoute><ArtistOnboarding /></PrivateRoute>} />
          <Route path="/onboarding/organization" element={<PrivateRoute><OrgOnboarding /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><ArtistDashboard /></PrivateRoute>} />
          <Route path="/portfolio" element={<PrivateRoute><PortfolioPage /></PrivateRoute>} />
          <Route path="/portfolio/share" element={<PrivateRoute><SharePortfolioPage /></PrivateRoute>} />
          <Route path="/network" element={<PrivateRoute><NetworkPage /></PrivateRoute>} />
          <Route path="/opportunities" element={<PrivateRoute><OpportunitiesPage /></PrivateRoute>} />
          <Route path="/applications" element={<PrivateRoute><ApplicationsPage /></PrivateRoute>} />
          <Route path="/applications/:id" element={<PrivateRoute><ViewApplicationInfoPage /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
          <Route path="/org/dashboard" element={<PrivateRoute><OrgDashboard /></PrivateRoute>} />
          <Route path="/org/profile" element={<PrivateRoute><OrgProfilePage /></PrivateRoute>} />
          <Route path="/org/opportunities" element={<PrivateRoute><OrgOpportunitiesPage /></PrivateRoute>} />
          <Route path="/org/applications" element={<PrivateRoute><OrgApplicationsPage /></PrivateRoute>} />
          <Route path="/org/forms" element={<PrivateRoute><OrgFormsPage /></PrivateRoute>} />
          <Route path="/org/events" element={<PrivateRoute><OrgEventsPage /></PrivateRoute>} />
          <Route path="/org/events/:id" element={<PrivateRoute><OrgEventDetailPage /></PrivateRoute>} />
          {/* Door check-in. Gated on being signed in only — staff accounts
              carry a blank role, so this must never branch on role. */}
          <Route path="/check-in" element={<PrivateRoute><CheckInPage /></PrivateRoute>} />
          {/* Admin console — is_staff only */}
          <Route path="/admin" element={<StaffRoute><AdminOverviewPage /></StaffRoute>} />
          <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
          <Route path="/support" element={<PrivateRoute><SupportPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
