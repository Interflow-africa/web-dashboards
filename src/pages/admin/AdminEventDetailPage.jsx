import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, Pencil, Plus, Trash2, X, ExternalLink,
  Ticket as TicketIcon, Power,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/common/AdminLayout';
import { adminAPI } from '@/services/api';
import { formatMoney } from '@/utils/currency';
import { eventStatusOf, fmtUtc, isoToLocalInput, localInputToIso } from '@/utils/eventMeta';

const inputCls = 'w-full bg-white border border-[#D7DDE4] rounded-lg px-3 py-2.5 text-[13.5px] outline-none focus:border-[#8D5D1D] placeholder:text-[#98A4B2]';
const labelCls = 'block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A4B2] mb-1.5';

const Stat = ({ label, value, sub }) => (
  <div className="bg-white rounded-xl border border-[#D7DDE4] p-4">
    <p className="text-[12px] font-semibold text-[#667382] mb-2">{label}</p>
    <p className="text-[24px] font-bold text-[#11161C] leading-none tabular-nums">{value}</p>
    {sub && <p className="text-[11.5px] text-[#667382] mt-1.5">{sub}</p>}
  </div>
);

const Money = ({ label, value, strong, deduct }) => (
  <div className="flex items-baseline justify-between gap-4 py-1.5">
    <span className={`text-[13px] ${strong ? 'font-semibold text-[#11161C]' : 'text-[#667382]'}`}>{label}</span>
    <span className={`tabular-nums ${strong ? 'text-[15px] font-bold text-[#11161C]' : 'text-[13px] text-[#3D4854]'}`}>
      {deduct ? '− ' : ''}{formatMoney(value ?? 0, 'NGN')}
    </span>
  </div>
);

/* ─── Tier create / edit ────────────────────────────────────────── */
const EMPTY_TIER = {
  name: '', price: '', quantity_total: '', description: '',
  sales_start_at: '', sales_end_at: '', max_per_order: '', is_active: true, order: '',
};

