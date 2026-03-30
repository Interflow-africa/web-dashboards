import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { orgAPI } from '@/services/index';

/* ─── Decorative ring SVG (top-right of content area) ─────────────── */
const RingDecoration = () => (
  <svg
    width="180"
    height="180"
    viewBox="0 0 180 180"
    fill="none"
    className="absolute top-0 right-0 pointer-events-none opacity-60"
    aria-hidden="true"
  >
    <circle cx="150" cy="30" r="80" stroke="#8D5D1D" strokeWidth="0.6" strokeDasharray="4 4" />
    <circle cx="150" cy="30" r="55" stroke="#8D5D1D" strokeWidth="0.5" strokeDasharray="3 6" />
    <circle cx="150" cy="30" r="30" stroke="#8D5D1D" strokeWidth="0.4" />
  </svg>
);

/* ─── Sidebar step definitions ─────────────────────────────────────── */
const SIDEBAR_STEPS = [
  { num: 1, label: 'Company Details' },
  { num: 2, label: 'Customize Portfolio' },
  { num: 3, label: 'Org. Verification' },
  { num: 4, label: 'Verification Status' },
];

/* ─── Sidebar ───────────────────────────────────────────────────────── */
const Sidebar = ({ activeStep }) => (
  <aside
    className="w-[230px] shrink-0 flex flex-col pt-8 pb-10 px-7"
    style={{ background: '#0D0D0D', minHeight: '100%' }}
  >
    {/* Logo */}
    <div className="mb-12">
      <img
        src="/assets/icons/interflow-logo.svg"
        alt="Interflow"
        style={{ height: 40, width: 'auto' }}
      />
    </div>

    {/* Steps */}
    <div className="flex flex-col gap-0">
      {SIDEBAR_STEPS.map((s, idx) => {
        const isDone   = activeStep > s.num || activeStep === 5;
        const isActive = activeStep === s.num;
        const isLast   = idx === SIDEBAR_STEPS.length - 1;

        return (
          <div key={s.num} className="flex items-start gap-3">
            {/* Circle + connector line column */}
            <div className="flex flex-col items-center" style={{ minWidth: 20 }}>
              {/* Circle */}
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 20,
                  height: 20,
                  background: isActive ? '#FFFFFF' : 'transparent',
                  border: isDone
                    ? '2px solid #8D5D1D'
                    : isActive
                    ? 'none'
                    : '2px solid rgba(255,255,255,0.3)',
                  color: isActive ? '#0D0D0D' : isDone ? '#8D5D1D' : 'rgba(255,255,255,0.4)',
                  fontSize: 9,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {isDone ? (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span style={{ fontSize: 8, fontWeight: 700 }}>
                    {String(s.num).padStart(2, '0')}
                  </span>
                )}
              </div>
              {/* Connector line */}
              {!isLast && (
                <div
                  className="w-px mt-1"
                  style={{
                    height: 36,
                    background: isDone ? '#8D5D1D' : 'rgba(255,255,255,0.12)',
                  }}
                />
              )}
            </div>

            {/* Label */}
            <p
              className="text-[12px] font-medium leading-5 mt-px"
              style={{
                color: isActive
                  ? '#FFFFFF'
                  : isDone
                  ? 'rgba(255,255,255,0.6)'
                  : 'rgba(255,255,255,0.3)',
                paddingBottom: isLast ? 0 : 28,
              }}
            >
              {s.label}
            </p>
          </div>
        );
      })}
    </div>
  </aside>
);

/* ─── Shared input styles ───────────────────────────────────────────── */
const inputCls =
  'w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[13.5px] text-[#1A1A1A] placeholder:text-[#BBBBBB] outline-none focus:border-[#8D5D1D] focus:ring-2 focus:ring-[#8D5D1D]/15 bg-white transition-all';
const labelCls = 'block text-[12px] font-semibold text-[#444] mb-1.5';
const selectCls =
  'w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[13.5px] text-[#1A1A1A] outline-none focus:border-[#8D5D1D] focus:ring-2 focus:ring-[#8D5D1D]/15 bg-white appearance-none cursor-pointer transition-all';

/* ─── Gold pill buttons ─────────────────────────────────────────────── */
const BtnGold = ({ children, onClick, disabled, type = 'button', fullWidth = true }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`${fullWidth ? 'w-full' : ''} h-[52px] rounded-full bg-[#8D5D1D] hover:bg-[#7a5018] text-white font-semibold text-[14px] transition-all disabled:opacity-50 disabled:cursor-not-allowed px-8`}
  >
    {children}
  </button>
);

