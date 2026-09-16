/* ─────────────────────────────────────────────────────────────────
   Remote image URLs.

   The API currently returns Cloudinary URLs over plain http://, e.g.
     http://res.cloudinary.com/…/events/covers/xxxx.jpg
   The app is served over https, so the browser blocks those as mixed
   content and drops them silently — no console error the user sees,
   no broken-image icon, just nothing.

   Cloudinary serves the identical asset over https (verified: same
   bytes, same content-type), so upgrading the scheme is lossless.

   This is a guard, not a fix. The real fix is the API returning https
   (Cloudinary `secure: true`); any URL reaching a render site that
   doesn't call this is still blocked.
   ───────────────────────────────────────────────────────────────── */

export const imageUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  /* Leave data:/blob: and relative paths alone — only absolute http
     needs upgrading, and only when we're actually on https ourselves
     (so a local http dev server keeps working). */
  if (!/^http:\/\//i.test(trimmed)) return trimmed;
  if (typeof window !== 'undefined' && window.location?.protocol !== 'https:') return trimmed;

  /* Never upgrade loopback — there's usually no certificate there. */
  if (/^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(trimmed)) return trimmed;

  return trimmed.replace(/^http:\/\//i, 'https://');
};

export default imageUrl;
