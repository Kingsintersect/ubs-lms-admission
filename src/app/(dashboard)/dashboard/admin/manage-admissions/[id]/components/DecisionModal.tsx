"use client";

import { ApproveStudentApplicantion, RejectStudentApplicantion } from '@/app/actions/applications';
import { Textarea } from '@/components/ui/textarea';
import { toastApiError, toastSuccess } from '@/lib/toastApiError';
import { ApplicationDetailsType } from '@/schemas/admission-schema';
import { applicationReview, ApplicationReviewFormValues } from '@/schemas/applicationReview-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react'
import { useForm } from 'react-hook-form';

interface DecisionModalProps {
    decisionType: string;
    setShowDecisionModal: (boolean) => void;
    submitDecision: () => void
    application: ApplicationDetailsType | null | undefined;
}
export const DecisionModal = ({ decisionType, setShowDecisionModal, submitDecision, application }: DecisionModalProps) => {
    const queryClient = useQueryClient();
    // const [facultyData, setFacultyData] = useState<Faculty | null>(null)
    // const [departmentData, setDepartmentData] = useState<Department | null>(null)
    const program = application?.program as string;
    const study_mode = application?.application.studyMode as string;
    const startTerm = application?.application.startTerm as string;

    const {
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<ApplicationReviewFormValues>({
        resolver: zodResolver(applicationReview),
        defaultValues: {
            reason: '',
        },
    });

    const approveAdmissionMutation = useMutation({
        mutationFn: ApproveStudentApplicantion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['approveAdmissionMutation'] });
            toastSuccess(`Admission approved successfully!`);
            submitDecision();
            // router.push("/admin/products");
        },
        onError: (error) => {
            console.error(error);
            toastApiError(error, "Failed to approve admission");
        },
    });
    const rejectAdmissionMutation = useMutation({
        mutationFn: RejectStudentApplicantion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rejectAdmissionMutation'] });
            toastSuccess(`Rejection note sent successfully!`);
            submitDecision();
            // router.push("/admin/products");
        },
        onError: (error) => {
            console.error(error);
            toastApiError(error, "Failed to send rejection note");
        },
    });

    const handleApproval = () => {
        if (application) {
            approveAdmissionMutation.mutate({
                application_id: application.id,
                program: application.program,
                program_id: String(application.program_id),
                semester: "1SM",//application.accademic_semester,
                accademic_session: application.accademic_session
            });
        }
    };
    const handleRejection = (values: ApplicationReviewFormValues) => {
        if (!application?.id) return;
        rejectAdmissionMutation.mutate({ ...values, application_id: application.id });
    };

    // useEffect(() => {
    //     const fetchData = async () => {
    //         if (access_token && application?.department_id && application.faculty_id) {
    //             try {
    //                 const [faculty, department] = await Promise.all([
    //                     GetSingleFaculty(access_token, "6"),
    //                     GetSingleDepartment("17", access_token),
    //                 ]);
    //                 setFacultyData(faculty.success.data);
    //                 setDepartmentData(department.success.data);
    //             } catch (error) {
    //                 console.error('Error fetching data:', error);
    //             }
    //         }
    //     };

    //     fetchData();
    // }, [access_token, application?.department_id, application?.faculty_id]);

    // useEffect(() => {
    //     const fetchData = async () => {
    //         if (access_token && application?.department_id && application.faculty_id) {
    //             try {
    //                 const [faculty, department] = await Promise.all([
    //                     GetSingleFaculty(access_token, application.faculty_id),
    //                     GetSingleDepartment(application.department_id, access_token),
    //                 ]);
    //                 setFacultyData(faculty.success.data);
    //                 setDepartmentData(department.success.data);
    //             } catch (error) {
    //                 console.error('Error fetching data:', error);
    //             }
    //         }
    //     };

    //     fetchData();
    // }, [access_token, application?.department_id, application?.faculty_id]);

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-xl w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {decisionType === 'admitted' ? 'Approve Application' : 'Reject Application'}
                </h3>
                <form onSubmit={handleSubmit(handleRejection)} className="">
                    {decisionType !== 'admitted'
                        ?
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes
                                </label>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <Textarea
                                    {...register('reason')}
                                    rows={8}
                                    placeholder="Add notes about your decision..."
                                    className='rounded-xl'
                                />
                                {errors.reason && (
                                    <p className="text-sm text-red-500">{errors.reason.message}</p>
                                )}
                            </div>
                        </div>
                        :
                        <div className="space-y-4">
                            <div className="w-full space-y-5 my-10 text-left">
                                <div className="flex flex-row gap-5">
                                    <div className="w-32 font-bold text-lg text-orange-950">PROGRAM: </div>
                                    <div className="grow text-gray-700">{program}</div>
                                </div>
                                <div className="flex flex-row gap-5">
                                    <div className="w-32 font-bold text-lg text-orange-950">STUDY MODE: </div>
                                    <div className="grow text-gray-700">{study_mode}</div>
                                </div>
                                <div className="flex flex-row gap-5">
                                    <div className="w-32 font-bold text-lg text-orange-950">BEGINS: </div>
                                    <div className="grow text-gray-700">{startTerm}</div>
                                </div>
                            </div>
                        </div>
                    }
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={() => setShowDecisionModal(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        {decisionType === 'admitted'
                            ? <button
                                onClick={handleApproval}
                                className={`px-4 py-2 text-white rounded-lg bg-green-600 hover:bg-green-700`}
                            >
                                {approveAdmissionMutation.isPending ? (
                                    <div className='flex items-center justify-center gap-2'>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Sending request...</span>
                                    </div>
                                ) : (
                                    <>
                                        {'Approve'}
                                    </>
                                )}
                            </button>
                            : <button
                                type='submit'
                                // onClick={submitDecision}
                                className={`px-4 py-2 text-white rounded-lg bg-red-600 hover:bg-red-700`}
                            >
                                {rejectAdmissionMutation.isPending ? (
                                    <div className='flex items-center justify-center gap-2'>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Sending request...</span>
                                    </div>
                                ) : (
                                    <>
                                        {'Reject'}
                                    </>
                                )}
                            </button>
                        }
                    </div>
                </form>
            </div>
        </div >
    )
}
