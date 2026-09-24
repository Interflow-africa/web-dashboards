import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, LifeBuoy, ArrowRight, CheckCircle2,
} from 'lucide-react';
import AdminLayout from '@/components/common/AdminLayout';
import { adminAPI } from '@/services/api';
import { formatMoney } from '@/utils/currency';

/* ─── Categorical palette ─────────────────────────────────────────
   Three recipients of a buyer's money. Validated on the console's
   white surface: lightness band, chroma floor, CVD separation
   (worst adjacent ΔE 13.1 deutan), normal-vision floor (24.4) and
   contrast all pass. Assigned in fixed order, never cycled.
   Status colours below are reserved and never reused as a series. */
const SLICE = {
  organiser: '#0E9E86',
  interflow: '#B45309',
  paystack:  '#1D63D1',
};

const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

/* ─── Needs attention ─────────────────────────────────────────────
   Status carries an icon and a label, never colour alone. */
const TONES = {
  critical: { bg: '#FDF2F0', bar: '#A32B1C', ink: '#7E2115' },
  warning:  { bg: '#FDF6E9', bar: '#8A6100', ink: '#6B4C00' },
  info:     { bg: '#F0F4FA', bar: '#1F4E79', ink: '#1A3F63' },
};

const Attention = ({ icon: Icon, count, label, detail, tone, onClick }) => {
  const t = TONES[tone];
  return (
    <button onClick={onClick}
      className="w-full text-left rounded-xl pl-0 pr-4 py-0 flex items-stretch gap-0 overflow-hidden transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{ background: t.bg, outlineColor: t.bar }}>
      <span className="w-1 shrink-0" style={{ background: t.bar }} aria-hidden="true" />
      <span className="flex items-center gap-4 px-4 py-4 flex-1 min-w-0">
        <Icon size={18} style={{ color: t.bar }} className="shrink-0" />
        <span className="text-[26px] font-bold tabular-nums leading-none shrink-0" style={{ color: t.bar }}>
          {count}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-semibold leading-snug" style={{ color: t.ink }}>{label}</span>
          {detail && <span className="block text-[12px] mt-0.5" style={{ color: t.ink, opacity: 0.7 }}>{detail}</span>}
        </span>
        <ArrowRight size={16} style={{ color: t.bar }} className="shrink-0" />
      </span>
    </button>
  );
};

/* ─── Stat tile ───────────────────────────────────────────────────
   A bare number with context. No chart, so no hover layer. */
const Stat = ({ label, value, sub }) => (
  <div className="bg-white rounded-xl border border-[#E1E6EC] px-4 py-4">
    <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[#8A97A5]">{label}</p>
    <p className="text-[26px] font-bold text-[#11161C] leading-none tabular-nums mt-2">{value}</p>
    {sub && <p className="text-[12px] text-[#667382] mt-1.5 leading-snug">{sub}</p>}
  </div>
);

/* ─── Where the money goes ────────────────────────────────────────
   Part-to-whole, so one stacked bar rather than four numbers in a
   row. Segments carry a 2px surface gap, and every segment is also
   named in the readout below — identity is never colour alone. */
const MoneyFlow = ({ money }) => {
  const organiser = num(money.payable_to_organisers);
  const fee       = num(money.interflow_fees);
  const vat       = num(money.vat_collected);
  const charged   = num(money.buyers_charged);
  const sales     = num(money.ticket_sales);

  /* Paystack's cut is what buyers paid above the ticket price. */
  const paystack = Math.max(0, charged - sales);
  const total    = organiser + fee + vat + paystack;

  const segments = [
    { key: 'organiser', label: 'To organisers', value: organiser,   color: SLICE.organiser },
    { key: 'interflow', label: 'Interflow fee', value: fee + vat,   color: SLICE.interflow },
    { key: 'paystack',  label: 'Paystack',      value: paystack,    color: SLICE.paystack },
  ].filter(s => s.value > 0);

  const pct = (v) => (total > 0 ? (v / total) * 100 : 0);

  return (
    <section className="bg-white rounded-xl border border-[#E1E6EC] p-5">
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-1">
        <h2 className="font-bold text-[14px] text-[#11161C]">Where the money goes</h2>
        <p className="text-[12px] text-[#8A97A5]">Buyers paid {formatMoney(charged, 'NGN')} in total</p>
      </div>

      {/* Hero: the number that matters most */}
      <p className="text-[34px] font-bold text-[#11161C] tabular-nums leading-none mt-3">
        {formatMoney(organiser, 'NGN')}
      </p>
      <p className="text-[12.5px] text-[#667382] mt-1.5 mb-4">Payable to organisers</p>

      {total > 0 ? (
        <>
          <div className="flex gap-[2px] h-3 rounded-full overflow-hidden" role="img"
            aria-label={segments.map(s => `${s.label} ${formatMoney(s.value, 'NGN')}`).join(', ')}>
            {segments.map(s => (
              <div key={s.key} title={`${s.label} — ${formatMoney(s.value, 'NGN')}`}
                style={{ width: `${pct(s.value)}%`, background: s.color, minWidth: 3 }} />
            ))}
          </div>

          {/* Readout doubles as the legend and the table view */}
          <dl className="mt-4 flex flex-col gap-2.5">
            {segments.map(s => (
              <div key={s.key} className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} aria-hidden="true" />
                <dt className="text-[13px] text-[#3D4854]">{s.label}</dt>
                <span className="flex-1 border-b border-dashed border-[#E1E6EC] mx-1" aria-hidden="true" />
                <dd className="text-[13px] text-[#11161C] tabular-nums font-medium">{formatMoney(s.value, 'NGN')}</dd>
                <dd className="text-[12px] text-[#8A97A5] tabular-nums w-[46px] text-right">{pct(s.value).toFixed(1)}%</dd>
              </div>
            ))}
          </dl>

          {/* VAT is a rounding error of the whole, so it reads here
              rather than as a sub-pixel segment in the bar. */}
          <p className="text-[12px] text-[#8A97A5] mt-3 pt-3 border-t border-[#EEF1F4]">
            Interflow fee includes {formatMoney(vat, 'NGN')} VAT.
            {num(money.refunds) > 0 && <> {formatMoney(money.refunds, 'NGN')} refunded.</>}
          </p>
        </>
      ) : (
        <p className="text-[13px] text-[#667382] py-4">No sales yet.</p>
      )}
    </section>
  );
};

