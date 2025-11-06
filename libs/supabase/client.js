'use client';

import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey, {
    // Add performance optimizations
    global: {
      headers: {
        Connection: 'keep-alive',
      },
    },
  });
};
