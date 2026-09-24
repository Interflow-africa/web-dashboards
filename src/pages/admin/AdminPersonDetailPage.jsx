import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Ban, RotateCcw, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/common/AdminLayout';
import { adminAPI } from '@/services/api';
import useAuthStore from '@/store/authStore';
import { verificationOf } from '@/utils/personStatus';

const fmtWhen = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  }) : '—';

const Field = ({ label, value, wide }) => (
  <div className={wide ? 'sm:col-span-2 lg:col-span-3' : ''}>
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A4B2] mb-1">{label}</p>
    <p className="text-[13.5px] text-[#11161C] break-words whitespace-pre-wrap">{value || '—'}</p>
  </div>
);

/* ─── Suspend / restore ───────────────────────────────────────────
   The reason is asked for here rather than afterwards: it is stored on
   the audit entry and is the only explanation anyone will find later. */
const AccessDialog = ({ person, suspending, onClose, onDone }) => {
  const [reason, setReason] = useState('');
  const [busy, setBusy]     = useState(false);
  const [failed, setFailed] = useState(null);

  const who = person.display_name || person.email;

  const submit = async () => {
    if (suspending && !reason.trim()) { setFailed('A reason is required.'); return; }
    setBusy(true); setFailed(null);
    try {
      const r = await adminAPI.setUserAccess(person.id, {
        is_active: !suspending,
        reason: reason.trim(),
      });
      toast.success(suspending ? 'Account suspended.' : 'Account restored.');
      onDone(r.data?.data || r.data || null);
    } catch (err) {
      setFailed(err?.response?.data?.message || 'That could not be completed.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[460px] max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E7ECF1]">
          <h2 className="font-bold text-[16px] text-[#11161C]">
            {suspending ? 'Suspend this account' : 'Restore this account'}
          </h2>
          <button onClick={onClose} disabled={busy}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#667382] hover:bg-[#EEF1F4] disabled:opacity-40">
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          <p className="text-[14px] text-[#11161C] leading-relaxed">
            {suspending ? <>Suspend <strong>{who}</strong>?</> : <>Restore access for <strong>{who}</strong>?</>}
          </p>
          <p className="text-[13px] text-[#667382] leading-relaxed -mt-2">
            {suspending
              ? 'They will be signed out and blocked from signing in again until restored.'
              : 'They will be able to sign in again immediately.'}
          </p>

          <div>
            <label htmlFor="access-reason" className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A4B2] mb-1.5">
              Reason {suspending && <span style={{ color: '#A32B1C' }}>*</span>}
              <span className="text-[#667382] font-normal normal-case tracking-normal"> (recorded on the audit log)</span>
            </label>
            <textarea id="access-reason" rows={3} value={reason} onChange={e => setReason(e.target.value)}
              placeholder={suspending ? 'e.g. spam, fraudulent listings…' : 'e.g. appeal upheld'}
              className="w-full border border-[#D7DDE4] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#8D5D1D] resize-y" />
          </div>

          {failed && (
            <div className="rounded-lg px-4 py-3 border" style={{ background: '#F7E2DE', borderColor: '#E8BDB4' }}>
              <p className="text-[13px]" style={{ color: '#7E2115' }}>{failed}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={busy}
              className="flex-1 h-11 rounded-lg border border-[#D7DDE4] text-[13.5px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA] disabled:opacity-50">
              Cancel
            </button>
            <button onClick={submit} disabled={busy}
              className="flex-1 h-11 rounded-lg text-white text-[13.5px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: suspending ? '#A32B1C' : '#146B47' }}>
              {busy ? 'Working…' : suspending ? 'Suspend' : 'Restore'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Verification (organisations only) ─────────────────────────── */
const VerifyDialog = ({ person, onClose, onDone }) => {
  const [status, setStatus] = useState(person.profile?.verification_status || 'under_review');
  const [notes, setNotes]   = useState('');
  const [busy, setBusy]     = useState(false);
  const [failed, setFailed] = useState(null);

  const submit = async () => {
    setBusy(true); setFailed(null);
    try {
      const r = await adminAPI.setVerification(person.id, { status, notes: notes.trim() });
      toast.success('Verification updated.');
      onDone(r.data?.data || r.data || null);
    } catch (err) {
      setFailed(err?.response?.data?.message || 'That could not be saved.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[460px] max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E7ECF1]">
          <h2 className="font-bold text-[16px] text-[#11161C]">Verification</h2>
          <button onClick={onClose} disabled={busy}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#667382] hover:bg-[#EEF1F4] disabled:opacity-40">
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          <p className="text-[13.5px] text-[#667382]">
            {person.profile?.organization_name || person.display_name}
          </p>

          <div>
            <label htmlFor="verify-status" className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A4B2] mb-1.5">Status</label>
            <select id="verify-status" value={status} onChange={e => setStatus(e.target.value)}
              className="w-full bg-white border border-[#D7DDE4] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#8D5D1D] cursor-pointer">
              <option value="pending">Pending</option>
              <option value="under_review">Under review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label htmlFor="verify-notes" className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A4B2] mb-1.5">
              Notes <span className="text-[#667382] font-normal normal-case tracking-normal">(what you checked)</span>
            </label>
            <textarea id="verify-notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. CAC certificate checked against name"
              className="w-full border border-[#D7DDE4] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#8D5D1D] resize-y" />
          </div>

          {failed && (
            <div className="rounded-lg px-4 py-3 border" style={{ background: '#F7E2DE', borderColor: '#E8BDB4' }}>
              <p className="text-[13px]" style={{ color: '#7E2115' }}>{failed}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={busy}
              className="flex-1 h-11 rounded-lg border border-[#D7DDE4] text-[13.5px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA] disabled:opacity-50">
              Cancel
            </button>
            <button onClick={submit} disabled={busy}
              className="flex-1 h-11 rounded-lg text-white text-[13.5px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: '#8D5D1D' }}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPersonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const me = useAuthStore(s => s.user);

  const [person, setPerson]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [access, setAccess]   = useState(false);
  const [verify, setVerify]   = useState(false);

  useEffect(() => {
    let alive = true;
    adminAPI.user(id)
      .then(r => { if (alive) setPerson(r.data?.data || r.data || null); })
      .catch(err => {
        if (!alive) return;
        setError(err?.response?.status === 403
          ? 'This account is not an admin.'
          : (err?.response?.data?.message || 'This person could not be found.'));
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="Person">
        <div className="max-w-[900px] flex flex-col gap-4">
          <div className="h-[130px] bg-white rounded-xl border border-[#D7DDE4] animate-pulse" />
          <div className="h-[200px] bg-white rounded-xl border border-[#D7DDE4] animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !person) {
    return (
      <AdminLayout title="Person">
        <button onClick={() => navigate('/admin/people')}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#667382] hover:text-[#11161C] mb-4">
          <ArrowLeft size={15} /> People
        </button>
        <div className="bg-white rounded-xl border border-[#D7DDE4] p-12 text-center">
          <AlertTriangle size={22} className="text-[#A32B1C] mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-[#11161C]">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  const profile = person.profile;            // null for admins / abandoned onboarding
  const isOrg   = profile?.type === 'organization';
  const v       = verificationOf(person.verification_status || profile?.verification_status);
  const activity = person.activity || {};

  /* Suspending your own account returns 400, so the control is hidden
     rather than left to be discovered. */
  const isSelf = Boolean(me?.email && person.email && me.email === person.email);

  return (
    <AdminLayout
      title={person.display_name || person.email}
      subtitle={person.email}
      actions={
        <div className="flex items-center gap-2">
          {isOrg && (
            <button onClick={() => setVerify(true)}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#D7DDE4] text-[13px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA]">
              <ShieldCheck size={14} /> Verification
            </button>
          )}
          {!isSelf && (
            person.is_active ? (
              <button onClick={() => setAccess(true)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#A32B1C' }}>
                <Ban size={14} /> Suspend
              </button>
            ) : (
              <button onClick={() => setAccess(true)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: '#146B47' }}>
                <RotateCcw size={14} /> Restore
              </button>
            )
          )}
        </div>
      }
    >
      <div className="max-w-[900px] flex flex-col gap-4">
        <button onClick={() => navigate('/admin/people')}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#667382] hover:text-[#11161C] self-start">
          <ArrowLeft size={15} /> People
        </button>

        {!person.is_active && (
          <div className="rounded-xl px-4 py-3.5 flex items-start gap-3" style={{ background: '#F7E2DE' }}>
            <Ban size={18} style={{ color: '#A32B1C' }} className="shrink-0 mt-0.5" />
            <p className="text-[13.5px]" style={{ color: '#7E2115' }}>
              <strong>This account is suspended.</strong> They cannot sign in.
            </p>
          </div>
        )}

        {/* Account */}
        <div className="bg-white rounded-xl border border-[#D7DDE4] p-5">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-md capitalize"
              style={{ background: '#EEF1F4', color: '#3D4854' }}>{person.role || 'no role'}</span>
            {person.is_staff && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ background: '#F3E7D3', color: '#8D5D1D' }}>Staff</span>
            )}
            {v && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ background: v.bg, color: v.fg }}>{v.label}</span>
            )}
            {isSelf && (
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ background: '#E7EEF6', color: '#1F4E79' }}>You</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <Field label="Email" value={person.email} />
            <Field label="Email verified" value={person.is_email_verified ? 'Yes' : 'No'} />
            <Field label="Onboarded" value={person.is_onboarded ? 'Yes' : `No${profile?.onboarding_step ? ` — step ${profile.onboarding_step}` : ''}`} />
            <Field label="Joined" value={fmtWhen(person.date_joined)} />
            <Field label="Last seen" value={person.last_login ? fmtWhen(person.last_login) : 'Never'} />
            {Object.entries(activity).map(([k, val]) => (
              <Field key={k} label={k.replace(/_/g, ' ')} value={val} />
            ))}
          </div>
        </div>

        {/* Profile — shape differs by type, and may be absent entirely */}
        {profile ? (
          <div className="bg-white rounded-xl border border-[#D7DDE4] p-5">
            <h2 className="font-bold text-[14px] text-[#11161C] mb-4">
              {isOrg ? 'Organisation' : 'Artist profile'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {isOrg ? (
                <>
                  <Field label="Name" value={profile.organization_name} />
                  <Field label="Industry" value={profile.industry} />
                  <Field label="Location" value={[profile.city, profile.country].filter(Boolean).join(', ')} />
                  <Field label="Phone" value={profile.phone_number} />
                  <Field label="Business email" value={profile.business_email} />
                  <Field label="Website" value={profile.website} />
                  <Field label="About" value={profile.description} wide />
                  {profile.verification_notes && (
                    <Field label="Verification notes" value={profile.verification_notes} wide />
                  )}
                </>
              ) : (
                <>
                  <Field label="Full name" value={profile.full_name} />
                  <Field label="Discipline" value={profile.primary_discipline?.replace(/_/g, ' ')} />
                  <Field label="Career stage" value={profile.career_stage?.replace(/_/g, ' ')} />
                  <Field label="Location" value={[profile.city, profile.country].filter(Boolean).join(', ')} />
                  <Field label="Phone" value={profile.phone_number} />
                  <Field label="Bio" value={profile.bio} wide />
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#D7DDE4] p-8 text-center">
            <p className="text-[13.5px] text-[#667382]">
              No profile yet — an admin account, or onboarding was never finished.
            </p>
          </div>
        )}
      </div>

      {access && (
        <AccessDialog
          person={person}
          suspending={person.is_active}
          onClose={() => setAccess(false)}
          onDone={(updated) => {
            setAccess(false);
            if (updated) setPerson(updated);
            else adminAPI.user(id).then(r => setPerson(r.data?.data || r.data)).catch(() => {});
          }}
        />
      )}
      {verify && (
        <VerifyDialog
          person={person}
          onClose={() => setVerify(false)}
          onDone={(updated) => {
            setVerify(false);
            if (updated) setPerson(updated);
            else adminAPI.user(id).then(r => setPerson(r.data?.data || r.data)).catch(() => {});
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminPersonDetailPage;
