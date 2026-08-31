"use client";

import { useEffect } from 'react';
import { useApplication, useApplicationReview } from '@/contexts/ApplicationReviewContext';
import { ApplicationDetails } from './ApplicationDetails';
import { DecisionModal } from './DecisionModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertCircleIcon } from 'lucide-react';
import { admissionDecitionActionData, ApplicationApproveValues, ApplicationRejectValues } from '@/schemas/applicationReview-schema';
import { resolveApplicationProgramType } from '@/schemas/admission-schema';
import { useAppContext } from '@/contexts/AppContext';

export const ApplicationContainer = ({ id }: { id: string }) => {
    const { data: application, isLoading, error } = useApplication(id);
    const {
        showDecisionModal,
        decisionType,
        closeDecisionModal,
        approveMutation,
        rejectMutation,
    } = useApplicationReview();
    const { setActiveProgramType } = useAppContext();

    // The rest of this review page (ProgramInfo, QualificationDocuments,
    // CareerGoalsInfo, PersonalStatementInfo, WorkExperienceInfo, ...) reads
    // AppContext's `isUBS`/`isODL` flags to decide which fields to show. Sync
    // that flag to *this application's* programme - not the logged-in
    // viewer's own, since an admin reviewing a student's application isn't
    // enrolled in that programme themselves.
    useEffect(() => {
        if (application) {
            setActiveProgramType(resolveApplicationProgramType(application));
        }
    }, [application, setActiveProgramType]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-gray-600">Loading application...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load application. Please try again.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!application || !application.application) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-6">
                <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>No application data found.</AlertTitle>
                    <AlertDescription>
                        <p>Please verify that the student has submitted his application.</p>
                        <ul className="list-inside list-disc text-sm">
                            <li>Contact the project support team</li>
                            <li>Ensure sufficient funds</li>
                            <li>Verify billing address</li>
                        </ul>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    const handleSubmitDecision = async (values: admissionDecitionActionData | undefined) => {
        if (decisionType === 'ADMITTED') {
            await approveMutation.mutateAsync(values as ApplicationApproveValues);
        } else if (decisionType === 'NOT_ADMITTED') {
            await rejectMutation.mutateAsync(values as ApplicationRejectValues);
        }
    };

    const isSubmitting = approveMutation.isPending || rejectMutation.isPending;

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <ApplicationDetails application={application} />

            {showDecisionModal && decisionType && (
                <DecisionModal
                    decisionType={decisionType}
                    application={application}
                    onClose={closeDecisionModal}
                    onSubmit={handleSubmitDecision}
                    isLoading={isSubmitting}
                />
            )}
        </div>
    );
};
