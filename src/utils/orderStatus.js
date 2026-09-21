/* ─────────────────────────────────────────────────────────────────
   Order status presentation.

   Shared by the orders list and the order detail so the two can't
   drift. `needs_refund` is deliberately the loudest: it means money
   arrived that we could not fulfil, i.e. someone paid and has no
   ticket, which is the only status a customer feels before we do.
   ───────────────────────────────────────────────────────────────── */

export const ORDER_STATUS = {
  pending:      { label: 'Pending',      bg: '#F6EBD4', fg: '#8A6100' },
  paid:         { label: 'Paid',         bg: '#DDEDE5', fg: '#146B47' },
  failed:       { label: 'Failed',       bg: '#F7E2DE', fg: '#A32B1C' },
  abandoned:    { label: 'Abandoned',    bg: '#EEF1F4', fg: '#667382' },
  needs_refund: { label: 'Needs refund', bg: '#A32B1C', fg: '#FFFFFF', urgent: true },
  refunded:     { label: 'Refunded',     bg: '#E7EEF6', fg: '#1F4E79' },
  cancelled:    { label: 'Cancelled',    bg: '#EEF1F4', fg: '#667382' },
};

export const statusOf = (s) =>
  ORDER_STATUS[s] || { label: (s || '—').replace(/_/g, ' '), bg: '#EEF1F4', fg: '#667382' };

/* Only a paid order can be refunded; the API rejects anything else with 400. */
export const isRefundable = (status) => status === 'paid' || status === 'needs_refund';

export const STATUS_FILTERS = [
  { value: '',             label: 'All statuses' },
  { value: 'needs_refund', label: 'Needs refund' },
  { value: 'paid',         label: 'Paid' },
  { value: 'pending',      label: 'Pending' },
  { value: 'failed',       label: 'Failed' },
  { value: 'abandoned',    label: 'Abandoned' },
  { value: 'refunded',     label: 'Refunded' },
  { value: 'cancelled',    label: 'Cancelled' },
];

export default ORDER_STATUS;
