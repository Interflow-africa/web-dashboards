import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Camera, CameraOff, Keyboard, CheckCircle2, AlertTriangle, XCircle, RotateCcw, LogOut } from 'lucide-react';
import { eventsAPI } from '@/services/index';
import useAuthStore from '@/store/authStore';
import getApiError from '@/utils/apiError';
import InterflowLogo from '@/components/common/InterflowLogo';

const GOLD = '#8D5D1D';

/* A camera fires continuously, so the same code hits the API many times a
   second. Without suppression the second frame returns 409 "already used"
   a heartbeat after the first said valid, and staff conclude the scanner
   is broken. This is the single most important behaviour on this screen. */
const RESCAN_SUPPRESSION_MS = 3000;
const RESULT_VISIBLE_MS     = 4000;

const SCANNER_ID = 'interflow-qr-reader';

/* Outcome is carried by HTTP status, not a body field — don't depend on
   `result` being present. */
const outcomeFor = (status) => {
  if (status === 200 || status === 201) return 'valid';
  if (status === 409) return 'used';
  if (status === 404) return 'invalid';
  return 'rejected';                    // 400: cancelled, refunded, wrong event
};

const THEME = {
  valid:    { bg: '#0F5132', icon: CheckCircle2,  title: 'VALID TICKET'    },
  used:     { bg: '#8A5A00', icon: AlertTriangle, title: 'ALREADY USED'    },
  invalid:  { bg: '#8B1D1D', icon: XCircle,       title: 'INVALID TICKET'  },
  rejected: { bg: '#8B1D1D', icon: XCircle,       title: 'NOT ADMITTED'    },
};

const fmtTime = (iso) =>
  iso ? new Date(iso).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' }) : '';

/* ─── Full-bleed outcome overlay ────────────────────────────────── */
const Outcome = ({ outcome, ticket, message, onDismiss }) => {
  const t = THEME[outcome] || THEME.rejected;
  const Icon = t.icon;
  return (
    <button
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: t.bg }}>
      <Icon size={72} color="#fff" strokeWidth={2} />
      <p className="text-white font-bold mt-5" style={{ fontSize: 30, letterSpacing: '0.02em' }}>
        {t.title}
      </p>

      {ticket?.attendee_name && (
        <p className="text-white text-[22px] font-semibold mt-4">{ticket.attendee_name}</p>
      )}
      {ticket?.ticket_type_name && (
        <p className="text-white/75 text-[16px] mt-1">{ticket.ticket_type_name}</p>
      )}
      {outcome === 'used' && ticket?.checked_in_at && (
        <p className="text-white/85 text-[15px] mt-4">
          First scanned at {fmtTime(ticket.checked_in_at)}
        </p>
      )}
      {message && outcome !== 'valid' && (
        <p className="text-white/80 text-[14px] mt-4 max-w-[320px] leading-relaxed">{message}</p>
      )}
      {ticket?.ticket_id && (
        <p className="text-white/45 text-[12px] mt-5 font-mono">{ticket.ticket_id}</p>
      )}

      <p className="text-white/50 text-[13px] mt-10">Tap anywhere to scan the next ticket</p>
    </button>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Door check-in — standalone, mobile-first.

   Deliberately outside DashboardLayout: this is a phone at a venue
   entrance, not a dashboard session. Staff accounts carry a BLANK
   role, so nothing here may branch on role.
   ═══════════════════════════════════════════════════════════════ */
