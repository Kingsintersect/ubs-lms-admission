import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, AlertCircle, GripVertical } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Position {
    x: number;
    y: number;
}

interface DraggableTranscriptReminderProps {
    isVisible?: boolean;
    onClose?: () => void;
    onUploadClick?: () => void;
    studentName?: string;
}

export const DraggableTranscriptReminder: React.FC<DraggableTranscriptReminderProps> = ({
    isVisible = true,
    onClose,
    onUploadClick,
    studentName = "Student"
}) => {
    const [position, setPosition] = useState<Position>({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const [isMinimized, setIsMinimized] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!popupRef.current) return;

        const rect = popupRef.current.getBoundingClientRect();
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // Keep popup within viewport bounds
        const maxX = window.innerWidth - 320;
        const maxY = window.innerHeight - 200;

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const handleUpload = () => {
        if (onUploadClick) {
            onUploadClick();
        } else {
            // Default behavior - you can customize this
            alert('Redirecting to transcript upload page...');
        }
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    if (!isVisible) return null;

    return (
        <div
            ref={popupRef}
            className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-orange-200 transition-all duration-300 ${isDragging ? 'cursor-grabbing' : 'cursor-default'
                } ${isMinimized ? 'w-80 h-16' : 'w-80'}`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            {/* Header */}
            <div
                className={`flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                onMouseDown={handleMouseDown}
            >
                <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 opacity-70" />
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">Transcript Required</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={toggleMinimize}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title={isMinimized ? "Expand" : "Minimize"}
                    >
                        <div className={`w-3 h-0.5 bg-white transition-transform ${isMinimized ? 'rotate-90' : ''}`} />
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="p-4">
                    <Alert className="border-orange-200 bg-orange-50">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                            <div className="space-y-3">
                                <p className="font-medium">
                                    Hi {studentName}! 👋
                                </p>
                                <p className="text-sm">
                                    Your transcript upload is still pending. Please upload your official transcript to complete your application.
                                </p>
                                <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                                    <strong>Required:</strong> Official transcript from your previous institution
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleUpload}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Now
                        </button>
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                        >
                            Remind Later
                        </button>
                    </div>

                    {/* Progress indicator */}
                    <div className="mt-3 text-xs text-gray-500 text-center">
                        Application Status: Transcript Pending
                    </div>
                </div>
            )}
        </div>
    );
};

// Demo component to show the popup in action
// const TranscriptReminderDemo: React.FC = () => {
//     const [showPopup, setShowPopup] = useState(true);

//     const handleClose = () => {
//         setShowPopup(false);
//         // Auto-show again after 5 seconds for demo purposes
//         setTimeout(() => setShowPopup(true), 5000);
//     };

//     const handleUpload = () => {
//         alert('Opening transcript upload page...\n\nIn a real app, this would navigate to your upload form or open a file picker.');
//         setShowPopup(false);
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
//             <div className="max-w-4xl mx-auto">
//                 <h1 className="text-3xl font-bold text-gray-800 mb-4">
//                     Student Portal Dashboard
//                 </h1>
//                 <p className="text-gray-600 mb-8">
//                     Welcome to your student dashboard. The transcript reminder popup is draggable - try moving it around!
//                 </p>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div className="bg-white rounded-lg shadow p-6">
//                         <h2 className="text-xl font-semibold mb-4">Course Schedule</h2>
//                         <div className="space-y-2 text-gray-600">
//                             <p>• Mathematics 101 - 9:00 AM</p>
//                             <p>• Physics 201 - 11:00 AM</p>
//                             <p>• Chemistry 301 - 2:00 PM</p>
//                         </div>
//                     </div>

//                     <div className="bg-white rounded-lg shadow p-6">
//                         <h2 className="text-xl font-semibold mb-4">Assignments</h2>
//                         <div className="space-y-2 text-gray-600">
//                             <p>• Lab Report Due: Tomorrow</p>
//                             <p>• Math Homework: Due Friday</p>
//                             <p>• Research Paper: Due Next Week</p>
//                         </div>
//                     </div>
//                 </div>

//                 {!showPopup && (
//                     <button
//                         onClick={() => setShowPopup(true)}
//                         className="fixed bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
//                     >
//                         Show Reminder
//                     </button>
//                 )}
//             </div>

//             <DraggableTranscriptReminder
//                 isVisible={showPopup}
//                 onClose={handleClose}
//                 onUploadClick={handleUpload}
//                 studentName="Alex"
//             />
//         </div>
//     );
// };

// export default TranscriptReminderDemo;