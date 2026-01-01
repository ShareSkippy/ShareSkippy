/**
 * @fileoverview FINAL FIX - useUnreadMessages hook with proper read marking
 * @path /hooks/useUnreadMessages.ts
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/libs/supabase/client';
import type { User } from '@supabase/supabase-js';

interface NotificationState {
  totalUnread: number;
  unreadByConversation: Map<string, number>;
  hasNewMessages: boolean;
  lastChecked: Date | null;
}

interface RealtimePayload {
  new: {
    id: string;
    is_read: boolean;
    conversation_id: string;
    recipient_id: string;
  };
  old: {
    is_read: boolean;
  };
}

/** Minimal shape for message rows used in this hook */
interface MessageRow {
  conversation_id?: string | null;
}

export function useUnreadMessages(user: User | null) {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    totalUnread: 0,
    unreadByConversation: new Map(),
    hasNewMessages: false,
    lastChecked: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Use ReturnType<typeof createClient> so we don't explicitly annotate `any`
  const clientRef = useRef<ReturnType<typeof createClient> | null>(null);

  useEffect(() => {
    // create client only at runtime (so importing this hook doesn't cause module-side effects)
    try {
      clientRef.current = createClient();
    } catch (err) {
      // createClient may throw in non-browser/test env; swallow and leave clientRef.current null
      // tests can mock createClient or rely on the hook guard below

      console.warn(
        '[useUnreadMessages] createClient failed or unavailable in this environment',
        err
      );
      clientRef.current = null;
    }

    return () => {
      clientRef.current = null;
    };
  }, []);

  /**
   * Fetch unread message counts
   */
  const fetchUnreadCounts = useCallback(async () => {
    if (!user) {
      setNotificationState({
        totalUnread: 0,
        unreadByConversation: new Map(),
        hasNewMessages: false,
        lastChecked: null,
      });
      setIsLoading(false);
      return;
    }

    const supabase = clientRef.current;
    if (!supabase) {
      // If client not initialized (e.g. during tests), return safe defaults

      console.warn('[fetchUnreadCounts] supabase client not initialized');
      setNotificationState((prev) => ({
        ...prev,
        lastChecked: new Date(),
      }));
      setIsLoading(false);
      return;
    }

    try {
      console.log('[fetchUnreadCounts] 🔍 Fetching unread messages for user:', user.id);

      // Fetch ALL unread messages where YOU are the recipient
      const { data, error } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, created_at')
        .eq('recipient_id', user.id) // YOU are receiving
        .eq('is_read', false) // Message is unread
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[fetchUnreadCounts] ❌ Error:', error);
        throw error;
      }

      if (!isMountedRef.current) return;

      const unreadCount = data?.length || 0;
      console.log('[fetchUnreadCounts] 📊 Total unread messages:', unreadCount);

      // Group by conversation_id
      const conversationMap = new Map<string, number>();

      (data as MessageRow[] | undefined)?.forEach((msg) => {
        if (msg?.conversation_id) {
          const current = conversationMap.get(msg.conversation_id) || 0;
          conversationMap.set(msg.conversation_id, current + 1);
        }
      });

      console.log(
        '[fetchUnreadCounts] 📊 Unread by conversation:',
        Object.fromEntries(conversationMap)
      );

      setNotificationState({
        totalUnread: unreadCount,
        unreadByConversation: conversationMap,
        hasNewMessages: unreadCount > 0,
        lastChecked: new Date(),
      });
    } catch (error) {
      console.error('[fetchUnreadCounts] ❌ Error:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user]);

  /**
   * Mark messages as read for a specific conversation
   */
  const markConversationAsRead = useCallback(
    async (
      conversationId: string,
      participant1Id: string,
      participant2Id: string
    ): Promise<void> => {
      if (!user) {
        console.log('[markConversationAsRead] ❌ No user found');
        return;
      }

      const supabase = clientRef.current;
      if (!supabase) {
        console.warn('[markConversationAsRead] supabase client not initialized');
        await fetchUnreadCounts();
        return;
      }

      console.log('[markConversationAsRead] 🔄 Starting for conversation:', conversationId);
      console.log('[markConversationAsRead] 📋 Params:', {
        conversationId,
        participant1Id,
        participant2Id,
        currentUserId: user.id,
      });

      try {
        // METHOD 1: Mark by conversation_id (most reliable)
        console.log('[markConversationAsRead] 🔄 Method 1: Marking by conversation_id...');

        const { data: method1Data, error: method1Error } = await supabase
          .from('messages')
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
          })
          .eq('conversation_id', conversationId)
          .eq('recipient_id', user.id)
          .eq('is_read', false)
          .select('id, sender_id, recipient_id');

        if (method1Error) {
          console.error('[markConversationAsRead] ❌ Method 1 error:', method1Error);
        } else {
          console.log(
            '[markConversationAsRead] ✅ Method 1 marked:',
            method1Data?.length || 0,
            'messages'
          );
        }

        // METHOD 2: Mark by participants (backup method)
        console.log('[markConversationAsRead] 🔄 Method 2: Marking by participants...');

        const otherParticipantId = participant1Id === user.id ? participant2Id : participant1Id;

        const { data: method2Data, error: method2Error } = await supabase
          .from('messages')
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
          })
          .eq('recipient_id', user.id)
          .eq('sender_id', otherParticipantId)
          .eq('is_read', false)
          .select('id, sender_id, recipient_id');

        if (method2Error) {
          console.error('[markConversationAsRead] ❌ Method 2 error:', method2Error);
        } else {
          console.log(
            '[markConversationAsRead] ✅ Method 2 marked:',
            method2Data?.length || 0,
            'messages'
          );
        }

        const totalMarked = (method1Data?.length || 0) + (method2Data?.length || 0);
        console.log('[markConversationAsRead] 📊 Total messages marked:', totalMarked);

        // Wait for database to propagate
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Fetch fresh counts
        console.log('[markConversationAsRead] 🔄 Fetching fresh counts...');
        await fetchUnreadCounts();

        console.log('[markConversationAsRead] ✅ Complete');
      } catch (error) {
        console.error('[markConversationAsRead] ❌ Unexpected error:', error);
        console.error('[markConversationAsRead] 📋 Error details:', JSON.stringify(error, null, 2));

        // Still try to refresh counts
        await fetchUnreadCounts();
      }
    },
    [user, fetchUnreadCounts]
  );

  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (!user) return;

    const supabase = clientRef.current;
    if (!supabase) {
      console.warn('[markAllAsRead] supabase client not initialized');
      return;
    }

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotificationState({
        totalUnread: 0,
        unreadByConversation: new Map(),
        hasNewMessages: false,
        lastChecked: new Date(),
      });
    } catch (error) {
      console.error('[markAllAsRead] Error:', error);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;

    if (user) {
      console.log('[useUnreadMessages] Initial fetch for user:', user.id);
      fetchUnreadCounts();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [user, fetchUnreadCounts]);

  // Real-time subscription for message changes - FIXED: Removed fetchUnreadCounts from dependencies
  useEffect(() => {
    if (!user) return;

    const supabase = clientRef.current;
    if (!supabase) {
      console.warn('[useUnreadMessages] realtime supabase client not initialized');
      return;
    }

    console.log('[useUnreadMessages] Setting up real-time subscription');

    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

    const channel = supabase
      .channel('unread-messages-global')
      .on(
        'postgres_changes' as never,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload: RealtimePayload) => {
          console.log(
            '[Real-time HOOK] New message inserted:',
            payload.new.id,
            'is_read:',
            payload.new.is_read
          );
          // Only refresh if the message is unread
          if (payload.new.is_read === false) {
            // Debounce to prevent rapid calls
            if (refreshTimeout) clearTimeout(refreshTimeout);
            refreshTimeout = setTimeout(() => {
              fetchUnreadCounts();
            }, 300);
          }
        }
      )
      .on(
        'postgres_changes' as never,
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload: RealtimePayload) => {
          console.log('[Real-time HOOK] Message updated:', payload.new.id);

          // Only process if this update affects the current user
          if (payload.new.recipient_id === user.id) {
            console.log('[Real-time HOOK] Update is for current user');

            // If message was marked as read, immediately update local state
            if (payload.new.is_read === true && payload.old.is_read === false) {
              const convId = payload.new.conversation_id;
              console.log('[Real-time HOOK] Message marked as read, updating state optimistically');

              setNotificationState((prev) => {
                const newMap = new Map(prev.unreadByConversation);
                const currentCount = newMap.get(convId) || 0;

                if (currentCount > 0) {
                  newMap.set(convId, currentCount - 1);
                  if (currentCount - 1 === 0) {
                    newMap.delete(convId);
                  }
                }

                return {
                  totalUnread: Math.max(0, prev.totalUnread - 1),
                  unreadByConversation: newMap,
                  hasNewMessages: prev.totalUnread - 1 > 0,
                  lastChecked: new Date(),
                };
              });

              // Debounce the fetch to avoid rapid calls
              if (refreshTimeout) clearTimeout(refreshTimeout);
              refreshTimeout = setTimeout(() => {
                console.log('[Real-time HOOK] Fetching counts after debounce');
                fetchUnreadCounts();
              }, 500);
            }
          }
        }
      )
      .subscribe((status: unknown) => {
        console.log('[Real-time HOOK] Subscription status:', status);
      });

    return () => {
      console.log('[useUnreadMessages] Cleaning up real-time subscription');
      if (refreshTimeout) clearTimeout(refreshTimeout);
      try {
        supabase.removeChannel(channel);
      } catch {
        // intentionally ignore errors during cleanup in test/env scenarios
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // REMOVED fetchUnreadCounts from dependencies - this was causing the infinite loop

  return {
    ...notificationState,
    isLoading,
    fetchUnreadCounts,
    markConversationAsRead,
    markAllAsRead,
  };
}
