import z from "zod";

export const applicationReview = z.object({
    reason: z.string().min(1, "Reason for rejection is required"),
});

export type ApplicationReviewFormValues = z.infer<typeof applicationReview>;