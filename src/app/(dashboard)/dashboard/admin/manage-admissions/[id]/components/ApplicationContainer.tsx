"use client";

import { useQuery } from '@tanstack/react-query';
import { ApplicationDetails } from './ApplicationDetails';
import { DecisionModal } from './DecisionModal';
import { useState } from 'react';
import { getStudentApplicantion } from '@/app/actions/applications';
import { ApplicationDetailsType } from '@/schemas/admission-schema';

export const ApplicationContainer = ({ id }) => {
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [decisionType, setDecisionType] = useState('');

    const handleDecision = (type) => {
        setDecisionType(type);
        setShowDecisionModal(true);
    };

    const submitDecision = () => {
        setShowDecisionModal(false);
    };

    const { data: application, isLoading, error } = useQuery<ApplicationDetailsType | null>({
        queryKey: ["getStudentApplication", id],
        queryFn: async () => {
            const res = await getStudentApplicantion(id);
            return res.data;
        },
        enabled: !!id,
    });

    return (

        <div className="max-w-7xl mx-auto px-4 py-6">
            <ApplicationDetails
                isLoading={isLoading}
                error={error}
                application={application}
                handleDecision={handleDecision}
            />

            {showDecisionModal && (
                <DecisionModal
                    decisionType={decisionType}
                    setShowDecisionModal={setShowDecisionModal}
                    submitDecision={submitDecision}
                    application={application}
                />
            )}
        </div>
    );
};
