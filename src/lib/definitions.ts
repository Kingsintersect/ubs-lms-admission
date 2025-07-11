export type SessionPayload<T = Record<string, any>> = T & {
	issuedAt?: number;
	expiresAt: number;
};

export const ssoSessionKey = "sso_auth_session_ubs";
export const loginSessionKey = "login_session_ubs";
export type PaymentStatus = "1" | "0" | null;
