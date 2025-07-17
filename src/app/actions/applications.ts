import { remoteApiUrl } from "@/config";
import { Application, ApplicationStatus } from "@/types/application";

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
    console.log('res', res)

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