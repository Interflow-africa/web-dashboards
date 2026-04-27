import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthSplitLayout from '@/components/layout/AuthSplitLayout';
import FloatingInput from '@/components/common/FloatingInput';
import { callForArtistsAPI } from '@/services/index';
import useAuthStore from '@/store/authStore';
import getApiError from '@/utils/apiError';

/* ─── Brand ──────────────────────────────────────────────────────── */
const GOLD      = '#8D5D1D';
const GOLD_DARK = '#7A4E16';

/* ─── Inline page loader ─────────────────────────────────────────── */
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
    <div style={{ width: 40, height: 40, border: '3px solid rgba(139,105,20,0.2)', borderTopColor: '#8B6914', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: '#AAAAAA' }}>Verifying your link…</p>
  </div>
);

/* ─── Activate Account Page ──────────────────────────────────────── */
const ActivateAccountPage = () => {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const { setTokens, fetchMe } = useAuthStore();

  const [status, setStatus]           = useState('loading'); // 'loading' | 'valid' | 'invalid'
  const [email, setEmail]             = useState('');
  const [expiresAt, setExpiresAt]     = useState(null);
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError]         = useState('');
  const [saving, setSaving]           = useState(false);

  /* Validate token on mount */
  useEffect(() => {
    callForArtistsAPI.validateToken(token)
      .then(r => {
        const data = r.data.data || r.data;
        setEmail(data.email || '');
        setExpiresAt(data.expires_at || null);
        setStatus('valid');
      })
      .catch(() => setStatus('invalid'));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPwError('');

    if (password.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setPwError('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await callForArtistsAPI.activateAccount(token, {
        password,
        confirm_password: confirmPassword,
      });
      const data = res.data.data || res.data;

      /* Auto-login — save tokens into Zustand + localStorage */
      if (data.access && data.refresh) {
        setTokens(data.access, data.refresh);
        await fetchMe();
        toast.success('Welcome to Interflow! Your account is active.');
        navigate('/dashboard');
      } else {
        /* No tokens returned — fall through to login */
        toast.success('Account activated! Please sign in.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(getApiError(err, 'Activation failed. The link may have expired.'));
    } finally {
      setSaving(false);
    }
  };

  /* ── Loading ── */
  if (status === 'loading') return <PageLoader />;

  /* ── Invalid / expired link ── */
  if (status === 'invalid') {
    return (
      <AuthSplitLayout
        imageSrc="/assets/images/auth/login-bg.jpg"
        imageAlt="Activate account"
        leftWidth="52"
      >
        <div className="w-full max-w-[420px]">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-6">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>

          <h1 className="font-bold text-[#1A1A1A] mb-2"
            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(24px, 4vw, 30px)' }}>
            Link Expired
          </h1>
          <p className="text-[14px] text-[#888] mb-8 leading-relaxed">
            This activation link has expired or already been used. If you haven't set your password yet, please contact the organiser for a new link.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 font-semibold text-[14px] text-[#1A1A1A] hover:underline transition-opacity hover:opacity-70"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </AuthSplitLayout>
    );
  }

  /* ── Valid — set password form ── */
  return (
    <AuthSplitLayout
      imageSrc="/assets/images/auth/login-bg.jpg"
      imageAlt="Activate account"
      leftWidth="52"
    >
      <div className="w-full max-w-[420px]">
        {/* Heading */}
        <h1 className="font-bold text-[#1A1A1A] mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(24px, 4vw, 30px)' }}>
          Activate Your Account
        </h1>

        {/* Email context */}
        <p className="text-[14px] text-[#888] mb-8 leading-relaxed">
          Welcome! Set a password to activate your Interflow account for{' '}
          <span className="font-semibold text-[#1A1A1A]">{email}</span>.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-only email display */}
          <div className="bg-gray-50 border border-[#E0E0E0] rounded-lg px-4 py-3">
            <p className="text-[11px] text-[#AAAAAA] mb-0.5">Email</p>
            <p className="text-[15px] text-[#1A1A1A]">{email}</p>
          </div>

          <FloatingInput
            label="New Password"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setPwError(''); }}
            error={pwError || undefined}
          />

          <FloatingInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={e => { setConfirmPassword(e.target.value); setPwError(''); }}
          />

          {pwError && (
            <p className="text-[12px] text-red-500 -mt-2">{pwError}</p>
          )}

          {/* Expiry hint */}
          {expiresAt && (
            <p className="text-[12px] text-[#AAAAAA]">
              Link expires{' '}
              {new Date(expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-3 font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{ background: GOLD, color: '#fff', borderRadius: 9999, height: 52, paddingLeft: 28, paddingRight: 14, fontSize: 15, fontFamily: 'Montserrat, sans-serif' }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = GOLD_DARK; }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = GOLD; }}
          >
            {saving ? 'Activating…' : 'Activate Account'}
            {!saving && (
              <span className="flex items-center justify-center rounded-full shrink-0" style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.22)' }}>
                <ArrowRight size={16} color="#fff" />
              </span>
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-[13px] text-[#888] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#1A1A1A] hover:underline transition-opacity hover:opacity-70">
            Sign In
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
};

export default ActivateAccountPage;
