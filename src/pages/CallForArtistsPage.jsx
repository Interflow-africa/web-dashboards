import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Upload, Link2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/max';
import en from 'react-phone-number-input/locale/en.json';
import { callForArtistsAPI } from '@/services/index';
import getApiError from '@/utils/apiError';

/* ─── Constants ────────────────────────────────────────────────── */
const GOLD      = '#8D5D1D';
const GOLD_DARK = '#7A4E16';

const DISCIPLINE_OPTIONS = [
  { value: 'dancer',             label: 'Dancer' },
  { value: 'poet_spoken_word',   label: 'Poet / Spoken Word' },
  { value: 'musician',           label: 'Musician' },
  { value: 'singer_vocalist',    label: 'Singer / Vocalist' },
  { value: 'theatre_performer',  label: 'Theatre Performer' },
  { value: 'performance_artist', label: 'Performance Artist' },
  { value: 'others',             label: 'Others' },
];

const SUB_FIELDS = {
  dancer:            { key: 'dance_style',   label: 'Dance Style',   options: ['Afro Dance', 'Contemporary', 'Hip Hop', 'Street Dance', 'Traditional', 'Experimental'] },
  poet_spoken_word:  { key: 'poetry_style',  label: 'Poetry Style',  options: ['Spoken Word', 'Slam Poetry', 'Performance Poetry', 'Storytelling'] },
  musician:          { key: 'instrument',    label: 'Instrument',    options: ['Guitar', 'Piano / Keyboard', 'Drums / Percussion', 'Bass', 'Violin', 'Saxophone', 'Trumpet', 'Traditional Instrument'] },
  singer_vocalist:   { key: 'vocal_type',    label: 'Vocal Type',    options: ['Lead Vocalist', 'Backup Vocalist', 'Choir Singer'] },
};

/* ─── Country list (built from react-phone-number-input/core) ───── */
const ALL_COUNTRIES = getCountries()
  .map(code => ({ code, name: en[code] || code, dial: `+${getCountryCallingCode(code)}` }))
  .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

/* ─── Sub-components ───────────────────────────────────────────── */

const SectionCard = ({ num, title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
      <div className="w-7 h-7 rounded-full text-white text-[12px] font-bold flex items-center justify-center shrink-0"
        style={{ backgroundColor: GOLD }}>
        {num}
      </div>
      <h3 className="font-bold text-[15px] text-gray-900">{title}</h3>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

const Field = ({ label, required, error, children, wide }) => (
  <div className={wide ? 'col-span-2' : ''}>
    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-[12px] text-red-500">{error}</p>}
  </div>
);

const Input = ({ error, ...props }) => (
  <input
    className={`w-full border rounded-xl px-4 py-3 text-[14px] text-gray-800 outline-none transition-colors placeholder:text-gray-300
      ${error ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-[#8D5D1D]'}`}
    {...props}
  />
);

const Select = ({ error, children, ...props }) => (
  <select
    className={`w-full border rounded-xl px-4 py-3 text-[14px] text-gray-800 outline-none transition-colors appearance-none bg-white
      ${error ? 'border-red-400' : 'border-gray-200 focus:border-[#8D5D1D]'}`}
    {...props}
  >
    {children}
  </select>
);

const Textarea = ({ error, ...props }) => (
  <textarea
    rows={4}
    className={`w-full border rounded-xl px-4 py-3 text-[14px] text-gray-800 outline-none transition-colors resize-vertical placeholder:text-gray-300
      ${error ? 'border-red-400' : 'border-gray-200 focus:border-[#8D5D1D]'}`}
    {...props}
  />
);

const ToggleGroup = ({ options, value, onChange }) => (
  <div className="flex gap-2 flex-wrap">
    {options.map(opt => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`px-4 py-2 rounded-full text-[13px] font-medium border transition-all ${
          value === opt.value
            ? 'text-white border-[#8D5D1D]'
            : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
        }`}
        style={value === opt.value ? { backgroundColor: GOLD } : {}}>
        {opt.label}
      </button>
    ))}
  </div>
);

