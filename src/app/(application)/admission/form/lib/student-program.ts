"use client";

import { ProgramType } from "@/config";
import { useAuth } from "@/contexts/AuthContext";
import { apiCall } from "@/lib/apiCaller";
import { useQuery } from "@tanstack/react-query";

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
    const { user, access_token } = useAuth();
    const programId = user?.program_id;

    return useQuery({
        queryKey: ["student-program", programId],
        queryFn: () => fetchStudentProgram(programId, user?.program, access_token),
        enabled: !!programId,
    });
};
