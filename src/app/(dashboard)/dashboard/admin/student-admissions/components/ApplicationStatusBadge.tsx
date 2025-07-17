import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/types/application";

interface ApplicationStatusBadgeProps {
    status: ApplicationStatus;
    className?: string;
}

const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    UNDER_REVIEW: "bg-blue-100 text-blue-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    WAITLISTED: "bg-purple-100 text-purple-800",
};

const statusLabels = {
    PENDING: "Pending",
    UNDER_REVIEW: "Under Review",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    WAITLISTED: "Waitlisted",
};

export function ApplicationStatusBadge({
    status,
    className,
}: ApplicationStatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                statusColors[status],
                className
            )}
        >
            {statusLabels[status]}
        </span>
    );
}