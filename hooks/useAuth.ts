'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCredentials, logout } from '@/store/slices/authSlice';
import api from '@/lib/api';

// ── useLogin ────────────────────────────────────────────────────────────────

export function useLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: { user_login: string; password: string }) => {
      const response = await api.post('/api/auth/login', credentials);
      return response.data.result as { token: string; user: { user_id: string; user_role: string; user_display_name: string; email: string } };
    },
    onSuccess: (data) => {
      dispatch(setCredentials({ token: data.token, user: data.user }));
      router.push('/');
    },
  });
}

// ── useLogout ───────────────────────────────────────────────────────────────

export function useLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return () => {
    dispatch(logout());
    router.push('/login');
  };
}

// ── useCurrentUser ──────────────────────────────────────────────────────────

export function useCurrentUser() {
  return useAppSelector((state) => state.auth.user);
}

// ── useIsAuthenticated ──────────────────────────────────────────────────────

export function useIsAuthenticated() {
  return useAppSelector((state) => state.auth.isAuthenticated);
}
