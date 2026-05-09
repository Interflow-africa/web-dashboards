import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Plus, Edit2, MoreHorizontal, Image, Film } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import useAuthStore from '@/store/authStore';
import { authAPI, orgAPI } from '@/services/api';
import toast from 'react-hot-toast';

// ── Mock data (kept as fallbacks / used in Add modals) ────────────────────────

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
const VideoThumb = ({ caption, url, thumbnail }) => {
  const inner = (
    <div className="flex flex-col gap-1.5 shrink-0" style={{ width: 160 }}>
      <div
        className="rounded-xl flex items-center justify-center overflow-hidden"
        style={{
          width: 160,
          height: 100,
          background: thumbnail ? `url(${thumbnail}) center/cover no-repeat` : '#1A1A1A',
          position: 'relative',
        }}
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

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
        {inner}
      </a>
    );
  }
  return inner;
};

// ── Image placeholder tile ─────────────────────────────────────────────────
const ImageThumb = ({ label, src }) => (
  <div className="flex flex-col gap-1.5 shrink-0" style={{ width: 140 }}>
    <div
      className="rounded-xl flex flex-col items-center justify-center gap-2 overflow-hidden"
      style={{
        width: 140,
        height: 100,
        background: src ? `url(${src}) center/cover no-repeat` : '#FFF3E0',
        border: src ? 'none' : '1px solid #E8D5B0',
      }}
    >
      {!src && (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8D5D1D" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21,15 16,10 5,21" />
        </svg>
      )}
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
    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    style={{ background: 'rgba(0,0,0,0.45)' }}
  >
    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[600px] max-h-[92vh] overflow-y-auto">
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
const EditContactModal = ({ onClose, profile }) => {
  const [form, setForm] = useState({ phone: profile?.phone_number || '+234 803 000 1111', email: profile?.email || 'hello@wilddreams.ng' });
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
const AddVideoModal = ({ onClose, onSaved }) => {
  const [form, setForm]         = useState({ title: '', description: '', order: '' });
  const [file, setFile]         = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!file)             { toast.error('Please select a video file'); return; }
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('media_type',  'video');
      fd.append('file',        file);
      fd.append('title',       form.title);
      fd.append('description', form.description);
      if (form.order) fd.append('order', form.order);
      await orgAPI.uploadMedia(fd);
      toast.success('Video uploaded!');
      onSaved?.();
      onClose();
    } catch {
      toast.error('Failed to upload video');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Add Video" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Video File <span className="text-red-400">*</span></label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-6 gap-2 cursor-pointer hover:bg-gray-50 transition-all"
          >
            <Film size={24} color="#AAAAAA" />
            <span className="text-[12px] text-[#AAA]">
              {file ? file.name : 'Click to select a video file'}
            </span>
          </div>
          <input ref={fileRef} type="file" accept="video/*" className="hidden"
            onChange={e => setFile(e.target.files[0] || null)} />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Title <span className="text-red-400">*</span></label>
          <input value={form.title} onChange={set('title')} placeholder="e.g. Lagos Sound Fest – Highlights"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30 resize-none" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Display Order</label>
          <input type="number" min="1" value={form.order} onChange={set('order')} placeholder="1"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting}
          className="px-5 py-2 rounded-xl text-white text-[13px] font-semibold disabled:opacity-60"
          style={{ background: '#8D5D1D' }}>
          {submitting ? 'Uploading…' : 'Save'}
        </button>
      </div>
    </Modal>
  );
};

