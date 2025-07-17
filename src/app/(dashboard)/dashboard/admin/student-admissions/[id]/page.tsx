import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ReviewForm } from "../components/ReviewForm";
import { ApplicationStatusBadge } from "../components/ApplicationStatusBadge";
import { getApplicationById } from '@/app/actions/applications';
import { PageTypeProps } from "@/config";

export async function generateMetadata({ params }: PageTypeProps): Promise<Metadata> {
    const { id } = await params;
    const application = await getApplicationById(id);
    return {
        title: `Review Application - ${application?.personalInfo?.firstName} ${application?.personalInfo?.lastName}`,
    };
}

export default async function ApplicationReviewPage({ params }: PageTypeProps) {
    const { id } = await params;
    const application = await getApplicationById(id);

    if (!application) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                    Reviewing {application.personalInfo.firstName}{" "}
                    {application.personalInfo.lastName}'s Application
                </h1>
                <ApplicationStatusBadge status={application.status} />
            </div>

            <ReviewForm application={application} />
        </div>
    );
}