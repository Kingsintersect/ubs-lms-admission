"use server";

import { remoteApiUrl } from "@/config";
import { apiCall } from "@/lib/apiCaller";
import { appendFormData, seeFormData } from "@/lib/formUtils";
import { AdmissionFormData } from "@/schemas/admission-schema";


export const submitAdmissionForm = async (data: AdmissionFormData, access_token: string) => {
    const formData = new FormData();
    //console.log('data', data)
    appendFormData(formData, data);
    seeFormData(formData)

    // formData.append("undergraduateDegree", data.undergraduateDegree);
    // formData.append("university", data.university);
    // formData.append("gpa", data.gpa);
    // formData.append("graduationYear", data.graduationYear);
    // formData.append("program", data.program);
    // formData.append("program_id", data.program_id);
    // formData.append("startTerm", data.startTerm);
    // formData.append("studyMode", data.studyMode);
    // formData.append("personalStatement", data.personalStatement);
    // formData.append("careerGoals", data.careerGoals);
    // formData.append("disability", String(data.disability));
    // formData.append("agreeToTerms", String(data.agreeToTerms));

    // formData.append("dob", data.dob);
    // formData.append("gender", data.gender);
    // formData.append("lga", data.lga);
    // formData.append("hometown", data.hometown);
    // formData.append("hometown_address", data.hometown_address);
    // formData.append("contact_address", data.contact_address);
    // formData.append("religion", data.religion);
    // formData.append("awaiting_result", data.awaiting_result ? "1" : "0");

    // formData.append("next_of_kin_name", data.next_of_kin_name);
    // formData.append("next_of_kin_relationship", data.next_of_kin_relationship);
    // formData.append("next_of_kin_phone_number", data.next_of_kin_phone_number);
    // formData.append("next_of_kin_email", data.next_of_kin_email);
    // formData.append("next_of_kin_address", data.next_of_kin_address);
    // formData.append("is_next_of_kin_primary_contact", data.is_next_of_kin_primary_contact);
    // formData.append("next_of_kin_alternate_phone_number", data.next_of_kin_alternate_phone_number);
    // formData.append("next_of_kin_occupation", data.next_of_kin_occupation);
    // formData.append("next_of_kin_workplace", data.next_of_kin_workplace);

    // formData.append("has_sponsor", data.has_sponsor ? "1" : "0");
    // if (data.sponsor_name !== null) {
    //     formData.append("sponsor_name", data.sponsor_name);
    // }

    // if (data.sponsor_relationship !== null) {
    //     formData.append("sponsor_relationship", data.sponsor_relationship);
    // }

    // if (data.sponsor_email !== null) {
    //     formData.append("sponsor_email", data.sponsor_email);
    // }

    // if (data.sponsor_contact_address !== null) {
    //     formData.append("sponsor_contact_address", data.sponsor_contact_address);
    // }

    // if (data.sponsor_phone_number !== null) {
    //     formData.append("sponsor_phone_number", data.sponsor_phone_number);
    // }

    // // Append images
    // (data.images ?? []).forEach((file) => {
    //     formData.append("images[]", file);
    // });

    // // Passport photo
    // if (data.passportPhoto) {
    //     formData.append("passportPhoto", data.passportPhoto);
    // }
    // if (data.passport) {
    //     formData.append("passport", data.passport);
    // }
    const res = await fetch(`${remoteApiUrl}/application/application-form`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
            `HTTP error! status: ${res.status}, details: ${JSON.stringify(errorData)}`
        );
    }

    return res.json();

    // Simulate API call
    // await new Promise(resolve => setTimeout(resolve, 2000));
    // console.log('data', data)
    // // Simulate random success/failure for demo
    // if (Math.random() > 0.2) {
    //     return { success: true, message: 'Application submitted successfully!' };
    // } else {
    //     throw new Error('Failed to submit application. Please try again.');
    // }
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