// ── Modal: Add Image ───────────────────────────────────────────────────────
const AddImageModal = ({ onClose, onSaved }) => {
  const [form, setForm]         = useState({ title: '', description: '', order: '' });
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file)             { toast.error('Please select an image file'); return; }
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('media_type',  'photo');
      fd.append('file',        file);
      fd.append('title',       form.title);
      fd.append('description', form.description);
      if (form.order) fd.append('order', form.order);
      await orgAPI.uploadMedia(fd);
      toast.success('Image uploaded!');
      onSaved?.();
      onClose();
    } catch {
      toast.error('Failed to upload image');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Add Image" onClose={onClose}>
      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Image File <span className="text-red-400">*</span></label>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-6 gap-2 cursor-pointer hover:bg-gray-50 transition-all overflow-hidden"
          >
            {preview ? (
              <img src={preview} alt="preview" className="max-h-[140px] rounded-lg object-contain" />
            ) : (
              <>
                <Image size={24} color="#AAAAAA" />
                <span className="text-[12px] text-[#AAA]">Click to upload image</span>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Title <span className="text-red-400">*</span></label>
          <input value={form.title} onChange={set('title')} placeholder="e.g. Season Poster"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Description <span className="text-gray-400">(optional)</span></label>
          <input value={form.description} onChange={set('description')} placeholder="e.g. 2026 season poster."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#444] mb-1">Display Order</label>
          <input type="number" min="1" value={form.order} onChange={set('order')} placeholder="1"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/30" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-medium border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
        <button onClick={handleSubmit} disabled={submitting}
          className="px-5 py-2 rounded-xl text-white text-[13px] font-semibold disabled:opacity-60"
          style={{ background: '#8D5D1D' }}>
          {submitting ? 'Uploading…' : 'Save'}
        </button>
      </div>
    </Modal>
  );
};

// ── TAB: Overview ──────────────────────────────────────────────────────────
const OverviewTab = ({ openModal, profile, media, onLogoUpload }) => {
  const orgName = profile?.organization_name || '—';
  const initials = orgName !== '—'
    ? orgName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'OR';

  const relevantWorks = profile?.relevant_works || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6">

      {/* LEFT column */}
      <div className="flex flex-col gap-5 w-full lg:w-[360px] lg:shrink-0">
        {/* Avatar & name */}
        <div className="flex flex-col items-center gap-2 bg-white rounded-2xl p-6 shadow-sm">
          <label className="relative cursor-pointer group" style={{ width: 80, height: 80 }}>
            <input type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
            <div
              className="flex items-center justify-center rounded-full overflow-hidden w-full h-full"
              style={{ border: '2px solid #8D5D1D', background: '#FFF3E0' }}
            >
              {profile?.logo ? (
                <img src={profile.logo} alt={orgName} className="w-full h-full object-cover" />
              ) : (
                <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 22, color: '#1A1A1A' }}>{initials}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.45)' }}>
              <Edit2 size={16} color="white" />
            </div>
          </label>
          <p className="text-[16px] font-bold text-[#1A1A1A] mt-1">{orgName}</p>
          <p className="text-[12px] text-[#888]">{profile?.organization_type || profile?.industry || ''}</p>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <SectionUnderlineHeading>About</SectionUnderlineHeading>
          <p className="text-[13px] text-[#555] leading-relaxed">
            {profile?.bio || profile?.description || 'No description yet.'}
          </p>
          <OutlinedEditBtn onClick={() => openModal('editAbout')} />
        </div>

        {/* Company Address */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <SectionUnderlineHeading>Company Address</SectionUnderlineHeading>
          <div className="flex flex-col gap-1.5 text-[13px]">
            <p><GoldLabel>Address: </GoldLabel><span className="text-[#444]">{profile?.address || '—'}</span></p>
            <p><GoldLabel>City: </GoldLabel><span className="text-[#444]">{profile?.city || '—'}</span></p>
            <p><GoldLabel>Country: </GoldLabel><span className="text-[#444]">{profile?.country || '—'}</span></p>
          </div>
          <OutlinedEditBtn onClick={() => openModal('editAddress')} />
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <SectionUnderlineHeading>Contact Information</SectionUnderlineHeading>
          <div className="flex flex-col gap-1.5 text-[13px]">
            <p><GoldLabel>Phone number: </GoldLabel><span className="text-[#444]">{profile?.phone || profile?.phone_number || '—'}</span></p>
            <p><GoldLabel>Email address: </GoldLabel><span className="text-[#444]">{profile?.email || '—'}</span></p>
          </div>
          <OutlinedEditBtn onClick={() => openModal('editContact')} />
        </div>
      </div>

      {/* RIGHT column */}
     
    </div>
  );
};

