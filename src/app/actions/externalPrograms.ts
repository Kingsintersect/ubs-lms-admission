"use server";

import { loginSessionKey } from "@/lib/definitions";
import { getSession } from "@/lib/session";
import { SessionData } from "@/types/auth";

export type LMSProgramType = {
    id: number;
    name: string;
};

export async function getLmsPrograms(parent_id: string | number) {
    const loginSession = (await getSession(loginSessionKey)) as SessionData;

    const response = await fetch(`https://ubs-portal-api.qverselearning.org/api/v1/odl/our-programs?parent_id=${parent_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${loginSession.access_token}`,
        },
    });

    if (!response.ok) {
        throw new Error('Payment verification failed');
    }

    return response.json();
}