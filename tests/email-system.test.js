/**
 * Comprehensive tests for the centralized email system
 * Run with: npm test tests/email-system.test.js
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createServiceClient } from '@/libs/supabase/server';
import {
  sendEmail,
  scheduleEmail,
  recordUserActivity,
  processScheduledEmails,
  scheduleMeetingReminder,
  loadEmailTemplate,
  processReengageEmails, // Added processReengageEmails
} from '@/libs/email';

// Mock the external Resend email sending module
jest.mock('@/libs/resend', () => ({
  sendEmail: jest.fn(() => Promise.resolve({ id: 'test-message-id' })),
}));

// Mock the Supabase client creation service
jest.mock('@/libs/supabase/server', () => ({
  createServiceClient: jest.fn(),
}));

// Mock the loadEmailTemplate dependency, as it likely loads actual template files
// This assumes 'loadEmailTemplate' is exported from the '@libs/email/templates'
jest.mock('@/libs/email/templates/index', () => ({
  loadTemplate: jest.fn((type, payload) => ({
    subject: `Welcome to ShareSkippy - ${payload.userName}`,
    html: `<h1>Welcome ${payload.userName}</h1><p>Link: ${payload.appUrl}</p>`,
    text: `Welcome ${payload.userName}. Link: ${payload.appUrl}`,
  })),
}));

// --- MOCK IMPLEMENTATION HELPER ---
/**
 * Creates a flexible mock Supabase client that uses separate handlers
 * for scheduled emails, user profiles, and general operations.
 */
const mockSupabaseImplementation = (scheduledData = [], profileData = [], eventData = []) => {
  // Mock chain for SELECT operations
  const mockSelectChain = jest.fn().mockReturnThis();

  // Final resolution function for SELECT chain
  const mockResolution = jest.fn(({ table, id, time }) => {
    if (table === 'scheduled_emails') {
      return Promise.resolve({ data: scheduledData, error: null });
    }
    if (table === 'profiles') {
      // Find the profile data needed
      const data = profileData.filter((p) => p.id === id);
      return Promise.resolve({ data: data.length > 0 ? data : [], error: null });
    }
    if (table === 'email_events') {
      return Promise.resolve({ data: eventData, error: null });
    }
    return Promise.resolve({ data: [], error: null });
  });

  // Default chain implementation: mock everything to return itself
  const mockChain = {
    // Selection methods (where filtering/ordering happens)
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),

    // Finalization methods
    single: jest.fn(() =>
      mockResolution({ table: mockChain._currentTable, id: mockChain._currentId })
    ),

    // Mock the .maybeSingle() if used, returns the same logic as single
    maybeSingle: jest.fn(() =>
      mockResolution({ table: mockChain._currentTable, id: mockChain._currentId })
    ),

    // Final array resolution for multiple rows
    then: jest.fn((cb) => cb({ data: scheduledData, error: null })), // Used for multiple results

    // Final method for array results
    data: scheduledData,
    error: null,
  };

  // Mock the .from() call to start the chain
  const mockFrom = jest.fn((table) => {
    // Attach current table name for resolution logic
    mockChain._currentTable = table;
    // Set up custom resolution based on table
    if (table === 'scheduled_emails') {
      mockChain.limit = jest.fn(() => mockResolution({ table: 'scheduled_emails', time: 'now' }));
      return mockChain;
    }
    // Set up resolution for single-row lookups (like profiles/events)
    if (table === 'profiles' || table === 'email_events') {
      mockChain.eq = jest.fn((col, val) => {
        mockChain._currentId = val; // Store the ID being queried
        mockChain.single = jest.fn(() => mockResolution({ table, id: val }));
        mockChain.maybeSingle = jest.fn(() => mockResolution({ table, id: val }));
        return mockChain;
      });
      return mockChain;
    }

    // Default return for insert/update (must be mocked to return something chainable)
    return {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      then: jest.fn((cb) => cb({ data: [], error: null })),
      error: null,
    };
  });

  return { from: mockFrom };
};

