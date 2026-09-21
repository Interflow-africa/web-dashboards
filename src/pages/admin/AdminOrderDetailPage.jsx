import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, MailWarning, Ticket as TicketIcon, X, RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/common/AdminLayout';
import { adminAPI } from '@/services/api';
import { formatMoney } from '@/utils/currency';
import { statusOf, isRefundable } from '@/utils/orderStatus';

const fmtWhen = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
  }) : '—';

const Chip = ({ status, large }) => {
  const s = statusOf(status);
  return (
    <span className={`inline-block font-bold rounded-md whitespace-nowrap ${large ? 'text-[12px] px-3 py-1.5' : 'text-[11px] px-2.5 py-1'}`}
      style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
};

const Field = ({ label, value, mono }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A4B2] mb-1">{label}</p>
    <p className={`text-[13.5px] text-[#11161C] break-words ${mono ? 'font-mono text-[12.5px]' : ''}`}>
      {value || '—'}
    </p>
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

/* ─── Refund confirm ──────────────────────────────────────────────
   Names the amount and the buyer, because "Are you sure?" gives an
   admin nothing to check against. Every admin has full power here. */
const RefundDialog = ({ order, onClose, onDone }) => {
  const [notes, setNotes]   = useState('');
  const [busy, setBusy]     = useState(false);
  const [failed, setFailed] = useState(null);

  const amount = order.total ?? order.refund_amount ?? 0;

  const submit = async () => {
    setBusy(true);
    setFailed(null);
    try {
      const r = await adminAPI.refund(order.id, { notes: notes.trim() });
      toast.success('Refunded. The tickets have been voided.');
      onDone(r.data?.data || r.data || null);
    } catch (err) {
      const code = err?.response?.status;
      const msg  = err?.response?.data?.message;
      /* 502 means Paystack refused and NOTHING changed — the order must
         be left exactly as it was, so this stays open rather than
         closing as though something happened. */
      if (code === 502) {
        setFailed(msg || 'Paystack refused the refund. Nothing was changed.');
      } else if (code === 400) {
        setFailed(msg || 'This order cannot be refunded.');
      } else {
        setFailed(msg || 'The refund could not be completed.');
      }
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[480px] max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#E7ECF1]">
          <div>
            <h2 className="font-bold text-[16px] text-[#11161C]">Refund this order</h2>
            <p className="text-[12.5px] text-[#667382]">Through Paystack, immediately</p>
          </div>
          <button onClick={onClose} disabled={busy}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#667382] hover:bg-[#EEF1F4] disabled:opacity-40">
            <X size={17} />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-4">
          <p className="text-[14px] text-[#11161C] leading-relaxed">
            Refund <strong>{formatMoney(amount, 'NGN')}</strong> to{' '}
            <strong>{order.customer_name || order.customer_email}</strong>?
          </p>
          <p className="text-[13px] text-[#667382] leading-relaxed -mt-2">
            This sends the money back through Paystack and voids{' '}
            {order.ticket_count === 1 ? 'their ticket' : `all ${order.ticket_count} tickets`} in one step.
            A voided ticket cannot be checked in. It can't be undone from here.
          </p>

          <div>
            <label htmlFor="refund-notes" className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A4B2] mb-1.5">
              Reason <span className="text-[#667382] font-normal normal-case tracking-normal">(recorded on the audit log)</span>
            </label>
            <textarea
              id="refund-notes"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. customer asked, event cancelled…"
              className="w-full border border-[#D7DDE4] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#8D5D1D] resize-y"
            />
          </div>

          {failed && (
            <div className="rounded-lg px-4 py-3 border" style={{ background: '#F7E2DE', borderColor: '#E8BDB4' }}>
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: '#A32B1C' }}>
                Not refunded
              </p>
              <p className="text-[13px]" style={{ color: '#7E2115' }}>{failed}</p>
              <p className="text-[12.5px] mt-1.5" style={{ color: '#A32B1C' }}>
                The order is unchanged. Nothing was sent.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={busy}
              className="flex-1 h-11 rounded-lg border border-[#D7DDE4] text-[13.5px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA] disabled:opacity-50">
              Cancel
            </button>
            <button onClick={submit} disabled={busy}
              className="flex-1 h-11 rounded-lg text-white text-[13.5px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: '#A32B1C' }}>
              {busy ? 'Refunding…' : failed ? 'Try again' : 'Refund'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder]     = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [dialog, setDialog]   = useState(false);

  /* Detail is documented as "order + its tickets"; accept either a
     nested { order, tickets } or a flat order carrying tickets. */
  const absorb = (d) => {
    const o = d?.order || d || {};
    setOrder(o);
    setTickets(d?.tickets || o?.tickets || []);
  };

  useEffect(() => {
    let alive = true;
    adminAPI.order(id)
      .then(r => { if (alive) absorb(r.data?.data || r.data); })
      .catch(err => {
        if (!alive) return;
        setError(err?.response?.status === 403
          ? 'This account is not an admin.'
          : (err?.response?.data?.message || 'This order could not be found.'));
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  if (loading) {
    return (
      <AdminLayout title="Order">
        <div className="max-w-[900px] flex flex-col gap-4">
          <div className="h-[120px] bg-white rounded-xl border border-[#D7DDE4] animate-pulse" />
          <div className="h-[220px] bg-white rounded-xl border border-[#D7DDE4] animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout title="Order">
        <button onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#667382] hover:text-[#11161C] mb-4">
          <ArrowLeft size={15} /> Orders
        </button>
        <div className="bg-white rounded-xl border border-[#D7DDE4] p-12 text-center">
          <AlertTriangle size={22} className="text-[#A32B1C] mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-[#11161C]">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  const emailMissing = order.status === 'paid' && !order.tickets_emailed_at;
  const refundable   = isRefundable(order.status);

  return (
    <AdminLayout
      title={order.order_number || 'Order'}
      subtitle={order.event_name}
      actions={refundable ? (
        <button onClick={() => setDialog(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#A32B1C' }}>
          <RotateCcw size={14} /> Refund
        </button>
      ) : null}
    >
      <div className="max-w-[900px] flex flex-col gap-4">
        <button onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#667382] hover:text-[#11161C] self-start">
          <ArrowLeft size={15} /> Orders
        </button>

        {order.status === 'needs_refund' && (
          <div className="rounded-xl px-4 py-3.5 flex items-start gap-3" style={{ background: '#F7E2DE' }}>
            <AlertTriangle size={18} style={{ color: '#A32B1C' }} className="shrink-0 mt-0.5" />
            <p className="text-[13.5px]" style={{ color: '#7E2115' }}>
              <strong>This buyer was charged but received no ticket.</strong> Refund them, or issue the
              tickets manually if the event can still honour them.
            </p>
          </div>
        )}

        {emailMissing && (
          <div className="rounded-xl px-4 py-3.5 flex items-start gap-3" style={{ background: '#F6EBD4' }}>
            <MailWarning size={18} style={{ color: '#8A6100' }} className="shrink-0 mt-0.5" />
            <p className="text-[13.5px]" style={{ color: '#6B4C00' }}>
              Paid, but the tickets were never emailed. The buyer may not know they have them.
            </p>
          </div>
        )}

        {/* Buyer + payment */}
        <div className="bg-white rounded-xl border border-[#D7DDE4] p-5">
          <div className="flex items-center gap-3 mb-4">
            <Chip status={order.status} large />
            <span className="text-[12.5px] text-[#667382]">Placed {fmtWhen(order.created_at)}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            <Field label="Buyer"    value={order.customer_name} />
            <Field label="Email"    value={order.customer_email} />
            <Field label="Phone"    value={order.customer_phone} />
            <Field label="Tickets"  value={order.ticket_count} />
            <Field label="Provider" value={order.payment_provider} />
            <Field label="Reference" value={order.payment_reference} mono />
            <Field label="Paid at"  value={fmtWhen(order.paid_at)} />
            <Field label="Tickets emailed" value={order.tickets_emailed_at ? fmtWhen(order.tickets_emailed_at) : 'Never'} />
          </div>
        </div>

        {/* Money */}
        <div className="bg-white rounded-xl border border-[#D7DDE4] p-5">
          <h2 className="font-bold text-[14px] text-[#11161C] mb-3">Money</h2>
          <div className="max-w-[420px]">
            <Money label="Tickets" value={order.subtotal} />
            <Money label="Payment processing" value={order.payment_processing_fee} />
            <div className="border-t border-[#E7ECF1] mt-1 pt-1">
              <Money label="Charged to buyer" value={order.total} strong />
            </div>
            <div className="mt-4 pt-3 border-t border-dashed border-[#D7DDE4]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A4B2] mb-1">
                Deducted from the organiser
              </p>
              <Money label="Interflow fee" value={order.platform_fee} deduct />
              <Money label="VAT" value={order.vat} deduct />
              <div className="border-t border-[#E7ECF1] mt-1 pt-1">
                <Money label="Net to organisation" value={order.net_to_organization} strong />
              </div>
            </div>
          </div>
        </div>

        {/* Refund record */}
        {(order.refunded_at || order.refund_amount || order.refund_notes) && (
          <div className="bg-white rounded-xl border border-[#D7DDE4] p-5">
            <h2 className="font-bold text-[14px] text-[#11161C] mb-3">Refund</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              <Field label="Amount"    value={order.refund_amount != null ? formatMoney(order.refund_amount, 'NGN') : '—'} />
              <Field label="When"      value={fmtWhen(order.refunded_at)} />
              <Field label="Reference" value={order.refund_reference} mono />
              {order.refund_notes && <Field label="Reason" value={order.refund_notes} />}
            </div>
          </div>
        )}

        {/* Tickets */}
        <div className="bg-white rounded-xl border border-[#D7DDE4] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E7ECF1] flex items-center gap-2">
            <TicketIcon size={15} className="text-[#98A4B2]" />
            <h2 className="font-bold text-[14px] text-[#11161C]">
              Tickets {tickets.length > 0 && <span className="text-[#98A4B2] font-normal">({tickets.length})</span>}
            </h2>
          </div>
          {tickets.length === 0 ? (
            <p className="px-5 py-10 text-center text-[13px] text-[#667382]">
              No tickets were issued for this order.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] min-w-[520px]">
                <thead className="bg-[#F6F8FA]">
                  <tr>
                    {['Ticket ID', 'Attendee', 'Type', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#667382]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(t => (
                    <tr key={t.ticket_id || t.id} className="border-t border-[#E7ECF1]">
                      <td className="px-5 py-3 font-mono text-[12px] text-[#11161C]">{t.ticket_id}</td>
                      <td className="px-5 py-3 text-[#3D4854]">{t.attendee_name || '—'}</td>
                      <td className="px-5 py-3 text-[#3D4854]">{t.ticket_type_name || '—'}</td>
                      <td className="px-5 py-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize"
                          style={t.status === 'valid'
                            ? { background: '#DDEDE5', color: '#146B47' }
                            : { background: '#EEF1F4', color: '#667382' }}>
                          {(t.status || '—').replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {dialog && (
        <RefundDialog
          order={order}
          onClose={() => setDialog(false)}
          onDone={(updated) => {
            setDialog(false);
            if (updated) absorb(updated);
            else adminAPI.order(id).then(r => absorb(r.data?.data || r.data)).catch(() => {});
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminOrderDetailPage;
