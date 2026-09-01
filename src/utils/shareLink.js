/* ─────────────────────────────────────────────────────────────────
   Portfolio Share Link Helpers
   – toFrontendUrl: the API returns a backend-hosted share URL
     (…/artist/portfolio/public/{token}/). Viewers need the frontend
     route instead, so we pull the token out and rebuild the URL
     against the current origin.
   – copyText: clipboard write that survives the cases where the
     async Clipboard API is unavailable (insecure origin, older
     browsers, permission denied) by falling back to execCommand.
   ───────────────────────────────────────────────────────────────── */

/** Convert an API share URL into the public frontend portfolio URL. */
export const toFrontendUrl = (apiUrl) => {
  if (!apiUrl) return '';
  const token = apiUrl.match(/\/public\/([^/?#]+)\/?/)?.[1];
  return token ? `${window.location.origin}/portfolio/public/${token}/` : apiUrl;
};

/** Pull the share URL out of a getShareLink() response, whatever it's called. */
export const readShareUrl = (res) => {
  const d = res?.data?.data || res?.data || {};
  return toFrontendUrl(d.share_url || d.url || d.portfolio_url || d.link || '');
};

/**
 * Copy text to the clipboard. Returns true on success.
 *
 * IMPORTANT: call this synchronously from the click handler. Browsers only
 * allow clipboard writes while the user-gesture context is still active, so
 * awaiting a network request *before* copying causes a silent rejection.
 */
export const copyText = async (text) => {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      /* fall through to the legacy path below */
    }
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
};

export default { toFrontendUrl, readShareUrl, copyText };
