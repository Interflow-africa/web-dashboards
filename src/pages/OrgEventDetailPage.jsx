import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Ticket, Users, CheckCircle2, Wallet } from 'lucide-react';
import DashboardLayout from '@/components/common/DashboardLayout';
import { eventsAPI } from '@/services/index';
import { formatMoney } from '@/utils/currency';

const GOLD = '#8D5D1D';

const fmtDateTime = (iso) => {
  if (!iso) return '—';
  /* Event times are entered and stored in UTC — render as given. */
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZone: 'UTC',
  });
};

const fmtCheckIn = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }) : '—';

/* ─── Summary tile ──────────────────────────────────────────────── */
const Tile = ({ label, value, sub, icon, bg, iconBg }) => (
  <div className="rounded-2xl p-4" style={{ backgroundColor: bg }}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-[13px] font-semibold text-gray-700">{label}</p>
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
    </div>
    <p className="text-[26px] font-bold text-gray-900 leading-none mb-1">{value}</p>
    {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   Organisation → Event detail (sales + attendees)
   ═══════════════════════════════════════════════════════════════ */
const OrgEventDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [tab, setTab]           = useState('sales');
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const [attendees, setAttendees]         = useState(null);
  const [attLoading, setAttLoading]       = useState(false);
  const [attLoaded, setAttLoaded]         = useState(false);

  useEffect(() => {
    let alive = true;
    eventsAPI.orgSales(id)
      .then(r => { if (alive) setData(r.data?.data || r.data || null); })
      .catch(err => {
        if (!alive) return;
        /* Scoped server-side: another org's event is a 404, an artist a 403. */
        setError(err?.response?.status === 403
          ? 'You do not have access to this event.'
          : 'This event could not be found.');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  /* Attendees load lazily, only when that tab is first opened. */
  useEffect(() => {
    if (tab !== 'attendees' || attLoaded) return;
    setAttLoading(true);
    eventsAPI.orgAttendees(id)
      .then(r => setAttendees(r.data?.data || r.data || null))
      .catch(() => setAttendees(null))
      .finally(() => { setAttLoading(false); setAttLoaded(true); });
  }, [tab, attLoaded, id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div style={{ width: 36, height: 36, border: `3px solid rgba(141,93,29,0.15)`, borderTopColor: GOLD, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <button onClick={() => navigate('/org/events')}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#888] hover:text-[#1A1A1A] transition-colors mb-5">
          <ArrowLeft size={15} /> Events
        </button>
        <div className="bg-white rounded-2xl border border-[#EBEBEB] p-14 text-center">
          <p className="text-[15px] font-semibold text-[#1A1A1A] mb-1">{error || 'Not found'}</p>
        </div>
      </DashboardLayout>
    );
  }

  const event  = data.event || {};
  const sales  = data.sales || {};
  const tiers  = data.ticket_types || [];
  const att    = attendees || {};
  const rows   = att.attendees || [];
  const cCount = att.checked_in || {};

  return (
    <DashboardLayout>
      {/* Back */}
      <button onClick={() => navigate('/org/events')}
        className="flex items-center gap-2 text-[13px] font-semibold text-[#888] hover:text-[#1A1A1A] transition-colors mb-4">
        <ArrowLeft size={15} /> Events
      </button>

      {/* Header */}
      <div className="mb-5">
        <h1 className="dash-page-title" style={{ marginBottom: 4 }}>{event.name || 'Event'}</h1>
        <div className="flex items-center gap-3 flex-wrap text-[13px] text-[#888]">
          {event.start_at && <span className="flex items-center gap-1.5"><Calendar size={12} /> {fmtDateTime(event.start_at)}</span>}
          {(event.venue_name || event.city) && (
            <span className="flex items-center gap-1.5">
              <MapPin size={12} /> {[event.venue_name, event.city].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-end gap-6 mb-5 border-b border-gray-200">
        {[['sales', 'Sales'], ['attendees', 'Attendees']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className="pb-2.5 text-[14px] font-semibold transition-colors relative"
            style={{ color: tab === key ? GOLD : '#888' }}>
            {label}
            {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: GOLD }} />}
          </button>
        ))}
      </div>

      {/* ── Sales ── */}
      {tab === 'sales' && (
        <div className="flex flex-col gap-5">
          {/* Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Tile
              label="Tickets sold" bg="#EBF4FF" iconBg="#BFDBFE"
              value={sales.tickets_sold ?? 0}
              sub={`${sales.tickets_remaining ?? 0} remaining of ${sales.tickets_total ?? 0}`}
              icon={<Ticket size={18} color="#1565C0" />}
            />
            <Tile
              label="Checked in" bg="#EDFAF3" iconBg="#BBF7D0"
              value={sales.checked_in ?? 0}
              sub={`${Math.max(0, (sales.tickets_sold ?? 0) - (sales.checked_in ?? 0))} not yet arrived`}
              icon={<CheckCircle2 size={18} color="#15803D" />}
            />
            <Tile
              label="Net settlement" bg="#FFF8EC" iconBg="#FDE68A"
              value={formatMoney(sales.net_settlement ?? 0, 'NGN')}
              sub="What you're owed"
              icon={<Wallet size={18} color="#B45309" />}
            />
          </div>

          {/* Money breakdown — ticket money kept separate from fees */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] p-5">
            <p className="font-bold text-[14px] text-[#1A1A1A] mb-1">Settlement</p>
            <p className="text-[12px] text-[#AAAAAA] mb-4">
              Ticket revenue is yours. Fees below were paid by the buyer on top of the ticket price.
            </p>

            <div className="flex flex-col gap-2 max-w-[460px]">
              {[
                ['Gross ticket sales', sales.gross_sales],
                ['Refunded', sales.refunded_sales],
              ].filter(([, v]) => v != null).map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 text-[13px]">
                  <span className="text-[#888]">{k}</span>
                  <span className="text-[#1A1A1A] font-medium">{formatMoney(v, 'NGN')}</span>
                </div>
              ))}

              <div className="flex justify-between gap-4 pt-2 mt-1 border-t border-gray-100">
                <span className="text-[13px] font-semibold text-[#1A1A1A]">Net settlement</span>
                <span className="text-[16px] font-bold text-[#1A1A1A]">
                  {formatMoney(sales.net_settlement ?? 0, 'NGN')}
                </span>
              </div>

              {/* Buyer-side fees — informational, not deducted from settlement */}
              <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
                <p className="text-[11px] font-semibold text-[#AAAAAA] uppercase tracking-wide mb-2">
                  Fees paid by buyers
                </p>
                {[
                  ['Interflow fee', sales.service_fee],
                  ['VAT', sales.vat],
                  ['Payment processing', sales.payment_processing_fee],
                  ['Total charged to buyers', sales.buyer_charged],
                ].filter(([, v]) => v != null).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 text-[12.5px] py-0.5">
                    <span className="text-[#AAAAAA]">{k}</span>
                    <span className="text-[#666]">{formatMoney(v, 'NGN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Per-tier */}
          <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#F0F0F0]">
              <p className="font-bold text-[14px] text-[#1A1A1A]">Ticket types</p>
            </div>
            {tiers.length === 0 ? (
              <p className="text-[13px] text-[#AAAAAA] text-center py-10">No ticket types.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12.5px] min-w-[560px]">
                  <thead>
                    <tr className="text-[#AAAAAA] text-left border-b border-[#F5F5F5]">
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Sold</th>
                      <th className="px-4 py-3 font-medium">Held</th>
                      <th className="px-4 py-3 font-medium">Remaining</th>
                      <th className="px-4 py-3 font-medium text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map(t => (
                      <tr key={t.id} className="border-b border-[#F9F9F9] last:border-0">
                        <td className="px-5 py-3">
                          <span className="font-semibold text-[#1A1A1A]">{t.name}</span>
                          {t.is_sold_out && (
                            <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                              Sold out
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#666]">{formatMoney(t.price, 'NGN')}</td>
                        <td className="px-4 py-3 text-[#1A1A1A] font-medium">
                          {t.sold ?? 0}{t.quantity_total != null && <span className="text-[#AAAAAA]"> / {t.quantity_total}</span>}
                        </td>
                        <td className="px-4 py-3 text-[#888]" title="In someone's checkout right now">
                          {t.held ?? 0}
                        </td>
                        <td className="px-4 py-3 text-[#888]">{t.remaining ?? 0}</td>
                        <td className="px-4 py-3 text-right font-semibold text-[#1A1A1A]">
                          {formatMoney(t.revenue ?? 0, 'NGN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Attendees ── */}
      {tab === 'attendees' && (
        <div className="bg-white rounded-2xl border border-[#EBEBEB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0F0F0] flex items-center justify-between gap-3 flex-wrap">
            <p className="font-bold text-[14px] text-[#1A1A1A]">Attendees</p>
            {attLoaded && (
              <p className="text-[12px] text-[#888] flex items-center gap-1.5">
                <Users size={12} />
                {cCount.checked_in ?? 0} checked in · {cCount.not_yet_arrived ?? 0} not yet arrived
              </p>
            )}
          </div>

          {attLoading ? (
            <div className="p-5 flex flex-col gap-3">
              {[1, 2, 3].map(i => <div key={i} className="h-11 bg-[#F5F5F5] rounded-xl animate-pulse" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-[14px] font-semibold text-[#1A1A1A]">No attendees yet</p>
              <p className="text-[12.5px] text-[#AAAAAA] mt-1">Ticket holders will appear here once tickets sell.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] min-w-[560px]">
                <thead>
                  <tr className="text-[#AAAAAA] text-left border-b border-[#F5F5F5]">
                    <th className="px-5 py-3 font-medium">Attendee</th>
                    <th className="px-4 py-3 font-medium">Ticket type</th>
                    <th className="px-4 py-3 font-medium">Ticket ID</th>
                    <th className="px-4 py-3 font-medium">Checked in</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(a => (
                    <tr key={a.ticket_id} className="border-b border-[#F9F9F9] last:border-0 hover:bg-[#FAFAFA] transition-colors">
                      <td className="px-5 py-3 font-semibold text-[#1A1A1A]">{a.attendee_name || '—'}</td>
                      <td className="px-4 py-3 text-[#666]">{a.ticket_type_name || '—'}</td>
                      <td className="px-4 py-3 text-[#AAAAAA] font-mono text-[11.5px]">{a.ticket_id}</td>
                      <td className="px-4 py-3">
                        {a.checked_in ? (
                          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                            <CheckCircle2 size={11} /> {fmtCheckIn(a.checked_in_at)}
                          </span>
                        ) : (
                          <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                            Not yet
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Buyer contact details intentionally absent — they stay with
                  Interflow admin, so no column expects them. */}
              <p className="px-5 py-3 text-[11.5px] text-[#AAAAAA] border-t border-[#F5F5F5]">
                Showing {rows.length} attendee{rows.length !== 1 ? 's' : ''}. Refunded and cancelled tickets are excluded.
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default OrgEventDetailPage;
