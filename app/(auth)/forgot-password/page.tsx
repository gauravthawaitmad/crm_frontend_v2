'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await api.post('/api/auth/forgot-password', data);
      return res.data;
    },
    onSuccess: (_data, variables) => {
      setSubmittedEmail(variables.email);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const apiError = error
    ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Something went wrong. Please try again.')
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Logo */}
          <div className="mb-8 text-center">
            <span className="text-2xl font-bold text-primary">makeadiff</span>
            <span className="text-2xl font-bold text-foreground"> CRM</span>
          </div>

          {submittedEmail ? (
            /* Success state */
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <CheckCircle className="size-12 text-success" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">Check your inbox</h1>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We've sent a reset link to{' '}
                <span className="font-medium text-foreground">{submittedEmail}</span>.
                The link expires in 1 hour.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-6">
                <h1 className="text-xl font-semibold text-foreground">Forgot your password?</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit((v) => mutate(v))} noValidate className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className={errors.email ? 'border-danger focus-visible:ring-danger/30' : ''}
                  />
                  {errors.email && (
                    <p className="text-xs text-danger">{errors.email.message}</p>
                  )}
                </div>

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
                      Sending…
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to login
                </Link>
              </div>
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
