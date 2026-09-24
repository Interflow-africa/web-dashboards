/* ─────────────────────────────────────────────────────────────────
   Event vocabulary and time handling for the admin console.

   TIMES ARE UTC. Admin enters event times as UTC and the API stores
   them that way, so we must NOT let the browser reinterpret them.
   A <input type="datetime-local"> holds a zone-less wall-clock string,
   and `new Date(that).toISOString()` would apply the viewer's offset —
   shifting a 7pm Lagos event by an hour, or by five in New York.
   So we attach Z directly instead of converting.
   ───────────────────────────────────────────────────────────────── */

export const EVENT_CATEGORIES = [
  { value: 'concert',    label: 'Concert' },
  { value: 'festival',   label: 'Festival' },
  { value: 'theatre',    label: 'Theatre' },
  { value: 'party',      label: 'Party / Social' },
  { value: 'conference', label: 'Conference' },
  { value: 'workshop',   label: 'Workshop' },
  { value: 'exhibition', label: 'Exhibition' },
  { value: 'other',      label: 'Other' },
];

export const EVENT_STATUS = {
  draft:     { label: 'Draft',     bg: '#EEF1F4', fg: '#667382' },
  published: { label: 'Published', bg: '#DDEDE5', fg: '#146B47' },
  paused:    { label: 'Paused',    bg: '#F6EBD4', fg: '#8A6100' },
  sold_out:  { label: 'Sold out',  bg: '#E7EEF6', fg: '#1F4E79' },
  completed: { label: 'Completed', bg: '#EEF1F4', fg: '#667382' },
  cancelled: { label: 'Cancelled', bg: '#F7E2DE', fg: '#A32B1C' },
};

export const eventStatusOf = (s) =>
  EVENT_STATUS[s] || { label: (s || '—').replace(/_/g, ' '), bg: '#EEF1F4', fg: '#667382' };

export const STATUS_OPTIONS = Object.entries(EVENT_STATUS).map(([value, v]) => ({ value, label: v.label }));

export const STATUS_FILTERS = [{ value: '', label: 'All statuses' }, ...STATUS_OPTIONS];

/* ISO UTC ("2026-10-31T19:00:00Z") → datetime-local value ("2026-10-31T19:00")
   Read the UTC parts explicitly; toISOString would be right but slicing
   the local string would not. */
export const isoToLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
};

/* datetime-local value → ISO UTC, treating what was typed AS UTC. */
export const localInputToIso = (v) => {
  if (!v) return null;
  const s = v.length === 16 ? `${v}:00` : v;      // some browsers include seconds
  return `${s}Z`;
};

/* Render a stored UTC instant without shifting into the viewer's zone. */
export const fmtUtc = (iso, withTime = true) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const opts = { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' };
  if (withTime) { opts.hour = 'numeric'; opts.minute = '2-digit'; }
  return d.toLocaleString('en-GB', opts);
};
