import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, AlertTriangle, Ban } from 'lucide-react';
import AdminLayout from '@/components/common/AdminLayout';
import { adminAPI } from '@/services/api';
import {
  verificationOf, ROLE_FILTERS, STATUS_FILTERS, VERIFICATION_FILTERS,
} from '@/utils/personStatus';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

const Pill = ({ tone, children }) => (
  <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap"
    style={{ background: tone.bg, color: tone.fg }}>
    {children}
  </span>
);

const AdminPeoplePage = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const role         = params.get('role') || '';
  const status       = params.get('status') || '';
  const verification = params.get('verification') || '';
  const page         = Number(params.get('page')) || 1;

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
    setLoading(true);
    setError(null);
    const q = { page };
    if (role)         q.role         = role;
    if (status)       q.status       = status;
    if (verification) q.verification = verification;
    if (debounced)    q.search       = debounced;

    adminAPI.users(q)
      .then(r => { if (alive) setData(r.data || null); })
      .catch(err => {
        if (!alive) return;
        setError(err?.response?.data?.message || 'Could not load people.');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [role, status, verification, debounced, page]);

  const rows  = data?.results || [];
  const count = data?.count ?? 0;
  const pages = data?.total_pages ?? 1;

  const selectCls = 'bg-white border border-[#D7DDE4] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#8D5D1D] cursor-pointer';

  return (
    <AdminLayout title="People" subtitle="Every account. Search covers email, artist name and organisation name at once.">
      <div className="flex flex-col gap-4 max-w-[1200px]">

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-[360px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A4B2]" />
            <input
              id="admin-people-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, organisation or email…"
              className="w-full bg-white border border-[#D7DDE4] rounded-lg pl-9 pr-3 py-2.5 text-[13px] outline-none focus:border-[#8D5D1D] placeholder:text-[#98A4B2]"
            />
          </div>

          <select id="admin-people-role" value={role} onChange={e => setParam('role', e.target.value)} className={selectCls}>
            {ROLE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          <select id="admin-people-status" value={status} onChange={e => setParam('status', e.target.value)} className={selectCls}>
            {STATUS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          {/* Verification only applies to organisations. */}
          {role !== 'artist' && (
            <select id="admin-people-verification" value={verification}
              onChange={e => setParam('verification', e.target.value)} className={selectCls}>
              {VERIFICATION_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          )}

          {!loading && (
            <p className="text-[12.5px] text-[#667382] ml-auto tabular-nums">
              {count} {count === 1 ? 'person' : 'people'}
            </p>
          )}
        </div>

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
              <p className="text-[14.5px] font-semibold text-[#11161C] mb-1">Nobody matches</p>
              <p className="text-[13px] text-[#667382]">Try clearing the search or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[860px]">
                <thead className="bg-[#F6F8FA]">
                  <tr>
                    {['Name', 'Role', 'Verification', 'Account', 'Joined', 'Last seen'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#667382] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(u => {
                    const v = verificationOf(u.verification_status);
                    return (
                      <tr key={u.id}
                        onClick={() => navigate(`/admin/people/${u.id}`)}
                        className="border-t border-[#E7ECF1] hover:bg-[#F6F8FA] cursor-pointer transition-colors">
                        <td className="px-4 py-3 min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="font-semibold text-[#11161C] truncate max-w-[200px]">
                              {u.display_name || u.email}
                            </span>
                            {u.is_staff && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                style={{ background: '#F3E7D3', color: '#8D5D1D' }}>Staff</span>
                            )}
                          </span>
                          <span className="block text-[12px] text-[#667382] truncate max-w-[200px]">{u.email}</span>
                        </td>
                        <td className="px-4 py-3 text-[#3D4854] capitalize whitespace-nowrap">{u.role || '—'}</td>
                        <td className="px-4 py-3">
                          {v ? <Pill tone={v}>{v.label}</Pill> : <span className="text-[#98A4B2]">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {u.is_active
                            ? <span className="text-[12.5px] text-[#667382]">
                                {u.is_onboarded ? 'Active' : 'Onboarding'}
                              </span>
                            : <span className="inline-flex items-center gap-1.5 text-[12px] font-bold" style={{ color: '#A32B1C' }}>
                                <Ban size={13} /> Suspended
                              </span>}
                        </td>
                        <td className="px-4 py-3 text-[#667382] whitespace-nowrap">{fmtDate(u.date_joined)}</td>
                        <td className="px-4 py-3 text-[#667382] whitespace-nowrap">
                          {u.last_login ? fmtDate(u.last_login) : 'Never'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && pages > 1 && (
            <div className="px-4 py-3 border-t border-[#E7ECF1] flex items-center justify-between">
              <p className="text-[12.5px] text-[#667382] tabular-nums">Page {data.current_page ?? page} of {pages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setParam('page', String(page - 1))} disabled={!data.previous}
                  aria-label="Previous page"
                  className="w-9 h-9 rounded-lg border border-[#D7DDE4] flex items-center justify-center text-[#3D4854] hover:bg-[#F6F8FA] disabled:opacity-35 disabled:cursor-not-allowed">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setParam('page', String(page + 1))} disabled={!data.next}
                  aria-label="Next page"
                  className="w-9 h-9 rounded-lg border border-[#D7DDE4] flex items-center justify-center text-[#3D4854] hover:bg-[#F6F8FA] disabled:opacity-35 disabled:cursor-not-allowed">
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

export default AdminPeoplePage;
