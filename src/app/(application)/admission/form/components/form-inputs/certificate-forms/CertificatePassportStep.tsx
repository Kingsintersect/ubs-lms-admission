"use client";

import Fade from '@/components/application/animatives/Fade';
import { FileUploader } from '@/components/forms/FileUploader';
import { FormField } from '@/components/forms/FormField';
import { ApplicationFormData } from '@/schemas/admission-schema';
import React, { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { TermsAndConditionsTrigger } from '../TermsAndConditionsContent';

interface CertificatePassportStepProps {
    form: UseFormReturn<ApplicationFormData>;
    setILunched: (value: boolean) => void;
}

export const CertificatePassportStep: FC<CertificatePassportStepProps> = ({ form, setILunched }) => {
    const { control, watch, formState: { errors } } = form;
    const has_disability = watch("has_disability");

    return (
        <div className="space-y-7">
            <div className="w-full flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="w-full sm:w-1/2 space-y-4 sm:px-20">
                    <FileUploader
                        name="passport"
                        control={control}
                        label="Passport photograph"
                        required={true}
                        accept="image/*"
                        maxSize={1}
                        multiple={false}
                    />
                </div>

                <div className="w-full sm:w-1/2 flex justify-start sm:justify-center items-center my-auto">
                    <div className="text-sm sm:text-base">
                        ( Current session - <span className="text-site-a-dark font-semibold">2025 / 2026</span> )
                    </div>
                </div>
            </div>

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

            <div className="border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
                I hereby declare that the information I have supplied above is true to the best of my knowledge,
                and withholding any information or/and giving false information automatically disqualifies me from
                gaining admission.
            </div>

            <div className="flex items-center gap-5">
                <FormField
                    name="agreeToTerms"
                    control={control}
                    errors={errors}
                    label="I agree to the terms and conditions *"
                    type="checkbox"
                />
                <TermsAndConditionsTrigger
                    className="text-sm text-blue-600 font-bold animate-bounce mt-2"
                    setILunched={setILunched}
                />
            </div>
        </div>
    );
};
