

"use client";

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
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState<Position>({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);
    const dragStartPos = useRef<Position>({ x: 0, y: 0 });

    useEffect(() => {
        setMounted(true);
        // Initialize position safely after mount
        const updatePosition = () => {
            const popupWidth = 320; // Match your popup's width
            setPosition({
                x: Math.max(0, window.innerWidth - popupWidth - 20), // 20px margin from right
                y: Math.max(0, Math.min(50, window.innerHeight - 200)) // 200px is approx popup height
            });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, []);

    // Handle viewport resize
    useEffect(() => {
        if (!mounted) return;

        const handleResize = () => {
            if (popupRef.current) {
                const maxX = window.innerWidth - popupRef.current.offsetWidth;
                setPosition(prev => ({
                    ...prev,
                    x: Math.min(prev.x, maxX)
                }));
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [mounted]);

    // Handle viewport resize
    useEffect(() => {
        const handleResize = () => {
            if (popupRef.current) {
                const maxX = window.innerWidth - popupRef.current.offsetWidth;
                setPosition(prev => ({
                    ...prev,
                    x: Math.min(prev.x, maxX)
                }));
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!popupRef.current) return;

        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };

        // Improve cursor feedback during drag
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;

        const newX = e.clientX - dragStartPos.current.x;
        const newY = e.clientY - dragStartPos.current.y;

        // Calculate boundaries
        const maxX = window.innerWidth - (popupRef.current?.offsetWidth || 0);
        const maxY = window.innerHeight - (popupRef.current?.offsetHeight || 0);

        setPosition({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
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
    }, [isDragging]);

    const handleClose = () => onClose?.();
    const handleUpload = () => onUploadClick?.();
    const toggleMinimize = () => setIsMinimized(!isMinimized);

    if (!isVisible || !mounted) return null;

    return (
        <div
            ref={popupRef}
            className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-orange-200 transition-all duration-100 max-w-[95vw] ${isDragging ? 'cursor-grabbing' : 'cursor-default'
                } ${isMinimized ? 'w-80 h-16' : 'w-80'}`}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                willChange: isDragging ? 'transform' : 'auto'
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

            {/* Content (same as before) */}
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

                    <div className="mt-3 text-xs text-gray-500 text-center">
                        Application Status: Transcript Pending
                    </div>
                </div>
            )}
        </div>
    );
};



// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { X, Upload, AlertCircle, GripVertical } from 'lucide-react';
// import { Alert, AlertDescription } from '@/components/ui/alert';

// interface Position {
//     x: number;
//     y: number;
// }

// interface DraggableTranscriptReminderProps {
//     isVisible?: boolean;
//     onClose?: () => void;
//     onUploadClick?: () => void;
//     studentName?: string;
// }

// export const DraggableTranscriptReminder: React.FC<DraggableTranscriptReminderProps> = ({
//     isVisible = true,
//     onClose,
//     onUploadClick,
//     studentName = "Student"
// }) => {
//     const [position, setPosition] = useState<Position>({
//         x: typeof window !== 'undefined' ? window.innerWidth - 350 : 0, // Default to right-aligned
//         y: 50
//     });
//     const [isDragging, setIsDragging] = useState(false);
//     const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
//     const [isMinimized, setIsMinimized] = useState(false);
//     const popupRef = useRef<HTMLDivElement>(null);

//     // Handle viewport resize
//     useEffect(() => {
//         const handleResize = () => {
//             if (popupRef.current) {
//                 const maxX = window.innerWidth - popupRef.current.offsetWidth;
//                 setPosition(prev => ({
//                     ...prev,
//                     x: Math.min(prev.x, maxX)
//                 }));
//             }
//         };
//         window.addEventListener('resize', handleResize);
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);

//     const handleMouseDown = (e: React.MouseEvent) => {
//         if (!popupRef.current) return;
//         const rect = popupRef.current.getBoundingClientRect();
//         setIsDragging(true);
//         setDragOffset({
//             x: e.clientX - rect.left,
//             y: e.clientY - rect.top
//         });
//     };

//     const handleMouseMove = useCallback((e: MouseEvent) => {
//         if (!isDragging || !popupRef.current) return;

//         const newX = e.clientX - dragOffset.x;
//         const newY = e.clientY - dragOffset.y;

//         // Calculate boundaries
//         const maxX = window.innerWidth - popupRef.current.offsetWidth;
//         const maxY = window.innerHeight - popupRef.current.offsetHeight;

//         setPosition({
//             x: Math.max(0, Math.min(newX, maxX)),
//             y: Math.max(0, Math.min(newY, maxY))
//         });
//     }, [dragOffset.x, dragOffset.y, isDragging]);

//     const handleMouseUp = () => {
//         setIsDragging(false);
//     };

//     useEffect(() => {
//         if (isDragging) {
//             document.addEventListener('mousemove', handleMouseMove);
//             document.addEventListener('mouseup', handleMouseUp);
//             return () => {
//                 document.removeEventListener('mousemove', handleMouseMove);
//                 document.removeEventListener('mouseup', handleMouseUp);
//             };
//         }
//     }, [isDragging, dragOffset, handleMouseMove]);

//     const handleClose = () => onClose?.();
//     const handleUpload = () => onUploadClick?.();
//     const toggleMinimize = () => setIsMinimized(!isMinimized);

//     if (!isVisible) return null;

//     return (
//         <div
//             ref={popupRef}
//             className={`fixed z-50 bg-white rounded-lg shadow-2xl border border-orange-200 transition-all duration-300 max-w-[95vw] ${isDragging ? 'cursor-grabbing' : 'cursor-default'
//                 } ${isMinimized ? 'w-80 h-16' : 'w-80'}`}
//             style={{
//                 left: `${position.x}px`,
//                 top: `${position.y}px`,
//             }}
//         >
//             {/* Header */}
//             <div
//                 className={`flex items-center justify-between p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'
//                     }`}
//                 onMouseDown={handleMouseDown}
//             >
//                 <div className="flex items-center gap-2">
//                     <GripVertical className="w-4 h-4 opacity-70" />
//                     <AlertCircle className="w-4 h-4" />
//                     <span className="font-medium text-sm">Transcript Required</span>
//                 </div>
//                 <div className="flex items-center gap-1">
//                     <button
//                         onClick={toggleMinimize}
//                         className="p-1 hover:bg-white/20 rounded transition-colors"
//                         title={isMinimized ? "Expand" : "Minimize"}
//                     >
//                         <div className={`w-3 h-0.5 bg-white transition-transform ${isMinimized ? 'rotate-90' : ''}`} />
//                     </button>
//                     <button
//                         onClick={handleClose}
//                         className="p-1 hover:bg-white/20 rounded transition-colors"
//                         title="Close"
//                     >
//                         <X className="w-4 h-4" />
//                     </button>
//                 </div>
//             </div>

//             {/* Content */}
//             {!isMinimized && (
//                 <div className="p-4">
//                     <Alert className="border-orange-200 bg-orange-50">
//                         <AlertCircle className="h-4 w-4 text-orange-600" />
//                         <AlertDescription className="text-orange-800">
//                             <div className="space-y-3">
//                                 <p className="font-medium">
//                                     Hi {studentName}! 👋
//                                 </p>
//                                 <p className="text-sm">
//                                     Your transcript upload is still pending. Please upload your official transcript to complete your application.
//                                 </p>
//                                 <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
//                                     <strong>Required:</strong> Official transcript from your previous institution
//                                 </div>
//                             </div>
//                         </AlertDescription>
//                     </Alert>

//                     {/* Action Buttons */}
//                     <div className="flex gap-2 mt-4">
//                         <button
//                             onClick={handleUpload}
//                             className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
//                         >
//                             <Upload className="w-4 h-4" />
//                             Upload Now
//                         </button>
//                         <button
//                             onClick={handleClose}
//                             className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
//                         >
//                             Remind Later
//                         </button>
//                     </div>

//                     {/* Progress indicator */}
//                     <div className="mt-3 text-xs text-gray-500 text-center">
//                         Application Status: Transcript Pending
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };
