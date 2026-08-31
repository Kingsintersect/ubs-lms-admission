"use client";

import { Building2, Edit3, Save, X } from 'lucide-react';
import React from 'react';
import { EditableField } from '@/components/forms/EditableFormFields';
import { useEditableSection } from '@/hooks/useEditableSection';
import { ApplicationDetailsType, CertificateApplication } from '@/schemas/admission-schema';

export interface CertificateInstitutionsInfoProps {
    application: ApplicationDetailsType;
}

type InstitutionEntry = {
    name_of_institution: string;
    from: string;
    to: string;
    certificate_obtained: string;
    course_of_study: string;
};

const emptyInstitutionEntry = (): InstitutionEntry => ({
    name_of_institution: '',
    from: '',
    to: '',
    certificate_obtained: '',
    course_of_study: '',
});

type InstitutionKey = 'postgraduate_institution' | 'first_degree_institution' | 'ssce_institution';

type CertificateInstitutionsData = Record<InstitutionKey, InstitutionEntry> & {
    organization_name: string;
    employment_from: string;
    employment_to: string;
};

const INSTITUTION_SECTIONS: { key: InstitutionKey; title: string }[] = [
    { key: 'postgraduate_institution', title: 'Postgraduate Degree' },
    { key: 'first_degree_institution', title: 'First Degree' },
    { key: 'ssce_institution', title: 'SSCE' },
];

export default function CertificateInstitutionsInfo({ application }: CertificateInstitutionsInfoProps) {
    const buildInitialData = (): CertificateInstitutionsData => {
        const app = application.application as Partial<CertificateApplication>;
        return {
            postgraduate_institution: { ...emptyInstitutionEntry(), ...app.postgraduate_institution },
            first_degree_institution: { ...emptyInstitutionEntry(), ...app.first_degree_institution },
            ssce_institution: { ...emptyInstitutionEntry(), ...app.ssce_institution },
            organization_name: app.organization_name || '',
            employment_from: app.employment_from || '',
            employment_to: app.employment_to || '',
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
    } = useEditableSection<CertificateInstitutionsData>({
        applicationId: (application.application.id || '').toString(),
        initialData: buildInitialData(),
        updateType: 'application',
    });

    const canSave = () => hasChanges;

    const updateInstitutionField = (key: InstitutionKey, field: keyof InstitutionEntry, value: string) => {
        updateField(key, { ...formData[key], [field]: value });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Header with Edit/Save buttons */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Building2 className="w-6 h-6 mr-2 text-blue-600" />
                    Institution(s) Attended & Place of Work
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

            <div className="space-y-8">
                {INSTITUTION_SECTIONS.map(({ key, title }) => (
                    <div key={key}>
                        <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EditableField
                                label="Name of Institution"
                                type="text"
                                value={formData[key].name_of_institution}
                                onChange={(value) => updateInstitutionField(key, 'name_of_institution', value)}
                                isEditing={isEditing}
                            />
                            <EditableField
                                label="Certificate Obtained"
                                type="text"
                                value={formData[key].certificate_obtained}
                                onChange={(value) => updateInstitutionField(key, 'certificate_obtained', value)}
                                isEditing={isEditing}
                            />
                            <EditableField
                                label="From"
                                type="date"
                                value={formData[key].from}
                                onChange={(value) => updateInstitutionField(key, 'from', value)}
                                isEditing={isEditing}
                            />
                            <EditableField
                                label="To"
                                type="date"
                                value={formData[key].to}
                                onChange={(value) => updateInstitutionField(key, 'to', value)}
                                isEditing={isEditing}
                            />
                            <EditableField
                                label="Course of Study"
                                type="text"
                                value={formData[key].course_of_study}
                                onChange={(value) => updateInstitutionField(key, 'course_of_study', value)}
                                isEditing={isEditing}
                                className="md:col-span-2"
                            />
                        </div>
                    </div>
                ))}

                <hr />

                <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Place of Work</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <EditableField
                            label="Name of Organization"
                            type="text"
                            value={formData.organization_name}
                            onChange={(value) => updateField('organization_name', value)}
                            isEditing={isEditing}
                            className="md:col-span-2"
                        />
                        <EditableField
                            label="From"
                            type="date"
                            value={formData.employment_from}
                            onChange={(value) => updateField('employment_from', value)}
                            isEditing={isEditing}
                        />
                        <EditableField
                            label="To"
                            type="date"
                            value={formData.employment_to}
                            onChange={(value) => updateField('employment_to', value)}
                            isEditing={isEditing}
                        />
                    </div>
                </div>
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
