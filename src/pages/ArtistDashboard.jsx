import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Eye, Briefcase, ChevronLeft, ChevronRight, Upload, ArrowRight } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import { dashboardAPI, connectionsAPI } from '@/services/api';
import useAuthStore from '@/store/authStore';

/* ── Stat card ── */
const StatCard = ({ title, value, sub, icon: Icon, bgColor, iconBg }) => (
  <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: bgColor }}>
    <p className="text-[13px] font-semibold text-[#444] leading-tight">{title}</p>
    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: iconBg }}>
      <Icon size={22} strokeWidth={1.6} className="text-white" />
    </div>
    <p className="text-[38px] font-black text-[#1A1A1A] leading-none">{value}</p>
    {sub && <p className="text-[12px] text-[#888]">{sub}</p>}
  </div>
);

/* ── Opportunity card ── */
const OppCard = ({ opp }) => {
  const navigate = useNavigate();
  const initials  = opp.organization_name?.slice(0, 3).toUpperCase() || 'ORG';
  const BG_COLORS = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#06B6D4'];
  const color     = BG_COLORS[(opp.id || 0) % BG_COLORS.length] || '#3B82F6';

  return (
    <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 min-w-[240px] max-w-[260px] shrink-0 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        {opp.organization_logo
          ? <img src={opp.organization_logo} alt={initials} className="w-10 h-10 rounded-full object-cover" />
          : (
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-bold" style={{ background: color }}>
              {initials}
            </div>
          )
        }
        <div>
          <p className="text-[13.5px] font-bold text-[#1A1A1A] leading-tight">{opp.organization_name}</p>
          <p className="text-[11.5px] text-[#888]">{opp.location || opp.city}</p>
        </div>
      </div>

      <p className="text-[13px] font-semibold text-[#1A1A1A] mb-1">{opp.title}</p>
      <p className="text-[11.5px] text-[#888] mb-2">{opp.sub_title || opp.subtitle}</p>
      <p className="text-[11px] text-[#AAAAAA] mb-3">
        {opp.posted_ago ? `Posted ${opp.posted_ago} ago · ` : ''}
        {opp.deadline ? `Deadline ${opp.deadline} · ` : ''}
        {opp.type || opp.opportunity_type || ''}
      </p>
      <p className="text-[12px] text-[#666] mb-3 line-clamp-2 leading-relaxed">{opp.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {(opp.tags || opp.disciplines || []).slice(0, 2).map((t, i) => (
          <span key={i} className="text-[11px] px-2.5 py-0.5 bg-[#F5EDD6] text-[#8B6914] rounded-full">{t}</span>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate('/opportunities')}
          className="flex-1 py-2 rounded-full border border-[#1A1A1A] text-[12.5px] font-semibold text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
        >
          More Info
        </button>
        <button
          onClick={() => navigate('/opportunities')}
          className="flex-1 py-2 rounded-full bg-[#8B6914] text-white text-[12.5px] font-semibold hover:bg-[#7A5C12] transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

/* ── Activity row ── */
const ActivityRow = ({ item }) => (
  <div className="flex items-center gap-4 py-3 border-b border-[#F0F0F0] last:border-0">
    <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
      <Upload size={16} className="text-[#3B82F6]" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13.5px] font-semibold text-[#1A1A1A] truncate">
        {item.title || item.description || item.activity_type || '—'}
      </p>
      {(item.file_type || item.details || item.subtitle) && (
        <p className="text-[12px] text-[#888]">
          {item.file_type
            ? `File Type: ${item.file_type} · File Location: ${item.location} · File size: ${item.size}`
            : (item.details || item.subtitle || '')}
        </p>
      )}
    </div>
    <p className="text-[12px] text-[#AAAAAA] shrink-0 ml-2">
      {item.date || item.created_at || ''}
    </p>
  </div>
);

/* ── Connection suggestion ── */
const ConnectionCard = ({ person, onConnect, connecting }) => {
  const name = person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim() || '—';
  const role = person.role || person.discipline || person.bio || '';
  const avatar = person.avatar || person.profile_picture || person.img || '';

  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F5F5F5] last:border-0">
      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#ddd] shrink-0">
        {avatar
          ? <img src={avatar} alt={name} className="w-full h-full object-cover"
              onError={e => { e.currentTarget.parentElement.style.background='#8B6914'; e.currentTarget.style.display='none'; }} />
          : <span className="w-full h-full flex items-center justify-center text-white text-[11px] font-bold bg-[#8B6914]">
              {name.slice(0, 2).toUpperCase()}
            </span>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13.5px] font-semibold text-[#1A1A1A] leading-tight">{name}</p>
        <p className="text-[12px] text-[#888] truncate">{role}</p>
      </div>
      <button
        onClick={() => onConnect(person.id)}
        disabled={connecting}
        className="bg-[#8B6914] text-white text-[12px] font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-[#7A5C12] transition-colors shrink-0 disabled:opacity-60"
      >
        {connecting ? 'Sending…' : 'Connect'} {!connecting && <ArrowRight size={12} />}
      </button>
    </div>
  );
};

/* ── Donut progress ── */
const Donut = ({ pct = 0 }) => {
  const r = 38, cx = 48, cy = 48;
  const circ = 2 * Math.PI * r;
  const dash = circ * (Math.min(pct, 100) / 100);
  return (
    <svg width={96} height={96} viewBox="0 0 96 96">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EBEBEB" strokeWidth="8" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke="#3B82F6" strokeWidth="8"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy + 6} textAnchor="middle" fontSize="16" fontWeight="800" fill="#1A1A1A">{pct}%</text>
    </svg>
  );
};

/* ════════════════════════════════════════════════════════════════ */
/*  Main Dashboard                                                 */
/* ════════════════════════════════════════════════════════════════ */
const ArtistDashboard = () => {
  const { user }   = useAuthStore();
  const navigate   = useNavigate();

  const [stats, setStats]           = useState({ connections: 0, viewers: 0, applications: 0, progress: 0 });
  const [opps, setOpps]             = useState([]);
  const [activity, setActivity]     = useState([]);
  const [connections, setConnections] = useState([]);
  const [updates, setUpdates]       = useState([]);
  const [tab, setTab]               = useState('updates');
  const [oppPage, setOppPage]       = useState(0);
  const [connectingId, setConnectingId] = useState(null);

  const firstName = user?.profile.first_name || user?.email?.split('@')[0] || 'Artist';
  const fullName  = user?.profile.full_name ? `${user.profile.full_name || user.profile.first_name}`.trim() : firstName;

  useEffect(() => {
    // Fire all dashboard requests in parallel
    Promise.allSettled([
      dashboardAPI.artistConnectionsCount(),
      dashboardAPI.artistPortfolioViewers({ days: 10 }),
      dashboardAPI.artistApplicationsCount(),
      dashboardAPI.artistProfileProgress(),
      dashboardAPI.artistOpportunitiesForYou(),
      dashboardAPI.artistConnectionsClose(),
      dashboardAPI.artistRecentActivity(),
      dashboardAPI.artistUpdates(),
    ]).then(([conns, viewers, apps, progress, oppsRes, closeConns, recentAct, updatesRes]) => {
      const get = (res) => (res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || {}) : {});
      const getCount = (res) => {
        const d = get(res);
        return d.count ?? d.total ?? d.value ?? 0;
      };

      setStats({
        connections:  getCount(conns),
        viewers:      getCount(viewers),
        applications: getCount(apps),
        progress:     (() => {
          const d = get(progress);
          return d.percentage ?? d.progress ?? d.completion_percentage ?? 0;
        })(),
      });

      if (oppsRes.status === 'fulfilled') {
        const d = oppsRes.value.data?.data || oppsRes.value.data || {};
        setOpps(Array.isArray(d) ? d : (d.results || []));
      }

      if (closeConns.status === 'fulfilled') {
        const d = closeConns.value.data?.data || closeConns.value.data || {};
        setConnections(Array.isArray(d) ? d : (d.results || []));
      }

      if (recentAct.status === 'fulfilled') {
        const d = recentAct.value.data?.data || recentAct.value.data || {};
        setActivity(Array.isArray(d) ? d : (d.results || []));
      }

      if (updatesRes.status === 'fulfilled') {
        const d = updatesRes.value.data?.data || updatesRes.value.data || {};
        setUpdates(Array.isArray(d) ? d : (d.results || []));
      }
    });
  }, []);

  const handleConnect = (recipientId) => {
    setConnectingId(recipientId);
    connectionsAPI.send({ recipient: recipientId })
      .then(() => {
        setConnections(prev => prev.filter(c => c.id !== recipientId));
      })
      .catch(() => {})
      .finally(() => setConnectingId(null));
  };

  const STAT_CARDS = [
    { title: 'My Connections',    value: stats.connections,  icon: Users,    bgColor: '#DBEAFE', iconBg: '#3B82F6' },
    { title: 'Portfolio Viewers', value: stats.viewers,      icon: Eye,      bgColor: '#D1FAE5', iconBg: '#10B981', sub: 'In the last 10 days' },
    { title: 'My Applications',   value: stats.applications, icon: Briefcase,bgColor: '#FEF3C7', iconBg: '#F59E0B' },
  ];

  const visibleOpps = opps.slice(oppPage * 4, oppPage * 4 + 4);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[24px] font-bold text-[#1A1A1A]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Welcome back, {firstName}!
        </h1>
        <p className="text-[13.5px] text-[#888] mt-0.5">Pick up from where you left off with Interflow</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(c => <StatCard key={c.title} {...c} />)}

        {/* Profile completion */}
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5 flex flex-col items-center justify-center gap-2">
          <p className="text-[13px] font-semibold text-[#444]">{fullName}</p>
          <Donut pct={stats.progress} />
          <div
            className="w-full bg-[#F5F5F5] rounded-xl p-3 flex items-center gap-3 mt-1 cursor-pointer hover:bg-[#EBEBEB] transition-colors"
            onClick={() => navigate('/portfolio')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center">
              <Briefcase size={15} className="text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-[11px] text-[#888] leading-tight">Portfolio progress: Not completed ({stats.progress}%)</p>
              <p className="text-[11.5px] font-semibold text-[#1A1A1A]">Edit your portfolio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities + right sidebar */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left main */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* Opportunities for you */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-bold text-[#1A1A1A]">Opportunities for you</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOppPage(p => Math.max(0, p - 1))}
                  className="w-7 h-7 rounded-full border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setOppPage(p => p + 1)}
                  disabled={oppPage * 4 + 4 >= opps.length && opps.length > 0}
                  className="w-7 h-7 rounded-full border border-[#E0E0E0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
                <button onClick={() => navigate('/opportunities')} className="text-[12.5px] font-semibold text-[#8B6914] hover:underline ml-1">
                  See all
                </button>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {visibleOpps.length > 0
                ? visibleOpps.map(o => <OppCard key={o.id} opp={o} />)
                : [1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-[#F9F9F9] rounded-2xl min-w-[240px] h-[280px] animate-pulse" />
                  ))
              }
            </div>
          </div>

          {/* Updates / Industry news */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6">
            <div className="flex items-center gap-6 border-b border-[#F0F0F0] mb-5">
              {['updates', 'news'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-3 text-[13.5px] font-semibold capitalize transition-colors ${
                    tab === t ? 'text-[#1A1A1A] border-b-2 border-[#8B6914]' : 'text-[#AAAAAA]'
                  }`}
                >
                  {t === 'updates' ? 'Updates for you' : 'Latest Industry news'}
                </button>
              ))}
            </div>
            {tab === 'updates' && updates.length > 0
              ? updates.map((u, i) => (
                  <div key={i} className="py-3 border-b border-[#F0F0F0] last:border-0">
                    <p className="text-[13.5px] font-semibold text-[#1A1A1A]">{u.title || u.message}</p>
                    {u.body && <p className="text-[12px] text-[#888] mt-0.5">{u.body}</p>}
                  </div>
                ))
              : (
                  <div className="text-center py-10 text-[#BBBBBB] text-[13.5px]">
                    You currently do not have any update at the moment.
                  </div>
                )
            }
          </div>

          {/* Recent activity */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-6">
            <h3 className="text-[15px] font-bold text-[#1A1A1A] mb-4">Your Recent Activity</h3>
            {activity.length > 0
              ? activity.map((a, i) => <ActivityRow key={i} item={a} />)
              : (
                  <div className="text-center py-8 text-[#BBBBBB] text-[13px]">
                    No recent activity yet.
                  </div>
                )
            }
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-full xl:w-[260px] xl:shrink-0">
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Eye size={15} className="text-[#8B6914]" />
              <h3 className="text-[14px] font-bold text-[#1A1A1A]">Connections close to you</h3>
            </div>
            {connections.length > 0
              ? connections.map(c => (
                  <ConnectionCard
                    key={c.id}
                    person={c}
                    onConnect={handleConnect}
                    connecting={connectingId === c.id}
                  />
                ))
              : (
                  <div className="text-center py-6 text-[#BBBBBB] text-[12.5px]">
                    No suggestions right now.
                  </div>
                )
            }
            <button
              onClick={() => navigate('/network')}
              className="text-[12.5px] font-semibold text-[#8B6914] hover:underline mt-3 w-full text-right block"
            >
              See all
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ArtistDashboard;
