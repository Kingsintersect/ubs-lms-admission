// ACCEPTS MULTIPLE DOCUMENT

"use client";

import { notify } from "@/contexts/ToastProvider";
import { AlertCircle, FileText, Upload, X } from "lucide-react";
import { useState } from "react";
import type { FieldValues, Path, UseFormSetValue } from "react-hook-form";

/**
 * usage
 * <DocumentUpload
  name="documents"
  setValue={setValue}
  uploadFn={uploadFile}
  multiple
  maxFiles={10}
  maxSize={10} // 10MB per file
/>
*
*<DocumentUpload
  name="document"
  setValue={setValue}
  uploadFn={uploadFile}
/>
 */

interface UploadedFile {
    name: string;
    url: string;
}

interface DocumentUploadProps<T extends FieldValues> {
    name: Path<T>;
    title?: string;
    error?: string;
    onFileChange?: (files: File[] | null) => void;
    setValue: UseFormSetValue<T>;
    uploadFn: (file: File) => Promise<{ success?: { message: string; file_url: string }; error?: string }>;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number; // in MB
}

export function DocumentUpload<T extends FieldValues>({
    name,
    title,
    error,
    onFileChange,
    setValue,
    uploadFn,
    multiple = false,
    maxFiles = 5,
    maxSize = 5,
}: DocumentUploadProps<T>) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (file: File) => {
        if (file.size > maxSize * 1024 * 1024) {
            notify({
                message: `File is too large. Max size is ${maxSize}MB`,
                variant: "error",
                timeout: 5000,
            });
            return null;
        }

        setUploading(true);
        try {
            const { success, error } = await uploadFn(file);
            if (success) {
                notify({
                    message: success.message,
                    variant: "success",
                    timeout: 5000,
                });
                return { name: file.name, url: success.file_url };
            } else {
                console.error("Upload failed:", error);
                notify({
                    message: error || "Document Upload Failed. Try Again",
                    variant: "error",
                    timeout: 5000,
                });
                return null;
            }
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = async (newFiles: FileList | File[]) => {
        if (!newFiles || newFiles.length === 0) return;

        // Convert FileList to array and apply limits
        const filesArray = Array.from(newFiles).slice(0, maxFiles - files.length);

        if (filesArray.length + files.length > maxFiles) {
            notify({
                message: `You can upload a maximum of ${maxFiles} files`,
                variant: "error",
                timeout: 5000,
            });
            return;
        }

        const uploadResults = await Promise.all(filesArray.map(handleUpload));
        const successfulUploads = uploadResults.filter((result): result is UploadedFile => result !== null);

        if (successfulUploads.length > 0) {
            const updatedFiles = [...files, ...successfulUploads];
            setFiles(updatedFiles);
            updateFormValue(updatedFiles);
            onFileChange?.(filesArray);
        }
    };

    const updateFormValue = (fileList: UploadedFile[]) => {
        if (multiple) {
            setValue(name, fileList.map(f => f.url) as any);
        } else {
            setValue(name, fileList[0]?.url as any);
        }
    };

    const handleDeleteFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        updateFormValue(updatedFiles);
        onFileChange?.(updatedFiles.length > 0 ? null : null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        handleFileChange(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {title ?? `Upload Document${multiple ? "s" : ""}`}
                <span className="text-red-500">*</span>
            </label>

            <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
                    onChange={(e) => handleFileChange(e.target.files || [])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    multiple={multiple}
                />

                {files.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                        <span className="text-sm text-gray-700 truncate">
                                            {file.name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteFile(index)}
                                        className="text-gray-500 hover:text-red-500"
                                        disabled={uploading}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {files.length < maxFiles && (
                            <div className="flex flex-col items-center space-y-3 pt-2">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Upload className="w-5 h-5 text-gray-400" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-700">
                                        {multiple
                                            ? "Drop more files here, or click to browse"
                                            : "Drop a different file here, or click to browse"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {multiple
                                            ? `You can upload up to ${maxFiles} files (${maxSize}MB each)`
                                            : `Max size: ${maxSize}MB`}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">
                                Drop your {multiple ? "files" : "file"} here, or click to browse
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {multiple
                                    ? `PDF, Word, Excel, Images — up to ${maxFiles} files (${maxSize}MB each)`
                                    : `PDF, Word, Excel, Images — up to ${maxSize}MB`}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {uploading && (
                <p className="text-sm text-gray-500">Uploading files...</p>
            )}

            {error && typeof error === "string" && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </p>
            )}
        </div>
    );
}



// accepts only one document

// "use client";

// import { XButton } from "@/components/XButton";
// import { notify } from "@/contexts/ToastProvider";
// import { AlertCircle, FileText, Upload } from "lucide-react";
// import { useState } from "react";
// import type { FieldValues, Path, UseFormSetValue } from "react-hook-form";

// interface DocumentUploadProps<T extends FieldValues> {
//     name: Path<T>;
//     title?: string;
//     error?: string;
//     onFileChange?: (file: File | null) => void;
//     setValue: UseFormSetValue<T>;
//     uploadFn: (file: File) => Promise<{ success?: { message: string; file_url: string }, error?: string }>;
// }

// export function DocumentUpload<T extends FieldValues>({
//     name,
//     title,
//     error,
//     onFileChange,
//     setValue,
//     uploadFn,
// }: DocumentUploadProps<T>) {
//     const [fileName, setFileName] = useState<string | null>(null);
//     const [dragActive, setDragActive] = useState(false);

//     const handleUpload = async (file: File) => {
//         const { success, error } = await uploadFn(file);
//         if (success) {
//             setValue(name, success.file_url as any); // cast to satisfy `setValue`
//             notify({ message: success.message, variant: "success", timeout: 5000 });
//             return true;
//         } else {
//             console.error("Upload failed:", error);
//             notify({ message: 'Document Upload Failed. Try Again', variant: "error", timeout: 5000 });
//             return false;
//         }
//     };

//     const handleFileChange = (file: File | null) => {
//         if (file) {
//             handleUpload(file);
//             setFileName(file.name);
//         } else {
//             setFileName(null);
//         }
//         onFileChange?.(file);
//     };

//     const handleDeleteFile = () => {
//         setFileName(null);
//         setValue(name, null as any); // Reset the field value
//         onFileChange?.(null);
//     };

//     const handleDrop = (e: React.DragEvent) => {
//         e.preventDefault();
//         setDragActive(false);

//         const files = e.dataTransfer.files;
//         if (files && files[0]) {
//             handleFileChange(files[0]);
//         }
//     };

//     const handleDragOver = (e: React.DragEvent) => {
//         e.preventDefault();
//         setDragActive(true);
//     };

//     const handleDragLeave = () => {
//         setDragActive(false);
//     };

//     return (
//         <div className="space-y-2">
//             <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
//                 <FileText className="w-4 h-4" />
//                 {title ?? "Upload Document"}
//                 <span className="text-red-500">*</span>
//             </label>

//             <div
//                 className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${dragActive
//                     ? 'border-blue-500 bg-blue-50'
//                     : 'border-gray-300 hover:border-gray-400'
//                     }`}
//                 onDrop={handleDrop}
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//             >
//                 <input
//                     type="file"
//                     accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
//                     onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
//                     className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                 />

//                 {fileName ? (
//                     <div className="flex flex-col items-center space-y-3">
//                         <div className="flex items-center gap-2">
//                             <FileText className="w-6 h-6 text-gray-600" />
//                             <span className="text-sm text-gray-700">{fileName}</span>
//                             <XButton onClick={handleDeleteFile} />
//                         </div>
//                         <p className="text-sm text-gray-600">Click to change document or use delete button</p>
//                     </div>
//                 ) : (
//                     <div className="flex flex-col items-center space-y-3">
//                         <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
//                             <Upload className="w-8 h-8 text-gray-400" />
//                         </div>
//                         <div className="text-center">
//                             <p className="text-sm font-medium text-gray-700">
//                                 Drop your document here, or click to browse
//                             </p>
//                             <p className="text-xs text-gray-500 mt-1">
//                                 PDF, Word, Excel, Images — up to 5MB
//                             </p>
//                         </div>
//                     </div>
//                 )}
//             </div>

//             {error && typeof error === 'string' && (
//                 <p className="text-sm text-red-600 flex items-center gap-1">
//                     <AlertCircle className="w-4 h-4" />
//                     {error}
//                 </p>
//             )}
//         </div>
//     );
// }
