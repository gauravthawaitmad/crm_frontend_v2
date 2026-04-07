'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  user_login: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: doLogin, isPending, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (values: LoginFormValues) => {
    doLogin(values);
  };

  // Extract API error message
  const apiError = error
    ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Login failed. Please try again.')
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          {/* Logo */}
          <div className="mb-8 text-center">
            <span className="text-2xl font-bold text-primary">makeadiff</span>
            <span className="text-2xl font-bold text-foreground"> CRM</span>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="user_login" className="text-sm font-medium text-foreground">
                Username
              </Label>
              <Input
                id="user_login"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                {...register('user_login')}
                className={errors.user_login ? 'border-danger focus-visible:ring-danger/30' : ''}
              />
              {errors.user_login && (
                <p className="text-xs text-danger">{errors.user_login.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  {...register('password')}
                  className={`pr-10 ${errors.password ? 'border-danger focus-visible:ring-danger/30' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            {/* API Error */}
            {apiError && (
              <div className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2">
                <p className="text-sm text-danger">{apiError}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-primary-foreground hover:bg-primary-dark"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          makeadiff CRM v2 &mdash; Educational Partnerships
        </p>
      </div>
    </div>
  );
}
