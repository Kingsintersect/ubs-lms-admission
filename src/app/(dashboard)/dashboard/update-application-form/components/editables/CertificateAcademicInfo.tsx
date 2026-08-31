"use client";

import { Edit3, GraduationCap, Save, X } from 'lucide-react';
import React from 'react';
import { EditableCheckbox, EditableField, EditableSelect } from '@/components/forms/EditableFormFields';
import { useEditableSection } from '@/hooks/useEditableSection';
import { ApplicationDetailsType, CertificateApplication } from '@/schemas/admission-schema';
import { OLevels, Years, courses, grades } from '@/config';

export interface CertificateAcademicInfoProps {
    application: ApplicationDetailsType;
}

type SubjectGradeRow = { subject?: string; grade?: string };
type SubjectsKey = 'ssce_subjects_1' | 'ssce_subjects_2';

const emptySubjectRows = (): SubjectGradeRow[] => Array.from({ length: 9 }, () => ({ subject: '', grade: '' }));

/**
 * The backend stores each ssce_subjects_1/2 row as a JSON-encoded string
 * (e.g. '{"subject":"English","grade":"A1"}') rather than a parsed object -
 * an artifact of how the multipart submission encodes array-of-object
 * fields. Parse defensively so a row that's already an object (e.g. after a
 * local edit) or malformed still renders instead of crashing.
 */
const parseSubjectRows = (value: unknown): SubjectGradeRow[] => {
    if (!Array.isArray(value) || value.length === 0) return emptySubjectRows();

    return value.map((item): SubjectGradeRow => {
        if (item && typeof item === 'object') return item as SubjectGradeRow;
        if (typeof item === 'string') {
            try {
                const parsed = JSON.parse(item);
                if (parsed && typeof parsed === 'object') return parsed as SubjectGradeRow;
            } catch {
                // fall through to the default row below
            }
        }
        return { subject: '', grade: '' };
    });
};

type CertificateAcademicData = {
    programme_in_view: string;
    awaiting_result: boolean;
    ssce_exam_1_type: string;
    ssce_exam_1_year: string;
    ssce_exam_1_number: string;
    ssce_exam_2_type: string;
    ssce_exam_2_year: string;
    ssce_exam_2_number: string;
    ssce_subjects_1: SubjectGradeRow[];
    ssce_subjects_2: SubjectGradeRow[];
};