const BtnOutlineGold = ({ children, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="h-[52px] rounded-full border-2 border-[#8D5D1D] text-[#8D5D1D] font-semibold text-[14px] hover:bg-[#8D5D1D]/8 transition-all disabled:opacity-50 px-8 w-full"
  >
    {children}
  </button>
);

/* ─── STEP 1 ─ Company Details ──────────────────────────────────────── */
const Step1 = ({ onNext }) => {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      organization_name: '',
      industry: '',
      country: '',
      city: '',
      province: '',
      phone_number: '',
      business_address: '',
      website: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const country = watch('country');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await orgAPI.step1(data);
      toast.success('Company details saved!');
      onNext();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to save details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="font-bold text-[22px] text-[#1A1A1A] font-['Montserrat'] mb-1">
        Welcome!, Get Started with Your Company
      </h2>
      <p className="text-[13px] text-[#888] mb-7 leading-relaxed">
        Start by providing key details about company to build a strong and credible profile
      </p>

      <div className="flex flex-col gap-4">
        {/* Organization name */}
        <div>
          <label className={labelCls}>Organization name *</label>
          <input
            className={inputCls}
            placeholder="e.g. Lagos Arts Council"
            {...register('organization_name', { required: true })}
          />
          {errors.organization_name && (
            <p className="text-red-500 text-[11px] mt-1">Organization name is required</p>
          )}
        </div>

        {/* Industry */}
        <div>
          <label className={labelCls}>Industry *</label>
          <div className="relative">
            <select className={selectCls} {...register('industry', { required: true })}>
              <option value="">Select industry</option>
              <option>Arts &amp; Entertainment</option>
              <option>Music</option>
              <option>Film &amp; Television</option>
              <option>Theatre</option>
              <option>Visual Arts</option>
              <option>Dance</option>
              <option>Fashion</option>
              <option>Media &amp; Publishing</option>
              <option>Education</option>
              <option>Other</option>
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1L7 7L13 1" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {errors.industry && <p className="text-red-500 text-[11px] mt-1">Industry is required</p>}
        </div>

        {/* Country */}
        <div>
          <label className={labelCls}>Country *</label>
          <div className="relative">
            <input
              className={inputCls + ' pr-10'}
              placeholder="Select country"
              {...register('country', { required: true })}
            />
            {country && (
              <button
                type="button"
                onClick={() => setValue('country', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAA] hover:text-[#555] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </button>
            )}
          </div>
          {errors.country && <p className="text-red-500 text-[11px] mt-1">Country is required</p>}
        </div>

        {/* City | Province */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>City</label>
            <div className="relative">
              <select className={selectCls} {...register('city')}>
                <option value="">Select city</option>
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Port Harcourt</option>
                <option>Ibadan</option>
                <option>Kano</option>
                <option>Enugu</option>
                <option>Other</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="7" viewBox="0 0 14 8" fill="none"><path d="M1 1L7 7L13 1" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
          <div>
            <label className={labelCls}>Province</label>
            <div className="relative">
              <select className={selectCls} {...register('province')}>
                <option value="">Select province</option>
                <option>Lagos State</option>
                <option>FCT</option>
                <option>Rivers</option>
                <option>Oyo</option>
                <option>Kano</option>
                <option>Enugu</option>
                <option>Other</option>
              </select>
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="7" viewBox="0 0 14 8" fill="none"><path d="M1 1L7 7L13 1" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        {/* Phone number */}
        <div>
          <label className={labelCls}>Organization phone number *</label>
          <div className="flex gap-0 rounded-xl overflow-hidden border border-[#E5E5E5] focus-within:border-[#8D5D1D] focus-within:ring-2 focus-within:ring-[#8D5D1D]/15 bg-white transition-all">
            <span className="flex items-center px-3.5 text-[13px] font-semibold text-[#555] bg-[#F8F8F7] border-r border-[#E5E5E5] shrink-0 whitespace-nowrap">
              NGA +234
            </span>
            <input
              type="tel"
              className="flex-1 px-4 py-3 text-[13.5px] text-[#1A1A1A] placeholder:text-[#BBBBBB] outline-none bg-transparent"
              placeholder="800 000 0000"
              {...register('phone_number', { required: true })}
            />
          </div>
          {errors.phone_number && <p className="text-red-500 text-[11px] mt-1">Phone number is required</p>}
        </div>

        {/* Business address */}
        <div>
          <label className={labelCls}>Business Address</label>
          <div className="relative">
            <select className={selectCls} {...register('business_address')}>
              <option value="">Select or type address</option>
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="8" viewBox="0 0 14 8" fill="none"><path d="M1 1L7 7L13 1" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        {/* Website */}
        <div>
          <label className={labelCls}>
            Website{' '}
            <span className="text-[#BBB] font-normal">(optional)</span>
          </label>
          <input
            className={inputCls}
            placeholder="https://yourcompany.com"
            {...register('website')}
          />
        </div>
      </div>

      <div className="mt-8">
        <BtnGold type="submit" disabled={loading}>
          {loading ? 'Saving…' : 'Next →'}
        </BtnGold>
      </div>
    </form>
  );
};

/* ─── STEP 2 ─ What do you want to do ──────────────────────────────── */
const GOALS = [
  { value: 'manage_profile',      label: 'Manage your company profile' },
  { value: 'post_jobs',           label: 'Post jobs, auditions, or opportunities' },
  { value: 'create_applications', label: 'Create applications with Interflow' },
  { value: 'scout_talent',        label: 'Search and Scout for Talents' },
];

const Step2 = ({ onNext, onBack }) => {
  const [selected, setSelected] = useState(GOALS.map(g => g.value));
  const [loading, setLoading]   = useState(false);

  const toggle = (val) =>
    setSelected(s => s.includes(val) ? s.filter(x => x !== val) : [...s, val]);

  const handleNext = async () => {
    if (!selected.length) { toast.error('Select at least one goal'); return; }
    setLoading(true);
    try {
      await orgAPI.step2({ goals: selected });
      toast.success('Goals saved!');
      onNext();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="font-bold text-[22px] text-[#1A1A1A] font-['Montserrat'] mb-1">
        What do you want to do with Interflow
      </h2>
      <p className="text-[13px] text-[#888] mb-7 leading-relaxed">
        Select all the features you would like to use on Interflow
      </p>

      <div className="flex flex-col gap-3 mb-8">
        {GOALS.map((g) => {
          const checked = selected.includes(g.value);
          return (
            <label
              key={g.value}
              className="flex items-center gap-4 px-5 py-4 rounded-xl cursor-pointer transition-all"
              style={{
                border: `1.5px solid ${checked ? '#E5E5E5' : '#E5E5E5'}`,
                borderRight: checked ? '3px solid #8D5D1D' : '1.5px solid #E5E5E5',
                background: '#FFFFFF',
              }}
            >
              {/* Custom checkbox */}
              <span
                className="flex items-center justify-center rounded shrink-0 transition-all"
                style={{
                  width: 18,
                  height: 18,
                  border: checked ? 'none' : '2px solid #D1D5DB',
                  background: checked ? '#2563EB' : 'transparent',
                }}
              >
                {checked && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(g.value)}
                className="sr-only"
              />
              <span className="text-[13.5px] font-medium text-[#1A1A1A]">{g.label}</span>
            </label>
          );
        })}
      </div>

      <BtnGold onClick={handleNext} disabled={loading}>
        {loading ? 'Saving…' : 'Next →'}
      </BtnGold>
    </div>
  );
};

/* ─── STEP 3 ─ Organization Verification ───────────────────────────── */
const Step3 = ({ onNext, onBack }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { business_email: '', social_media_link: '' },
  });
  const [logoFile, setLogoFile]     = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading]       = useState(false);

  const onDrop = useCallback((accepted) => {
    const file = accepted[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error('File too large (max 3MB)'); return; }
    setLogoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.svg', '.png', '.jpg', '.jpeg', '.gif'] },
    maxFiles: 1,
  });

  const onSubmit = async (data) => {
    if (!data.business_email) { toast.error('Business email is required'); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append('business_email', data.business_email);
    fd.append('social_media_link', data.social_media_link);
    if (logoFile) fd.append('logo', logoFile);
    try {
      await orgAPI.step3(fd);
      toast.success('Verification submitted!');
      onNext();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2 className="font-bold text-[22px] text-[#1A1A1A] font-['Montserrat'] mb-1">
        Organization Verification
      </h2>
      <p className="text-[13px] text-[#888] mb-7 leading-relaxed">
        Help us verify your organization to ensure a safe and trusted platform for all artists
      </p>

      <div className="flex flex-col gap-5">
        {/* Business email */}
        <div>
          <label className={labelCls}>Business Email *</label>
          <input
            className={inputCls}
            type="email"
            placeholder="official@organization.com"
            {...register('business_email', { required: true })}
          />
          {errors.business_email && <p className="text-red-500 text-[11px] mt-1">Business email is required</p>}
        </div>

        {/* Social media link */}
        <div>
          <label className={labelCls}>Any Active Social media link</label>
          <input
            className={inputCls}
            placeholder="https://instagram.com/yourorg"
            {...register('social_media_link')}
          />
        </div>

        {/* Logo upload */}
        <div>
          <label className={labelCls}>Upload organization Logo</label>
          <div
            {...getRootProps()}
            className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-8 px-6 cursor-pointer transition-colors"
            style={{
              borderColor: isDragActive ? '#8D5D1D' : '#D1D5DB',
              background: isDragActive ? '#FBF6EF' : '#FAFAFA',
            }}
          >
            <input {...getInputProps()} />
            {previewUrl ? (
              <img src={previewUrl} alt="Logo preview" className="h-16 w-16 object-contain rounded mb-2" />
            ) : (
              <svg className="mb-3 opacity-40" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8D5D1D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            )}
            <p className="text-[13px] text-[#666] font-medium text-center">
              {logoFile
                ? logoFile.name
                : isDragActive
                ? 'Drop the file here…'
                : 'Upload or drag and drop image'}
            </p>
            {!logoFile && (
              <p className="text-[11px] text-[#AAA] mt-1 text-center">
                SVG, PNG, JPG or GIF (max. 3MB)
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <BtnOutlineGold onClick={onBack} disabled={loading}>
          ← Back
        </BtnOutlineGold>
        <BtnGold type="submit" disabled={loading} fullWidth={false}>
          {loading ? 'Submitting…' : 'Next →'}
        </BtnGold>
      </div>
    </form>
  );
};

/* ─── STEP 4 ─ Verification Status ─────────────────────────────────── */
const Step4 = ({ onNext, onBack }) => (
  <div>
    <h2 className="font-bold text-[22px] text-[#1A1A1A] font-['Montserrat'] mb-1">
      Verification Status
    </h2>
    <p className="text-[13px] text-[#888] mb-7 leading-relaxed">
      Your submission has been received. Here's what happens next.
    </p>

    <div
      className="rounded-2xl flex flex-col items-center text-center px-8 py-10 mb-8"
      style={{ background: '#F0F7EE', border: '1.5px solid #C8E6C0' }}
    >
      {/* Stopwatch icon */}
      <div className="text-[40px] mb-4 leading-none" role="img" aria-label="Timer">
        ⏱
      </div>
      <p className="font-bold text-[15px] text-[#1A1A1A] font-['Montserrat'] mb-2">
        Verification will be completed in 1 hour Automatically
      </p>
      <p className="text-[13px] text-[#888]">Please be patient</p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <BtnOutlineGold onClick={() => {}}>Contact Support</BtnOutlineGold>
      <BtnGold onClick={onNext} fullWidth={false}>Next →</BtnGold>
    </div>
  </div>
);

/* ─── STEP 5 ─ Verification Successful ─────────────────────────────── */
const Step5 = () => {
  const navigate   = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDashboard = async () => {
    setLoading(true);
    try { await orgAPI.completeOnboarding(); } catch {}
    navigate('/org/dashboard');
  };

  return (
    <div className="flex flex-col items-center text-center py-4">
      {/* Large green check circle */}
      <div
        className="flex items-center justify-center rounded-full mb-8"
        style={{ width: 88, height: 88, background: '#16A34A' }}
      >
        <svg width="40" height="32" viewBox="0 0 40 32" fill="none">
          <path d="M4 16L14 26L36 4" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h2 className="font-bold text-[24px] text-[#1A1A1A] font-['Montserrat'] mb-3 leading-snug">
        Organization Verification Successful!
      </h2>
      <p className="text-[13.5px] text-[#888] mb-10 max-w-[380px] leading-relaxed">
        Your verification and registration has been successful and you can get started with Interflow
      </p>

      <div className="w-full max-w-[320px]">
        <BtnGold onClick={handleDashboard} disabled={loading}>
          {loading ? 'Loading…' : 'Go to Dashboard →'}
        </BtnGold>
      </div>
    </div>
  );
};

/* ─── Main OrgOnboarding ────────────────────────────────────────────── */
const OrgOnboarding = () => {
  const [step, setStep] = useState(1);

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => Math.max(1, s - 1));

  /* step 5 = success screen, no active sidebar step */
  const sidebarActive = step <= 4 ? step : 5;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F8F8F7' }}>
      {/* ── Top navbar ── */}
      <header
        className="w-full flex items-center px-8 border-b border-[#EBEBEB] shrink-0"
        style={{ height: 72, background: '#FFFFFF' }}
      >
        <img
          src="/assets/icons/interflow-logo.svg"
          alt="Interflow"
          style={{ height: 40, width: 'auto' }}
        />
      </header>

      {/* ── Body: sidebar + content ── */}
      <div className="flex flex-1 min-h-0">
        <Sidebar activeStep={sidebarActive} />

        {/* ── Content area ── */}
        <main className="flex-1 overflow-y-auto py-12 px-8 relative">
          <RingDecoration />

          <div
            className="relative mx-auto rounded-2xl shadow-md p-10 bg-white overflow-hidden"
            style={{ maxWidth: 640 }}
          >
            {step === 1 && <Step1 onNext={next} />}
            {step === 2 && <Step2 onNext={next} onBack={back} />}
            {step === 3 && <Step3 onNext={next} onBack={back} />}
            {step === 4 && <Step4 onNext={next} onBack={back} />}
            {step === 5 && <Step5 />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrgOnboarding;
