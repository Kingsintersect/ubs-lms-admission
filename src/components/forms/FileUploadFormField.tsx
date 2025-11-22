'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useController, Control, FieldValues, Path } from 'react-hook-form';
import { Upload, X, Eye, FileText, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

// Types
export interface FileUploadProps<T extends FieldValues> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    placeholder?: string;
    maxSize?: number; // in MB
    accept?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
    error?: string;
    helperText?: string;
}

interface FilePreview {
    file?: File;
    url?: string;
    name: string;
    size: number;
    type: string;
}

// Utility functions
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const isImageFile = (type: string): boolean => {
    return type.startsWith('image/');
};

const getFileIcon = (type: string) => {
    if (isImageFile(type)) {
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    return <FileText className="h-8 w-8 text-blue-500" />;
};

// Main component
export function FileUploadFormField<T extends FieldValues>({
    name,
    control,
    label,
    placeholder = "Click to upload file",
    maxSize = 10, // 10MB default
    accept = ".jpg,.jpeg,.png,.psd,.pdf,.doc,.docx,.txt",
    required = false,
    disabled = false,
    className = "",
    error,
    helperText,
}: FileUploadProps<T>) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [preview, setPreview] = useState<FilePreview | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const {
        field: { onChange, value, onBlur },
        fieldState: { error: fieldError },
    } = useController({
        name,
        control,
        rules: { required: required ? 'This field is required' : false },
    });

    // Initialize preview from existing value
    React.useEffect(() => {
        if (value) {
            console.log('value', value);
            if (value.constructor.name === 'File') {
                setPreview({
                    file: value as File,
                    name: (value as File).name,
                    size: (value as File).size,
                    type: (value as File).type,
                });
            } else if (typeof value === 'string') {
                // Assume it's a URL
                const fileName = value.split('/').pop() || 'Unknown file';
                setPreview({
                    url: value,
                    name: fileName,
                    size: 0,
                    type: 'image/jpeg', // Default assumption for URL
                });
            }
        } else {
            setPreview(null);
        }
    }, [value]);

    const handleFileSelect = useCallback((file: File) => {
        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
            alert(`File size must be less than ${maxSize}MB`);
            return;
        }

        const filePreview: FilePreview = {
            file,
            name: file.name,
            size: file.size,
            type: file.type,
        };

        setPreview(filePreview);
        onChange(file);
    }, [maxSize, onChange]);

    const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);

        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (event: React.DragEvent) => {
        event.preventDefault();
        setIsDragOver(false);
    };

    const handleRemoveFile = () => {
        setPreview(null);
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    };

    const displayError = error || fieldError?.message;

    return (
        <div className={`flex flex-col space-y-2 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div
                className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer
          ${isDragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'}
          ${displayError ? 'border-red-300 dark:border-red-600' : ''}
        `}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={accept}
                    onChange={handleFileInput}
                    onBlur={onBlur}
                    disabled={disabled}
                />

                {preview ? (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {isImageFile(preview.type) && preview.file ? (
                                <div className="relative h-12 w-12">
                                    <Image
                                        fill
                                        alt={preview.name}
                                        src={URL.createObjectURL(preview.file)}
                                        className="h-12 w-12 object-cover rounded"
                                    />
                                </div>
                            ) : isImageFile(preview.type) && preview.url ? (
                                <div className="relative h-12 w-12">
                                    <Image
                                        fill
                                        alt={preview.name}
                                        src={preview.url}
                                        className="h-12 w-12 object-cover rounded"
                                    />
                                </div>
                            ) : (
                                getFileIcon(preview.type)
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                    {preview.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatFileSize(preview.size)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {(isImageFile(preview.type)) && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPreview(true);
                                    }}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    title="Preview"
                                >
                                    <Eye className="h-4 w-4" />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveFile();
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                title="Remove file"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {placeholder}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                Max {maxSize}MB
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {helperText && !displayError && (
                <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
            )}

            {displayError && (
                <p className="text-xs text-red-600 dark:text-red-400">{displayError}</p>
            )}

            {/* Image Preview Modal */}
            {showPreview && preview && isImageFile(preview.type) && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setShowPreview(false)}
                >
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg max-w-3xl max-h-3xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {preview.name}
                            </h3>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="relative max-w-full max-h-96">
                            <Image
                                fill
                                src={preview.file ? URL.createObjectURL(preview.file) : preview.url || '/emptystate/notfound.avif'}
                                alt={preview.name}
                                className="max-w-full max-h-96 object-contain mx-auto"
                                onError={(e) => {
                                    e.currentTarget.src = '/emptystate/notfound.avif';
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}