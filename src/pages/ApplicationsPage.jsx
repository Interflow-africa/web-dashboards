import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/common/DashboardLayout';
import { applicationsAPI } from '@/services/index';
import toast from 'react-hot-toast';

/* ────────────────────────────────────────────────────────────────
   HELPERS
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

/* ────────────────────────────────────────────────────────────────
   APPLICATION CARD
──────────────────────────────────────────────────────────────────*/
const AppCard = ({ app, onView }) => {
  const opp      = app.opportunity || {};
  const name     = opp.organization_name || opp.title || '';
  const color    = getColor(name);
  const initials = getInitials(name);
  const tags     = (opp.disciplines || []).slice(0, 3).map(d => DISCIPLINE_LABELS[d] || d);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
          style={{ backgroundColor: color, border: '2px solid #D4A84B' }}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-[14px] text-gray-900 truncate leading-snug">{name}</p>
          <p className="text-[12px] text-gray-400 truncate">
            {[opp.city, opp.country].filter(Boolean).join(', ') || opp.location || 'Location TBD'}
          </p>
          <p className="text-[12px] text-gray-500">{opp.title?.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {/* Meta */}
      <p className="text-[11px] text-gray-400 leading-relaxed">
        {[
          relativeTime(app.created_at),
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

      {/* Action */}
      <button
        onClick={() => onView(app)}
        className="w-full h-10 rounded-full bg-[#8D5D1D] text-white text-[12px] font-semibold hover:bg-[#7A5019] transition-colors mt-auto">
        View Application
      </button>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────────*/
const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [apps, setApps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [submitted, setSubmitted] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (submitted) params.search = submitted;
    applicationsAPI.myApplications(params)
      .then(r => setApps(r.data.results || r.data.data || []))
      .catch(() => toast.error('Failed to load applications'))
      .finally(() => setLoading(false));
  }, [submitted]);

  useEffect(() => { load(); }, [load]);

  /* Derived stats */
  const thirtyDaysAgo = Date.now() - 30 * 86_400_000;
  const recentCount   = apps.filter(a => new Date(a.created_at).getTime() >= thirtyDaysAgo).length;

  /* Filter client-side by search for instant feel */
  const displayed = submitted
    ? apps.filter(a =>
        (a.opportunity?.title || '').toLowerCase().includes(submitted.toLowerCase()) ||
        (a.opportunity?.organization_name || '').toLowerCase().includes(submitted.toLowerCase())
      )
    : apps;

  const handleSearch = () => setSubmitted(search);

  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="dash-page-title">Applications</h1>
        <p className="dash-page-sub" style={{ marginBottom: 0 }}>View history of your applications</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-5 justify-end">
        <div className="relative max-w-[280px] w-full">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search application..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-[13px] outline-none focus:border-[#8D5D1D] bg-white placeholder:text-gray-300"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-3 bg-[#8D5D1D] text-white rounded-xl text-[13px] font-semibold hover:bg-[#7A5019] transition-colors shrink-0">
          Search
        </button>
      </div>

      {/* Stats card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-2xl p-5 flex gap-4 items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-blue-900">All Applications</p>
            <p className="text-[32px] font-bold text-blue-900 leading-none mt-1">{apps.length}</p>
            <p className="text-[11px] text-blue-500 mt-1">In the last 30 days: {recentCount}</p>
          </div>
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-[14px] font-semibold text-gray-700 mb-4">
          Showing {displayed.length} of {apps.length} Application{apps.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1"><div className="h-3 bg-gray-200 rounded mb-2 w-3/4" /><div className="h-2.5 bg-gray-100 rounded w-1/2" /></div>
              </div>
              <div className="h-2.5 bg-gray-100 rounded mb-2" /><div className="h-2.5 bg-gray-100 rounded w-2/3 mb-4" />
              <div className="h-10 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <div className="text-[40px] mb-3">📋</div>
          <p className="font-semibold text-gray-700 mb-1">
            {apps.length === 0 ? 'No applications yet' : 'No results found'}
          </p>
          <p className="text-[13px] text-gray-400">
            {apps.length === 0
              ? 'Browse opportunities and apply to get started!'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map(app => (
            <AppCard
              key={app.id}
              app={app}
              onView={a => navigate(`/applications/${a.id}`)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ApplicationsPage;
