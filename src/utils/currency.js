/* ─────────────────────────────────────────────────────────────────
   Currency formatting for ticket prices.
   Amounts are handled in MAJOR units (naira), not kobo. If the API
   ever switches to minor units, convert at the API boundary — not here.
   ───────────────────────────────────────────────────────────────── */

export const formatMoney = (amount, currency = 'NGN') => {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency,
      minimumFractionDigits: n % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toLocaleString()}`;
  }
};

/** True when a ticket type is free (price 0). */
export const isFree = (amount) => Number(amount) === 0;

export default formatMoney;
