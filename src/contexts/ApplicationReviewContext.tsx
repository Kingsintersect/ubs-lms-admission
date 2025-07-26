// contexts/ApplicationReviewContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { ApplicationDetailsType } from '@/schemas/admission-schema';
import { ApplicationReviewFormValues } from '@/schemas/applicationReview-schema';
import { QueryFunctionContext, useQuery } from '@tanstack/react-query';
import { getStudentApplicantion } from '@/app/actions/applications';

type ApplicationReviewContextType = {
    // State
    currentApplication: ApplicationDetailsType | null;
    isLoading: boolean;
    error: string | null;
    showDecisionModal: boolean;
    decisionType: 'admitted' | 'not_admitted' | '';

    // Methods
    setCurrentApplication: (application: ApplicationDetailsType | null) => void;
    handleDecision: (type: 'admitted' | 'not_admitted') => void;
    closeDecisionModal: () => void;
    submitDecision: (values?: ApplicationReviewFormValues) => Promise<void>;
};

const ApplicationReviewContext = createContext<ApplicationReviewContextType | undefined>(undefined);

export const ApplicationReviewProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentApplication, setCurrentApplication] = useState<ApplicationDetailsType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [decisionType, setDecisionType] = useState<'admitted' | 'not_admitted' | ''>('');

    const handleDecision = (type: 'admitted' | 'not_admitted') => {
        setDecisionType(type);
        setShowDecisionModal(true);
    };

    const closeDecisionModal = () => {
        setShowDecisionModal(false);
        setDecisionType('');
    };

    const submitDecision = async (values?: ApplicationReviewFormValues) => {
        try {
            setIsLoading(true);

            if (decisionType === 'admitted') {
                // Handle approval logic
                if (!currentApplication) return;

                // Call your approval API here
                // await approveApplication(currentApplication.id, {
                //   program: currentApplication.program,
                //   program_id: String(currentApplication.program_id),
                //   semester: "1SM",
                //   academic_session: currentApplication.academic_session
                // });
            } else if (decisionType === 'not_admitted' && values) {
                // Handle rejection logic
                if (!currentApplication?.id) return;

                // Call your rejection API here
                // await rejectApplication({
                //   ...values,
                //   application_id: currentApplication.id
                // });
            }

            closeDecisionModal();
        } catch (err) {
            setError('Failed to process decision');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ApplicationReviewContext.Provider
            value={{
                currentApplication,
                isLoading,
                error,
                showDecisionModal,
                decisionType,
                setCurrentApplication,
                handleDecision,
                closeDecisionModal,
                submitDecision,
            }}
        >
            {children}
        </ApplicationReviewContext.Provider>
    );
};

export const useApplicationReview = () => {
    const context = useContext(ApplicationReviewContext);
    if (!context) {
        throw new Error('useApplicationReview must be used within an ApplicationReviewProvider');
    }
    return context;
};


export const useApplicationQuery = (id: string) => {
    const { setCurrentApplication } = useApplicationReview();

    const fetchApplication = async (
        ctx: QueryFunctionContext<['getStudentApplication', string]>
    ): Promise<ApplicationDetailsType | null> => {
        const res = await getStudentApplicantion(ctx.queryKey[1]);
        return res.data;
    };

    const query = useQuery<
        ApplicationDetailsType | null,
        Error,
        ApplicationDetailsType,
        ['getStudentApplication', string]
    >({
        queryKey: ['getStudentApplication', id],
        queryFn: fetchApplication,
        enabled: !!id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });

    // Handle side effects
    useEffect(() => {
        if (query.data !== undefined) {
            setCurrentApplication(query.data);
        }
    }, [query.data, setCurrentApplication]);

    useEffect(() => {
        if (query.error) {
            setCurrentApplication(null);
            console.error('Failed to fetch application:', query.error);
        }
    }, [query.error, setCurrentApplication]);

    return query;
};