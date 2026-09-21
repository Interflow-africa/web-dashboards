import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, AlertTriangle, LifeBuoy, Users, CalendarDays,
  Ticket, ArrowRight, Wallet,
} from 'lucide-react';
import AdminLayout from '@/components/common/AdminLayout';
import { adminAPI } from '@/services/api';
import { formatMoney } from '@/utils/currency';

/* ── Needs-attention row: only rendered when the count is non-zero ── */
const Attention = ({ icon: Icon, count, label, detail, tone, onClick }) => {
  const tones = {
    stop: { bg: '#F7E2DE', fg: '#A32B1C' },
    warn: { bg: '#F6EBD4', fg: '#8A6100' },
    info: { bg: '#E7EEF6', fg: '#1F4E79' },
  }[tone];

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl px-4 py-3.5 flex items-center gap-3.5 transition-opacity hover:opacity-90"
      style={{ background: tones.bg }}
    >
      <Icon size={19} style={{ color: tones.fg }} className="shrink-0" />
      <span className="text-[24px] font-bold tabular-nums shrink-0" style={{ color: tones.fg }}>
        {count}
      </span>
      <span className="min-w-0">
        <span className="block text-[13.5px] font-semibold" style={{ color: tones.fg }}>{label}</span>
        {detail && <span className="block text-[12px]" style={{ color: tones.fg, opacity: 0.75 }}>{detail}</span>}
      </span>
      <ArrowRight size={15} style={{ color: tones.fg }} className="ml-auto shrink-0" />
    </button>
  );
};

/* ── Context tile ── */
const Tile = ({ label, value, sub, icon: Icon }) => (
  <div className="bg-white rounded-xl border border-[#D7DDE4] p-4">
    <div className="flex items-center justify-between gap-2 mb-2">
      <p className="text-[12px] font-semibold text-[#667382]">{label}</p>
      {Icon && <Icon size={15} className="text-[#98A4B2] shrink-0" />}
    </div>
    <p className="text-[24px] font-bold text-[#11161C] leading-none tabular-nums">{value}</p>
    {sub && <p className="text-[11.5px] text-[#667382] mt-1.5">{sub}</p>}
  </div>
);

const Money = ({ label, value, strong, note }) => (
  <div className="flex items-baseline justify-between gap-4 py-1.5">
    <span className={`text-[13px] ${strong ? 'font-semibold text-[#11161C]' : 'text-[#667382]'}`}>
      {label}
      {note && <span className="block text-[11.5px] text-[#98A4B2]">{note}</span>}
    </span>
    <span className={`tabular-nums ${strong ? 'text-[16px] font-bold text-[#11161C]' : 'text-[13px] text-[#3D4854]'}`}>
      {formatMoney(value ?? 0, 'NGN')}
    </span>
  </div>
);

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[104px] bg-white rounded-xl border border-[#D7DDE4] animate-pulse" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout title="Overview">
        <div className="bg-white rounded-xl border border-[#D7DDE4] p-12 text-center">
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

  /* Only the three actionable numbers get this treatment. */
  const attention = [
    Number(money.orders_needing_refund) > 0 && {
      key: 'refund', tone: 'stop', icon: AlertTriangle,
      count: money.orders_needing_refund,
      label: 'Orders needing a refund',
      detail: 'Charged, but no ticket was issued',
      onClick: () => navigate('/admin/orders?status=needs_refund'),
    },
    Number(orgs.pending_verification) > 0 && {
      key: 'verify', tone: 'warn', icon: ShieldCheck,
      count: orgs.pending_verification,
      label: 'Organisations awaiting verification',
      onClick: () => navigate('/admin/people?role=organization&verification=pending'),
    },
    Number(sup.open) > 0 && {
      key: 'support', tone: 'info', icon: LifeBuoy,
      count: sup.open,
      label: 'Open support tickets',
      onClick: () => navigate('/admin/support?status=open'),
    },
  ].filter(Boolean);

  return (
    <AdminLayout title="Overview" subtitle="State of the platform, and what needs attention">
      <div className="flex flex-col gap-6 max-w-[1100px]">

        {attention.length > 0 ? (
          <section className="flex flex-col gap-2">
            <h2 className="text-[11px] font-bold text-[#667382] uppercase tracking-[0.1em]">Needs attention</h2>
            {attention.map(a => <Attention key={a.key} {...a} />)}
          </section>
        ) : (
          <section className="rounded-xl px-4 py-3.5 flex items-center gap-3" style={{ background: '#DDEDE5' }}>
            <ShieldCheck size={18} style={{ color: '#146B47' }} className="shrink-0" />
            <p className="text-[13.5px] font-semibold" style={{ color: '#146B47' }}>
              Nothing needs attention — no pending verifications, refunds or open tickets.
            </p>
          </section>
        )}

        <section className="bg-white rounded-xl border border-[#D7DDE4] p-5">
          <h2 className="font-bold text-[14px] text-[#11161C] mb-1">Money</h2>
          <p className="text-[12px] text-[#98A4B2] mb-3">
            Ticket sales belong to organisers. Our fee and VAT are deducted from that; Paystack's cut is paid by the buyer.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
            <div>
              <Money label="Ticket sales" value={money.ticket_sales} note="Organisers' money" />
              <Money label="Interflow fees" value={money.interflow_fees} />
              <Money label="VAT collected" value={money.vat_collected} />
              <Money label="Refunds" value={money.refunds} />
            </div>
            <div className="md:border-l md:border-[#E7ECF1] md:pl-10">
              <Money label="Charged to buyers" value={money.buyers_charged} note="Includes Paystack's cut" />
              <div className="border-t border-[#E7ECF1] mt-2 pt-2">
                <Money label="Payable to organisers" value={money.payable_to_organisers} strong />
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold text-[#667382] uppercase tracking-[0.1em] mb-2">Platform</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Tile label="People" icon={Users} value={users.total ?? 0}
              sub={`${users.artists ?? 0} artists · ${users.organizations ?? 0} organisations`} />
            <Tile label="New this week" icon={Users} value={users.new_this_week ?? 0}
              sub={`${users.inactive ?? 0} suspended`} />
            <Tile label="Verified organisations" icon={ShieldCheck} value={orgs.verified ?? 0} />
            <Tile label="Events" icon={CalendarDays} value={events.total ?? 0}
              sub={`${events.published ?? 0} published · ${events.upcoming ?? 0} upcoming`} />
            <Tile label="Tickets sold" icon={Ticket} value={tix.sold ?? 0}
              sub={`${tix.checked_in ?? 0} checked in`} />
            <Tile label="Opportunities" icon={Wallet} value={opps.total ?? 0}
              sub={`${opps.applications ?? 0} applications`} />
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminOverviewPage;
