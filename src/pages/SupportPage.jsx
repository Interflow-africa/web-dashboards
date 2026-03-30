import React, { useState } from 'react';
import { Mail, AlertTriangle, MessageSquare } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'message', label: 'Send us a Message', Icon: Mail },
  { key: 'bug',     label: 'Report a bug',       Icon: AlertTriangle },
  { key: 'feedback',label: 'Submit feedback',     Icon: MessageSquare },
];

const INITIAL = { firstName: '', lastName: '', email: '', phone: '', body: '' };

const InputField = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
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

const FORM_CONFIG = {
  message: {
    title: 'Send us a Message',
    subtitle: 'A member of Team Stagetime will be in touch via email in 1-2 business days.',
    bodyLabel: 'Message',
    bodyPlaceholder: 'Write your message here…',
  },
  bug: {
    title: 'Report a bug',
    subtitle: 'Tell us about the issue. A member of Team Stagetime will be in touch via email in 1-2 business days.',
    bodyLabel: 'Tell us about the issue. What appears to be wrong?',
    bodyPlaceholder: 'Describe the bug in as much detail as possible…',
  },
  feedback: {
    title: 'Submit feedback',
    subtitle: 'We love hearing from you - submit feedback below.',
    bodyLabel: 'What suggestions do you have to improve your experience on Interflow?',
    bodyPlaceholder: 'Share your thoughts…',
  },
};

const SupportPage = () => {
  const [activeTab, setActiveTab] = useState('message');
  const [forms, setForms] = useState({ message: { ...INITIAL }, bug: { ...INITIAL }, feedback: { ...INITIAL } });

  const form = forms[activeTab];
  const setField = (field) => (e) =>
    setForms((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], [field]: e.target.value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Submitted successfully!');
    setForms((prev) => ({ ...prev, [activeTab]: { ...INITIAL } }));
  };

  const { title, subtitle, bodyLabel, bodyPlaceholder } = FORM_CONFIG[activeTab];

  return (
    <DashboardLayout>
      {/* ── Hero Banner ── */}
      <div
        className="relative w-full flex flex-col items-center justify-center text-center rounded-2xl overflow-hidden mb-6"
        style={{ minHeight: 180, background: 'linear-gradient(135deg, #5C3A0E 0%, #8D5D1D 60%, #B8892E 100%)' }}
      >
        <div className="absolute inset-0 bg-black/25" />
        <div className="relative z-10 flex flex-col items-center gap-2 px-6 py-8">
          <span className="text-4xl select-none" role="img" aria-label="support">⊕</span>
          <h1
            className="text-white font-bold text-[28px] leading-tight"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Support
          </h1>
          <p className="text-white/85 text-sm max-w-md">
            We're here to help! To be in touch with Team Stagetime,
          </p>
        </div>
      </div>

      {/* ── Quick Access ── */}
      <div className="mb-4">
        <h2
          className="font-bold text-[18px] text-gray-900 mb-1"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Quick Access
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          for quick access to our support, select from the options below.
        </p>

        <div className="flex gap-4 flex-wrap">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center justify-center gap-3 bg-white rounded-2xl p-6 cursor-pointer transition-all flex-1 min-w-[160px] text-center
                ${activeTab === key
                  ? 'border-2 border-[#8D5D1D] shadow-sm'
                  : 'border border-gray-200 hover:border-gray-300'
                }`}
            >
              <Icon
                size={22}
                className={activeTab === key ? 'text-[#8D5D1D]' : 'text-gray-500'}
              />
              <span
                className={`text-sm font-semibold ${activeTab === key ? 'text-[#8D5D1D]' : 'text-gray-700'}`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mt-4">
        <h3
          className="font-bold text-[17px] text-gray-900 mb-1"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-6">{subtitle}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Row 1: First / Last name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="First name"
              value={form.firstName}
              onChange={setField('firstName')}
              placeholder="e.g. Dayo"
            />
            <InputField
              label="Last name"
              value={form.lastName}
              onChange={setField('lastName')}
              placeholder="e.g. Ajayi"
            />
          </div>

          {/* Row 2: Email / Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Email"
              type="email"
              value={form.email}
              onChange={setField('email')}
              placeholder="you@example.com"
            />
            <InputField
              label="Phone number"
              type="tel"
              value={form.phone}
              onChange={setField('phone')}
              placeholder="+234 800 000 0000"
            />
          </div>

          {/* Textarea */}
          <div className="flex flex-col">
            <label className="text-[12px] text-[#888] mb-1">{bodyLabel}</label>
            <textarea
              rows={5}
              value={form.body}
              onChange={setField('body')}
              placeholder={bodyPlaceholder}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#8D5D1D] transition-colors resize-vertical"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: '#8D5D1D', fontFamily: 'Montserrat, sans-serif' }}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default SupportPage;
