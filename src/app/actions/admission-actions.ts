"use server";

import { remoteApiUrl } from "@/config";
import { apiCall } from "@/lib/apiCaller";
import { appendFormData } from "@/lib/formUtils";
import { AdmissionFormData } from "@/schemas/admission-schema";


export const submitAdmissionForm = async (data: AdmissionFormData, access_token: string) => {
    const formData = new FormData();
    appendFormData(formData, data);
    // seeFormData(formData)
    const res = await fetch(`${remoteApiUrl}/application/application-form`, {
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${access_token}`,
        },
        body: formData,
    });

    console.log('res', res)

    if (!res.ok) {
        console.log('res.status', res.status)
        console.log('await res.text()', await res.text())
        const error = await res.json();
        throw new Error(
            `HTTP error! status: ${res.status}, details: ${JSON.stringify(error)}`
        );
    }

    return await res.json();
};


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