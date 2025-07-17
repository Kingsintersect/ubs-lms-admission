"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateApplicationStatus } from "@/app/actions/applications";
import z from "zod";
import { ApplicationSections } from "./ApplicationSections";
import { FormSelect } from "./form/form-select";
import { FormTextarea } from "./form/form-textarea";
import { Application } from "@/types/application";
import { reviewSchema } from "@/schemas/review-schema";

interface ReviewFormProps {
    application: Application;
}

export function ReviewForm({ application }: ReviewFormProps) {
    const queryClient = useQueryClient();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            status: application.status,
            decisionComments: application.decisionComments || "",
        },
    });

    const mutation = useMutation({
        mutationFn: updateApplicationStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["applications"] });
            toast.success("Application status updated");
            router.push("/applications");
        },
        onError: (error) => {
            toast.error("Failed to update application", {
                description: error.message,
            });
        },
    });

    const onSubmit = (values: z.infer<typeof reviewSchema>) => {
        mutation.mutate({
            applicationId: application.id,
            ...values,
        });
    };

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
                <ApplicationSections application={application} />
            </div>

            <div className="md:col-span-1">
                <div className="border rounded-lg p-6 space-y-6 sticky top-6">
                    <h2 className="text-lg font-semibold">Admission Decision</h2>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormSelect
                                control={form.control}
                                name="status"
                                label="Decision"
                                options={[
                                    { value: "PENDING", label: "Pending" },
                                    { value: "UNDER_REVIEW", label: "Under Review" },
                                    { value: "ACCEPTED", label: "Accepted" },
                                    { value: "REJECTED", label: "Rejected" },
                                    { value: "WAITLISTED", label: "Waitlisted" },
                                ]}
                            />

                            <FormTextarea
                                control={form.control}
                                name="decisionComments"
                                label="Comments"
                                placeholder="Add any comments about your decision..."
                            />

                            <div className="flex gap-2 pt-2">
                                <Button type="submit" disabled={mutation.isPending}>
                                    {mutation.isPending ? "Saving..." : "Save Decision"}
                                </Button>
                                <Button variant="outline" type="button">
                                    Download PDF
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}