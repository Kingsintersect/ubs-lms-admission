import { NextRequest, NextResponse } from "next/server";
import type { SessionData } from "@/types/auth";
import { Roles } from "@/config";
import { getSession } from "@/lib/session";
import { loginSessionKey } from "@/lib/definitions";

const publicRoutes = ["/auth/signin", "/auth/signup", "/admission/payments/verify-admission", "/admission/payments/verify-admission/signin"];
const protectedRoutes = ["/dashboard", "/admission"];
const staticPaths = ["/_next", "/favicon.ico", "/images", /\.(png|jpg|jpeg|gif|svg)$/];

export default async function middleware(req: NextRequest) {
	const path = req.nextUrl.pathname;

	// Skip static assets
	if (staticPaths.some(p => typeof p === 'string' ? path.startsWith(p) : path.match(p))) {
		return NextResponse.next();
	}

	const loginSession = (await getSession(loginSessionKey)) as SessionData | null;
	const user = loginSession?.user;
	const hasApplied = Boolean(user?.is_applied);
	const role = user?.role?.toUpperCase() || '';

	// 1. Handle public routes
	if (publicRoutes.includes(path)) {
		if (user) {
			const redirectPath = hasApplied
				? `/dashboard/${role.toLowerCase()}`
				: '/admission/form';
			return NextResponse.redirect(new URL(redirectPath, req.url));
		}
		return NextResponse.next();
	}

	// 2. Handle unauthenticated users
	if (!user) {
		if (protectedRoutes.some(p => path.startsWith(p))) {
			return NextResponse.redirect(new URL('/auth/signin', req.url));
		}
		return NextResponse.next();
	}

	// 3. Role-based access control
	// const basePath = path.split('/')[1];
	const subPath = path.split('/')[2];

	// Admission form special case
	if (path.startsWith('/admission')) {
		if (hasApplied && role === Roles.STUDENT) {
			return NextResponse.redirect(new URL('/dashboard/student', req.url));
		}
		if (role !== Roles.STUDENT) {
			return NextResponse.redirect(new URL('/auth/signin', req.url));
		}
		return NextResponse.next();
	}

	// Dashboard routes
	if (path.startsWith('/dashboard')) {
		// Check if user has applied (for students)
		if (role === Roles.STUDENT && !hasApplied) {
			return NextResponse.redirect(new URL('/admission/form', req.url));
		}

		// Verify role matches route
		const rolePath = role.toLowerCase();
		if (subPath && subPath !== rolePath) {
			return NextResponse.redirect(new URL(`/dashboard/${rolePath}`, req.url));
		}

		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|images/.*|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$).*)",
	],
};
