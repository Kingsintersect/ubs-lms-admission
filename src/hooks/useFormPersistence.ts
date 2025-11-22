// hooks/useFormPersistence.ts
import { useState, useCallback } from 'react';
import { formDB } from '@/lib/indexedDB';
import { deserializeFiles, serializeFiles } from '@/lib/fileStorage';
import { ApplicationFormData } from '@/schemas/admission-schema';

const STORAGE_KEY = 'admission_form_progress';
const CURRENT_STEP_KEY = 'admission_form_current_step';

export const useFormPersistence = () => {
    const [isSaving, setIsSaving] = useState(false);

    const loadSavedProgress = useCallback(async (reset: (data: any) => void) => {
        try {
            const savedData = await formDB.get<any>(STORAGE_KEY);
            const savedStep = localStorage.getItem(CURRENT_STEP_KEY);

            if (savedData) {
                const parsedData = { ...savedData };
                console.log("Loaded saved data:", parsedData);

                // Deserialize file fields and convert back to File instances
                const fileFields = [
                    'first_school_leaving', 'o_level', 'hnd',
                    'degree', 'degree_transcript', 'other_documents'
                ];

                for (const field of fileFields) {
                    if (parsedData[field]) {
                        try {
                            if (Array.isArray(parsedData[field])) {
                                parsedData[field] = deserializeFiles(parsedData[field]);
                            } else if (parsedData[field].data) {
                                // Single file case
                                const deserialized = deserializeFiles([parsedData[field]]);
                                parsedData[field] = deserialized[0] || null;
                            }
                        } catch (error) {
                            console.error(`Error deserializing ${field}:`, error);
                            // If deserialization fails, keep the original value
                        }
                    }
                }

                // Reset form with saved data
                reset(parsedData);

                // Return both the data and step
                return {
                    data: parsedData,
                    step: savedStep ? parseInt(savedStep) : 0
                };
            }

            return null;
        } catch (error) {
            console.error("Failed to load saved progress:", error);
            throw error;
        }
    }, []);

    const saveProgress = useCallback(async (getValues: () => ApplicationFormData, currentStep: number) => {
        setIsSaving(true);
        try {
            const currentData = getValues();

            // Create a copy of the data to avoid mutating the form state
            const dataToSave = { ...currentData };

            // Serialize file fields
            const fileFields = [
                'first_school_leaving', 'o_level', 'hnd',
                'degree', 'degree_transcript', 'other_documents'
            ];

            for (const field of fileFields) {
                if (dataToSave[field]) {
                    try {
                        if (Array.isArray(dataToSave[field])) {
                            dataToSave[field] = await serializeFiles(dataToSave[field]);
                        } else if (dataToSave[field] instanceof File) {
                            dataToSave[field] = await serializeFiles([dataToSave[field]]);
                        } else if (typeof dataToSave[field] === 'string') {
                            // It's already a URL string, store as is
                            dataToSave[field] = [{
                                name: dataToSave[field].split('/').pop() || 'file',
                                type: 'unknown',
                                size: 0,
                                data: dataToSave[field],
                                lastModified: Date.now()
                            }];
                        }
                    } catch (error) {
                        console.error(`Error serializing ${field}:`, error);
                        // If serialization fails, remove the field to avoid data corruption
                        delete dataToSave[field];
                    }
                }
            }

            await formDB.set(STORAGE_KEY, dataToSave);
            localStorage.setItem(CURRENT_STEP_KEY, currentStep.toString());
            return true;
        } catch (error) {
            console.error("Failed to save progress:", error);
            throw error;
        } finally {
            setIsSaving(false);
        }
    }, []);

    const clearSavedProgress = useCallback(async () => {
        try {
            await formDB.delete(STORAGE_KEY);
            localStorage.removeItem(CURRENT_STEP_KEY);
        } catch (error) {
            console.error("Failed to clear saved progress:", error);
            throw error;
        }
    }, []);

    return {
        isSaving,
        loadSavedProgress,
        saveProgress,
        clearSavedProgress
    };
};
