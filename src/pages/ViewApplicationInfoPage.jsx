import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import { applicationsAPI } from '@/services/index';
import toast from 'react-hot-toast';

/* ────────────────────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────────────────────────*/
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

/* Shared read-only field */
const ReadField = ({ label, value, wide }) => (
  <div className={`relative ${wide ? 'col-span-2' : ''}`}>
    <div className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[13px] bg-[#F7F4EE] text-gray-700 min-h-[48px]">
      {value || ''}
    </div>
    <span className="text-[11px] text-gray-500 font-medium absolute -top-2 left-3 bg-[#F7F4EE] px-1">
      {label}
    </span>
  </div>
);

/* ────────────────────────────────────────────────────────────────
   STEPPER
──────────────────────────────────────────────────────────────────*/
const STEPS = ['Details', 'Application', 'Application status'];

const Stepper = ({ current }) => (
  <div className="flex items-center gap-0 mb-8">
    {STEPS.map((label, i) => {
      const num      = i + 1;
      const isActive = current === num;
      const isDone   = current > num;
      return (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold border-2 transition-colors ${
              isActive ? 'bg-[#8D5D1D] border-[#8D5D1D] text-white'
                : isDone ? 'bg-[#8D5D1D] border-[#8D5D1D] text-white'
                : 'bg-white border-gray-300 text-gray-400'}`}>
              {num}
            </div>
            <span className={`text-[13px] font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 mx-3 h-px bg-gray-200" />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ────────────────────────────────────────────────────────────────
   STATUS BANNER CONFIG
──────────────────────────────────────────────────────────────────*/
const STATUS_CONFIG = {
  pending:      { label: 'Pending',      bg: 'bg-amber-50',   border: 'border-amber-300',  text: 'text-amber-800' },
  under_review: { label: 'In View',      bg: 'bg-amber-50',   border: 'border-amber-300',  text: 'text-amber-800' },
  shortlisted:  { label: 'Shortlisted',  bg: 'bg-blue-50',    border: 'border-blue-300',   text: 'text-blue-800' },
  accepted:     { label: 'Accepted',     bg: 'bg-green-50',   border: 'border-green-400',  text: 'text-green-800' },
  rejected:     { label: 'Rejected',     bg: 'bg-red-50',     border: 'border-red-300',    text: 'text-red-800' },
  withdrawn:    { label: 'Withdrawn',    bg: 'bg-gray-100',   border: 'border-gray-300',   text: 'text-gray-600' },
};

/* ────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────────*/
const ViewApplicationInfoPage = () => {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // internal nav for this page

  useEffect(() => {
    applicationsAPI.myApplicationDetail(id)
      .then(r => setApp(r.data.data || r.data))
      .catch(() => { toast.error('Could not load application'); navigate('/applications'); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div style={{ width: 36, height: 36, border: '3px solid rgba(139,105,20,0.2)', borderTopColor: '#8B6914', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </DashboardLayout>
    );
  }

  if (!app) return null;

  const opp     = app.opportunity || {};
  const catLabel = opp.title?.replace(/_/g, ' ') || '';
  const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;

  /* ── form responses — try both flat and nested ── */
  const formData = app.form_data || app.form_responses || app;

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="flex items-start gap-3 mb-2">
        <button
          onClick={() => navigate('/applications')}
          className="w-9 h-9 rounded-full bg-[#8D5D1D] flex items-center justify-center text-white shrink-0 mt-0.5 hover:bg-[#7A5019] transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="dash-page-title" style={{ marginBottom: 2 }}>View Application Info</h1>
          <p className="dash-page-sub" style={{ marginBottom: 0 }}>View history of your application</p>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-[14px] font-semibold text-gray-700 mb-6 ml-12">
        {[opp.organization_name || opp.title, catLabel].filter(Boolean).join(' | ')}
      </p>

      {/* Stepper */}
      <Stepper current={step} />

      {/* Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-[780px]">

        {/* ── Step 1: Opportunity Details ── */}
        {step === 1 && (
          <>
            <h3 className="font-bold text-[15px] text-gray-800 mb-5">Application Details - Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <ReadField label="Opportunity Title*" value={opp.title} />
              <ReadField label="Category"           value={catLabel} />
              <div className="col-span-2 relative">
                <div className="w-full border border-[#E5E5E5] rounded-xl px-4 py-3 text-[13px] bg-[#F7F4EE] text-gray-700 min-h-[100px] whitespace-pre-wrap">
                  {opp.description || ''}
                </div>
                <span className="text-[11px] text-gray-500 font-medium absolute -top-2 left-3 bg-[#F7F4EE] px-1">Description</span>
              </div>
              <ReadField label="Country"  value={opp.country} />
              <ReadField label="City"     value={opp.city} />
              <ReadField label="location" value={opp.location} wide />
              <ReadField label="Opportunity Creation Date" value={fmtDate(opp.created_at)} />
              <ReadField label="Application Status" value={opp.application_status} />
            </div>
          </>
        )}

        {/* ── Step 2: My Application ── */}
        {step === 2 && (
          <>
            <h3 className="font-bold text-[15px] text-gray-800 mb-5">My Application</h3>
            <div className="grid grid-cols-2 gap-4">
              <ReadField label="First name"            value={formData.first_name || app.first_name} />
              <ReadField label="Last name"             value={formData.last_name  || app.last_name} />
              <ReadField label="City"                  value={formData.city       || app.city} />
              <ReadField label="Country"               value={formData.country    || app.country} />
              {(formData.experience || app.experience) && (
                <ReadField label="Experience" value={formData.experience || app.experience} />
              )}
              {(formData.salary_range || app.salary_range) && (
                <ReadField label="Salary range" value={formData.salary_range || app.salary_range} />
              )}
              {(formData.address || app.address) && (
                <ReadField label="Address" value={formData.address || app.address} wide />
              )}
              {(formData.portfolio_link || app.portfolio_link) && (
                <ReadField label="Interflow Portfolio link" value={formData.portfolio_link || app.portfolio_link} wide />
              )}
            </div>
          </>
        )}

        {/* ── Step 3: Application Status ── */}
        {step === 3 && (
          <>
            <h3 className="font-bold text-[15px] text-gray-800 mb-5">My Application Status</h3>
            <div className={`rounded-xl border-2 ${statusCfg.bg} ${statusCfg.border} px-6 py-5 text-center mb-4`}>
              <p className={`text-[16px] font-bold ${statusCfg.text}`}>
                Status: {statusCfg.label}
              </p>
            </div>
            <p className="text-[13px] text-gray-500 text-center leading-relaxed">
              Further information regarding your progress for this application would be sent to you soon
            </p>
          </>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-6 py-2.5 rounded-full border border-gray-200 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            Previous
          </button>
          <button
            onClick={() => setStep(s => Math.min(3, s + 1))}
            disabled={step === 3}
            className="px-6 py-2.5 rounded-full bg-[#8D5D1D] text-white text-[13px] font-semibold hover:bg-[#7A5019] transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ViewApplicationInfoPage;
