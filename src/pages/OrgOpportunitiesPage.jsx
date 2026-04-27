import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, ChevronDown, Search, SlidersHorizontal, ArrowRight, Check, Trash2, XCircle, Send } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import { opportunitiesAPI, applicationsAPI } from '@/services/index';
import toast from 'react-hot-toast';
import getApiError from '@/utils/apiError';

/* ────────────────────────────────────────────────────────────────
   CONSTANTS
──────────────────────────────────────────────────────────────────*/
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

const SORT_OPTIONS = [
  { label: 'Newest First',    value: '-created_at' },
  { label: 'Oldest First',    value: 'created_at' },
  { label: 'Deadline Soonest', value: 'opportunity_close_date' },
];

/* Category → accent color */
const CATEGORY_COLOR = {
  job:             '#1565C0',
  audition:        '#0D7377',
  collaboration:   '#5C35A3',
  workshop:        '#B45309',
  residency:       '#065F46',
  festival:        '#9D174D',
  performance:     '#1565C0',
  non_performance: '#374151',
  competition:     '#7C3AED',
  other:           '#6B7280',
};

/* Application status colors (for applicant table) */
const APP_STATUS_BADGE = {
  pending:      'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  shortlisted:  'bg-purple-100 text-purple-700',
  accepted:     'bg-green-100 text-green-700',
  rejected:     'bg-red-100 text-red-700',
  withdrawn:    'bg-gray-100 text-gray-500',
};

/* Opportunity status badge */
const OPP_STATUS_BADGE = {
  active:    'bg-green-100 text-green-700',
  draft:     'bg-amber-100 text-amber-700',
  closed:    'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600',
};

/* ── Helpers ── */
const getInitials = (title = '') =>
  title.split(' ').slice(0, 3).map(w => w[0] ?? '').join('').toUpperCase() || '??';

const relativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const fmtDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const buildFormSchema = (form) => {
  const schema = [
    { key: 'city',    label: 'City',    type: 'select', required: true },
    { key: 'country', label: 'Country', type: 'select', required: true },
  ];
  if (form.requires_experience)
    schema.push({ key: 'experience', label: 'Experience', type: 'select', required: true,
      options: ['0 - 1 years', '1 - 4 years', '4 - 7 years', '7+ years'] });
  if (form.salary_range)
    schema.push({ key: 'salary_range', label: 'Salary range', type: 'select', required: false,
      options: ['$0 - $50', '$50 - $100', '$100 - $500', '$500 - $1000', '$1000+'] });
  if (form.requires_address)
    schema.push({ key: 'address', label: 'Address', type: 'text', required: false,
      placeholder: 'e.g No. 2, Kempton street, Orchid Estate, Ikoyi' });
  if (form.requires_portfolio_link)
    schema.push({ key: 'portfolio_link', label: 'Interflow Portfolio link', type: 'url', required: false });
  return schema;
};

/* ────────────────────────────────────────────────────────────────
   SHARED UI COMPONENTS
──────────────────────────────────────────────────────────────────*/
const inputCls    = 'w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 focus:border-[#8D5D1D]/50 placeholder:text-gray-300 bg-white';
const labelCls    = 'text-[11px] text-gray-500 font-medium mb-1 block';
const readonlyCls = 'bg-[#F7F4EE] rounded-xl px-3 py-2.5 text-[13px] text-gray-700 min-h-[38px] flex items-center';
const sectionCls  = 'text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 mt-1';

