'use client';

import type { ReactNode } from 'react';
import { BarChart3, Layers, MessageCircle, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BrandLogo } from '@/components/brand-logo';

const features = [
  { icon: MessageCircle, label: 'featureWhatsApp' },
  { icon: UsersRound, label: 'featureContacts' },
  { icon: Layers, label: 'featureTemplates' },
  { icon: BarChart3, label: 'featureTeam' },
] as const;

type AuthPageShellProps = {
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthPageShell({
  title,
  description,
  children,
  footer,
}: AuthPageShellProps) {
  const t = useTranslations('LoginPage');

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#050607] text-white">
      <LoginDecoration />

      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1168px] grid-cols-1 items-center gap-12 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(420px,512px)] lg:gap-12 xl:gap-[72px] xl:px-0">
        <section
          aria-labelledby="auth-hero-title"
          className="mx-auto w-full max-w-[590px] text-center lg:mx-0 lg:text-left"
        >
          <BrandLogo className="mx-auto mb-7 max-w-[460px]" />

          <div className="max-w-[570px]">
            <h1
              id="auth-hero-title"
              className="text-[clamp(2.4rem,4.1vw,3.55rem)] leading-[1.06] font-bold tracking-[-0.045em]"
            >
              <span className="block">{t('heroLineOne')}</span>
              <span className="block">{t('heroLineTwo')}</span>
              <span className="block text-[#ffc400]">{t('heroLineThree')}</span>
            </h1>
            <p className="mx-auto mt-4 max-w-[535px] text-base leading-7 text-[#b5b8be] sm:text-[17px] lg:mx-0">
              {t('heroDescription')}
            </p>
          </div>

          <div className="mx-auto mt-7 grid max-w-[590px] grid-cols-2 gap-3 sm:grid-cols-4 lg:mx-0">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex min-h-[98px] flex-col items-center justify-center gap-2 rounded-[17px] border border-[#43391f] bg-[#111315]/90 px-2.5 py-3 text-center transition-colors duration-200 hover:border-[#c89b12]/70 motion-reduce:transition-none"
              >
                <Icon
                  aria-hidden="true"
                  className="size-7 text-[#ffc400]"
                  strokeWidth={2.2}
                />
                <span className="max-w-[112px] text-[13px] leading-[1.25] text-[#e2e3e5]">
                  {t(label)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="auth-card-title"
          className="mx-auto w-full max-w-[512px] lg:justify-self-end"
        >
          <div className="rounded-[28px] border border-[#b98d08] bg-[linear-gradient(145deg,#17191b_0%,#101214_52%,#090a0b_100%)] px-6 py-7 shadow-[0_0_42px_rgba(255,196,0,0.09),0_24px_70px_rgba(0,0,0,0.42)] sm:px-9 sm:py-8">
            <div className="flex flex-col items-center text-center">
              <BrandLogo className="mb-4 max-w-[300px]" />
              <h2
                id="auth-card-title"
                className="text-[25px] leading-tight font-semibold tracking-[-0.025em] text-white"
              >
                {title}
              </h2>
              <div className="mt-2 text-sm text-[#b5b8be]">{description}</div>
            </div>

            {children}
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </section>
      </div>
    </main>
  );
}

function LoginDecoration() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(255,196,0,0.045),transparent_58%)]" />
      <svg
        viewBox="0 0 620 230"
        className="absolute -top-5 -right-12 hidden h-[230px] w-[620px] sm:block"
        fill="none"
        focusable="false"
      >
        <path
          d="M260 -24C384 68 477 82 634 196"
          stroke="#f4a900"
          strokeOpacity=".12"
          strokeWidth="30"
        />
        <path
          d="M254 -22C377 68 478 91 625 202"
          stroke="#ffc400"
          strokeOpacity=".82"
          strokeWidth="1.5"
        />
        <path
          d="M333 -37C454 56 524 85 642 147"
          stroke="#ffc400"
          strokeOpacity=".42"
          strokeWidth="1"
        />
      </svg>
      <svg
        viewBox="0 0 650 190"
        className="absolute -bottom-8 -left-16 hidden h-[190px] w-[650px] sm:block"
        fill="none"
        focusable="false"
      >
        <path
          d="M-50 72C103 4 204 44 322 117C417 176 530 155 704 79"
          stroke="#f4a900"
          strokeOpacity=".13"
          strokeWidth="28"
        />
        <path
          d="M-42 76C107 18 204 47 324 121C420 180 535 157 699 83"
          stroke="#ffc400"
          strokeOpacity=".76"
          strokeWidth="1.5"
        />
        <path
          d="M-47 103C118 50 219 85 327 137C424 184 533 173 684 117"
          stroke="#ffc400"
          strokeOpacity=".3"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