/* ─── Check-in rate ───────────────────────────────────────────────
   One magnitude against a known whole, so a meter, not two tiles. */
const CheckInMeter = ({ sold, checkedIn }) => {
  const s = num(sold), c = num(checkedIn);
  const pct = s > 0 ? Math.min(100, (c / s) * 100) : 0;
  return (
    <section className="bg-white rounded-xl border border-[#E1E6EC] p-5">
      <h2 className="font-bold text-[14px] text-[#11161C] mb-3">Tickets</h2>
      <div className="flex items-baseline gap-2">
        <span className="text-[26px] font-bold text-[#11161C] tabular-nums leading-none">{s}</span>
        <span className="text-[13px] text-[#667382]">sold</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-[#EEF1F4] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: SLICE.organiser }} />
      </div>
      <p className="text-[12.5px] text-[#667382] mt-2.5 tabular-nums">
        <span className="font-semibold text-[#11161C]">{c}</span> checked in
        {s > 0 && <span className="text-[#8A97A5]"> · {pct.toFixed(0)}%</span>}
      </p>
    </section>
  );
};

const AdminOverviewPage = () => {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    let alive = true;
    adminAPI.overview()
      .then(r => { if (alive) setData(r.data?.data || r.data || null); })
      .catch(err => {
        if (!alive) return;
        setError(err?.response?.data?.message || 'Could not load the overview.');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Overview" subtitle="State of the platform">
        <div className="max-w-[1080px] flex flex-col gap-5">
          <div className="h-[72px] bg-white rounded-xl border border-[#E1E6EC] animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
            <div className="h-[300px] bg-white rounded-xl border border-[#E1E6EC] animate-pulse" />
            <div className="h-[300px] bg-white rounded-xl border border-[#E1E6EC] animate-pulse" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout title="Overview">
        <div className="bg-white rounded-xl border border-[#E1E6EC] p-12 text-center max-w-[1080px]">
          <AlertTriangle size={24} className="text-[#A32B1C] mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-[#11161C] mb-1">{error}</p>
          <p className="text-[13px] text-[#667382]">Refresh to try again.</p>
        </div>
      </AdminLayout>
    );
  }

  const users  = data.users || {};
  const orgs   = data.organizations || {};
  const events = data.events || {};
  const tix    = data.tickets || {};
  const money  = data.money || {};
  const opps   = data.opportunities || {};
  const sup    = data.support || {};

  const attention = [
    num(money.orders_needing_refund) > 0 && {
      key: 'refund', tone: 'critical', icon: AlertTriangle,
      count: money.orders_needing_refund,
      label: 'Charged, but got no ticket',
      detail: 'Refund these, or issue the tickets manually',
      onClick: () => navigate('/admin/orders?status=needs_refund'),
    },
    num(orgs.pending_verification) > 0 && {
      key: 'verify', tone: 'warning', icon: ShieldCheck,
      count: orgs.pending_verification,
      label: 'Organisations awaiting verification',
      detail: "They can't post opportunities until you decide",
      onClick: () => navigate('/admin/people?role=organization&verification=pending'),
    },
    num(sup.open) > 0 && {
      key: 'support', tone: 'info', icon: LifeBuoy,
      count: sup.open,
      label: 'Open support tickets',
      onClick: () => navigate('/admin/support?status=open'),
    },
  ].filter(Boolean);

  return (
    <AdminLayout title="Overview" subtitle="State of the platform, and what needs attention">
      <div className="max-w-[1080px] flex flex-col gap-5">

        {attention.length > 0 ? (
          <section className="flex flex-col gap-2.5">
            {attention.map(a => <Attention key={a.key} {...a} />)}
          </section>
        ) : (
          <section className="rounded-xl px-4 py-3.5 flex items-center gap-3 border" style={{ background: '#F1F8F4', borderColor: '#CFE6D9' }}>
            <CheckCircle2 size={18} style={{ color: '#146B47' }} className="shrink-0" />
            <p className="text-[13.5px] font-semibold" style={{ color: '#146B47' }}>
              All clear — nothing waiting on you.
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5 items-start">
          <MoneyFlow money={money} />
          <CheckInMeter sold={tix.sold} checkedIn={tix.checked_in} />
        </div>

        <section>
          <h2 className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-[#8A97A5] mb-2.5">Platform</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="People" value={users.total ?? 0}
              sub={`${users.artists ?? 0} artists · ${users.organizations ?? 0} organisations`} />
            <Stat label="Joined this week" value={users.new_this_week ?? 0}
              sub={num(users.inactive) > 0 ? `${users.inactive} suspended` : 'None suspended'} />
            <Stat label="Events" value={events.total ?? 0}
              sub={`${events.published ?? 0} published · ${events.upcoming ?? 0} upcoming`} />
            <Stat label="Opportunities" value={opps.total ?? 0}
              sub={`${opps.applications ?? 0} applications`} />
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminOverviewPage;
