import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus, Edit2, MoreHorizontal } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import useAuthStore from '@/store/authStore';

// ── Mock data ──────────────────────────────────────────────────────────────

const RELEVANT_WORKS = [
  { id: 1, title: 'Lagos Sound Festival 2024',   subtitle: 'Lagos, Nigeria. Invited Artist' },
  { id: 2, title: 'Abuja Creative Residency',    subtitle: 'Abuja, Nigeria. Invited Artist' },
  { id: 3, title: 'Pan-African Music Exchange',  subtitle: 'Accra, Ghana. Invited Artist'   },
];

const VIDEO_SAMPLES = [
  { id: 1, caption: 'Lagos Sound Fest – Highlights' },
  { id: 2, caption: 'Studio Session Vol. 1'         },
  { id: 3, caption: 'Abuja Residency Recap'          },
  { id: 4, caption: 'Creative Workshop 2024'         },
  { id: 5, caption: 'Pan-African Exchange Film'      },
];

const IMAGE_SAMPLES = [
  { id: 1, label: 'Img_001' },
  { id: 2, label: 'Img_002' },
  { id: 3, label: 'Img_003' },
  { id: 4, label: 'Img_004' },
  { id: 5, label: 'Img_005' },
];

const ADMINS = [
  {
    id: 1, name: 'Adaeze Okonkwo', gender: 'Female',
    address: '12 Allen Ave, Ikeja', email: 'adaeze@wilddreams.ng', phone: '+234 801 234 5678',
    firstName: 'Adaeze', lastName: 'Okonkwo', dob: '1990-04-15', role: 'Super Admin',
    state: 'Lagos', city: 'Ikeja', zip: '100001',
  },
  {
    id: 2, name: 'Emeka Chukwu', gender: 'Male',
    address: '3 Ring Road, Benin', email: 'emeka@wilddreams.ng', phone: '+234 802 345 6789',
    firstName: 'Emeka', lastName: 'Chukwu', dob: '1988-11-22', role: 'Admin',
    state: 'Edo', city: 'Benin City', zip: '300001',
  },
];

// ── Shared small components ────────────────────────────────────────────────

const GoldLabel = ({ children }) => (
  <span className="font-semibold" style={{ color: '#8D5D1D' }}>{children}</span>
);

const SectionUnderlineHeading = ({ children }) => (
  <div className="mb-3">
    <p className="text-[14px] font-bold text-[#1A1A1A]">{children}</p>
    <div className="mt-1 h-[2px] w-10 rounded" style={{ background: '#8D5D1D' }} />
  </div>
);

const OutlinedEditBtn = ({ onClick, label = 'Edit Info' }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 mt-2 border rounded-lg px-3 py-1.5 text-[12px] font-medium text-[#1A1A1A] hover:bg-gray-50 transition-all"
    style={{ borderColor: '#D0D0D0' }}
  >
    <Edit2 size={12} /> {label}
  </button>
);

// ── Video thumbnail placeholder ────────────────────────────────────────────
const VideoThumb = ({ caption }) => (
  <div className="flex flex-col gap-1.5 shrink-0" style={{ width: 160 }}>
    <div
      className="rounded-xl flex items-center justify-center"
      style={{ width: 160, height: 100, background: '#1A1A1A', position: 'relative' }}
    >
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: 32, height: 32, background: 'rgba(255,0,0,0.85)' }}
      >
        <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
          <polygon points="0,0 12,7 0,14" />
        </svg>
      </div>
    </div>
    <p className="text-[11px] font-medium" style={{ color: '#8D5D1D', maxWidth: 160 }}>{caption}</p>
  </div>
);

