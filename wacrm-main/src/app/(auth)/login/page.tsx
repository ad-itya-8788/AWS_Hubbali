'use client';

import { Suspense, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const t = useTranslations('LoginPage');
  const linkError = searchParams.get('error');
  const linkErrorMessages: Record<string, string> = {
    link_expired: t('linkExpired'),
    link_invalid: t('linkInvalid'),
    invite_required: t('inviteRequired'),
    invite_invalid: t('inviteInvalid'),
    invite_verify_failed: t('inviteVerifyFailed'),
  };
  const linkErrorMessage = linkError
    ? (linkErrorMessages[linkError] ?? null)
    : null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const submitting = useRef(false);
  const supabase = createClient();

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;

    submitting.current = true;
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      const destination = inviteToken
        ? `/join/${encodeURIComponent(inviteToken)}`
        : '/dashboard';
      window.location.href = destination;
    } catch {
      setError(t('signInFailed'));
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title={
        inviteToken ? (
          t('titleAccept')
        ) : (
          <>
            {t('titleWelcome')}{' '}
            <span role="img" aria-label="wave">
              👋
            </span>
          </>
        )
      }
      description={inviteToken ? t('descAccept') : t('descWelcome')}
    >
      <form
        onSubmit={handleLogin}
        className="mt-6 flex flex-col gap-[18px]"
        aria-busy={loading}
      >
        {linkErrorMessage && !error && (
          <div
            role="alert"
            className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-200"
          >
            {linkErrorMessage}
          </div>
        )}
        {error && (
          <div
            id="login-error"
            role="alert"
            className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="email"
            className="flex items-center gap-2 text-[13px] font-medium text-[#e1e2e4]"
          >
            <Mail aria-hidden="true" className="size-4" />
            {t('emailLabel')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={t('emailPlaceholder')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'login-error' : undefined}
            className="h-10 rounded-xl border-[#34373b] bg-[#1a1d20] px-3.5 text-sm text-white placeholder:text-[#8f9399] focus-visible:border-[#ffc400] focus-visible:ring-[#ffc400]/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="password"
              className="flex items-center gap-2 text-[13px] font-medium text-[#e1e2e4]"
            >
              <LockKeyhole aria-hidden="true" className="size-4" />
              {t('passwordLabel')}
            </Label>
            <Link
              href="/forgot-password"
              className="text-[13px] font-medium text-[#ffc400] transition-colors hover:text-[#ffda58] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffc400] motion-reduce:transition-none"
            >
              {t('forgotPassword')}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error' : undefined}
              className="h-10 rounded-xl border-[#34373b] bg-[#1a1d20] px-3.5 pr-12 text-sm text-white placeholder:text-[#8f9399] focus-visible:border-[#ffc400] focus-visible:ring-[#ffc400]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? t('hidePassword') : t('showPassword')}
              aria-pressed={showPassword}
              className="absolute top-1/2 right-3 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[#aeb1b6] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffc400] motion-reduce:transition-none"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" className="size-[17px]" />
              ) : (
                <Eye aria-hidden="true" className="size-[17px]" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="mt-1 h-12 w-full rounded-xl bg-gradient-to-r from-[#ffd33d] to-[#f5a900] text-[15px] font-semibold text-[#17130a] shadow-[0_5px_22px_rgba(245,169,0,0.18)] transition-all hover:brightness-105 focus-visible:ring-[#ffc400]/45 active:scale-[0.99] disabled:opacity-60 motion-reduce:transition-none motion-reduce:active:transform-none"
        >
          {loading ? t('signingIn') : t('signIn')}
          {loading ? (
            <span
              aria-hidden="true"
              className="ml-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
            />
          ) : (
            <ArrowRight aria-hidden="true" className="ml-2 size-[18px]" />
          )}
        </Button>
      </form>
    </AuthPageShell>
  );
}
