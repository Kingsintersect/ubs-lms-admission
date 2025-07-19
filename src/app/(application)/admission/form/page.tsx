"use client";

import { submitAdmissionForm } from "@/app/actions/admission-actions";
import { AdmissionFormData, admissionSchema } from "@/schemas/admission-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2, LogOut } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { STEPS } from "./constants";
import { PersonalInformationStep } from "./components/form-inputs/PersonalInformationStep";
import { AcademicBackgroundStep } from "./components/form-inputs/AcademicBackgroundStep";
import { ProfessionalExperienceStep } from "./components/form-inputs/ProfessionalExperienceStep";
import { ProgramAndEssaysStep } from "./components/form-inputs/ProgramAndEssaysStep";
import { SuccessScreen } from "./components/SuccessScreen";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { SponsorInformationStep } from "./components/form-inputs/SponsorInformationStep";
import { getFriendlyError } from '@/lib/errorsHandler';

const AdmissionForm: React.FC = () => {
    const { logout, access_token, updateUser, refreshUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
        trigger,
        reset,
        setValue,
        getValues,
        watch,
    } = useForm<AdmissionFormData>({
        resolver: zodResolver(admissionSchema),
        mode: 'onChange',
        defaultValues: {
            disability: false,
            requiresVisa: false,
            agreeToTerms: false,
            startTerm: "2024/2025",
            studyMode: 'online',
            awaiting_result: true,
            program: "",
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: AdmissionFormData) => {
            if (!access_token || typeof access_token !== 'string') {
                throw new Error("Missing access token");
            }
            return submitAdmissionForm(data, access_token);
        },
        onSuccess: async () => {
            setIsSubmitted(true);
            await refreshUser();
            updateUser({ is_applied: Number(true) });
        },
    });

    const nextStep = async () => {
        const fieldsToValidate = STEPS[currentStep].fields;
        const isStepValid = await trigger(fieldsToValidate);

        if (isStepValid && currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const onSubmit = (data: AdmissionFormData) => {
        if (typeof access_token === 'string' && access_token.trim() !== '') {
            mutation.mutate(data);
        } else {
            toast.error("Access token is missing or invalid");
        }
    };

    const handleReset = () => {
        setIsSubmitted(false);
        setCurrentStep(0);
        reset();
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 0:
                return <PersonalInformationStep control={control} errors={errors} />;
            case 1:
                return <SponsorInformationStep control={control} errors={errors} />;
            case 2:
                return <AcademicBackgroundStep control={control} errors={errors} setValue={setValue} />;
            case 3:
                return <ProfessionalExperienceStep control={control} errors={errors} />;
            case 4:
                return <ProgramAndEssaysStep control={control} errors={errors} setValue={setValue} getValues={getValues} watch={watch} />;
            default:
                return null;
        }
    };

    if (isSubmitted) {
        return <SuccessScreen onReset={handleReset} />;
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <button
                className="absolute right-10 top-10 z-50 flex items-center gap-3 p-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors font-bold rounded-lg shadow-md"
                onClick={logout}
            >
                Sign Out
                <LogOut className="h-5 w-5" />
            </button>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-(--color-site-b-dark) mb-2">
                        Unizik Business School Admission
                    </h1>
                    <p className="text-lg text-(--color-site-a-dark)">
                        Take the next step in your business career
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        {STEPS.map((step, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${index <= currentStep
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-400'
                                    }`}>
                                    {/* You can add an icon here if STEPS has an icon property */}
                                    <span className="font-bold">{index + 1}</span>
                                </div>
                                <span className={`text-sm font-medium ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                                    }`}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                    <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
                </div>

                {/* Form */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                        <CardTitle className="text-2xl font-semibold text-gray-900">
                            {STEPS[currentStep].title}
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                            Step {currentStep + 1} of {STEPS.length}
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {renderCurrentStep()}

                            {/* Error Display */}
                            {mutation.isError && (
                                <Alert className="border-red-200 bg-red-50">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-700">
                                        {getFriendlyError(mutation.error)}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    disabled={currentStep === 0}
                                    className="flex items-center space-x-2"
                                >
                                    <span>Previous</span>
                                </Button>

                                {currentStep < STEPS.length - 1 ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                                    >
                                        <span>Next</span>
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={!isValid || mutation.isPending}
                                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                                    >
                                        {mutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Submitting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                <span>Submit Application</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-500">
                    <p>Need help? Contact our admissions team at support@university.edu</p>
                </div>
            </div>
        </div>
    );
};

export default AdmissionForm;


// https://ubs-lms-admission.vercel.app/admission/payments/verify-admission?transAmount=35000.00&reference=1429qraR3J1752585820&transRef=O8ml0025Is14hB6g29Bm&errorMessage=Approved+by+Financial+Institution&redirectOnError=0&currency=NGN&gateway=&channelId=0&status=0