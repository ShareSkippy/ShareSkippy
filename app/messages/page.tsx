/**
 * @fileoverview COMPLETE FIX - Messages page with all infinite loop issues resolved
 * @path /app/(main)/messages/page.tsx
 *
 * KEY FIXES:
 * 1. Extracted all primitive values to prevent object reference changes
 * 2. Memoized callbacks with proper dependencies
 * 3. Used refs for values that shouldn't trigger re-subscriptions
 * 4. Fixed real-time subscription to only depend on conversation ID
 */

'use client';

import {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
  ReactElement,
  FormEvent,
  ChangeEvent,
} from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/libs/supabase';
import MessageModal from '@/components/MessageModal';
import MeetingModal from '@/components/MeetingModal';
import { WelcomeNotification } from '@/components/WelcomeNotification';
import { MessageToast } from '@/components/MessageToast';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { BrowserNotifications } from '@/utils/browserNotifications';
import { User } from '@supabase/supabase-js';

// Types
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_photo_url: string | null;
}

interface Availability {
  id: string;
  title: string | null;
  post_type: string | null;
}

interface RawConversation {
  id: string;
  created_at: string;
  participant1_id: string;
  participant2_id: string;
  availability_id: string | null;
  last_message_at: string;
  participant1: Profile;
  participant2: Profile;
  availability: Availability | null;
}

export interface Conversation extends RawConversation {
  otherParticipant: Profile;
  displayName: string;
  profilePhoto: string | null;
  unreadCount?: number;
}

export interface Message {
  id: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  conversation_id?: string | null;
  availability_id?: string | null;
  is_read?: boolean;
  read_at?: string | null;
}

interface MessageModalState {
  isOpen: boolean;
  recipient: Profile | null;
  availabilityPost: Availability | null;
}

interface MeetingModalState {
  isOpen: boolean;
  recipient: Profile | null;
  conversation: Conversation | null;
}

interface ToastState {
  show: boolean;
  senderName: string;
  message: string;
  profilePhoto: string | null;
  conversationId: string | null;
}

