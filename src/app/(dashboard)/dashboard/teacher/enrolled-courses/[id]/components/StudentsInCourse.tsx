"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as XLSX from "xlsx";

import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2Icon, FileArchive, FileAxis3D, Loader2, Upload } from 'lucide-react';
import { fetchStudentScores, publishScores } from '@/app/actions/admin';
import { useAuth } from '@/contexts/AuthContext';
import { ScoreAnalytics } from '@/app/(dashboard)/dashboard/admin/students-grade-report/components/ScoreAnalytics';
import { StudentScoresTable } from '@/app/(dashboard)/dashboard/admin/students-grade-report/components/StudentScoresTable';
import { useParams } from 'next/navigation';
import StudentTableSearchBlock from './StudentTableSearchBlock';

export type ActivityType = "assign" | "quiz" | "exam" | string;
export type StudentActivity = {
    activity_name: string;
    type: ActivityType;
    grade: string;
    max_grade: string;
};
export type StudentScore = {
    student_id: number;
    student_email: string;
    student_username: string;
    final_grade: number;
    letter_grade: string;
    credit_load: number;
    quality_points: number;
    activities: StudentActivity[];
};
const getLetterGrade = (score: number): string => {
    if (score >= 70) return "A";
    if (score >= 60) return "B";
    if (score >= 50) return "C";
    if (score >= 45) return "D";
    if (score >= 40) return "E";
    return "F";
};

