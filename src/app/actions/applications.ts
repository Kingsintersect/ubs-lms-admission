"use server";

import { remoteApiUrl } from "@/config";
import { StudentType } from "@/config/Types";
import { UseDataTableOptions } from "@/hooks/useDataTable";
import { apiCall } from "@/lib/apiCaller";
import { loginSessionKey } from "@/lib/definitions";
import { getSession } from "@/lib/session";
import { ApplicationDetailsType } from "@/schemas/admission-schema";
import { ApiResponseArray, ApiResponseSingle } from "@/types/api.types";
import { Application, ApplicationStatus } from "@/types/application";
import { SessionData } from "@/types/auth";

export async function getAdmissionApplicants(options?: UseDataTableOptions): Promise<{ data: StudentType[]; total: number }> {
    const loginSession = (await getSession(loginSessionKey)) as SessionData;
    const {
        pageIndex = 0,
        pageSize = 10,
        sortBy = "id",
        sortOrder = "desc",
        search = "",
        filters = {},
    } = options ?? {};

    const query = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        limit: pageSize.toString(),
        sortBy,
        sortOrder,
        search,
        ...filters,
    });

    const response = await apiCall<undefined, ApiResponseArray<StudentType>>({
        url: `/admin/all-applications?academicSession=2024/2025&${query.toString()}`,
        method: "GET",
        accessToken: loginSession.access_token
    });

    if (response?.status && response.data.data) {
        return {
            data: response.data.data,
            total: response.data.total,
        };
    } else {
        console.error("Failed to fetch categories");
        return { data: [], total: 0 };
    }
}

export async function getAdmittedApplicants(options?: UseDataTableOptions): Promise<{ data: StudentType[]; total: number }> {
    const loginSession = (await getSession(loginSessionKey)) as SessionData;
    const {
        pageIndex = 0,
        pageSize = 10,
        sortBy = "id",
        sortOrder = "desc",
        search = "",
        filters = {},
    } = options ?? {};

    const query = new URLSearchParams({
        page: (pageIndex + 1).toString(),
        limit: pageSize.toString(),
        sortBy,
        sortOrder,
        search,
        ...filters,
    });

    const response = await apiCall<undefined, ApiResponseArray<StudentType>>({
        url: `/admin/all-applications?academicSession=2024/2025&${query.toString()}`,
        method: "GET",
        accessToken: loginSession.access_token
    });

    if (response?.status && response.data.data) {
        return {
            data: response.data.data,
            total: response.data.total,
        };
    } else {
        console.error("Failed to fetch categories");
        return { data: [], total: 0 };
    }
}

export async function getStudentApplicantion(id: string): Promise<{ data: ApplicationDetailsType | null }> {
    const loginSession = (await getSession(loginSessionKey)) as SessionData;

    const response = await apiCall<undefined, ApiResponseSingle<ApplicationDetailsType>>({
        url: `/admin/single-application?id=${id}`,
        method: "GET",
        accessToken: loginSession.access_token
    });

    if (response?.status && response.data) {
        return {
            data: response.data,
        };
    } else {
        console.error("Failed to fetch student application");
        return { data: null };
    }
}

export async function ApproveStudentApplicantion(data: object): Promise<boolean> {
    const loginSession = (await getSession(loginSessionKey)) as SessionData;
    const response = await apiCall<object, ApiResponseSingle<ApplicationDetailsType>>({
        url: `/admin/approve-application`,
        method: "POST",
        data: data,
        accessToken: loginSession.access_token
    });
    if (response?.status !== 200) {
        console.error("Invalid API response", response);
        throw new Error("Failed to approve student applocation");
    }

    return true;
}
interface payLoad { reason: string, application_id: number | string }
export async function RejectStudentApplicantion(data: payLoad): Promise<boolean> {
    const loginSession = (await getSession(loginSessionKey)) as SessionData;

    const response = await apiCall<payLoad, ApiResponseSingle<ApplicationDetailsType>>({
        url: `/admin/reject-application`,
        method: "DELETE",
        data: data,
        accessToken: loginSession.access_token
    });
    if (response?.status !== 200) {
        console.error("Invalid API response", response);
        throw new Error("Failed to  reject student applocation");
    }

    return true;
}







export async function getApplications(
    filters?: Record<string, string>,
    access_token?: string,
): Promise<Application[]> {
    const params = new URLSearchParams(filters);
    // const res = await fetch(`/api/applications?${params.toString()}`);
    const res = await fetch(`${remoteApiUrl}/admin/all-applications?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
        },
    });

    if (!res.ok) {
        throw new Error("Failed to fetch applications");
    }

    return res.json();
}

export async function getApplicationById(id: string): Promise<Application | null> {
    const res = await fetch(`/api/applications/${id}`);

    if (res.status === 404) {
        return null;
    }

    if (!res.ok) {
        throw new Error("Failed to fetch application");
    }

    return res.json();
}

export async function updateApplicationStatus({
    applicationId,
    status,
    decisionComments,
}: {
    applicationId: string;
    status: ApplicationStatus;
    decisionComments?: string;
}): Promise<Application> {
    const res = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, decisionComments }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update application status");
    }

    return res.json();
}