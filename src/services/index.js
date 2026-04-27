/* ─────────────────────────────────────────────────────────────────
   API Switcher
   – Exports one unified API surface regardless of mock/real mode.
   – Set  VITE_USE_MOCK=true  in .env.local to use mock data.
   – Remove or set VITE_USE_MOCK=false to hit the real backend.
   ───────────────────────────────────────────────────────────────── */

import {
  authAPI        as realAuthAPI,
  artistAPI      as realArtistAPI,
  orgAPI         as realOrgAPI,
  onboardingAPI  as realOnboardingAPI,
  connectionsAPI as realConnectionsAPI,
  opportunitiesAPI as realOpportunitiesAPI,
  applicationsAPI  as realApplicationsAPI,
  notificationsAPI as realNotificationsAPI,
  settingsAPI    as realSettingsAPI,
  supportAPI     as realSupportAPI,
  relevantWorksAPI as realRelevantWorksAPI,
  callForArtistsAPI,  // always real — public endpoints, no mock needed
} from './api';

import {
  mockAuthAPI,
  mockArtistAPI,
  mockOrgAPI,
  mockOnboardingAPI,
  mockConnectionsAPI,
  mockOpportunitiesAPI,
  mockApplicationsAPI,
  mockNotificationsAPI,
  mockSettingsAPI,
  mockSupportAPI,
  mockRelevantWorksAPI,
} from './mockApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

if (USE_MOCK) {
  console.info('%c[Interflow] Mock API active — no real network requests will be made.', 'color: #8D5D1D; font-weight: bold;');
}

export const authAPI         = USE_MOCK ? mockAuthAPI         : realAuthAPI;
export const artistAPI       = USE_MOCK ? mockArtistAPI       : realArtistAPI;
export const orgAPI          = USE_MOCK ? mockOrgAPI          : realOrgAPI;
export const onboardingAPI   = USE_MOCK ? mockOnboardingAPI   : realOnboardingAPI;
export const connectionsAPI  = USE_MOCK ? mockConnectionsAPI  : realConnectionsAPI;
export const opportunitiesAPI = USE_MOCK ? mockOpportunitiesAPI : realOpportunitiesAPI;
export const applicationsAPI  = USE_MOCK ? mockApplicationsAPI  : realApplicationsAPI;
export const notificationsAPI = USE_MOCK ? mockNotificationsAPI : realNotificationsAPI;
export const settingsAPI     = USE_MOCK ? mockSettingsAPI     : realSettingsAPI;
export const supportAPI      = USE_MOCK ? mockSupportAPI      : realSupportAPI;
export const relevantWorksAPI = USE_MOCK ? mockRelevantWorksAPI : realRelevantWorksAPI;

export { USE_MOCK };
export { callForArtistsAPI };