export default function CertificateAcademicInfo({ application }: CertificateAcademicInfoProps) {
    const buildInitialData = (): CertificateAcademicData => {
        const app = application.application as Partial<CertificateApplication>;
        return {
            programme_in_view: app.programme_in_view || '',
            awaiting_result: app.awaiting_result || false,
            ssce_exam_1_type: app.ssce_exam_1_type || '',
            ssce_exam_1_year: app.ssce_exam_1_year || '',
            ssce_exam_1_number: app.ssce_exam_1_number || '',
            ssce_exam_2_type: app.ssce_exam_2_type || '',
            ssce_exam_2_year: app.ssce_exam_2_year || '',
            ssce_exam_2_number: app.ssce_exam_2_number || '',
            ssce_subjects_1: parseSubjectRows(app.ssce_subjects_1),
            ssce_subjects_2: parseSubjectRows(app.ssce_subjects_2),
        };
    };

    const {
        isEditing,
        formData,
        isSaving,
        hasChanges,
        handleEdit,
        handleCancel,
        handleSave,
        updateField,
    } = useEditableSection<CertificateAcademicData>({
        applicationId: (application.application.id || '').toString(),
        initialData: buildInitialData(),
        updateType: 'application',
    });

    const canSave = () => hasChanges && !!formData.programme_in_view;

    const updateSubjectRow = (key: SubjectsKey, index: number, field: keyof SubjectGradeRow, value: string) => {
        const rows = [...formData[key]];
        rows[index] = { ...rows[index], [field]: value };
        updateField(key, rows);
    };

    const SubjectGradeTable = ({ subjectsKey, title }: { subjectsKey: SubjectsKey; title: string }) => (
        <div>
            <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>
            <div className="space-y-2">
                {formData[subjectsKey].map((row, index) => {
                    const takenByOtherRows = new Set(
                        formData[subjectsKey]
                            .filter((_, rowIndex) => rowIndex !== index)
                            .map(other => other?.subject)
                            .filter(Boolean)
                    );

                    return (
                        <div key={index} className="grid grid-cols-[1.5rem_1fr_7rem] items-center gap-2">
                            <span className="text-sm text-gray-500">{index + 1}.</span>
                            {isEditing ? (
                                <select
                                    value={row.subject ?? ''}
                                    onChange={(e) => updateSubjectRow(subjectsKey, index, 'subject', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm bg-white"
                                >
                                    <option value="">Subject</option>
                                    {courses.map(course => (
                                        <option
                                            key={course.id}
                                            value={course.value}
                                            disabled={takenByOtherRows.has(course.value)}
                                        >
                                            {course.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-sm text-gray-900 py-1">
                                    {row.subject || <span className="text-gray-400 italic">Not set</span>}
                                </p>
                            )}
                            {isEditing ? (
                                <select
                                    value={row.grade ?? ''}
                                    onChange={(e) => updateSubjectRow(subjectsKey, index, 'grade', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm bg-white"
                                >
                                    <option value="">Grade</option>
                                    {grades.map(grade => (
                                        <option key={grade.id} value={grade.value}>{grade.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-sm text-gray-900 py-1">
                                    {row.grade || <span className="text-gray-400 italic">-</span>}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Header with Edit/Save buttons */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <GraduationCap className="w-6 h-6 mr-2 text-blue-600" />
                    Programme & Senior School Certificate Details
                </h3>

                <div className="flex items-center space-x-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !canSave()}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3 h-3 mr-1.5" />
                                        Save
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="inline-flex items-center px-3 py-1.5 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                            >
                                <X className="w-3 h-3 mr-1.5" />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleEdit}
                            className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Edit3 className="w-3 h-3 mr-1.5" />
                            Edit
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <EditableField
                    label="Programme in View"
                    type="text"
                    value={formData.programme_in_view}
                    onChange={(value) => updateField('programme_in_view', value)}
                    placeholder="e.g. Certificate in Entrepreneurship Development"
                    isEditing={isEditing}
                />

                <EditableCheckbox
                    label="Awaiting Result"
                    checked={formData.awaiting_result}
                    onChange={(checked) => updateField('awaiting_result', checked)}
                    isEditing={isEditing}
                    description="Applicant is awaiting their SSCE results"
                />

                {!formData.awaiting_result && (
                    <>
                        <hr />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-700">Exam (1)</h4>
                                <EditableSelect
                                    label="Exam Type"
                                    value={formData.ssce_exam_1_type}
                                    onChange={(value) => updateField('ssce_exam_1_type', value)}
                                    options={OLevels}
                                    isEditing={isEditing}
                                />
                                <EditableSelect
                                    label="Exam Year"
                                    value={formData.ssce_exam_1_year}
                                    onChange={(value) => updateField('ssce_exam_1_year', value)}
                                    options={Years}
                                    isEditing={isEditing}
                                />
                                <EditableField
                                    label="SSCE 1 Exam Number"
                                    type="text"
                                    value={formData.ssce_exam_1_number}
                                    onChange={(value) => updateField('ssce_exam_1_number', value)}
                                    isEditing={isEditing}
                                />
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-700">
                                    Exam (2) <span className="text-gray-400 font-normal text-sm">(optional)</span>
                                </h4>
                                <EditableSelect
                                    label="Exam Type"
                                    value={formData.ssce_exam_2_type}
                                    onChange={(value) => updateField('ssce_exam_2_type', value)}
                                    options={OLevels}
                                    isEditing={isEditing}
                                />
                                <EditableSelect
                                    label="Exam Year"
                                    value={formData.ssce_exam_2_year}
                                    onChange={(value) => updateField('ssce_exam_2_year', value)}
                                    options={Years}
                                    isEditing={isEditing}
                                />
                                <EditableField
                                    label="SSCE 2 Exam Number"
                                    type="text"
                                    value={formData.ssce_exam_2_number}
                                    onChange={(value) => updateField('ssce_exam_2_number', value)}
                                    isEditing={isEditing}
                                />
                            </div>
                        </div>

                        <hr />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                            <SubjectGradeTable subjectsKey="ssce_subjects_1" title="Subjects & Grades (Exam 1)" />
                            <SubjectGradeTable subjectsKey="ssce_subjects_2" title="Subjects & Grades (Exam 2)" />
                        </div>
                    </>
                )}
            </div>

            {/* Unsaved changes warning */}
            {isEditing && hasChanges && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        You have unsaved changes. Make sure to save before leaving this section.
                    </p>
                </div>
            )}
        </div>
    );
}
