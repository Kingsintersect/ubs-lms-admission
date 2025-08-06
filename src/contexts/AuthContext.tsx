"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuthSession } from "@/hooks/useUser";
import { signinAction, signOutAction } from "@/app/actions/auth-actions";
import { toastApiError, toastSuccess } from "@/lib/toastApiError";
import { baseUrl, Roles } from "@/config";
import { useRouter } from "next/navigation";
import { GenericDataType } from "@/types/generic.types";
import { AuthState } from "@/types/user";
import { UserInterface } from "next-auth";
import { apiCall } from "@/lib/apiCaller";

interface AuthContextType extends AuthState {
    updateUserInState: (user: AuthState['user']) => void;
    updateAccessTokenInState: (token: string | null) => void;
    clearAuthState: () => void;
    refreshUserData: () => Promise<void>;
    updateUserProfile: (profileData: Partial<UserInterface>) => Promise<void>;
    initializeLogin: (data: GenericDataType) => Promise<{
        success: boolean;
        error?: undefined;
    } | {
        error: unknown;
        success?: undefined;
    } | undefined>;
    initializeLogout: () => Promise<void>;
}

export type fetchUserResponse = {
    success: {
        data: UserInterface;
        message: string;
    };
    error?: string
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { data, isLoading, error, refetch } = useAuthSession();
    const router = useRouter();

    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        access_token: null,
        loading: true,
        error: null,
    });

    const populateAuthState = (StateData: AuthState, errorData: Error | null) => {
        if (StateData) {
            setAuthState({
                user: StateData.user ?? null,
                access_token: StateData.access_token ?? null,
                loading: false,
                error: null,
            });
        } else if (errorData) {
            setAuthState({
                user: null,
                access_token: null,
                loading: false,
                error: errorData.message,
            });
        }
    }

    // Function to refresh user data from API and update session
    const refreshUserData = async () => {
        if (!authState.access_token) return;

        setAuthState((prev) => ({ ...prev, loading: true }));

        try {
            // Fetch latest user data from API
            const response = await apiCall<null, fetchUserResponse>({
                url: "/application/profile",
                method: "GET",
                accessToken: authState.access_token,
                credentials: "omit",
                cache: "no-store",
            });

            console.log('response context', response)
            if (response?.success) {
                const updatedUser = response.success.data;
                console.log('updatedUser', updatedUser)

                // Update session with new user data
                // await fetch('/api/session/update-user', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ user: updatedUser }),
                // });

                // Update state
                setAuthState((prev) => ({
                    ...prev,
                    user: updatedUser as unknown as AuthState['user'],
                    loading: false,
                }));

                // Trigger session refetch to sync
                await refetch();
            }
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            setAuthState((prev) => ({
                ...prev,
                loading: false,
                error: 'Failed to refresh user data'
            }));
        }
    };

    // Function to update user profile (useful after profile updates)
    const updateUserProfile = async (profileData: Partial<UserInterface>) => {
        if (!authState.access_token || !authState.user) return;

        setAuthState((prev) => ({ ...prev, loading: true }));

        try {
            // Update profile via API
            const response = await apiCall<Partial<UserInterface>, fetchUserResponse>({
                url: "/application/profile",
                method: "PUT",
                data: profileData,
                accessToken: authState.access_token,
            });

            if (response?.success) {
                // Refresh user data to get the latest state
                await refreshUserData();
                toastSuccess("Profile updated successfully");
            } else {
                throw new Error(response?.error || "Profile update failed");
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            toastApiError("Failed to update profile");
            setAuthState((prev) => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        if (isLoading) {
            setAuthState((prev) => ({ ...prev, loading: true }));
            return;
        }

        populateAuthState(data, error)
    }, [data, isLoading, error]);

    // Periodic refresh for critical updates (optional)
    // useEffect(() => {
    //     if (!authState.access_token) return;

    //     // Set up periodic refresh every 5 minutes
    //     const interval = setInterval(() => {
    //         refreshUserData();
    //     }, 5 * 60 * 1000); // 5 minutes

    //     return () => clearInterval(interval);
    // }, [authState.access_token]);

    const initializeLogin = async (Credentials: GenericDataType) => {
        setAuthState((prev) => ({
            ...prev,
            loading: true,
            error: null,
        }));

        try {
            const { success, user, access_token, error: signinError } = await signinAction(Credentials);
            populateAuthState({ user, access_token, loading: false, error: null }, signinError)
            if (success) {
                toastSuccess("successfully signed in");
                let redirectUrl = user.role === Roles.STUDENT
                    ? `${baseUrl}/dashboard/student`
                    : user.role === Roles.TEACHER ? `${baseUrl}/dashboard/teacher`
                        : user.role === Roles.ADMIN ? `${baseUrl}/dashboard/admin`
                            : `${baseUrl}/dashboard/student`;

                if (user.role === Roles.STUDENT) {
                    redirectUrl = (!user.is_applied)
                        ? `/admission/form`
                        : `${redirectUrl}`;
                }
                router.push(`${redirectUrl}`);
                return { success: true };
            }
            if (error) {
                toastApiError("Signin Failed Try again.");
                return { error: error };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            setAuthState({
                user: null,
                access_token: null,
                loading: false,
                error: errorMessage
            });

            return { error: errorMessage };
        }
    }

    const initializeLogout = async () => {
        setAuthState((prev) => ({
            ...prev,
            loading: true,
            error: null,
        }));
        try {
            const { success } = await signOutAction("client");
            if (success) {
                toastSuccess("Successfully logged out");
            } else {
                toastApiError("Logout failed, please try again.");
            }
            populateAuthState({
                user: null,
                access_token: null,
                loading: false,
                error: null,
            }, error)
            router.push(`${baseUrl}/auth/signin`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Logout failed';
            setAuthState((prev) => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
        }
    }

    const updateUserInState = (user: AuthState['user']) => {
        setAuthState((prev) => ({ ...prev, user }));
    };

    const updateAccessTokenInState = (token: string | null) => {
        setAuthState((prev) => ({ ...prev, access_token: token }));
    };

    const clearAuthState = () => {
        setAuthState({
            user: null,
            access_token: null,
            loading: false,
            error: null,
        });
    };

    const value = {
        ...authState,
        updateUserInState,
        updateAccessTokenInState,
        clearAuthState,
        refreshUserData,
        updateUserProfile,
        initializeLogin,
        initializeLogout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};


// "use client";

// import React, { createContext, useContext, useState, useEffect } from "react";
// import { useAuthSession } from "@/hooks/useUser";
// import { signinAction, signOutAction } from "@/app/actions/auth-actions";
// import { toastApiError, toastSuccess } from "@/lib/toastApiError";
// import { baseUrl, Roles } from "@/config";
// import { useRouter } from "next/navigation";
// import { GenericDataType } from "@/types/generic.types";
// import { AuthState } from "@/types/user";

// interface AuthContextType extends AuthState {
//     updateUserInState: (user: AuthState['user']) => void;
//     updateAccessTokenInState: (token: string | null) => void;
//     clearAuthState: () => void;
//     initializeLogin: (data: GenericDataType) => Promise<{
//         success: boolean;
//         error?: undefined;
//     } | {
//         error: unknown;
//         success?: undefined;
//     } | undefined>;
//     initializeLogout: () => Promise<void>;
// }


// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
//     const { data, isLoading, error } = useAuthSession();
//     const router = useRouter();

//     const [authState, setAuthState] = useState<AuthState>({
//         user: null,
//         access_token: null,
//         loading: true,
//         error: null,
//     });

//     const populateAuthState = (StateData: AuthState, errorData: Error | null) => {
//         if (StateData) {
//             setAuthState({
//                 user: StateData.user ?? null,
//                 access_token: StateData.access_token ?? null,
//                 loading: false,
//                 error: null,
//             });
//         } else if (errorData) {
//             setAuthState({
//                 user: null,
//                 access_token: null,
//                 loading: false,
//                 error: errorData.message,
//             });
//         }
//     }

//     useEffect(() => {
//         if (isLoading) {
//             setAuthState((prev) => ({ ...prev, loading: true }));
//             return;
//         }

//         populateAuthState(data, error)
//     }, [data, isLoading, error]);

//     const initializeLogin = async (Credentials: GenericDataType) => {
//         setAuthState((prev) => ({
//             ...prev,
//             loading: true,
//             error: null,
//         }));

//         try {
//             const { success, user, access_token, error: signinError } = await signinAction(Credentials);
//             populateAuthState({ user, access_token, loading: false, error: null }, signinError)
//             if (success) {
//                 toastSuccess("successfully signed in");
//                 let redirectUrl = user.role === Roles.STUDENT
//                     ? `${baseUrl}/dashboard/student`
//                     : user.role === Roles.TEACHER ? `${baseUrl}/dashboard/teacher`
//                         : user.role === Roles.ADMIN ? `${baseUrl}/dashboard/admin`
//                             : `${baseUrl}/dashboard/student`;

//                 if (user.role === Roles.STUDENT) {
//                     redirectUrl = (!user.is_applied)
//                         ? `/admission/form`
//                         : `${redirectUrl}`;
//                 }
//                 router.push(`${redirectUrl}`);
//                 return { success: true };
//             }
//             if (error) {
//                 toastApiError("Signin Failed Try again.");
//                 return { error: error };
//             }
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Login failed';
//             setAuthState({
//                 user: null,
//                 access_token: null,
//                 loading: false,
//                 error: errorMessage
//             });

//             return { error: errorMessage };
//         }
//     }

//     const initializeLogout = async () => {
//         setAuthState((prev) => ({
//             ...prev,
//             loading: true,
//             error: null,
//         }));
//         try {
//             const { success } = await signOutAction("client");
//             if (success) {
//                 toastSuccess("Successfully logged out");
//             } else {
//                 toastApiError("Logout failed, please try again.");
//             }
//             populateAuthState({
//                 user: null,
//                 access_token: null,
//                 loading: false,
//                 error: null,
//             }, error)
//             router.push(`${baseUrl}/login`);
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Logout failed';
//             setAuthState((prev) => ({
//                 ...prev,
//                 loading: false,
//                 error: errorMessage,
//             }));
//         }
//     }

//     const updateUserInState = (user: AuthState['user']) => {
//         setAuthState((prev) => ({ ...prev, user }));
//     };

//     const updateAccessTokenInState = (token: string | null) => {
//         setAuthState((prev) => ({ ...prev, access_token: token }));
//     };

//     const clearAuthState = () => {
//         setAuthState({
//             user: null,
//             access_token: null,
//             loading: false,
//             error: null,
//         });
//     };

//     const value = {
//         ...authState,
//         updateUserInState,
//         updateAccessTokenInState,
//         clearAuthState,
//         initializeLogin,
//         initializeLogout,
//     };

//     return (
//         <AuthContext.Provider value={value}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) throw new Error("useAuth must be used within AuthProvider");
//     return context;
// };












