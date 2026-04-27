import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/common/DashboardLayout';
import useAuthStore from '@/store/authStore';

// ── Mock data ──────────────────────────────────────────────────────────────
const APPLICATIONS_DATA = [
  { id: 1, name: 'Jack Daniels',     opportunity: 'Music Residency',    location: 'Abuja, Nigeria',  status: 'Approved' },
  { id: 2, name: 'Dayo Ajayi',       opportunity: 'Ignite Africa',       location: 'Lagos, Nigeria',  status: 'In view'  },
  { id: 3, name: 'Divine Onyekara',  opportunity: 'Maltina Dance all',   location: 'Jos, Nigeria',    status: 'Closed'   },
  { id: 4, name: 'Mercy Ajibola',    opportunity: 'Music Residency 2',   location: 'Lagos, Nigeria',  status: 'Approved' },
];

const ACTIVE_OPPS_DATA = [
  { id: 1, name: 'Music Residency', applications: 6, status: 'Active' },
  { id: 2, name: 'Music Residency', applications: 6, status: 'Active' },
  { id: 3, name: 'Music Residency', applications: 6, status: 'Active' },
  { id: 4, name: 'Music Residency', applications: 6, status: 'Active' },
];

// ── Sub-components ─────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    Approved: 'bg-green-100 text-green-700',
    'In view': 'bg-amber-100 text-amber-700',
    Closed:   'bg-red-100 text-red-600',
    Active:   'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
};

const ActiveOppsCard = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
      <p className="text-[14px] font-bold text-[#1A1A1A]">{title}</p>
      <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="text-[#888] text-left">
            <th className="pb-2 font-medium">Opportunities</th>
            <th className="pb-2 font-medium">Applications</th>
            <th className="pb-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {ACTIVE_OPPS_DATA.map(row => (
            <tr key={row.id} className="border-t border-gray-50">
              <td className="py-2 text-[#1A1A1A]">{row.name}</td>
              <td className="py-2 text-[#1A1A1A]">{row.applications}</td>
              <td className="py-2"><StatusBadge status={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/org/opportunities')}
          className="text-[12px] font-semibold"
          style={{ color: '#8D5D1D' }}
        >
          View all
        </button>
      </div>
    </div>
  );
};

// ── Donut chart (SVG) ──────────────────────────────────────────────────────
const DonutProgress = ({ percent = 60 }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E5E5E5" strokeWidth="10" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="#8D5D1D" strokeWidth="10"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
    </svg>
  );
};

