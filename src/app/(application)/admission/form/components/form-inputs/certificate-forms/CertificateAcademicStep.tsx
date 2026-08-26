"use client";

import { FileUploader } from '@/components/forms/FileUploader';
import { FormField } from '@/components/forms/FormField';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OLevels, Years, courses, grades } from '@/config';
import { ApplicationFormData } from '@/schemas/admission-schema';
import React, { FC } from 'react';
import { Controller, Path, UseFormReturn } from 'react-hook-form';

interface CertificateAcademicStepProps {
    form: UseFormReturn<ApplicationFormData>;
}

const SubjectGradeTable: FC<{
    form: UseFormReturn<ApplicationFormData>;
    name: 'ssce_subjects_1' | 'ssce_subjects_2';
    title: string;
}> = ({ form, name, title }) => {
    const { control, watch } = form;
    const subjectRows = watch(name) as Array<{ subject?: string } | undefined> | undefined;

    return (
        <div className="w-full">
            <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>
            <div className="space-y-3">
                {Array.from({ length: 9 }).map((_, index) => {
                    // A subject already picked on another row of this same table is
                    // disabled here, so the same subject can't be selected twice.
                    const takenByOtherRows = new Set(
                        (subjectRows ?? [])
                            .filter((_, rowIndex) => rowIndex !== index)
                            .map(row => row?.subject)
                            .filter(Boolean)
                    );

                    return (
                        <div key={index} className="grid grid-cols-[1.5rem_1fr_7rem] items-center gap-2">
                            <span className="text-sm text-gray-500">{index + 1}.</span>
                            <Controller
                                name={`${name}.${index}.subject` as Path<ApplicationFormData>}
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={(field.value as string) ?? ''}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map(course => (
                                                <SelectItem
                                                    key={course.id}
                                                    value={course.value}
                                                    disabled={takenByOtherRows.has(course.value)}
                                                >
                                                    {course.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            <Controller
                                name={`${name}.${index}.grade` as Path<ApplicationFormData>}
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={(field.value as string) ?? ''}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {grades.map(grade => (
                                                <SelectItem key={grade.id} value={grade.value}>{grade.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const CertificateAcademicStep: FC<CertificateAcademicStepProps> = ({ form }) => {
    const { control, formState: { errors }, watch } = form;
    const isAwaiting = watch('awaiting_result');

    return (
        <div className="space-y-8">
            <FormField
                name="programme_in_view"
                control={control}
                errors={errors}
                label="Programme in View"
                required
                placeholder="e.g. Certificate in Entrepreneurship Development"
            />

            <Controller
                name='awaiting_result'
                control={control}
                defaultValue={false}
                render={({ field }) => (
                    <Label
                        htmlFor='awaiting_result'
                        className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:border-green-600 has-[[aria-checked=true]]:bg-green-50"
                    >
                        <Checkbox
                            id="awaiting_result"
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(checked)}
                            className="data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white"
                        />
                        <div className="grid gap-1.5 font-normal">
                            <p className="text-sm leading-none font-medium">Awaiting Result</p>
                            <p className="text-muted-foreground text-sm">Check this if you are awaiting your SSCE results</p>
                        </div>
                    </Label>
                )}
            />

            {!isAwaiting && (
                <>
                    <hr />
                    <h3 className="text-lg font-semibold text-center">Senior School Certificate Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-700">Exam (1)</h4>
                            <FormField
                                name="ssce_exam_1_type"
                                control={control}
                                errors={errors}
                                label="Exam Type"
                                required
                                type="select"
                                placeholder="e.g WAEC, NECO, GCE..."
                                options={OLevels}
                            />
                            <FormField
                                name="ssce_exam_1_year"
                                control={control}
                                errors={errors}
                                label="Exam Year"
                                required
                                type="select"
                                placeholder="e.g 2010, 2015, 2020..."
                                options={Years}
                            />
                            <FormField
                                name="ssce_exam_1_number"
                                control={control}
                                errors={errors}
                                label="SSCE 1 Exam Number"
                                required
                                placeholder="e.g 1234567890..."
                            />
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-700">
                                Exam (2) <span className="text-gray-400 font-normal text-sm">(optional)</span>
                            </h4>
                            <FormField
                                name="ssce_exam_2_type"
                                control={control}
                                errors={errors}
                                label="Exam Type"
                                type="select"
                                placeholder="e.g WAEC, NECO, GCE..."
                                options={OLevels}
                            />
                            <FormField
                                name="ssce_exam_2_year"
                                control={control}
                                errors={errors}
                                label="Exam Year"
                                type="select"
                                placeholder="e.g 2010, 2015, 2020..."
                                options={Years}
                            />
                            <FormField
                                name="ssce_exam_2_number"
                                control={control}
                                errors={errors}
                                label="SSCE 2 Exam Number"
                                placeholder="e.g 1234567890..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                        <SubjectGradeTable form={form} name="ssce_subjects_1" title="Subjects & Grades (Exam 1)" />
                        <SubjectGradeTable form={form} name="ssce_subjects_2" title="Subjects & Grades (Exam 2)" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUploader
                            name="first_school_leaving"
                            control={control}
                            label="Primary School Leaving Certificate"
                            accept=".pdf,.doc,.docx,image/*"
                            maxSize={10}
                            multiple={false}
                        />
                        <FileUploader
                            name="ssce_certificate"
                            control={control}
                            label="SSCE / O'Level Certificate"
                            accept=".pdf,.doc,.docx,image/*"
                            maxSize={10}
                            multiple={false}
                        />
                    </div>

                    <FileUploader
                        name="other_documents"
                        control={control}
                        label="Other Academic Qualification Documents (Optional)"
                        accept=".pdf,.doc,.docx,image/*"
                        maxSize={10}
                        multiple={true}
                        maxFiles={5}
                    />
                </>
            )}
        </div>
    );
};
