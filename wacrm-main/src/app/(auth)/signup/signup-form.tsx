'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SignupForm({ inviteToken }: { inviteToken: string }) {
  const t = useTranslations('SignupPage');
  const authT = useTranslations('LoginPage');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const submitting = useRef(false);
  const supabase = createClient();

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    setError(null);

    if (password !== confirmPassword) {
      setError(t('passwordsMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }

    submitting.current = true;
    setLoading(true);

    // Keep the existing confirmation callback and invitation destination.
    const next = inviteToken
      ? `/join/${encodeURIComponent(inviteToken)}`
      : '/dashboard';
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

    try {
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo,
        },
      });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      setSuccess(true);
    } catch {
      setError(t('signupFailed'));
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  };

  const loginHref = inviteToken
    ? `/login?invite=${encodeURIComponent(inviteToken)}`
    : '/login';

  if (success) {
    return (
      <AuthPageShell
        title={
          <span className="inline-flex items-center gap-2">
            <CheckCircle aria-hidden="true" className="size-6 text-[#ffc400]" />
            {t('checkEmailTitle')}
          </span>
        }
        description={t.rich('checkEmailDesc', {
          email,
          strong: (chunks) => (
            <span className="font-medium text-white">{chunks}</span>
          ),
        })}
      >
        <Link href={loginHref} className="mt-6 block">
          <Button className="h-12 w-full rounded-xl bg-gradient-to-r from-[#ffd33d] to-[#f5a900] text-[15px] font-semibold text-[#17130a] hover:brightness-105">
            {t('backToSignIn')}
            <ArrowRight aria-hidden="true" className="ml-2 size-[18px]" />
          </Button>
        </Link>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      title={inviteToken ? t('titleJoin') : t('title')}
      description={inviteToken ? t('descJoin') : t('desc')}
      footer={
        <p className="text-center text-sm text-[#b5b8be]">
          {t('haveAccount')}{' '}
          <Link
            href={loginHref}
            className="font-semibold text-[#ffc400] transition-colors hover:text-[#ffda58] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffc400] motion-reduce:transition-none"
          >
            {t('signIn')}
          </Link>
        </p>
      }
    >
      <form
        onSubmit={handleSignup}
        className="mt-6 flex flex-col gap-4"
        aria-busy={loading}
      >
        {error && (
          <div
            id="signup-error"
            role="alert"
            className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="fullName"
            className="flex items-center gap-2 text-[13px] font-medium text-[#e1e2e4]"
          >
            <UserRound aria-hidden="true" className="size-4" />
            {t('fullNameLabel')}
          </Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder={t('fullNamePlaceholder')}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'signup-error' : undefined}
            className="h-10 rounded-xl border-[#34373b] bg-[#1a1d20] px-3.5 text-sm text-white placeholder:text-[#8f9399] focus-visible:border-[#ffc400] focus-visible:ring-[#ffc400]/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="signupEmail"
            className="flex items-center gap-2 text-[13px] font-medium text-[#e1e2e4]"
          >
            <Mail aria-hidden="true" className="size-4" />
            {t('emailLabel')}
          </Label>
          <Input
            id="signupEmail"
            name="email"
            type="email"
            autoComplete="email"
            placeholder={authT('emailPlaceholder')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'signup-error' : undefined}
            className="h-10 rounded-xl border-[#34373b] bg-[#1a1d20] px-3.5 text-sm text-white placeholder:text-[#8f9399] focus-visible:border-[#ffc400] focus-visible:ring-[#ffc400]/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="password"
            className="flex items-center gap-2 text-[13px] font-medium text-[#e1e2e4]"
          >
            <LockKeyhole aria-hidden="true" className="size-4" />
            {t('passwordLabel')}
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'signup-error' : undefined}
              className="h-10 rounded-xl border-[#34373b] bg-[#1a1d20] px-3.5 pr-12 text-sm text-white placeholder:text-[#8f9399] focus-visible:border-[#ffc400] focus-visible:ring-[#ffc400]/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={
                showPassword ? authT('hidePassword') : authT('showPassword')
              }
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

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="confirmPassword"
            className="flex items-center gap-2 text-[13px] font-medium text-[#e1e2e4]"
          >
            <LockKeyhole aria-hidden="true" className="size-4" />
            {t('confirmPasswordLabel')}
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder={t('confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'signup-error' : undefined}
              className="h-10 rounded-xl border-[#34373b] bg-[#1a1d20] px-3.5 pr-12 text-sm text-white placeholder:text-[#8f9399] focus-visible:border-[#ffc400] focus-visible:ring-[#ffc400]/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={
                showConfirmPassword
                  ? authT('hidePassword')
                  : authT('showPassword')
              }
              aria-pressed={showConfirmPassword}
              className="absolute top-1/2 right-3 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[#aeb1b6] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffc400] motion-reduce:transition-none"
            >
              {showConfirmPassword ? (
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
          {loading ? t('creating') : t('submit')}
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
