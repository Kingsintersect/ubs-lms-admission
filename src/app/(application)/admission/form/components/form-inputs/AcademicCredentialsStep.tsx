import { AdmissionFormData } from '@/schemas/admission-schema';
import React from 'react'
import { Control, FieldErrors, UseFormReturn } from 'react-hook-form';
import { PhotoUploader } from './PhotoUploader';
import MultiImageUploader from '../MultiImageUploader';
import { DocumentUpload } from '@/components/documents/DocumentUploader';
import { UploadPassport } from '@/app/actions/student';

interface AcademicCredentialsStepProps {
	control: Control<AdmissionFormData>;
	setValue: UseFormReturn<AdmissionFormData>['setValue'];
	errors: FieldErrors<AdmissionFormData>;
}
export const AcademicCredentialsStep: React.FC<AcademicCredentialsStepProps> = ({ control, errors, setValue }) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 space-y-6">
			<PhotoUploader
				onFileChange={(file) => setValue('primary_school_leaving', file ?? undefined)}
				error={errors.primary_school_leaving?.message}
				setValue={setValue}
				title='Primary School Leaving Certificate'
			/>
			<PhotoUploader
				onFileChange={(file) => setValue('o_level', file ?? undefined)}
				error={errors.o_level?.message}
				setValue={setValue}
				title='Odinary Level (O`Level) certificate'
			/>
			<PhotoUploader
				onFileChange={(file) => setValue('degree', file ?? undefined)}
				error={errors.degree?.message}
				setValue={setValue}
				title='Bachelor`s Degree certificate'
			/>
			<PhotoUploader
				onFileChange={(file) => setValue('ond', file ?? undefined)}
				error={errors.ond?.message}
				setValue={setValue}
				title='Odinary National Diploma (OND) certificate'
			/>
			<PhotoUploader
				onFileChange={(file) => setValue('hnd', file ?? undefined)}
				error={errors.hnd?.message}
				setValue={setValue}
				title='Higher National Diploma (HND) certificate'
			/>
			{/* <PhotoUploader
				onFileChange={(file) => setValue('transcript', file ?? undefined)}
				error={errors.hnd?.message}
				setValue={setValue}
				title='Upload your transcript document'
			/> */}
			<DocumentUpload<AdmissionFormData>
				name="transcript"
				title="Upload your transcript document"
				error={errors.transcript?.message as string} // ✅ explicitly extract just the message
				setValue={setValue}
				uploadFn={(file) => UploadPassport({ transcript: file })}
			// uploadFn={(file) => UploadPassport({ document: file })}
			/>
			<div className="col-span-full">
				<MultiImageUploader
					imagesUrlArray={undefined}
					productId={0}
					register={control.register}
					setValue={setValue}
					formKey='others'
				/>
			</div>
		</div>
	)
}
