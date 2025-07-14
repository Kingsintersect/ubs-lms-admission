
import { NextRequest, NextResponse } from "next/server";
import type { SessionData } from "@/types/auth";
import { Roles } from "@/config";
import { getSession } from "@/lib/session";
import { loginSessionKey } from "@/lib/definitions";

// 1. Specify protected and public routes
const publicRoutes = ["/auth/signin", "/auth/signup"];
const protectedRoutes = "/dashboard";
const studentRoutePrefix = "/dashboard/student";
const admissionFormRoutePrefix = "/admission/form";
const adminRoutePrefix = "/dashboard/admin";
const teacherRoutePrefix = "/dashboard/teacher";

// Helper function to get user's dashboard route based on role
const getUserDashboardRoute = (role: string) => {
  switch (role) {
    case Roles.ADMIN:
      return "admin";
    case Roles.TEACHER:
      return "teacher";
    case Roles.STUDENT:
      return "student";
    case "ADMISSION":
      return "form"; // Special case for admission form
    default:
      return "student"; // default fallback
  }
};

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  const isProtectedRoute = path.startsWith(protectedRoutes);
  const isStudentRoute = path.startsWith(studentRoutePrefix);
  const isAdminRoute = path.startsWith(adminRoutePrefix);
  const isTeacherRoute = path.startsWith(teacherRoutePrefix);
  const isAdmissionFormRoute = path.startsWith(admissionFormRoutePrefix);

  const loginSession = (await getSession(loginSessionKey)) as SessionData;
  const hasAppliedForAdmission = Boolean(loginSession?.user?.is_applied);

  // Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !loginSession?.user) {
    return NextResponse.redirect(new URL("/auth/signin", req.nextUrl));
  }

  // Redirect to appropriate dashboard if the user is authenticated and trying to access public routes
  if (isPublicRoute && loginSession?.user) {
    const userRole = loginSession.user.role?.toLowerCase() || "";
    const userRoute = getUserDashboardRoute(!hasAppliedForAdmission ? "ADMISSION" : userRole);
    let redirectUrl: URL;
    if (!hasAppliedForAdmission) {
      redirectUrl = new URL(`/admission/${userRoute}`, req.url);
    } else {
      redirectUrl = new URL(`/dashboard/${userRoute}`, req.url);
    }
    // const redirectUrl = new URL(`/dashboard/${userRoute}`, req.url);

    if (req.nextUrl.pathname !== redirectUrl.pathname) {
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Prevent STUDENTs from accessing Admission Form routes if they have applied
  if (isAdmissionFormRoute && !loginSession?.user) {
    return NextResponse.redirect(new URL(`/auth/signin`, req.url));
  }

  // Redirect users if they try to access routes not meant for their role
  if (loginSession?.user?.role) {
    const userRole = loginSession.user.role;
    const userDashboardRoute = getUserDashboardRoute(!hasAppliedForAdmission ? "ADMISSION" : userRole);

    // Admin-only routes
    if (isAdminRoute && userRole !== Roles.ADMIN) {
      if (hasAppliedForAdmission) {
        return NextResponse.redirect(new URL(`/dashboard/${userDashboardRoute}`, req.url));
      } else {
        return NextResponse.redirect(new URL(`/admission/${userDashboardRoute}`, req.url));
      }
    }

    // Teacher-only routes
    if (isTeacherRoute && userRole !== Roles.TEACHER) {
      if (hasAppliedForAdmission) {
        return NextResponse.redirect(new URL(`/dashboard/${userDashboardRoute}`, req.url));
      } else {
        return NextResponse.redirect(new URL(`/admission/${userDashboardRoute}`, req.url));
      }
    }

    // Admission Form-only routes
    if (isStudentRoute && userRole === Roles.STUDENT && !hasAppliedForAdmission) {
      return NextResponse.redirect(new URL(`/admission/${userDashboardRoute}`, req.url));
    }

    // Student-only routes
    if (isStudentRoute && userRole !== Roles.STUDENT) {
      return NextResponse.redirect(new URL(`/dashboard/${userDashboardRoute}`, req.url));
    }

  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images/.*|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$).*)",
  ],
};
