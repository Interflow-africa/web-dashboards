/* ─────────────────────────────────────────────────────────────────
   Mock API Layer
   – Mirrors the exact interface of the real api.js.
   – Returns realistic fake data after a short simulated delay.
   – Set VITE_USE_MOCK=true in your .env to activate.
   ───────────────────────────────────────────────────────────────── */

const DELAY = (ms = 600) => new Promise(r => setTimeout(r, ms));

/* ─── Helpers ────────────────────────────────────────────────────── */
const ok = (data) => ({ data: { success: true, data } });
const err = (message, status = 400) => {
  const e = new Error(message);
  e.response = { status, data: { success: false, message } };
  return e;
};

/* ─── Fake DB (in-memory, resets on page refresh) ────────────────── */
const db = {
  users: [],
  otps:  {},        // email → otp code
  resetTokens: {},  // email → token
  sessions: {},     // accessToken → email
};

const fakeTokens = (email) => {
  const access  = `mock_access_${btoa(email)}_${Date.now()}`;
  const refresh = `mock_refresh_${btoa(email)}_${Date.now()}`;
  db.sessions[access] = email; // track who owns this token
  return { access, refresh };
};

/* ─── Mock Auth API ──────────────────────────────────────────────── */
export const mockAuthAPI = {
  async register({ email, password, role, first_name, last_name, confirm_password, tos_accepted }) {
    await DELAY();
    if (db.users.find(u => u.email === email)) throw err('An account with this email already exists.');
    const user = { id: Date.now(), email, password, role, first_name, last_name, is_onboarded: false };
    db.users.push(user);
    db.otps[email] = '123456'; // fixed OTP for mock
    return ok({ message: 'Registration successful. Please verify your email.' });
  },

  async verifyOTP({ email, code }) {
    await DELAY();
    if (db.otps[email] !== String(code)) throw err('Invalid or expired OTP.');
    const user = db.users.find(u => u.email === email);
    if (!user) throw err('User not found.');
    delete db.otps[email];
    const t = fakeTokens(email);
    return ok({ ...t, role: user.role, is_onboarded: user.is_onboarded });
  },

  async resendOTP({ email }) {
    await DELAY(400);
    if (!db.users.find(u => u.email === email)) throw err('User not found.');
    db.otps[email] = '123456';
    return ok({ message: 'OTP resent.' });
  },

  async login({ email, password }) {
    await DELAY();
    const user = db.users.find(u => u.email === email);
    if (!user || user.password !== password) throw err('Invalid credentials. Please try again.', 401);
    const t = fakeTokens(email);
    return ok({ ...t, role: user.role, is_onboarded: user.is_onboarded });
  },

  async logout() {
    await DELAY(200);
    return ok({ message: 'Logged out.' });
  },

  async refreshToken({ refresh }) {
    await DELAY(300);
    if (!refresh?.startsWith('mock_refresh_')) throw err('Invalid refresh token.', 401);
    return ok({ access: `mock_access_refreshed_${Date.now()}` });
  },

  async requestPasswordReset({ email }) {
    await DELAY();
    // Always succeed in mock mode (don't leak whether email exists)
    const token = `mock_reset_${btoa(email)}_${Date.now()}`;
    db.resetTokens[email] = token;
    return ok({ message: 'Reset instructions sent.' });
  },

  async confirmPasswordReset({ email, code, new_password }) {
    await DELAY();
    // In mock mode, accept code '123456' for any registered email
    if (String(code) !== '123456') throw err('Invalid or expired reset code.');
    const user = db.users.find(u => u.email === email);
    if (!user) throw err('User not found.');
    user.password = new_password;
    delete db.resetTokens[email];
    return ok({ message: 'Password reset successful.' });
  },

  async changePassword({ old_password, new_password }) {
    await DELAY();
    return ok({ message: 'Password changed successfully.' });
  },

  async getMe() {
    await DELAY(300);
    // Resolve the current user from the stored access token
    const token = localStorage.getItem('interflow_access');
    const email = token ? db.sessions[token] : null;
    const user  = email ? db.users.find(u => u.email === email) : null;
    if (!user) throw err('Not authenticated.', 401);
    const { password: _pw, ...safe } = user; // never expose password
    return ok(safe);
  },

  async getDashboard() {
    await DELAY(400);
    return ok({
      connections: 12,
      applications: 3,
      opportunities: 5,
      notifications: 2,
    });
  },
};

