import { redirect } from 'next/navigation';
import { hashInviteToken } from '@/lib/auth/invitations';
import { createClient } from '@/lib/supabase/server';
import { SignupForm } from './signup-form';

type SignupPageProps = {
  searchParams: Promise<{ invite?: string | string[] }>;
};

function isValidInvitation(data: unknown): data is { ok: true } {
  return (
    typeof data === 'object' &&
    data !== null &&
    'ok' in data &&
    data.ok === true
  );
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { invite } = await searchParams;

  if (typeof invite !== 'string') {
    redirect('/login?error=invite_required');
  }

  if (!/^[A-Za-z0-9_-]{43}$/.test(invite)) {
    redirect('/login?error=invite_invalid');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('peek_invitation', {
    p_token_hash: hashInviteToken(invite),
  });

  if (error) {
    console.error('[signup] invitation verification failed:', error);
    redirect('/login?error=invite_verify_failed');
  }

  if (!isValidInvitation(data)) {
    redirect('/login?error=invite_invalid');
  }

  return <SignupForm inviteToken={invite} />;
}
