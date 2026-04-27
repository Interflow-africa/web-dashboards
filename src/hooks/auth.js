/* ─────────────────────────────────────────────────────────────────
   Auth Hooks  (React Query mutations & queries for authentication)
   ───────────────────────────────────────────────────────────────── */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '@/services/index';
import useAuthStore from '@/store/authStore';
import tokens from '@/utils/tokens';
import getApiError from '@/utils/apiError';

/* ─── Query Keys ────────────────────────────────────────────────── */
export const AUTH_KEYS = {
  me: ['auth', 'me'],
};

/* ─── useMe ─────────────────────────────────────────────────────── */
/** Fetch the currently authenticated user. Only runs when authenticated. */
export const useMe = (options = {}) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  return useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      const res = await authAPI.getMe();
      return res.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/* ─── useLogin ──────────────────────────────────────────────────── */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const setUser     = useAuthStore(s => s.setUser);
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: (credentials) => authAPI.login(credentials),
    onSuccess: (res) => {
      const { access, refresh, role, is_onboarded } = res.data.data;
      tokens.set(access, refresh);
      setUser({ role, is_onboarded });
      useAuthStore.setState({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.me });

      if (!is_onboarded) {
        navigate(role === 'artist' ? '/onboarding/artist' : '/onboarding/organization');
      } else {
        navigate(role === 'artist' ? '/dashboard' : '/org/dashboard');
      }
    },
    onError: (err) => {
      toast.error(getApiError(err, 'Invalid credentials. Please try again.'));
    },
  });
};

/* ─── useRegister ───────────────────────────────────────────────── */
export const useRegister = () => {
  return useMutation({
    mutationFn: (data) => authAPI.register(data),
  });
};

/* ─── useVerifyOTP ──────────────────────────────────────────────── */
export const useVerifyOTP = () => {
  const queryClient = useQueryClient();
  const setUser     = useAuthStore(s => s.setUser);
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: (data) => authAPI.verifyOTP(data),
    onSuccess: (res) => {
      const { access, refresh, role, is_onboarded } = res.data.data;
      tokens.set(access, refresh);
      setUser({ role, is_onboarded });
      useAuthStore.setState({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.me });
      navigate('/register/success');
    },
  });
};

/* ─── useResendOTP ──────────────────────────────────────────────── */
export const useResendOTP = () => {
  return useMutation({
    mutationFn: (data) => authAPI.resendOTP(data),
    onSuccess: () => toast.success('Verification code resent!'),
    onError: (err) => toast.error(getApiError(err, 'Could not resend code.')),
  });
};

/* ─── useForgotPassword ─────────────────────────────────────────── */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data) => authAPI.requestPasswordReset(data),
  });
};

/* ─── useResetPassword ──────────────────────────────────────────── */
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data) => authAPI.confirmPasswordReset(data),
    onSuccess: () => {
      toast.success('Password reset successfully!');
      navigate('/login');
    },
    onError: (err) => {
      toast.error(getApiError(err, 'Reset failed. The link may have expired.'));
    },
  });
};

/* ─── useChangePassword ─────────────────────────────────────────── */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data) => authAPI.changePassword(data),
    onSuccess: () => toast.success('Password updated!'),
    onError: (err) => toast.error(getApiError(err, 'Could not update password.')),
  });
};

/* ─── useLogout ─────────────────────────────────────────────────── */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate    = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const refresh = tokens.getRefresh();
      if (refresh) await authAPI.logout({ refresh });
    },
    onSettled: () => {
      tokens.clear();
      useAuthStore.setState({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      queryClient.clear();
      navigate('/login');
    },
  });
};