// ── TAB: Media ─────────────────────────────────────────────────────────────
const MediaTab = ({ openModal, media }) => (
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
        {media.videos.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {media.videos.map((v, idx) => (
              <VideoThumb
                key={v.id || idx}
                caption={v.caption || v.title || '—'}
                url={v.url || v.file_url}
                thumbnail={v.thumbnail || v.cover_image}
              />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#AAAAAA] py-2">No videos yet.</p>
        )}
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
        {media.images.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {media.images.map((img, idx) => (
              <ImageThumb
                key={img.id || idx}
                label={img.title || img.caption || img.name || `Img_${img.id || idx}`}
                src={img.url || img.file_url || img.image}
              />
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#AAAAAA] py-2">No images yet.</p>
        )}
      </div>
    </div>
  </div>
);

// ── TAB: Admin ─────────────────────────────────────────────────────────────
const AdminTab = ({ team }) => {
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

  // Normalise team member fields from API shape
  const getAdminName = (member) =>
    member.name ||
    `${member.first_name || ''} ${member.last_name || ''}`.trim() ||
    member.email ||
    '—';

  const getAdminAddress = (member) =>
    member.address || member.location || '—';

  const getAdminPhone = (member) =>
    member.phone || member.phone_number || '—';

  const getAdminGender = (member) =>
    member.gender || '—';

  // Use real team data if available, fall back to ADMINS
  const adminList = team && team.length > 0 ? team : ADMINS;

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
              {adminList.map(member => {
                const displayName = getAdminName(member);
                const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <tr key={member.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3"><input type="checkbox" className="w-3.5 h-3.5" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: '#8D5D1D' }}>
                          {initials}
                        </div>
                        <span className="font-medium text-[#1A1A1A]">{displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#555]">{getAdminGender(member)}</td>
                    <td className="px-4 py-3 text-[#555]">{getAdminAddress(member)}</td>
                    <td className="px-4 py-3 text-[#555]">{member.email}</td>
                    <td className="px-4 py-3 text-[#555]">{getAdminPhone(member)}</td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === member.id ? null : member.id)}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        <MoreHorizontal size={14} className="text-[#888]" />
                      </button>
                      {menuOpen === member.id && (
                        <div className="absolute right-6 top-8 bg-white rounded-xl shadow-lg border border-gray-100 z-10 py-1 w-32">
                          <button
                            className="w-full text-left px-4 py-2 text-[12px] hover:bg-gray-50 text-[#1A1A1A]"
                            onClick={() => { setSelectedAdmin(member); setAdminView('view'); setMenuOpen(null); }}
                          >
                            View
                          </button>
                          <button className="w-full text-left px-4 py-2 text-[12px] hover:bg-gray-50 text-[#1A1A1A]">Edit</button>
                          <button className="w-full text-left px-4 py-2 text-[12px] hover:bg-gray-50 text-red-500">Remove</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
            <span className="text-[11px] text-[#888]">Showing 1–{adminList.length} of {adminList.length}</span>
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
    const displayName = getAdminName(a);
    const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const firstName = a.first_name || a.firstName || displayName.split(' ')[0] || '—';
    const lastName  = a.last_name  || a.lastName  || displayName.split(' ').slice(1).join(' ') || '—';
    const dob       = a.dob || a.date_of_birth || '—';
    const city      = a.city || '—';
    const state     = a.state || '—';
    const zip       = a.zip || a.postal_code || '—';

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
            {initials}
          </div>
          <p className="text-[16px] font-bold" style={{ color: '#8D5D1D' }}>{displayName}</p>
          <p className="text-[12px] text-[#888]">Admin</p>
          <p className="text-[12px] text-[#888]">{city}, {state}</p>
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
          <div className="grid gap-x-6 gap-y-3 mb-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['First Name', firstName],
              ['Last Name', lastName],
              ['Date of Birth', dob],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-[11px] text-[#888] mb-0.5">{label}</p>
                <p className="text-[13px] font-medium text-[#1A1A1A]">{val}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-x-6 gap-y-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Email', a.email || '—'],
              ['Phone', getAdminPhone(a)],
              ['User Role', a.role || a.designation || '—'],
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
          <div className="grid gap-x-6 gap-y-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Home Address', getAdminAddress(a)],
              ['State', state],
              ['City', city],
              ['Zip', zip],
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

  const [profile, setProfile] = useState(null);
  const [media, setMedia]     = useState({ videos: [], images: [] });
  const [team, setTeam]       = useState([]);

  const loadMedia = () => {
    orgAPI.getMedia()
      .then(r => {
        const arr = Array.isArray(r.data?.data) ? r.data.data : [];
        setMedia({
          videos: arr.filter(m => m.media_type === 'video'),
          images: arr.filter(m => m.media_type === 'photo' || m.media_type === 'image'),
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    authAPI.getMe()
      .then(r => {
        const user = r.data?.data || {};
        const p = user.profile || {};
        setProfile({
          ...p,
          email: p.business_email || user.email || '',
          address: p.business_address || p.location || '',
        });
      })
      .catch(() => {});
    loadMedia();
    orgAPI.getTeam()
      .then(r => {
        const d = r.data?.data || r.data || [];
        setTeam(Array.isArray(d) ? d : (d.members || d.results || []));
      })
      .catch(() => {});
  }, []);

  const tabs = ['Overview', 'Media'];//, 'Admin'];

  const openModal  = key => setOpenModalKey(key);
  const closeModal = ()  => setOpenModalKey(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('logo', file);
    try {
      const r = await orgAPI.uploadLogo(fd);
      const logo = r.data?.data?.logo || r.data?.logo;
      if (logo) setProfile(p => ({ ...p, logo }));
      toast.success('Logo updated!');
    } catch {
      toast.error('Failed to upload logo');
    }
  };

  return (
    <DashboardLayout>
      <div className="relative min-h-full rounded-2xl" style={{ background: '#F8F8F7', padding: '28px 28px 40px' }}>

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 22, color: '#1A1A1A' }}>
            Organization Profile
          </h1>
          <button
            onClick={() => navigate('/org/opportunities', { state: { openCreate: true } })}
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
        {activeTab === 'Overview' && <OverviewTab openModal={openModal} profile={profile} media={media} onLogoUpload={handleLogoUpload} />}
        {activeTab === 'Media'    && <MediaTab openModal={openModal} media={media} />}
        {activeTab === 'Admin'    && <AdminTab team={team} />}
      </div>

      {/* Modals */}
      {openModalKey === 'editAbout'       && <EditAboutModal onClose={closeModal} />}
      {openModalKey === 'editAddress'     && <EditAddressModal onClose={closeModal} />}
      {openModalKey === 'editContact'     && <EditContactModal onClose={closeModal} profile={profile} />}
      {openModalKey === 'addRelevantWork' && <AddRelevantWorkModal onClose={closeModal} />}
      {openModalKey === 'addVideo'        && <AddVideoModal onClose={closeModal} onSaved={loadMedia} />}
      {openModalKey === 'addImage'        && <AddImageModal onClose={closeModal} onSaved={loadMedia} />}
    </DashboardLayout>
  );
};

export default OrgProfilePage;
