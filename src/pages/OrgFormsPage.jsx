import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Copy, ExternalLink, X, Users, Calendar,
  CheckCircle2, XCircle, Clock, ChevronRight, Link, Heart,
} from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import { orgFormsAPI } from '@/services/api';

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const fmtTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const isVideo = (url = '') => /\.(mp4|mov|webm|ogg|avi)$/i.test(url);

// ── Status badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status, display }) => {
  const s = (status || '').toLowerCase();
  const map = {
    new:         'bg-blue-50 text-blue-600',
    viewed:      'bg-amber-50 text-amber-600',
    shortlisted: 'bg-green-50 text-green-700',
    accepted:    'bg-green-50 text-green-700',
    rejected:    'bg-red-50 text-red-600',
    withdrawn:   'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${map[s] ?? 'bg-gray-100 text-gray-500'}`}>
      {display || status || '—'}
    </span>
  );
};

// ── Form list card ─────────────────────────────────────────────────────────
const FormCard = ({ form, onClick }) => {
  const copyLink = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(form.share_link)
      .then(() => toast.success('Share link copied!'))
      .catch(() => toast.error('Could not copy link'));
  };

  return (
    <div
      onClick={() => onClick(form)}
      className="bg-white rounded-2xl border border-[#EBEBEB] p-5 cursor-pointer hover:shadow-md hover:border-[#C69214]/40 transition-all group"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-[#1A1A1A] leading-tight truncate group-hover:text-[#8D5D1D] transition-colors">
            {form.title}
          </h3>
          {form.description && (
            <p className="text-[12px] text-[#888] mt-1 line-clamp-2">{form.description}</p>
          )}
        </div>
        <ChevronRight size={16} className="text-[#AAAAAA] mt-0.5 shrink-0 group-hover:text-[#8D5D1D] transition-colors" />
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${form.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {form.is_active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
          {form.is_active ? 'Active' : 'Inactive'}
        </span>
        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${form.is_open ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'}`}>
          {form.is_open ? <CheckCircle2 size={10} /> : <Clock size={10} />}
          {form.is_open ? 'Open' : 'Closed'}
        </span>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between text-[11.5px] text-[#888] border-t border-[#F5F5F5] pt-3">
        <div className="flex items-center gap-1">
          <Users size={12} />
          <span>{form.submissions_count ?? 0} submission{form.submissions_count !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{fmt(form.created_at)}</span>
        </div>
      </div>

      {/* Share link */}
      {form.share_link && (
        <div
          onClick={copyLink}
          className="mt-3 flex items-center gap-2 text-[11px] text-[#8D5D1D] hover:text-[#6B4615] transition-colors cursor-pointer group/link"
        >
          <Link size={11} />
          <span className="truncate flex-1">{form.share_link}</span>
          <Copy size={11} className="shrink-0 opacity-60 group-hover/link:opacity-100" />
        </div>
      )}
    </div>
  );
};

// ── Submission detail drawer ───────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'new',         label: 'New' },
  { value: 'viewed',      label: 'Viewed' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted',    label: 'Accepted' },
  { value: 'rejected',    label: 'Rejected' },
];

const SubmissionDrawer = ({ open, detail, loading, onClose, onUpdate }) => {
  const [editStatus,    setEditStatus]    = useState('');
  const [editNotes,     setEditNotes]     = useState('');
  const [editFavorited, setEditFavorited] = useState(false);
  const [saving,        setSaving]        = useState(false);

  useEffect(() => {
    if (detail) {
      setEditStatus(detail.status || '');
      setEditNotes(detail.org_notes || '');
      setEditFavorited(detail.is_favorited || false);
    }
  }, [detail]);

  if (!open) return null;

  const handleUpdate = () => {
    if (saving || !detail) return;
    setSaving(true);
    orgFormsAPI.updateSubmission(detail.id, {
      status:       editStatus,
      org_notes:    editNotes,
      is_favorited: editFavorited,
    })
      .then(r => {
        const updated = r.data?.data || r.data || {};
        toast.success('Submission updated');
        onUpdate?.({ ...detail, ...updated, status: editStatus, org_notes: editNotes, is_favorited: editFavorited });
      })
      .catch(() => toast.error('Failed to update submission'))
      .finally(() => setSaving(false));
  };

  const Field = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10.5px] font-semibold text-[#AAAAAA] uppercase tracking-wide">{label}</p>
      <p className="text-[13px] text-[#1A1A1A]">{value || '—'}</p>
    </div>
  );

  const pw = detail?.portfolio_work;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-[460px] bg-white z-50 flex flex-col shadow-2xl overflow-hidden">
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0] shrink-0">
          <p className="text-[15px] font-bold text-[#1A1A1A]">Submission Detail</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center hover:bg-[#EBEBEB] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-[#F5F5F5] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !detail ? (
            <p className="text-[13px] text-[#AAAAAA] text-center py-10">Could not load submission.</p>
          ) : (
            <>
              {/* Artist info */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-[#E0E0E0] overflow-hidden shrink-0">
                  {detail.artist_avatar
                    ? <img src={detail.artist_avatar} alt={detail.artist_name} className="w-full h-full object-cover" />
                    : <span className="w-full h-full flex items-center justify-center text-white font-bold text-lg bg-[#8D5D1D]">
                        {(detail.artist_name || '?').slice(0, 2).toUpperCase()}
                      </span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-bold text-[#1A1A1A]">{detail.artist_name || '—'}</p>
                  <p className="text-[12.5px] text-[#888] capitalize">{detail.artist_discipline || '—'}</p>
                  <p className="text-[12px] text-[#AAAAAA]">{detail.artist_location || '—'}</p>
                </div>
              </div>

              {/* Form reference */}
              {detail.form_title && (
                <div className="bg-[#F8F5F0] rounded-xl px-4 py-2.5">
                  <p className="text-[11px] text-[#AAAAAA] font-semibold uppercase tracking-wide">Form</p>
                  <p className="text-[13px] font-semibold text-[#8D5D1D]">{detail.form_title}</p>
                </div>
              )}

              {/* Contact */}
              <div className="bg-[#FAFAFA] rounded-xl p-4 grid grid-cols-1 gap-3">
                <p className="text-[11.5px] font-bold text-[#1A1A1A] uppercase tracking-wide">Contact</p>
                <Field label="Email"     value={detail.artist_email} />
                <Field label="Phone"     value={detail.artist_phone} />
                <Field label="Instagram" value={detail.artist_instagram} />
              </div>

              {/* Application details */}
              <div className="bg-[#FAFAFA] rounded-xl p-4 space-y-3">
                <p className="text-[11.5px] font-bold text-[#1A1A1A] uppercase tracking-wide">Application</p>
                <Field label="Why they want to join" value={detail.why_join} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Attended before"  value={detail.attended_before ? 'Yes' : 'No'} />
                  <Field label="Is available"     value={detail.is_available ? 'Yes' : 'No'} />
                  <Field label="Wants to present" value={detail.wants_to_present ? 'Yes' : 'No'} />
                </div>
                {detail.available_dates && (
                  <Field label="Available dates" value={detail.available_dates} />
                )}
              </div>

              {/* Portfolio work */}
              {pw && (
                <div className="bg-[#FAFAFA] rounded-xl p-4 space-y-3">
                  <p className="text-[11.5px] font-bold text-[#1A1A1A] uppercase tracking-wide">Portfolio Work</p>
                  <p className="text-[13px] font-semibold text-[#1A1A1A]">{pw.title || '—'}</p>

                  {pw.file_url && (
                    isVideo(pw.file_url) ? (
                      <video src={pw.file_url} controls className="w-full rounded-xl max-h-[200px] bg-black" />
                    ) : (
                      <img src={pw.file_url} alt={pw.title} className="w-full rounded-xl max-h-[200px] object-cover" />
                    )
                  )}

                  {pw.external_url && (
                    <a
                      href={pw.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[12.5px] font-semibold text-[#8D5D1D] hover:underline"
                    >
                      <ExternalLink size={13} /> View external link
                    </a>
                  )}

                  {!pw.file_url && !pw.external_url && (
                    <p className="text-[12px] text-[#AAAAAA]">No media attached</p>
                  )}
                </div>
              )}

              {/* ── Editable fields ── */}
              <div className="bg-[#FAFAFA] rounded-xl p-4 space-y-4">
                <p className="text-[11.5px] font-bold text-[#1A1A1A] uppercase tracking-wide">Review</p>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-semibold text-[#AAAAAA] uppercase tracking-wide">Status</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-[#8D5D1D]/20 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Org notes */}
                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-semibold text-[#AAAAAA] uppercase tracking-wide">Org Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    rows={3}
                    placeholder="Add internal notes…"
                    className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2.5 text-[13px] outline-none resize-none focus:ring-2 focus:ring-[#8D5D1D]/20"
                  />
                </div>

                {/* Favourite toggle */}
                <button
                  onClick={() => setEditFavorited(f => !f)}
                  className={`flex items-center gap-2 text-[12.5px] font-semibold transition-colors ${
                    editFavorited ? 'text-red-500' : 'text-[#AAAAAA] hover:text-red-400'
                  }`}
                >
                  <Heart size={15} fill={editFavorited ? 'currentColor' : 'none'} />
                  {editFavorited ? 'Favorited' : 'Add to favorites'}
                </button>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-3 text-[11.5px] text-[#AAAAAA]">
                <div>
                  <p className="font-semibold text-[#BBBBBB] uppercase tracking-wide text-[10px]">Submitted</p>
                  <p>{fmtTime(detail.submitted_at)}</p>
                </div>
                {detail.viewed_at && (
                  <div>
                    <p className="font-semibold text-[#BBBBBB] uppercase tracking-wide text-[10px]">Viewed</p>
                    <p>{fmtTime(detail.viewed_at)}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Save button — fixed at drawer bottom */}
        {!loading && detail && (
          <div className="px-5 py-4 border-t border-[#F0F0F0] shrink-0">
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5210] transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────
const OrgFormsPage = () => {
  const [view, setView]                     = useState('list');        // 'list' | 'detail'
  const [forms, setForms]                   = useState([]);
  const [loadingForms, setLoadingForms]     = useState(true);
  const [selectedForm, setSelectedForm]     = useState(null);
  const [submissions, setSubmissions]       = useState([]);
  const [loadingSubs, setLoadingSubs]       = useState(false);
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [subDetail, setSubDetail]           = useState(null);
  const [loadingDetail, setLoadingDetail]   = useState(false);

  useEffect(() => {
    orgFormsAPI.list()
      .then(r => {
        const d = r.data?.data || r.data || [];
        setForms(Array.isArray(d) ? d : (d.results || []));
      })
      .catch(() => {})
      .finally(() => setLoadingForms(false));
  }, []);

  const openForm = (form) => {
    setSelectedForm(form);
    setView('detail');
    setLoadingSubs(true);
    setSubmissions([]);
    orgFormsAPI.submissions(form.id)
      .then(r => {
        const d = r.data?.data || r.data || {};
        setSubmissions(d.submissions || (Array.isArray(d) ? d : []));
      })
      .catch(() => setSubmissions([]))
      .finally(() => setLoadingSubs(false));
  };

  const openSubmission = (sub) => {
    setSubDetail(null);
    setDrawerOpen(true);
    setLoadingDetail(true);
    orgFormsAPI.submissionDetail(sub.id)
      .then(r => setSubDetail(r.data?.data || r.data || null))
      .catch(() => setSubDetail(null))
      .finally(() => setLoadingDetail(false));
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSubDetail(null);
  };

  const backToList = () => {
    setView('list');
    setSelectedForm(null);
    setSubmissions([]);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ── List view ── */}
        {view === 'list' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[22px] font-bold text-[#1A1A1A]">My Forms</h1>
                <p className="text-[13px] text-[#888] mt-0.5">Manage your Call For Artists forms and submissions</p>
              </div>
              {!loadingForms && (
                <span className="text-[12px] font-semibold text-[#888] bg-[#F5F5F5] px-3 py-1 rounded-full">
                  {forms.length} form{forms.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {loadingForms ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-[180px] bg-white rounded-2xl border border-[#EBEBEB] animate-pulse" />
                ))}
              </div>
            ) : forms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {forms.map(f => (
                  <FormCard key={f.id} form={f} onClick={openForm} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#EBEBEB] p-16 text-center">
                <p className="text-[40px] mb-3">📋</p>
                <p className="text-[15px] font-semibold text-[#1A1A1A]">No forms yet</p>
                <p className="text-[13px] text-[#AAAAAA] mt-1">Forms created via the Call For Artists tool will appear here.</p>
              </div>
            )}
          </>
        )}

        {/* ── Detail view ── */}
        {view === 'detail' && selectedForm && (
          <>
            {/* Back */}
            <button
              onClick={backToList}
              className="flex items-center gap-2 text-[13px] font-semibold text-[#888] hover:text-[#1A1A1A] transition-colors"
            >
              <ArrowLeft size={15} /> My Forms
            </button>

            {/* Form info card */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-[20px] font-bold text-[#1A1A1A] leading-tight">{selectedForm.title}</h2>
                  {selectedForm.description && (
                    <p className="text-[13px] text-[#888] mt-1">{selectedForm.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${selectedForm.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {selectedForm.is_active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                      {selectedForm.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${selectedForm.is_open ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'}`}>
                      {selectedForm.is_open ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {selectedForm.is_open ? 'Open' : 'Closed'}
                    </span>
                    {selectedForm.closes_at && (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 flex items-center gap-1">
                        <Calendar size={10} /> Closes {fmt(selectedForm.closes_at)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-[28px] font-black text-[#1A1A1A] leading-none">{selectedForm.submissions_count ?? 0}</p>
                    <p className="text-[11px] text-[#888]">submission{selectedForm.submissions_count !== 1 ? 's' : ''}</p>
                  </div>
                  <p className="text-[11px] text-[#AAAAAA]">Created {fmt(selectedForm.created_at)}</p>
                </div>
              </div>

              {selectedForm.share_link && (
                <div className="mt-4 pt-4 border-t border-[#F5F5F5] flex items-center gap-3">
                  <p className="text-[12px] text-[#AAAAAA] shrink-0">Share link</p>
                  <p className="text-[12px] text-[#8D5D1D] truncate flex-1">{selectedForm.share_link}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedForm.share_link)
                          .then(() => toast.success('Link copied!'))
                          .catch(() => toast.error('Could not copy'));
                      }}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-[#8D5D1D] hover:text-[#6B4615] transition-colors"
                    >
                      <Copy size={13} /> Copy
                    </button>
                    <a
                      href={selectedForm.share_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-[#8D5D1D] hover:text-[#6B4615] transition-colors"
                    >
                      <ExternalLink size={13} /> Open
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Submissions table */}
            <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#F0F0F0]">
                <h3 className="text-[15px] font-bold text-[#1A1A1A]">
                  Submissions
                  {!loadingSubs && (
                    <span className="ml-2 text-[12px] font-semibold text-[#AAAAAA]">({submissions.length})</span>
                  )}
                </h3>
              </div>

              {loadingSubs ? (
                <div className="p-5 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-[#F5F5F5] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-14 text-center">
                  <p className="text-[32px] mb-2">📭</p>
                  <p className="text-[14px] font-semibold text-[#1A1A1A]">No submissions yet</p>
                  <p className="text-[12.5px] text-[#AAAAAA] mt-1">Share the form link to start receiving applications.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[12.5px]">
                    <thead>
                      <tr className="text-[#AAAAAA] text-left border-b border-[#F5F5F5]">
                        <th className="px-5 py-3 font-medium">Artist</th>
                        <th className="px-4 py-3 font-medium">Discipline</th>
                        <th className="px-4 py-3 font-medium">Location</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Submitted</th>
                        <th className="px-4 py-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(sub => (
                        <tr
                          key={sub.id}
                          className="border-b border-[#F9F9F9] last:border-0 hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                          onClick={() => openSubmission(sub)}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-[#E0E0E0] overflow-hidden shrink-0">
                                {sub.artist_avatar
                                  ? <img src={sub.artist_avatar} alt={sub.artist_name} className="w-full h-full object-cover" />
                                  : <span className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold bg-[#8D5D1D]">
                                      {(sub.artist_name || '?').slice(0, 2).toUpperCase()}
                                    </span>
                                }
                              </div>
                              <span className="font-semibold text-[#1A1A1A]">{sub.artist_name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[#666] capitalize">{sub.artist_discipline || '—'}</td>
                          <td className="px-4 py-3 text-[#888]">{sub.artist_location || '—'}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={sub.status} display={sub.status_display} />
                          </td>
                          <td className="px-4 py-3 text-[#AAAAAA]">{fmt(sub.submitted_at)}</td>
                          <td className="px-4 py-3">
                            <ChevronRight size={14} className="text-[#CCCCCC]" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Submission detail drawer */}
      <SubmissionDrawer
        open={drawerOpen}
        detail={subDetail}
        loading={loadingDetail}
        onClose={closeDrawer}
        onUpdate={(updated) => {
          setSubDetail(updated);
          setSubmissions(prev =>
            prev.map(s => s.id === updated.id
              ? { ...s, status: updated.status, status_display: updated.status_display || updated.status, is_favorited: updated.is_favorited }
              : s
            )
          );
        }}
      />
    </DashboardLayout>
  );
};

export default OrgFormsPage;
