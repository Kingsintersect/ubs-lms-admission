"use server";

import { remoteApiUrl } from "@/config";
import { loginSessionKey } from "@/lib/definitions";
import {
	deleteSession,
	deleteSessionKey,
	getSession,
	setSession,
	updateSessionKey,
} from "@/lib/session";
import { apiCallerBeta } from "@/lib/apiCaller";
import { SessionData } from "@/types/auth";
import { ObjectType } from "@/types/generic.types";
import { GenericDataType } from "@/types/generic.types";
import { redirect } from "next/navigation";
import { StudentType } from "@/config/Types";

export const studentSignin = async (
	data: ObjectType
): Promise<GenericDataType> => {
	const response = (await apiCallerBeta({
		url: `${remoteApiUrl}/application/login`,
		method: "POST",
		data: { ...data },
	})) as GenericDataType;
	if (response.success) {
		const { user, access_token } = response.success;
		user.role = user.role ?? "STUDENT";
		await setSession(
			loginSessionKey,
			{
				user: user,
				access_token: access_token,
			},
			"1h"
		);
	}
	return response;
};

export const CreateStudentAccount = async (
	data: ObjectType
): Promise<GenericDataType> => {
	const response = (await apiCallerBeta({
		url: `${remoteApiUrl}/application/purchase`,
		method: "POST",
		data: { ...data },
	})) as GenericDataType;
	if (response.error) {
		throw response.error;
	}
	return response;
};

export const adminSignin = async (
	data: ObjectType
): Promise<GenericDataType> => {
	const response = (await apiCallerBeta({
		url: `${remoteApiUrl}/admin/admin-login`,
		method: "POST",
		data: { ...data },
	})) as GenericDataType;
	if (response.success) {
		const { user, access_token } = response.success;
		user.role = user.role ?? "ADMIN";
		await setSession(
			loginSessionKey,
			{
				user: user,
				access_token: access_token,
			},
			"1h"
		);
	}
	return response;
};

export async function logout() {
	const loginSession = (await getSession(
		loginSessionKey
	)) as SessionData | null;
	const userRole = loginSession?.user?.role as string | undefined;
	if (loginSession) {
		try {
			await deleteSessionKey(loginSessionKey);
			deleteSession();
			return { role: userRole };
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	redirect(`/auth/signin`);
	return false;
}
interface UserResponse {
	user: StudentType; // StudentType is the actual user data
	// ... other possible response fields
}
interface ApiResponse<T> {
	error?: {
		message: string;
		// ... other error properties
	};
	success?: T;
}
export const getUser = async (): Promise<ApiResponse<UserResponse>> => {
	const loginSession = (await getSession(loginSessionKey)) as SessionData;

	if (!loginSession) {
		return { error: { message: "No active session" } };
	}

	const res = await apiCallerBeta({
		url: `${remoteApiUrl}/application/profile`,
		method: "GET",
		headers: {
			Authorization: `Bearer ${loginSession.access_token}`,
		},
	});
	return res as ApiResponse<UserResponse>;
};

export async function refetchUserSessionData() {
	try {
		const loginSessionData = (await getSession(
			loginSessionKey
		)) as SessionData | null;

		if (!loginSessionData) {
			return { error: { message: "No active session" }, success: null };
		}

		return { success: loginSessionData, error: null };
	} catch {
		return { error: { message: "Failed to update session" }, success: null };
	}
}

export async function refetchUserData() {
	try {

		const loginSessionData = (await getSession(
			loginSessionKey
		)) as SessionData | null;

		if (!loginSessionData) {
			return { error: { message: "No active session" }, success: null };
		}

		const { error, success } = await getUser() as ApiResponse<UserResponse>
		if (error) {
			return { error, success: null };
		};

		const newUser = success?.user;
		await updateSessionKey(loginSessionKey, {
			user: {
				...newUser
			}
		});
		const updatedLoginSessionData = (await getSession(
			loginSessionKey
		)) as SessionData | null;


		return { success: updatedLoginSessionData, error: null };
	} catch {
		return { error: { message: "Failed to update session" }, success: null };
	}
}

export const ChangeUserPassword = async (
	access_token: string,
	data: ObjectType
) => {
	const response = await apiCallerBeta({
		url: `${remoteApiUrl}/application/change-password`,
		method: "POST",
		headers: {
			Authorization: `Bearer ${access_token}`,
		},
		data: { ...data },
	});
	return response;
};

export const CreateUsersByCsv = async (
	access_token: string,
	data: GenericDataType
) => {
	console.log(data);
	const response = await apiCallerBeta({
		url: `${remoteApiUrl}/account/multi-user-upload`,
		method: "POST",
		data: data,
		headers: {
			Authorization: `Bearer ${access_token}`,
			"Accept": "multipart/form-data",
		},
	});
	return response;
};