// ── Image placeholder tile ─────────────────────────────────────────────────
const ImageThumb = ({ label }) => (
  <div className="flex flex-col gap-1.5 shrink-0" style={{ width: 140 }}>
    <div
      className="rounded-xl flex flex-col items-center justify-center gap-2"
      style={{ width: 140, height: 100, background: '#FFF3E0', border: '1px solid #E8D5B0' }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8D5D1D" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21,15 16,10 5,21" />
      </svg>
    </div>
    <p className="text-[11px] font-medium text-[#444]">{label}</p>
  </div>
);

// ── Toggle switch ──────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }) => (
  <button
    onClick={() => onChange(!on)}
    className="relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors"
    style={{ background: on ? '#8D5D1D' : '#D1D5DB' }}
  >
    <span
      className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
      style={{ margin: 2, transform: on ? 'translateX(16px)' : 'translateX(0)' }}
    />
  </button>
);

// ── Permission checkbox ────────────────────────────────────────────────────
const PermCheck = ({ checked }) => (
  <div
    className="w-4 h-4 rounded flex items-center justify-center"
    style={{ background: checked ? '#22C55E' : '#E5E7EB', border: checked ? 'none' : '1px solid #D1D5DB' }}
  >
    {checked && (
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <polyline points="1,4 4,7 9,1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )}
  </div>
);

// ── Modal wrapper ──────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center"
    style={{ background: 'rgba(0,0,0,0.45)' }}
  >
    <div className="bg-white rounded-2xl shadow-xl w-full mx-4" style={{ maxWidth: 600 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <ArrowLeft size={16} style={{ color: '#8D5D1D' }} />
          <span className="text-[15px] font-bold text-[#1A1A1A]">{title}</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>
      {/* Body */}
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// ── Modal: Edit About ──────────────────────────────────────────────────────
const EditAboutModal = ({ onClose }) => {
  const [text, setText] = useState(
    'Wild Dreams is a Lagos-based media and entertainment agency dedicated to amplifying African creative voices. We produce, curate, and distribute music, film, and visual art across the continent and beyond.'
  );
  return (
    <Modal title="Edit About Us" onClose={onClose}>
      <label className="block text-[12px] font-medium text-[#444] mb-1.5">About Us</label>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={6}
        className="w-full border border-gray-200 rounded-xl p-3 text-[13px] text-[#1A1A1A] outline-none focus:ring-2 resize-none"
        style={{ focusRingColor: '#8D5D1D' }}
      />
      <div className="flex justify-end mt-4">
        <button
          className="px-5 py-2 rounded-xl text-white text-[13px] font-semibold"
          style={{ background: '#8D5D1D' }}
        >
          Update
        </button>
      </div>
    </Modal>
  );
};

// ── Modal: Edit Address ────────────────────────────────────────────────────
const EditAddressModal = ({ onClose }) => {
  const [form, setForm] = useState({ address: '14 Babs Animashaun Road, Surulere', city: 'Lagos', country: 'Nigeria' });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Edit Company Address" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Address</label>
          <input value={form.address} onChange={set('address')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[12px] font-medium text-[#444] mb-1">City</label>
            <select value={form.city} onChange={set('city')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30 bg-white">
              {['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-[12px] font-medium text-[#444] mb-1">Country</label>
            <select value={form.country} onChange={set('country')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30 bg-white">
              {['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Senegal'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button className="px-5 py-2 rounded-xl text-white text-[13px] font-semibold" style={{ background: '#8D5D1D' }}>Update</button>
      </div>
    </Modal>
  );
};

// ── Modal: Edit Contact ────────────────────────────────────────────────────
const EditContactModal = ({ onClose }) => {
  const [form, setForm] = useState({ phone: '+234 803 000 1111', email: 'hello@wilddreams.ng' });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Edit Contact Information" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Phone Number</label>
          <input value={form.phone} onChange={set('phone')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Email Address</label>
          <input value={form.email} onChange={set('email')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button className="px-5 py-2 rounded-xl text-white text-[13px] font-semibold" style={{ background: '#8D5D1D' }}>Update</button>
      </div>
    </Modal>
  );
};

// ── Modal: Add Relevant Work ───────────────────────────────────────────────
const AddRelevantWorkModal = ({ onClose }) => {
  const [form, setForm] = useState({ title: '', link: '', description: '' });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Add Relevant Work" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Project Title <span className="text-red-400">*</span></label>
          <input value={form.title} onChange={set('title')} placeholder="e.g. Lagos Sound Festival"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Project Link</label>
          <input value={form.link} onChange={set('link')} placeholder="https://"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={4}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30 resize-none" />
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button className="px-5 py-2 rounded-xl text-white text-[13px] font-semibold" style={{ background: '#8D5D1D' }}>Save</button>
      </div>
    </Modal>
  );
};

// ── Modal: Add Video ───────────────────────────────────────────────────────
const AddVideoModal = ({ onClose }) => {
  const [form, setForm] = useState({ ytLink: '', title: '', subtitle: '', description: '', visible: false });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Add Video" onClose={onClose}>
      <div className="flex flex-col gap-3">
        {/* Cover image upload */}
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Cover Image</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-6 gap-2 cursor-pointer hover:bg-gray-50 transition-all">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
            </svg>
            <span className="text-[12px] text-[#AAA]">Click to upload cover image</span>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">YouTube Link <span className="text-red-400">*</span></label>
          <input value={form.ytLink} onChange={set('ytLink')} placeholder="https://youtube.com/watch?v=..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-[12px] font-medium text-[#444] mb-1">Title <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={set('title')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
          </div>
          <div className="flex-1">
            <label className="block text-[12px] font-medium text-[#444] mb-1">Subtitle <span className="text-red-400">*</span></label>
            <input value={form.subtitle} onChange={set('subtitle')}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30 resize-none" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.visible} onChange={e => setForm(p => ({ ...p, visible: e.target.checked }))}
            className="w-4 h-4 rounded" style={{ accentColor: '#8D5D1D' }} />
          <span className="text-[12px] text-[#444]">Allow Video to be visible</span>
        </label>
      </div>
      <div className="flex justify-end mt-4">
        <button className="px-5 py-2 rounded-xl text-white text-[13px] font-semibold" style={{ background: '#8D5D1D' }}>Save</button>
      </div>
    </Modal>
  );
};

// ── Modal: Add Image ───────────────────────────────────────────────────────
const AddImageModal = ({ onClose }) => {
  const [form, setForm] = useState({ title: '', subtitle: '' });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  return (
    <Modal title="Add Image" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Image File</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-6 gap-2 cursor-pointer hover:bg-gray-50 transition-all">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21,15 16,10 5,21" />
            </svg>
            <span className="text-[12px] text-[#AAA]">Click to upload image</span>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Title <span className="text-red-400">*</span></label>
          <input value={form.title} onChange={set('title')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Subtitle <span className="text-gray-400">(optional)</span></label>
          <input value={form.subtitle} onChange={set('subtitle')}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button className="px-5 py-2 rounded-xl text-white text-[13px] font-semibold" style={{ background: '#8D5D1D' }}>Save</button>
      </div>
    </Modal>
  );
};

// ── TAB: Overview ──────────────────────────────────────────────────────────
const OverviewTab = ({ openModal }) => (
  <div className="flex gap-6" style={{ flexWrap: 'wrap' }}>

    {/* LEFT column */}
    <div className="flex flex-col gap-5" style={{ flex: '0 0 360px', maxWidth: 380 }}>
      {/* Avatar & name */}
      <div className="flex flex-col items-center gap-2 bg-white rounded-2xl p-6 shadow-sm">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 80, height: 80, border: '2px solid #8D5D1D', background: '#FFF3E0' }}
        >
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 22, color: '#1A1A1A' }}>WD</span>
        </div>
        <p className="text-[16px] font-bold text-[#1A1A1A] mt-1">Wild Dreams</p>
        <p className="text-[12px] text-[#888]">Media and Entertainment Agency</p>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <SectionUnderlineHeading>About</SectionUnderlineHeading>
        <p className="text-[13px] text-[#555] leading-relaxed">
          Wild Dreams is a Lagos-based media and entertainment agency dedicated to amplifying African creative voices.
          We produce, curate, and distribute music, film, and visual art across the continent and beyond.
        </p>
        <OutlinedEditBtn onClick={() => openModal('editAbout')} />
      </div>

      {/* Company Address */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <SectionUnderlineHeading>Company Address</SectionUnderlineHeading>
        <div className="flex flex-col gap-1.5 text-[13px]">
          <p><GoldLabel>Address: </GoldLabel><span className="text-[#444]">14 Babs Animashaun Road, Surulere</span></p>
          <p><GoldLabel>City: </GoldLabel><span className="text-[#444]">Lagos</span></p>
          <p><GoldLabel>Country: </GoldLabel><span className="text-[#444]">Nigeria</span></p>
        </div>
        <OutlinedEditBtn onClick={() => openModal('editAddress')} />
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <SectionUnderlineHeading>Contact Information</SectionUnderlineHeading>
        <div className="flex flex-col gap-1.5 text-[13px]">
          <p><GoldLabel>Phone number: </GoldLabel><span className="text-[#444]">+234 803 000 1111</span></p>
          <p><GoldLabel>Email address: </GoldLabel><span className="text-[#444]">hello@wilddreams.ng</span></p>
        </div>
        <OutlinedEditBtn onClick={() => openModal('editContact')} />
      </div>
    </div>

    {/* RIGHT column */}
    <div className="flex flex-col gap-5 flex-1" style={{ minWidth: 280 }}>
      {/* Relevant Works */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-bold text-[#1A1A1A]">Relevant works</p>
          <button
            onClick={() => openModal('addRelevantWork')}
            className="flex items-center gap-1 text-[12px] font-medium border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all"
            style={{ borderColor: '#D0D0D0', color: '#1A1A1A' }}
          >
            <Plus size={12} /> Add relevant works
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {RELEVANT_WORKS.map(w => (
            <div key={w.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-[13px] font-semibold text-[#1A1A1A]">{w.title}</p>
                <p className="text-[11px] text-[#888]">{w.subtitle}</p>
              </div>
              <button className="text-[#AAAAAA] hover:text-[#8D5D1D] transition-colors">
                <Edit2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <button className="mt-3 text-[12px] font-semibold" style={{ color: '#8D5D1D' }}>See all</button>
      </div>

      {/* Work Samples */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <p className="text-[14px] font-bold text-[#1A1A1A] mb-4">Work Samples</p>
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {VIDEO_SAMPLES.slice(0, 6).map(v => (
            <div key={v.id} className="flex flex-col gap-1">
              <div
                className="rounded-xl flex items-center justify-center"
                style={{ height: 100, background: '#1A1A1A', position: 'relative' }}
              >
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 28, height: 28, background: 'rgba(255,0,0,0.85)' }}
                >
                  <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
                    <polygon points="0,0 10,6 0,12" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] font-medium" style={{ color: '#8D5D1D' }}>{v.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ── TAB: Media ─────────────────────────────────────────────────────────────
const MediaTab = ({ openModal }) => (
  <div className="flex flex-col gap-6">
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-[16px] font-bold text-[#1A1A1A] mb-5">Our Gallery</p>

      {/* Videos row */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-semibold text-[#1A1A1A]">Videos</p>
          <button
            onClick={() => openModal('addVideo')}
            className="flex items-center gap-1 text-[12px] font-medium border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all"
            style={{ borderColor: '#D0D0D0', color: '#1A1A1A' }}
          >
            <Plus size={12} /> Add Video
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {VIDEO_SAMPLES.map(v => <VideoThumb key={v.id} caption={v.caption} />)}
        </div>
      </div>

      {/* Images row */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-semibold text-[#1A1A1A]">Images</p>
          <button
            onClick={() => openModal('addImage')}
            className="flex items-center gap-1 text-[12px] font-medium border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-all"
            style={{ borderColor: '#D0D0D0', color: '#1A1A1A' }}
          >
            <Plus size={12} /> Add image
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {IMAGE_SAMPLES.map(i => <ImageThumb key={i.id} label={i.label} />)}
        </div>
      </div>
    </div>
  </div>
);

// ── TAB: Admin ─────────────────────────────────────────────────────────────
const AdminTab = () => {
  const [adminView, setAdminView] = useState('list'); // 'list' | 'view' | 'add' | 'roles'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  // Roles state
  const [disableToggle, setDisableToggle] = useState(false);
  const [deleteToggle, setDeleteToggle]   = useState(false);
  const permissions = {
    Opportunities:   { Read: true,  Edit: true,  Create: true,  Delete: false },
    Applications:    { Read: true,  Edit: false, Create: false, Delete: false },
    'Admin Account': { Read: true,  Edit: true,  Create: false, Delete: false },
    Profile:         { Read: true,  Edit: true,  Create: true,  Delete: true  },
    Media:           { Read: true,  Edit: true,  Create: true,  Delete: false },
  };

  // Add Admin form state
  const [addForm, setAddForm] = useState({
    title: '', firstName: '', lastName: '', gender: '', dob: '', designation: '', phone: '', email: '',
  });
  const setField = k => e => setAddForm(p => ({ ...p, [k]: e.target.value }));

  // ── List view ──
  if (adminView === 'list') {
    return (
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[16px] font-bold text-[#1A1A1A]">Admin List</p>
          <button
            onClick={() => setAdminView('add')}
            className="flex items-center gap-1.5 border rounded-xl px-4 py-2 text-[13px] font-medium hover:bg-gray-50 transition-all"
            style={{ borderColor: '#D0D0D0', color: '#1A1A1A' }}
          >
            <Plus size={13} /> Add new Admin
          </button>
        </div>

        {/* Search + filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1" style={{ minWidth: 200 }}>
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Search admins..." className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20" />
          </div>
          <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none bg-white focus:ring-2 focus:ring-[#8D5D1D]/20">
            <option>Sort by</option><option>Name A-Z</option><option>Name Z-A</option>
          </select>
          <select className="border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none bg-white focus:ring-2 focus:ring-[#8D5D1D]/20">
            <option>Filter</option><option>Super Admin</option><option>Admin</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-gray-50">
              <tr className="text-[#888] text-left">
                <th className="px-4 py-3 font-medium"><input type="checkbox" className="w-3.5 h-3.5" /></th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Gender</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {ADMINS.map(admin => (
                <tr key={admin.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3"><input type="checkbox" className="w-3.5 h-3.5" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ background: '#8D5D1D' }}>
                        {admin.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="font-medium text-[#1A1A1A]">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#555]">{admin.gender}</td>
                  <td className="px-4 py-3 text-[#555]">{admin.address}</td>
                  <td className="px-4 py-3 text-[#555]">{admin.email}</td>
                  <td className="px-4 py-3 text-[#555]">{admin.phone}</td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() => setMenuOpen(menuOpen === admin.id ? null : admin.id)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      <MoreHorizontal size={14} className="text-[#888]" />
                    </button>
                    {menuOpen === admin.id && (
                      <div className="absolute right-6 top-8 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 w-32">
                        <button
                          className="w-full text-left px-4 py-2 text-[12px] hover:bg-gray-50 text-[#1A1A1A]"
                          onClick={() => { setSelectedAdmin(admin); setAdminView('view'); setMenuOpen(null); }}
                        >
                          View
                        </button>
                        <button className="w-full text-left px-4 py-2 text-[12px] hover:bg-gray-50 text-[#1A1A1A]">Edit</button>
                        <button className="w-full text-left px-4 py-2 text-[12px] hover:bg-gray-50 text-red-500">Remove</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
            <span className="text-[11px] text-[#888]">Showing 1–{ADMINS.length} of {ADMINS.length}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(n => (
                <button key={n}
                  className="w-6 h-6 rounded text-[11px] font-medium"
                  style={{ background: n === 1 ? '#8D5D1D' : 'transparent', color: n === 1 ? 'white' : '#888' }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── View Admin ──
  if (adminView === 'view' && selectedAdmin) {
    const a = selectedAdmin;
    return (
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setAdminView('list')}
            className="flex items-center gap-1.5 text-[14px] font-bold text-[#1A1A1A]"
          >
            <ArrowLeft size={16} style={{ color: '#8D5D1D' }} /> Admin List
          </button>
          <button
            onClick={() => setAdminView('add')}
            className="flex items-center gap-1.5 border rounded-xl px-4 py-2 text-[13px] font-medium hover:bg-gray-50 transition-all"
            style={{ borderColor: '#D0D0D0', color: '#1A1A1A' }}
          >
            <Plus size={13} /> Add new Admin
          </button>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[18px] font-bold"
            style={{ background: '#8D5D1D' }}>
            {a.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <p className="text-[16px] font-bold" style={{ color: '#8D5D1D' }}>{a.name}</p>
          <p className="text-[12px] text-[#888]">Admin</p>
          <p className="text-[12px] text-[#888]">{a.city}, {a.state}</p>
          <button
            onClick={() => setAdminView('roles')}
            className="mt-2 px-4 py-1.5 rounded-xl text-white text-[12px] font-semibold"
            style={{ background: '#8D5D1D' }}
          >
            Assign Roles
          </button>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-[14px] font-bold text-[#1A1A1A] mb-4">Personal Information</p>
          <div className="grid gap-x-6 gap-y-3 mb-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[
              ['First Name', a.firstName],
              ['Last Name', a.lastName],
              ['Date of Birth', a.dob],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-[11px] text-[#888] mb-0.5">{label}</p>
                <p className="text-[13px] font-medium text-[#1A1A1A]">{val}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[
              ['Email', a.email],
              ['Phone', a.phone],
              ['User Role', a.role],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-[11px] text-[#888] mb-0.5">{label}</p>
                <p className="text-[13px] font-medium text-[#1A1A1A]">{val}</p>
              </div>
            ))}
          </div>
          <OutlinedEditBtn />
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-[14px] font-bold text-[#1A1A1A] mb-4">Address</p>
          <div className="grid gap-x-6 gap-y-3" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
            {[
              ['Home Address', a.address],
              ['State', a.state],
              ['City', a.city],
              ['Zip', a.zip],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-[11px] text-[#888] mb-0.5">{label}</p>
                <p className="text-[13px] font-medium text-[#1A1A1A]">{val}</p>
              </div>
            ))}
          </div>
          <OutlinedEditBtn />
        </div>
      </div>
    );
  }

  // ── Add New Admin ──
  if (adminView === 'add') {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-[16px] font-bold text-[#1A1A1A]">Add new Admin</p>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div>
              <label className="block text-[12px] font-medium text-[#444] mb-1">Title</label>
              <input value={addForm.title} onChange={setField('title')} placeholder="Mr / Ms / Dr"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#444] mb-1">First Name</label>
              <input value={addForm.firstName} onChange={setField('firstName')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#444] mb-1">Last Name</label>
              <input value={addForm.lastName} onChange={setField('lastName')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#444] mb-1">Gender</label>
              <select value={addForm.gender} onChange={setField('gender')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30 bg-white">
                <option value="">Select gender</option>
                <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#444] mb-1">Date of Birth</label>
              <input type="date" value={addForm.dob} onChange={setField('dob')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#444] mb-1">Designation</label>
              <select value={addForm.designation} onChange={setField('designation')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30 bg-white">
                <option value="">Select role</option>
                <option>Super Admin</option><option>Admin</option><option>Viewer</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#444] mb-1">Phone</label>
              <input value={addForm.phone} onChange={setField('phone')} placeholder="+234 ..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#444] mb-1">Email</label>
              <input type="email" value={addForm.email} onChange={setField('email')}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              className="px-6 py-2.5 rounded-xl text-white text-[13px] font-semibold"
              style={{ background: '#8D5D1D' }}
            >
              Submit
            </button>
            <button
              onClick={() => setAdminView('list')}
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold border-2"
              style={{ borderColor: '#EF4444', color: '#EF4444' }}
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Assign Roles ──
  if (adminView === 'roles') {
    const permRows = Object.entries(permissions);
    const cols = ['Read', 'Edit', 'Create', 'Delete'];
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setAdminView('view')}
          className="flex items-center gap-1.5 text-[14px] font-bold text-[#1A1A1A] self-start"
        >
          <ArrowLeft size={16} style={{ color: '#8D5D1D' }} /> Assign Roles
        </button>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-[14px] font-bold mb-4" style={{ color: '#8D5D1D' }}>Admin Access Control</p>

          {/* Toggle rows */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#1A1A1A]">Disable Account</span>
              <Toggle on={disableToggle} onChange={setDisableToggle} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#1A1A1A]">Delete Account</span>
              <Toggle on={deleteToggle} onChange={setDeleteToggle} />
            </div>
          </div>

          {/* Permissions table */}
          <p className="text-[13px] font-semibold text-[#1A1A1A] mb-3">Role Permission (Access)</p>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[#888] text-left">
                <th className="pb-2 font-medium pr-6">Resource</th>
                {cols.map(c => <th key={c} className="pb-2 font-medium text-center">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {permRows.map(([resource, perms]) => (
                <tr key={resource} className="border-t border-gray-50">
                  <td className="py-2.5 font-medium text-[#1A1A1A] pr-6">{resource}</td>
                  {cols.map(col => (
                    <td key={col} className="py-2.5 text-center">
                      <div className="flex justify-center">
                        <PermCheck checked={!!perms[col]} />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};

// ── Page component ─────────────────────────────────────────────────────────

const OrgProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [openModalKey, setOpenModalKey] = useState(null);

  const tabs = ['Overview', 'Media', 'Admin'];

  const openModal  = key => setOpenModalKey(key);
  const closeModal = ()  => setOpenModalKey(null);

  return (
    <DashboardLayout>
      <div className="relative min-h-full rounded-2xl" style={{ background: '#F8F8F7', padding: '28px 28px 40px' }}>

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 22, color: '#1A1A1A' }}>
            Organization Profile
          </h1>
          <button
            onClick={() => navigate('/org/opportunities')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-[13px] font-semibold"
            style={{ background: '#8D5D1D' }}
          >
            <Plus size={14} /> Create Opportunity
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-end gap-6 mb-6 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="pb-2.5 text-[14px] font-semibold transition-colors relative"
              style={{ color: activeTab === tab ? '#8D5D1D' : '#888' }}
            >
              {tab}
              {activeTab === tab && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: '#8D5D1D' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Overview' && <OverviewTab openModal={openModal} />}
        {activeTab === 'Media'    && <MediaTab openModal={openModal} />}
        {activeTab === 'Admin'    && <AdminTab />}
      </div>

      {/* Modals */}
      {openModalKey === 'editAbout'       && <EditAboutModal onClose={closeModal} />}
      {openModalKey === 'editAddress'     && <EditAddressModal onClose={closeModal} />}
      {openModalKey === 'editContact'     && <EditContactModal onClose={closeModal} />}
      {openModalKey === 'addRelevantWork' && <AddRelevantWorkModal onClose={closeModal} />}
      {openModalKey === 'addVideo'        && <AddVideoModal onClose={closeModal} />}
      {openModalKey === 'addImage'        && <AddImageModal onClose={closeModal} />}
    </DashboardLayout>
  );
};

export default OrgProfilePage;
