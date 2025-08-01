import { Control, FieldErrors, UseFormReturn, UseFormWatch } from "react-hook-form";
import { AdmissionFormData } from "@/schemas/admission-schema";
import Link from "next/link";
import Fade from "@/components/application/animatives/Fade";
import { PhotoUploader } from "@/components/forms/PhotoUploader";
import { FormField } from "@/components/forms/FormField";
import { STUDY_MODES } from "@/components/forms/applicationFormConstants";

interface ProgramAndEssaysStepProps {
    control: Control<AdmissionFormData>;
    errors: FieldErrors<AdmissionFormData>;
    setValue: UseFormReturn<AdmissionFormData>['setValue'];
    watch: UseFormWatch<AdmissionFormData>;
}
export const ProgramAndEssaysStep: React.FC<ProgramAndEssaysStepProps> = ({ control, errors, setValue, watch }) => {
    const has_disability = watch("has_disability");
    return (
        <div className="space-y-6">
            <div className="w-fill flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-around">
                {/* Document Upload */}
                <div className="space-y-6">
                    <PhotoUploader
                        onFileChange={(file) => setValue('passportPhoto', file ?? undefined)}
                        error={errors.passportPhoto?.message}
                        setValue={setValue}
                    />
                </div>
                <div className=" flex flex-col gap-4">
                    <div className="">( Current session - <span className="text-site-a-dark font-bold"> 2025 / 2026</span> )</div>
                </div>
            </div>

            <FormField
                name="studyMode"
                control={control}
                errors={errors}
                label="Study Mode (Online only available for now)"
                required
                type="radio"
                options={STUDY_MODES}
            />

            <FormField
                name="personalStatement"
                control={control}
                errors={errors}
                label="Personal Statement"
                required
                type="textarea"
                placeholder="Tell us about yourself, your background, and why you want to pursue this program..."
                rows={6}
            />

            <FormField
                name="careerGoals"
                control={control}
                errors={errors}
                label="Career Goals"
                required
                type="textarea"
                placeholder="Describe your short-term and long-term career goals..."
                rows={6}
            />

            <div className="space-y-4">
                <FormField
                    name="has_disability"
                    control={control}
                    errors={errors}
                    label="I have disabilities"
                    type="checkbox"
                />
                <Fade duration={200} in={has_disability}>
                    <FormField
                        name="disability"
                        control={control}
                        errors={errors}
                        label="Explain disability"
                        required
                        type="textarea"
                        placeholder="Describe the nature of your disability..."
                        rows={6}
                    />
                </Fade>
            </div>

            <div className="flex items-center gap-5">
                <FormField
                    name="agreeToTerms"
                    control={control}
                    errors={errors}
                    label="I agree to the terms and conditions *"
                    type="checkbox"
                />
                <Link className="block text-sm text-blue-600 font-bold animate-bounce mt-2" href={"/admission/terms-and-conditions"}>Read the terms and conditions</Link>
            </div>
        </div>
    );
}