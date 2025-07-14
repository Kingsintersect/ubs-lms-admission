import { AdmissionFormData } from "@/schemas/admission-schema";
import { FormField } from "../FormField";
import { Control, FieldErrors } from "react-hook-form";

export const SponsorInformationStep: React.FC<{ control: Control<AdmissionFormData>; errors: FieldErrors<AdmissionFormData> }> = ({ control, errors }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                name="sponsor_name"
                control={control}
                errors={errors}
                label="Sponsor's Full Name"
                required
                placeholder="e.g. Ani Chukwu..."
            />
            <FormField
                name="sponsor_relationship"
                control={control}
                errors={errors}
                label="Relationship with Sponsor"
                required
                placeholder="e.g. Father, Mother, Guardian"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                name="sponsor_email"
                control={control}
                errors={errors}
                label="Sponsor's Email"
                required
                placeholder="e.g. sponsor@gmail.com"
            />
            <FormField
                name="sponsor_phone_number"
                control={control}
                errors={errors}
                label="Sponsor's Phone Number"
                required
                placeholder="+234 8123456780"
            />
        </div>

        <FormField
            name="sponsor_contact_address"
            control={control}
            errors={errors}
            label="Sponsor's Contact Address"
            required
            placeholder="e.g. 123 Sponsor St, City, State"
        />
    </div>
);