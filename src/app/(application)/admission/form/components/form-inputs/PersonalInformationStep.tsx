import { AdmissionFormData } from "@/schemas/admission-schema";
import { FormField } from "../FormField";
import { Control, FieldErrors } from "react-hook-form";
import { GENDER, LocalGovArea, RELIGION } from "../../constants";

export const PersonalInformationStep: React.FC<{ control: Control<AdmissionFormData>; errors: FieldErrors<AdmissionFormData> }> = ({ control, errors }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                name="lga"
                control={control}
                errors={errors}
                label="Local Government Area"
                required
                type="select"
                placeholder="Select Local Government Area"
                options={LocalGovArea}
            />
            <FormField
                name="religion"
                control={control}
                errors={errors}
                label="Religion"
                required
                type="select"
                placeholder="Select Religion"
                options={RELIGION}
            />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                name="dob"
                control={control}
                errors={errors}
                label="Date of Birth"
                required
                type="date"
            />
            <FormField
                name="gender"
                control={control}
                errors={errors}
                label="Gender"
                required
                type="select"
                placeholder="Select Your Gender"
                options={GENDER}
            />
        </div>

        <FormField
            name="hometown"
            control={control}
            errors={errors}
            label="Home town"
            required
            placeholder="e.g. Awka, Enugu..."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                name="hometown_address"
                control={control}
                errors={errors}
                label="Home town address"
                required
                placeholder="e.g. 123 Hometown St, City, State"
            />
            <FormField
                name="contact_address"
                control={control}
                errors={errors}
                label="Contact Address"
                required
                placeholder="+234 8123456780"
            />
        </div>
    </div>
);
