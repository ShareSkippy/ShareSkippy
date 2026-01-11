'use client';

import { createBrowserClient } from '@supabase/ssr';
import { getCookieOptions } from '@/libs/cookieOptions';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey, {
    cookieOptions: getCookieOptions(),
    global: {
      headers: {
        Connection: 'keep-alive',
      },
    },
  });
};
