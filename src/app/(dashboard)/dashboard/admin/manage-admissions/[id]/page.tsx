"use client";

import { useParams } from 'next/navigation';
import { ApplicationContainer } from './components/ApplicationContainer';
import { ApplicationReviewProvider } from '@/contexts/ApplicationReviewContext';
import { ApplicationReviewHeader } from './components/ApplicationReviewHeader';

const ViewStudentAdmission = () => {
    const params = useParams();
    const id = params?.id as string;

    return (
        <div className="min-h-screen bg-gray-50">
            <ApplicationReviewProvider>
                <ApplicationReviewHeader />
                <ApplicationContainer id={id} />
            </ApplicationReviewProvider>
        </div>
    );
};

export default ViewStudentAdmission;
