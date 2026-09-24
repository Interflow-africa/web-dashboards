import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, ChevronLeft, ChevronRight, AlertTriangle, CalendarDays } from 'lucide-react';
import AdminLayout from '@/components/common/AdminLayout';
import { adminAPI } from '@/services/api';
import { formatMoney } from '@/utils/currency';
import { imageUrl } from '@/utils/imageUrl';
import { eventStatusOf, STATUS_FILTERS, fmtUtc } from '@/utils/eventMeta';

const AdminEventsPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const status = params.get('status') || '';
  const page   = Number(params.get('page')) || 1;

  const [search, setSearch]       = useState(params.get('search') || '');
  const [debounced, setDebounced] = useState(search);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const setParam = useCallback((k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    if (k !== 'page') next.delete('page');
    setParams(next, { replace: true });
  }, [params, setParams]);

  useEffect(() => { setParam('search', debounced); /* eslint-disable-next-line */ }, [debounced]);

  useEffect(() => {
    let alive = true;
    setLoading(true); setError(null);
    const q = { page };
    if (status)    q.status = status;
    if (debounced) q.search = debounced;
    adminAPI.events(q)
      .then(r => { if (alive) setData(r.data || null); })
      .catch(err => {
        if (!alive) return;
        setError(err?.response?.data?.message || 'Could not load events.');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [status, debounced, page]);

  const rows  = data?.results || [];
  const count = data?.count ?? 0;
  const pages = data?.total_pages ?? 1;

  return (
    <AdminLayout
      title="Events"
      subtitle="All events, drafts included"
      actions={
        <button onClick={() => navigate('/admin/events/new')}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#8D5D1D' }}>
          <Plus size={15} /> Create event
        </button>
      }
    >
      <div className="flex flex-col gap-4 max-w-[1200px]">

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-[360px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A4B2]" />
            <input id="admin-events-search" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Event name…"
              className="w-full bg-white border border-[#D7DDE4] rounded-lg pl-9 pr-3 py-2.5 text-[13px] outline-none focus:border-[#8D5D1D] placeholder:text-[#98A4B2]" />
          </div>
          <select id="admin-events-status" value={status} onChange={e => setParam('status', e.target.value)}
            className="bg-white border border-[#D7DDE4] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#8D5D1D] cursor-pointer">
            {STATUS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          {!loading && (
            <p className="text-[12.5px] text-[#667382] ml-auto tabular-nums">{count} event{count === 1 ? '' : 's'}</p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <div key={i} className="h-[92px] bg-white rounded-xl border border-[#D7DDE4] animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-[#D7DDE4] p-12 text-center">
            <AlertTriangle size={22} className="text-[#A32B1C] mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-[#11161C]">{error}</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#D7DDE4] p-14 text-center">
            <CalendarDays size={26} className="text-[#98A4B2] mx-auto mb-3" />
            <p className="text-[14.5px] font-semibold text-[#11161C] mb-1">
              {status || debounced ? 'No events match' : 'No events yet'}
            </p>
            <p className="text-[13px] text-[#667382] mb-5">
              {status || debounced ? 'Try clearing the search or filter.' : 'Create one on behalf of an organisation.'}
            </p>
            {!status && !debounced && (
              <button onClick={() => navigate('/admin/events/new')}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold text-white"
                style={{ background: '#8D5D1D' }}>
                <Plus size={15} /> Create event
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map(ev => {
              const st    = eventStatusOf(ev.status);
              const sales = ev.sales || {};
              const cover = imageUrl(ev.image);
              return (
                <button key={ev.id} onClick={() => navigate(`/admin/events/${ev.id}`)}
                  className="w-full text-left bg-white rounded-xl border border-[#D7DDE4] p-4 flex gap-4 items-center hover:border-[#8D5D1D]/50 hover:shadow-sm transition-all">
                  <div className="w-[64px] h-[64px] rounded-lg bg-[#F6F8FA] shrink-0 overflow-hidden flex items-center justify-center">
                    {cover
                      ? <img src={cover} alt="" className="w-full h-full object-cover"
                          onError={e => { e.currentTarget.style.display = 'none'; }} />
                      : <CalendarDays size={20} className="text-[#C3CCD6]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[14.5px] text-[#11161C] truncate">{ev.name}</p>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0"
                        style={{ background: st.bg, color: st.fg }}>{st.label}</span>
                    </div>
                    <p className="text-[12.5px] text-[#667382] mt-0.5 truncate">
                      {fmtUtc(ev.start_at)}
                      {(ev.venue_name || ev.city) && ` · ${[ev.venue_name, ev.city].filter(Boolean).join(', ')}`}
                    </p>
                    {ev.organization_name && (
                      <p className="text-[12px] text-[#98A4B2] truncate mt-0.5">{ev.organization_name}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-[11px] text-[#98A4B2] uppercase tracking-[0.08em]">Sold</p>
                    <p className="text-[15px] font-bold text-[#11161C] tabular-nums leading-tight">
                      {sales.tickets_sold ?? 0}
                      {sales.tickets_total != null && <span className="text-[#98A4B2] font-normal"> / {sales.tickets_total}</span>}
                    </p>
                    {sales.net_settlement != null && (
                      <p className="text-[12px] text-[#667382] tabular-nums mt-0.5">
                        {formatMoney(sales.net_settlement, 'NGN')}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!loading && !error && pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] text-[#667382] tabular-nums">Page {data.current_page ?? page} of {pages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setParam('page', String(page - 1))} disabled={!data.previous} aria-label="Previous page"
                className="w-9 h-9 rounded-lg border border-[#D7DDE4] bg-white flex items-center justify-center text-[#3D4854] hover:bg-[#F6F8FA] disabled:opacity-35 disabled:cursor-not-allowed">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setParam('page', String(page + 1))} disabled={!data.next} aria-label="Next page"
                className="w-9 h-9 rounded-lg border border-[#D7DDE4] bg-white flex items-center justify-center text-[#3D4854] hover:bg-[#F6F8FA] disabled:opacity-35 disabled:cursor-not-allowed">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEventsPage;
