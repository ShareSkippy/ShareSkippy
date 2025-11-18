/** @jest-environment node */

import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from "@jest/globals";
import { POST } from "@/app/api/auth/logout/route";
import { createClient } from "@/libs/supabase/server";

jest.mock("@/libs/supabase/server", () => ({
    createClient: jest.fn(),
}));

type SupabaseServerClient = Awaited<
    ReturnType<typeof import("@/libs/supabase/server").createClient>
>;

describe("Logout API Route", () => {
    const mockSignOut = jest.fn<() => Promise<{ error: Error | null }>>();
    let consoleErrorSpy: ReturnType<typeof jest.spyOn>;
    const mockClient = {
        auth: {
            signOut: mockSignOut,
        },
    } as unknown as SupabaseServerClient;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(
            () => {},
        );
        (createClient as jest.MockedFunction<typeof createClient>)
            .mockResolvedValue(mockClient);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it("returns a successful JSON response when the Supabase signOut call succeeds", async () => {
        mockSignOut.mockResolvedValue({ error: null });

        const response = await POST();

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ error: null });
    });

    it("propagates Supabase errors with a 500 status", async () => {
        const supabaseError = new Error("session clear failed");
        mockSignOut.mockResolvedValue({ error: supabaseError });

        const response = await POST();

        expect(response.status).toBe(500);
        await expect(response.json()).resolves.toEqual({
            error: supabaseError.message,
        });
        expect(consoleErrorSpy).toHaveBeenCalled();
    });
});
