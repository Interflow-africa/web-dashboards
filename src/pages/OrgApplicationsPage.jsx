import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronDown, Search, SlidersHorizontal, ArrowRight, ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import { applicationsAPI } from '@/services/index';
import toast from 'react-hot-toast';
import getApiError from '@/utils/apiError';

/* ─── Helpers ──────────────────────────────────────────────────── */

const PALETTE = ['#1565C0','#0D7377','#5C35A3','#B45309','#065F46','#9D174D','#7C3AED','#374151'];
const getColor = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
};
const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '??';

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const STATUS_PILL = {
  pending:      'bg-amber-100 text-amber-700',
  under_review: 'bg-amber-100 text-amber-700',
  shortlisted:  'bg-blue-100 text-blue-700',
  accepted:     'bg-green-100 text-green-700',
  rejected:     'bg-red-100 text-red-700',
  withdrawn:    'bg-gray-100 text-gray-500',
  on_hold:      'bg-purple-100 text-purple-700',
  open:         'bg-green-100 text-green-700',
  closed:       'bg-red-100 text-red-700',
  draft:        'bg-gray-100 text-gray-500',
};

const STATUS_LABEL = {
  pending:      'Pending',
  under_review: 'In Review',
  shortlisted:  'Shortlisted',
  accepted:     'Accepted',
  rejected:     'Rejected',
  withdrawn:    'Withdrawn',
  on_hold:      'On Hold',
  open:         'Open',
  closed:       'Closed',
  draft:        'Draft',
};

const statusPill  = (s) => STATUS_PILL[s]  || 'bg-gray-100 text-gray-500';
const statusLabel = (s) => STATUS_LABEL[s] || (s?.replace(/_/g,' ') ?? '—');

/* Derive applicant display name from application object */
const getApplicantName = (app) =>
  app.artist_name || app.applicant_name ||
  [app.first_name || app.form_data?.first_name, app.last_name || app.form_data?.last_name]
    .filter(Boolean).join(' ') || 'Unknown';

