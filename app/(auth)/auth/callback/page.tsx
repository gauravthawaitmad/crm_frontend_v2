'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Loader2 } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks';
import { setCredentials } from '@/store/slices/authSlice';
import type { AuthUser } from '@/store/slices/authSlice';

export default function AuthCallbackPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      router.replace(`/login?error=${error}`);
      return;
    }

    if (!token) {
      router.replace('/login?error=google_failed');
      return;
    }

    try {
      const decoded = jwtDecode<AuthUser>(token);

      dispatch(
        setCredentials({
          token,
          user: {
            user_id: decoded.user_id,
            user_role: decoded.user_role,
            user_display_name: decoded.user_display_name,
            email: decoded.email,
          },
        })
      );

      // Clear the token from the URL history before navigating away
      window.history.replaceState({}, '', '/auth/callback');

      router.replace('/');
    } catch {
      router.replace('/login?error=google_failed');
    }
  }, [dispatch, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}