const CheckInPage = () => {
  const logout = useAuthStore(s => s.logout);

  const [events, setEvents]     = useState([]);
  const [eventId, setEventId]   = useState('');
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [scanning, setScanning] = useState(false);
  const [camError, setCamError] = useState(null);
  const [manual, setManual]     = useState(false);
  const [manualCode, setManualCode] = useState('');

  const [stats, setStats]       = useState(null);
  const [result, setResult]     = useState(null);
  const [busy, setBusy]         = useState(false);

  const scannerRef  = useRef(null);
  const recentRef   = useRef(new Map());   // token -> timestamp
  const dismissRef  = useRef(null);

  /* ── Events to scan against ── */
  useEffect(() => {
    let alive = true;
    eventsAPI.list()
      .then(r => {
        if (!alive) return;
        const d = r.data?.data ?? r.data ?? [];
        const list = Array.isArray(d) ? d : (d.results || []);
        setEvents(list);
        if (list.length === 1) setEventId(list[0].id);
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoadingEvents(false); });
    return () => { alive = false; };
  }, []);

  /* ── Counters ── */
  const refreshStats = useCallback((id) => {
    if (!id) return;
    eventsAPI.checkInStats(id)
      .then(r => setStats(r.data?.data || r.data || null))
      .catch(() => {});
  }, []);

  useEffect(() => { refreshStats(eventId); }, [eventId, refreshStats]);

  /* ── Submit a code ───────────────────────────────────────────── */
  const submit = useCallback(async (token, { fromCamera = false } = {}) => {
    if (!token || !eventId) return;

    if (fromCamera) {
      /* `!== undefined` rather than a truthiness test: a 0 timestamp would
         be falsy and silently disable suppression for that code. Note the
         stamp is NOT refreshed on a suppressed frame, so the window runs
         from the first accepted scan rather than sliding forever. */
      const last = recentRef.current.get(token);
      if (last !== undefined && Date.now() - last < RESCAN_SUPPRESSION_MS) return;
      recentRef.current.set(token, Date.now());
    }
    if (busy) return;
    setBusy(true);

    try {
      const r = await eventsAPI.checkIn({ qr_token: token, event: eventId });
      const d = r.data?.data || r.data || {};
      setResult({ outcome: outcomeFor(r.status), ticket: d.ticket, message: null });
      if (d.stats) setStats(d.stats);
    } catch (e) {
      const status = e?.response?.status;
      const body   = e?.response?.data?.data || {};
      setResult({
        outcome: outcomeFor(status),
        ticket: body.ticket,
        message: getApiError(e, 'This ticket could not be accepted.'),
      });
      /* Every response carries fresh stats, errors included. */
      if (body.stats) setStats(body.stats);
      else refreshStats(eventId);
    } finally {
      setBusy(false);
      clearTimeout(dismissRef.current);
      dismissRef.current = setTimeout(() => setResult(null), RESULT_VISIBLE_MS);
    }
  }, [eventId, busy, refreshStats]);

  /* ── Camera lifecycle ─────────────────────────────────────────── */
  const stopCamera = useCallback(async () => {
    const inst = scannerRef.current;
    scannerRef.current = null;
    if (!inst) return;
    try { await inst.stop(); } catch { /* already stopped */ }
    try { await inst.clear(); } catch { /* nothing rendered */ }
  }, []);

  const startCamera = useCallback(async () => {
    setCamError(null);
    try {
      /* Loaded on demand so the library never enters any other route's
         bundle — and so a browser without camera support fails here
         rather than at import time. */
      const { Html5Qrcode } = await import('html5-qrcode');
      const inst = new Html5Qrcode(SCANNER_ID, { verbose: false });
      scannerRef.current = inst;
      await inst.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => submit(decoded, { fromCamera: true }),
        () => { /* per-frame decode misses are normal; ignore */ },
      );
      setScanning(true);
    } catch (e) {
      await stopCamera();
      setScanning(false);
      const msg = String(e?.message || e);
      setCamError(
        /permission|denied|NotAllowed/i.test(msg)
          ? 'Camera permission was denied. Allow access, or use manual entry.'
          : /secure|https/i.test(msg)
            ? 'The camera needs a secure (https) connection.'
            : 'Could not start the camera. Use manual entry instead.',
      );
      setManual(true);
    }
  }, [submit, stopCamera]);

  /* Tear the camera down on unmount. */
  useEffect(() => () => { stopCamera(); clearTimeout(dismissRef.current); }, [stopCamera]);

  const canScan = Boolean(eventId);
  const selectedEvent = events.find(e => String(e.id) === String(eventId));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0D0D0D' }}>
      {/* Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
        <InterflowLogo variant="light" style={{ height: 28, width: 'auto' }} />
        <div className="flex items-center gap-3">
          <Link to="/" className="text-white/40 text-[12px] hover:text-white/70 transition-colors">Exit</Link>
          <button onClick={logout} title="Log out"
            className="text-white/40 hover:text-white/70 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-4 py-5 gap-4 max-w-[520px] w-full mx-auto">
        <div>
          <h1 className="text-white font-bold text-[22px]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Check-in
          </h1>
          <p className="text-white/40 text-[13px]">Scan a ticket QR at the door</p>
        </div>

        {/* Event picker — required before any scan can be attributed */}
        <div>
          <label className="block text-[11px] font-semibold text-white/40 uppercase tracking-wide mb-1.5">
            Event
          </label>
          {loadingEvents ? (
            <div className="h-12 rounded-xl bg-white/5 animate-pulse" />
          ) : events.length === 0 ? (
            <p className="text-white/50 text-[13px] py-3">No events available to scan.</p>
          ) : (
            <select
              value={eventId}
              onChange={e => { setEventId(e.target.value); setResult(null); }}
              className="w-full rounded-xl px-4 py-3 text-[15px] bg-white/10 text-white border border-white/15 outline-none focus:border-[#D4A84B]">
              <option value="" disabled style={{ color: '#111' }}>Select an event…</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id} style={{ color: '#111' }}>{ev.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Counters */}
        {stats && (
          <div className="grid grid-cols-3 gap-2">
            {[
              ['Sold', stats.tickets_sold],
              ['Checked in', stats.checked_in],
              ['To arrive', stats.not_yet_arrived],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white/[0.06] border border-white/10 px-3 py-2.5 text-center">
                <p className="text-white font-bold text-[20px] leading-none">{value ?? 0}</p>
                <p className="text-white/40 text-[10.5px] mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Camera viewport */}
        <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10"
          style={{ aspectRatio: '1 / 1' }}>
          <div id={SCANNER_ID} className="w-full h-full" />
          {!scanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <Camera size={34} className="text-white/25" />
              <p className="text-white/40 text-[13px]">
                {canScan ? 'Camera is off' : 'Select an event to begin'}
              </p>
            </div>
          )}
        </div>

        {camError && (
          <p className="flex items-start gap-2 text-[12.5px] text-amber-300/90 leading-relaxed">
            <CameraOff size={14} className="shrink-0 mt-0.5" /> {camError}
          </p>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {scanning ? (
            <button onClick={async () => { await stopCamera(); setScanning(false); }}
              className="flex-1 h-12 rounded-full border border-white/20 text-white text-[14px] font-semibold hover:bg-white/5 transition-colors">
              Stop camera
            </button>
          ) : (
            <button onClick={startCamera} disabled={!canScan}
              className="flex-1 h-12 rounded-full text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-35"
              style={{ background: GOLD }}>
              <Camera size={16} /> Start scanning
            </button>
          )}
          <button onClick={() => setManual(m => !m)}
            className="h-12 px-4 rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            title="Manual entry">
            <Keyboard size={17} />
          </button>
        </div>

        {/* Manual entry — for a cracked screen, a dead camera, or denied permission */}
        {manual && (
          <form
            onSubmit={e => { e.preventDefault(); const c = manualCode.trim(); if (c) { submit(c); setManualCode(''); } }}
            className="flex gap-2">
            <input
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="Enter ticket code"
              autoCapitalize="characters"
              autoCorrect="off"
              className="flex-1 rounded-xl px-4 py-3 text-[15px] bg-white/10 text-white border border-white/15 outline-none focus:border-[#D4A84B] placeholder:text-white/25" />
            <button type="submit" disabled={!canScan || !manualCode.trim() || busy}
              className="px-5 rounded-xl text-white text-[14px] font-semibold disabled:opacity-35"
              style={{ background: GOLD }}>
              Check
            </button>
          </form>
        )}

        {selectedEvent && (
          <button onClick={() => refreshStats(eventId)}
            className="flex items-center justify-center gap-1.5 text-white/35 text-[12px] hover:text-white/60 transition-colors mt-auto pt-4">
            <RotateCcw size={12} /> Refresh counters
          </button>
        )}
      </div>

      {result && (
        <Outcome
          outcome={result.outcome}
          ticket={result.ticket}
          message={result.message}
          onDismiss={() => { clearTimeout(dismissRef.current); setResult(null); }}
        />
      )}
    </div>
  );
};

export default CheckInPage;
