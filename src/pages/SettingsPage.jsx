import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import toast from 'react-hot-toast';
import { settingsAPI, authAPI } from '@/services/index';

/* ── Toggle Switch ── */
const Toggle = ({ on, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-green-500' : 'bg-gray-300'}`}
  >
    <span
      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`}
    />
  </button>
);

/* ── Reusable field components ── */
const Field = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <div className="flex flex-col">
    <label className="text-[12px] text-[#888] mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#8D5D1D] transition-colors"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-[12px] text-[#888] mb-1">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#8D5D1D] transition-colors pr-8 bg-white"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  </div>
);

/* ── Save / Cancel row ── */
const FormActions = ({ onSave, onCancel }) => (
  <div className="flex items-center gap-3 mt-4">
    <button
      type="button"
      onClick={onSave}
      className="px-5 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
      style={{ background: '#8D5D1D' }}
    >
      Save
    </button>
    <button
      type="button"
      onClick={onCancel}
      className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
    >
      Cancel
    </button>
  </div>
);

/* ── Section icon circle ── */
const IconCircle = ({ bg, children }) => (
  <div
    className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
    style={{ background: bg }}
  >
    {children}
  </div>
);

/* ── Expandable row ── */
const SettingRow = ({ label, expanded, onEdit, onClose, children }) => (
  <div className={`border rounded-xl transition-colors ${expanded ? 'border-[#8D5D1D]/40 bg-[#FDFAF5]' : 'border-gray-100 bg-white'}`}>
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm font-medium text-gray-800">{label}</span>
      {expanded ? (
        <button
          type="button"
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={14} className="text-gray-500" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-1.5 rounded-full text-sm font-medium border border-[#8D5D1D] text-[#8D5D1D] hover:bg-[#F5EED7] transition-colors"
          style={{ background: '#F5EED7' }}
        >
          Edit
        </button>
      )}
    </div>
    {expanded && (
      <div className="px-5 pb-5">
        {children}
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════════
   Main page
══════════════════════════════════════════════ */
const SettingsPage = () => {
  /* which row is open: key = "cardIndex-rowIndex" */
  const [open, setOpen] = useState(null);
  const toggle = (key) => setOpen((prev) => (prev === key ? null : key));
  const close = () => setOpen(null);

  /* ── Card 1: Portfolio Information ── */
  const [portName, setPortName] = useState({ firstName: 'Dayo', lastName: 'Ajayi', location: '', pronouns: '' });
  const [portContact, setPortContact] = useState({ phone: '', address: '', city: '', state: '', zip: '' });

  /* ── Card 2: Notification Settings ── */
  const [notifs, setNotifs] = useState({ reachout: true, connection: true, all: true });
  const toggleNotif = (k) => setNotifs((p) => ({ ...p, [k]: !p[k] }));

  /* ── Card 3: URLs and Domains ── */
  const [slug, setSlug] = useState('dayo-ajayi');

  /* ── Card 4: Account Management ── */
  const [emailAddr, setEmailAddr] = useState('dayo.ajayi@example.com');
  const [closeReason, setCloseReason] = useState('');
  const [closeMessage, setCloseMessage] = useState('');
  const [closePassword, setClosePassword] = useState('');

  /* ── Specific save handlers ── */
  const savePortfolioInfo = async () => {
    try {
      await settingsAPI.updateProfile({
        display_name: `${portName.firstName} ${portName.lastName}`.trim(),
        first_name: portName.firstName,
        last_name: portName.lastName,
        location: portName.location,
        pronoun: portName.pronouns,
      });
      toast.success('Profile updated!');
      close();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save profile');
    }
  };

  const saveContactInfo = async () => {
    try {
      await settingsAPI.updateProfile({
        phone: portContact.phone,
        address: portContact.address,
        city: portContact.city,
        state: portContact.state,
      });
      toast.success('Contact info updated!');
      close();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save contact info');
    }
  };

  const saveNotifPrefs = async () => {
    try {
      await settingsAPI.updateNotificationPrefs({
        email_new_connection: notifs.connection,
        email_marketing: notifs.all,
        inapp_profile_view: notifs.reachout,
      });
      toast.success('Notification preferences saved!');
      close();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save preferences');
    }
  };

  const saveSlug = async () => {
    try {
      await settingsAPI.updateProfile({ slug });
      toast.success('URL updated!');
      close();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update URL');
    }
  };

  const saveEmailAddr = async () => {
    try {
      await settingsAPI.updateProfile({ email: emailAddr });
      toast.success('Email update requested. Our team will confirm the change.');
      close();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update email');
    }
  };

  const handleCloseAccount = async () => {
    if (!closeReason) { toast.error('Please select a reason'); return; }
    if (!closePassword) { toast.error('Password is required to close account'); return; }
    try {
      await settingsAPI.deleteAccount({ password: closePassword, confirm: 'DELETE' });
      toast.success('Account closure requested.');
      close();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to close account. Please check your password.');
    }
  };

  const CLOSE_REASONS = [
    'I have a duplicate account',
    'I am getting too many emails',
    'I have privacy concern',
    'I am receiving unwanted contact',
    'Others',
  ];

  return (
    <DashboardLayout>
      <h1
        className="font-bold text-[22px] text-gray-900 mb-5"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        Settings
      </h1>

      <div className="flex flex-col gap-4">

        {/* ══ Card 1 — Portfolio Information ══ */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <IconCircle bg="#F5EED7">👤</IconCircle>
            <h2
              className="font-bold text-[16px] text-gray-900"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Portfolio Information
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {/* Row 1: Name & General */}
            <SettingRow
              label="Name, location and General Information"
              expanded={open === '1-0'}
              onEdit={() => toggle('1-0')}
              onClose={close}
            >
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="First name"
                    value={portName.firstName}
                    onChange={(e) => setPortName((p) => ({ ...p, firstName: e.target.value }))}
                  />
                  <Field
                    label="Last name"
                    value={portName.lastName}
                    onChange={(e) => setPortName((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Location"
                    value={portName.location}
                    onChange={(e) => setPortName((p) => ({ ...p, location: e.target.value }))}
                    options={['Lagos, Nigeria', 'Abuja, Nigeria', 'London, UK', 'New York, USA']}
                  />
                  <SelectField
                    label="Pronouns"
                    value={portName.pronouns}
                    onChange={(e) => setPortName((p) => ({ ...p, pronouns: e.target.value }))}
                    options={['He/Him', 'She/Her', 'They/Them', 'Prefer not to say']}
                  />
                </div>
                <FormActions onSave={savePortfolioInfo} onCancel={close} />
              </div>
            </SettingRow>

            {/* Row 2: Contact Information */}
            <SettingRow
              label="Contact Information"
              expanded={open === '1-1'}
              onEdit={() => toggle('1-1')}
              onClose={close}
            >
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Phone number"
                    type="tel"
                    value={portContact.phone}
                    onChange={(e) => setPortContact((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+234 800 000 0000"
                  />
                </div>
                <p className="text-[12px] text-[#888] -mb-2">Current Address</p>
                <Field
                  label="Address"
                  value={portContact.address}
                  onChange={(e) => setPortContact((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Street address"
                />
                <div className="grid grid-cols-3 gap-4">
                  <Field
                    label="City"
                    value={portContact.city}
                    onChange={(e) => setPortContact((p) => ({ ...p, city: e.target.value }))}
                  />
                  <Field
                    label="State"
                    value={portContact.state}
                    onChange={(e) => setPortContact((p) => ({ ...p, state: e.target.value }))}
                  />
                  <Field
                    label="Zip"
                    value={portContact.zip}
                    onChange={(e) => setPortContact((p) => ({ ...p, zip: e.target.value }))}
                  />
                </div>
                <FormActions onSave={saveContactInfo} onCancel={close} />
              </div>
            </SettingRow>
          </div>
        </div>

        {/* ══ Card 2 — Notification Settings ══ */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-1">
            <IconCircle bg="#DBEAFE">🔔</IconCircle>
            <div>
              <h2
                className="font-bold text-[16px] text-gray-900 leading-tight"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Notification Settings
              </h2>
              <p className="text-xs text-gray-500">Control where and what kind of notifications you get</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <SettingRow
              label="Email"
              expanded={open === '2-0'}
              onEdit={() => toggle('2-0')}
              onClose={close}
            >
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-600">Would you like to receive email notification.</p>

                {[
                  { key: 'reachout',   label: 'Reach out Messages' },
                  { key: 'connection', label: 'Connection Request' },
                  { key: 'all',        label: 'All notifications' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{label}</span>
                    <Toggle on={notifs[key]} onToggle={() => toggleNotif(key)} />
                  </div>
                ))}

                <FormActions onSave={saveNotifPrefs} onCancel={close} />
              </div>
            </SettingRow>
          </div>
        </div>

        {/* ══ Card 3 — URLs and Domains ══ */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-1">
            <IconCircle bg="#FCE7F3">👥</IconCircle>
            <div>
              <h2
                className="font-bold text-[16px] text-gray-900 leading-tight"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                URLs and Domains
              </h2>
              <p className="text-xs text-gray-500">Connect a domain and update your Stagetime URL.</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <SettingRow
              label="Change the URL for your profile"
              expanded={open === '3-0'}
              onEdit={() => toggle('3-0')}
              onClose={close}
            >
              <div className="flex flex-col gap-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your URL must contain 3–100 letters or numbers. Do not use spaces, symbols, or special
                  characters (e.g. !, $, @). Do not put a web address in this field.
                </p>
                <div className="flex items-center gap-0 border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#8D5D1D] transition-colors">
                  <span className="px-3 py-2.5 text-sm text-gray-500 bg-gray-50 border-r border-gray-200 whitespace-nowrap">
                    Interflow.ng/artists/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-white"
                  />
                </div>
                <FormActions onSave={saveSlug} onCancel={close} />
              </div>
            </SettingRow>
          </div>
        </div>

        {/* ══ Card 4 — Account Management ══ */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-1">
            <IconCircle bg="#DCFCE7">⚙️</IconCircle>
            <div>
              <h2
                className="font-bold text-[16px] text-gray-900 leading-tight"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Account Management
              </h2>
              <p className="text-xs text-gray-500">Control your Interflow account</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {/* Email address */}
            <SettingRow
              label="Email address"
              expanded={open === '4-0'}
              onEdit={() => toggle('4-0')}
              onClose={close}
            >
              <div className="flex flex-col gap-4">
                <Field
                  label="Email address"
                  type="email"
                  value={emailAddr}
                  onChange={(e) => setEmailAddr(e.target.value)}
                />
                <p className="text-xs text-gray-500 leading-relaxed">
                  If you'd like to update your email address, enter your new email address above.
                  Our team will reach out once we've updated your email address.
                </p>
                <FormActions onSave={saveEmailAddr} onCancel={close} />
              </div>
            </SettingRow>

            {/* Close Account */}
            <SettingRow
              label="Close Account"
              expanded={open === '4-1'}
              onEdit={() => toggle('4-1')}
              onClose={close}
            >
              <div className="flex flex-col gap-4">
                <p className="text-sm font-medium text-gray-700">
                  Let us know why you're closing your account:
                </p>

                <div className="flex flex-col gap-2">
                  {CLOSE_REASONS.map((reason) => (
                    <label key={reason} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="closeReason"
                        value={reason}
                        checked={closeReason === reason}
                        onChange={() => setCloseReason(reason)}
                        className="accent-[#8D5D1D]"
                      />
                      <span className="text-sm text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  By closing your account, you will permanently lose access to your Interflow profile,
                  portfolio, connections, and all associated data. This action cannot be undone.
                  Please ensure you have saved any information you need before proceeding.
                </p>

                <div className="flex flex-col">
                  <label className="text-[12px] text-[#888] mb-1">Message (optional)</label>
                  <textarea
                    rows={4}
                    value={closeMessage}
                    onChange={(e) => setCloseMessage(e.target.value)}
                    placeholder="Any additional comments…"
                    className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#8D5D1D] transition-colors resize-vertical"
                  />
                </div>

                <Field
                  label="Enter your password to confirm"
                  type="password"
                  value={closePassword}
                  onChange={(e) => setClosePassword(e.target.value)}
                  placeholder="Your current password"
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseAccount}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:bg-red-600"
                    style={{ background: '#8D5D1D' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#EF4444'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#8D5D1D'; }}
                  >
                    Close my account
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </SettingRow>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
