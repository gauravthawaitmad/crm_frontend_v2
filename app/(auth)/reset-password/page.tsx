'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ── Schemas ──────────────────────────────────────────────────────────────────

const resetSchema = z
  .object({
    new_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

// ── Password strength helper ──────────────────────────────────────────────────

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
  if (!password) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[a-zA-Z]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-danger', width: '33%' };
  if (score <= 3) return { label: 'Fair', color: 'bg-warning', width: '66%' };
  return { label: 'Strong', color: 'bg-success', width: '100%' };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [tokenState, setTokenState] = useState<'loading' | 'invalid' | 'valid'>('loading');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setTokenState('invalid');
      return;
    }
    api
      .post('/api/auth/verify-reset-token', { token })
      .then((res) => {
        setMaskedEmail(res.data.result?.email ?? '');
        setTokenState('valid');
      })
      .catch(() => setTokenState('invalid'));
  }, [token]);

  // Auto-redirect to /login after success
  useEffect(() => {
    if (!succeeded) return;
    const timer = setTimeout(() => router.push('/login'), 3000);
    return () => clearTimeout(timer);
  }, [succeeded, router]);

  const { mutate: doReset, isPending, error } = useMutation({
    mutationFn: async (data: ResetFormValues) => {
      const res = await api.post('/api/auth/reset-password', { token, ...data });
      return res.data;
    },
    onSuccess: () => setSucceeded(true),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormValues>({ resolver: zodResolver(resetSchema) });

  const apiError = error
    ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Something went wrong. Please try again.')
    : null;

  const strength = getPasswordStrength(passwordValue);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (tokenState === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Logo */}
          <div className="mb-8 text-center">
            <span className="text-2xl font-bold text-primary">makeadiff</span>
            <span className="text-2xl font-bold text-foreground"> CRM</span>
          </div>

          {/* ── Invalid / expired token ── */}
          {tokenState === 'invalid' && (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="size-12 rounded-full bg-danger/10 flex items-center justify-center">
                  <span className="text-2xl text-danger">✕</span>
                </div>
              </div>
              <h1 className="text-xl font-semibold text-foreground">Link expired</h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                This link has expired or has already been used.
              </p>
              <Button
                className="mt-6 w-full bg-primary text-primary-foreground hover:bg-primary-dark"
                onClick={() => router.push('/forgot-password')}
              >
                Request a new reset link
              </Button>
            </div>
          )}

          {/* ── Success state ── */}
          {tokenState === 'valid' && succeeded && (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="size-12 text-success" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Password updated!</h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                You can now log in with your new password.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Redirecting to login in 3 seconds…
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm text-primary hover:underline"
              >
                Go to login now
              </Link>
            </div>
          )}

          {/* ── Password form ── */}
          {tokenState === 'valid' && !succeeded && (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-foreground">Reset your password</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {maskedEmail
                    ? `Create a new password for ${maskedEmail}.`
                    : 'Create a new password for your account.'}
                </p>
              </div>

              <form onSubmit={handleSubmit((v) => doReset(v))} noValidate className="space-y-4">
                {/* New password */}
                <div className="space-y-1.5">
                  <Label htmlFor="new_password" className="text-sm font-medium text-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNew ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      {...register('new_password', {
                        onChange: (e) => setPasswordValue(e.target.value),
                      })}
                      className={`pr-10 ${errors.new_password ? 'border-danger focus-visible:ring-danger/30' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                      aria-label={showNew ? 'Hide password' : 'Show password'}
                    >
                      {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.new_password && (
                    <p className="text-xs text-danger">{errors.new_password.message}</p>
                  )}

                  {/* Strength indicator */}
                  {passwordValue && (
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-stone-200">
                        <div
                          className={`h-1.5 rounded-full transition-all ${strength.color}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                      <p className={`text-xs font-medium ${
                        strength.label === 'Weak' ? 'text-danger' :
                        strength.label === 'Fair' ? 'text-warning' : 'text-success'
                      }`}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirm_password" className="text-sm font-medium text-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      {...register('confirm_password')}
                      className={`pr-10 ${errors.confirm_password ? 'border-danger focus-visible:ring-danger/30' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                      tabIndex={-1}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-xs text-danger">{errors.confirm_password.message}</p>
                  )}
                </div>

                {/* API error */}
                {apiError && (
                  <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2">
                    <p className="text-sm text-danger">{apiError}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary-dark"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Updating…
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          makeadiff CRM v2 &mdash; Educational Partnerships
        </p>
      </div>
    </div>
  );
}
