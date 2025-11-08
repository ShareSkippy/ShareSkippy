/**
 * @fileoverview This file defines custom React Query hooks for fetching
 * and managing user meetings.
 * @path /hooks/useMeetings.ts
 */

// #region Imports
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import { useUser } from "@/components/providers/SupabaseUserProvider";

// --- Supabase Types ---
import { User } from "@supabase/supabase-js";
// #endregion

// #region Types
/**
 * @description Basic profile structure for meeting participants.
 */
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  profile_photo_url: string | null;
}

/**
 * @description Defines the possible states for a meeting.
 */
type MeetingStatus = "pending" | "scheduled" | "cancelled" | "completed";

/**
 * @description The main Meeting object structure.
 */
interface Meeting {
  id: string;
  requester_id: string;
  recipient_id: string;
  title: string;
  description: string | null;
  start_datetime: string;
  end_datetime: string;
  meeting_place: string;
  status: MeetingStatus;
  has_reviewed: boolean;
  requester: Profile;
  recipient: Profile;
}

/**
 * @description The shape of the data returned from the /api/meetings endpoint.
 */
interface MeetingsResponse {
  meetings: Meeting[];
}

/**
 * @description The payload for the update meeting mutation.
 */
interface UpdateMeetingPayload {
  meetingId: string;
  status: MeetingStatus;
  message: string;
}

/**
 * @description The expected response from a successful meeting update.
 * Assuming it returns the single updated meeting.
 */
type UpdateMeetingResponse = Meeting;
// #endregion

// #region useMeetings
/**
 * @description Fetches the user's meetings.
 * Automatically triggers an API route to update meeting statuses before fetching.
 */
export const useMeetings = (): UseQueryResult<MeetingsResponse, Error> => {
  const { user } = useUser() as { user: User | null };

  return useQuery<
    MeetingsResponse,
    Error,
    MeetingsResponse,
    (string | undefined)[]
  >({
    queryKey: ["meetings", user?.id],
    queryFn: async (): Promise<MeetingsResponse> => {
      if (!user) return { meetings: [] };

      // First, update any meetings that should be marked as completed
      // NOTE: This is original logic. This POST call will run on every refetch.
      await fetch("/api/meetings/update-status", { method: "POST" });

      // Then fetch the updated meetings
      const response = await fetch("/api/meetings");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch meetings");
      }

      return data as MeetingsResponse;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
// #endregion

// #region useUpdateMeetingStatus
/**
 * @description Provides a mutation to update a meeting's status with retry logic.
 */
export const useUpdateMeetingStatus = (): UseMutationResult<
  UpdateMeetingResponse,
  Error,
  UpdateMeetingPayload
> => {
  const queryClient = useQueryClient();
  const { user } = useUser() as { user: User | null };

  return useMutation<UpdateMeetingResponse, Error, UpdateMeetingPayload>({
    mutationFn: async ({
      meetingId,
      status,
      message,
    }: UpdateMeetingPayload): Promise<UpdateMeetingResponse> => {
      const maxRetries = 3;
      let lastError: Error = new Error(
        "Meeting update failed after 3 attempts",
      );

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(
            `Attempting to update meeting (attempt ${attempt}/${maxRetries}):`,
            {
              meetingId,
              status,
              message,
            },
          );

          const response = await fetch(`/api/meetings/${meetingId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status, message }),
          });

          console.log("Response status:", response.status);
          console.log("Response headers:", [...response.headers.entries()]);

          const data = await response.json();
          console.log("Response data:", data);

          if (!response.ok) {
            console.error("Meeting update failed:", data);
            throw new Error(data.error || "Failed to update meeting status");
          }

          return data as UpdateMeetingResponse; // Success!
        } catch (error: any) {
          console.error(
            `Network error during meeting update (attempt ${attempt}):`,
            error,
          );
          console.error("Error type:", error?.constructor?.name);
          console.error("Error message:", error?.message);
          console.error("Error stack:", error?.stack);

          lastError = error instanceof Error ? error : new Error(String(error));

          // Don't retry for authentication or validation errors
          if (
            error.message.includes("Unauthorized") ||
            error.message.includes("Invalid") ||
            error.message.includes("Cannot cancel")
          ) {
            throw lastError; // Non-retriable error
          }

          // If this is the last attempt, throw the error
          if (attempt === maxRetries) {
            // Provide more specific error messages
            if (error.name === "TypeError" && error.message.includes("fetch")) {
              throw new Error(
                "Network error: Unable to connect to server. Please check your internet connection and try again.",
              );
            }
            throw lastError; // Throw the last captured error
          }

          // Wait before retrying (exponential backoff)
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // This should be unreachable, but it satisfies TypeScript's compiler
      throw lastError;
    },
    onSuccess: () => {
      // Invalidate and refetch meetings
      queryClient.invalidateQueries({ queryKey: ["meetings", user?.id] });
    },
  });
};
// #endregion
