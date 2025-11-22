"use client";

import { createContext, useContext, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApplicationDetailsType } from '@/schemas/admission-schema';
import { ApplicationApproveValues, ApplicationRejectValues } from '@/schemas/applicationReview-schema';
import {
    ApproveStudentApplicantion,
    getStudentApplicantion,
    RejectStudentApplicantion
} from '@/app/actions/applications';
import { toastApiError, toastSuccess } from '@/lib/toastApiError';

type DecisionType = 'ADMITTED' | 'NOT_ADMITTED' | null;

type ApplicationReviewContextType = {
    // Modal state
    showDecisionModal: boolean;
    decisionType: DecisionType;
    openDecisionModal: (type: 'ADMITTED' | 'NOT_ADMITTED') => void;
    closeDecisionModal: () => void;

    // Mutations
    approveMutation: ReturnType<typeof useMutation<boolean, Error, ApplicationApproveValues>>;
    rejectMutation: ReturnType<typeof useMutation<boolean, Error, ApplicationRejectValues>>;
};

const ApplicationReviewContext = createContext<ApplicationReviewContextType | undefined>(undefined);

export const ApplicationReviewProvider = ({ children }: { children: React.ReactNode }) => {
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [decisionType, setDecisionType] = useState<DecisionType>(null);
    const queryClient = useQueryClient();

    const openDecisionModal = (type: 'ADMITTED' | 'NOT_ADMITTED') => {
        setDecisionType(type);
        setShowDecisionModal(true);
    };

    const closeDecisionModal = () => {
        setShowDecisionModal(false);
        setDecisionType(null);
    };

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: (values: ApplicationApproveValues) => ApproveStudentApplicantion(values),
        onSuccess: (_, variables) => {
            toastSuccess("Application approved successfully");
            queryClient.invalidateQueries({
                queryKey: ['application', variables.application_id]
            });
            closeDecisionModal();
        },
        onError: (error) => {
            console.error('Approval failed:', error);
            toastApiError("Failed to approve application");
        }
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: (values: ApplicationRejectValues) => RejectStudentApplicantion(values),
        onSuccess: (_, variables) => {
            toastSuccess("Application rejected");
            queryClient.invalidateQueries({
                queryKey: ['application', variables.application_id]
            });
            closeDecisionModal();
        },
        onError: (error) => {
            console.error('Rejection failed:', error);
            toastApiError("Failed to reject application");
        }
    });

    return (
        <ApplicationReviewContext.Provider
            value={{
                showDecisionModal,
                decisionType,
                openDecisionModal,
                closeDecisionModal,
                approveMutation,
                rejectMutation,
            }}
        >
            {children}
        </ApplicationReviewContext.Provider>
    );
};

export const useApplicationReview = () => {
    const context = useContext(ApplicationReviewContext);
    if (!context) {
        throw new Error('useApplicationReview must be used within ApplicationReviewProvider');
    }
    return context;
};

