import axios from 'axios';
import tokens from '@/utils/tokens';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach access token ────────────────────
api.interceptors.request.use((config) => {
  const token = tokens.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor — refresh token on 401 ─────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = tokens.getRefresh();
        if (!refresh) throw new Error('No refresh token');
        const res = await axios.post(`${BASE_URL}/account/token/refresh/`, { refresh });
        const newAccess = res.data.access;
        tokens.set(newAccess, null); // keep existing refresh, only update access
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch {
        tokens.clear();
        // Also wipe Zustand's persisted auth state so the reload at /login
        // does NOT rehydrate with isAuthenticated: true (which would cause
        // PublicRoute to immediately bounce back to /onboarding → infinite loop).
        try { localStorage.removeItem('interflow-auth'); } catch {}
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/account/register/', data),
  verifyOTP: (data) => api.post('/account/verify-otp/', data),
  resendOTP: (data) => api.post('/account/resend-otp/', data),
  login: (data) => api.post('/account/login/', data),
  logout: (data) => api.post('/account/logout/', data),
  refreshToken: (data) => api.post('/account/token/refresh/', data),
  requestPasswordReset: (data) => api.post('/account/password-reset/', data),
  confirmPasswordReset: (data) => api.post('/account/password-reset-confirm/', data),
  changePassword: (data) => api.post('/account/change-password/', data),
  getMe: () => api.get('/account/me/'),
  getDashboard: () => api.get('/account/dashboard/'),
};

// ─── Artist Relevant Works ─────────────────────────────────────
export const relevantWorksAPI = {
  list:   ()           => api.get('/artist/relevant-works/'),
  create: (data)       => api.post('/artist/relevant-works/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  detail: (pk)         => api.get(`/artist/relevant-works/${pk}/`),
  update: (pk, data)   => api.patch(`/artist/relevant-works/${pk}/`, data),
  delete: (pk)         => api.delete(`/artist/relevant-works/${pk}/`),
};

// ─── Artist Onboarding ────────────────────────────────────────────
export const artistAPI = {
  getProfile: () => api.get('/artist/profile/'),
  getPublicProfile: (userId) => api.get(`/artist/profile/${userId}/`),
  uploadAvatar: (data) => api.post('/artist/profile/avatar/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  step1: (data) => api.post('/artist/onboarding/step1/', data),
  step2: (data) => api.post('/artist/onboarding/step2/', data),
  step3: (data) => api.post('/artist/onboarding/step3/', data),
  getMedia: () => api.get('/artist/onboarding/step4/media/'),
  uploadMedia: (data) => api.post('/artist/onboarding/step4/media/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMedia: (pk) => api.delete(`/artist/onboarding/step4/media/${pk}/`),
  getExperiences: () => api.get('/artist/onboarding/step5/experience/'),
  addExperience: (data) => api.post('/artist/onboarding/step5/experience/', data),
  updateExperience: (pk, data) => api.patch(`/artist/onboarding/step5/experience/${pk}/`, data),
  deleteExperience: (pk) => api.delete(`/artist/onboarding/step5/experience/${pk}/`),
  completeOnboarding: () => api.post('/artist/onboarding/complete/'),
  getDisciplineOptions: (discipline) => api.get(`/artist/discipline-options/?discipline=${discipline}`),
  getShareLink: () => api.get('/artist/portfolio/share/'),
  getPublicPortfolio: (token) => api.get(`/artist/portfolio/public/${token}/`),
};

// ─── Organization Onboarding ──────────────────────────────────────
export const orgAPI = {
  getProfile: () => api.get('/organization/profile/'),
  getPublicProfile: (userId) => api.get(`/organization/profile/${userId}/`),
  step1: (data) => api.post('/organization/onboarding/step1/', data),
  step2: (data) => api.post('/organization/onboarding/step2/', data),
  step3: (data) => api.post('/organization/onboarding/step3/verification/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getVerificationStatus: () => api.get('/organization/onboarding/step4/status/'),
  completeOnboarding: () => api.post('/organization/onboarding/complete/'),
  getMedia: () => api.get('/organization/media/'),
  uploadMedia: (data) => api.post('/organization/media/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteMedia: (pk) => api.delete(`/organization/media/${pk}/`),
  uploadLogo: (data) => api.patch('/organization/profile/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getTeam: () => api.get('/organization/team/'),
  inviteTeamMember: (data) => api.post('/organization/team/invite/', data),
  updateTeamMember: (pk, data) => api.patch(`/organization/team/${pk}/`, data),
  removeTeamMember: (pk) => api.delete(`/organization/team/${pk}/`),
};

// ─── Onboarding Status ────────────────────────────────────────────
export const onboardingAPI = {
  getStatus: () => api.get('/onboarding/status/'),
};

// ─── Connections ──────────────────────────────────────────────────
export const connectionsAPI = {
  discover: () => api.get('/connections/discover/'),
  send: (data) => api.post('/connections/send/', data),
  getIncoming: () => api.get('/connections/incoming/'),
  respond: (pk, data) => api.post(`/connections/${pk}/respond/`, data),
  getMyConnections: () => api.get('/connections/my/'),
  remove: (pk) => api.delete(`/connections/${pk}/`),
};

// ─── Opportunities ────────────────────────────────────────────────
export const opportunitiesAPI = {
  list: (params) => api.get('/opportunities/', { params }),
  detail: (pk) => api.get(`/opportunities/${pk}/`),
  manage: (params) => api.get('/opportunities/', { params }),
  create: (data, publish = false) => api.post(`/opportunities/create-opportunity/${publish ? '?publish=true' : ''}`, data),
  update: (pk, data) => api.patch(`/opportunities/manage/${pk}/`, data),
  delete: (pk) => api.delete(`/opportunities/manage/${pk}/`),
  publish: (pk) => api.post(`/opportunities/manage/${pk}/publish/`),
  close: (pk) => api.post(`/opportunities/manage/${pk}/close/`),
  cancel: (pk) => api.post(`/opportunities/manage/${pk}/cancel/`),
};

// ─── Applications ─────────────────────────────────────────────────
export const applicationsAPI = {
  apply: (data) => api.post('/applications/apply/', data),
  myApplications: (params) => api.get('/applications/my/', { params }),
  myApplicationDetail: (pk) => api.get(`/applications/my/${pk}/`),
  withdraw: (pk) => api.delete(`/applications/my/${pk}/`),
  orgApplicationStats: () => api.get('/applications/dashboard/stats/'),
  orgOpportunities: () => api.get('/applications/dashboard/opportunities/'),
  orgAllApplications: (params) => api.get('/applications/all/', { params }),
  orgAll: (params) => api.get('/applications/manage/', { params }),
  orgDetail: (pk) => api.get(`/applications/manage/${pk}/`),
  orgByOpportunity: (oppPk, params) => api.get(`/applications/manage/opportunity/${oppPk}/`, { params }),
  updateStatus: (pk, data) => api.patch(`/applications/${pk}/status/`, data),
};

// ─── Notifications ────────────────────────────────────────────────
export const notificationsAPI = {
  list: (params) => api.get('/notifications/', { params }),
  unreadCount: () => api.get('/notifications/unread-count/'),
  markRead: (pk) => api.post(`/notifications/${pk}/read/`),
  markAllRead: () => api.post('/notifications/mark-all-read/'),
  delete: (pk) => api.delete(`/notifications/${pk}/`),
};

// ─── Settings ─────────────────────────────────────────────────────
export const settingsAPI = {
  getProfile: () => api.get('/settings/profile/'),
  updateProfile: (data) => api.patch('/settings/profile/', data),
  getNotificationPrefs: () => api.get('/settings/notifications/'),
  updateNotificationPrefs: (data) => api.patch('/settings/notifications/', data),
  getPrivacy: () => api.get('/settings/privacy/'),
  updatePrivacy: (data) => api.patch('/settings/privacy/', data),
  get2FAStatus: () => api.get('/settings/2fa/status/'),
  setup2FA: () => api.get('/settings/2fa/setup/'),
  enable2FA: (data) => api.post('/settings/2fa/enable/', data),
  disable2FA: (data) => api.post('/settings/2fa/disable/', data),
  deleteAccount: (data) => api.post('/settings/account/delete/', data),
  deactivateAccount: () => api.post('/settings/account/deactivate/'),
};

// ─── Dashboard ────────────────────────────────────────────────────
export const dashboardAPI = {
  // Organization
  orgWelcome:                () => api.get('/dashboard/organization/welcome/'),
  orgOpportunitiesPosted:    () => api.get('/dashboard/organization/opportunities-posted/'),
  orgActiveOpportunitiesCount: () => api.get('/dashboard/organization/active-opportunities-count/'),
  orgApplicationsCount:      () => api.get('/dashboard/organization/applications-count/'),
  orgProfileProgress:        () => api.get('/dashboard/organization/profile-progress/'),
  orgGenderDistribution:     (params) => api.get('/dashboard/organization/gender-distribution/', { params }),
  orgActiveOpportunities:    (params) => api.get('/dashboard/organization/active-opportunities/', { params }),
  orgApplicationsOverview:   (params) => api.get('/dashboard/organization/applications-overview/', { params }),
  // Artist
  artistWelcome:             () => api.get('/dashboard/artist/welcome/'),
  artistConnectionsCount:    () => api.get('/dashboard/artist/connections-count/'),
  artistPortfolioViewers:    (params) => api.get('/dashboard/artist/portfolio-viewers/', { params }),
  artistApplicationsCount:   () => api.get('/dashboard/artist/applications-count/'),
  artistProfileProgress:     () => api.get('/dashboard/artist/profile-progress/'),
  artistOpportunitiesForYou: () => api.get('/dashboard/artist/opportunities-for-you/'),
  artistConnectionsClose:    () => api.get('/dashboard/artist/connections-close/'),
  artistRecentActivity:      () => api.get('/dashboard/artist/recent-activity/'),
  artistUpdates:             () => api.get('/dashboard/artist/updates/'),
};

// ─── Support ──────────────────────────────────────────────────────
export const supportAPI = {
  list: () => api.get('/support/'),
  create: (data) => api.post('/support/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  detail: (pk) => api.get(`/support/${pk}/`),
};

// ─── Org Forms ────────────────────────────────────────────────────
export const orgFormsAPI = {
  list:             ()        => api.get('/interflow_form/manage/forms/'),
  detail:           (formId)  => api.get(`/interflow_form/manage/forms/${formId}/`),
  submissions:      (formId)  => api.get(`/interflow_form/manage/forms/${formId}/submissions/`),
  submissionDetail: (subId)   => api.get(`/interflow_form/manage/submissions/${subId}/`),
  updateSubmission: (subId, data) => api.patch(`/interflow_form/manage/submissions/${subId}/`, data),
};

// ─── Call For Artists (always public — no auth header needed) ──────
export const callForArtistsAPI = {
  getForm: (slug) => api.get(`/interflow_form/forms/${slug}/`),
  submitForm: (slug, data) =>
    api.post(`/interflow_form/forms/${slug}/submit/`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  validateToken: (token) => api.get(`/interflow_form/activate/${token}/`),
  activateAccount: (token, data) =>
    api.post(`/interflow_form/activate/${token}/`, data),
};

export default api;
