import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import getApiError from '@/utils/apiError';
import AuthSplitLayout from '@/components/layout/AuthSplitLayout';
import FloatingInput from '@/components/common/FloatingInput';
import { authAPI } from '@/services/index';
import './Auth.css';

/* ─── Brand ─────────────────────────────────────────────────────── */
const GOLD      = '#8D5D1D';
const GOLD_DARK = '#7A4E16';

/* ─────────────────────────────────────────────────────────────────
   Reset Password Page
   ───────────────────────────────────────────────────────────────── */
const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prefillEmail = location.state?.email || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: prefillEmail },
  });

  const newPassword     = watch('newPassword', '');
  const confirmPassword = watch('confirmPassword', '');

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await authAPI.confirmPasswordReset({
        email: location.state?.email,
        code: data.code,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(getApiError(err, 'Invalid code or code has expired.'));
    }
  };

  return (
    <AuthSplitLayout
      imageSrc="/assets/images/auth/login-bg.jpg"
      imageAlt="Reset password"
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
          Reset Password
        </h1>

        {/* Sub-line */}
        <p className="text-[14px] text-[#888] mb-8">
          Enter the 6-digit code from your email and choose a new password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Read-only email */}
          <div style={{ position: 'relative' }}>
            <FloatingInput
              label="Email"
              type="email"
              value={prefillEmail}
              readOnly
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
              {...register('email')}
            />
          </div>

          {/* 6-digit code */}
          <FloatingInput
            label="6-Digit Code"
            type="text"
            maxLength={6}
            error={errors.code?.message}
            {...register('code', {
              required: 'Code is required',
              minLength: { value: 6, message: 'Code must be 6 digits' },
              maxLength: { value: 6, message: 'Code must be 6 digits' },
            })}
          />

          {/* New password */}
          <FloatingInput
            label="New Password"
            type="password"
            value={newPassword}
            error={errors.newPassword?.message}
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
            })}
          />

          {/* Confirm password */}
          <FloatingInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
            })}
          />

          {/* Submit button */}
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
            {isSubmitting ? 'Resetting…' : 'Reset Password'}
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

export default ResetPasswordPage;
