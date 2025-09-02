export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_UBS ?? "";
export const apiUrl = process.env.NEXT_PUBLIC_API_URL_UBS ?? "";
export const credoPaymentBaseUrl = process.env.NEXT_PUBLIC_CREDO_PAYMENT_GATEWAY_URL ?? "https://pay.credodemo.com/v4";

export const remoteApiUrl = process.env.NEXT_PUBLIC_REMOTE_API_URL_UBS ?? "";
export const lmsLoginUrl = process.env.NEXT_PUBLIC_LMS_LOGIN_URL_UBS ?? "";

export const accessTokenSecret =
	process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET_UBS ?? "";
export const refreshTokenSecret =
	process.env.NEXT_PUBLIC_REFRESH_TOKEN_SECRET_UBS ?? "";

export const sessionSecret = process.env.NEXT_PUBLIC_SESSION_SECRET_UBS ?? "";
export const sessionPassword =
	process.env.NEXT_PUBLIC_SESSION_PASSWORD_UBS ?? "";

export const clientId = process.env.NEXT_PUBLIC_CLIENT_ID_UBS ?? "";
export const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET_UBS ?? "";


export const ssoSessionKey = process.env.NEXT_PUBLIC_SSO_SESSION_KEY ?? "";
export const loginSessionKey = process.env.NEXT_PUBLIC_LOGIN_SESSION_KEY ?? "";
export const appSessionKey = process.env.NEXT_PUBLIC_APP_SESSION_KEY ?? "";

export const SITE_SHORT_NAME = process.env.NEXT_PUBLIC_APP_SHORT_NAME ?? "";
export const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "";
export const SITE_TITLE = process.env.NEXT_PUBLIC_SITE_TITLE ?? "";

const secretKey = process.env.NEXT_PUBLIC_SESSION_SECRET_UBS;
export const encodedKey = new TextEncoder().encode(secretKey);
export type PaymentStatus = "FULLY_PAID" | "PART_PAID" | "UNPAID" | null;

export type SessionPayload<T = Record<string, any>> = T & {
	issuedAt?: number;
	expiresAt: number;
};

export enum Roles {
	ADMIN = "ADMIN",
	STUDENT = "STUDENT",
	TEACHER = "TEACHER",
	MANAGER = "MANAGER",
}

export const APPLICATION_FEE = 37000;
export const ACCEPTANCE_FEE = 30000;
export const FULL_TUITION_FEE = 195000;