/* ─── Mock Artist API ────────────────────────────────────────────── */
export const mockArtistAPI = {
  async getProfile() {
    await DELAY(400);
    return ok({
      id: 1,
      first_name: 'Alex',
      last_name: 'Rivera',
      bio: 'Contemporary dancer with 8 years of professional experience.',
      discipline: 'Dance',
      sub_disciplines: ['Contemporary', 'Ballet'],
      location: 'New York, NY',
      avatar: null,
      is_onboarded: true,
    });
  },

  async step1(data) { await DELAY(); return ok({ message: 'Step 1 saved.', ...data }); },
  async step2(data) { await DELAY(); return ok({ message: 'Step 2 saved.', ...data }); }, // expects { ratings: { skill: score } }
  async step3(data) { await DELAY(); return ok({ message: 'Step 3 saved.', ...data }); },

  async getMedia() {
    await DELAY(400);
    return ok([]);
  },

  async uploadMedia(data) {
    await DELAY(800);
    const isFormData = typeof data.get === 'function';
    const media_type = isFormData ? data.get('media_type') : data.media_type;
    return ok({ id: Date.now(), url: '#', media_type: media_type || 'image' });
  },
  async deleteMedia(pk) { await DELAY(300); return ok({ message: 'Deleted.' }); },

  async getExperiences() {
    await DELAY(400);
    return ok([
      { id: 1, title: 'Lead Dancer', company: 'City Ballet', start_date: '2019-01', end_date: '2022-06', description: 'Performed in 40+ productions.' },
    ]);
  },

  async addExperience(data) { await DELAY(); return ok({ id: Date.now(), ...data }); },
  async updateExperience(pk, data) { await DELAY(); return ok({ id: pk, ...data }); },
  async deleteExperience(pk) { await DELAY(300); return ok({ message: 'Deleted.' }); },

  async completeOnboarding() {
    await DELAY();
    const token = localStorage.getItem('interflow_access');
    const email = token ? db.sessions[token] : null;
    const user  = email ? db.users.find(u => u.email === email) : null;
    if (user) user.is_onboarded = true;
    return ok({ message: 'Onboarding complete.' });
  },

  async getDisciplineOptions(discipline) {
    await DELAY(300);
    const opts = {
      Dance: ['Contemporary', 'Ballet', 'Hip-Hop', 'Jazz', 'Modern', 'Ballroom'],
      Music: ['Classical', 'Jazz', 'Pop', 'Rock', 'R&B', 'Folk'],
      Theatre: ['Drama', 'Musical Theatre', 'Improv', 'Physical Theatre'],
      'Visual Arts': ['Painting', 'Sculpture', 'Photography', 'Digital Art'],
      Film: ['Acting', 'Directing', 'Cinematography', 'Screenwriting'],
    };
    return ok(opts[discipline] || []);
  },

  async getShareLink() { await DELAY(300); return ok({ token: 'mock_share_token', url: 'http://localhost:5173/portfolio/public/mock_share_token' }); },
  async getPublicPortfolio(token) { await DELAY(400); return ok({ name: 'Alex Rivera', bio: 'Contemporary dancer.', media: [] }); },
  async getPublicProfile(userId) { await DELAY(400); return ok({ id: userId, name: 'Alex Rivera', role: 'artist' }); },
  async uploadAvatar(data) { await DELAY(600); return ok({ avatar: '#' }); },
};

