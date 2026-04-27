import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, ArrowLeft, ChevronDown } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import { opportunitiesAPI, applicationsAPI, artistAPI } from '@/services/index';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';
import getApiError from '@/utils/apiError';

/* ────────────────────────────────────────────────────────────────
   CONSTANTS & HELPERS
──────────────────────────────────────────────────────────────────*/
const PALETTE = ['#1565C0','#0D7377','#5C35A3','#B45309','#065F46','#9D174D','#7C3AED','#374151'];

const getColor = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};

const getInitials = (name = '') =>
  name.split(' ').slice(0, 3).map(w => w[0] ?? '').join('').toUpperCase() || '??';

const relativeTime = (d) => {
  if (!d) return '';
  const days = Math.floor((Date.now() - new Date(d)) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const DISCIPLINE_LABELS = {
  dancer: 'Dance', poet: 'Poetry', musician: 'Music', singer: 'Vocal',
  theatre_performer: 'Theatre', performance_artist: 'Performance',
  storyteller: 'Storytelling', multidisciplinary: 'Multidisciplinary',
};

/* Date-posted option → days back */
const DATE_DAYS = { last_24h: 1, last_7d: 7, last_30d: 30 };

/* Design contract labels → backend payment_type */
const CONTRACT_MAP = { full_time: 'fixed', per_time: 'hourly', hybrid: 'negotiable' };

const CATEGORY_OPTIONS = [
  { label: 'Performance',         value: 'performance' },
  { label: 'Non-Performance',     value: 'non_performance' },
  { label: 'Competition/Festival',value: 'competition' },
];

const fieldCls = 'w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#8D5D1D] bg-[#F7F4EE] placeholder:text-gray-400';
const labelCls = 'text-[11px] text-gray-500 font-medium absolute -top-2 left-3 bg-[#F7F4EE] px-1';
const readCls  = 'w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[13px] bg-[#F7F4EE] text-gray-700';

/* ────────────────────────────────────────────────────────────────
   ORG LOGO — image if available, else colour-coded initials
──────────────────────────────────────────────────────────────────*/
const OrgLogo = ({ opp, size = 48, border = '2px solid #D4A84B', fontSize = 13 }) => {
  const name     = opp.organization_name || opp.title || '';
  const color    = getColor(name);
  const initials = getInitials(name);
  const style    = { width: size, height: size, border, flexShrink: 0 };

  if (opp.organization_logo) {
    return (
      <img src={opp.organization_logo} alt={name}
        className="rounded-full object-cover"
        style={style}
        onError={e => { e.currentTarget.style.display = 'none'; }} />
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center text-white font-bold"
      style={{ ...style, backgroundColor: color, fontSize }}>
      {initials}
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   OPPORTUNITY CARD
──────────────────────────────────────────────────────────────────*/
const OppCard = ({ opp, onMoreInfo, onApply }) => {
  const tags = (opp.disciplines || []).slice(0, 3).map(d => DISCIPLINE_LABELS[d] || d);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <OrgLogo opp={opp} size={48} fontSize={13} />
        <div className="min-w-0">
          <p className="font-bold text-[14px] text-gray-900 truncate leading-snug">{name}</p>
          <p className="text-[12px] text-gray-400 truncate">{[opp.city, opp.country].filter(Boolean).join(', ') || opp.location || 'Location TBD'}</p>
          <p className="text-[12px] text-gray-500">{opp.title?.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {/* Meta */}
      <p className="text-[11px] text-gray-400 leading-relaxed">
        {[
          relativeTime(opp.created_at),
          opp.opportunity_close_date && `Deadline ${fmtDate(opp.opportunity_close_date)}`,
          opp.payment_type,
        ].filter(Boolean).join(' | ')}
      </p>

      {/* Description */}
      {opp.description && (
        <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed">{opp.description}</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <span key={t} className="bg-gray-100 text-gray-500 text-[11px] rounded-full px-2.5 py-0.5 font-medium">{t}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <button
          onClick={() => onMoreInfo(opp)}
          className="flex-1 h-10 rounded-full border border-gray-800 text-gray-800 text-[12px] font-semibold hover:bg-gray-50 transition-colors">
          More Info
        </button>
        <button
          onClick={() => onApply(opp)}
          className="flex-1 h-10 rounded-full bg-[#8D5D1D] text-white text-[12px] font-semibold hover:bg-[#7A5019] transition-colors">
          Apply
        </button>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   VIEW OPPORTUNITY MODAL
──────────────────────────────────────────────────────────────────*/
const ViewOppModal = ({ opp: initialOpp, onClose, onApply }) => {
  const [opp, setOpp]         = useState(initialOpp);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    opportunitiesAPI.detail(initialOpp.id)
      .then(r => setOpp(r.data.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialOpp.id]);

  const ReadField = ({ label, value, wide }) => (
    <div className={`relative ${wide ? 'col-span-2' : ''}`}>
      <div className={readCls}>{value || ''}</div>
      <span className={labelCls}>{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[680px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="font-bold text-[17px] text-gray-900">View Opportunity Info</h2>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center gap-5">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <OrgLogo opp={opp} size={72} border="3px solid #D4A84B" fontSize={20} />
            <p className="font-bold text-gray-900 text-[15px]">{opp.organization_name || opp.title}</p>
          </div>

          {/* Fields */}
          {loading && (
            <div className="w-full grid grid-cols-2 gap-4 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`h-11 bg-gray-100 rounded-xl ${i === 2 || i === 3 || i === 7 ? 'col-span-2' : ''}`} />
              ))}
            </div>
          )}
          {!loading && (
            <div className="w-full grid grid-cols-2 gap-4">
              <ReadField label="Opportunity Title" value={opp.title} />
              <ReadField label="Category" value={opp.category_display || opp.category?.replace(/_/g, ' ')} />
              <div className="col-span-2 relative">
                <div className={`${readCls} min-h-[80px]`}>{opp.description || ''}</div>
                <span className={labelCls}>Description</span>
              </div>
              {opp.requirements && (
                <div className="col-span-2 relative">
                  <div className={`${readCls} min-h-[60px]`}>{opp.requirements}</div>
                  <span className={labelCls}>Requirements</span>
                </div>
              )}
              <ReadField label="Country" value={opp.country} />
              <ReadField label="City" value={opp.city} />
              {opp.location && <ReadField label="Location" value={opp.location} wide />}
              <ReadField label="Start Date" value={fmtDate(opp.start_date)} />
              <ReadField label="End Date" value={fmtDate(opp.end_date)} />
              <ReadField label="Close Date" value={fmtDate(opp.opportunity_close_date)} />
              <ReadField label="Status" value={opp.application_status_display || opp.application_status} />
              {opp.budget && (
                <ReadField label="Budget" value={`${opp.currency || ''} ${Number(opp.budget).toLocaleString()}`.trim()} />
              )}
            </div>
          )}

          {/* Apply */}
          <button
            onClick={() => { onClose(); onApply(opp); }}
            className="w-full h-12 rounded-full bg-[#8D5D1D] text-white text-[14px] font-semibold hover:bg-[#7A5019] transition-colors">
            Apply now
          </button>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   APPLICATION FORM MODAL
──────────────────────────────────────────────────────────────────*/
const ApplyModal = ({ opp, onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const [schema, setSchema]         = useState(opp.application_form_schema || []);
  const [loadingSchema, setLoadingSchema] = useState(!opp.application_form_schema?.length);
  const [submitting, setSubmitting] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [values, setValues] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
  });
  const set = (k, v) => setValues(f => ({ ...f, [k]: v }));

  /* If schema wasn't in the list payload, fetch the detail */
  useEffect(() => {
    if (opp.application_form_schema?.length) { setSchema(opp.application_form_schema); return; }
    setLoadingSchema(true);
    opportunitiesAPI.detail(opp.id)
      .then(r => setSchema(r.data.data?.application_form_schema || r.data.application_form_schema || []))
      .catch(() => setSchema([]))
      .finally(() => setLoadingSchema(false));
  }, [opp.id]);

  /* Fetch the artist's Interflow portfolio share link */
  useEffect(() => {
    artistAPI.getShareLink()
      .then(r => {
        const d = r.data?.data || r.data || {};
        setPortfolioUrl(d.share_url || d.url || d.portfolio_url || d.link || '');
      })
      .catch(() => {});
  }, []);

  /* Pre-populate url-type schema fields with the portfolio link once both are ready */
  useEffect(() => {
    if (!portfolioUrl || !schema.length) return;
    setValues(f => {
      const updates = {};
      schema.forEach(field => {
        if (field.type === 'url' && !f[field.key]) updates[field.key] = portfolioUrl;
      });
      return Object.keys(updates).length ? { ...f, ...updates } : f;
    });
  }, [portfolioUrl, schema]);

  /* Render a schema field */
  const renderField = (field) => {
    const isPortfolioUrl = field.type === 'url';

    if (field.type === 'select' && field.options?.length) {
      return (
        <div key={field.key} className="relative">
          <div className="relative">
            <select
              value={values[field.key] || ''}
              onChange={e => set(field.key, e.target.value)}
              className={`${fieldCls} appearance-none pr-8`}>
              <option value="">Select here</option>
              {field.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <span className={labelCls}>{field.label}{field.required ? '*' : ''}</span>
        </div>
      );
    }

    return (
      <div key={field.key} className={`relative ${isPortfolioUrl ? 'col-span-2' : ''}`}>
        <input
          type={isPortfolioUrl ? 'url' : 'text'}
          placeholder={field.placeholder || 'write here'}
          value={values[field.key] || ''}
          onChange={e => set(field.key, e.target.value)}
          className={fieldCls}
        />
        <span className={labelCls}>{field.label}{field.required ? '*' : ''}</span>
        {isPortfolioUrl && opp.requires_portfolio_link && (
          <span className="absolute -top-2 right-3 bg-[#F7F4EE] px-1 text-[10px] font-semibold text-[#8D5D1D]">
            Required by opportunity
          </span>
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        opportunity: opp.id,
        cover_letter: '',
        ...values,
      };
      await applicationsAPI.apply(payload);
      onSuccess();
    } catch (err) {
      toast.error(getApiError(err, 'Could not submit application'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-[680px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 pb-2">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="font-bold text-[17px] text-gray-900">Application form</h2>
            <p className="text-[12px] text-gray-400">Fill the form below to submit your application</p>
          </div>
          <button onClick={onClose} className="ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col items-center gap-5">
          {/* Logo */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <OrgLogo opp={opp} size={64} border="3px solid #D4A84B" fontSize={18} />
            <p className="font-bold text-gray-900 text-[14px]">{opp.organization_name || opp.title}</p>
          </div>

          {loadingSchema ? (
            <div className="py-8 text-center text-[13px] text-gray-400">Loading form…</div>
          ) : (
            <div className="w-full grid grid-cols-2 gap-4">
              {/* Static read-only fields */}
              <div className="relative">
                <div className={readCls}>{opp.title}</div>
                <span className={labelCls}>Opportunity Title*</span>
              </div>
              <div className="relative">
                <div className={readCls}>{opp.category?.replace(/_/g, ' ')}</div>
                <span className={labelCls}>Category</span>
              </div>

              {/* Static name fields */}
              <div className="relative">
                <input className={fieldCls} placeholder="First name" value={values.first_name}
                  onChange={e => set('first_name', e.target.value)} />
                <span className={labelCls}>First name</span>
              </div>
              <div className="relative">
                <input className={fieldCls} placeholder="Last name" value={values.last_name}
                  onChange={e => set('last_name', e.target.value)} />
                <span className={labelCls}>Last name</span>
              </div>

              {/* Dynamic schema fields */}
              {schema.map(field => renderField(field))}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || loadingSchema}
            className="w-full h-12 rounded-full bg-[#8D5D1D] text-white text-[14px] font-semibold hover:bg-[#7A5019] transition-colors disabled:opacity-60">
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   SUCCESS MODAL
──────────────────────────────────────────────────────────────────*/
const SuccessModal = ({ onContinue }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[480px] p-8 flex flex-col items-center text-center">
      <div className="bg-[#F7F4EE] rounded-2xl p-10 w-full flex flex-col items-center gap-4 mb-2">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-[22px] font-bold text-gray-900">Success</h3>
        <p className="text-[14px] text-gray-500">You have successfully submitted your application</p>
        <button
          onClick={onContinue}
          className="mt-2 px-10 py-3 rounded-full bg-[#8D5D1D] text-white text-[14px] font-semibold hover:bg-[#7A5019] transition-colors">
          Continue
        </button>
      </div>
    </div>
  </div>
);

/* ────────────────────────────────────────────────────────────────
   FILTER SIDEBAR
──────────────────────────────────────────────────────────────────*/
const FilterSidebar = ({ filters, onChange }) => {
  const RadioGroup = ({ title, options, field }) => (
    <div className="mb-5">
      <p className="text-[13px] font-bold text-gray-800 mb-2">{title}</p>
      <div className="flex flex-col gap-2">
        {options.map(opt => (
          <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
            <div
              onClick={() => onChange(field, filters[field] === opt.value ? '' : opt.value)}
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                filters[field] === opt.value ? 'border-[#8D5D1D]' : 'border-gray-300'}`}>
              {filters[field] === opt.value && <div className="w-2 h-2 rounded-full bg-[#8D5D1D]" />}
            </div>
            <span className="text-[13px] text-gray-600">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full lg:w-[240px] lg:shrink-0 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 self-start">
      <p className="font-bold text-[15px] text-gray-900 mb-4">Filters</p>
      <RadioGroup title="Date Posted" field="datePosted" options={[
        { label: 'All Time',      value: '' },
        { label: 'Last 24 hours', value: 'last_24h' },
        { label: 'Last 7 days',   value: 'last_7d' },
        { label: 'Last 30 days',  value: 'last_30d' },
      ]} />
      <RadioGroup title="Contract Type" field="contractType" options={[
        { label: 'Full Time', value: 'full_time' },
        { label: 'Per Time',  value: 'per_time' },
        { label: 'Hybrid',    value: 'hybrid' },
      ]} />
      <RadioGroup title="Deadline" field="deadline" options={[
        { label: 'Open',  value: 'active' },
        { label: 'Close', value: 'closed' },
      ]} />
      <RadioGroup title="Category" field="category" options={CATEGORY_OPTIONS} />
      <button
        onClick={() => ['datePosted','contractType','deadline','category'].forEach(f => onChange(f, ''))}
        className="text-[12px] font-medium text-[#8D5D1D] hover:underline mt-1">
        Collapse
      </button>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────────*/
const OpportunitiesPage = () => {
  const [opps, setOpps]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]   = useState(0);

  /* Search */
  const [titleSearch, setTitleSearch]   = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [submitted, setSubmitted]       = useState({ title: '', location: '' });

  /* Filters */
  const [filters, setFilters] = useState({ datePosted: '', contractType: '', deadline: '', category: '' });
  const changeFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  /* Modals */
  const [viewOpp,    setViewOpp]    = useState(null);
  const [applyOpp,   setApplyOpp]   = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  /* Load */
  const load = useCallback(() => {
    setLoading(true);
    const params = {};

    if (submitted.title)    params.search = submitted.title;
    if (submitted.location) params.city   = submitted.location;
    if (filters.category)   params.category = filters.category;
    if (filters.deadline)   params.application_status = filters.deadline;
    if (filters.contractType && CONTRACT_MAP[filters.contractType])
      params.payment_type = CONTRACT_MAP[filters.contractType];
    if (filters.datePosted && DATE_DAYS[filters.datePosted]) {
      const d = new Date();
      d.setDate(d.getDate() - DATE_DAYS[filters.datePosted]);
      params.created_after = d.toISOString().split('T')[0];
    }

    opportunitiesAPI.list(params)
      .then(r => {
        const data = r.data;
        setOpps(data.results || data.data || []);
        setTotal(data.count ?? (data.results || data.data || []).length);
      })
      .catch(() => toast.error('Failed to load opportunities'))
      .finally(() => setLoading(false));
  }, [submitted, filters]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = () => setSubmitted({ title: titleSearch, location: locationSearch });

  const handleSuccess = () => {
    setApplyOpp(null);
    setShowSuccess(true);
  };

  const handleContinue = () => {
    setShowSuccess(false);
    load();
  };

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="dash-page-title">Opportunities</h1>
        <p className="dash-page-sub" style={{ marginBottom: 0 }}>Find your next opportunity or share one with our community of Interflow members</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Filter sidebar */}
        <FilterSidebar filters={filters} onChange={changeFilter} />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={titleSearch}
                onChange={e => setTitleSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search by title..."
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-[13px] outline-none focus:border-[#8D5D1D] bg-white placeholder:text-gray-300"
              />
            </div>
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <input
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="City, State, or Zip code"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-[13px] outline-none focus:border-[#8D5D1D] bg-white placeholder:text-gray-300"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-[#8D5D1D] text-white rounded-xl text-[13px] font-semibold hover:bg-[#7A5019] transition-colors shrink-0">
              Search
            </button>
          </div>

          {/* Count */}
          {!loading && (
            <p className="text-[13px] text-gray-500 mb-4">
              {total} new opportunit{total === 1 ? 'y' : 'ies'} in all time
            </p>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1"><div className="h-3 bg-gray-200 rounded mb-2 w-3/4" /><div className="h-2.5 bg-gray-100 rounded w-1/2" /></div>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded mb-2" /><div className="h-2.5 bg-gray-100 rounded w-2/3 mb-4" />
                  <div className="flex gap-2"><div className="flex-1 h-9 bg-gray-100 rounded-full" /><div className="flex-1 h-9 bg-gray-200 rounded-full" /></div>
                </div>
              ))}
            </div>
          ) : opps.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <div className="text-[40px] mb-3">🎭</div>
              <p className="font-semibold text-gray-700 mb-1">No opportunities found</p>
              <p className="text-[13px] text-gray-400">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {opps.map(opp => (
                <OppCard
                  key={opp.id}
                  opp={opp}
                  onMoreInfo={o => setViewOpp(o)}
                  onApply={o => setApplyOpp(o)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {viewOpp    && <ViewOppModal opp={viewOpp} onClose={() => setViewOpp(null)} onApply={o => { setViewOpp(null); setApplyOpp(o); }} />}
      {applyOpp   && !showSuccess && <ApplyModal opp={applyOpp} onClose={() => setApplyOpp(null)} onSuccess={handleSuccess} />}
      {showSuccess && <SuccessModal onContinue={handleContinue} />}
    </DashboardLayout>
  );
};

export default OpportunitiesPage;