/* ─── SKELETON ROW ─────────────────────────────────────────────── */
const SkeletonRow = ({ cols }) => (
  <tr className="border-t border-gray-100 animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

/* ─── VIEW OPPORTUNITY MODAL ───────────────────────────────────── */
const ViewOpportunityModal = ({ opp, onClose }) => {
  const [activeTab, setActiveTab]   = useState('Overview');
  const [applicants, setApplicants] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsLoaded, setAppsLoaded]   = useState(false);
  const [responseApp, setResponseApp] = useState(null);

  const tabs     = ['Overview', 'Applicants'];
  const color    = getColor(opp.title || '');
  const initials = getInitials(opp.title || '');
  const catLabel = opp.category?.replace(/_/g, ' ') || '';

  /* Load applicants lazily when tab first opened */
  useEffect(() => {
    if (activeTab !== 'Applicants' || appsLoaded) return;
    setAppsLoading(true);
    applicationsAPI.orgByOpportunity(opp.id)
      .then(r => setApplicants(r.data.results || r.data.data || []))
      .catch(() => toast.error('Failed to load applicants'))
      .finally(() => { setAppsLoading(false); setAppsLoaded(true); });
  }, [activeTab, appsLoaded, opp.id]);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[760px] p-5 sm:p-6 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[18px] text-gray-900">View Opportunity Info</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Left mini panel */}
            <div className="w-full sm:w-48 sm:shrink-0">
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="w-[50px] h-[50px] rounded-full flex items-center justify-center text-white font-bold text-[16px] mb-3"
                  style={{ backgroundColor: color }}>
                  {initials}
                </div>
                <p className="font-bold text-gray-900 text-[13px] mb-0.5 truncate">{opp.title}</p>
                <p className="text-[12px] text-gray-400 mb-4 capitalize">{catLabel || '—'}</p>
                <nav className="flex flex-col gap-1">
                  {tabs.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`text-left text-[12px] font-medium px-3 py-2 rounded-lg border-l-2 transition-all ${
                        activeTab === tab
                          ? 'bg-[#8D5D1D]/10 border-[#8D5D1D] text-[#8D5D1D]'
                          : 'border-transparent text-gray-500 hover:bg-gray-50'
                      }`}>
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Right content */}
            <div className="flex-1 min-w-0">
              {/* ── Overview ── */}
              {activeTab === 'Overview' && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium mb-1 block">Opportunity Title*</label>
                      <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">{opp.title || '—'}</div>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium mb-1 block">Category</label>
                      <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700 capitalize">{catLabel || '—'}</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium mb-1 block">Description</label>
                    <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700 min-h-[60px] whitespace-pre-wrap">{opp.description || '—'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium mb-1 block">Country</label>
                      <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">{opp.country || '—'}</div>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium mb-1 block">City</label>
                      <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">{opp.city || '—'}</div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 font-medium mb-1 block">Location</label>
                    <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">{opp.location || '—'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium mb-1 block">Opportunity Creation Date</label>
                      <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700">{fmtDate(opp.created_at)}</div>
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-medium mb-1 block">Application Status</label>
                      <div className="bg-[#F7F4EE] rounded-lg px-3 py-2.5 text-[13px] text-gray-700 capitalize">{statusLabel(opp.application_status)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Applicants ── */}
              {activeTab === 'Applicants' && (
                <div>
                  <p className="text-[13px] font-semibold text-gray-700 mb-3">Applicants List</p>
                  {appsLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <div style={{ width: 28, height: 28, border: '3px solid rgba(139,105,20,0.2)', borderTopColor: '#8B6914', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    </div>
                  ) : applicants.length === 0 ? (
                    <div className="text-center py-10 text-[13px] text-gray-400">No applicants yet for this opportunity.</div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full text-[12px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Applicant</th>
                            <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Date received</th>
                            <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Status</th>
                            <th className="px-3 py-2.5 text-left text-gray-500 font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applicants.map(a => {
                            const aName = getApplicantName(a);
                            return (
                              <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                                <td className="px-3 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    {a.artist_avatar ? (
                                      <img src={a.artist_avatar} alt={aName}
                                        className="w-8 h-8 rounded-full object-cover shrink-0"
                                        onError={e => { e.currentTarget.style.display = 'none'; }} />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                                        style={{ backgroundColor: getColor(aName) }}>
                                        {getInitials(aName)}
                                      </div>
                                    )}
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-800 text-[12px] truncate">{aName}</p>
                                      {(a.artist_discipline || a.artist_location) && (
                                        <p className="text-[11px] text-gray-400 truncate">
                                          {[a.artist_discipline?.replace(/_/g, ' '), a.artist_location].filter(Boolean).join(' · ')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-gray-500">{fmtDate(a.created_at)}</td>
                                <td className="px-3 py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusPill(a.status)}`}>{statusLabel(a.status)}</span>
                                </td>
                                <td className="px-3 py-2.5">
                                  <button
                                    onClick={() => setResponseApp(a)}
                                    className="text-[#8D5D1D] hover:underline text-[11px] font-medium">
                                    Respond
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="px-3 py-2 text-[11px] text-gray-400 border-t border-gray-100">
                        {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {responseApp && (
        <ApplicationResponseModal
          app={responseApp}
          opp={opp}
          onClose={() => setResponseApp(null)}
          onSuccess={() => { setResponseApp(null); setAppsLoaded(false); }}
        />
      )}
    </>
  );
};

/* ─── APPLICATION RESPONSE MODAL ──────────────────────────────── */
const ApplicationResponseModal = ({ app, opp: oppProp, onClose, onSuccess }) => {
  const [responseStatus, setResponseStatus] = useState('');
  const [orgNotes, setOrgNotes]             = useState('');
  const [orgFeedback, setOrgFeedback]       = useState('');
  const [saving, setSaving]                 = useState(false);

  const resolvedOpp = oppProp || app?.opportunity || {};
  const oppTitle    = resolvedOpp.title || '—';
  const oppCat      = resolvedOpp.category?.replace(/_/g, ' ') || '';
  const oppColor    = getColor(oppTitle);
  const oppInitials = getInitials(oppTitle);
  const applicantName = getApplicantName(app || {});

  const handleSubmit = async () => {
    if (!responseStatus) { toast.error('Please select a response status'); return; }
    setSaving(true);
    try {
      await applicationsAPI.updateStatus(app?.id, {
        status: responseStatus,
        org_notes: orgNotes,
        org_feedback: orgFeedback,
      });
      toast.success('Response submitted!');
      (onSuccess || onClose)();
    } catch (err) {
      toast.error(getApiError(err, 'Failed to submit response'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[500px] p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-[#8D5D1D] hover:opacity-70">
              <ArrowLeft size={16} />
            </button>
            <h2 className="font-bold text-[16px] text-gray-900">Application Response</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Opportunity badge */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
            style={{ backgroundColor: oppColor }}>
            {oppInitials}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-[13px] text-gray-900 truncate">{oppTitle}</p>
            <p className="text-[12px] text-gray-400 capitalize">{oppCat || 'Opportunity'}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] text-gray-400 font-medium mb-1 block">Applicant name</label>
            <div className="bg-[#F7F4EE] rounded-xl px-3 py-2.5 text-[13px] text-gray-700">{applicantName}</div>
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium mb-1 block">Current status</label>
            <div className="bg-[#F7F4EE] rounded-xl px-3 py-2.5 text-[13px]">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${statusPill(app?.status)}`}>
                {statusLabel(app?.status)}
              </span>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium mb-1 block">Application Response Status*</label>
            <div className="relative">
              <select
                value={responseStatus}
                onChange={e => setResponseStatus(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 appearance-none pr-8">
                <option value="">Select status</option>
                <option value="under_review">In Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="on_hold">On Hold</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium mb-1 block">Internal notes (optional)</label>
            <textarea
              rows={2}
              value={orgNotes}
              onChange={e => setOrgNotes(e.target.value)}
              placeholder="Private notes visible only to your team…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 resize-vertical"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-400 font-medium mb-1 block">Feedback for applicant (optional)</label>
            <textarea
              rows={3}
              value={orgFeedback}
              onChange={e => setOrgFeedback(e.target.value)}
              placeholder="Leave feedback for the applicant…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 resize-vertical"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full h-11 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5019] transition-colors flex items-center justify-center gap-2 mt-1 disabled:opacity-50 disabled:cursor-not-allowed">
            {saving ? 'Submitting…' : <><span>Submit</span><ArrowRight size={14} /></>}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── ARTIST PROFILE DRAWER ───────────────────────────────────── */
const ArtistProfileDrawer = ({ app, onBack }) => {
  const [detail, setDetail]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('Bio');
  const [responseOpen, setResponseOpen] = useState(false);

  const tabs = ['Bio', 'Career and Education'];

  useEffect(() => {
    applicationsAPI.orgDetail(app.id)
      .then(r => setDetail(r.data.data || r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [app.id]);

  const name      = getApplicantName(app);
  const initials  = getInitials(name);
  const color     = getColor(name);
  const avatar    = app.artist_avatar || detail?.artist_avatar || null;
  const location  = app.artist_location || detail?.artist_location || null;
  const discipline = app.artist_discipline || detail?.artist_discipline || null;
  const formData  = detail?.form_data || {};
  const opp       = detail?.opportunity || app.opportunity || {};

  return (
    <div className="absolute inset-0 bg-[#F4F4F2] z-10 overflow-y-auto p-4 sm:p-6">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-[#8D5D1D] text-[13px] font-medium hover:underline mb-5">
        <ArrowLeft size={14} /> Back to Applications
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div style={{ width: 32, height: 32, border: '3px solid rgba(139,105,20,0.2)', borderTopColor: '#8B6914', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Left card */}
            <div className="sm:w-[200px] shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center gap-2">
              {avatar ? (
                <img src={avatar} alt={name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-[#8D5D1D]"
                  onError={e => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div className="w-16 h-16 rounded-full ring-2 ring-[#8D5D1D] flex items-center justify-center font-bold text-[20px] text-white"
                  style={{ backgroundColor: color }}>
                  {initials}
                </div>
              )}
              <p className="font-bold text-[14px] text-gray-900">{name}</p>
              {(location || formData.city || detail?.city) && (
                <p className="text-[12px] text-gray-500">
                  {location || [formData.city || detail?.city, formData.country || detail?.country].filter(Boolean).join(', ')}
                </p>
              )}
              {discipline && (
                <p className="text-[11px] text-gray-400 capitalize">{discipline.replace(/_/g, ' ')}</p>
              )}
              <div className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusPill(detail?.status || app.status)}`}>
                {statusLabel(detail?.status || app.status)}
              </div>
            </div>

            {/* Right card */}
            <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  {opp.title && (
                    <p className="text-[11px] font-bold text-[#8D5D1D] uppercase italic tracking-widest mb-1">
                      {opp.category?.replace(/_/g, ' ') || 'Application'}
                    </p>
                  )}
                  <h2 className="font-bold text-[22px] text-gray-900">{name}</h2>
                </div>
                <button
                  onClick={() => setResponseOpen(true)}
                  className="px-4 py-2 bg-[#8D5D1D] text-white text-[12px] font-semibold rounded-full hover:bg-[#7A5019] transition-colors shrink-0">
                  Respond
                </button>
              </div>
              <p className="text-[13px] font-medium text-gray-700 mb-1">
                Applied for: <span className="text-[#8D5D1D]">{opp.title || '—'}</span>
              </p>
              <p className="text-[12px] text-gray-400">Received: {fmtDate(detail?.created_at || app.created_at)}</p>
              {(formData.portfolio_link || detail?.portfolio_link) && (
                <a href={formData.portfolio_link || detail?.portfolio_link} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-[12px] text-[#8D5D1D] hover:underline">
                  🔗 Portfolio link
                </a>
              )}
            </div>
          </div>

          {/* Tab nav */}
          <div className="flex gap-1 mb-5 flex-wrap">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-[12px] font-medium transition-colors ${
                  activeTab === tab ? 'bg-[#8D5D1D] text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Bio tab */}
          {activeTab === 'Bio' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="font-bold text-[14px] text-gray-900 mb-4">Application Details</p>
              <table className="w-full text-[13px] mb-5">
                <tbody>
                  {[
                    ['First name',  formData.first_name  || detail?.first_name  || '—'],
                    ['Last name',   formData.last_name   || detail?.last_name   || '—'],
                    ['City',        formData.city        || detail?.city        || '—'],
                    ['Country',     formData.country     || detail?.country     || '—'],
                    ['Experience',  formData.experience  || detail?.experience  || '—'],
                    ['Salary range',formData.salary_range|| detail?.salary_range|| '—'],
                    ['Address',     formData.address     || detail?.address     || '—'],
                  ].filter(([, v]) => v && v !== '—').map(([k, v]) => (
                    <tr key={k} className="border-b border-gray-100">
                      <td className="py-2 text-gray-400 w-1/3">{k}</td>
                      <td className="py-2 text-gray-700 font-medium">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Career and Education tab */}
          {activeTab === 'Career and Education' && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <p className="font-bold text-[14px] text-gray-900 mb-4">Opportunity Applied For</p>
              {opp.title ? (
                <div className="bg-gray-50 rounded-xl p-4 flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] text-white shrink-0"
                    style={{ backgroundColor: getColor(opp.title) }}>
                    {getInitials(opp.title)}
                  </div>
                  <div>
                    <p className="font-semibold text-[13px] text-gray-900">{opp.title}</p>
                    <p className="text-[12px] text-gray-400 capitalize">{opp.category?.replace(/_/g,' ')} · {fmtDate(opp.created_at)}</p>
                    {opp.description && (
                      <p className="text-[12px] text-gray-500 mt-1 line-clamp-3">{opp.description}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-gray-400 text-center py-4">No opportunity details available.</p>
              )}
            </div>
          )}
        </>
      )}

      {responseOpen && (
        <div className="fixed inset-0 z-20">
          <ApplicationResponseModal
            app={detail || app}
            onClose={() => setResponseOpen(false)}
            onSuccess={() => { setResponseOpen(false); onBack(); }}
          />
        </div>
      )}
    </div>
  );
};

/* ─── TABLE WRAPPER ────────────────────────────────────────────── */
const TableWrapper = ({ title, view, data, loading, onViewOpp, onViewApp, onViewArtist }) => {
  const [search, setSearch]   = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [sortOpen, setSortOpen]   = useState(false);

  const isOpps = view === 'opps' || view === 'active';
  const colCount = isOpps ? 7 : 7;

  /* Client-side filter */
  const filtered = data.filter(row => {
    if (!search) return true;
    const q = search.toLowerCase();
    if (isOpps) return (row.title || '').toLowerCase().includes(q);
    return (
      getApplicantName(row).toLowerCase().includes(q) ||
      (row.opportunity?.title || '').toLowerCase().includes(q)
    );
  });

  /* Sort */
  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.created_at), db = new Date(b.created_at);
    return sortOrder === 'newest' ? db - da : da - db;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-100 flex-wrap">
        <p className="font-bold text-[14px] text-gray-900 mr-2">{title}</p>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-gray-50 border border-gray-200 rounded-full pl-8 pr-4 py-2 text-[12px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 placeholder:text-gray-300 w-[180px]"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setSortOpen(s => !s)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-[12px] text-gray-600 hover:bg-gray-100">
            <SlidersHorizontal size={12} /> Sort <ChevronDown size={12} />
          </button>
          {sortOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10 min-w-[130px]">
              {[['newest', 'Newest first'], ['oldest', 'Oldest first']].map(([val, lbl]) => (
                <button key={val} onClick={() => { setSortOrder(val); setSortOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-[12px] hover:bg-gray-50 ${sortOrder === val ? 'text-[#8D5D1D] font-semibold' : 'text-gray-600'}`}>
                  {lbl}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isOpps ? (
          <table className="w-full text-[13px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Opportunity Title</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Applications</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Date Created</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
                : sorted.length === 0
                ? (
                  <tr>
                    <td colSpan={colCount} className="px-4 py-10 text-center text-[13px] text-gray-400">
                      {search ? 'No results found.' : 'No opportunities yet.'}
                    </td>
                  </tr>
                )
                : sorted.map(row => (
                  <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.title}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{row.category?.replace(/_/g, ' ') || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">{row.applications_count ?? row.applicants_count ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(row.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusPill(row.application_status)}`}>
                        {statusLabel(row.application_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => onViewOpp(row)} className="text-gray-400 hover:text-[#8D5D1D] font-bold text-[18px] tracking-widest">···</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        ) : (
          <table className="w-full text-[13px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left"><input type="checkbox" className="rounded" /></th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Opportunity Title</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Applicant Name</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Date received</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-[11px] text-gray-400 font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
                : sorted.length === 0
                ? (
                  <tr>
                    <td colSpan={colCount} className="px-4 py-10 text-center text-[13px] text-gray-400">
                      {search ? 'No results found.' : 'No applications yet.'}
                    </td>
                  </tr>
                )
                : sorted.map(row => (
                  <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" className="rounded" /></td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">{row.opportunity?.title || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => onViewArtist(row)} className="text-[#8D5D1D] hover:underline font-medium">
                        {getApplicantName(row)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{fmtDate(row.created_at)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusPill(row.status)}`}>{statusLabel(row.status)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => onViewApp(row)} className="text-gray-400 hover:text-[#8D5D1D] font-bold text-[18px] tracking-widest">···</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {!loading && sorted.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500">
          <span>Showing {sorted.length} of {data.length}</span>
        </div>
      )}
    </div>
  );
};

/* ─── MAIN PAGE ────────────────────────────────────────────────── */
const OrgApplicationsPage = () => {
  const [opps, setOpps]             = useState([]);
  const [apps, setApps]             = useState([]);
  const [oppsLoading, setOppsLoading] = useState(true);
  const [appsLoading, setAppsLoading] = useState(true);
  const [stats, setStats]           = useState(null);
  const [activeCard, setActiveCard] = useState('opps');
  const [viewOpp, setViewOpp]       = useState(null);
  const [viewApp, setViewApp]       = useState(null);
  const [viewArtist, setViewArtist] = useState(null);

  const loadOpps = useCallback(() => {
    setOppsLoading(true);
    applicationsAPI.orgOpportunities()
      .then(r => setOpps(r.data.data || r.data.results || []))
      .catch(() => toast.error('Failed to load opportunities'))
      .finally(() => setOppsLoading(false));
  }, []);

  const loadApps = useCallback(() => {
    setAppsLoading(true);
    applicationsAPI.orgAllApplications()
      .then(r => setApps(r.data.data || r.data.results || []))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setAppsLoading(false));
  }, []);

  useEffect(() => { loadOpps(); }, [loadOpps]);
  useEffect(() => { loadApps(); }, [loadApps]);
  useEffect(() => {
    applicationsAPI.orgApplicationStats()
      .then(r => setStats(r.data.data || r.data))
      .catch(() => {});
  }, []);

  const activeOpps = opps.filter(o => o.status === 'published');

  const tableData    = activeCard === 'opps' ? opps : activeCard === 'active' ? activeOpps : apps;
  const tableLoading = activeCard === 'apps' ? appsLoading : oppsLoading;
  const tableTitle   = activeCard === 'opps' ? 'All Opportunities' : activeCard === 'apps' ? 'Application list' : 'Active Opportunity list';

  const statsLoading = !stats;
  const statCards = [
    {
      key: 'opps',
      label: 'All Opportunities',
      value: statsLoading ? '…' : stats.all_opportunities.total,
      sub: `In the last 30 days: ${statsLoading ? '…' : stats.all_opportunities.last_30_days}`,
      bg: '#EBF4FF', activeBg: '#D6EAFF', iconBg: '#BFDBFE',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      key: 'apps',
      label: 'Applications Received',
      value: statsLoading ? '…' : stats.applications_received.total,
      sub: `In the last 30 days: ${statsLoading ? '…' : stats.applications_received.last_30_days}`,
      bg: '#EDFAF3', activeBg: '#D4F5E5', iconBg: '#BBF7D0',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      key: 'active',
      label: 'Active Opportunities',
      value: statsLoading ? '…' : stats.active_opportunities.total,
      sub: `In the last 30 days: ${statsLoading ? '…' : stats.active_opportunities.last_30_days}`,
      bg: '#FFF8EC', activeBg: '#FDEFC4', iconBg: '#FDE68A',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="relative">
        {/* Artist profile drawer overlay */}
        {viewArtist && (
          <ArtistProfileDrawer
            app={viewArtist}
            onBack={() => { setViewArtist(null); loadApps(); }}
          />
        )}

        {/* Page header */}
        <div className="mb-5">
          <h1 className="dash-page-title">Applications</h1>
          <p className="dash-page-sub" style={{ marginBottom: 0 }}>View all activities regarding your applications on Interflow.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {statCards.map(card => {
            const isActive = activeCard === card.key;
            return (
              <button
                key={card.key}
                onClick={() => setActiveCard(card.key)}
                className={`flex-1 rounded-2xl p-4 text-left transition-all ${isActive ? 'ring-2 ring-[#8D5D1D]' : ''}`}
                style={{ backgroundColor: isActive ? card.activeBg : card.bg }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold text-gray-700">{card.label}</p>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: card.iconBg }}>
                    {card.icon}
                  </div>
                </div>
                <p className="text-[28px] font-bold text-gray-900 leading-none mb-1">{card.value}</p>
                <p className="text-[11px] text-gray-400">{card.sub}</p>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <TableWrapper
          title={tableTitle}
          view={activeCard}
          data={tableData}
          loading={tableLoading}
          onViewOpp={setViewOpp}
          onViewApp={setViewApp}
          onViewArtist={setViewArtist}
        />
      </div>

      {/* Modals */}
      {viewOpp && (
        <ViewOpportunityModal
          opp={viewOpp}
          onClose={() => { setViewOpp(null); loadApps(); }}
        />
      )}
      {viewApp && (
        <ApplicationResponseModal
          app={viewApp}
          onClose={() => setViewApp(null)}
          onSuccess={() => { setViewApp(null); loadApps(); }}
        />
      )}
    </DashboardLayout>
  );
};

export default OrgApplicationsPage;
