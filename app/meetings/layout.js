import { redirect } from 'next/navigation';
import { createClient } from '@/libs/supabase/server';
import config from '@/config';

export default async function MeetingsLayout({ children }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(config.auth.loginUrl);
  }

  return <>{children}</>;
}
