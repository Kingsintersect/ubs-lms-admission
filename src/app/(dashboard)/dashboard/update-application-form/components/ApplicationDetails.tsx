import { ApplicationDetailsType, BusinessApplication } from '@/schemas/admission-schema';
import { AlertCircle, Check, Clock, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import PersonalInfo from './editables/PersonalInfo';
import AcademicInformation from './editables/AcademicInformation';
import NextOfkinInfo from './editables/NextOfkinInfo';
import SponsorsInfo from './editables/SponsorsInfo';
import WorkExperienceInfo from './editables/WorkExperienceInfo';
import ProgramInfo from './editables/ProgramInfo';
import PersonalStatementInfo from './editables/PersonalStatementInfo';
import CareerGoalsInfo from './editables/CareerGoalsInfo';
import QualificationDocuments from './editables/QualificationDocuments';
import { FormatImageUrl } from '@/lib/imageUrl';
import { ImagePreviewModal } from '@/components/application/ImagePreviewModal';
import { Label } from '@/components/ui/label';
import { ProgramType, SelectedProgramType } from '@/config';

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'ADMITTED': return <Check className="w-4 h-4" />;
        case 'INPROGRESS': return <Clock className="w-4 h-4 animate-spin" />;
        case 'NOT_ADMITTED': return <X className="w-4 h-4" />;
        default: return <Clock className="w-4 h-4" />;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'ADMITTED': return 'text-green-600 bg-green-50 border-green-200';
        case 'INPROGRESS': return 'text-cyan-600 bg-cyan-50 border-cyan-200';
        case 'NOT_ADMITTED': return 'text-red-600 bg-red-50 border-red-200';
        case 'PENDING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
};

