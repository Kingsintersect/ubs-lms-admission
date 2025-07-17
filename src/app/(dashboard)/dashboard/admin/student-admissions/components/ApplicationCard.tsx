import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { Application } from "@/types/application";

interface ApplicationCardProps {
    application: Application;
}

export function ApplicationCard({ application }: ApplicationCardProps) {

    return (
        <div className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium">
                        {"applicant.first_name"}{" "}
                        {"pplicant.last_name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Applied on {"application.created_at"}
                    </p>
                </div>
                <ApplicationStatusBadge status={"ACCEPTED"} />
            </div>

            <div className="space-y-1 text-sm">
                <p>
                    <span className="text-muted-foreground">Program:</span>{" "}
                    {"application.program"}
                </p>
                <p>
                    <span className="text-muted-foreground">Study Mode:</span>{" "}
                    {"application.studyMode"}
                </p>
                <p>
                    <span className="text-muted-foreground">Start Term:</span>{" "}
                    {"application.startTerm"}
                </p>
            </div>

            <div className="flex justify-end pt-2">
                <Button asChild size="sm">
                    <Link href={`/applications/${application.id}`}>Review</Link>
                </Button>
            </div>
        </div>
    );
} 