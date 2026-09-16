import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ChevronRight, Ticket } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import { eventsAPI } from '@/services/index';
import { formatMoney } from '@/utils/currency';
import { imageUrl } from '@/utils/imageUrl';

/* Event lifecycle states (§6). */
const STATUS_PILL = {
  published: 'bg-green-100 text-green-700',
  draft:     'bg-gray-100 text-gray-500',
  paused:    'bg-amber-100 text-amber-700',
  sold_out:  'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-600',
};
const pillFor  = (s) => STATUS_PILL[s] || 'bg-gray-100 text-gray-500';
const labelFor = (e) => e.status_display || (e.status || '—').replace(/_/g, ' ');

const fmtDateTime = (iso) => {
  if (!iso) return '';
  /* Event times are stored and entered in UTC — render as given rather
     than shifting into the viewer's zone. */
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}`;
};

const pct = (sold, total) => {
  const s = Number(sold) || 0, t = Number(total) || 0;
  return t > 0 ? Math.min(100, Math.round((s / t) * 100)) : 0;
};

/* ─── One event row ─────────────────────────────────────────────── */
const EventRow = ({ event, onOpen }) => {
  const sales  = event.sales || {};
  const sold   = sales.tickets_sold ?? 0;
  const total  = sales.tickets_total ?? 0;
  const filled = pct(sold, total);

  return (
    <button
      onClick={() => onOpen(event)}
      className="w-full text-left bg-white rounded-2xl border border-[#EBEBEB] p-4 sm:p-5 hover:shadow-md hover:border-[#8D5D1D]/40 transition-all group flex gap-4 items-center">
      {/* Thumbnail */}
      <div className="w-[72px] h-[72px] rounded-xl bg-[#F4F2EE] shrink-0 overflow-hidden flex items-center justify-center">
        {imageUrl(event.image)
          ? <img src={imageUrl(event.image)} alt="" className="w-full h-full object-cover"
              onError={e => { e.currentTarget.style.display = 'none'; }} />
          : <Ticket size={22} className="text-[#CBBFA8]" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-[15px] text-[#1A1A1A] truncate group-hover:text-[#8D5D1D] transition-colors">
            {event.name}
          </p>
          <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${pillFor(event.status)}`}>
            {labelFor(event)}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-[12px] text-[#888] mt-1">
          {event.start_at && (
            <span className="flex items-center gap-1"><Calendar size={11} /> {fmtDateTime(event.start_at)}</span>
          )}
          {(event.venue_name || event.city) && (
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {[event.venue_name, event.city].filter(Boolean).join(', ')}
            </span>
          )}
        </div>

        {/* Sold progress */}
        <div className="mt-2.5 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-[#F0EDE6] overflow-hidden max-w-[220px]">
            <div className="h-full rounded-full" style={{ width: `${filled}%`, background: '#8D5D1D' }} />
          </div>
          <span className="text-[11.5px] text-[#888] shrink-0">
            {sold} / {total || '—'} sold
          </span>
        </div>
      </div>

      {/* Settlement — the number an organiser actually cares about */}
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-[10.5px] text-[#AAAAAA] uppercase tracking-wide">Net settlement</p>
        <p className="text-[17px] font-bold text-[#1A1A1A] leading-tight">
          {formatMoney(sales.net_settlement ?? 0, 'NGN')}
        </p>
      </div>

      <ChevronRight size={16} className="text-[#CCCCCC] shrink-0 group-hover:text-[#8D5D1D] transition-colors" />
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Organisation → Events
   Read-only. Scoped server-side: another org gets 404, artists 403.
   ═══════════════════════════════════════════════════════════════ */
const OrgEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    let alive = true;
    eventsAPI.orgEvents()
      .then(r => {
        if (!alive) return;
        const d = r.data?.data ?? r.data ?? [];
        setEvents(Array.isArray(d) ? d : (d.results || []));
      })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <DashboardLayout>
      <div className="mb-5">
        <h1 className="dash-page-title">Events</h1>
        <p className="dash-page-sub" style={{ marginBottom: 0 }}>
          Ticket sales and attendance for your events
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[108px] bg-white rounded-2xl border border-[#EBEBEB] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-14 text-center">
          <p className="text-[15px] font-semibold text-[#1A1A1A] mb-1">Could not load your events</p>
          <p className="text-[13px] text-[#AAAAAA]">Please refresh, or contact support if this continues.</p>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-16 text-center">
          <p className="text-[40px] mb-3">🎟️</p>
          <p className="text-[15px] font-semibold text-[#1A1A1A] mb-1">No events yet</p>
          <p className="text-[13px] text-[#AAAAAA] max-w-[380px] mx-auto leading-relaxed">
            Events are created by the Interflow team. Once yours is live, its ticket
            sales and attendance will appear here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map(ev => (
            <EventRow key={ev.id} event={ev} onOpen={e => navigate(`/org/events/${e.id}`)} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrgEventsPage;
