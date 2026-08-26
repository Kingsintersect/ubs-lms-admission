"use client";

import { FormField } from '@/components/forms/FormField';
import { ApplicationFormData } from '@/schemas/admission-schema';
import { Path, UseFormReturn } from 'react-hook-form';
import React, { FC } from 'react';

interface CertificateInstitutionsStepProps {
    form: UseFormReturn<ApplicationFormData>;
}

const INSTITUTION_ROWS: { name: 'postgraduate_institution' | 'first_degree_institution' | 'ssce_institution'; label: string }[] = [
    { name: 'postgraduate_institution', label: 'Postgraduate Degree' },
    { name: 'first_degree_institution', label: 'First Degree' },
    { name: 'ssce_institution', label: 'SSCE' },
];

export const CertificateInstitutionsStep: FC<CertificateInstitutionsStepProps> = ({ form }) => {
    const { control, formState: { errors } } = form;

    return (
        <div className="space-y-10">
            <div>
                <h3 className="text-lg font-semibold mb-1">Institution(s) Attended</h3>
                <p className="text-sm text-gray-500 mb-4">With date(s) and certificate(s) obtained</p>

                <div className="space-y-8">
                    {INSTITUTION_ROWS.map(({ name, label }) => (
                        <div key={name} className="border border-gray-200 rounded-xl p-5 space-y-4">
                            <h4 className="font-semibold text-gray-700">{label}</h4>
                            <FormField
                                name={`${name}.name_of_institution` as Path<ApplicationFormData>}
                                control={control}
                                errors={errors}
                                label="Name of Institution"
                                placeholder="e.g. Nnamdi Azikiwe University"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    name={`${name}.from` as Path<ApplicationFormData>}
                                    control={control}
                                    errors={errors}
                                    label="From"
                                    type="date"
                                />
                                <FormField
                                    name={`${name}.to` as Path<ApplicationFormData>}
                                    control={control}
                                    errors={errors}
                                    label="To"
                                    type="date"
                                />
                            </div>
                            <FormField
                                name={`${name}.certificate_obtained` as Path<ApplicationFormData>}
                                control={control}
                                errors={errors}
                                label="Degree / Diploma / Certificate Obtained"
                                placeholder="e.g. Second Class Upper..."
                            />
                            <FormField
                                name={`${name}.course_of_study` as Path<ApplicationFormData>}
                                control={control}
                                errors={errors}
                                label="Course of Study"
                                placeholder="e.g. Business Administration"
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Place of Work</h3>
                <div className="space-y-4">
                    <FormField
                        name="organization_name"
                        control={control}
                        errors={errors}
                        label="Name of Organization"
                        placeholder="e.g. Zenith Bank Plc"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            name="employment_from"
                            control={control}
                            errors={errors}
                            label="From"
                            type="date"
                        />
                        <FormField
                            name="employment_to"
                            control={control}
                            errors={errors}
                            label="To"
                            type="date"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
