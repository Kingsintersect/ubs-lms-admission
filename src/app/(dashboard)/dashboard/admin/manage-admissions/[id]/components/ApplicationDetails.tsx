import MultiImageUploader from '@/app/(application)/admission/form/components/MultiImageUploader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, AlertCircleIcon, Award, Check, Clock, Eye, FileText, GraduationCap, Mail, X } from 'lucide-react'
import Image from 'next/image';
import React from 'react'

export const ApplicationDetails = ({ isLoading, error, application, handleDecision }) => {

    const getStatusIcon = (status) => {
        switch (status) {
            case 'admitted': return <Check className="w-4 h-4" />;
            case 'not_admitted': return <X className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'admitted': return 'text-green-600 bg-green-50';
            case 'not_admitted': return 'text-red-600 bg-red-50';
            default: return 'text-yellow-600 bg-yellow-50';
        }
    };

    return (
        <div className="lg:col-span-2">
            {isLoading ? (
                <div className='w-full flex items-center justify-center'>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading Application Details...
                </div>
            ) : application ? (
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        {application.first_name} {application.last_name}
                                    </h2>
                                    <p className="text-gray-600">{application.program} Application</p>
                                </div>
                                <div className="relative h-42 w-24">
                                    <Image
                                        src={application.application.passport ?? "/avatars/avatar-man.jpg"}
                                        fill
                                        className="object-contain rounded-lg"
                                        alt='Passport'
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(application.admission_status)}`}>
                                    {getStatusIcon(application.admission_status)}
                                    <span className="capitalize">{application.admission_status}</span>
                                </div>
                                {(application.admission_status).toLowerCase() === ('PENDING').toLowerCase() && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleDecision('admitted')}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            onClick={() => handleDecision('not_admitted')}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Reject</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Mail className="w-5 h-5 mr-2" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.phone_number}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.dob}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nationality</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.nationality}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.contact_address}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.phone_number}</p>
                                </div>
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <GraduationCap className="w-5 h-5 mr-2" />
                                Academic Background
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Previous Degree</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.undergraduateDegree}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Institution</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.university}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.graduationYear}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">GPA</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.gpa}/4.0</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">GMAT Score</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.gmatScore}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">English Test Score</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.greScore}: {application.application.toeflScore}</p>
                                </div>
                            </div>
                        </div>

                        {/* Work Experience */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Award className="w-5 h-5 mr-2" />
                                Work Experience
                            </h3>
                            <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">{application.application.workExperience}</p>
                        </div>

                        {/* Essay */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Personal Statement
                            </h3>
                            <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">{application.application.personalStatement}</p>
                        </div>
                        {/* Career Golas */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Career Goal
                            </h3>
                            <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">{application.application.careerGoals}</p>
                        </div>
                        {/* CERTIFICATE IMAGES */}
                        <div className="col-span-full">
                            <MultiImageUploader
                                imagesUrlArray={application.application.images}
                                canupload={false}
                            />
                        </div>

                        {/* Sponsors Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Mail className="w-5 h-5 mr-2" />
                                Sponsors Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sponsor's Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.sponsor_name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.sponsor_email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.sponsor_phone_number}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Relationship with Sponsor</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.sponsor_relationship}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <p className="mt-1 text-sm text-gray-900">{application.application.sponsor_contact_address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Application Notes */}
                        {application.reason_for_denial && <div>
                            <div>
                                <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                    Review Notes
                                </h3>
                                <p className="text-sm text-red-700 bg-blue-50 p-4 rounded-lg border-l-4 border-red-500">{application.reason_for_denial}</p>
                            </div>
                        </div>}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Application</h3>
                    <p className="text-gray-600">Choose an application from the list to view details and make admission decisions.</p>
                </div>
            )}
            {error &&
                <>
                    <hr />
                    <Alert variant="destructive">
                        <AlertCircleIcon />
                        <AlertTitle>Unable to fetch application details.</AlertTitle>
                        <AlertDescription>
                            <p>Please verify netwoork and try again.</p>
                        </AlertDescription>
                    </Alert>
                </>
            }
        </div>
    )
}