describe('Email System Tests', () => {
  let mockSupabase;
  const mockResend = require('@/libs/resend'); // Get direct reference to mock

  beforeEach(() => {
    jest.clearAllMocks();
    // Default implementation: assume no scheduled emails and no user profiles
    mockSupabase = mockSupabaseImplementation([], [], []);
    createServiceClient.mockReturnValue(mockSupabase);
    mockResend.sendEmail.mockClear(); // Clear Resend mock calls
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- BEGIN TESTS ---

  describe('sendEmail', () => {
    it('should send welcome email with idempotency and log event', async () => {
      // Set up mocks for a successful send and ensure no existing events
      const mockInsert = mockSupabase.from('email_events').insert;

      const result = await sendEmail({
        userId: 'test-user-id',
        to: 'test@example.com',
        emailType: 'welcome',
        payload: { userName: 'Test User' },
      });

      expect(mockResend.sendEmail).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          email_type: 'welcome',
          status: 'sent',
          external_message_id: 'test-message-id',
        })
      );
      expect(result.status).toBe('sent');
    });

    it('should skip duplicate welcome emails when existing event is found', async () => {
      // 🚨 FIX: Mock the *select* logic to return an existing event
      const mockEventData = [{ id: 1, status: 'sent', external_message_id: 'old-id' }];
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'email_events') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockEventData[0], error: null }),
          };
        }
        return mockSupabaseImplementation().from(table); // Fallback for other tables
      });

      const result = await sendEmail({
        userId: 'test-user-id',
        to: 'test@example.com',
        emailType: 'welcome',
        payload: { userName: 'Test User' },
      });

      expect(mockResend.sendEmail).not.toHaveBeenCalled(); // Should be skipped
      expect(result.status).toBe('sent'); // Should return the status of the existing event
      expect(result.external_message_id).toBe('old-id');
    });

    // ... other sendEmail tests ...
  });

  // ... scheduleEmail and recordUserActivity tests are fine, relying on the default insert/update mocks ...

  describe('processScheduledEmails', () => {
    it('should process due scheduled emails and update their status', async () => {
      const mockScheduledEmails = [
        {
          id: 1,
          user_id: 'test-user-1',
          email_type: 'nurture_day3',
          payload: { userName: 'User 1' },
        },
        { id: 2, user_id: 'test-user-2', email_type: 'welcome', payload: { userName: 'User 2' } },
      ];
      const mockProfiles = [
        { id: 'test-user-1', email: 'user1@example.com', first_name: 'User 1' },
        { id: 'test-user-2', email: 'user2@example.com', first_name: 'User 2' },
      ];

      // 🚨 FIX: Implement the complex select and individual profile lookups
      const mockUpdate = jest.fn().mockResolvedValue({ error: null });
      const mockFrom = jest.fn((table) => {
        if (table === 'scheduled_emails') {
          return {
            select: jest.fn().mockReturnThis(),
            // Mock the final chain to return the emails to be processed
            limit: jest.fn().mockResolvedValue({ data: mockScheduledEmails, error: null }),
            update: jest.fn().mockReturnThis(), // needed for the PICKED_AT update
            eq: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            // Mock individual profile lookups
            eq: jest.fn((col, id) => {
              const userData = mockProfiles.find((p) => p.id === id);
              return {
                single: jest.fn().mockResolvedValue({ data: userData || null, error: null }),
              };
            }),
          };
        }
        if (table === 'scheduled_emails') {
          return { update: mockUpdate, eq: jest.fn().mockResolvedValue({ error: null }) };
        }
        return mockSupabaseImplementation().from(table); // Fallback
      });
      createServiceClient.mockReturnValue({ from: mockFrom });

      const result = await processScheduledEmails();

      expect(result.processed).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(mockResend.sendEmail).toHaveBeenCalledTimes(2); // Should attempt to send both
    });
  });

  // ... scheduleMeetingReminder and loadEmailTemplate tests are generally correct ...

  describe('processReengageEmails', () => {
    it('should process re-engagement emails for inactive users', async () => {
      const mockInactiveUsers = [
        {
          id: 'test-user-1',
          email: 'user1@example.com',
          user_activity: { at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
        },
      ];
      // Note: Supabase's `select` with `lt/eq/not` filters will return the full row data,
      // which should be an array of profiles.

      const mockFrom = jest.fn((table) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            // Mock the complex chain for finding inactive users
            // Assume the full chain (lt, eq, not, not, not) resolves to this data
            not: jest.fn().mockReturnThis(),
            lt: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            then: jest.fn((cb) => cb({ data: mockInactiveUsers, error: null })),
          };
        }
        if (table === 'email_events') {
          // Mock idempotency check (assume no recent email found)
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            gte: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }
        // Mock the required insert operation for the new email event
        return mockSupabaseImplementation().from(table);
      });
      createServiceClient.mockReturnValue({ from: mockFrom });

      const result = await processReengageEmails();

      expect(result.processed).toBe(1);
      expect(result.sent).toBe(1);
      expect(result.skipped).toBe(0);
      expect(mockResend.sendEmail).toHaveBeenCalledTimes(1);
    });
  });
});
