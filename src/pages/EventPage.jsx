import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, X, Minus, Plus, ArrowRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { eventsAPI } from '@/services/index';
import getApiError from '@/utils/apiError';
import { formatMoney, isFree } from '@/utils/currency';
import InterflowLogo from '@/components/common/InterflowLogo';

const GOLD      = '#8D5D1D';
const GOLD_DARK = '#7A4E16';

/* ─── Date/time helpers ─────────────────────────────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = String(t).split(':');
  const date = new Date();
  date.setHours(Number(h), Number(m || 0));
  return date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });
};

/* A ticket type is buyable only if active, in its sales window and in stock. */
const availabilityOf = (t) => {
  if (t.is_active === false)            return { ok: false, label: 'Unavailable' };
  if (Number(t.remaining) <= 0)         return { ok: false, label: 'Sold Out' };
  if (t.sales_start_date && new Date(t.sales_start_date) > new Date())
                                        return { ok: false, label: 'Not Yet On Sale' };
  if (t.sales_end_date) {
    /* Sales run through the END of the closing day. */
    const end = new Date(t.sales_end_date);
    end.setHours(23, 59, 59, 999);
    if (end < new Date())               return { ok: false, label: 'Sales Closed' };
  }
  return { ok: true, label: null };
};

/* ─── Full-page states ──────────────────────────────────────────── */
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#0D0D0D' }}>
    <div style={{ width: 44, height: 44, border: '3px solid rgba(212,168,75,0.2)', borderTopColor: '#D4A84B', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'rgba(255,255,255,0.35)' }}>Loading…</p>
  </div>
);

const Unavailable = ({ title, message }) => (
  <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-3 text-center" style={{ background: '#0D0D0D' }}>
    {title && (
      <p className="text-white font-bold text-[24px]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>{title}</p>
    )}
    <p className="text-white/45 text-[15px]">{message}</p>
    <Link to="/" className="text-[#D4A84B] text-[14px] hover:underline mt-2">Go to Interflow</Link>
  </div>
);

/* ─── Checkout modal — quantity + attendee details (§10) ────────── */
const CheckoutModal = ({ event, ticket, onClose }) => {
  const [qty, setQty]         = useState(1);
  const [form, setForm]       = useState({ full_name: '', email: '', phone_number: '' });
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => { const n = { ...er }; delete n[k]; return n; });
  };

  /* Never let the UI offer more than stock or the per-order cap. */
  const maxQty = Math.max(1, Math.min(Number(ticket.remaining) || 1, Number(ticket.max_per_order) || 10));
  const total  = Number(ticket.price) * qty;

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim())     e.email     = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (!form.phone_number.trim()) e.phone_number = 'Phone number is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await eventsAPI.createOrder(event.slug, {
        ticket_type: ticket.id,
        quantity: qty,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
      });
      const d = res.data?.data || res.data || {};

      if (!d.authorization_url) {
        toast.error('Could not start checkout. Please try again.');
        setSubmitting(false);
        return;
      }
      /* Hand off to Paystack. The ticket is issued by the webhook, never here. */
      window.location.href = d.authorization_url;
    } catch (err) {
      toast.error(getApiError(err, 'Could not start checkout. Please try again.'));
      setSubmitting(false);
    }
  };

  const inputCls = (bad) =>
    `w-full border rounded-xl px-4 py-3 text-[14px] text-gray-800 outline-none transition-colors placeholder:text-gray-300 ${
      bad ? 'border-red-400' : 'border-gray-200 focus:border-[#8D5D1D]'}`;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-[460px] max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="min-w-0">
            <h2 className="font-bold text-[16px] text-gray-900 truncate">{ticket.name}</h2>
            <p className="text-[12px] text-gray-400 truncate">{event.name}</p>
          </div>
          <button onClick={onClose} type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 shrink-0">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-5 py-5 flex flex-col gap-5">
          {/* Quantity */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#8D5D1D] disabled:opacity-35 transition-colors">
                <Minus size={15} />
              </button>
              <span className="text-[20px] font-bold text-gray-900 w-8 text-center">{qty}</span>
              <button type="button" onClick={() => setQty(q => Math.min(maxQty, q + 1))} disabled={qty >= maxQty}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#8D5D1D] disabled:opacity-35 transition-colors">
                <Plus size={15} />
              </button>
              <span className="text-[12px] text-gray-400 ml-1">Max {maxQty} per order</span>
            </div>
          </div>

          {/* Attendee details */}
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input className={inputCls(errors.full_name)} placeholder="e.g. Dayo Ajayi"
                value={form.full_name} onChange={set('full_name')} />
              {errors.full_name && <p className="mt-1 text-[12px] text-red-500">{errors.full_name}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input type="email" className={inputCls(errors.email)} placeholder="dayo@example.com"
                value={form.email} onChange={set('email')} />
              {errors.email
                ? <p className="mt-1 text-[12px] text-red-500">{errors.email}</p>
                : <p className="mt-1 text-[12px] text-gray-400">Your ticket will be sent here.</p>}
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input type="tel" className={inputCls(errors.phone_number)} placeholder="080XXXXXXXX"
                value={form.phone_number} onChange={set('phone_number')} />
              {errors.phone_number && <p className="mt-1 text-[12px] text-red-500">{errors.phone_number}</p>}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-[13px] text-gray-500">
              {qty} × {isFree(ticket.price) ? 'Free' : formatMoney(ticket.price, ticket.currency)}
            </span>
            <span className="text-[20px] font-bold text-gray-900">
              {isFree(total) ? 'Free' : formatMoney(total, ticket.currency)}
            </span>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full h-12 rounded-full text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{ background: GOLD }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.background = GOLD_DARK; }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.background = GOLD; }}>
            {submitting ? 'Starting checkout…' : <>Proceed to Payment <ArrowRight size={15} /></>}
          </button>

          <p className="text-[11.5px] text-gray-400 text-center -mt-1">
            You'll be redirected to Paystack to complete payment securely.
          </p>
        </form>
      </div>
    </div>
  );
};