/* ─── Mock Org API ───────────────────────────────────────────────── */
export const mockOrgAPI = {
  async getProfile() {
    await DELAY(400);
    return ok({
      id: 1,
      name: 'Arts Council NY',
      bio: 'Supporting the arts in New York since 1985.',
      type: 'nonprofit',
      location: 'New York, NY',
      is_onboarded: true,
    });
  },

  async step1(data) { await DELAY(); return ok({ message: 'Step 1 saved.', ...data }); },
  async step2(data) { await DELAY(); return ok({ message: 'Step 2 saved.', ...data }); },
  async step3(data) { await DELAY(800); return ok({ message: 'Documents uploaded.' }); },
  async getVerificationStatus() { await DELAY(300); return ok({ status: 'pending' }); },
  async completeOnboarding() {
    await DELAY();
    const token = localStorage.getItem('interflow_access');
    const email = token ? db.sessions[token] : null;
    const user  = email ? db.users.find(u => u.email === email) : null;
    if (user) user.is_onboarded = true;
    return ok({ message: 'Onboarding complete.' });
  },
  async getMedia() { await DELAY(400); return ok([]); },
  async uploadMedia(data) { await DELAY(800); return ok({ id: Date.now(), url: '#', type: 'image' }); },
  async deleteMedia(pk) { await DELAY(300); return ok({ message: 'Deleted.' }); },
  async getTeam() { await DELAY(400); return ok([]); },
  async inviteTeamMember(data) { await DELAY(); return ok({ id: Date.now(), ...data, status: 'invited' }); },
  async updateTeamMember(pk, data) { await DELAY(); return ok({ id: pk, ...data }); },
  async removeTeamMember(pk) { await DELAY(300); return ok({ message: 'Removed.' }); },
  async getPublicProfile(userId) { await DELAY(400); return ok({ id: userId, name: 'Arts Council NY', role: 'organization' }); },
};

/* ─── Mock Connections API ───────────────────────────────────────── */
export const mockConnectionsAPI = {
  async discover() {
    await DELAY(500);
    return ok([
      { id: 1, name: 'Jamie Lee',  role: 'artist', discipline: 'Music',   location: 'LA', avatar: null, mutual: 3 },
      { id: 2, name: 'Sam Torres', role: 'artist', discipline: 'Dance',   location: 'NY', avatar: null, mutual: 1 },
      { id: 3, name: 'City Ballet', role: 'organization',                  location: 'NY', avatar: null, mutual: 5 },
    ]);
  },
  async send({ receiver_id, ...rest }) { await DELAY(); return ok({ message: 'Connection request sent.' }); },
  async getIncoming() { await DELAY(400); return ok([]); },
  async respond(pk, data) { await DELAY(); return ok({ message: 'Response recorded.' }); },
  async getMyConnections() { await DELAY(400); return ok([]); },
  async remove(pk) { await DELAY(300); return ok({ message: 'Connection removed.' }); },
};

/* ─── Mock Opportunities API ─────────────────────────────────────── */
const MOCK_OPPS = [
  { id: 1, title: 'Lead Dancer – Spring Showcase', org: 'City Ballet', type: 'Audition', deadline: '2026-04-15', location: 'New York, NY', pay: '$800/week', discipline: 'Dance' },
  { id: 2, title: 'Session Musician Wanted',       org: 'Studio 88',   type: 'Gig',      deadline: '2026-04-10', location: 'Remote',        pay: '$200/session', discipline: 'Music' },
  { id: 3, title: 'Theatre Actor – Summer Run',    org: 'Playhouse Co', type: 'Audition', deadline: '2026-05-01', location: 'Chicago, IL',   pay: '$600/week',  discipline: 'Theatre' },
];

export const mockOpportunitiesAPI = {
  async list(params) { await DELAY(500); return ok(MOCK_OPPS); },
  async detail(pk) { await DELAY(400); return ok(MOCK_OPPS.find(o => o.id === Number(pk)) || MOCK_OPPS[0]); },
  async manage(params) { await DELAY(400); return ok(MOCK_OPPS); },
  async create(data) { await DELAY(); const o = { id: Date.now(), ...data }; MOCK_OPPS.push(o); return ok(o); },
  async update(pk, data) { await DELAY(); return ok({ id: pk, ...data }); },
  async delete(pk) { await DELAY(300); return ok({ message: 'Deleted.' }); },
  async publish(pk) { await DELAY(); return ok({ message: 'Published.' }); },
  async close(pk) { await DELAY(); return ok({ message: 'Closed.' }); },
  async cancel(pk) { await DELAY(); return ok({ message: 'Cancelled.' }); },
};