export default function MessagesPage(): ReactElement {
  const { user, isLoading: authLoading } = useProtectedRoute() as {
    user: User;
    isLoading: boolean;
  };
  const router = useRouter();
  const searchParams = useSearchParams();

  // Notification system
  const { totalUnread, unreadByConversation, markConversationAsRead, fetchUnreadCounts } =
    useUnreadMessages(user);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [messageModal, setMessageModal] = useState<MessageModalState>({
    isOpen: false,
    recipient: null,
    availabilityPost: null,
  });
  const [meetingModal, setMeetingModal] = useState<MeetingModalState>({
    isOpen: false,
    recipient: null,
    conversation: null,
  });
  const [showConversations, setShowConversations] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Notification states
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    senderName: '',
    message: '',
    profilePhoto: null,
    conversationId: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isFirstLoad = useRef(true);
  const lastToastMessageId = useRef<string | null>(null);

  // CRITICAL FIX: Store conversation metadata in refs to avoid triggering re-subscriptions
  const selectedConversationRef = useRef<Conversation | null>(null);

  // Update ref whenever selectedConversation changes
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  // Extract only the ID for dependency tracking
  const selectedConversationId = selectedConversation?.id ?? null;

  // FIXED: Stable key that only changes when conversation ID changes
  const selectedConversationKey = useMemo(() => {
    if (!selectedConversationId) return 'none';
    return selectedConversationId;
  }, [selectedConversationId]);

  // Request browser notification permission on mount
  useEffect(() => {
    if (user) {
      BrowserNotifications.requestPermission();
    }
  }, [user]);

  // Show welcome notification on first load if there are unread messages
  useEffect(() => {
    if (isFirstLoad.current && !authLoading && totalUnread > 0 && !hasShownWelcome) {
      setShowWelcomeNotification(true);
      setHasShownWelcome(true);
      isFirstLoad.current = false;
    }
  }, [totalUnread, authLoading, hasShownWelcome]);

  const fetchMessages = useCallback(
    async (
      conversationId: string,
      participant1Id: string,
      participant2Id: string
    ): Promise<Message[]> => {
      if (!conversationId) return [];

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(
            `and(sender_id.eq.${participant1Id},recipient_id.eq.${participant2Id}),and(sender_id.eq.${participant2Id},recipient_id.eq.${participant1Id})`
          )
          .order('created_at', { ascending: true });

        if (error) {
          console.error('[fetchMessages] supabase error', error);
          throw error;
        }

        return (data as Message[]) || [];
      } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
    },
    []
  );

  const fetchConversations = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('conversations')
        .select(
          `
        *,
        participant1:profiles!conversations_participant1_id_fkey (
          id,
          first_name,
          last_name,
          profile_photo_url
        ),
        participant2:profiles!conversations_participant2_id_fkey (
          id,
          first_name,
          last_name,
          profile_photo_url
        ),
        availability:availability!conversations_availability_id_fkey (
          id,
          title,
          post_type
        )
        `
        )
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('[fetchConversations] Supabase error:', error);
        throw error;
      }

      const processedConversations = (data as RawConversation[]).map((conv): Conversation => {
        const otherParticipant =
          conv.participant1_id === user.id ? conv.participant2 : conv.participant1;

        return {
          ...conv,
          otherParticipant,
          displayName:
            `${otherParticipant.first_name || ''} ${otherParticipant.last_name || ''}`.trim() ||
            'Unknown User',
          profilePhoto: otherParticipant.profile_photo_url,
          unreadCount: 0,
        };
      });

      setConversations(processedConversations);

      const conversationIdFromUrl = searchParams.get('conversation');
      if (conversationIdFromUrl) {
        const targetConv = processedConversations.find((c) => c.id === conversationIdFromUrl);
        if (targetConv) {
          setSelectedConversation((current) => {
            if (current?.id !== targetConv.id) {
              return targetConv;
            }
            return current;
          });
        }
      } else {
        setSelectedConversation((current) => {
          if (!current && processedConversations.length > 0) {
            return processedConversations[0];
          }
          return current;
        });
      }
    } catch (error) {
      console.error('[fetchConversations] Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user, searchParams]);

  const sendMessage = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation?.otherParticipant) return;

    try {
      setSending(true);

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_id: selectedConversation.otherParticipant.id,
          availability_id: selectedConversation.availability_id,
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      setNewMessage('');
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const closeMessageModal = (): void => {
    setMessageModal({ isOpen: false, recipient: null, availabilityPost: null });
  };

  const openMeetingModal = (): void => {
    if (selectedConversation) {
      setMeetingModal({
        isOpen: true,
        recipient: selectedConversation.otherParticipant,
        conversation: selectedConversation,
      });
    }
  };

  const closeMeetingModal = (): void => {
    setMeetingModal({ isOpen: false, recipient: null, conversation: null });
  };

  const handleMeetingCreated = async (): Promise<void> => {
    if (selectedConversation) {
      await fetchMessages(
        selectedConversation.id,
        selectedConversation.participant1_id,
        selectedConversation.participant2_id
      );
      await fetchConversations();
    }
  };

  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      console.log('[handleSelectConversation] Selecting:', conversation.id);

      setSelectedConversation(conversation);
      setShowConversations(false);
      router.push(`/messages?conversation=${conversation.id}`, { scroll: false });

      if (conversation.unreadCount && conversation.unreadCount > 0) {
        await markConversationAsRead(
          conversation.id,
          conversation.participant1_id,
          conversation.participant2_id
        );
      }
    },
    [markConversationAsRead, router]
  );

  // Fetch messages effect
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      setError(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await fetchMessages(
          selectedConversation.id,
          selectedConversation.participant1_id,
          selectedConversation.participant2_id
        );

        if (!cancelled && !abortControllerRef.current?.signal.aborted) {
          setMessages(data || []);
        }
      } catch (e) {
        if (!cancelled && !abortControllerRef.current?.signal.aborted) {
          console.error('load messages failed', e);
          setError('Failed to load messages. Please try again.');
        }
      } finally {
        if (!cancelled && !abortControllerRef.current?.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId, fetchMessages]);

  // CRITICAL FIX: Real-time message subscription - ONLY depends on conversation ID and user ID
  useEffect(() => {
    if (!selectedConversationId || !user) {
      return;
    }

    console.log('[Real-time] 🔌 Subscribing to conversation:', selectedConversationId);

    const channel = supabase
      .channel(`messages:${selectedConversationId}`)
      .on(
        'postgres_changes' as never,
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: { new: Message }) => {
          const m = payload.new;

          // Get current conversation data from ref (doesn't trigger re-renders)
          const currentConv = selectedConversationRef.current;
          if (!currentConv) return;

          const matchesParticipants =
            (m.sender_id === currentConv.participant1_id &&
              m.recipient_id === currentConv.participant2_id) ||
            (m.sender_id === currentConv.participant2_id &&
              m.recipient_id === currentConv.participant1_id);

          if (matchesParticipants) {
            console.log('[Real-time] 📬 New message:', m.id);

            setMessages((prev: Message[]) => {
              if (prev.some((x) => x.id === m.id)) return prev;
              return [...prev, m].sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
            });

            if (m.recipient_id === user.id && m.sender_id !== user.id) {
              console.log('[Real-time] 🔔 New message for YOU');

              // Check if we've already shown toast for this message
              if (lastToastMessageId.current !== m.id) {
                lastToastMessageId.current = m.id;

                // Use ref to get current conversation data
                setToast({
                  show: true,
                  senderName: currentConv.displayName,
                  message: m.content,
                  profilePhoto: currentConv.profilePhoto,
                  conversationId: currentConv.id,
                });

                if (document.hidden) {
                  BrowserNotifications.showNotification(
                    `New message from ${currentConv.displayName}`,
                    {
                      body: m.content.substring(0, 100),
                      icon: currentConv.profilePhoto || '/icon.png',
                      tag: `message-${m.id}`,
                      data: { url: `/messages?conversation=${currentConv.id}` },
                    }
                  );
                }
              }

              // Mark as read after delay
              setTimeout(async () => {
                console.log('[Real-time] ⏱️ Marking message as read after delay');
                const { error: markError } = await supabase
                  .from('messages')
                  .update({
                    is_read: true,
                    read_at: new Date().toISOString(),
                  })
                  .eq('id', m.id)
                  .eq('recipient_id', user.id);

                if (markError) {
                  console.error('[Real-time] ❌ Failed to mark as read:', markError);
                } else {
                  console.log('[Real-time] ✅ Marked message as read:', m.id);
                }
              }, 1000);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('[Real-time] 📡 Subscription status:', status);
      });

    return () => {
      console.log('[Real-time] 🔌 Unsubscribing from:', selectedConversationId);
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, user?.id]); // ONLY ID dependencies

  // Real-time subscription for ALL conversations (sidebar updates)
  useEffect(() => {
    if (!user) return;

    console.log('[Real-time Sidebar] 🔌 Subscribing to ALL messages');

    const currentSelectedConvId = selectedConversationId;
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
    let updateTimeout: ReturnType<typeof setTimeout> | null = null;

    const channel = supabase
      .channel('all-messages-sidebar')
      .on(
        'postgres_changes' as never,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload: { new: Message }) => {
          const m = payload.new;
          const isRelevant = m.sender_id === user.id || m.recipient_id === user.id;

          if (isRelevant) {
            if (refreshTimeout) clearTimeout(refreshTimeout);
            refreshTimeout = setTimeout(() => {
              fetchConversations();
            }, 500);

            if (
              m.recipient_id === user.id &&
              m.sender_id !== user.id &&
              m.conversation_id !== currentSelectedConvId
            ) {
              if (updateTimeout) clearTimeout(updateTimeout);
              updateTimeout = setTimeout(() => {
                fetchUnreadCounts();
              }, 300);
            }
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
        (payload: { new: Message; old: { is_read: boolean } }) => {
          const m = payload.new;

          if (m.is_read === true && payload.old.is_read === false) {
            if (updateTimeout) clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
              fetchUnreadCounts();
            }, 300);
          }
        }
      )
      .subscribe((status) => {
        console.log('[Real-time Sidebar] 📡 Subscription status:', status);
      });

    return () => {
      console.log('[Real-time Sidebar] 🔌 Unsubscribing');
      if (refreshTimeout) clearTimeout(refreshTimeout);
      if (updateTimeout) clearTimeout(updateTimeout);
      supabase.removeChannel(channel);
    };
  }, [user?.id, selectedConversationId, fetchConversations, fetchUnreadCounts]);

  // Update unread counts on conversations
  useEffect(() => {
    setConversations((prev) =>
      prev.map((conv) => ({
        ...conv,
        unreadCount: unreadByConversation.get(conv.id) || 0,
      }))
    );
  }, [unreadByConversation]);

  // Initial fetch
  useEffect(() => {
    if (user && !authLoading) {
      fetchConversations();
    }
  }, [user, authLoading, fetchConversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else if (now.getTime() - messageDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[calc(100dvh)] md:h-screen overflow-hidden bg-white messages-page">
        {/* Header */}
        <div className="shrink-0 border-b px-4 py-4 bg-white">
          <h1 className="text-lg sm:text-xl font-semibold">💬 Messages</h1>
          <p className="text-sm text-gray-600 mt-1">
            Connect with other dog lovers in your community
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`w-full lg:w-80 border-r border-gray-200 bg-gray-50 flex flex-col min-h-0 ${
              showConversations ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              <button
                onClick={() => setShowConversations(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto ios-scroll">
              {loading && (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}
              {!loading && conversations.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start messaging someone from the community!</p>
                </div>
              )}
              {!loading &&
                conversations.length > 0 &&
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`w-full text-left p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors relative ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-blue-50 border-blue-200'
                        : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {conversation.profilePhoto ? (
                          <Image
                            src={conversation.profilePhoto}
                            alt={conversation.displayName}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-lg font-medium text-gray-600">
                            {conversation.displayName?.[0] || '👤'}
                          </div>
                        )}
                        {conversation.unreadCount && conversation.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3
                            className={`font-semibold text-gray-900 truncate ${conversation.unreadCount ? 'font-bold' : ''}`}
                          >
                            {conversation.displayName}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {conversation.availability?.title || 'Availability Post'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(conversation.last_message_at)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </aside>

          {/* Thread section */}
          <section className="flex-1 min-h-0 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="shrink-0 border-b px-4 py-4 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowConversations(true)}
                        className="lg:hidden text-gray-500 hover:text-gray-700 mr-2"
                      >
                        ←
                      </button>
                      {selectedConversation.profilePhoto ? (
                        <Image
                          src={selectedConversation.profilePhoto}
                          alt={selectedConversation.displayName}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-lg font-medium text-gray-600">
                          {selectedConversation.displayName?.[0] || '👤'}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {selectedConversation.displayName}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.availability?.post_type === 'dog_available'
                            ? 'Dog Owner'
                            : 'PetPal'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <div className="text-sm text-gray-500 truncate">
                        {selectedConversation.availability?.title}
                      </div>
                      <button
                        onClick={openMeetingModal}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap font-medium"
                      >
                        📅 Schedule Meeting
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  key={selectedConversationKey}
                  ref={scrollRef}
                  id="message-scroll"
                  className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden ios-scroll px-4 py-4 bg-gray-50 wrap-break-word space-y-3 max-w-full"
                >
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user.id ? 'justify-end' : 'justify-start'
                      } message-container`}
                    >
                      <div
                        className={`message-bubble px-4 py-3 rounded-2xl wrap-break-word shadow-xs max-w-full ${
                          message.sender_id === user.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-2 ${
                            message.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center">
                        <div className="text-red-600 mr-2">⚠️</div>
                        <div>
                          <p className="text-red-800 font-medium">Failed to load messages</p>
                          <p className="text-red-600 text-sm">{error}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setError(null);
                          if (selectedConversation) {
                            fetchMessages(selectedConversation.id);
                          }
                        }}
                        className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded-sm hover:bg-red-700 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  <div id="bottom-anchor" />
                </div>

                <div className="shrink-0 border-t bg-white p-4 p-safe">
                  <form
                    onSubmit={sendMessage}
                    className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 message-input"
                  >
                    <textarea
                      value={newMessage}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                        setNewMessage(e.target.value);
                        const textarea = e.target;
                        textarea.style.height = 'auto';
                        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
                      }}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm auto-resize-textarea"
                      disabled={sending}
                      rows={1}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-medium text-sm self-end"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                  <p className="mb-4">Choose a conversation from the sidebar to start messaging</p>
                  <button
                    onClick={() => setShowConversations(true)}
                    className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Conversations
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modals and Notifications */}
      <MessageModal
        isOpen={messageModal.isOpen}
        onClose={closeMessageModal}
        recipient={messageModal.recipient}
        availabilityPost={messageModal.availabilityPost}
      />

      <MeetingModal
        isOpen={meetingModal.isOpen}
        onClose={closeMeetingModal}
        recipient={meetingModal.recipient}
        conversation={meetingModal.conversation}
        onMeetingCreated={handleMeetingCreated}
      />

      {showWelcomeNotification && (
        <WelcomeNotification
          unreadCount={totalUnread}
          onViewMessages={() => setShowWelcomeNotification(false)}
          onDismiss={() => setShowWelcomeNotification(false)}
        />
      )}

      {toast.show && (
        <MessageToast
          senderName={toast.senderName}
          message={toast.message}
          profilePhoto={toast.profilePhoto}
          onClose={() => setToast({ ...toast, show: false })}
          onClick={() => {
            setToast({ ...toast, show: false });
            if (toast.conversationId) {
              const conv = conversations.find((c) => c.id === toast.conversationId);
              if (conv) {
                handleSelectConversation(conv);
              }
            }
          }}
        />
      )}
    </>
  );
}
