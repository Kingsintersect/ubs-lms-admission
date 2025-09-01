"use server";

import { remoteApiUrl } from "@/config";
import { apiCall } from "@/lib/apiCaller";
import { handleApiError } from "@/lib/errorsHandler";
import { appendFormData } from "@/lib/formUtils";
import { AdmissionFormData } from "@/schemas/admission-schema";

/**
 * submit function
 */
export const submitAdmissionForm = async (
    data: AdmissionFormData,
    access_token: string
) => {
    const formData = new FormData();
    const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
    let totalSize = 0;

    // Prepare FormData
    try {
        appendFormData(formData, data);
        // seeFormData(formData); // for debugging
    } catch (error) {
        console.error("FormData preparation failed:", error);
        throw new Error("Failed to prepare form data");
    }

    // Calculate total file size
    for (const value of formData.values()) {
        if (value instanceof File) {
            totalSize += value.size;
        }
    }

    if (totalSize > MAX_UPLOAD_SIZE) {
        throw new Error(`Total upload size ${totalSize} exceeds maximum allowed`);
    }

    try {
        // Use native fetch instead of axios
        const res = await fetch(
            `${remoteApiUrl}/application/application-form`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    // DO NOT set Content-Type - let browser handle it
                },
                body: formData,
            }
        );

        if (!res.ok) {
            await handleApiError(res);
        }

        return await res.json();
    } catch (error: unknown) {
        console.error("Network or API error:", error);

        if (error instanceof Error) {
            throw error; // already an Error
        } else if (typeof error === "string") {
            throw new Error(error);
        } else {
            throw new Error("An unknown error occurred");
        }
    }
};
// ended submit function

export interface DeleteResponse {
    status: boolean;
    message: string;
}
export type DeleteAcademicImageResponse = DeleteResponse;
export type DeleteAcademicResponse = DeleteResponse;
export type DeleteAcademicImagePayload = {
    images_to_delete: string[];
};
export async function deleteAcademicImage(
    id: number,
    urls: string[],
): Promise<DeleteAcademicResponse> {
    const session = { user: { access_token: "" } };//await auth();
    const delUrl = {
        images_to_delete: urls
    }

    const response = await apiCall<DeleteAcademicImagePayload, DeleteAcademicImageResponse>({
        url: `/product/delete-image/${id}`,
        method: "POST",
        data: delUrl,
        accessToken: session?.user.access_token
    });

    if (!response?.status || !response?.message) {
        console.error("Failed to delete product image", response);
        throw new Error("Failed to delete product image");
    }

    return response;
}