/* ─── Mock Applications API ──────────────────────────────────────── */
export const mockApplicationsAPI = {
  async apply(data) { await DELAY(); return ok({ id: Date.now(), ...data, status: 'pending' }); },
  async myApplications() { await DELAY(400); return ok([]); },
  async myApplicationDetail(pk) { await DELAY(300); return ok({ id: pk, status: 'pending' }); },
  async withdraw(pk) { await DELAY(); return ok({ message: 'Withdrawn.' }); },
  async orgAll() { await DELAY(400); return ok([]); },
  async orgDetail(pk) { await DELAY(300); return ok({ id: pk, status: 'pending' }); },
  async orgByOpportunity(oppPk) { await DELAY(400); return ok([]); },
  async updateStatus(pk, data) { await DELAY(); return ok({ id: pk, ...data }); },
};

/* ─── Mock Notifications API ─────────────────────────────────────── */
export const mockNotificationsAPI = {
  async list() { await DELAY(400); return ok([]); },
  async unreadCount() { await DELAY(200); return ok({ count: 0 }); },
  async markRead(pk) { await DELAY(200); return ok({ message: 'Marked read.' }); },
  async markAllRead() { await DELAY(200); return ok({ message: 'All marked read.' }); },
  async delete(pk) { await DELAY(200); return ok({ message: 'Deleted.' }); },
};

/* ─── Mock Settings API ──────────────────────────────────────────── */
export const mockSettingsAPI = {
  async getProfile() { await DELAY(400); return ok({ first_name: 'Alex', last_name: 'Rivera', email: 'artist@demo.com' }); },
  async updateProfile(data) { await DELAY(); return ok({ ...data }); },
  async getNotificationPrefs() { await DELAY(300); return ok({ email_notifications: true, push_notifications: true }); },
  async updateNotificationPrefs(data) { await DELAY(); return ok(data); },
  async getPrivacy() { await DELAY(300); return ok({ profile_visibility: 'public' }); },
  async updatePrivacy(data) { await DELAY(); return ok(data); },
  async get2FAStatus() { await DELAY(300); return ok({ enabled: false }); },
  async setup2FA() { await DELAY(400); return ok({ qr_code: '#', secret: 'MOCK_SECRET' }); },
  async enable2FA(data) { await DELAY(); return ok({ message: '2FA enabled.' }); },
  async disable2FA(data) { await DELAY(); return ok({ message: '2FA disabled.' }); },
  async deleteAccount(data) {
    await DELAY();
    if (data.confirm !== 'DELETE') throw err('Please type DELETE to confirm account deletion.');
    return ok({ message: 'Account deleted.' });
  },
  async deactivateAccount() { await DELAY(); return ok({ message: 'Account deactivated.' }); },
};

/* ─── Mock Support API ───────────────────────────────────────────── */
export const mockSupportAPI = {
  async list() { await DELAY(400); return ok([]); },
  async create(data) {
    await DELAY(600);
    const isFormData = typeof data.get === 'function';
    const category = isFormData ? data.get('category') : data.category;
    const subject  = isFormData ? data.get('subject')  : data.subject;
    const message  = isFormData ? data.get('message')  : data.message;
    return ok({ id: Date.now(), status: 'open', category, subject, message });
  },
  async detail(pk) { await DELAY(300); return ok({ id: pk, status: 'open', messages: [] }); },
};

/* ─── Mock Relevant Works API ────────────────────────────────────── */
export const mockRelevantWorksAPI = {
  async list() {
    await DELAY(400);
    return ok([
      { id: 1, project_title: 'Sankofa (2025)', organization: 'Lagos Dance Theatre', project_link: 'https://example.com/sankofa', description: 'Two-act contemporary piece.', file_url: null, order: 1 },
      { id: 2, project_title: 'Echoes — MUSON 2024', organization: 'MUSON Centre', project_link: null, description: 'Live performance at MUSON festival.', file_url: null, order: 2 },
    ]);
  },
  async create(data) { await DELAY(600); return ok({ id: Date.now(), ...Object.fromEntries(data instanceof FormData ? data.entries() : Object.entries(data)) }); },
  async detail(pk)       { await DELAY(300); return ok({ id: pk, project_title: 'Sample Work', organization: 'Sample Org', description: '', file_url: null }); },
  async update(pk, data) { await DELAY(400); return ok({ id: pk, ...data }); },
  async delete(pk)       { await DELAY(300); return ok({ message: 'Deleted.' }); },
};

/* ─── Mock Onboarding Status API ─────────────────────────────────── */
export const mockOnboardingAPI = {
  async getStatus() { await DELAY(300); return ok({ step: 1, completed: false }); },
};
