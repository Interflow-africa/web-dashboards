import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Info, ImagePlus, X, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLayout from '@/components/common/AdminLayout';
import { adminAPI } from '@/services/api';
import { imageUrl } from '@/utils/imageUrl';
import {
  EVENT_CATEGORIES, STATUS_OPTIONS, isoToLocalInput, localInputToIso,
} from '@/utils/eventMeta';

const inputCls = 'w-full bg-white border border-[#D7DDE4] rounded-lg px-3 py-2.5 text-[13.5px] text-[#11161C] outline-none focus:border-[#8D5D1D] placeholder:text-[#98A4B2]';
const labelCls = 'block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98A4B2] mb-1.5';

const Field = ({ label, required, hint, error, children, wide }) => (
  <div className={wide ? 'sm:col-span-2' : ''}>
    <label className={labelCls}>
      {label}{required && <span style={{ color: '#A32B1C' }}> *</span>}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-[12px] text-[#98A4B2]">{hint}</p>}
    {error && <p className="mt-1 text-[12px]" style={{ color: '#A32B1C' }}>{error}</p>}
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-[#D7DDE4] p-5">
    <h2 className="font-bold text-[14px] text-[#11161C] mb-4">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">{children}</div>
  </div>
);

const EMPTY = {
  organization: '', name: '', slug: '', category: 'concert', status: 'draft',
  description: '', image: '',
  venue_name: '', address: '', city: '', country: '', google_maps_url: '',
  start_at: '', end_at: '',
  programme: '', additional_info: '', website: '', instagram: '',
  contact_name: '', contact_email: '', contact_phone: '',
};

const AdminEventFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [form, setForm]     = useState(EMPTY);
  const [orgs, setOrgs]     = useState([]);
  const [orgsCapped, setOrgsCapped] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview]     = useState('');
  const [urlMode, setUrlMode]     = useState(false);
  const fileRef = useRef(null);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState(null);

  const set = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(er => { const n = { ...er }; delete n[k]; return n; });
  };

  /* Object URLs are only freed by hand. */
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const pickFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('That file is not an image.'); return; }
    if (file.size > 5 * 1024 * 1024)     { toast.error('Images must be under 5MB.'); return; }
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setForm(f => ({ ...f, image: '' }));
    setErrors(er => { const n = { ...er }; delete n.image; return n; });
  };

  const clearImage = () => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setImageFile(null);
    setPreview('');
    setForm(f => ({ ...f, image: '' }));
    if (fileRef.current) fileRef.current.value = '';
  };

  /* An event belongs to an organisation USER, not an org profile id. */
  useEffect(() => {
    adminAPI.users({ role: 'organization', page_size: 100 })
      .then(r => {
        const d = r.data || {};
        setOrgs(d.results || []);
        if ((d.count ?? 0) > (d.results || []).length) setOrgsCapped(true);
      })
      .catch(() => setOrgs([]));
  }, []);

  useEffect(() => {
    if (!editing) return;
    let alive = true;
    adminAPI.event(id)
      .then(r => {
        if (!alive) return;
        const d = r.data?.data || r.data || {};
        const ev = d.event || d;
        setForm({
          ...EMPTY,
          ...Object.fromEntries(Object.keys(EMPTY).map(k => [k, ev[k] ?? ''])),
          organization: ev.organization || ev.organization_id || '',
          start_at: isoToLocalInput(ev.start_at),
          end_at:   isoToLocalInput(ev.end_at),
        });
        if (ev.image) setPreview(imageUrl(ev.image));
      })
      .catch(err => {
        if (alive) setLoadError(err?.response?.data?.message || 'This event could not be loaded.');
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id, editing]);

  const validate = () => {
    const e = {};
    if (!form.organization) e.organization = 'Choose the organisation this event belongs to';
    if (!form.name.trim())  e.name         = 'Required';
    if (!form.venue_name.trim()) e.venue_name = 'Required';
    if (!form.city.trim())    e.city    = 'Required';
    if (!form.country.trim()) e.country = 'Required';
    if (!form.start_at)       e.start_at = 'Required';
    if (form.end_at && form.start_at && form.end_at < form.start_at)
      e.end_at = 'Ends before it starts';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Check the highlighted fields.');
      return;
    }
    setSaving(true);
    try {
      /* Times are entered and stored as UTC — attach Z rather than
         converting, which would apply the admin's own offset. */
      const payload = { ...form, start_at: localInputToIso(form.start_at) };
      payload.end_at = form.end_at ? localInputToIso(form.end_at) : null;
      Object.keys(payload).forEach(k => {
        if (payload[k] === '' && !['name', 'venue_name', 'city', 'country'].includes(k)) delete payload[k];
      });

      /* A chosen file has to go as multipart; a pasted URL stays JSON.
         null would arrive as the string "null" in a FormData, so it is
         sent as an empty field instead. */
      let body = payload;
      if (imageFile) {
        body = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (k === 'image') return;
          body.append(k, v === null || v === undefined ? '' : String(v));
        });
        body.append('image', imageFile);
      }

      const r = editing
        ? await adminAPI.updateEvent(id, body)
        : await adminAPI.createEvent(body);
      const saved = r.data?.data || r.data || {};
      const savedId = saved.id || saved.event?.id || id;

      toast.success(editing ? 'Event updated.' : 'Event created.');
      navigate(savedId ? `/admin/events/${savedId}` : '/admin/events');
    } catch (err) {
      const fieldErrors = err?.response?.data?.errors;
      if (fieldErrors && typeof fieldErrors === 'object') {
        setErrors(Object.fromEntries(
          Object.entries(fieldErrors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])
        ));
      }
      toast.error(err?.response?.data?.message || 'That could not be saved.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Event">
        <div className="max-w-[820px] flex flex-col gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-[200px] bg-white rounded-xl border border-[#D7DDE4] animate-pulse" />)}
        </div>
      </AdminLayout>
    );
  }

  if (loadError) {
    return (
      <AdminLayout title="Event">
        <div className="bg-white rounded-xl border border-[#D7DDE4] p-12 text-center max-w-[820px]">
          <AlertTriangle size={22} className="text-[#A32B1C] mx-auto mb-3" />
          <p className="text-[15px] font-semibold text-[#11161C]">{loadError}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={editing ? 'Edit event' : 'Create event'}
      subtitle={editing ? form.name : 'On behalf of an organisation'}
    >
      <form onSubmit={submit} noValidate className="max-w-[820px] flex flex-col gap-4">
        <button type="button" onClick={() => navigate(editing ? `/admin/events/${id}` : '/admin/events')}
          className="flex items-center gap-2 text-[13px] font-semibold text-[#667382] hover:text-[#11161C] self-start">
          <ArrowLeft size={15} /> {editing ? 'Back to event' : 'Events'}
        </button>

        <Section title="The basics">
          <Field label="Organisation" required error={errors.organization} wide
            hint={orgsCapped ? 'Showing the first 100 organisations.' : 'The account this event belongs to.'}>
            <select id="ev-org" value={form.organization} onChange={set('organization')}
              className={`${inputCls} cursor-pointer`} disabled={editing}>
              <option value="">Choose an organisation…</option>
              {orgs.map(o => (
                <option key={o.id} value={o.id}>{o.display_name || o.email}</option>
              ))}
            </select>
          </Field>

          <Field label="Event name" required error={errors.name} wide>
            <input id="ev-name" className={inputCls} value={form.name} onChange={set('name')}
              placeholder="e.g. ClockOut Lagos — Halloween Nights" />
          </Field>

          <Field label="Category">
            <select id="ev-category" value={form.category} onChange={set('category')} className={`${inputCls} cursor-pointer`}>
              {EVENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>

          <Field label="Status" hint="Only Published is publicly buyable.">
            <select id="ev-status" value={form.status} onChange={set('status')} className={`${inputCls} cursor-pointer`}>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </Field>

          <Field label="Link" hint="Left blank, it's made from the name. Duplicates get -2, -3." error={errors.slug} wide>
            <input id="ev-slug" className={inputCls} value={form.slug} onChange={set('slug')}
              placeholder="clockout-lagos-halloween-nights" />
          </Field>

          <Field label="Description" wide>
            <textarea id="ev-description" rows={4} className={`${inputCls} resize-y`} value={form.description}
              onChange={set('description')} placeholder="What the event is." />
          </Field>

          <Field label="Poster" error={errors.image} wide
            hint="Shown whole on the public page, so a flyer's text stays readable. Under 5MB.">
            {preview ? (
              <div className="flex items-start gap-4">
                <img src={preview} alt="Poster preview"
                  className="w-[120px] h-[150px] object-contain rounded-lg border border-[#D7DDE4] bg-[#F6F8FA] shrink-0" />
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-[12.5px] text-[#667382] break-all max-w-[280px]">
                    {imageFile ? imageFile.name : 'Current poster'}
                  </p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="h-9 px-3 rounded-lg border border-[#D7DDE4] text-[12.5px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA]">
                      Replace
                    </button>
                    <button type="button" onClick={clearImage}
                      className="h-9 px-3 rounded-lg border border-[#D7DDE4] text-[12.5px] font-semibold text-[#A32B1C] hover:bg-[#FDF2F0] inline-flex items-center gap-1.5">
                      <X size={13} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : urlMode ? (
              <div className="flex gap-2">
                <input id="ev-image" className={inputCls} value={form.image} onChange={set('image')}
                  placeholder="https://res.cloudinary.com/…" />
                <button type="button" onClick={() => setUrlMode(false)}
                  className="h-[42px] px-3 rounded-lg border border-[#D7DDE4] text-[12.5px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA] shrink-0">
                  Upload instead
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]); }}
                className="border-2 border-dashed border-[#D7DDE4] rounded-xl px-5 py-7 flex flex-col items-center gap-2 cursor-pointer hover:border-[#8D5D1D] hover:bg-[#FBF8F3] transition-colors"
              >
                <ImagePlus size={22} className="text-[#98A4B2]" />
                <p className="text-[13.5px] font-semibold text-[#3D4854]">Choose a poster from your computer</p>
                <p className="text-[12px] text-[#98A4B2]">or drag one here · JPG or PNG, under 5MB</p>
                <button type="button"
                  onClick={e => { e.stopPropagation(); setUrlMode(true); }}
                  className="mt-1 text-[12.5px] font-semibold text-[#8D5D1D] hover:underline inline-flex items-center gap-1.5">
                  <Link2 size={13} /> Paste a link instead
                </button>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => pickFile(e.target.files?.[0])} />
          </Field>
        </Section>

        <Section title="When">
          <Field label="Starts" required error={errors.start_at}>
            <input id="ev-start" type="datetime-local" className={inputCls} value={form.start_at} onChange={set('start_at')} />
          </Field>
          <Field label="Ends" error={errors.end_at}>
            <input id="ev-end" type="datetime-local" className={inputCls} value={form.end_at} onChange={set('end_at')} />
          </Field>
          <div className="sm:col-span-2 flex items-start gap-2.5 rounded-lg px-3.5 py-3" style={{ background: '#F6F8FA' }}>
            <Info size={15} className="text-[#667382] shrink-0 mt-0.5" />
            <p className="text-[12.5px] text-[#3D4854]">
              Times are <strong>UTC</strong>, not your local zone, and are shown to buyers exactly as entered.
              For a 7pm Lagos event, enter 19:00.
            </p>
          </div>
        </Section>

        <Section title="Where">
          <Field label="Venue" required error={errors.venue_name}>
            <input id="ev-venue" className={inputCls} value={form.venue_name} onChange={set('venue_name')} placeholder="e.g. Lavida" />
          </Field>
          <Field label="Address">
            <input id="ev-address" className={inputCls} value={form.address} onChange={set('address')} placeholder="e.g. Ogudu" />
          </Field>
          <Field label="City" required error={errors.city}>
            <input id="ev-city" className={inputCls} value={form.city} onChange={set('city')} placeholder="Lagos" />
          </Field>
          <Field label="Country" required error={errors.country}>
            <input id="ev-country" className={inputCls} value={form.country} onChange={set('country')} placeholder="Nigeria" />
          </Field>
          <Field label="Google Maps link" wide>
            <input id="ev-maps" className={inputCls} value={form.google_maps_url} onChange={set('google_maps_url')} placeholder="https://maps.app.goo.gl/…" />
          </Field>
        </Section>

        <Section title="Extras">
          <Field label="Programme / line-up" wide>
            <textarea id="ev-programme" rows={3} className={`${inputCls} resize-y`} value={form.programme} onChange={set('programme')} />
          </Field>
          <Field label="Good to know" wide hint="Anything that doesn't fit the fields above.">
            <textarea id="ev-additional" rows={3} className={`${inputCls} resize-y`} value={form.additional_info} onChange={set('additional_info')} />
          </Field>
          <Field label="Website">
            <input id="ev-website" className={inputCls} value={form.website} onChange={set('website')} placeholder="clockout.ng" />
          </Field>
          <Field label="Instagram">
            <input id="ev-instagram" className={inputCls} value={form.instagram} onChange={set('instagram')} placeholder="@clockoutlagos" />
          </Field>
        </Section>

        <Section title="Who to contact">
          <Field label="Name"><input id="ev-cname" className={inputCls} value={form.contact_name} onChange={set('contact_name')} /></Field>
          <Field label="Email"><input id="ev-cemail" type="email" className={inputCls} value={form.contact_email} onChange={set('contact_email')} /></Field>
          <Field label="Phone"><input id="ev-cphone" type="tel" className={inputCls} value={form.contact_phone} onChange={set('contact_phone')} /></Field>
        </Section>

        <div className="flex items-center gap-3 pb-4">
          <button type="submit" disabled={saving}
            className="h-11 px-6 rounded-lg text-white text-[13.5px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{ background: '#8D5D1D' }}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create event'}
          </button>
          <button type="button" onClick={() => navigate(editing ? `/admin/events/${id}` : '/admin/events')} disabled={saving}
            className="h-11 px-5 rounded-lg border border-[#D7DDE4] bg-white text-[13.5px] font-semibold text-[#3D4854] hover:bg-[#F6F8FA] disabled:opacity-50">
            Cancel
          </button>
          {!editing && (
            <p className="text-[12.5px] text-[#667382] ml-1">
              Add ticket types next — an event can't sell without them.
            </p>
          )}
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminEventFormPage;
