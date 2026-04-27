import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import getApiError from '@/utils/apiError';
import AuthSplitLayout from '@/components/layout/AuthSplitLayout';
import FloatingInput from '@/components/common/FloatingInput';
import useAuthStore from '@/store/authStore';
import './Auth.css';

/* ─── Brand ─────────────────────────────────────────────────────── */
const GOLD      = '#8D5D1D';
const GOLD_DARK = '#7A4E16';

/* ─── SVG icons ─────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.56 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 814 1000" fill="#1A1A1A">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 436.7 1 279.2 1 116.5c0-95.3 33.7-184.4 94.4-251.2C143.7-192.7 215.8-226 289.7-226c105 0 168.4 70.9 225.7 70.9 55 0 127.1-74.4 240.5-74.4z"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────
   Login Page
   ───────────────────────────────────────────────────────────────── */
const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const email    = watch('email',    '');
  const password = watch('password', '');

  const onSubmit = async (data) => {
    try {
      const res = await login(data);
      if (!res.is_onboarded) {
        navigate(res.role === 'artist' ? '/onboarding/artist' : '/onboarding/organization');
      } else {
        navigate(res.role === 'artist' ? '/dashboard' : '/org/dashboard');
      }
    } catch (err) {
      toast.error(getApiError(err, 'Invalid credentials. Please try again.'));
    }
  };

  return (
    <AuthSplitLayout
      imageSrc="/assets/images/auth/login-bg.jpg"
      imageAlt="Dancer"
      leftWidth="52"
    >
      <div className="w-full max-w-[420px]">

        {/* Heading */}
        <h1
          className="font-bold text-[#1A1A1A] mb-2"
          style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 'clamp(26px, 5vw, 34px)' }}
        >
          Sign In
        </h1>

        {/* Sub-line */}
        <p className="text-[14px] text-[#888] mb-8">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#1A1A1A] hover:underline transition-opacity hover:opacity-70"
          >
            Sign Up
          </Link>
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
          <FloatingInput
            label="Password"
            type="password"
            value={password}
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />

          {/* Continue button */}
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
            {isSubmitting ? 'Signing in…' : 'Continue'}
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

        {/* Forgot password */}
        <Link
          to="/forgot-password"
          className="block text-[13.5px] font-semibold text-[#1A1A1A] mt-5 hover:underline transition-opacity hover:opacity-70"
        >
          Forgot your Password?
        </Link>

        {/* OR divider */}
        <div className="or-divider my-6">OR</div>

        {/* Social buttons */}
        <div className="space-y-3">
          <button className="social-btn">
            <GoogleIcon /> Continue with Google
          </button>
          <button className="social-btn">
            <AppleIcon /> Continue with Apple
          </button>
        </div>

      </div>
    </AuthSplitLayout>
  );
};

export default LoginPage;
