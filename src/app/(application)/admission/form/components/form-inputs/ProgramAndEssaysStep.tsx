import { Control, FieldErrors, UseFormReturn } from "react-hook-form";
import { STUDY_MODES } from "../../constants";
import { FormField } from "../FormField";
import { AdmissionFormData } from "@/schemas/admission-schema";
import { useExternalPrograms } from "@/hooks/useExternalPrograms";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { PhotoUploader } from "./PhotoUploader";

interface ProgramAndEssaysStepProps {
    control: Control<AdmissionFormData>;
    errors: FieldErrors<AdmissionFormData>;
    setValue: UseFormReturn<AdmissionFormData>['setValue'];
}
export const ProgramAndEssaysStep: React.FC<ProgramAndEssaysStepProps> = ({ control, errors, setValue }) => {
    const { data: programs, isLoading, isError } = useExternalPrograms();

    if (isLoading) return (
        <div className='w-full flex items-center justify-center'>
            <LoadingSpinner size="md" className="mr-2" />
            Loading Programs...
        </div>
    );
    if (isError || !programs) return (
        <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Failed to load programs.</AlertTitle>
            <AlertDescription>
                <p>Please check your network connection and try again.</p>
            </AlertDescription>
        </Alert>
    );

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
                    <div className="">( Current session - <span className="text-site-a-dark font-bold"> 2024 / 2025</span> )</div>
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
                    name="disability"
                    control={control}
                    errors={errors}
                    label="I have disabilities that may require accommodations"
                    type="checkbox"
                />
                <FormField
                    name="requiresVisa"
                    control={control}
                    errors={errors}
                    label="I require a student visa to study"
                    type="checkbox"
                />
                <FormField
                    name="agreeToTerms"
                    control={control}
                    errors={errors}
                    label="I agree to the terms and conditions *"
                    type="checkbox"
                />
            </div>
        </div>
    );
}