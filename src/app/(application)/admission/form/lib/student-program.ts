"use client";

import { ProgramType } from "@/config";
import { useAuth } from "@/contexts/AuthContext";
import { apiCall } from "@/lib/apiCaller";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export interface StudentProgramInfo {
    programType: ProgramType;
    programName: string;
}

type TopParentCategoryResponse = {
    id: number;
    name: string;
    parent: number;
};

const CERTIFICATE_KEYWORD = "certificate";

/**
 * Resolves which admission form (Certificate Programme vs Business School) the
 * logged-in student should see, by walking their program up to its top-level
 * parent category and checking whether that category's name mentions
 * "certificate". Any category that doesn't is treated as a Business School
 * programme, since those are the only two applicant categories this form
 * supports.
 */
async function fetchStudentProgram(
    programId: string | number | null | undefined,
    programName: string | null | undefined,
    access_token: string | null,
): Promise<StudentProgramInfo> {
    if (!programId) {
        throw new Error("No program is associated with this student");
    }

    const category = await apiCall<{ id: string | number }, TopParentCategoryResponse>({
        url: "/odl/program-top-parent-category",
        method: "POST",
        data: { id: programId },
        accessToken: access_token ?? undefined,
        // Auth here is via the Bearer token, not cookies. Requesting
        // credentials: "include" (apiCall's default) forces the browser to
        // require an `Access-Control-Allow-Credentials: true` response header
        // on this cross-origin endpoint, which it doesn't send - failing the
        // CORS preflight before the request is ever made.
        credentials: "omit",
    });

    if (!category) {
        throw new Error("Failed to resolve the student's program category");
    }

    const isCertificate = category.name?.toLowerCase().includes(CERTIFICATE_KEYWORD) ?? false;

    return {
        programType: isCertificate ? ProgramType.CERTIFICATE : ProgramType.BUSINESS_SCHOOL,
        programName: programName ?? category.name,
    };
}

export const useStudentProgram = () => {
    const { user, access_token, loading: authLoading } = useAuth();
    const programId = user?.program_id;

    if (!authLoading && !programId) {
        // Surfaces as "Could not determine your admission programme" in the
        // UI - if you see that and land here, the logged-in user's record
        // genuinely has no program_id, which likely means the backend's
        // `/application/profile` response (what populates the session user)
        // doesn't include that field. Log it to compare against the actual
        // field name/shape the API returns.
        console.warn("[useStudentProgram] user has no program_id - full user object:", user);
    }

    const query = useQuery({
        queryKey: ["student-program", programId],
        queryFn: () => fetchStudentProgram(programId, user?.program, access_token),
        // Don't attempt this until auth has actually finished resolving -
        // otherwise `user` is still null on first render, programId comes up
        // falsy, and (since a disabled react-query v5 query reports
        // isLoading: false) the caller would flash "could not determine your
        // programme" before auth even had a chance to populate the user.
        enabled: !authLoading && !!programId,
        // Submitting the application triggers a session refresh
        // (refreshUserData) to pick up the new is_applied flag, and some
        // backends stop returning program_id once an application exists for
        // the user. Without this, that refetch flips programId to falsy right
        // after a successful submit, this query goes back to "pending" for
        // its new (disabled) key, and the whole form - including the
        // just-earned SuccessScreen - gets torn down and replaced with the
        // "could not determine your programme" error. Keeping the last
        // resolved value around avoids that.
        placeholderData: keepPreviousData,
    });

    return {
        ...query,
        isLoading: authLoading || query.isLoading,
    };
};
