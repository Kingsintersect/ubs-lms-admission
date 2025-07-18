"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { ApplicationContainer } from './components/ApplicationContainer';

const ViewStudentAdmission = () => {
    const params = useParams();
    const id = params?.id as string;
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Review Application</h1>
                            <p className="text-gray-600">University Business School - Application Review</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">AO</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ApplicationContainer
                id={id}
            />
        </div>
    );
};

export default ViewStudentAdmission;
