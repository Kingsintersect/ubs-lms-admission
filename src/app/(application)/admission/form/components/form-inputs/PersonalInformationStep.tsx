import { UseFormReturn } from "react-hook-form";
import { FormField } from "@/components/forms/FormField";
import { GENDER, MARITAL_STATUS, RELIGION } from "@/components/forms/applicationFormConstants";
import { Nationality, State } from "@/config";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchLocalGovermentAreas } from "@/hooks/useExternalPrograms";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { ApplicationFormData } from "@/schemas/admission-schema";
import { ProgramType } from "@/config";

interface PersonalInformationStepProps {
    form: UseFormReturn<ApplicationFormData>;
    programType: ProgramType;
}

export const PersonalInformationStep: React.FC<PersonalInformationStepProps> = ({ form, programType }) => {
    const isCertificate = programType === ProgramType.CERTIFICATE;
    const { user, loading } = useAuth();
    const { control, formState: { errors } } = form;

    const {
        data: localGovAreas,
        isLoading,
        isError,
    } = useFetchLocalGovermentAreas(user?.state ?? undefined, {
        enabled: !!user?.state && !loading,
    });

    if (isLoading) return (
        <div className='w-full flex items-center justify-center'>
            <LoadingSpinner size="lg" className="mr-2" />
            Loading Local Gov Areas...
        </div>
    );

    if (isError && !localGovAreas) return (
        <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Failed to load Local Gov Areas.</AlertTitle>
            <AlertDescription>
                <p>Please check your network connection and try again.</p>
            </AlertDescription>
        </Alert>
    );

    const lgaOptions = localGovAreas?.map((lga) => ({
        value: String(lga.name),
        label: lga.name.trim(),
    })) ?? [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    name="lga"
                    control={form.control}
                    errors={errors}
                    label="Local Government Area"
                    required
                    type="select"
                    placeholder="Select Local Government Area"
                    options={lgaOptions}
                />
                {isCertificate ? (
                    <FormField
                        name="state"
                        control={control}
                        errors={errors}
                        label="State"
                        required
                        type="select"
                        placeholder="Select State"
                        options={State.map(s => ({ value: String(s.value), label: String(s.label) }))}
                    />
                ) : (
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
                )}
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
                    label={isCertificate ? "Sex" : "Gender"}
                    required
                    type="select"
                    placeholder="Select Your Gender"
                    options={GENDER}
                />
            </div>

            {isCertificate ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        name="marital_status"
                        control={control}
                        errors={errors}
                        label="Marital Status"
                        required
                        type="select"
                        placeholder="Select Marital Status"
                        options={MARITAL_STATUS}
                    />
                    <FormField
                        name="nationality"
                        control={control}
                        errors={errors}
                        label="Nationality"
                        required
                        type="select"
                        placeholder="Select Nationality"
                        options={Nationality.map(n => ({ value: String(n.value), label: String(n.label) }))}
                    />
                </div>
            ) : (
                <FormField
                    name="hometown"
                    control={control}
                    errors={errors}
                    label="Home town"
                    required
                    placeholder="e.g. Awka, Enugu..."
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    name="hometown_address"
                    control={control}
                    errors={errors}
                    label={isCertificate ? "Home Address" : "Home town address"}
                    required
                    placeholder="e.g. 123 Hometown St, City, State"
                />
                <FormField
                    name="contact_address"
                    control={control}
                    errors={errors}
                    label="Residential Address"
                    required
                    placeholder="+234 8123456780"
                />
            </div>
        </div>
    );
};