/* ─── Ticket row ────────────────────────────────────────────────── */
const TicketRow = ({ ticket, onBuy }) => {
  const { ok, label } = availabilityOf(ticket);

  return (
    <div className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border transition-colors ${
      ok ? 'border-gray-200 bg-white hover:border-[#8D5D1D]/40' : 'border-gray-100 bg-gray-50'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`font-bold text-[15px] ${ok ? 'text-gray-900' : 'text-gray-400'}`}>{ticket.name}</p>
          {!ok && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
              {label}
            </span>
          )}
        </div>
        {ticket.description && (
          <p className="text-[12.5px] text-gray-500 mt-0.5">{ticket.description}</p>
        )}
        <p className={`text-[17px] font-bold mt-1.5 ${ok ? 'text-gray-900' : 'text-gray-400'}`}>
          {isFree(ticket.price) ? 'Free' : formatMoney(ticket.price, ticket.currency)}
        </p>

        {/* Scarcity nudge — only when genuinely low */}
        {ok && Number(ticket.remaining) <= 20 && (
          <p className="text-[11.5px] font-semibold text-amber-600 mt-1">
            Only {ticket.remaining} left
          </p>
        )}
        {ok && ticket.sales_end_date && (
          <p className="text-[11.5px] text-gray-400 mt-1 flex items-center gap-1">
            <Clock size={11} /> Sales end {fmtDate(ticket.sales_end_date)}
          </p>
        )}
      </div>

      <button
        onClick={() => onBuy(ticket)}
        disabled={!ok}
        className="shrink-0 px-5 sm:px-6 h-11 rounded-full text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:active:scale-100"
        style={ok ? { background: GOLD } : undefined}>
        {ok ? 'Buy Ticket' : label}
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Public Event Page (§7)
   ═══════════════════════════════════════════════════════════════ */
const EventPage = () => {
  const { slug } = useParams();

  const [event, setEvent]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [buying, setBuying]   = useState(null);

  useEffect(() => {
    let alive = true;
    eventsAPI.detail(slug)
      .then(r => { if (alive) setEvent(r.data?.data || r.data); })
      .catch(err => { if (alive) setError(getApiError(err, 'Event not found')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

  const tickets = useMemo(() => event?.ticket_types || [], [event]);
  const allGone = tickets.length > 0 && tickets.every(t => !availabilityOf(t).ok);

  if (loading) return <PageLoader />;
  if (error || !event) return <Unavailable message="This event is not available." />;

  /* Only published events are purchasable (§6). */
  if (event.status && event.status !== 'published') {
    const copy = {
      cancelled: 'This event has been cancelled.',
      completed: 'This event has already taken place.',
      paused:    'Ticket sales are temporarily paused.',
      sold_out:  'This event is sold out.',
      draft:     'This event is not available yet.',
    };
    return <Unavailable title={event.name} message={copy[event.status] || 'Tickets are not on sale.'} />;
  }

  const location = [event.venue_name, event.city, event.country].filter(Boolean).join(', ');
  const dateLine = [
    fmtDate(event.start_date),
    fmtTime(event.start_time),
  ].filter(Boolean).join(' · ');

  return (
    <div className="min-h-screen" style={{ background: '#F4F2EE' }}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-5 sm:px-6 py-3 flex items-center justify-between">
        <InterflowLogo variant="dark" style={{ height: 34, width: 'auto' }} />
        <a href="#tickets" className="text-[13px] font-semibold" style={{ color: GOLD }}>Get Tickets</a>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden" style={{
        background: event.image
          ? 'linear-gradient(to bottom, rgba(13,13,13,0.55) 0%, rgba(13,13,13,0.88) 100%)'
          : 'linear-gradient(135deg, #0D0D0D 0%, #1a1208 60%, #0D0D0D 100%)',
        minHeight: 260,
      }}>
        {event.image && (
          <img src={event.image} alt="" className="absolute inset-0 w-full h-full object-cover -z-10 opacity-55" />
        )}
        <div className="relative z-10 max-w-[720px] mx-auto px-5 sm:px-6 py-12">
          {event.category && (
            <p className="text-[#D4A84B] text-[12px] font-bold uppercase tracking-[0.15em] mb-3">{event.category}</p>
          )}
          <h1 className="text-white font-bold leading-tight mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(30px, 6vw, 48px)' }}>
            {event.name}
          </h1>
          <div className="flex flex-col gap-1.5 text-white/75 text-[14px]">
            {dateLine && (
              <p className="flex items-center gap-2"><Calendar size={14} className="shrink-0" /> {dateLine}</p>
            )}
            {location && (
              <p className="flex items-center gap-2"><MapPin size={14} className="shrink-0" /> {location}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* About */}
        {event.description && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[16px] text-gray-900 mb-3">About the Event</h2>
            <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </section>
        )}

        {/* Artists / Programme */}
        {event.programme && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[16px] text-gray-900 mb-3">Artists / Programme</h2>
            <p className="text-[14px] text-gray-600 leading-relaxed whitespace-pre-wrap">{event.programme}</p>
          </section>
        )}

        {/* Tickets */}
        <section id="tickets" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 scroll-mt-20">
          <h2 className="font-bold text-[16px] text-gray-900 mb-4">Tickets</h2>

          {tickets.length === 0 ? (
            <p className="text-[13.5px] text-gray-400 py-6 text-center">
              Tickets are not on sale yet. Check back soon.
            </p>
          ) : (
            <>
              {allGone && (
                <div className="mb-4 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-center">
                  <p className="text-[13.5px] font-semibold text-gray-700">This event is sold out</p>
                  <p className="text-[12.5px] text-gray-400 mt-0.5">All ticket types are unavailable.</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {tickets.map(t => <TicketRow key={t.id} ticket={t} onBuy={setBuying} />)}
              </div>
            </>
          )}
        </section>

        {/* Venue */}
        {(event.venue_name || event.address) && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-bold text-[16px] text-gray-900 mb-2">Venue</h2>
            <p className="text-[14px] text-gray-700 font-medium">{event.venue_name}</p>
            <p className="text-[13.5px] text-gray-500">
              {[event.address, event.city, event.country].filter(Boolean).join(', ')}
            </p>
            {event.google_maps_url && (
              <a href={event.google_maps_url} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-2 text-[13px] font-semibold hover:underline" style={{ color: GOLD }}>
                View on Google Maps →
              </a>
            )}
          </section>
        )}

        <p className="text-center text-[12px] text-gray-400 pb-4">
          Presented by {event.organisation_name || 'Interflow'} · Powered by Interflow
        </p>
      </div>

      {buying && (
        <CheckoutModal event={event} ticket={buying} onClose={() => setBuying(null)} />
      )}
    </div>
  );
};

export default EventPage;
