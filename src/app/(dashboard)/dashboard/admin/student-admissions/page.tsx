"use client";

import { useApplications } from "@/hooks/useApplications";
import { ApplicationCard } from "./components/ApplicationCard";
import { ApplicationFilters } from "./components/ApplicationFilters";

export default function ApplicationsPage() {
    const {
        applications,
        isLoading,
        error,
        filters,
        setFilters,
    } = useApplications();

    if (isLoading) return <div>Loading applications...</div>;
    if (error) return <div>Error loading applications</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Applications</h1>
                <ApplicationFilters filters={filters} onFilterChange={setFilters} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {applications?.map((application, i) => (
                    <ApplicationCard key={i} application={application} />
                ))}
            </div>

            {applications?.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No applications found</p>
                </div>
            )}
        </div>
    );
}