import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import getApiError from '@/utils/apiError';
import AuthSplitLayout from '@/components/layout/AuthSplitLayout';
import FloatingInput from '@/components/common/FloatingInput';
import { useForgotPassword } from '@/hooks/auth';
import './Auth.css';

/* ─── Brand ─────────────────────────────────────────────────────── */
const GOLD      = '#8D5D1D';
const GOLD_DARK = '#7A4E16';

/* ─────────────────────────────────────────────────────────────────
   Forgot Password Page
   ───────────────────────────────────────────────────────────────── */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { mutateAsync: forgotPassword } = useForgotPassword();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const email = watch('email', '');

  const onSubmit = async (data) => {
    try {
      await forgotPassword({ email: data.email });
      navigate('/forgot-password/sent', { state: { email: data.email } });
    } catch (err) {
      toast.error(getApiError(err, 'Something went wrong. Please try again.'));
    }
  };

  return (
    <AuthSplitLayout
      imageSrc="/assets/images/auth/login-bg.jpg"
      imageAlt="Artist"
      leftWidth="52"
    >
      <div className="w-full max-w-[420px]">

        {/* Back link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#999] hover:text-[#555] mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>

        {/* Heading */}
        <h1
          className="font-bold text-[#1A1A1A] mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(26px, 5vw, 34px)' }}
        >
          Forgot Password
        </h1>

        {/* Sub-line */}
        <p className="text-[14px] text-[#888] mb-8">
          Enter your email and we'll send you a reset link.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FloatingInput
            label="Email"
            type="email"
            value={email}
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 font-semibold transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{
              background: GOLD,
              color: '#fff',
              borderRadius: 9999,
              height: 52,
              paddingLeft: 28,
              paddingRight: 14,
              fontSize: 15,
              fontFamily: 'Montserrat, sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.background = GOLD_DARK}
            onMouseLeave={e => e.currentTarget.style.background = GOLD}
          >
            {isSubmitting ? 'Sending…' : 'Send Reset Link'}
            {!isSubmitting && (
              <span
                className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.22)' }}
              >
                <ArrowRight size={16} color="#fff" />
              </span>
            )}
          </button>
        </form>

      </div>
    </AuthSplitLayout>
  );
};

export default ForgotPasswordPage;
