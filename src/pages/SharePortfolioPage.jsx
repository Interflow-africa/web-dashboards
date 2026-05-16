import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import { artistAPI } from '../services/api';
import toast from 'react-hot-toast';

// Extract the token from the API URL and return a frontend-hosted portfolio URL.
// e.g. https://api.../artist/portfolio/public/{token}/ → http://localhost:5173/portfolio/public/{token}/
const toFrontendUrl = (apiUrl) => {
  if (!apiUrl) return '';
  const match = apiUrl.match(/\/public\/([^/?#]+)\/?/);
  const token = match?.[1];
  return token ? `${window.location.origin}/portfolio/public/${token}/` : apiUrl;
};

const SharePortfolioPage = () => {
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    artistAPI.getShareLink()
      .then(r => setShareData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const shareUrl = toFrontendUrl(shareData?.share_url);

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      toast.success('Portfolio link copied!');
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const shareOptions = [
    { label: 'Share on WhatsApp',    icon: '💬', color: '#25D366', href: shareUrl ? `https://wa.me/?text=Check out my portfolio on Interflow: ${shareUrl}` : '#' },
    { label: 'Share on Twitter / X', icon: '𝕏',  color: '#000',    href: shareUrl ? `https://twitter.com/intent/tweet?text=Check out my portfolio on Interflow!&url=${shareUrl}` : '#' },
    { label: 'Share on LinkedIn',    icon: 'in', color: '#0A66C2', href: shareUrl ? `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}` : '#' },
  ];

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '640px', width: '100%', overflow: 'hidden' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 6vw, 28px)', fontWeight: '700', color: 'var(--dark)', marginBottom: '4px', lineHeight: 1.2 }}>Share Portfolio</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Share your Interflow portfolio with the world</p>
        </div>

        {/* Main share card */}
        <div className="section-card" style={{ padding: 'clamp(20px, 5vw, 36px)', marginBottom: '20px', textAlign: 'center', overflow: 'visible' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--gold-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto 20px' }}>🔗</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: '700', color: 'var(--dark)', marginBottom: '12px', wordBreak: 'break-word' }}>Your Portfolio is Ready to Share</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.7', maxWidth: '420px', margin: '0 auto 28px' }}>
            Anyone with this link can view your public portfolio — no Interflow account needed. Perfect for auditions, job applications, and networking.
          </p>

          {loading ? (
            <div className="skeleton" style={{ height: '52px', borderRadius: 'var(--radius-full)', maxWidth: '400px', margin: '0 auto' }} />
          ) : shareUrl ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', width: '100%', marginBottom: '24px', border: '2px solid var(--gold)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
              <div style={{ padding: '13px 16px', fontSize: '13px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', background: 'var(--gold-pale)' }}>
                {shareUrl}
              </div>
              <button
                onClick={handleCopy}
                style={{ padding: '13px 20px', background: 'var(--gold)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', transition: 'background var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-light)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gold)'}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          ) : (
            <p style={{ color: 'var(--error)', fontSize: '14px' }}>Could not load share link. Please try again.</p>
          )}

          {/* Preview link */}
          {shareUrl && (
            <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              👁 Preview My Portfolio
            </a>
          )}
        </div>

        {/* Social share */}
        <div className="section-card" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--dark)', marginBottom: '16px' }}>Share on Social Media</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {shareOptions.map((opt, i) => (
              <a
                key={i}
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'all var(--transition)', color: 'var(--text-primary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = opt.color; e.currentTarget.style.background = 'var(--grey-1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = ''; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: opt.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', flexShrink: 0 }}>
                  {opt.icon}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{opt.label}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '16px' }}>→</span>
              </a>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="section-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--dark)', marginBottom: '16px' }}>📌 Tips for Sharing</h3>
          {[
            { tip: 'Add it to your Instagram bio', desc: 'Drive traffic from your social media to your full portfolio' },
            { tip: 'Include it in your CV', desc: 'Give casting directors and employers instant access to your work' },
            { tip: 'Use it in audition emails', desc: 'Send a direct link instead of attaching large files' },
            { tip: 'Share in WhatsApp groups', desc: 'Let your creative community see what you\'ve been up to' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: '8px' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--dark)' }}>{item.tip}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SharePortfolioPage;