const TierDialog = ({ eventId, tier, onClose, onDone }) => {
  const editing = Boolean(tier);
  const [form, setForm] = useState(editing ? {
    ...EMPTY_TIER,
    ...Object.fromEntries(Object.keys(EMPTY_TIER).map(k => [k, tier[k] ?? ''])),
    is_active: tier.is_active !== false,
    sales_start_at: isoToLocalInput(tier.sales_start_at),
    sales_end_at:   isoToLocalInput(tier.sales_end_at),
  } : EMPTY_TIER);
  const [busy, setBusy]     = useState(false);
  const [failed, setFailed] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim())       { setFailed('A name is required.'); return; }
    if (form.price === '')       { setFailed('A price is required — use 0 for a free tier.'); return; }
    if (form.quantity_total === '') { setFailed('A quantity is required.'); return; }

    setBusy(true); setFailed(null);
    try {
      const payload = {
        name: form.name.trim(),
        price: String(form.price),
        quantity_total: Number(form.quantity_total),
        description: form.description.trim(),
        is_active: Boolean(form.is_active),
      };
      if (form.max_per_order !== '') payload.max_per_order = Number(form.max_per_order);
      if (form.order !== '')         payload.order = Number(form.order);
      payload.sales_start_at = form.sales_start_at ? localInputToIso(form.sales_start_at) : null;
      payload.sales_end_at   = form.sales_end_at   ? localInputToIso(form.sales_end_at)   : null;

      if (editing) await adminAPI.updateTicketType(tier.id, payload);
      else         await adminAPI.createTicketType(eventId, payload);
      toast.success(editing ? 'Ticket type updated.' : 'Ticket type added.');
      onDone();
    } catch (err) {
      setFailed(err?.response?.data?.message || 'That could not be saved.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[520px] max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E7ECF1] sticky top-0 bg-white">
          <h2 className="font-bold text-[16px] text-[#11161C]">{editing ? 'Edit ticket type' : 'Add ticket type'}</h2>
          <button onClick={onClose} disabled={busy}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#667382] hover:bg-[#EEF1F4] disabled:opacity-40">
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="tier-name">Name <span style={{ color: '#A32B1C' }}>*</span></label>
            <input id="tier-name" className={inputCls} value={form.name} onChange={set('name')} placeholder="e.g. VIP" />
          </div>
          <div>
            <label className={labelCls} htmlFor="tier-price">Price (₦) <span style={{ color: '#A32B1C' }}>*</span></label>
            <input id="tier-price" type="number" min="0" step="0.01" className={inputCls}
              value={form.price} onChange={set('price')} placeholder="25000.00" />
          </div>
          <div>
            <label className={labelCls} htmlFor="tier-qty">Quantity <span style={{ color: '#A32B1C' }}>*</span></label>
            <input id="tier-qty" type="number" min="0" className={inputCls}
              value={form.quantity_total} onChange={set('quantity_total')} placeholder="100" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="tier-desc">Description</label>
            <input id="tier-desc" className={inputCls} value={form.description} onChange={set('description')}
              placeholder="e.g. Front section + lounge access" />
          </div>
          <div>
            <label className={labelCls} htmlFor="tier-start">Sales open (UTC)</label>
            <input id="tier-start" type="datetime-local" className={inputCls} value={form.sales_start_at} onChange={set('sales_start_at')} />
          </div>
          <div>
            <label className={labelCls} htmlFor="tier-end">Sales close (UTC)</label>
            <input id="tier-end" type="datetime-local" className={inputCls} value={form.sales_end_at} onChange={set('sales_end_at')} />
          </div>
          <div>
            <label className={labelCls} htmlFor="tier-max">Max per order</label>
            <input id="tier-max" type="number" min="1" className={inputCls} value={form.max_per_order} onChange={set('max_per_order')} placeholder="5" />
          </div>
          <div>
            <label className={labelCls} htmlFor="tier-order">Display order</label>
            <input id="tier-order" type="number" min="0" className={inputCls} value={form.order} onChange={set('order')} placeholder="1" />
          </div>

          <label className="sm:col-span-2 flex items-center gap-2.5 cursor-pointer">
            <input id="tier-active" type="checkbox" checked={Boolean(form.is_active)}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              className="w-4 h-4 rounded" style={{ accentColor: '#8D5D1D' }} />
            <span className="text-[13px] text-[#3D4854]">On sale</span>
          </label>

          {failed && (
            <div className="sm:col-span-2 rounded-lg px-4 py-3 border" style={{ background: '#F7E2DE', borderColor: '#E8BDB4' }}>
              <p className="text-[13px]" style={{ color: '#7E2115' }}>{failed}</p>
            </div>
          )}

          <div className="sm:col-span-2 flex gap-3 pt-1">
            <button onClick={onClose} disabled={busy}
              className="flex-1 h-11 rounded-lg border border-[#D7DDE4] text-[13.5px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA] disabled:opacity-50">
              Cancel
            </button>
            <button onClick={submit} disabled={busy}
              className="flex-1 h-11 rounded-lg text-white text-[13.5px] font-semibold hover:opacity-90 disabled:opacity-60"
              style={{ background: '#8D5D1D' }}>
              {busy ? 'Saving…' : editing ? 'Save' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete a tier ───────────────────────────────────────────────
   The API refuses with 400 once anything has sold, since deleting
   would strand tickets people hold. Surface that and offer the
   deactivate toggle right there rather than a dead end. */
const DeleteTierDialog = ({ tier, onClose, onDone }) => {
  const [busy, setBusy]       = useState(false);
  const [refused, setRefused] = useState(null);

  const remove = async () => {
    setBusy(true); setRefused(null);
    try {
      await adminAPI.deleteTicketType(tier.id);
      toast.success('Ticket type deleted.');
      onDone();
    } catch (err) {
      setRefused(err?.response?.data?.message || 'This ticket type cannot be deleted.');
      setBusy(false);
    }
  };

  const deactivate = async () => {
    setBusy(true);
    try {
      await adminAPI.updateTicketType(tier.id, { is_active: false });
      toast.success('Ticket type taken off sale.');
      onDone();
    } catch (err) {
      setRefused(err?.response?.data?.message || 'That could not be saved.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[460px]">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E7ECF1]">
          <h2 className="font-bold text-[16px] text-[#11161C]">Delete “{tier.name}”?</h2>
          <button onClick={onClose} disabled={busy}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#667382] hover:bg-[#EEF1F4] disabled:opacity-40">
            <X size={17} />
          </button>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4">
          {refused ? (
            <>
              <div className="rounded-lg px-4 py-3 border" style={{ background: '#F6EBD4', borderColor: '#E3CFA1' }}>
                <p className="text-[13px]" style={{ color: '#6B4C00' }}>{refused}</p>
              </div>
              <p className="text-[13px] text-[#667382]">
                Taking it off sale stops new purchases and leaves tickets already bought valid.
              </p>
              <div className="flex gap-3">
                <button onClick={onClose} disabled={busy}
                  className="flex-1 h-11 rounded-lg border border-[#D7DDE4] text-[13.5px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA]">
                  Leave it
                </button>
                <button onClick={deactivate} disabled={busy}
                  className="flex-1 h-11 rounded-lg text-white text-[13.5px] font-semibold hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#8A6100' }}>
                  <Power size={14} className="inline mr-1.5" />Take off sale
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[13.5px] text-[#3D4854]">
                This removes the ticket type entirely. It only works while nothing has sold.
              </p>
              <div className="flex gap-3">
                <button onClick={onClose} disabled={busy}
                  className="flex-1 h-11 rounded-lg border border-[#D7DDE4] text-[13.5px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA]">
                  Cancel
                </button>
                <button onClick={remove} disabled={busy}
                  className="flex-1 h-11 rounded-lg text-white text-[13.5px] font-semibold hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#A32B1C' }}>
                  {busy ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminEventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tierDialog, setTierDialog]   = useState(null);   // null | {tier?}
  const [deleteTier, setDeleteTier]   = useState(null);

  const load = () => adminAPI.event(id)
    .then(r => setData(r.data?.data || r.data || null))
    .catch(err => setError(err?.response?.status === 403
      ? 'This account is not an admin.'
      : (err?.response?.data?.message || 'This event could not be found.')))
    .finally(() => setLoading(false));

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  if (loading) {
    return (
      <AdminLayout title="Event">
        <div className="max-w-[1000px] flex flex-col gap-4">
          <div className="h-[110px] bg-white rounded-xl border border-[#D7DDE4] animate-pulse" />
          <div className="h-[240px] bg-white rounded-xl border border-[#D7DDE4] animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout title="Event">
        <button onClick={() => navigate('/admin/events')}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#667382] hover:text-[#11161C] mb-4">
          <ArrowLeft size={15} /> Events
        </button>
        <div className="bg-white rounded-xl border border-[#D7DDE4] p-12 text-center max-w-[1000px]">
          <AlertTriangle size={22} className="text-[#A32B1C] mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-[#11161C]">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  const ev    = data.event || data;
  const sales = data.sales || {};
  const tiers = data.ticket_types || [];
  const st    = eventStatusOf(ev.status);

  return (
    <AdminLayout
      title={ev.name || 'Event'}
      subtitle={[fmtUtc(ev.start_at), ev.venue_name, ev.city].filter(Boolean).join(' · ')}
      actions={
        <div className="flex items-center gap-2">
          {ev.page_url && (
            <a href={ev.page_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-[#D7DDE4] text-[13px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA]">
              <ExternalLink size={14} /> Public page
            </a>
          )}
          <button onClick={() => navigate(`/admin/events/${id}/edit`)}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold text-white hover:opacity-90"
            style={{ background: '#8D5D1D' }}>
            <Pencil size={14} /> Edit
          </button>
        </div>
      }
    >
      <div className="max-w-[1000px] flex flex-col gap-4">
        <button onClick={() => navigate('/admin/events')}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#667382] hover:text-[#11161C] self-start">
          <ArrowLeft size={15} /> Events
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-md" style={{ background: st.bg, color: st.fg }}>
            {st.label}
          </span>
          {ev.status !== 'published' && (
            <span className="text-[12.5px] text-[#667382]">Not publicly buyable until published.</span>
          )}
          {tiers.length === 0 && (
            <span className="text-[12.5px] font-semibold" style={{ color: '#8A6100' }}>
              No ticket types yet — nothing can sell.
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Sold" value={sales.tickets_sold ?? 0}
            sub={`${sales.tickets_remaining ?? 0} left of ${sales.tickets_total ?? 0}`} />
          <Stat label="Checked in" value={sales.checked_in ?? 0} />
          <Stat label="Paid orders" value={sales.orders_paid ?? 0}
            sub={Number(sales.orders_needing_refund) > 0 ? `${sales.orders_needing_refund} need refund` : null} />
          <Stat label="Net settlement" value={formatMoney(sales.net_settlement ?? 0, 'NGN')} sub="Owed to organiser" />
        </div>

        <div className="bg-white rounded-xl border border-[#D7DDE4] p-5">
          <h2 className="font-bold text-[14px] text-[#11161C] mb-1">Money</h2>
          <p className="text-[12px] text-[#98A4B2] mb-3">
            Ticket sales belong to the organiser; our fee and VAT come out of that. Paystack's cut is paid by the buyer.
          </p>
          <div className="max-w-[420px]">
            <Money label="Gross ticket sales" value={sales.gross_sales} />
            {Number(sales.refunded_sales) > 0 && <Money label="Refunded" value={sales.refunded_sales} deduct />}
            <Money label="Interflow fee" value={sales.service_fee} deduct />
            <Money label="VAT" value={sales.vat} deduct />
            <div className="border-t border-[#E7ECF1] mt-1 pt-1">
              <Money label="Net settlement" value={sales.net_settlement} strong />
            </div>
          </div>
        </div>

        {/* Tiers */}
        <div className="bg-white rounded-xl border border-[#D7DDE4] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E7ECF1] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TicketIcon size={15} className="text-[#98A4B2]" />
              <h2 className="font-bold text-[14px] text-[#11161C]">Ticket types</h2>
            </div>
            <button onClick={() => setTierDialog({})}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#D7DDE4] text-[12.5px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA]">
              <Plus size={14} /> Add
            </button>
          </div>

          {tiers.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-[14px] font-semibold text-[#11161C] mb-1">No ticket types</p>
              <p className="text-[13px] text-[#667382]">An event can't sell anything until it has at least one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[720px]">
                <thead className="bg-[#F6F8FA]">
                  <tr>
                    {['Type', 'Price', 'Sold', 'Held', 'Left', 'Revenue', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#667382] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tiers.map(t => (
                    <tr key={t.id} className="border-t border-[#E7ECF1]">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[#11161C]">{t.name}</span>
                        {t.is_active === false && (
                          <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                            style={{ background: '#EEF1F4', color: '#667382' }}>Off sale</span>
                        )}
                        {t.is_sold_out && (
                          <span className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                            style={{ background: '#E7EEF6', color: '#1F4E79' }}>Sold out</span>
                        )}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[#3D4854]">{formatMoney(t.price, 'NGN')}</td>
                      <td className="px-4 py-3 tabular-nums text-[#11161C] font-medium">
                        {t.sold ?? 0}<span className="text-[#98A4B2] font-normal"> / {t.quantity_total ?? 0}</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-[#667382]" title="In someone's checkout right now">{t.held ?? 0}</td>
                      <td className="px-4 py-3 tabular-nums text-[#667382]">{t.remaining ?? 0}</td>
                      <td className="px-4 py-3 tabular-nums font-semibold text-[#11161C]">{formatMoney(t.revenue ?? 0, 'NGN')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setTierDialog({ tier: t })} aria-label={`Edit ${t.name}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#667382] hover:bg-[#F6F8FA] hover:text-[#11161C]">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteTier(t)} aria-label={`Delete ${t.name}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#667382] hover:bg-[#F7E2DE] hover:text-[#A32B1C]">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-3 text-[11.5px] text-[#98A4B2] border-t border-[#E7ECF1]">
                Held tickets sit in someone's checkout, which is why sold and left won't always add up to the total.
              </p>
            </div>
          )}
        </div>
      </div>

      {tierDialog && (
        <TierDialog eventId={id} tier={tierDialog.tier}
          onClose={() => setTierDialog(null)}
          onDone={() => { setTierDialog(null); setLoading(true); load(); }} />
      )}
      {deleteTier && (
        <DeleteTierDialog tier={deleteTier}
          onClose={() => setDeleteTier(null)}
          onDone={() => { setDeleteTier(null); setLoading(true); load(); }} />
      )}
    </AdminLayout>
  );
};

export default AdminEventDetailPage;
