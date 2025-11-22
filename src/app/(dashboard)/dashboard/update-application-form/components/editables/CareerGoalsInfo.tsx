"use client";

import { Edit3, NotebookPen, Save, X } from 'lucide-react';
import React from 'react'
import { EditableTextArea } from '@/components/forms/EditableFormFields';
import { useEditableSection } from '@/hooks/useEditableSection';
import { ApplicationDetailsType } from '@/schemas/admission-schema';
import { ProgramType } from '@/config';

export interface CareerGoalsInfoProps {
    application: ApplicationDetailsType;
}

type CareerGoalsData = {
    careerGoals: string;
};

export default function CareerGoalsInfo({
    application,
}: CareerGoalsInfoProps) {
    // Check if this is a business school application (only they have careerGoals)
    const isBusinessSchool = application.application.programType === ProgramType.BUSINESS_SCHOOL;

    const {
        isEditing,
        formData,
        isSaving,
        hasChanges,
        handleEdit,
        handleCancel,
        handleSave,
        updateField,
    } = useEditableSection<CareerGoalsData>({
        applicationId: (application.application.id || '').toString(),
        initialData: {
            careerGoals: isBusinessSchool && application.application.programType === ProgramType.BUSINESS_SCHOOL
                ? (application.application.careerGoals || '')
                : '',
        },
        updateType: 'application',
    });

    const canSave = () => {
        if (!hasChanges) return false;
        if (!formData.careerGoals || formData.careerGoals.trim().length < 100) return false;
        return true;
    };

    // Don't render this component for ODL applications
    if (!isBusinessSchool) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Header with Edit/Save buttons */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <NotebookPen className="w-10 h-10 mr-2 text-teal-600" />
                    Career Goals
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

            {/* Editable Fields */}
            <div className="grid grid-cols-1 gap-4">
                <EditableTextArea
                    label="Career Goals"
                    value={formData.careerGoals}
                    onChange={(value) => updateField('careerGoals', value)}
                    placeholder="Describe your career goals (minimum 100 characters)..."
                    isEditing={isEditing}
                    className='col-span-2'
                    rows={8}
                />
                {isEditing && (
                    <p className="text-sm text-gray-500">
                        {formData.careerGoals.length}/250 characters
                        {formData.careerGoals.length < 100 &&
                            <span className="text-red-500 ml-2">
                                (minimum 100 characters required)
                            </span>
                        }
                    </p>
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




// "use client";

// import { updateStudentApplicationData } from '@/app/actions/applications';
// import { CareerGoalsInfoData } from '@/schemas/admission-schema';
// import { AlertCircle, CheckCircle, Edit3, NotebookPen, Save, X } from 'lucide-react';
// import React, { useState } from 'react'
// import { EditableTextArea } from '../../../../../../components/forms/EditableFormFields';
// import { useApplicationReview } from '@/contexts/ApplicationReviewContext';

// export interface CareerGoalsInfoProps {
//     application: CareerGoalsInfoData;
// }
// export default function CareerGoalsInfo({
//     application,
// }: CareerGoalsInfoProps) {
//     const [isEditing, setIsEditing] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
//     const [errorMessage, setErrorMessage] = useState('');

//     // Form state
//     const [formData, setFormData] = useState<CareerGoalsInfoData>({
//         careerGoals: application.careerGoals || '',
//     });

//     // Original data for cancel functionality
//     const [originalData, setOriginalData] = useState<CareerGoalsInfoData>(formData);
//     const [isSavingPersonalInfo, setIsSavingPersonalInfo] = useState(false);
//     const { refetchApplication } = useApplicationReview();

//     const handleEdit = () => {
//         setOriginalData(formData); // Store current data as original
//         setIsEditing(true);
//         setSaveStatus('idle');
//         setErrorMessage('');
//     };

//     const handleCancel = () => {
//         setFormData(originalData); // Restore original data
//         setIsEditing(false);
//         setSaveStatus('idle');
//         setErrorMessage('');
//     };
//     const savePersonalInfo = async (data: CareerGoalsInfoData) => {
//         setIsSavingPersonalInfo(true);
//         try {
//             await updateStudentApplicationData(String(application.id), data);
//             // Optionally refresh the application data
//             await refetchApplication();
//         } catch (error) {
//             console.error('Failed to save personal info:', error);
//             throw error; // Re-throw to let component handle the error display
//         } finally {
//             setIsSavingPersonalInfo(false);
//         }
//     };

//     const handleSave = async () => {

//         // Basic validation
//         if (!formData.careerGoals) {
//             setErrorMessage('Personal statement is required');
//             setSaveStatus('error');
//             return;
//         }

//         try {
//             setIsSaving(true);
//             setSaveStatus('idle');
//             setErrorMessage('');

//             await savePersonalInfo(formData);

//             setOriginalData(formData); // Update original data after successful save
//             setIsEditing(false);
//             setSaveStatus('success');

//             // Clear success message after 3 seconds
//             setTimeout(() => setSaveStatus('idle'), 3000);
//         } catch (error) {
//             console.error('Save failed:', error);
//             setErrorMessage(error instanceof Error ? error.message : 'Failed to save changes');
//             setSaveStatus('error');
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     const updateField = (field: keyof CareerGoalsInfoData, value: string) => {
//         setFormData(prev => ({ ...prev, [field]: value }));
//         // Clear error when user starts typing
//         if (saveStatus === 'error') {
//             setSaveStatus('idle');
//             setErrorMessage('');
//         }
//     };

//     const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

//     return (
//         <div className="bg-white rounded-lg border border-gray-200 p-6">
//             {/* Header with Edit/Save buttons */}
//             <div className="flex items-center justify-between mb-6">
//                 <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//                     <NotebookPen className="w-10 h-10 mr-2 text-teal-600" />
//                     Career Goal
//                 </h3>

//                 <div className="flex items-center space-x-2">
//                     {/* Status indicators */}
//                     {saveStatus === 'success' && (
//                         <div className="flex items-center text-green-600 text-sm mr-2">
//                             <CheckCircle className="w-4 h-4 mr-1" />
//                             Saved successfully
//                         </div>
//                     )}

//                     {saveStatus === 'error' && (
//                         <div className="flex items-center text-red-600 text-sm mr-2">
//                             <AlertCircle className="w-4 h-4 mr-1" />
//                             Error
//                         </div>
//                     )}

//                     {/* Action buttons */}
//                     {isEditing ? (
//                         <>
//                             <button
//                                 onClick={handleSave}
//                                 disabled={isSaving || isSavingPersonalInfo || !hasChanges}
//                                 className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                             >
//                                 {isSaving ? (
//                                     <>
//                                         <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
//                                         Saving...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Save className="w-3 h-3 mr-1.5" />
//                                         Save
//                                     </>
//                                 )}
//                             </button>
//                             <button
//                                 onClick={handleCancel}
//                                 disabled={isSaving || isSavingPersonalInfo}
//                                 className="inline-flex items-center px-3 py-1.5 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                             >
//                                 <X className="w-3 h-3 mr-1.5" />
//                                 Cancel
//                             </button>
//                         </>
//                     ) : (
//                         <button
//                             onClick={handleEdit}
//                             disabled={isSavingPersonalInfo}
//                             className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                         >
//                             <Edit3 className="w-3 h-3 mr-1.5" />
//                             Edit
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* Error message */}
//             {errorMessage && (
//                 <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                     <div className="flex items-center">
//                         <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
//                         <p className="text-sm text-red-800">{errorMessage}</p>
//                     </div>
//                 </div>
//             )}

//             {/* Editable Fields */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <EditableTextArea
//                     label=""
//                     value={String(formData.careerGoals)}
//                     onChange={(value) => updateField('careerGoals', value)}
//                     placeholder=""
//                     isEditing={isEditing}
//                     className='col-span-2'
//                     rows={5}
//                 />
//             </div>


//             {/* Unsaved changes warning */}
//             {isEditing && hasChanges && (
//                 <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                     <p className="text-sm text-yellow-800">
//                         You have unsaved changes. Make sure to save before leaving this section.
//                     </p>
//                 </div>
//             )}
//         </div>
//     );
// }