// Simplified hook for fetching application
export const useApplication = (id: string) => {
    return useQuery<ApplicationDetailsType | null>({
        queryKey: ['application', id],
        queryFn: async () => {
            const res = await getStudentApplicantion(id);
            return res.data;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
};














// "use client";

// import { createContext, useContext, useEffect, useState } from 'react';
// import { ApplicationDetailsType } from '@/schemas/admission-schema';
// import { ApplicationApproveValues, ApplicationRejectValues } from '@/schemas/applicationReview-schema';
// import { QueryFunctionContext, useQuery, useQueryClient } from '@tanstack/react-query';
// import { ApproveStudentApplicantion, getStudentApplicantion, RejectStudentApplicantion } from '@/app/actions/applications';
// import { toastApiError, toastSuccess } from '@/lib/toastApiError';

// type ApplicationReviewContextType = {
//     // State
//     currentApplication: ApplicationDetailsType | null;
//     isLoading: boolean;
//     error: string | null;
//     showDecisionModal: boolean;
//     decisionType: 'admitted' | 'not_admitted' | '';
//     isRefetching: boolean;

//     // Methods
//     setCurrentApplication: (application: ApplicationDetailsType | null) => void;
//     handleDecision: (type: 'admitted' | 'not_admitted') => void;
//     closeDecisionModal: () => void;
//     submitDecision: (values?: ApplicationRejectValues | ApplicationApproveValues) => Promise<void>;
//     refetchApplication: () => Promise<void>;
// };

// const ApplicationReviewContext = createContext<ApplicationReviewContextType | undefined>(undefined);

// export const ApplicationReviewProvider = ({ children }: { children: React.ReactNode }) => {
//     const [currentApplication, setCurrentApplication] = useState<ApplicationDetailsType | null>(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const [isRefetching, setIsRefetching] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [showDecisionModal, setShowDecisionModal] = useState(false);
//     const [decisionType, setDecisionType] = useState<'admitted' | 'not_admitted' | ''>('');
//     const queryClient = useQueryClient();

//     const handleDecision = (type: 'admitted' | 'not_admitted') => {
//         setDecisionType(type);
//         setShowDecisionModal(true);
//     };

//     const closeDecisionModal = () => {
//         setShowDecisionModal(false);
//         setDecisionType('');
//     };

//     const refetchApplication = async () => {
//         if (!currentApplication?.id) return;

//         setIsRefetching(true);
//         try {
//             await queryClient.invalidateQueries({
//                 queryKey: ['getStudentApplication', String(currentApplication.id)]
//             });
//             await queryClient.refetchQueries({
//                 queryKey: ['getStudentApplication', String(currentApplication.id)]
//             });
//         } catch (error) {
//             console.error('Failed to refetch application:', error);
//         } finally {
//             setIsRefetching(false);
//         }
//     };

//     const submitDecision = async (values?: ApplicationRejectValues | ApplicationApproveValues) => {
//         try {
//             setIsLoading(true);

//             if (decisionType === 'admitted') {
//                 if (!currentApplication) return;
//                 await ApproveStudentApplicantion(values as ApplicationApproveValues);
//                 toastSuccess("Admission Approved Succesfully")
//             } else if (decisionType === 'not_admitted' && values) {
//                 if (!currentApplication?.id) return;
//                 await RejectStudentApplicantion(values as ApplicationRejectValues);
//                 toastApiError("Something went wrong")
//             }

//             // Refresh data after decision
//             await refetchApplication();
//             closeDecisionModal();
//         } catch (err) {
//             setError('Failed to process decision');
//             console.error(err);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <ApplicationReviewContext.Provider
//             value={{
//                 currentApplication,
//                 isLoading,
//                 isRefetching,
//                 error,
//                 showDecisionModal,
//                 decisionType,
//                 setCurrentApplication,
//                 handleDecision,
//                 closeDecisionModal,
//                 submitDecision,
//                 refetchApplication,
//             }}
//         >
//             {children}
//         </ApplicationReviewContext.Provider>
//     );
// };

// export const useApplicationReview = () => {
//     const context = useContext(ApplicationReviewContext);
//     if (!context) {
//         throw new Error('useApplicationReview must be used within an ApplicationReviewProvider');
//     }
//     return context;
// };

// export const useApplicationQuery = (id: string) => {
//     const { setCurrentApplication } = useApplicationReview();
//     const queryClient = useQueryClient();

//     const fetchApplication = async (
//         ctx: QueryFunctionContext<['getStudentApplication', string]>
//     ): Promise<ApplicationDetailsType | null> => {
//         const res = await getStudentApplicantion(ctx.queryKey[1]);
//         return res.data;
//     };

//     const query = useQuery<
//         ApplicationDetailsType | null,
//         Error,
//         ApplicationDetailsType,
//         ['getStudentApplication', string]
//     >({
//         queryKey: ['getStudentApplication', id],
//         queryFn: fetchApplication,
//         enabled: !!id,
//         staleTime: 5 * 60 * 1000,
//         gcTime: 10 * 60 * 1000,
//     });

//     // Handle side effects
//     useEffect(() => {
//         if (query.data !== undefined) {
//             setCurrentApplication(query.data);
//         }
//     }, [query.data, setCurrentApplication]);

//     useEffect(() => {
//         if (query.error) {
//             setCurrentApplication(null);
//             console.error('Failed to fetch application:', query.error);
//         }
//     }, [query.error, setCurrentApplication]);

//     return {
//         ...query,
//         refetch: async () => {
//             await queryClient.invalidateQueries({
//                 queryKey: ['getStudentApplication', id]
//             });
//             return query.refetch();
//         }
//     };
// };