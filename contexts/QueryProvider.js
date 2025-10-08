'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export const QueryProvider = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 1 minute by default (reduced from 5 minutes)
        staleTime: 1 * 60 * 1000,
        // Keep data in cache for 5 minutes (reduced from 10 minutes)
        gcTime: 5 * 60 * 1000,
        // Retry failed requests 3 times (increased from 2)
        retry: 3,
        // Refetch on window focus for community data
        refetchOnWindowFocus: true,
        // Refetch on reconnect for community data
        refetchOnReconnect: true,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