export const ApplicationDetails = ({
    application
}: {
    application: ApplicationDetailsType;
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="p-6 border-b">
                <div className="flex items-start justify-between gap-6">
                    <div className="">
                        <div className="mb-5">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {`${application.first_name} ${application.last_name}`.toUpperCase()}
                            </h2>
                            <p className="text-gray-600 mt-1">{application.program} Application</p>
                        </div>

                        <div
                            className="relative w-52 h-52 cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <Image
                                src={FormatImageUrl(application?.application.passport as unknown as string) ?? "/avatars/avatar-man.jpg"}
                                fill
                                className="object-cover"
                                alt="Passport"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex-1 space-x-1 pl-2 pr-10 border-l-4 border-gray-200">
                            <Label className="block text-sm font-bold text-gray-700">
                                Email Address
                            </Label>
                            <p className="text-sm text-gray-900 py-1 pl-2 min-h-[2rem] flex items-center">
                                {application.email || <span className="text-gray-400 italic">Not provided</span>}
                            </p>
                            <hr />
                        </div>
                        <div className="flex-1 space-x-1 pl-2 pr-10 border-l-4 border-gray-200">
                            <Label className="block text-sm font-bold text-gray-700">
                                Phone Number
                            </Label>
                            <p className="text-sm text-gray-900 py-1 pl-2 min-h-[2rem] flex items-center">
                                {application.phone_number || <span className="text-gray-400 italic">Not provided</span>}
                            </p>
                            <hr />
                        </div>
                        <div className="flex-1 space-x-1 pl-2 pr-10 border-l-4 border-gray-200">
                            <Label className="block text-sm font-bold text-gray-700">
                                Nationality
                            </Label>
                            <p className="text-sm text-gray-900 py-1 pl-2 min-h-[2rem] flex items-center">
                                {application.nationality || <span className="text-gray-400 italic">Not provided</span>}
                            </p>
                            <hr />
                        </div>
                        <div className="flex-1 space-x-1 pl-2 pr-10 border-l-4 border-gray-200">
                            <Label className="block text-sm font-bold text-gray-700">
                                Gender
                            </Label>
                            <p className="text-sm text-gray-900 py-1 pl-2 min-h-[2rem] flex items-center">
                                {application.gender || <span className="text-gray-400 italic">Not provided</span>}
                            </p>
                            <hr />
                        </div>
                    </div>

                    <div className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 border ${getStatusColor(application.admission_status)}`}>
                        {getStatusIcon(application.admission_status)}
                        <span className="capitalize">{application.admission_status.replace('_', ' ')}</span>
                    </div>
                </div>
            </div>

            {/* Content sections */}
            <div className="p-6 space-y-8">
                {/* Personal Information */}
                <PersonalInfo
                    application={application}
                />

                {/* Program Information */}
                <ProgramInfo
                    application={application}
                />

                {/* Personal Statement */}
                {SelectedProgramType === ProgramType.BUSINESS_SCHOOL &&
                    <PersonalStatementInfo application={application} />
                }

                {/* Career Goals */}
                {SelectedProgramType === ProgramType.BUSINESS_SCHOOL &&
                    <CareerGoalsInfo application={application} />
                }

                {/* Qualification Documents */}
                <QualificationDocuments application={application} />

                {/* Academic Information */}
                {SelectedProgramType === ProgramType.BUSINESS_SCHOOL &&
                    <AcademicInformation application={application.application as BusinessApplication} />
                }

                {/* Work Experience */}
                {SelectedProgramType === ProgramType.BUSINESS_SCHOOL &&
                    <WorkExperienceInfo application={application} />
                }

                {/* Next of Kin */}
                <NextOfkinInfo application={application} />

                {/* Sponsors */}
                <SponsorsInfo application={application} />

                {/* Rejection Reason */}
                {application.reason_for_denial && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5">
                        <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            Reason for Rejection
                        </h3>
                        <p className="text-sm text-red-800 leading-relaxed">
                            {application.reason_for_denial}
                        </p>
                    </div>
                )}
            </div>

            {/* Image Preview Modal */}
            <ImagePreviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                imageUrl={FormatImageUrl(application.application.passport as unknown as string) || ''}
                imageName={`${application.first_name} ${application.last_name}`}
            />
        </div>
    );
};
















// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { LoadingSpinner } from '@/components/ui/loading-spinner';
// import { ApplicationDetailsType } from '@/schemas/admission-schema';
// import { AlertCircle, AlertCircleIcon, Check, Clock, Eye, X, Loader } from 'lucide-react'
// import Image from 'next/image';
// import React from 'react'
// import PersonalInfo from './editables/PersonalInfo';
// import AcademicInformation from './editables/AcademicInformation';
// import NextOfkinInfo from './editables/NextOfkinInfo';
// import SponsorsInfo from './editables/SponsorsInfo';
// import WorkExperienceInfo from './editables/WorkExperienceInfo';
// import ProgramInfo from './editables/ProgramInfo';
// import PersonalStatementInfo from './editables/PersonalStatementInfo';
// import CareerGoalsInfo from './editables/CareerGoalsInfo';
// import QualificationDocuments from './editables/QualificationDocuments';
// import { FormatImageUrl } from '@/lib/imageUrl';
// import { ImagePreviewModal } from '@/components/application/ImagePreviewModal';

// export const ApplicationDetails = ({
//     isLoading,
//     error,
//     application
// }: {
//     isLoading: boolean;
//     error: string | null;
//     application: ApplicationDetailsType;
// }) => {
//     const [isModalOpen, setIsModalOpen] = React.useState(false);
//     const getStatusIcon = (status) => {
//         switch (status) {
//             case 'ADMITTED': return <Check className="w-4 h-4" />;
//             case 'INPROGRESS': return <Loader className="w-4 h-4" />;
//             case 'NOT_ADMITTED': return <X className="w-4 h-4" />;
//             default: return <Clock className="w-4 h-4" />;
//         }
//     };

//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'ADMITTED': return 'text-green-600 bg-green-50';
//             case 'INPROGRESS': return 'text-cyan-600 bg-cyan-50';
//             case 'NOT_ADMITTED': return 'text-red-600 bg-red-50';
//             default: return 'text-yellow-600 bg-yellow-50';
//         }
//     };
//     return (
//         <div className="lg:col-span-2">
//             {isLoading ? (
//                 <div className='w-full flex items-center justify-center'>
//                     <LoadingSpinner size="sm" className="mr-2" />
//                     Loading Application Review Data...
//                 </div>
//             ) : application ? (
//                 <div className="bg-white rounded-lg shadow-sm">
//                     <div className="p-6 border-b">
//                         <div className="flex items-center justify-between">
//                             <div className="">
//                                 <div className="mb-5">
//                                     <h2 className="text-xl font-semibold text-gray-900">
//                                         {(application.first_name + " " + application.last_name).toUpperCase()}
//                                     </h2>
//                                     <hr className='mt-1 mb-2' />
//                                     <p className="text-gray-600">{application.program} Application</p>
//                                 </div>
//                                 <div className="">
//                                     <div className="relative w-52 h-auto aspect-square cursor-pointer">
//                                         <Image
//                                             src={FormatImageUrl(application?.application.passport as unknown as string) ?? "/avatars/avatar-man.jpg"}
//                                             fill
//                                             className="object-cover rounded-lg"
//                                             alt='Passport'
//                                             onClick={() => setIsModalOpen(true)}
//                                         />
//                                     </div>
//                                     <ImagePreviewModal
//                                         isOpen={isModalOpen}
//                                         onClose={() => setIsModalOpen(false)}
//                                         imageUrl={FormatImageUrl(application?.application.passport as unknown as string) || ''}
//                                         imageName={String(application.first_name)}
//                                     />
//                                 </div>
//                             </div>
//                             <div className="flex items-center space-x-3">
//                                 <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(application.admission_status)}`}>
//                                     {getStatusIcon(application.admission_status)}
//                                     <span className="capitalize">{application.admission_status}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="p-6 space-y-8">
//                         {/* Personal Information */}
//                         <PersonalInfo
//                             application={{
//                                 email: String(application.email),
//                                 phone_number: String(application.phone_number),
//                                 nationality: String(application.nationality),
//                                 userId: String(application.id),

//                                 id: String(application?.application.id),
//                                 lga: String(application?.application.lga),
//                                 dob: String(application?.application.dob),
//                                 gender: String(application?.application.gender),
//                                 hometown: String(application?.application.hometown),
//                                 hometown_address: String(application?.application.hometown_address),
//                                 contact_address: String(application?.application.contact_address),
//                                 religion: String(application?.application.religion),
//                             }}
//                         />

//                         {/* Program Information */}
//                         <ProgramInfo
//                             application={{
//                                 program: String(application.program),
//                                 program_id: String(application.program_id),
//                                 studyMode: String(application?.application.studyMode),
//                                 startTerm: String(application?.application.startTerm),
//                                 academic_session: String(application?.academic_session),

//                                 id: String(application?.application.id),
//                             }}
//                         />

//                         {/* Essay */}
//                         <PersonalStatementInfo
//                             application={application?.application}
//                         />
//                         {/* Career Golas */}
//                         <CareerGoalsInfo
//                             application={application?.application}
//                         />
//                         {/* CERTIFICATE IMAGES */}
//                         <div className="col-span-full">
//                             <QualificationDocuments
//                                 application={application?.application}
//                             />
//                         </div>

//                         {/* Academic Information */}
//                         <AcademicInformation
//                             application={application?.application}
//                         />

//                         {/* Work Experience */}
//                         <WorkExperienceInfo
//                             application={application?.application}
//                         />

//                         {/* Next of kin Information */}
//                         <NextOfkinInfo
//                             application={application?.application}
//                         />

//                         {/* Sponsors Information */}

//                         <SponsorsInfo
//                             application={application?.application}
//                         />
//                         {/* Application Notes */}
//                         {application.reason_for_denial && <div>
//                             <div>
//                                 <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
//                                     <AlertCircle className="w-5 h-5 mr-2" />
//                                     Review Notes
//                                 </h3>
//                                 <p className="text-sm text-red-700 bg-blue-50 p-4 rounded-lg border-l-4 border-red-500">{application.reason_for_denial}</p>
//                             </div>
//                         </div>}
//                     </div>
//                 </div>
//             ) : (
//                 <div className="bg-white rounded-lg shadow-sm p-8 text-center">
//                     <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//                     <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Application</h3>
//                     <p className="text-gray-600">Choose an application from the list to view details and make admission decisions.</p>
//                 </div>
//             )}
//             {error &&
//                 <>
//                     <hr />
//                     <Alert variant="destructive">
//                         <AlertCircleIcon />
//                         <AlertTitle>Unable to fetch application application?.application?.</AlertTitle>
//                         <AlertDescription>
//                             <p>Please verify netwoork and try again.</p>
//                         </AlertDescription>
//                     </Alert>
//                 </>
//             }
//         </div>
//     )
// }