// ── Pie/donut chart – gender distribution ──────────────────────────────────
const GenderPieChart = () => {
  // Male 40%, Female 35%, Others 25%
  const data = [
    { label: 'Male',   pct: 40, color: '#4E3B2B' },
    { label: 'Female', pct: 35, color: '#2196F3' },
    { label: 'Others', pct: 25, color: '#C69214' },
  ];
  const r = 55, cx = 80, cy = 80, inner = 30;
  let cumAngle = -90;

  const slices = data.map(d => {
    const start = cumAngle;
    cumAngle += (d.pct / 100) * 360;
    const end = cumAngle;
    const toRad = a => (a * Math.PI) / 180;
    const x1o = cx + r * Math.cos(toRad(start));
    const y1o = cy + r * Math.sin(toRad(start));
    const x2o = cx + r * Math.cos(toRad(end));
    const y2o = cy + r * Math.sin(toRad(end));
    const x1i = cx + inner * Math.cos(toRad(start));
    const y1i = cy + inner * Math.sin(toRad(start));
    const x2i = cx + inner * Math.cos(toRad(end));
    const y2i = cy + inner * Math.sin(toRad(end));
    const large = d.pct > 50 ? 1 : 0;
    const path = [
      `M ${x1o} ${y1o}`,
      `A ${r} ${r} 0 ${large} 1 ${x2o} ${y2o}`,
      `L ${x2i} ${y2i}`,
      `A ${inner} ${inner} 0 ${large} 0 ${x1i} ${y1i}`,
      'Z',
    ].join(' ');
    return { ...d, path };
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {slices.map(s => (
          <path key={s.label} d={s.path} fill={s.color} />
        ))}
      </svg>
      <div className="flex flex-col gap-2">
        {data.map(d => (
          <div key={d.label} className="flex items-center gap-2 text-[12px] text-[#444]">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
            {d.label} <span className="text-[#888]">({d.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────

const OrgDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [filterPill, setFilterPill] = useState('Music Residency');
  const filterPills = ['Music Residency', 'Ignite Africa', 'Dance 4 All', 'Music Residency 2.0', 'Migrate 1.0'];

  return (
    <DashboardLayout>
      {/* ── Main content wrapper ── */}
      <div className="relative min-h-full rounded-2xl" style={{ background: '#F8F8F7', padding: '28px 28px 40px' }}>

        {/* Decorative ring SVG */}
        <svg
          width="160" height="160" viewBox="0 0 160 160"
          style={{ position: 'absolute', top: -20, right: -20, opacity: 0.5, pointerEvents: 'none' }}
        >
          <circle cx="80" cy="80" r="60" fill="none" stroke="#8D5D1D" strokeWidth="2" strokeDasharray="8 6" />
          <circle cx="80" cy="80" r="44" fill="none" stroke="#8D5D1D" strokeWidth="1" opacity="0.5" />
          <circle cx="80" cy="80" r="74" fill="none" stroke="#C69214" strokeWidth="1" strokeDasharray="3 8" opacity="0.4" />
        </svg>

        {/* ── Section 1: Welcome ── */}
        <div className="mb-6">
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A', marginBottom: 4 }}>
            Welcome back!
          </h1>
          <p style={{ fontSize: 14, color: '#888' }}>Pick up from where you left off with Interflow</p>
        </div>

        {/* ── Section 2: Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* Card 1 – Opportunities posted (blue) */}
          <div
            className="rounded-2xl p-6 flex-1 flex flex-col gap-3"
            style={{ background: '#EBF4FF', minWidth: 160 }}
          >
            <p className="text-[12px] font-semibold" style={{ color: '#1565C0' }}>Opportunities posted</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="1.8">
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <line x1="9" y1="8" x2="15" y2="8" />
                  <line x1="9" y1="12" x2="15" y2="12" />
                  <line x1="9" y1="16" x2="12" y2="16" />
                </svg>
              </div>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#1565C0', lineHeight: 1 }}>10</span>
            </div>
          </div>

          {/* Card 2 – Active Opportunities (green) */}
          <div
            className="rounded-2xl p-6 flex-1 flex flex-col gap-3"
            style={{ background: '#EDFAF3', minWidth: 160 }}
          >
            <p className="text-[12px] font-semibold" style={{ color: '#1B7A4E' }}>Active Opportunities</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B7A4E" strokeWidth="1.8">
                  <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  <polyline points="9,12 11,14 15,10" />
                </svg>
              </div>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#1B7A4E', lineHeight: 1 }}>2</span>
            </div>
          </div>

          {/* Card 3 – Applications (amber) */}
          <div
            className="rounded-2xl p-6 flex-1 flex flex-col gap-3"
            style={{ background: '#FFF8EC', minWidth: 160 }}
          >
            <p className="text-[12px] font-semibold" style={{ color: '#B45309' }}>Applications</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.8">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#B45309', lineHeight: 1 }}>50</span>
            </div>
          </div>

          {/* Card 4 – Profile progress (white) */}
          <div
            className="rounded-2xl p-6 flex-1 bg-white shadow-sm border border-gray-100 flex flex-col items-center gap-2"
            style={{ minWidth: 200 }}
          >
            <p className="text-[13px] font-bold text-[#1A1A1A] self-start">Wild Dreams</p>
            <div className="relative flex items-center justify-center">
              <DonutProgress percent={60} />
              <span className="absolute text-[13px] font-bold text-[#1A1A1A]">60%</span>
            </div>
            <span
              className="text-[11px] font-semibold px-3 py-1 rounded-full"
              style={{ background: '#FFF3E0', color: '#8D5D1D' }}
            >
              Profile progress: Not completed (60%)
            </span>
            <button
              onClick={() => navigate('/org/profile')}
              className="text-[12px] font-semibold mt-1"
              style={{ color: '#8D5D1D' }}
            >
              Edit your company profile
            </button>
          </div>
        </div>

        {/* ── Section 3: Gender chart + Active Opps ── */}
        <div className="flex flex-col lg:flex-row gap-5 mb-5">

          {/* LEFT – Gender distribution */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4" style={{ flex: '1 1 340px' }}>
            {/* Header */}
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-bold text-[#1A1A1A]">Gender Application Distribution</p>
              <span
                className="text-[11px] font-semibold px-3 py-1 rounded-full text-white"
                style={{ background: '#8D5D1D' }}
              >
                2025
              </span>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {filterPills.map(pill => (
                <button
                  key={pill}
                  onClick={() => setFilterPill(pill)}
                  className="text-[11px] px-3 py-1 rounded-full border transition-all"
                  style={{
                    borderColor: filterPill === pill ? '#8D5D1D' : '#E0E0E0',
                    color: filterPill === pill ? '#8D5D1D' : '#666',
                    background: 'transparent',
                    fontWeight: filterPill === pill ? 600 : 400,
                  }}
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Pie chart */}
            <GenderPieChart />
          </div>

          {/* RIGHT – Two stacked Active Opps cards */}
          <div className="flex flex-col gap-4" style={{ flex: '1 1 300px' }}>
            <ActiveOppsCard title="Active Opportunities 1" />
            <ActiveOppsCard title="Active Opportunities 2" />
          </div>
        </div>

        {/* ── Section 4: Applications Overview + Active Opps ── */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* LEFT – Applications Overview */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4" style={{ flex: '1 1 420px' }}>
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-bold text-[#1A1A1A]">Applications Overview</p>
              <button
                onClick={() => navigate('/org/applications')}
                className="text-[12px] font-semibold"
                style={{ color: '#8D5D1D' }}
              >
                View all
              </button>
            </div>

            <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-[#888] text-left border-b border-gray-100">
                  <th className="pb-2 font-medium">Applicants</th>
                  <th className="pb-2 font-medium">Opportunity</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {APPLICATIONS_DATA.map(row => (
                  <tr key={row.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 font-medium text-[#1A1A1A]">{row.name}</td>
                    <td className="py-2.5 text-[#444]">{row.opportunity}</td>
                    <td className="py-2.5 text-[#666]">{row.location}</td>
                    <td className="py-2.5"><StatusBadge status={row.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* RIGHT – Active Opps card */}
          <div style={{ flex: '1 1 280px' }}>
            <ActiveOppsCard title="Active Opportunities" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrgDashboard;
