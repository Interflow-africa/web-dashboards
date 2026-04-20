import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForgotPassword } from '@/hooks/auth';
import './Auth.css';

/* ─── Brand ─────────────────────────────────────────────────────── */
const GOLD      = '#8D5D1D';
const GOLD_DARK = '#7A4E16';

/* ─── Mail envelope icon ─────────────────────────────────────────── */
const MailIcon = () => (
  <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
    <rect width="54" height="54" rx="27" fill="#FDF3E3" />
    <path
      d="M14 19C14 17.895 14.895 17 16 17H38C39.105 17 40 17.895 40 19V35C40 36.105 39.105 37 38 37H16C14.895 37 14 36.105 14 35V19Z"
      stroke={GOLD}
      strokeWidth="1.8"
      fill="none"
    />
    <path
      d="M14 20L27 29L40 20"
      stroke={GOLD}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─────────────────────────────────────────────────────────────────
   Mail Sent Page  ("You've Got a Mail!")
   ───────────────────────────────────────────────────────────────── */
const MailSentPage = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const email     = location.state?.email || 'your email';
  const [resending, setResending] = useState(false);
  const { mutateAsync: forgotPassword } = useForgotPassword();

  const handleResend = async () => {
    if (resending) return;
    setResending(true);
    try {
      await forgotPassword({ email });
      toast.success('Reset link resent!');
    } catch {
      toast.error('Could not resend. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="confirm-wrap">
      {/* Background image */}
      <img
        src="/assets/images/auth/login-bg.jpg"
        alt=""
        className="confirm-bg-img"
      />
      {/* Dark overlay */}
      <div className="confirm-overlay" />

      {/* White card */}
      <div className="confirm-card">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/assets/icons/interflow-logo.svg"
            alt="Interflow"
            style={{ height: 40, width: 'auto' }}
          />
        </div>

        {/* Mail icon */}
        <div className="flex justify-center mb-5">
          <MailIcon />
        </div>

        {/* Heading */}
        <h1
          className="font-bold text-[#1A1A1A] mb-3"
          style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(22px, 5vw, 28px)' }}
        >
          You've Got a Mail!
        </h1>

        {/* Body text */}
        <p className="text-[14px] text-[#777] leading-relaxed mb-2">
          We've sent a 6-digit reset code to your email:
        </p>
        <p
          className="text-[14.5px] font-semibold text-[#1A1A1A] mb-7 break-all"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          {email}
        </p>

        {/* Enter Reset Code button */}
        <button
          onClick={() => navigate('/reset-password', { state: { email } })}
          className="w-full flex items-center justify-center font-semibold transition-all hover:opacity-90 active:scale-95 mb-3"
          style={{
            background: GOLD,
            color: '#fff',
            borderRadius: 9999,
            height: 50,
            fontSize: 15,
            fontFamily: 'Montserrat, sans-serif',
          }}
          onMouseEnter={e => e.currentTarget.style.background = GOLD_DARK}
          onMouseLeave={e => e.currentTarget.style.background = GOLD}
        >
          Enter Reset Code
        </button>

        {/* Back to Sign In link */}
        <button
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center font-semibold transition-all hover:opacity-70 mb-5"
          style={{
            background: 'transparent',
            color: '#888',
            fontSize: 14,
            fontFamily: 'Montserrat, sans-serif',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Back to Sign In
        </button>

        {/* Resend */}
        <p className="text-[13px] text-[#999]">
          Didn't receive the email?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-[#1A1A1A] hover:underline transition-opacity hover:opacity-70 disabled:opacity-50"
          >
            {resending ? 'Resending…' : 'Resend'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default MailSentPage;