const StudentsInCourse = () => {
    const params = useParams();
    const CourseId = params?.id as string;
    const queryClient = useQueryClient();
    const { access_token } = useAuth();

    const {
        data: studentscores = [],
        isLoading: scoresLoading,
        error: scoresError
    } = useQuery({
        queryKey: ['student-scores-in-a-course', CourseId],
        queryFn: () => fetchStudentScores(CourseId, access_token!),
        enabled: typeof CourseId === "string" && CourseId.trim() !== "" && !!access_token?.trim()
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const rawScores = Array.isArray(studentscores)
        ? studentscores
        : Array.isArray(studentscores?.students)
            ? studentscores.students
            : [];

    const enhancedScores = rawScores.map(student => ({
        ...student,
        computedGrade: getLetterGrade(student.final_grade),
    }));

    const filteredStudents = enhancedScores.filter(student => {
        const matchesSearch =
            student.student_username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.student_email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterStatus === 'all' || student.computedGrade === filterStatus;

        return matchesSearch && matchesFilter;
    });


    // Mutations
    const publishMutation = useMutation({
        mutationFn: ({ courseId, access_token }: { courseId: string | number; access_token: string }) =>
            publishScores(courseId, access_token),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentScores', CourseId] });
        },
    });

    const handlePublishScores = () => {
        if (typeof access_token === "string" && access_token.trim() !== "") {
            publishMutation.mutate({ courseId: CourseId, access_token });
        } else {
            console.warn("Access token is missing or invalid.");
        }
    };

    // if (!access_token) return (
    //     <NoAccessTokenBlock />
    // );

    const exportToCSV = () => {
        const csvContent = convertToCSV(filteredStudents);
        downloadFile(csvContent, "results.csv", "text/csv");
    };

    const exportToExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredStudents);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Results");
        XLSX.writeFile(wb, "results.xlsx");
    };
    // Helper functions for export
    const convertToCSV = (data: StudentScore[]) => {
        const headers = [
            "Student ID",
            "Email",
            "Username",
            "Final Grade",
            "Letter Grade",
        ];
        const rows = data.map((student) => [
            student.student_id,
            student.student_email,
            student.student_username,
            student.final_grade,
            student.letter_grade,
        ]);

        return [headers, ...rows].map((row) => row.join(",")).join("\n");
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex justify-between items-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button onClick={exportToCSV} className="gap-2  bg-cyan-500 hover:bg-cyan-700 text-white">
                                <FileArchive className="h-4 w-4" />
                                Export Results (CSV)
                            </Button>
                            <Button onClick={exportToExcel} className="gap-2 bg-pink-500 hover:bg-pink-700 text-white">
                                <FileAxis3D className="h-4 w-4" />
                                Export Results (Excel)
                            </Button>
                        </div>
                    </div>
                </div>

                {CourseId && (
                    <Button
                        onClick={handlePublishScores}
                        //  disabled={unpublishedCount === 0 || publishMutation.isPending}
                        disabled={publishMutation.isPending}
                        className="gap-2"
                    >
                        {publishMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="h-4 w-4" />
                        )}
                        Publish Scores 0...
                        {/* Publish Scores ({unpublishedCount}) */}
                    </Button>
                )}
            </div>

            <hr className='my-10 bg-site-a-dark' />

            {publishMutation.isSuccess && (
                <Alert className="border-green-500 bg-green-50 text-green-800">
                    <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                    <AlertTitle>Success! Your changes have been saved</AlertTitle>
                    <AlertDescription className='text-site-a'>
                        Successfully published {rawScores.length} student scores!
                        {/* Successfully published {publishMutation.data.publishedCount} student scores! */}
                    </AlertDescription>
                </Alert>
            )}

            {CourseId && (
                <>
                    {scoresLoading ? (
                        <Card>
                            <CardContent className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <span className="ml-2">Loading student scores...</span>
                            </CardContent>
                        </Card>
                    ) : scoresError ? (
                        <Alert variant={"destructive"}>
                            <AlertDescription>
                                Error loading student scores. Please try again.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <ScoreAnalytics scores={filteredStudents} />
                            <StudentTableSearchBlock
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                filterStatus={filterStatus}
                                setFilterStatus={setFilterStatus}
                            />
                            <StudentScoresTable scores={filteredStudents} />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentsInCourse;














// "use client";

// import React, { useEffect, useState } from "react";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//     Card,
//     CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { FileArchive, FileAxis3D, Loader2 } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";
// import * as XLSX from "xlsx";
// import { ScoreAnalytics } from "@/app/(dashboard)/dashboard/admin/students-grade-report/components/ScoreAnalytics";
// import { StudentScoresTable } from "@/app/(dashboard)/dashboard/admin/students-grade-report/components/StudentScoresTable";
// import { fetchStudentsResults } from "@/app/actions/teacher.results";
// import { publishScores } from "@/app/actions/admin";
// import { useParams } from "next/navigation";
// // import StudentTableSearchBlock from "./StudentTableSearchBlock";

// export type ActivityType = "assign" | "quiz" | "exam" | string;
// export type StudentActivity = {
//     activity_name: string;
//     type: ActivityType;
//     grade: string;
//     max_grade: string;
// };
// export type StudentScore = {
//     student_id: number;
//     student_email: string;
//     student_username: string;
//     final_grade: number;
//     letter_grade: string;
//     credit_load: number;
//     quality_points: number;
//     activities: StudentActivity[];
// };

// // const dummyCourses = [
// //     { id: "1", course_title: "Mathematics 101", code: "MATH101" },
// //     { id: "2", course_title: "Computer Science 201", code: "CS 201" },
// //     { id: "4", course_title: "English 301", code: "ENG 301" },
// //     { id: "5", course_title: "Physics 401", code: "PHY 101" },
// //     { id: "6", course_title: "Oratory 101", code: "ORY 101" },
// //     { id: "7", course_title: "Statistics 304", code: "STAT 101" },
// //     { id: "8", course_title: "Internet 401", code: "INT 101" },
// //     { id: "9", course_title: "Biology 202", code: "BIO 101" },
// // ];

// // const dummyScores: StudentScore[] = [
// //     {
// //         student_id: 1,
// //         student_email: "ebere@gmail.com",
// //         student_username: "nm34fhdkofrrgk",
// //         final_grade: 40,
// //         letter_grade: "E",
// //         credit_load: 3,
// //         quality_points: 12,
// //         activities: [
// //             {
// //                 activity_name: "Assignment 1",
// //                 type: "assign",
// //                 grade: "40",
// //                 max_grade: "100",
// //             },
// //             { activity_name: "Quiz 1", type: "quiz", grade: "50", max_grade: "100" },
// //             {
// //                 activity_name: "Midterm Exam",
// //                 type: "exam",
// //                 grade: "55",
// //                 max_grade: "100",
// //             },
// //         ],
// //     },
// //     {
// //         student_id: 2,
// //         student_email: "albert@gmail.com",
// //         student_username: "stvj79340ndl",
// //         final_grade: 85,
// //         letter_grade: "A",
// //         credit_load: 3,
// //         quality_points: 12,
// //         activities: [
// //             {
// //                 activity_name: "Assignment 3",
// //                 type: "assign",
// //                 grade: "90",
// //                 max_grade: "100",
// //             },
// //             { activity_name: "Quiz 1", type: "quiz", grade: "80", max_grade: "100" },
// //             {
// //                 activity_name: "Midterm Exam",
// //                 type: "exam",
// //                 grade: "85",
// //                 max_grade: "100",
// //             },
// //         ],
// //     },
// //     {
// //         student_id: 2,
// //         student_email: "akpa@gmail.com",
// //         student_username: "jk345454lh",
// //         final_grade: 60,
// //         letter_grade: "B",
// //         credit_load: 3,
// //         quality_points: 4,
// //         activities: [
// //             {
// //                 activity_name: "Assignment 1",
// //                 type: "assign",
// //                 grade: "90",
// //                 max_grade: "100",
// //             },
// //             { activity_name: "Quiz 1", type: "quiz", grade: "80", max_grade: "100" },
// //             {
// //                 activity_name: "Midterm Exam",
// //                 type: "exam",
// //                 grade: "85",
// //                 max_grade: "100",
// //             },
// //         ],
// //     },
// //     {
// //         student_id: 4,
// //         student_email: "maurice@gmail.com",
// //         student_username: "ojdk6783hk",
// //         final_grade: 35,
// //         letter_grade: "F",
// //         credit_load: 3,
// //         quality_points: 1,
// //         activities: [
// //             {
// //                 activity_name: "Assignment 4",
// //                 type: "assign",
// //                 grade: "90",
// //                 max_grade: "100",
// //             },
// //             { activity_name: "Quiz 1", type: "quiz", grade: "80", max_grade: "100" },
// //             {
// //                 activity_name: "Midterm Exam",
// //                 type: "exam",
// //                 grade: "85",
// //                 max_grade: "100",
// //             },
// //         ],
// //     },
// //     {
// //         student_id: 5,
// //         student_email: "emma@gmail.com",
// //         student_username: "yjkdk567889",
// //         final_grade: 55,
// //         letter_grade: "C",
// //         credit_load: 3,
// //         quality_points: 8,
// //         activities: [
// //             {
// //                 activity_name: "Assignment 1",
// //                 type: "assign",
// //                 grade: "90",
// //                 max_grade: "100",
// //             },
// //             { activity_name: "Quiz 1", type: "quiz", grade: "80", max_grade: "100" },
// //             {
// //                 activity_name: "Midterm Exam",
// //                 type: "exam",
// //                 grade: "85",
// //                 max_grade: "100",
// //             },
// //         ],
// //     },
// //     {
// //         student_id: 6,
// //         student_email: "emma@gmail.com",
// //         student_username: "yjkdk567889",
// //         final_grade: 45,
// //         letter_grade: "D",
// //         credit_load: 3,
// //         quality_points: 8,
// //         activities: [
// //             {
// //                 activity_name: "Assignment 1",
// //                 type: "assign",
// //                 grade: "60",
// //                 max_grade: "100",
// //             },
// //             { activity_name: "Quiz 1", type: "quiz", grade: "80", max_grade: "100" },
// //             {
// //                 activity_name: "Midterm Exam",
// //                 type: "exam",
// //                 grade: "65",
// //                 max_grade: "100",
// //             },
// //         ],
// //     },
// // ];
// const StudentsInCourse = () => {
//     const params = useParams();
//     const CourseId = params?.id as string;

//     const [scores, setScores] = useState<StudentScore[]>([]);
//     const queryClient = useQueryClient();
//     const { access_token } = useAuth();

//     const {
//         data: studentscores,
//         isLoading: scoresLoading,
//         error: scoresError
//     } = useQuery({
//         queryKey: ['student-scores', CourseId],
//         queryFn: () => fetchStudentsResults(CourseId),
//         enabled: !!CourseId && (!!access_token && access_token.trim() !== "")
//     });

//     // Mutations
//     const publishMutation = useMutation({
//         mutationFn: ({ courseId, access_token }: { courseId: string | number; access_token: string }) =>
//             publishScores(courseId, access_token),

//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['studentScores', CourseId] });
//         },
//     });

//     const handlePublishScores = () => {
//         if (typeof access_token === "string" && access_token.trim() !== "") {
//             publishMutation.mutate({ courseId: CourseId, access_token });
//         } else {
//             console.warn("Access token is missing or invalid.");
//         }
//     };

//     useEffect(() => {
//         if (Array.isArray(studentscores)) setScores(studentscores);
//         else setScores([]);
//     }, [studentscores])
//     useEffect(() => {
//         if (CourseId) console.log('CourseId', CourseId)
//     }, [CourseId])

//     const exportToCSV = () => {
//         const csvContent = convertToCSV(studentscores);
//         downloadFile(csvContent, "results.csv", "text/csv");
//     };

//     const exportToExcel = () => {
//         const ws = XLSX.utils.json_to_sheet(studentscores);
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "Results");
//         XLSX.writeFile(wb, "results.xlsx");
//     };

//     // Helper functions for export
//     const convertToCSV = (data: StudentScore[]) => {
//         const headers = [
//             "Student ID",
//             "Email",
//             "Username",
//             "Final Grade",
//             "Letter Grade",
//         ];
//         const rows = data.map((student) => [
//             student.student_id,
//             student.student_email,
//             student.student_username,
//             student.final_grade,
//             student.letter_grade,
//         ]);

//         return [headers, ...rows].map((row) => row.join(",")).join("\n");
//     };

//     const downloadFile = (content: string, filename: string, type: string) => {
//         const blob = new Blob([content], { type });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = filename;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);
//     };

//     return (
//         <div className="container mx-auto p-6 space-y-6">
//             <div className="flex justify-between items-center">
//                 <div>
//                     <h1 className="text-3xl font-bold">Student Scores Overview</h1>
//                     <p className="text-muted-foreground">
//                         Preview of students performance data for this course.
//                     </p>
//                 </div>

//                 {/* {selectedCourseId && ( */}
//                 {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//                     <Button
//                         onClick={handlePublishResult}
//                         // disabled={unpublishedCount === 0 || publishMutation.isPending}
//                         disabled={exportDocumentMutation.isPending}
//                         className="gap-2"
//                     >
//                         {exportDocumentMutation.isPending ? (
//                             <Loader2 className="h-4 w-4 animate-spin" />
//                         ) : (
//                             <Upload className="h-4 w-4" />
//                         )}
//                         Export Results(CSV)

//                     </Button>
//                     <Button
//                         onClick={handlePublishResult}
//                         // disabled={unpublishedCount === 0 || publishMutation.isPending}
//                         disabled={exportDocumentMutation.isPending}
//                         className="gap-2"
//                     >
//                         {exportDocumentMutation.isPending ? (
//                             <Loader2 className="h-4 w-4 animate-spin" />
//                         ) : (
//                             <Upload className="h-4 w-4" />
//                         )}
//                         Export Results(Excel)

//                     </Button>

//                 </div> */}

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <Button onClick={exportToCSV} className="gap-2 bg-white text-black">
//                         <FileArchive className="h-4 w-4" />
//                         Export Results (CSV)
//                     </Button>
//                     <Button onClick={exportToExcel} className="gap-2">
//                         <FileAxis3D className="h-4 w-4" />
//                         Export Results (Excel)
//                     </Button>
//                 </div>

//                 {/* )} */}
//             </div>

//             {/* {exportDocumentMutation.isSuccess && (
//                 <Alert className="border-green-500 bg-green-50 text-green-800">
//                     <CheckCircle2Icon className="h-5 w-5 text-green-600" />
//                     <AlertTitle>Success! Your changes have been saved</AlertTitle>
//                     <AlertDescription className='text-site-a'>
//                         Successfully published {scores.length} student scores!

//                     </AlertDescription>
//                 </Alert>
//             )} */}

//             {CourseId && (
//                 <>
//                     {scoresLoading ? (
//                         <Card>
//                             <CardContent className="flex items-center justify-center py-8">
//                                 <Loader2 className="h-8 w-8 animate-spin" />
//                                 <span className="ml-2">Loading student scores...</span>
//                             </CardContent>
//                         </Card>
//                     ) : scoresError ? (
//                         <Alert variant={"destructive"}>
//                             <AlertDescription>
//                                 Error loading student scores. Please try again.
//                             </AlertDescription>
//                         </Alert>
//                     ) : (
//                         <>
//                             <ScoreAnalytics scores={studentscores} />
//                             {/* <StudentTableSearchBlock /> */}
//                             <StudentScoresTable scores={studentscores} />
//                         </>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// };

// export default StudentsInCourse;











// "use clcient";
// import { useState } from 'react';
// import { Edit, Eye, Filter, Search } from 'lucide-react'
// import React from 'react'
// import { getStatusColor, studentsData } from '../../../data';

// export default function StudentsInCourse() {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterStatus, setFilterStatus] = useState('all');
//     const filteredStudents = studentsData.filter(student => {
//         const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             student.email.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesFilter = filterStatus === 'all' || student.status === filterStatus;
//         return matchesSearch && matchesFilter;
//     });

//     return (
//         <div className="space-y-6">
//             {/* Search and Filter */}
//             <div className="bg-white rounded-lg shadow p-6">
//                 <div className="flex flex-col sm:flex-row gap-4">
//                     <div className="flex-1">
//                         <div className="relative">
//                             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                             <input
//                                 type="text"
//                                 placeholder="Search students..."
//                                 value={searchTerm}
//                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             />
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <Filter className="w-5 h-5 text-gray-400" />
//                         <select
//                             value={filterStatus}
//                             onChange={(e) => setFilterStatus(e.target.value)}
//                             className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         >
//                             <option value="all">All Students</option>
//                             <option value="active">Active</option>
//                             <option value="warning">Needs Attention</option>
//                         </select>
//                     </div>
//                 </div>
//             </div>

//             {/* Students Table */}
//             <div className="bg-white rounded-lg shadow overflow-hidden">
//                 <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                         <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Student
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Email
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Attendance
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Grade
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Status
//                             </th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Actions
//                             </th>
//                         </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                         {filteredStudents.map(student => (
//                             <tr key={student.id} className="hover:bg-gray-50">
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                     <div className="font-medium text-gray-900">{student.name}</div>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                     <a href={`mailto:${student.email}`} className="text-blue-600 hover:text-blue-800">
//                                         {student.email}
//                                     </a>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                     <span className="text-gray-900">{student.attendance}</span>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                     <span className="font-medium text-gray-900">{student.grade}</span>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap">
//                                     <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
//                                         {student.status === 'active' ? 'Active' : 'Needs Attention'}
//                                     </span>
//                                 </td>
//                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                     <button className="text-blue-600 hover:text-blue-800 mr-3">
//                                         <Eye className="w-4 h-4" />
//                                     </button>
//                                     <button className="text-gray-600 hover:text-gray-800">
//                                         <Edit className="w-4 h-4" />
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     )
// }
