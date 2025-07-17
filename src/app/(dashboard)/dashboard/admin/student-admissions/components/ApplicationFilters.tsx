"use client";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ApplicationFiltersProps {
    filters: Record<string, string>;
    onFilterChange: (filters: Record<string, string>) => void;
}

export function ApplicationFilters({
    filters,
    onFilterChange,
}: ApplicationFiltersProps) {
    const handleChange = (key: string, value: string) => {
        onFilterChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex gap-2">
            <Input
                placeholder="Search..."
                className="w-[180px]"
                value={filters.search || ""}
                onChange={(e) => handleChange("search", e.target.value)}
            />
            <Select
                value={filters.status || ""}
                onValueChange={(value) => handleChange("status", value)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="ACCEPTED">Accepted</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="WAITLISTED">Waitlisted</SelectItem>
                </SelectContent>
            </Select>
            <Select
                value={filters.program || ""}
                onValueChange={(value) => handleChange("program", value)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Programs</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="EMBA">EMBA</SelectItem>
                    <SelectItem value="PhD">PhD</SelectItem>
                    <SelectItem value="MSc">MSc</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}