import React, { useState } from 'react';
import { X, Plus, ChevronDown, Search, SlidersHorizontal, ArrowRight, Check } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import { opportunitiesAPI } from '@/services/index';
import toast from 'react-hot-toast';

/* ────────────────────────────────────────────────────────────────
   CONSTANTS
──────────────────────────────────────────────────────────────────*/
const MOCK_OPPS = [
  { id: 1, initials: 'TID', color: '#1565C0', name: 'The Innovative Dancers', location: 'F.C.E college, Lagos, NIGERIA', type: 'Dance Group', tags: ['Dance', 'Dance Performance'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TID is a unique pre-professional dance group that combines performance with rig...' },
  { id: 2, initials: 'OPS', color: '#0D7377', name: 'Opera Studio', location: 'Navardy college, NY, U.S.A', type: 'Minnesota Orchestra', tags: ['Opera', 'Orchestra band'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TÓN is a unique pre-professional orchestra that combines performance with rig...' },
  { id: 3, initials: 'DDS', color: '#5C35A3', name: 'Dyno Dancers', location: 'Boardeaux, Paris, France', type: 'Paris Orchestra', tags: ['Dance', 'Dance Theatre'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TON is a unique pre-professional orchestra that combines performance with rig...' },
  { id: 4, initials: 'TID', color: '#1565C0', name: 'The Innovative Dancers', location: 'F.C.E college, Lagos, NIGERIA', type: 'Dance Group', tags: ['Dance', 'Dance Performance'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TID is a unique pre-professional dance group that combines performance with rig...' },
  { id: 5, initials: 'OPS', color: '#0D7377', name: 'Opera Studio', location: 'Navardy college, NY, U.S.A', type: 'Minnesota Orchestra', tags: ['Opera', 'Orchestra band'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TÓN is a unique pre-professional orchestra that combines performance with rig...' },
  { id: 6, initials: 'DDS', color: '#5C35A3', name: 'Dyno Dancers', location: 'Boardeaux, Paris, France', type: 'Paris Orchestra', tags: ['Dance', 'Dance Theatre'], posted: 'Posted 6 days ago', deadline: 'Deadline June 4', contract: 'Full time', desc: 'TON is a unique pre-professional orchestra that combines performance with rig...' },
];

const MOCK_APPLICANTS = [
  { id: 1, name: 'Divine Onyekara', role: 'Lead Dancer', date: 'May 20, 2025', status: 'Approved' },
  { id: 2, name: 'Amara Okafor', role: 'Choreographer', date: 'May 21, 2025', status: 'In view' },
  { id: 3, name: 'Chidi Nwosu', role: 'Backup Dancer', date: 'May 22, 2025', status: 'Closed' },
  { id: 4, name: 'Funke Adeyemi', role: 'Vocalist', date: 'May 23, 2025', status: 'Approved' },
  { id: 5, name: 'Tunde Bello', role: 'Drummer', date: 'May 24, 2025', status: 'In view' },
];

/* All categories exactly as defined in the backend OpportunityCategory TextChoices */
const OPPORTUNITY_CATEGORIES = [
  { label: 'Job',             value: 'job' },
  { label: 'Audition',        value: 'audition' },
  { label: 'Collaboration',   value: 'collaboration' },
  { label: 'Workshop',        value: 'workshop' },
  { label: 'Residency',       value: 'residency' },
  { label: 'Festival',        value: 'festival' },
  { label: 'Performance',     value: 'performance' },
  { label: 'Non-Performance', value: 'non_performance' },
  { label: 'Competition',     value: 'competition' },
  { label: 'Other',           value: 'other' },
];

const DISCIPLINE_OPTIONS = [
  { label: 'Dancer',                      value: 'dancer' },
  { label: 'Poet / Spoken Word Artist',   value: 'poet' },
  { label: 'Musician',                    value: 'musician' },
  { label: 'Singer / Vocalist',           value: 'singer' },
  { label: 'Theatre Performer / Actor',   value: 'theatre_performer' },
  { label: 'Performance Artist',          value: 'performance_artist' },
  { label: 'Storyteller',                 value: 'storyteller' },
  { label: 'Multidisciplinary Performer', value: 'multidisciplinary' },
];

const SKILLS_OPTIONS = [
  { label: 'Choreography',              value: 'choreography' },
  { label: 'Stage Presence',            value: 'stage_presence' },
  { label: 'Audience Engagement',       value: 'audience_engagement' },
  { label: 'Improvisation',             value: 'improvisation' },
  { label: 'Songwriting',               value: 'songwriting' },
  { label: 'Composition',               value: 'composition' },
  { label: 'Directing',                 value: 'directing' },
  { label: 'Writing',                   value: 'writing' },
  { label: 'Live Stage Performance',    value: 'live_stage' },
  { label: 'Collaborative Performance', value: 'collaborative_performance' },
  { label: 'Creative Direction',        value: 'creative_direction' },
  { label: 'Workshop Facilitation',     value: 'workshop_facilitation' },
];

const EXPERIENCE_OPTIONS = [
  { label: 'No minimum',  value: '' },
  { label: '0 – 1 year',  value: '0_1_year' },
  { label: '1 – 4 years', value: '1_4_years' },
  { label: '4 – 7 years', value: '4_7_years' },
  { label: '7+ years',    value: '7_plus_years' },
];

const SALARY_RANGE_OPTIONS = [
  { label: 'None',           value: '' },
  { label: '$0 – $50',       value: '0_50' },
  { label: '$50 – $100',     value: '50_100' },
  { label: '$100 – $500',    value: '100_500' },
  { label: '$500 – $1,000',  value: '500_1000' },
  { label: '$1,000+',        value: '1000_plus' },
];

const PAYMENT_TYPE_OPTIONS = [
  { label: 'Fixed',      value: 'fixed' },
  { label: 'Hourly',     value: 'hourly' },
  { label: 'Negotiable', value: 'negotiable' },
  { label: 'Volunteer',  value: 'volunteer' },
];

const CURRENCY_OPTIONS = ['NGN', 'USD', 'GBP', 'EUR', 'ZAR', 'GHS'];

/* Builds the application_form_schema array from form state */
const buildFormSchema = (form) => {
  const schema = [
    { key: 'city',    label: 'City',    type: 'select', required: true },
    { key: 'country', label: 'Country', type: 'select', required: true },
  ];

  if (form.requires_experience) {
    schema.push({
      key: 'experience', label: 'Experience', type: 'select', required: true,
      options: ['0 - 1 years', '1 - 4 years', '4 - 7 years', '7+ years'],
    });
  }

  if (form.salary_range) {
    schema.push({
      key: 'salary_range', label: 'Salary range', type: 'select', required: false,
      options: ['$0 - $50', '$50 - $100', '$100 - $500', '$500 - $1000', '$1000+'],
    });
  }

  if (form.requires_address) {
    schema.push({
      key: 'address', label: 'Address', type: 'text', required: false,
      placeholder: 'e.g No. 2, Kempton street, Orchid Estate, Ikoyi',
    });
  }

  if (form.requires_portfolio_link) {
    schema.push({
      key: 'portfolio_link', label: 'Interflow Portfolio link', type: 'url', required: false,
    });
  }

  return schema;
};

/* ────────────────────────────────────────────────────────────────
   SHARED COMPONENTS
──────────────────────────────────────────────────────────────────*/
const statusBadge = (status) => {
  if (status === 'Approved') return 'bg-green-100 text-green-700';
  if (status === 'In view')  return 'bg-amber-100 text-amber-700';
  if (status === 'Closed')   return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-600';
};

/* Small pill checkbox grid used inside the modal */
const PillCheckbox = ({ options, selected, onChange, columns = 2 }) => {
  const toggle = (val) =>
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map(({ label, value }) => {
        const active = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium border transition-all text-left ${
              active
                ? 'border-[#8D5D1D] bg-[#8D5D1D]/10 text-[#8D5D1D]'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-[#8D5D1D]/40'
            }`}
          >
            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${active ? 'bg-[#8D5D1D] border-[#8D5D1D]' : 'border-gray-300'}`}>
              {active && <Check size={9} strokeWidth={3} className="text-white" />}
            </div>
            {label}
          </button>
        );
      })}
    </div>
  );
};

/* Toggle switch */
const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0 ${checked ? 'bg-[#8D5D1D]' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
    <span className="text-[13px] text-gray-600">{label}</span>
  </label>
);

/* Shared field input/select styles */
const inputCls   = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 focus:border-[#8D5D1D]/50 placeholder:text-gray-300 bg-white';
const labelCls   = 'text-[11px] text-gray-500 font-medium mb-1 block';
const readonlyCls = 'bg-[#F7F4EE] rounded-xl px-3 py-2.5 text-[13px] text-gray-700 min-h-[38px] flex items-center';
const sectionCls = 'text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-1';

/* ────────────────────────────────────────────────────────────────
   VIEW OPPORTUNITY MODAL
──────────────────────────────────────────────────────────────────*/
const ViewOpportunityModal = ({ opp, onClose }) => {
  const [activeTab, setActiveTab]     = useState('Overview');
  const [mediaSubTab, setMediaSubTab] = useState('Photo');
  const tabs = ['Overview', 'Applicants', 'Media'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[760px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[18px] text-gray-900">View Opportunity Info</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-4">
          <div className="w-48 shrink-0">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white font-bold text-[16px] mb-3" style={{ backgroundColor: opp?.color || '#1565C0' }}>
                {opp?.initials || 'TID'}
              </div>
              <p className="font-bold text-gray-900 text-[13px] mb-0.5">Music Residency</p>
              <p className="text-[12px] text-gray-400 mb-4">Category: Performance</p>
              <nav className="flex flex-col gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-left text-[12px] font-medium px-3 py-2 rounded-lg border-l-2 transition-all ${
                      activeTab === tab
                        ? 'bg-[#8D5D1D]/10 border-[#8D5D1D] text-[#8D5D1D]'
                        : 'border-transparent text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {activeTab === 'Overview' && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Opportunity Title</label>
                    <div className={readonlyCls}>Music Residency Program</div>
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <div className={readonlyCls}>Performance</div>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <div className={`${readonlyCls} min-h-[70px] items-start pt-2.5`}>
                    A unique pre-professional residency combining performance with rigorous training.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Country</label><div className={readonlyCls}>Nigeria</div></div>
                  <div><label className={labelCls}>City</label><div className={readonlyCls}>Lagos</div></div>
                </div>
                <div><label className={labelCls}>Location</label><div className={readonlyCls}>F.C.E College, Lagos</div></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Close Date</label><div className={readonlyCls}>May 10, 2025</div></div>
                  <div><label className={labelCls}>Status</label><div className={readonlyCls}>Active</div></div>
                </div>
              </div>
            )}

            {activeTab === 'Applicants' && (
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-3">Applicants List</p>
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-[12px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2.5 text-left"><input type="checkbox" className="rounded" /></th>
                        <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Name</th>
                        <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Role</th>
                        <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Date received</th>
                        <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Status</th>
                        <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_APPLICANTS.map(a => (
                        <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2.5"><input type="checkbox" className="rounded" /></td>
                          <td className="px-3 py-2.5 font-medium text-gray-800">{a.name}</td>
                          <td className="px-3 py-2.5 text-gray-500">{a.role}</td>
                          <td className="px-3 py-2.5 text-gray-500">{a.date}</td>
                          <td className="px-3 py-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusBadge(a.status)}`}>{a.status}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <button className="text-gray-400 hover:text-gray-700 text-[16px] font-bold tracking-widest">···</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between mt-3 text-[12px] text-gray-500">
                  <span>Showing 1–5 of 5</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(p => (
                      <button key={p} className={`w-7 h-7 rounded-lg ${p === 1 ? 'bg-[#8D5D1D] text-white' : 'hover:bg-gray-100 text-gray-500'}`}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Media' && (
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-3">All Media</p>
                <div className="flex gap-2 mb-4">
                  {['Photo', 'Video', 'Documents'].map(t => (
                    <button
                      key={t}
                      onClick={() => setMediaSubTab(t)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                        mediaSubTab === t ? 'bg-[#8D5D1D] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="text-gray-300 text-[10px]">{mediaSubTab}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   CREATE OPPORTUNITY MODAL
──────────────────────────────────────────────────────────────────*/
const CreateOpportunityModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  /* ── Form state matching the Postman payload exactly ── */
  const [form, setForm] = useState({
    /* Step 1 — core details */
    category:              'performance',
    title:                 '',
    description:           '',
    country:               '',
    city:                  '',
    location:              '',
    opportunity_close_date: '',
    application_status:    'active',
    requirements:          '',
    is_remote:             false,
    start_date:            '',
    end_date:              '',

    /* Step 2 — artist requirements */
    disciplines:              [],
    skills_required:          [],
    requires_experience:      '',       // enum key e.g. '1_4_years'
    payment_type:             'fixed',
    budget:                   '',
    currency:                 'NGN',
    salary_range:             '',       // enum key e.g. '100_500'
    requires_address:         false,
    requires_portfolio_link:  false,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setE = (k) => (e) => set(k, e.target.value);

  const stepLabels = ['Details', 'Requirements', 'Preview & Post'];

  /* ── Stepper UI ── */
  const Stepper = () => (
    <div className="flex items-center gap-0 mb-6">
      {stepLabels.map((label, i) => {
        const num = i + 1;
        const isActive = step === num;
        const isDone   = step > num;
        return (
          <React.Fragment key={label}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors ${
                isDone || isActive ? 'bg-[#8D5D1D] text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? '✓' : num}
              </div>
              <span className={`text-[12px] font-medium ${isActive ? 'text-[#8D5D1D]' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < stepLabels.length - 1 && <div className="flex-1 mx-3 h-px bg-gray-200" />}
          </React.Fragment>
        );
      })}
    </div>
  );

  /* ── Shared select ── */
  const Select = ({ lbl, field, options, placeholder }) => (
    <div>
      {lbl && <label className={labelCls}>{lbl}</label>}
      <div className="relative">
        <select className={`${inputCls} appearance-none pr-8`} value={form[field]} onChange={setE(field)}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => (
            typeof o === 'string'
              ? <option key={o} value={o}>{o}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  /* ── Preview row ── */
  const PreviewRow = ({ label, value, wide = false }) => (
    <div className={wide ? 'col-span-2' : ''}>
      <label className={labelCls}>{label}</label>
      <div className={readonlyCls}>{value || <span className="text-gray-300">—</span>}</div>
    </div>
  );

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error('Opportunity title is required'); return; }
    if (!form.category)     { toast.error('Please select a category'); return; }

    setSubmitting(true);
    try {
      const payload = {
        category:                form.category,
        title:                   form.title,
        description:             form.description,
        country:                 form.country,
        city:                    form.city,
        location:                form.location,
        application_status:      form.application_status,
        requirements:            form.requirements || undefined,
        is_remote:               form.is_remote,
        disciplines:             form.disciplines,
        skills_required:         form.skills_required,
        payment_type:            form.payment_type,
        currency:                form.currency,
        requires_portfolio_link: form.requires_portfolio_link,
        requires_address:        form.requires_address,
        application_form_schema: buildFormSchema(form),
        /* optional fields — only include if filled */
        ...(form.opportunity_close_date && { opportunity_close_date: form.opportunity_close_date }),
        ...(form.start_date   && { start_date:         form.start_date }),
        ...(form.end_date     && { end_date:            form.end_date }),
        ...(form.budget       && { budget:              form.budget }),
        ...(form.requires_experience && { requires_experience: form.requires_experience }),
        ...(form.salary_range        && { salary_range:        form.salary_range }),
      };

      await opportunitiesAPI.create(payload);
      toast.success('Opportunity created!');
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[780px] p-6 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-[18px] text-gray-900">Create Opportunity</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>
        <p className="text-[12px] text-gray-400 mb-5">Fill in the details to post a new opportunity on Interflow</p>

        <Stepper />

        {/* ══════════════════════════════════════════════════════
            STEP 1 — Core Details
        ══════════════════════════════════════════════════════════*/}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            {/* Category */}
            <div>
              <p className={sectionCls}>Category</p>
              <div className="flex flex-wrap gap-2">
                {OPPORTUNITY_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => set('category', cat.value)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                      form.category === cat.value
                        ? 'bg-[#8D5D1D] text-white border-[#8D5D1D]'
                        : 'border-gray-200 text-gray-500 hover:border-[#8D5D1D]/40 bg-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className={labelCls}>Opportunity Title*</label>
              <input className={inputCls} placeholder="e.g. Lead Dancer for Afrobeats Showcase" value={form.title} onChange={setE('title')} />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={3} placeholder="Describe the opportunity, what you're looking for..." value={form.description} onChange={setE('description')} style={{ resize: 'vertical' }} />
            </div>

            {/* Requirements */}
            <div>
              <label className={labelCls}>Requirements</label>
              <textarea className={inputCls} rows={2} placeholder="e.g. Must be comfortable with live audiences of 500+" value={form.requirements} onChange={setE('requirements')} style={{ resize: 'vertical' }} />
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Country</label>
                <input className={inputCls} placeholder="e.g. Nigeria" value={form.country} onChange={setE('country')} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input className={inputCls} placeholder="e.g. Lagos" value={form.city} onChange={setE('city')} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Venue / Location</label>
              <input className={inputCls} placeholder="e.g. Terra Kulture, Victoria Island" value={form.location} onChange={setE('location')} />
            </div>

            {/* Remote toggle */}
            <Toggle checked={form.is_remote} onChange={v => set('is_remote', v)} label="This is a remote opportunity" />

            {/* Dates */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Start Date</label>
                <input type="date" className={inputCls} value={form.start_date} onChange={setE('start_date')} />
              </div>
              <div>
                <label className={labelCls}>End Date</label>
                <input type="date" className={inputCls} value={form.end_date} onChange={setE('end_date')} />
              </div>
              <div>
                <label className={labelCls}>Application Close Date</label>
                <input type="date" className={inputCls} value={form.opportunity_close_date} onChange={setE('opportunity_close_date')} />
              </div>
            </div>

            {/* Application Status */}
            <Select lbl="Application Status" field="application_status" options={[
              { label: 'Active', value: 'active' },
              { label: 'Draft',  value: 'draft' },
            ]} />

            <button
              onClick={() => setStep(2)}
              className="w-full h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold mt-1 hover:bg-[#7A5019] transition-colors flex items-center justify-center gap-2"
            >
              Continue to Requirements <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 2 — Artist Requirements
        ══════════════════════════════════════════════════════════*/}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <p className="text-[12px] text-gray-400">Define what you need from applicants and configure the application form.</p>

            {/* Disciplines */}
            <div>
              <p className={sectionCls}>Disciplines Required <span className="normal-case font-normal">(select all that apply)</span></p>
              <PillCheckbox options={DISCIPLINE_OPTIONS} selected={form.disciplines} onChange={v => set('disciplines', v)} columns={2} />
            </div>

            {/* Skills */}
            <div>
              <p className={sectionCls}>Skills Required <span className="normal-case font-normal">(select all that apply)</span></p>
              <PillCheckbox options={SKILLS_OPTIONS} selected={form.skills_required} onChange={v => set('skills_required', v)} columns={3} />
            </div>

            {/* Experience + Payment row */}
            <div className="grid grid-cols-2 gap-3">
              <Select lbl="Experience Required" field="requires_experience" options={EXPERIENCE_OPTIONS} placeholder="No minimum" />
              <Select lbl="Payment Type" field="payment_type" options={PAYMENT_TYPE_OPTIONS} />
            </div>

            {/* Budget + Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Budget</label>
                <input className={inputCls} type="number" min="0" step="0.01" placeholder="e.g. 250000.00" value={form.budget} onChange={setE('budget')} />
              </div>
              <Select lbl="Currency" field="currency" options={CURRENCY_OPTIONS} />
            </div>

            {/* Salary range */}
            <Select lbl="Salary Range (for display)" field="salary_range" options={SALARY_RANGE_OPTIONS} placeholder="None" />

            {/* Application form toggles */}
            <div>
              <p className={sectionCls}>Application Form Fields</p>
              <p className="text-[11.5px] text-gray-400 mb-3">City and Country are always included. Toggle the additional fields below.</p>
              <div className="flex flex-col gap-3">
                <Toggle
                  checked={form.requires_experience !== ''}
                  onChange={() => {}}
                  label="Require applicants to specify experience level"
                />
                <p className="text-[11px] text-gray-400 -mt-1 ml-[52px]">Controlled by the experience selection above — select any level to include this field.</p>
                <Toggle checked={form.requires_address}         onChange={v => set('requires_address', v)}         label="Require applicants to provide their address" />
                <Toggle checked={form.requires_portfolio_link}  onChange={v => set('requires_portfolio_link', v)}  label="Require applicants to submit their Interflow portfolio link" />
              </div>
            </div>

            {/* Application form preview */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Application Form Preview</p>
              <div className="flex flex-wrap gap-2">
                {buildFormSchema(form).map(field => (
                  <span key={field.key} className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${field.required ? 'bg-[#8D5D1D]/15 text-[#8D5D1D]' : 'bg-gray-200 text-gray-500'}`}>
                    {field.label}{field.required ? ' *' : ''}
                  </span>
                ))}
              </div>
              <p className="text-[10.5px] text-gray-400 mt-2">Gold = required · Grey = optional</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 h-11 rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button onClick={() => setStep(3)} className="flex-1 h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5019] transition-colors flex items-center justify-center gap-2">
                Preview <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            STEP 3 — Preview & Post
        ══════════════════════════════════════════════════════════*/}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-[12px] text-gray-400 mb-1">Review the details before posting your opportunity.</p>

            <div className="grid grid-cols-2 gap-3">
              <PreviewRow label="Category"    value={OPPORTUNITY_CATEGORIES.find(c => c.value === form.category)?.label} />
              <PreviewRow label="Status"      value={form.application_status === 'active' ? 'Active' : 'Draft'} />
            </div>
            <PreviewRow label="Title*" value={form.title} wide />
            <div className="col-span-2">
              <label className={labelCls}>Description</label>
              <div className={`${readonlyCls} min-h-[60px] items-start pt-2.5`}>{form.description || <span className="text-gray-300">—</span>}</div>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Requirements</label>
              <div className={`${readonlyCls} min-h-[44px] items-start pt-2.5`}>{form.requirements || <span className="text-gray-300">—</span>}</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <PreviewRow label="Country"  value={form.country} />
              <PreviewRow label="City"     value={form.city} />
              <PreviewRow label="Remote"   value={form.is_remote ? 'Yes' : 'No'} />
            </div>
            <PreviewRow label="Venue / Location" value={form.location} wide />

            <div className="grid grid-cols-3 gap-3">
              <PreviewRow label="Start Date"        value={form.start_date} />
              <PreviewRow label="End Date"          value={form.end_date} />
              <PreviewRow label="Application Close" value={form.opportunity_close_date} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <PreviewRow label="Payment Type"      value={PAYMENT_TYPE_OPTIONS.find(p => p.value === form.payment_type)?.label} />
              <PreviewRow label="Currency"          value={form.currency} />
            </div>
            {form.budget && (
              <div className="grid grid-cols-2 gap-3">
                <PreviewRow label="Budget" value={`${form.currency} ${Number(form.budget).toLocaleString()}`} />
                {form.salary_range && <PreviewRow label="Salary Range" value={SALARY_RANGE_OPTIONS.find(s => s.value === form.salary_range)?.label} />}
              </div>
            )}
            {form.requires_experience && (
              <PreviewRow label="Experience Required" value={EXPERIENCE_OPTIONS.find(e => e.value === form.requires_experience)?.label} />
            )}

            {form.disciplines.length > 0 && (
              <div>
                <label className={labelCls}>Disciplines</label>
                <div className="flex flex-wrap gap-2">
                  {form.disciplines.map(d => (
                    <span key={d} className="px-2.5 py-1 bg-[#8D5D1D]/10 text-[#8D5D1D] text-[11px] rounded-full font-medium">
                      {DISCIPLINE_OPTIONS.find(o => o.value === d)?.label || d}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {form.skills_required.length > 0 && (
              <div>
                <label className={labelCls}>Skills Required</label>
                <div className="flex flex-wrap gap-2">
                  {form.skills_required.map(s => (
                    <span key={s} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] rounded-full font-medium">
                      {SKILLS_OPTIONS.find(o => o.value === s)?.label || s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Application form schema preview */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Application Form Fields</p>
              <div className="flex flex-wrap gap-2">
                {buildFormSchema(form).map(field => (
                  <span key={field.key} className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${field.required ? 'bg-[#8D5D1D]/15 text-[#8D5D1D]' : 'bg-gray-200 text-gray-500'}`}>
                    {field.label}{field.required ? ' *' : ''}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-1">
              <button onClick={() => setStep(2)} className="flex-1 h-11 rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5019] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? 'Posting…' : <>Confirm & Post <ArrowRight size={14} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────────*/
const OrgOpportunitiesPage = () => {
  const [filterOpen,       setFilterOpen]       = useState(true);
  const [datePosted,       setDatePosted]       = useState('All Time');
  const [paymentFilter,    setPaymentFilter]    = useState('Full Time');
  const [deadline,         setDeadline]         = useState('Open');
  const [discipline,       setDiscipline]       = useState('Performance');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [sortOpen,         setSortOpen]         = useState(false);
  const [createModalOpen,  setCreateModalOpen]  = useState(false);
  const [viewOpp,          setViewOpp]          = useState(null);

  const RadioGroup = ({ label, options, value, onChange }) => (
    <div className="mb-5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex flex-col gap-1.5">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => onChange(opt)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                value === opt ? 'border-[#8D5D1D]' : 'border-gray-300'
              }`}
            >
              {value === opt && <div className="w-2 h-2 rounded-full bg-[#8D5D1D]" />}
            </div>
            <span className="text-[13px] text-gray-600">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="mb-5">
        <h1 className="font-[Montserrat,sans-serif] font-bold text-[22px] text-gray-900">Opportunities</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Create opportunities and manage applications on Interflow</p>
      </div>

      <div className="flex gap-5 items-start">
        {/* LEFT filter panel */}
        {filterOpen && (
          <div className="w-[260px] shrink-0 bg-white rounded-2xl p-5 shadow-sm">
            <p className="font-bold text-[14px] text-gray-900 mb-4">Filters</p>
            <RadioGroup label="Date Posted"   options={['All Time', 'Last 24 hours', 'Last 7 days', 'Last 30 days']} value={datePosted}    onChange={setDatePosted} />
            <RadioGroup label="Payment Type"  options={['Full Time', 'Per Time', 'Hybrid']}                          value={paymentFilter}  onChange={setPaymentFilter} />
            <RadioGroup label="Deadline"      options={['Open', 'Close']}                                            value={deadline}       onChange={setDeadline} />
            <RadioGroup label="Discipline"    options={['Performance', 'Non-Performance', 'Competition/Festival']}   value={discipline}     onChange={setDiscipline} />
            <button onClick={() => setFilterOpen(false)} className="text-[12px] font-medium text-[#8D5D1D] hover:underline mt-1">
              Collapse
            </button>
          </div>
        )}

        {/* RIGHT main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 max-w-[300px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search opportunities..."
                className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 placeholder:text-gray-300"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setSortOpen(s => !s)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-[13px] text-gray-600 hover:bg-gray-50"
              >
                <SlidersHorizontal size={13} /> Sort <ChevronDown size={13} />
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10 min-w-[140px]">
                  {['Newest', 'Oldest', 'Most Applications'].map(opt => (
                    <button key={opt} onClick={() => setSortOpen(false)} className="w-full text-left px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50">{opt}</button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8D5D1D] text-white rounded-full text-[13px] font-semibold hover:bg-[#7A5019] transition-colors ml-auto"
            >
              <Plus size={14} /> Create Opportunity
            </button>

            {!filterOpen && (
              <button onClick={() => setFilterOpen(true)} className="text-[12px] font-medium text-[#8D5D1D] hover:underline">
                Show Filters
              </button>
            )}
          </div>

          <p className="text-[14px] text-gray-400 mb-4">All Opportunities Posted</p>

          <div className="grid grid-cols-3 gap-4">
            {MOCK_OPPS.map(opp => (
              <div key={opp.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0" style={{ backgroundColor: opp.color }}>
                    {opp.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-[13px] text-gray-900 truncate">{opp.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{opp.location}</p>
                    <p className="text-[11px] text-gray-500">{opp.type}</p>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">{opp.posted} | {opp.deadline} | {opp.contract}</p>
                <p className="text-[12px] text-gray-500 line-clamp-2">{opp.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {opp.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-500 text-[11px] rounded-full px-2.5 py-1">{tag}</span>
                  ))}
                </div>
                <button
                  onClick={() => setViewOpp(opp)}
                  className="w-full h-10 rounded-full bg-[#8D5D1D] text-white text-[12px] font-semibold hover:bg-[#7A5019] transition-colors mt-auto"
                >
                  More Info
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {viewOpp          && <ViewOpportunityModal opp={viewOpp} onClose={() => setViewOpp(null)} />}
      {createModalOpen  && <CreateOpportunityModal onClose={() => setCreateModalOpen(false)} />}
    </DashboardLayout>
  );
};

export default OrgOpportunitiesPage;