const BoolToggle = ({ value, onChange, trueLabel = 'Yes', falseLabel = 'No' }) => (
  <div className="flex gap-2">
    {[{ v: true, l: trueLabel }, { v: false, l: falseLabel }].map(({ v, l }) => (
      <button key={String(v)} type="button" onClick={() => onChange(v)}
        className={`px-5 py-2.5 rounded-full text-[13px] font-medium border transition-all ${
          value === v ? 'text-white border-[#8D5D1D]' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
        }`}
        style={value === v ? { backgroundColor: GOLD } : {}}>
        {l}
      </button>
    ))}
  </div>
);

/* ─── Success Screen ───────────────────────────────────────────── */
const SuccessScreen = ({ email, onLogin }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
    style={{ background: 'linear-gradient(135deg, #0D0D0D 0%, #1a1a0d 100%)' }}>
    <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-lg">
      <Check size={36} className="text-white" strokeWidth={3} />
    </div>
    <h1 className="text-white font-bold text-[28px] text-center mb-3"
      style={{ fontFamily: 'Cormorant Garamond, serif' }}>
      Application Submitted!
    </h1>
    <p className="text-white/60 text-[15px] text-center max-w-[400px] mb-2">
      Your application has been received. We've sent an activation email to:
    </p>
    <p className="text-[#D4A84B] font-semibold text-[16px] mb-6">{email}</p>
    <p className="text-white/40 text-[13px] text-center max-w-[380px] mb-10 leading-relaxed">
      Check your inbox and click the link to set your password and activate your Interflow account.
    </p>
    <button
      onClick={onLogin}
      className="flex items-center gap-2.5 font-semibold text-[15px] text-white px-8 py-3.5 rounded-full transition-all hover:opacity-90 active:scale-95"
      style={{ background: GOLD }}>
      Continue to Login
      <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
        <ArrowRight size={15} />
      </span>
    </button>
  </div>
);

