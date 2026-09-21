import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, AlertTriangle, MailWarning } from 'lucide-react';
import AdminLayout from '@/components/common/AdminLayout';
import { adminAPI } from '@/services/api';
import { formatMoney } from '@/utils/currency';
import { statusOf, STATUS_FILTERS } from '@/utils/orderStatus';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const Chip = ({ status }) => {
  const s = statusOf(status);
  return (
    <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap"
      style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
};

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  /* URL is the source of truth so Overview can deep-link a filter. */
  const status = params.get('status') || '';
  const event  = params.get('event')  || '';
  const page   = Number(params.get('page')) || 1;

  const [search, setSearch]     = useState(params.get('search') || '');
  const [debounced, setDebounced] = useState(search);
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const setParam = useCallback((k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    if (k !== 'page') next.delete('page');       // a new filter resets paging
    setParams(next, { replace: true });
  }, [params, setParams]);

  useEffect(() => { setParam('search', debounced); /* eslint-disable-next-line */ }, [debounced]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    const q = { page };
    if (status)    q.status = status;
    if (event)     q.event  = event;
    if (debounced) q.search = debounced;

    adminAPI.orders(q)
      .then(r => { if (alive) setData(r.data || null); })
      .catch(err => {
        if (!alive) return;
        setError(err?.response?.data?.message || 'Could not load orders.');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [status, event, debounced, page]);

  const rows  = data?.results || [];
  const count = data?.count ?? 0;
  const pages = data?.total_pages ?? 1;

  return (
    <AdminLayout title="Orders" subtitle="Every sale, searchable by buyer, order number or payment reference">
      <div className="flex flex-col gap-4 max-w-[1200px]">

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-[380px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A4B2]" />
            <input
              id="admin-orders-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, email, order number, payment reference…"
              className="w-full bg-white border border-[#D7DDE4] rounded-lg pl-9 pr-3 py-2.5 text-[13px] outline-none focus:border-[#8D5D1D] placeholder:text-[#98A4B2]"
            />
          </div>

          <select
            id="admin-orders-status"
            value={status}
            onChange={e => setParam('status', e.target.value)}
            className="bg-white border border-[#D7DDE4] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#8D5D1D] cursor-pointer"
          >
            {STATUS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          {!loading && (
            <p className="text-[12.5px] text-[#667382] ml-auto tabular-nums">
              {count} order{count === 1 ? '' : 's'}
            </p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#D7DDE4] overflow-hidden">
          {loading ? (
            <div className="p-5 flex flex-col gap-2.5">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-11 bg-[#F6F8FA] rounded-lg animate-pulse" />)}
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <AlertTriangle size={22} className="text-[#A32B1C] mx-auto mb-3" />
              <p className="text-[14px] font-semibold text-[#11161C]">{error}</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="p-14 text-center">
              <p className="text-[14.5px] font-semibold text-[#11161C] mb-1">No orders match</p>
              <p className="text-[13px] text-[#667382]">
                {status || debounced ? 'Try clearing the search or filter.' : 'Orders appear here once tickets sell.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[880px]">
                <thead className="bg-[#F6F8FA]">
                  <tr>
                    {['Order', 'Buyer', 'Event', 'Tickets', 'Total', 'Status', 'Placed'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#667382] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(o => {
                    /* A paid order with no email sent is the one failure a
                       customer notices before we do. */
                    const emailMissing = o.status === 'paid' && !o.tickets_emailed_at;
                    return (
                      <tr
                        key={o.id || o.order_number}
                        onClick={() => navigate(`/admin/orders/${o.id || o.order_number}`)}
                        className="border-t border-[#E7ECF1] hover:bg-[#F6F8FA] cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-[12px] text-[#11161C] whitespace-nowrap">
                          {o.order_number}
                        </td>
                        <td className="px-4 py-3 min-w-0">
                          <span className="block font-semibold text-[#11161C] truncate max-w-[180px]">
                            {o.customer_name || '—'}
                          </span>
                          <span className="block text-[12px] text-[#667382] truncate max-w-[180px]">
                            {o.customer_email}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#3D4854] truncate max-w-[180px]">{o.event_name || '—'}</td>
                        <td className="px-4 py-3 tabular-nums text-[#3D4854]">{o.ticket_count ?? '—'}</td>
                        <td className="px-4 py-3 tabular-nums font-semibold text-[#11161C] whitespace-nowrap">
                          {formatMoney(o.total ?? 0, 'NGN')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Chip status={o.status} />
                            {emailMissing && (
                              <span title="Paid, but the tickets were never emailed"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A6100] whitespace-nowrap">
                                <MailWarning size={13} /> No email
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#667382] whitespace-nowrap">{fmtDate(o.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paging */}
          {!loading && !error && pages > 1 && (
            <div className="px-4 py-3 border-t border-[#E7ECF1] flex items-center justify-between">
              <p className="text-[12.5px] text-[#667382] tabular-nums">Page {data.current_page ?? page} of {pages}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setParam('page', String(page - 1))}
                  disabled={!data.previous}
                  className="w-9 h-9 rounded-lg border border-[#D7DDE4] flex items-center justify-center text-[#3D4854] hover:bg-[#F6F8FA] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setParam('page', String(page + 1))}
                  disabled={!data.next}
                  className="w-9 h-9 rounded-lg border border-[#D7DDE4] flex items-center justify-center text-[#3D4854] hover:bg-[#F6F8FA] disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrdersPage;
