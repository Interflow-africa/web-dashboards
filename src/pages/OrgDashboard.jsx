import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import { dashboardAPI } from '@/services/api';

// ── Status badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase().replace(/\s+/g, '_');
  const map = {
    approved:     'bg-green-100 text-green-700',
    accepted:     'bg-green-100 text-green-700',
    published:    'bg-green-100 text-green-700',
    active:       'bg-green-100 text-green-700',
    pending:      'bg-amber-100 text-amber-700',
    under_review: 'bg-amber-100 text-amber-700',
    rejected:     'bg-red-100 text-red-600',
    closed:       'bg-red-100 text-red-600',
    cancelled:    'bg-red-100 text-red-600',
    draft:        'bg-gray-100 text-gray-500',
    withdrawn:    'bg-gray-100 text-gray-500',
  };
  const label = s === 'published' ? 'Active' : (status || '—');
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${map[s] ?? 'bg-gray-100 text-gray-500'}`}>
      {label}
    </span>
  );
};

// ── Active opportunities mini-table ────────────────────────────────────────
const ActiveOppsCard = ({ rows = [] }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3 h-full">
      <p className="text-[14px] font-bold text-[#1A1A1A]">Active Opportunities</p>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-[#888] text-left">
              <th className="pb-2 font-medium">Opportunities</th>
              <th className="pb-2 font-medium">Applications</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0
              ? rows.map(row => (
                  <tr key={row.id} className="border-t border-gray-50">
                    <td className="py-2 text-[#1A1A1A] truncate max-w-[120px]">{row.title || row.name || '—'}</td>
                    <td className="py-2 text-[#1A1A1A]">{row.applications_count ?? row.total_applications ?? row.applications ?? 0}</td>
                    <td className="py-2"><StatusBadge status={row.status} /></td>
                  </tr>
                ))
              : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-[#AAAAAA] text-[11px]">No active opportunities</td>
                  </tr>
                )
            }
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

// ── Donut chart (SVG) — profile progress ──────────────────────────────────
const DonutProgress = ({ percent = 0 }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(percent, 100) / 100) * circ;
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

// ── Gender donut chart (SVG only) ─────────────────────────────────────────
const GenderDonut = ({ slices = [] }) => {
  const total = slices.reduce((s, d) => s + (d.pct || 0), 0);
  const r = 55, cx = 80, cy = 80, inner = 30;

  if (total === 0) {
    return (
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill="#E5E5E5" />
        <circle cx={cx} cy={cy} r={inner} fill="white" />
      </svg>
    );
  }

  // Single non-zero slice → full circle
  const nonZero = slices.filter(s => s.pct > 0);
  if (nonZero.length === 1) {
    return (
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={cx} cy={cy} r={r} fill={nonZero[0].color} />
        <circle cx={cx} cy={cy} r={inner} fill="white" />
      </svg>
    );
  }

  let cumAngle = -90;
  const paths = slices.filter(s => s.pct > 0).map(d => {
    const start = cumAngle;
    cumAngle += (d.pct / total) * 360;
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
    const large = (d.pct / total) > 0.5 ? 1 : 0;
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
    <svg width="160" height="160" viewBox="0 0 160 160">
      {paths.map(s => <path key={s.label} d={s.path} fill={s.color} />)}
    </svg>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
const OrgDashboard = () => {
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const [orgName, setOrgName]         = useState('');
  const [stats, setStats]             = useState({ opportunitiesPosted: 0, activeOpps: 0, applications: 0, profileProgress: 0 });
  const [genderRaw, setGenderRaw]     = useState(null);   // full API response data object
  const [selectedOpp, setSelectedOpp] = useState(null);   // null = show totals
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [activeOpps, setActiveOpps]   = useState([]);
  const [appsOverview, setAppsOverview] = useState([]);

  // Derived from genderRaw
  const oppPills = Object.keys(genderRaw?.by_opportunity || {});
  const rawSlice = selectedOpp
    ? (genderRaw?.by_opportunity?.[selectedOpp] || {})
    : (genderRaw?.totals || {});
  const genderSlices = [
    { label: 'Male',        pct: rawSlice.male        ?? 0, color: '#4E3B2B' },
    { label: 'Female',      pct: rawSlice.female      ?? 0, color: '#2196F3' },
    { label: 'Others',      pct: rawSlice.other       ?? 0, color: '#C69214' },
    ...(rawSlice.unspecified > 0 ? [{ label: 'Unspecified', pct: rawSlice.unspecified, color: '#9E9E9E' }] : []),
  ];

  const fetchGender = useCallback((year) => {
    dashboardAPI.orgGenderDistribution({ year })
      .then(r => {
        const d = r.data?.data || r.data || {};
        setGenderRaw(d);
        setSelectedOpp(null);
      })
      .catch(() => setGenderRaw(null));
  }, []);

  useEffect(() => {
    Promise.allSettled([
      dashboardAPI.orgWelcome(),
      dashboardAPI.orgOpportunitiesPosted(),
      dashboardAPI.orgActiveOpportunitiesCount(),
      dashboardAPI.orgApplicationsCount(),
      dashboardAPI.orgProfileProgress(),
      dashboardAPI.orgActiveOpportunities({ limit: 4, offset: 0 }),
      dashboardAPI.orgApplicationsOverview({ limit: 5 }),
    ]).then(([welcome, oppsPosted, activeCount, appsCount, progress, activeOpp, appsOv]) => {
      if (welcome.status === 'fulfilled') {
        const d = welcome.value.data?.data || welcome.value.data || {};
        setOrgName(d.organization_name || d.name || '');
      }
      const getCount = (res) => {
        if (res.status !== 'fulfilled') return 0;
        const d = res.value.data?.data || res.value.data || {};
        return d.count ?? d.total ?? d.value ?? 0;
      };
      setStats({
        opportunitiesPosted: getCount(oppsPosted),
        activeOpps:          getCount(activeCount),
        applications:        getCount(appsCount),
        profileProgress: (() => {
          if (progress.status !== 'fulfilled') return 0;
          const d = progress.value.data?.data || progress.value.data || {};
          return d.percentage ?? d.progress ?? d.completion_percentage ?? 0;
        })(),
      });
      if (activeOpp.status === 'fulfilled') {
        const d = activeOpp.value.data?.data || activeOpp.value.data || {};
        setActiveOpps(Array.isArray(d) ? d : (d.results || []));
      }
      if (appsOv.status === 'fulfilled') {
        const d = appsOv.value.data?.data || appsOv.value.data || {};
        setAppsOverview(Array.isArray(d) ? d : (d.results || []));
      }
    });

    fetchGender(currentYear);
  }, [fetchGender, currentYear]);

  useEffect(() => {
    fetchGender(selectedYear);
  }, [selectedYear, fetchGender]);

  return (
    <DashboardLayout>
      <div className="relative min-h-full rounded-2xl" style={{ background: '#F8F8F7', padding: '28px 28px 40px' }}>

        {/* Decorative ring */}
        <svg
          width="160" height="160" viewBox="0 0 160 160"
          style={{ position: 'absolute', top: -20, right: -20, opacity: 0.5, pointerEvents: 'none' }}
        >
          <circle cx="80" cy="80" r="60" fill="none" stroke="#8D5D1D" strokeWidth="2" strokeDasharray="8 6" />
          <circle cx="80" cy="80" r="44" fill="none" stroke="#8D5D1D" strokeWidth="1" opacity="0.5" />
          <circle cx="80" cy="80" r="74" fill="none" stroke="#C69214" strokeWidth="1" strokeDasharray="3 8" opacity="0.4" />
        </svg>

        {/* Welcome */}
        <div className="mb-6">
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 26, color: '#1A1A1A', marginBottom: 4 }}>
            Welcome back{orgName ? `, ${orgName}` : ''}!
          </h1>
          <p style={{ fontSize: 14, color: '#888' }}>Pick up from where you left off with Interflow</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

          {/* Opportunities posted */}
          <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ background: '#EBF4FF' }}>
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
              <span style={{ fontSize: 36, fontWeight: 700, color: '#1565C0', lineHeight: 1 }}>{stats.opportunitiesPosted}</span>
            </div>
          </div>

          {/* Active Opportunities */}
          <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ background: '#EDFAF3' }}>
            <p className="text-[12px] font-semibold" style={{ color: '#1B7A4E' }}>Active Opportunities</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B7A4E" strokeWidth="1.8">
                  <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  <polyline points="9,12 11,14 15,10" />
                </svg>
              </div>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#1B7A4E', lineHeight: 1 }}>{stats.activeOpps}</span>
            </div>
          </div>

          {/* Applications */}
          <div className="rounded-2xl p-6 flex flex-col gap-3" style={{ background: '#FFF8EC' }}>
            <p className="text-[12px] font-semibold" style={{ color: '#B45309' }}>Applications</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth="1.8">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#B45309', lineHeight: 1 }}>{stats.applications}</span>
            </div>
          </div>

          {/* Profile progress */}
          <div className="rounded-2xl p-6 bg-white shadow-sm border border-gray-100 flex flex-col items-center gap-2">
            <p className="text-[13px] font-bold text-[#1A1A1A] self-start truncate w-full">{orgName || 'Organization'}</p>
            <div className="relative flex items-center justify-center">
              <DonutProgress percent={stats.profileProgress} />
              <span className="absolute text-[13px] font-bold text-[#1A1A1A]">{stats.profileProgress}%</span>
            </div>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full text-center" style={{ background: '#FFF3E0', color: '#8D5D1D' }}>
              Profile progress: {stats.profileProgress < 100 ? 'Not completed' : 'Completed'} ({stats.profileProgress}%)
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

        {/* Gender Distribution — full width */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-start gap-6">

            {/* Left: title + opportunity pills */}
            <div className="flex flex-col gap-3" style={{ minWidth: 170 }}>
              <p className="text-[14px] font-bold text-[#1A1A1A]">Gender Application Distribution</p>
              <div className="flex flex-col gap-2">
                {oppPills.map(opp => (
                  <button
                    key={opp}
                    onClick={() => setSelectedOpp(selectedOpp === opp ? null : opp)}
                    className="text-[11px] px-4 py-1.5 rounded-full border text-left transition-all"
                    style={{
                      borderColor: selectedOpp === opp ? '#8D5D1D' : '#E0E0E0',
                      color:       selectedOpp === opp ? '#8D5D1D' : '#666',
                      background:  'transparent',
                      fontWeight:  selectedOpp === opp ? 600 : 400,
                    }}
                  >
                    {opp}
                  </button>
                ))}
                {oppPills.length === 0 && (
                  <p className="text-[11px] text-[#AAAAAA]">No opportunities yet</p>
                )}
              </div>
            </div>

            {/* Center: donut chart */}
            <div className="flex-1 flex items-center justify-center py-2">
              <GenderDonut slices={genderSlices} />
            </div>

            {/* Right: year dropdown + legend */}
            <div className="flex flex-col items-end gap-4">
              {/* Year dropdown styled as pill */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  className="appearance-none pl-4 pr-8 py-1.5 rounded-full text-white text-[12px] font-semibold cursor-pointer"
                  style={{ background: '#8D5D1D', border: 'none', outline: 'none' }}
                >
                  {yearOptions.map(yr => <option key={yr} value={yr}>{yr}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 text-white pointer-events-none" />
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2.5 mt-2">
                {genderSlices.map(s => (
                  <div key={s.label} className="flex items-center gap-2 text-[12px] text-[#444]">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Applications Overview + Active Opps */}
        <div className="flex flex-col lg:flex-row gap-5">

          {/* Applications Overview */}
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
                  {appsOverview.length > 0
                    ? appsOverview.map(row => (
                        <tr key={row.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-2.5 font-medium text-[#1A1A1A]">
                            {row.artist_name || row.applicant_name || row.name || '—'}
                          </td>
                          <td className="py-2.5 text-[#444]">
                            {row.opportunity_title || row.opportunity || row.opp_title || '—'}
                          </td>
                          <td className="py-2.5 text-[#666]">
                            {row.artist_location || row.location || '—'}
                          </td>
                          <td className="py-2.5"><StatusBadge status={row.status} /></td>
                        </tr>
                      ))
                    : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-[#AAAAAA] text-[11px]">No applications yet</td>
                        </tr>
                      )
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* Single Active Opps card */}
          <div style={{ flex: '1 1 280px' }}>
            <ActiveOppsCard rows={activeOpps} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrgDashboard;