/* ─── Page Loader ──────────────────────────────────────────────── */
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4"
    style={{ background: '#0D0D0D' }}>
    <div style={{ width: 44, height: 44, border: '3px solid rgba(212,168,75,0.2)', borderTopColor: '#D4A84B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>Loading…</p>
  </div>
);

/* ─── Main Page ────────────────────────────────────────────────── */
const CallForArtistsPage = () => {
  const { slug }    = useParams();
  const navigate    = useNavigate();

  const [formMeta, setFormMeta]   = useState(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]       = useState({});

  /* Headshot */
  const [headshot, setHeadshot]           = useState(null);
  const [headshotPreview, setHeadshotPreview] = useState(null);
  const headshotRef = useRef();

  /* Work sample mode */
  const [workMode, setWorkMode] = useState('url'); // 'url' | 'file'
  const [workFile, setWorkFile] = useState(null);
  const workFileRef = useRef();

  /* Phone split state */
  const [dialCode, setDialCode] = useState('+234');
  const [phoneNum, setPhoneNum] = useState('');

  /* Form state */
  const [form, setForm] = useState({
    full_name:             '',
    email:                 '',
    city:                  '',
    country:               '',
    instagram_handle:      '',
    primary_discipline:    '',
    custom_discipline:     '',
    dance_style:           '',
    poetry_style:          '',
    instrument:            '',
    vocal_type:            '',
    role:                  '',
    work_external_url:     '',
    work_title:            '',
    work_duration_seconds: '',
    why_join:              '',
    attended_before:       false,
    is_available:          true,
    available_dates:       '',
    wants_to_present:      false,
  });

  const set = (key) => (e) => {
    const val = e.target ? e.target.value : e;
    setForm(f => ({ ...f, [key]: val }));
    setErrors(err => { const n = { ...err }; delete n[key]; return n; });
  };

  /* Load form metadata */
  useEffect(() => {
    callForArtistsAPI.getForm(slug)
      .then(r => setFormMeta(r.data.data || r.data))
      .catch(err => {
        const msg = getApiError(err, 'Form not found');
        setMetaError(msg);
      })
      .finally(() => setMetaLoading(false));
  }, [slug]);

  /* Headshot handler */
  const onHeadshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHeadshot(file);
    setHeadshotPreview(URL.createObjectURL(file));
  };

  /* Work file handler */
  const onWorkFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setWorkFile(file);
    setErrors(err => { const n = { ...err }; delete n.work_file; return n; });
  };

  /* Validate */
  const validate = () => {
    const e = {};
    if (!form.full_name.trim())          e.full_name           = 'Full name is required';
    if (!form.email.trim())              e.email               = 'Email is required';
    if (!form.city.trim())               e.city                = 'City is required';
    if (!form.country.trim())            e.country             = 'Country is required';
    if (!form.why_join.trim())           e.why_join            = 'Please tell us why you want to join';
    if (!form.primary_discipline)        e.primary_discipline  = 'Please select your discipline';
    if (form.primary_discipline === 'others' && !form.custom_discipline.trim())
                                         e.custom_discipline   = 'Please specify your discipline';
    if (!form.work_title.trim())         e.work_title          = 'Work title is required';
    if (workMode === 'url' && !form.work_external_url.trim())
                                         e.work_external_url   = 'Please provide a link to your work';
    if (workMode === 'file' && !workFile) e.work_file          = 'Please upload your work file';
    if (!form.is_available && !form.available_dates.trim())
                                         e.available_dates     = 'Please specify your available dates';
    return e;
  };

  /* Submit */
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Please fill in all required fields.');
      // scroll to first error
      document.querySelector('[data-error]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      if (headshot) fd.append('headshot', headshot);
      fd.append('full_name',  form.full_name.trim());
      fd.append('email',      form.email.trim());

      const fullPhone = phoneNum.trim() ? `${dialCode}${phoneNum.trim()}` : '';
      if (fullPhone) fd.append('phone_number', fullPhone);

      fd.append('city',         form.city.trim());
      fd.append('country',      form.country.trim());
      if (form.instagram_handle) fd.append('instagram_handle', form.instagram_handle.trim());

      if (form.primary_discipline === 'others') {
        fd.append('primary_discipline', form.custom_discipline.trim());
      } else {
        fd.append('primary_discipline', form.primary_discipline);
      }
      const sub = SUB_FIELDS[form.primary_discipline];
      if (sub && form[sub.key]) fd.append(sub.key, form[sub.key]);
      if (form.role)            fd.append('role', form.role.trim());

      if (workMode === 'file' && workFile) fd.append('work_file', workFile);
      if (workMode === 'url')  fd.append('work_external_url', form.work_external_url.trim());
      fd.append('work_title', form.work_title.trim());
      if (form.work_duration_seconds) fd.append('work_duration_seconds', form.work_duration_seconds);

      if (form.why_join)       fd.append('why_join',         form.why_join.trim());
      fd.append('attended_before',  String(form.attended_before));
      fd.append('is_available',     String(form.is_available));
      if (!form.is_available && form.available_dates)
                                fd.append('available_dates',  form.available_dates.trim());
      fd.append('wants_to_present', String(form.wants_to_present));

      await callForArtistsAPI.submitForm(slug, fd);
      setSubmitted(true);
    } catch (err) {
      const msg = getApiError(err, 'Submission failed. Please try again.');
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Loading / Error states ── */
  if (metaLoading) return <PageLoader />;

  if (metaError || !formMeta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-4"
        style={{ background: '#0D0D0D' }}>
        <p className="text-white/50 text-[15px]">This form is not available.</p>
        <Link to="/login" className="text-[#D4A84B] text-[14px] hover:underline">Back to Login</Link>
      </div>
    );
  }

  if (!formMeta.is_open) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-4"
        style={{ background: '#0D0D0D' }}>
        <p className="text-white font-bold text-[24px]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          {formMeta.title}
        </p>
        <p className="text-white/40 text-[15px]">Submissions are now closed.</p>
        <Link to="/login" className="text-[#D4A84B] text-[14px] hover:underline">Back to Login</Link>
      </div>
    );
  }

  if (submitted) {
    return <SuccessScreen email={form.email} onLogin={() => navigate('/login')} />;
  }

  const subField = SUB_FIELDS[form.primary_discipline];
  const fmtClose = formMeta.closes_at
    ? new Date(formMeta.closes_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen" style={{ background: '#F4F2EE' }}>

      {/* ── Top Nav ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <img src="/assets/icons/interflow-logo.svg" alt="Interflow" style={{ height: 36, width: 'auto' }} />
        <Link to="/login" className="text-[13px] text-gray-500 hover:text-gray-800 transition-colors font-medium">
          Already have an account? <span className="text-[#8D5D1D] font-semibold">Sign In</span>
        </Link>
      </header>

      {/* ── Hero ── */}
      <div className="relative overflow-hidden"
        style={{
          background: formMeta.cover_image
            ? `linear-gradient(to bottom, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.85) 100%)`
            : 'linear-gradient(135deg, #0D0D0D 0%, #1a1208 60%, #0D0D0D 100%)',
          minHeight: 240,
        }}>
        {formMeta.cover_image && (
          <img src={formMeta.cover_image} alt=""
            className="absolute inset-0 w-full h-full object-cover -z-10 opacity-50" />
        )}
        <div className="relative z-10 max-w-[720px] mx-auto px-6 py-12 pb-10">
          <p className="text-[#D4A84B] text-[12px] font-bold uppercase tracking-[0.15em] mb-3">Call for Artists</p>
          <h1 className="text-white font-bold leading-tight mb-3"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px, 5vw, 44px)' }}>
            {formMeta.title}
          </h1>
          {formMeta.description && (
            <p className="text-white/60 text-[15px] leading-relaxed max-w-[560px] mb-4">{formMeta.description}</p>
          )}
          {fmtClose && (
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              <span className="text-white/80 text-[13px] font-medium">Closes {fmtClose}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-[720px] mx-auto px-4 py-8 flex flex-col gap-6">

          {/* ── Section A: Personal Information ── */}
          <SectionCard num="A" title="Personal Information">
            {/* Headshot */}
            <div className="flex items-start gap-5 mb-6 pb-6 border-b border-gray-100">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 overflow-hidden cursor-pointer border-2 border-dashed border-gray-200 hover:border-[#8D5D1D] transition-colors"
                style={{ background: headshotPreview ? 'transparent' : '#F4F2EE' }}
                onClick={() => headshotRef.current?.click()}>
                {headshotPreview
                  ? <img src={headshotPreview} alt="headshot" className="w-full h-full object-cover" />
                  : <Upload size={20} className="text-gray-300" />
                }
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-0.5">Headshot / Profile Photo</p>
                <p className="text-[12px] text-gray-400 mb-2">Optional. JPG or PNG.</p>
                <button type="button" onClick={() => headshotRef.current?.click()}
                  className="text-[12px] font-semibold px-4 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-[#8D5D1D] hover:text-[#8D5D1D] transition-colors">
                  {headshot ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input ref={headshotRef} type="file" accept="image/*" className="hidden" onChange={onHeadshotChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required error={errors.full_name}>
                <Input placeholder="e.g. Dayo Ajayi" value={form.full_name} onChange={set('full_name')} error={errors.full_name} data-error={errors.full_name ? 'true' : undefined} />
              </Field>
              <Field label="Email Address" required error={errors.email}>
                <Input type="email" placeholder="dayo@example.com" value={form.email} onChange={set('email')} error={errors.email} />
              </Field>
              <Field label="Phone Number" error={errors.phone_number}>
                <div className="flex gap-2">
                  <select
                    value={dialCode}
                    onChange={e => setDialCode(e.target.value)}
                    className="border border-gray-200 rounded-xl px-2 py-3 text-[13px] text-gray-800 outline-none focus:border-[#8D5D1D] bg-white"
                    style={{ width: 120, flexShrink: 0 }}
                  >
                    {ALL_COUNTRIES.map(c => (
                      <option key={c.code} value={c.dial}>{c.dial} {c.name}</option>
                    ))}
                  </select>
                  <Input
                    type="tel"
                    placeholder="8012345678"
                    value={phoneNum}
                    onChange={e => { setPhoneNum(e.target.value); setErrors(err => { const n={...err}; delete n.phone_number; return n; }); }}
                    className="flex-1"
                  />
                </div>
              </Field>
              <Field label="Instagram Handle" error={errors.instagram_handle}>
                <Input placeholder="@yourhandle" value={form.instagram_handle} onChange={set('instagram_handle')} />
              </Field>
              <Field label="City" required error={errors.city}>
                <Input placeholder="e.g. Lagos" value={form.city} onChange={set('city')} error={errors.city} />
              </Field>
              <Field label="Country" required error={errors.country}>
                <Select value={form.country} onChange={set('country')} error={errors.country}>
                  <option value="">Select country…</option>
                  {ALL_COUNTRIES.map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </Select>
              </Field>
            </div>
          </SectionCard>

          {/* ── Section B: Artistic Discipline ── */}
          <SectionCard num="B" title="Artistic Discipline">
            <div className="flex flex-col gap-5">
              <Field label="Primary Discipline" required error={errors.primary_discipline}>
                <div className={`mt-1 ${errors.primary_discipline ? 'p-3 border border-red-300 rounded-xl' : ''}`}
                  data-error={errors.primary_discipline ? 'true' : undefined}>
                  <ToggleGroup
                    options={DISCIPLINE_OPTIONS}
                    value={form.primary_discipline}
                    onChange={(v) => {
                      setForm(f => ({ ...f, primary_discipline: v, custom_discipline: '', dance_style: '', poetry_style: '', instrument: '', vocal_type: '' }));
                      setErrors(e => { const n = { ...e }; delete n.primary_discipline; delete n.custom_discipline; return n; });
                    }}
                  />
                </div>
              </Field>

              {form.primary_discipline === 'others' && (
                <Field label="Your Discipline" required error={errors.custom_discipline}>
                  <Input
                    placeholder="e.g. Circus Arts, Puppetry…"
                    value={form.custom_discipline}
                    onChange={set('custom_discipline')}
                    error={errors.custom_discipline}
                  />
                </Field>
              )}

              {subField && (
                <Field label={subField.label} error={errors[subField.key]}>
                  <Select value={form[subField.key]} onChange={set(subField.key)} error={errors[subField.key]}>
                    <option value="">Select {subField.label.toLowerCase()}…</option>
                    {subField.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </Select>
                </Field>
              )}

              <Field label="Role (optional)" error={errors.role}>
                <Input placeholder="e.g. Performer, Choreographer, Composer…" value={form.role} onChange={set('role')} />
              </Field>
            </div>
          </SectionCard>

          {/* ── Section C: Portfolio / Work Sample ── */}
          <SectionCard num="C" title="Portfolio / Work Sample">
            <div className="flex flex-col gap-5">
              {/* Mode toggle */}
              <div className="flex gap-2">
                <button type="button" onClick={() => setWorkMode('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium border transition-all ${
                    workMode === 'url' ? 'text-white border-[#8D5D1D]' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                  style={workMode === 'url' ? { backgroundColor: GOLD } : {}}>
                  <Link2 size={14} /> External URL
                </button>
                <button type="button" onClick={() => setWorkMode('file')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium border transition-all ${
                    workMode === 'file' ? 'text-white border-[#8D5D1D]' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                  style={workMode === 'file' ? { backgroundColor: GOLD } : {}}>
                  <Upload size={14} /> Upload File
                </button>
              </div>

              {workMode === 'url' ? (
                <Field label="Link to Work (YouTube, Vimeo, Dropbox…)" required error={errors.work_external_url}>
                  <Input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={form.work_external_url}
                    onChange={set('work_external_url')}
                    error={errors.work_external_url}
                    data-error={errors.work_external_url ? 'true' : undefined}
                  />
                </Field>
              ) : (
                <Field label="Upload Work File (video / audio)" required error={errors.work_file}>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-[#8D5D1D] transition-colors ${
                      errors.work_file ? 'border-red-400' : 'border-gray-200'
                    }`}
                    data-error={errors.work_file ? 'true' : undefined}
                    onClick={() => workFileRef.current?.click()}>
                    {workFile ? (
                      <div>
                        <p className="text-[13px] font-semibold text-gray-700">{workFile.name}</p>
                        <p className="text-[12px] text-gray-400">{(workFile.size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={22} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-[13px] text-gray-500">Click to upload your work file</p>
                        <p className="text-[12px] text-gray-400 mt-0.5">Video, audio, or document</p>
                      </>
                    )}
                    <input ref={workFileRef} type="file" className="hidden" accept="video/*,audio/*"
                      onChange={onWorkFileChange} />
                  </div>
                </Field>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Work Title" required error={errors.work_title}>
                  <Input placeholder="e.g. Lagos Carnival 2025" value={form.work_title} onChange={set('work_title')} error={errors.work_title} />
                </Field>
                <Field label="Duration (seconds, optional)" error={errors.work_duration_seconds}>
                  <Input type="number" min="1" placeholder="e.g. 180" value={form.work_duration_seconds} onChange={set('work_duration_seconds')} />
                </Field>
              </div>
            </div>
          </SectionCard>

          {/* ── Section D: About You ── */}
          <SectionCard num="D" title="About You">
            <div className="flex flex-col gap-5">
              <Field label="Why do you want to join? (optional)" error={errors.why_join}>
                <Textarea
                  placeholder="Share what this opportunity means to you and what you hope to contribute…"
                  value={form.why_join}
                  onChange={set('why_join')}
                />
              </Field>

              <Field label="Have you attended this event before?" error={errors.attended_before}>
                <div className="mt-1">
                  <BoolToggle
                    value={form.attended_before}
                    onChange={(v) => setForm(f => ({ ...f, attended_before: v }))}
                    trueLabel="Yes"
                    falseLabel="No"
                  />
                </div>
              </Field>

              <Field label="Are you fully available for the entire programme?" error={errors.is_available}>
                <div className="mt-1">
                  <BoolToggle
                    value={form.is_available}
                    onChange={(v) => setForm(f => ({ ...f, is_available: v }))}
                    trueLabel="Yes, fully available"
                    falseLabel="Partially available"
                  />
                </div>
              </Field>

              {!form.is_available && (
                <Field label="Please specify your available dates" required error={errors.available_dates}>
                  <Textarea
                    placeholder="e.g. Available May 1–10 and May 20–31"
                    value={form.available_dates}
                    onChange={set('available_dates')}
                    error={errors.available_dates}
                    data-error={errors.available_dates ? 'true' : undefined}
                  />
                </Field>
              )}

              <Field label="Do you want to present your work at the event?" error={errors.wants_to_present}>
                <div className="mt-1">
                  <BoolToggle
                    value={form.wants_to_present}
                    onChange={(v) => setForm(f => ({ ...f, wants_to_present: v }))}
                    trueLabel="Yes"
                    falseLabel="No"
                  />
                </div>
              </Field>
            </div>
          </SectionCard>

          {/* ── Submit ── */}
          <div className="flex flex-col gap-4">
            {/* Consent notice */}
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-[#D4A84B]/30 bg-[#FFF8EC]">
              <div className="w-5 h-5 rounded-full bg-[#D4A84B] flex items-center justify-center shrink-0 mt-0.5">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <polyline points="1,4 4,7 9,1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="text-[13px] text-[#5C3D0E] leading-relaxed space-y-2">
                <p className="font-semibold">By submitting this application you confirm and consent to the following:</p>
                <ul className="list-disc list-inside space-y-1 text-[12.5px]">
                  <li>All information provided in this form is accurate and truthful.</li>
                  <li>Interflow will use your submitted details — including your name, contact information, discipline, and portfolio work — to <strong>create an artist profile on your behalf</strong> on the Interflow platform.</li>
                  <li>You will receive an activation email to set your password and gain full access to your new Interflow account.</li>
                  <li>Your profile may be visible to participating organisations on the platform in line with the opportunity you are applying for.</li>
                  <li>You agree to Interflow's terms and conditions and privacy policy.</li>
                </ul>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="self-start flex items-center gap-2.5 font-semibold text-[15px] text-white px-8 py-3.5 rounded-full transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: submitting ? '#7A5019' : GOLD }}
              onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = GOLD_DARK; }}
              onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = GOLD; }}>
              {submitting ? 'Submitting…' : 'Submit Application'}
              {!submitting && (
                <span className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.22)' }}>
                  <ArrowRight size={15} />
                </span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CallForArtistsPage;