const PillCheckbox = ({ options, selected, onChange, columns = 2 }) => {
  const toggle = (val) =>
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {options.map(({ label, value }) => {
        const active = selected.includes(value);
        return (
          <button key={value} type="button" onClick={() => toggle(value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium border transition-all text-left ${
              active ? 'border-[#8D5D1D] bg-[#8D5D1D]/10 text-[#8D5D1D]'
                     : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-[#8D5D1D]/40'}`}>
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

const Toggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer shrink-0 ${checked ? 'bg-[#8D5D1D]' : 'bg-gray-200'}`}>
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
    <span className="text-[13px] text-gray-600">{label}</span>
  </label>
);

/* ────────────────────────────────────────────────────────────────
   VIEW OPPORTUNITY MODAL  (real data)
──────────────────────────────────────────────────────────────────*/
const ViewOpportunityModal = ({ opp: initialOpp, onClose, onRefresh }) => {
  const [activeTab, setActiveTab]           = useState('Overview');
  const [opp, setOpp]                       = useState(initialOpp);
  const [detailLoading, setDetailLoading]   = useState(true);
  const [applicants, setApplicants]         = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(true);
  const [acting, setActing]                 = useState(false);

  const tabs = ['Overview', 'Applicants'];

  /* Fetch full opportunity detail + applications in parallel on open */
  useEffect(() => {
    setDetailLoading(true);
    setApplicantsLoading(true);

    opportunitiesAPI.detail(initialOpp.id)
      .then(r => {
        console.log('response: ', r);
        
        setOpp(r.data.data)})
      .catch(() => toast.error('Could not load opportunity details'))
      .finally(() => setDetailLoading(false));

    applicationsAPI.orgByOpportunity(initialOpp.id)
      .then(r => setApplicants(r.data.results || r.data.data || []))
      .catch(() => toast.error('Could not load applicants'))
      .finally(() => setApplicantsLoading(false));
  }, [initialOpp.id]);

  const doAction = async (action, label) => {
    if (!window.confirm(`${label} this opportunity?`)) return;
    setActing(true);
    try {
      await action();
      toast.success(`Opportunity ${label.toLowerCase()}d`);
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(getApiError(err, `Failed to ${label.toLowerCase()}`));
    } finally {
      setActing(false);
    }
  };

  const color    = CATEGORY_COLOR[opp.category] || '#6B7280';
  const initials = getInitials(opp.title);
  const catLabel = OPPORTUNITY_CATEGORIES.find(c => c.value === opp.category)?.label || opp.category;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[760px] p-5 sm:p-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[18px] text-gray-900">Opportunity Details</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* ── Left nav panel ── */}
          <div className="w-full sm:w-48 sm:shrink-0">
            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white font-bold text-[15px] mb-3"
                style={{ backgroundColor: color }}>
                {initials}
              </div>
              <p className="font-bold text-gray-900 text-[13px] mb-0.5 leading-snug">{opp.title}</p>
              <p className="text-[11px] text-gray-400 mb-1">Category: {catLabel}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-4 ${OPP_STATUS_BADGE[opp.application_status] || 'bg-gray-100 text-gray-500'}`}>
                {opp.application_status}
              </span>
              <nav className="flex flex-col gap-1">
                {tabs.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`text-left text-[12px] font-medium px-3 py-2 rounded-lg border-l-2 transition-all ${
                      activeTab === tab
                        ? 'bg-[#8D5D1D]/10 border-[#8D5D1D] text-[#8D5D1D]'
                        : 'border-transparent text-gray-500 hover:bg-gray-50'}`}>
                    {tab}
                  </button>
                ))}
              </nav>

              {/* Quick actions */}
              <div className="mt-4 flex flex-col gap-2">
                {opp.application_status === 'draft' && (
                  <button disabled={acting}
                    onClick={() => doAction(() => opportunitiesAPI.publish(opp.id), 'Publish')}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
                    <Send size={11} /> Publish
                  </button>
                )}
                {opp.application_status === 'active' && (
                  <button disabled={acting}
                    onClick={() => doAction(() => opportunitiesAPI.close(opp.id), 'Close')}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
                    <XCircle size={11} /> Close
                  </button>
                )}
                <button disabled={acting}
                  onClick={() => doAction(() => opportunitiesAPI.delete(opp.id), 'Delete')}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50">
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {activeTab === 'Overview' && detailLoading ? (
              <div className="py-10 text-center text-[13px] text-gray-400">Loading details…</div>
            ) : activeTab === 'Overview' && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Opportunity Title</label>
                    <div className={readonlyCls}>{opp.title}</div>
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <div className={readonlyCls}>{catLabel}</div>
                  </div>
                </div>
                {opp.description && (
                  <div>
                    <label className={labelCls}>Description</label>
                    <div className={`${readonlyCls} min-h-[64px] items-start pt-2.5 whitespace-pre-wrap`}>{opp.description}</div>
                  </div>
                )}
                {opp.requirements && (
                  <div>
                    <label className={labelCls}>Requirements</label>
                    <div className={`${readonlyCls} min-h-[48px] items-start pt-2.5 whitespace-pre-wrap`}>{opp.requirements}</div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Country</label><div className={readonlyCls}>{opp.country || '—'}</div></div>
                  <div><label className={labelCls}>City</label><div className={readonlyCls}>{opp.city || '—'}</div></div>
                </div>
                {opp.location && (
                  <div><label className={labelCls}>Venue / Location</label><div className={readonlyCls}>{opp.location}</div></div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={labelCls}>Start Date</label><div className={readonlyCls}>{fmtDate(opp.start_date)}</div></div>
                  <div><label className={labelCls}>End Date</label><div className={readonlyCls}>{fmtDate(opp.end_date)}</div></div>
                  <div><label className={labelCls}>Close Date</label><div className={readonlyCls}>{fmtDate(opp.opportunity_close_date)}</div></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={labelCls}>Payment Type</label><div className={readonlyCls}>{opp.payment_type || '—'}</div></div>
                  <div><label className={labelCls}>Currency</label><div className={readonlyCls}>{opp.currency || '—'}</div></div>
                  <div><label className={labelCls}>Budget</label><div className={readonlyCls}>{opp.budget ? Number(opp.budget).toLocaleString() : '—'}</div></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Remote</label><div className={readonlyCls}>{opp.is_remote ? 'Yes' : 'No'}</div></div>
                  <div><label className={labelCls}>Experience Required</label><div className={readonlyCls}>{EXPERIENCE_OPTIONS.find(e => e.value === opp.requires_experience)?.label || 'No minimum'}</div></div>
                </div>
                {opp.disciplines?.length > 0 && (
                  <div>
                    <label className={labelCls}>Disciplines</label>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.disciplines.map(d => (
                        <span key={d} className="px-2.5 py-1 bg-[#8D5D1D]/10 text-[#8D5D1D] text-[11px] rounded-full font-medium">
                          {DISCIPLINE_OPTIONS.find(o => o.value === d)?.label || d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {opp.skills_required?.length > 0 && (
                  <div>
                    <label className={labelCls}>Skills Required</label>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.skills_required.map(s => (
                        <span key={s} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] rounded-full font-medium">
                          {SKILLS_OPTIONS.find(o => o.value === s)?.label || s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Applicants' && (
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-3">
                  Applicants {applicants.length > 0 && <span className="text-gray-400 font-normal">({applicants.length})</span>}
                </p>
                {applicantsLoading ? (
                  <div className="py-10 text-center text-[13px] text-gray-400">Loading applicants…</div>
                ) : applicants.length === 0 ? (
                  <div className="py-10 text-center text-[13px] text-gray-400">No applicants yet.</div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-[12px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Name</th>
                          <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Applied</th>
                          <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {applicants.map(a => {
                          const name = a.applicant?.display_name || a.applicant?.email || `Applicant #${a.id}`;
                          return (
                            <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-3 py-2.5 font-medium text-gray-800">{name}</td>
                              <td className="px-3 py-2.5 text-gray-500">{fmtDate(a.created_at)}</td>
                              <td className="px-3 py-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${APP_STATUS_BADGE[a.status] || 'bg-gray-100 text-gray-600'}`}>
                                  {a.status_display || a.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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
const CreateOpportunityModal = ({ onClose, onCreated }) => {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    category:               'performance',
    title:                  '',
    description:            '',
    country:                '',
    city:                   '',
    location:               '',
    opportunity_close_date: '',
    application_status:     'active',
    requirements:           '',
    is_remote:              false,
    start_date:             '',
    end_date:               '',
    disciplines:            [],
    skills_required:        [],
    requires_experience:    '',
    payment_type:           'fixed',
    budget:                 '',
    currency:               'NGN',
    salary_range:           '',
    requires_address:       false,
    requires_portfolio_link: false,
  });

  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setE = (k) => (e) => set(k, e.target.value);

  const stepLabels = ['Details', 'Requirements', 'Preview & Post'];

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
                isDone || isActive ? 'bg-[#8D5D1D] text-white' : 'bg-gray-100 text-gray-400'}`}>
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

  const Select = ({ lbl, field, options, placeholder }) => (
    <div>
      {lbl && <label className={labelCls}>{lbl}</label>}
      <div className="relative">
        <select className={`${inputCls} appearance-none pr-8`} value={form[field]} onChange={setE(field)}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o =>
            typeof o === 'string'
              ? <option key={o} value={o}>{o}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  const PreviewRow = ({ label, value, wide = false }) => (
    <div className={wide ? 'col-span-2' : ''}>
      <label className={labelCls}>{label}</label>
      <div className={readonlyCls}>{value || <span className="text-gray-300">—</span>}</div>
    </div>
  );

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
        ...(form.opportunity_close_date && { opportunity_close_date: form.opportunity_close_date }),
        ...(form.start_date            && { start_date:              form.start_date }),
        ...(form.end_date              && { end_date:                form.end_date }),
        ...(form.budget                && { budget:                  form.budget }),
        ...(form.requires_experience   && { requires_experience:     form.requires_experience }),
        ...(form.salary_range          && { salary_range:            form.salary_range }),
      };
      await opportunitiesAPI.create(payload, form.application_status === 'active');
      toast.success('Opportunity created!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to create opportunity'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[780px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-[18px] text-gray-900">Create Opportunity</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>
        <p className="text-[12px] text-gray-400 mb-5">Fill in the details to post a new opportunity on Interflow</p>
        <Stepper />

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <p className={sectionCls}>Category</p>
              <div className="flex flex-wrap gap-2">
                {OPPORTUNITY_CATEGORIES.map(cat => (
                  <button key={cat.value} type="button" onClick={() => set('category', cat.value)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                      form.category === cat.value
                        ? 'bg-[#8D5D1D] text-white border-[#8D5D1D]'
                        : 'border-gray-200 text-gray-500 hover:border-[#8D5D1D]/40 bg-white'}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Opportunity Title*</label>
              <input className={inputCls} placeholder="e.g. Lead Dancer for Afrobeats Showcase" value={form.title} onChange={setE('title')} />
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={3} placeholder="Describe the opportunity…" value={form.description} onChange={setE('description')} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label className={labelCls}>Requirements</label>
              <textarea className={inputCls} rows={2} placeholder="e.g. Must be comfortable with live audiences of 500+" value={form.requirements} onChange={setE('requirements')} style={{ resize: 'vertical' }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Country</label><input className={inputCls} placeholder="e.g. Nigeria" value={form.country} onChange={setE('country')} /></div>
              <div><label className={labelCls}>City</label><input className={inputCls} placeholder="e.g. Lagos" value={form.city} onChange={setE('city')} /></div>
            </div>
            <div>
              <label className={labelCls}>Venue / Location</label>
              <input className={inputCls} placeholder="e.g. Terra Kulture, Victoria Island" value={form.location} onChange={setE('location')} />
            </div>
            <Toggle checked={form.is_remote} onChange={v => set('is_remote', v)} label="This is a remote opportunity" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label className={labelCls}>Start Date</label><input type="date" className={inputCls} value={form.start_date} onChange={setE('start_date')} /></div>
              <div><label className={labelCls}>End Date</label><input type="date" className={inputCls} value={form.end_date} onChange={setE('end_date')} /></div>
              <div><label className={labelCls}>Application Close Date</label><input type="date" className={inputCls} value={form.opportunity_close_date} onChange={setE('opportunity_close_date')} /></div>
            </div>
            <Select lbl="Application Status" field="application_status" options={[
              { label: 'Active', value: 'active' },
              { label: 'Draft',  value: 'draft' },
            ]} />
            <button onClick={() => setStep(2)}
              className="w-full h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold mt-1 hover:bg-[#7A5019] transition-colors flex items-center justify-center gap-2">
              Continue to Requirements <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <p className="text-[12px] text-gray-400">Define what you need from applicants and configure the application form.</p>
            <div>
              <p className={sectionCls}>Disciplines Required <span className="normal-case font-normal">(select all that apply)</span></p>
              <PillCheckbox options={DISCIPLINE_OPTIONS} selected={form.disciplines} onChange={v => set('disciplines', v)} columns={2} />
            </div>
            <div>
              <p className={sectionCls}>Skills Required <span className="normal-case font-normal">(select all that apply)</span></p>
              <PillCheckbox options={SKILLS_OPTIONS} selected={form.skills_required} onChange={v => set('skills_required', v)} columns={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select lbl="Experience Required" field="requires_experience" options={EXPERIENCE_OPTIONS} placeholder="No minimum" />
              <Select lbl="Payment Type" field="payment_type" options={PAYMENT_TYPE_OPTIONS} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Budget</label>
                <input className={inputCls} type="number" min="0" step="0.01" placeholder="e.g. 250000.00" value={form.budget} onChange={setE('budget')} />
              </div>
              <Select lbl="Currency" field="currency" options={CURRENCY_OPTIONS} />
            </div>
            <Select lbl="Salary Range (for display)" field="salary_range" options={SALARY_RANGE_OPTIONS} placeholder="None" />
            <div>
              <p className={sectionCls}>Application Form Fields</p>
              <p className="text-[11.5px] text-gray-400 mb-3">City and Country are always included. Toggle the additional fields below.</p>
              <div className="flex flex-col gap-3">
                <Toggle checked={form.requires_experience !== ''} onChange={() => {}} label="Require applicants to specify experience level" />
                <p className="text-[11px] text-gray-400 -mt-1 ml-[52px]">Controlled by the experience selection above.</p>
                <Toggle checked={form.requires_address}        onChange={v => set('requires_address', v)}        label="Require applicants to provide their address" />
                <Toggle checked={form.requires_portfolio_link} onChange={v => set('requires_portfolio_link', v)} label="Require applicants to submit their Interflow portfolio link" />
              </div>
            </div>
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
              <button onClick={() => setStep(1)} className="flex-1 h-11 rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5019] transition-colors flex items-center justify-center gap-2">
                Preview <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <p className="text-[12px] text-gray-400 mb-1">Review the details before posting your opportunity.</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Category</label><div className={readonlyCls}>{OPPORTUNITY_CATEGORIES.find(c => c.value === form.category)?.label}</div></div>
              <div><label className={labelCls}>Status</label><div className={readonlyCls}>{form.application_status === 'active' ? 'Active' : 'Draft'}</div></div>
            </div>
            <div><label className={labelCls}>Title*</label><div className={readonlyCls}>{form.title || <span className="text-gray-300">—</span>}</div></div>
            <div><label className={labelCls}>Description</label><div className={`${readonlyCls} min-h-[60px] items-start pt-2.5`}>{form.description || <span className="text-gray-300">—</span>}</div></div>
            <div><label className={labelCls}>Requirements</label><div className={`${readonlyCls} min-h-[44px] items-start pt-2.5`}>{form.requirements || <span className="text-gray-300">—</span>}</div></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label className={labelCls}>Country</label><div className={readonlyCls}>{form.country || '—'}</div></div>
              <div><label className={labelCls}>City</label><div className={readonlyCls}>{form.city || '—'}</div></div>
              <div><label className={labelCls}>Remote</label><div className={readonlyCls}>{form.is_remote ? 'Yes' : 'No'}</div></div>
            </div>
            <div><label className={labelCls}>Venue / Location</label><div className={readonlyCls}>{form.location || '—'}</div></div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><label className={labelCls}>Start Date</label><div className={readonlyCls}>{form.start_date || '—'}</div></div>
              <div><label className={labelCls}>End Date</label><div className={readonlyCls}>{form.end_date || '—'}</div></div>
              <div><label className={labelCls}>Application Close</label><div className={readonlyCls}>{form.opportunity_close_date || '—'}</div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Payment Type</label><div className={readonlyCls}>{PAYMENT_TYPE_OPTIONS.find(p => p.value === form.payment_type)?.label}</div></div>
              <div><label className={labelCls}>Currency</label><div className={readonlyCls}>{form.currency}</div></div>
            </div>
            {form.budget && (
              <div><label className={labelCls}>Budget</label><div className={readonlyCls}>{form.currency} {Number(form.budget).toLocaleString()}</div></div>
            )}
            {form.disciplines.length > 0 && (
              <div>
                <label className={labelCls}>Disciplines</label>
                <div className="flex flex-wrap gap-1.5">
                  {form.disciplines.map(d => <span key={d} className="px-2.5 py-1 bg-[#8D5D1D]/10 text-[#8D5D1D] text-[11px] rounded-full font-medium">{DISCIPLINE_OPTIONS.find(o => o.value === d)?.label || d}</span>)}
                </div>
              </div>
            )}
            {form.skills_required.length > 0 && (
              <div>
                <label className={labelCls}>Skills Required</label>
                <div className="flex flex-wrap gap-1.5">
                  {form.skills_required.map(s => <span key={s} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] rounded-full font-medium">{SKILLS_OPTIONS.find(o => o.value === s)?.label || s}</span>)}
                </div>
              </div>
            )}
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
              <button onClick={() => setStep(2)} className="flex-1 h-11 rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">Back</button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5019] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting ? 'Posting…' : <> Confirm & Post <ArrowRight size={14} /></>}
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
  /* ── Data ── */
  const [opps, setOpps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);

  /* ── Filters & search ── */
  const [filterOpen,      setFilterOpen]      = useState(true);
  const [search,          setSearch]          = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCategory,  setFilterCategory]  = useState('');
  const [filterStatus,    setFilterStatus]    = useState('');
  const [filterPayment,   setFilterPayment]   = useState('');
  const [filterRemote,    setFilterRemote]    = useState('');
  {/* const [sortBy,          setSortBy]          = useState('-created_at'); */}
  const [sortBy,          setSortBy]          = useState('');
  const [sortOpen,        setSortOpen]        = useState(false);

  /* ── Modals ── */
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewOpp,         setViewOpp]         = useState(null);

  /* ── Debounce search input ── */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ── Fetch opportunities ── */
  const loadOpps = useCallback(() => {
    setLoading(true);
    const params = { status: 'published' };
    if (debouncedSearch) params.search            = debouncedSearch;
    if (filterCategory)  params.category          = filterCategory;
    if (filterStatus)    params.application_status = filterStatus;
    if (filterPayment)   params.payment_type       = filterPayment;
    if (filterRemote)    params.is_remote          = filterRemote;

    opportunitiesAPI.manage(params)
      .then(r => {
        const d = r.data;
        setOpps(d.results || d.data || []);
        setTotal(d.count ?? (d.results ?? d.data ?? []).length);
      })
      .catch(() => toast.error('Failed to load opportunities'))
      .finally(() => setLoading(false));
  }, [debouncedSearch, filterCategory, filterStatus, filterPayment, filterRemote, sortBy]);

  useEffect(() => { loadOpps(); }, [loadOpps]);

  /* ── Helpers ── */
  const clearFilters = () => {
    setFilterCategory('');
    setFilterStatus('');
    setFilterPayment('');
    setFilterRemote('');
    setSearch('');
  };
  const hasFilters = filterCategory || filterStatus || filterPayment || filterRemote || debouncedSearch;

  /* ── Filter sidebar radio group ── */
  const RadioGroup = ({ label, options, value, onChange }) => (
    <div className="mb-5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex flex-col gap-1.5">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <div onClick={() => onChange(value === opt.value ? '' : opt.value)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                value === opt.value ? 'border-[#8D5D1D]' : 'border-gray-300'}`}>
              {value === opt.value && <div className="w-2 h-2 rounded-full bg-[#8D5D1D]" />}
            </div>
            <span className="text-[13px] text-gray-600">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="mb-5">
        <h1 className="font-bold text-[22px] text-gray-900">Opportunities</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Create opportunities and manage applications on Interflow</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ── Filter sidebar ── */}
        {filterOpen && (
          <div className="w-full lg:w-[240px] lg:shrink-0 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-[14px] text-gray-900">Filters</p>
              {hasFilters && (
                <button onClick={clearFilters} className="text-[11px] text-[#8D5D1D] hover:underline font-medium">
                  Clear all
                </button>
              )}
            </div>

            <RadioGroup
              label="Status"
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { label: 'Active',    value: 'active' },
                { label: 'Draft',     value: 'draft' },
                { label: 'Closed',    value: 'closed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
            />

            <RadioGroup
              label="Category"
              value={filterCategory}
              onChange={setFilterCategory}
              options={OPPORTUNITY_CATEGORIES}
            />

            <RadioGroup
              label="Payment Type"
              value={filterPayment}
              onChange={setFilterPayment}
              options={PAYMENT_TYPE_OPTIONS}
            />

            <RadioGroup
              label="Location"
              value={filterRemote}
              onChange={setFilterRemote}
              options={[
                { label: 'Remote',  value: 'true' },
                { label: 'On-site', value: 'false' },
              ]}
            />

            <button onClick={() => setFilterOpen(false)}
              className="text-[12px] font-medium text-[#8D5D1D] hover:underline mt-1">
              Collapse
            </button>
          </div>
        )}

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {!filterOpen && (
              <button onClick={() => setFilterOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-gray-200 rounded-full text-[13px] text-gray-600 hover:bg-gray-50">
                <SlidersHorizontal size={13} /> Filters
                {hasFilters && <span className="w-4 h-4 bg-[#8D5D1D] rounded-full text-white text-[9px] flex items-center justify-center font-bold">!</span>}
              </button>
            )}

            <div className="relative flex-1 min-w-[160px] max-w-[300px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search opportunities…"
                className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-4 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 placeholder:text-gray-300"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setSortOpen(s => !s)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-[13px] text-gray-600 hover:bg-gray-50">
                <SlidersHorizontal size={13} />
                {SORT_OPTIONS.find(s => s.value === sortBy)?.label || 'Sort'}
                <ChevronDown size={13} />
              </button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10 min-w-[180px]">
                  {SORT_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 ${sortBy === opt.value ? 'text-[#8D5D1D] font-medium' : 'text-gray-600'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#8D5D1D] text-white rounded-full text-[13px] font-semibold hover:bg-[#7A5019] transition-colors ml-auto">
              <Plus size={14} /> Create Opportunity
            </button>
          </div>

          {/* Count row */}
          <p className="text-[13px] text-gray-400 mb-4">
            {loading ? 'Loading…' : `${total} opportunit${total === 1 ? 'y' : 'ies'} found`}
            {hasFilters && !loading && (
              <button onClick={clearFilters} className="ml-2 text-[#8D5D1D] hover:underline text-[12px]">Clear filters</button>
            )}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded mb-2" />
                  <div className="h-2.5 bg-gray-100 rounded w-2/3 mb-4" />
                  <div className="h-9 bg-gray-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : opps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="text-[40px] mb-3">🎭</div>
              <p className="font-semibold text-gray-700 mb-1">No opportunities found</p>
              <p className="text-[13px] text-gray-400 mb-5">
                {hasFilters ? 'Try adjusting your filters or search term.' : 'Create your first opportunity to start receiving applications.'}
              </p>
              {hasFilters
                ? <button onClick={clearFilters} className="px-4 py-2 rounded-full border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50">Clear filters</button>
                : <button onClick={() => setCreateModalOpen(true)} className="px-5 py-2.5 bg-[#8D5D1D] text-white rounded-full text-[13px] font-semibold hover:bg-[#7A5019] transition-colors">
                    <Plus size={14} className="inline mr-1" /> Create Opportunity
                  </button>
              }
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {opps.map(opp => {
                const color    = CATEGORY_COLOR[opp.category] || '#6B7280';
                const initials = getInitials(opp.title);
                const catLabel = OPPORTUNITY_CATEGORIES.find(c => c.value === opp.category)?.label || opp.category;
                const disciplines = (opp.disciplines || []).slice(0, 3);

                return (
                  <div key={opp.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[12px] shrink-0"
                        style={{ backgroundColor: color }}>
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[13px] text-gray-900 truncate leading-snug">{opp.title}</p>
                        <p className="text-[11px] text-gray-400 truncate">{[opp.city, opp.country].filter(Boolean).join(', ') || 'Location TBD'}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${OPP_STATUS_BADGE[opp.application_status] || 'bg-gray-100 text-gray-500'}`}>
                        {opp.application_status}
                      </span>
                    </div>

                    {/* Meta row */}
                    <p className="text-[11px] text-gray-400">
                      {relativeTime(opp.created_at)}
                      {opp.opportunity_close_date && <> · Closes {fmtDate(opp.opportunity_close_date)}</>}
                      {opp.payment_type && <> · {opp.payment_type}</>}
                    </p>

                    {/* Description snippet */}
                    {opp.description && (
                      <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed">{opp.description}</p>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className="bg-[#8D5D1D]/10 text-[#8D5D1D] text-[10px] rounded-full px-2.5 py-0.5 font-medium">{catLabel}</span>
                      {opp.is_remote && <span className="bg-blue-50 text-blue-600 text-[10px] rounded-full px-2.5 py-0.5 font-medium">Remote</span>}
                      {disciplines.map(d => (
                        <span key={d} className="bg-gray-100 text-gray-500 text-[10px] rounded-full px-2.5 py-0.5">
                          {DISCIPLINE_OPTIONS.find(o => o.value === d)?.label || d}
                        </span>
                      ))}
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => setViewOpp(opp)}
                      className="w-full h-10 rounded-full bg-[#8D5D1D] text-white text-[12px] font-semibold hover:bg-[#7A5019] transition-colors mt-auto">
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {viewOpp && (
        <ViewOpportunityModal
          opp={viewOpp}
          onClose={() => setViewOpp(null)}
          onRefresh={loadOpps}
        />
      )}
      {createModalOpen && (
        <CreateOpportunityModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={loadOpps}
        />
      )}
    </DashboardLayout>
  );
};

export default OrgOpportunitiesPage;
