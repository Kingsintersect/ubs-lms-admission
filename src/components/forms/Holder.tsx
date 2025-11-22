// File Upload/Preview Component
type FileItem = {
    file?: File;
    url?: string;
    name: string;
    size?: number;
    type?: string;
    isImage?: boolean;
};

export const EditableFileUpload: React.FC<{
    label: string;
    value: (string | File | null | undefined)[]; // Accept URLs, File objects, and null/undefined
    onChange: (files: (string | File | null)[]) => void;
    onFilesChange?: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSize?: number;
    isEditing: boolean;
    className?: string;
    baseUrl?: string;
    showPreview?: boolean;
}> = ({
    label,
    value = [],
    onChange,
    onFilesChange,
    accept = "*/*",
    multiple = false,
    maxFiles = 5,
    maxSize = 10,
    isEditing,
    className,
    baseUrl = "",
    showPreview = true
}) => {
        const [newFiles, setNewFiles] = React.useState<File[]>([]);
        const [previewImage, setPreviewImage] = React.useState<string | null>(null);
        const [previewImageName, setPreviewImageName] = React.useState<string>('');
        const [isModalOpen, setIsModalOpen] = React.useState(false);

        // Convert existing URLs and new files to unified format
        const allFiles: FileItem[] = [
            ...value
                .filter(item => item != null) // Remove null and undefined
                .map(item => {
                    if (typeof item === 'string') {
                        // Handle URL strings
                        const isImage = isImageFile(item);
                        return {
                            url: item,
                            name: item.split('/').pop() || 'Unknown file',
                            type: isImage ? 'image' : 'document',
                            isImage
                        };
                    } else if (item instanceof File) {
                        // Handle File objects
                        return {
                            file: item,
                            name: item.name,
                            size: item.size,
                            type: item.type?.startsWith('image/') ? 'image' : 'document',
                            isImage: item.type?.startsWith('image/') || false
                        };
                    }
                    // Fallback for unexpected types
                    return {
                        name: 'Unknown file',
                        type: 'document',
                        isImage: false
                    };
                }),
            ...newFiles.map(file => ({
                file,
                name: file.name,
                size: file.size,
                type: file.type?.startsWith('image/') ? 'image' : 'document',
                isImage: file.type?.startsWith('image/') || false
            }))
        ];

        // function isImageFile(url: string): boolean {
        //     const extension = url.split('.').pop()?.toLowerCase();
        //     const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
        //     return imageExtensions.includes(extension || '');
        // }
        function isImageFile(item: string | File): boolean {
            if (typeof item === 'string') {
                const extension = item.split('.').pop()?.toLowerCase();
                const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
                return imageExtensions.includes(extension || '');
            } else if (item instanceof File) {
                return item.type.startsWith('image/') || false;
            }
            return false;
        }

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = Array.from(e.target.files || []);

            // Validate file size
            const validFiles = selectedFiles.filter(file => {
                if (file.size > maxSize * 1024 * 1024) {
                    alert(`File ${file.name} is too large. Maximum size is ${maxSize}MB.`);
                    return false;
                }
                return true;
            });

            // Filter out null values from existing files
            const existingFiles = value.filter(item => item != null) as (string | File)[];

            // Limit total number of files
            const totalFiles = existingFiles.length + newFiles.length + validFiles.length;
            if (totalFiles > maxFiles) {
                const allowedCount = maxFiles - existingFiles.length - newFiles.length;
                if (allowedCount > 0) {
                    validFiles.splice(allowedCount);
                    alert(`Only ${allowedCount} more files can be added. Maximum is ${maxFiles} files.`);
                } else {
                    alert(`Maximum ${maxFiles} files allowed.`);
                    return;
                }
            }

            const updatedNewFiles = multiple ?
                [...newFiles, ...validFiles] :
                validFiles.slice(0, 1);

            setNewFiles(updatedNewFiles);

            // Callback for parent component to handle new files
            if (onFilesChange) {
                onFilesChange(updatedNewFiles);
            }
        };

        const removeFile = (index: number) => {
            // Filter out null values first
            const validValues = value.filter(item => item != null);

            if (index < validValues.length) {
                // Remove existing file (URL)
                const newUrls = validValues.filter((_, i) => i !== index);
                onChange(newUrls);
            } else {
                // Remove new file
                const newFileIndex = index - validValues.length;
                const updatedNewFiles = newFiles.filter((_, i) => i !== newFileIndex);

                setNewFiles(updatedNewFiles);
                if (onFilesChange) {
                    onFilesChange(updatedNewFiles);
                }
            }
        };

        const formatFileSize = (bytes?: number) => {
            if (!bytes || bytes === 0) return 'Unknown size';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const getImageUrl = (fileItem: FileItem) => {
            if (fileItem.url) {
                return fileItem.url.startsWith('http') ? fileItem.url : baseUrl + fileItem.url;
            }
            if (fileItem.file) {
                return URL.createObjectURL(fileItem.file);
            }
            return '';
        };

        const getDocumentUrl = (fileItem: FileItem) => {
            if (fileItem.url) {
                return fileItem.url.startsWith('http') ? fileItem.url : baseUrl + fileItem.url;
            }
            if (fileItem.file) {
                return URL.createObjectURL(fileItem.file);
            }
            return '';
        };

        const handleImagePreview = (fileItem: FileItem) => {
            const imageUrl = getImageUrl(fileItem);
            setPreviewImage(imageUrl);
            setPreviewImageName(fileItem.name);
            setIsModalOpen(true);
        };

        const handleDocumentPreview = (fileItem: FileItem) => {
            const documentUrl = getDocumentUrl(fileItem);
            if (documentUrl) {
                window.open(documentUrl, '_blank');
            }
        };

        // First, update the FilePreview component to use fixed dimensions
        const FilePreview: React.FC<{ fileItem: FileItem; index: number }> = ({ fileItem, index }) => {
            return (
                <div className="relative group w-full aspect-square"> {/* Square container */}
                    {fileItem.isImage ? (
                        <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <Image
                                src={getImageUrl(fileItem)}
                                alt={fileItem.name}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) {
                                        fallback.classList.remove('hidden');
                                        fallback.classList.add('flex');
                                    }
                                }}
                            />
                            <div className="hidden w-full h-full items-center justify-center absolute inset-0 bg-gray-100">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                    ) : (
                        <div
                            className="w-full h-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleDocumentPreview(fileItem)}
                        >
                            <FileText className="w-8 h-8 text-gray-500" />
                        </div>
                    )}

                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-black/30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                            <button
                                onClick={() => fileItem.isImage ? handleImagePreview(fileItem) : handleDocumentPreview(fileItem)}
                                className="p-1.5 bg-white rounded-full text-gray-700 hover:text-blue-600 transition-colors"
                                title={fileItem.isImage ? "Preview" : "Open"}
                            >
                                {fileItem.isImage ? <ZoomIn className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            {isEditing && (
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-1.5 bg-white rounded-full text-gray-700 hover:text-red-600 transition-colors"
                                    title="Remove"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* File info at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-white/90 backdrop-blur-sm rounded-b-lg">
                        <p className="text-xs font-medium text-gray-800 truncate" title={fileItem.name}>
                            {fileItem.name}
                        </p>
                        {fileItem.size && (
                            <p className="text-xs text-gray-500">{formatFileSize(fileItem.size)}</p>
                        )}
                    </div>
                </div>
            );
        };

        // Special rendering for single file upload
        const renderSingleFileUpload = () => {
            const fileItem = allFiles[0];
            const isEmpty = allFiles.length === 0;

            return (
                <div className="flex flex-col">
                    {isEmpty ? (
                        isEditing ? (
                            // Edit mode - show upload prompt
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                <input
                                    type="file"
                                    accept={accept}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id={`file-upload-${label.replace(/\s+/g, '_').toLowerCase()}`}
                                />
                                <label
                                    htmlFor={`file-upload-${label.replace(/\s+/g, '_').toLowerCase()}`}
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">Click to upload file</p>
                                    <p className="text-xs text-gray-500 mt-1">Max {maxSize}MB</p>
                                </label>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-400 italic">No file/document uploaded</div>
                        )
                    ) : showPreview ? (
                        // Show preview when enabled
                        <div className="border rounded-lg bg-gray-50 overflow-hidden">
                            {fileItem.isImage ? (
                                // Image preview - fill/cover the upload box
                                <>
                                    <div className="relative w-full h-32 bg-gray-200">
                                        <Image
                                            src={getImageUrl(fileItem)}
                                            alt={fileItem.name}
                                            fill
                                            className="object-cover"
                                        />
                                        {isEditing && (
                                            <div className="absolute top-2 right-2 flex space-x-1">
                                                <button
                                                    onClick={() => handleImagePreview(fileItem)}
                                                    className="bg-white/80 hover:bg-white p-1.5 rounded-full shadow-sm"
                                                    title="Preview"
                                                >
                                                    <ZoomIn className="w-4 h-4 text-gray-700" />
                                                </button>
                                                <button
                                                    onClick={() => removeFile(0)}
                                                    className="bg-white/80 hover:bg-white p-1.5 rounded-full shadow-sm"
                                                    title="Remove"
                                                >
                                                    <X className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {/* Image information displayed under */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <ImageIcon className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm font-medium truncate">
                                                    {fileItem.name}
                                                </span>
                                            </div>
                                            {!isEditing && (
                                                <button
                                                    onClick={() => handleImagePreview(fileItem)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="Preview"
                                                >
                                                    <ZoomIn className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span>{formatFileSize(fileItem.size)}</span>
                                            {isEditing && (
                                                <button
                                                    onClick={() => handleFileInputClick()}
                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    Change file
                                                </button>
                                            )}
                                        </div>
                                        <div className="w-full flex items-center justify-center mt-2">
                                            <button
                                                onClick={() => handleImagePreview(fileItem)}
                                                className="text-blue-500 hover:text-blue-700"
                                                title="Preview"
                                            >
                                                <ZoomIn className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // Document preview - centered icon with filename under
                                <div className="px-8 py-3 text-center">
                                    <div className="flex flex-col items-center space-y-4">
                                        <FileText className="w-16 h-16 text-blue-500" />
                                        <div className="w-full">
                                            <p className="text-sm font-medium text-gray-800 truncate px-4" title={fileItem.name}>
                                                {fileItem.name}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formatFileSize(fileItem.size)}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleDocumentPreview(fileItem)}
                                                className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50"
                                                title="Open"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {isEditing && (
                                                <>
                                                    <button
                                                        onClick={() => removeFile(0)}
                                                        className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                                                        title="Remove"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Show simple list when preview is disabled
                        <div className="flex items-center">
                            {fileItem.isImage ? (
                                <ImageIcon className="w-4 h-4 mr-2 text-gray-500" />
                            ) : (
                                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                            )}
                            <span className="text-sm text-gray-800 truncate">
                                {fileItem.name}
                            </span>
                        </div>
                    )}
                </div>
            );
        };

        const handleFileInputClick = () => {
            const input = document.getElementById(`file-upload-${label.replace(/\s+/g, '_').toLowerCase()}`) as HTMLInputElement;
            if (input) {
                input.value = ''; // Reset to allow re-selecting the same file
                input.click();
            }
        };

        return (
            <>
                <div className={className}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label}
                    </label>

                    {!multiple ? (
                        renderSingleFileUpload()
                    ) : (
                        <>
                            {allFiles.length > 0 ? (
                                showPreview ? (
                                    <div className="mb-4">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {allFiles.map((fileItem, index) => (
                                                <FilePreview key={index} fileItem={fileItem} index={index} />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {allFiles.map((fileItem, index) => (
                                            <div key={index} className="flex items-center">
                                                {fileItem.isImage ? (
                                                    <ImageIcon className="w-4 h-4 mr-2 text-gray-500" />
                                                ) : (
                                                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                                )}
                                                <span className="text-sm text-gray-800">
                                                    {fileItem.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )
                            ) : (
                                <div className="text-sm text-gray-400 italic">No files/documents uploaded</div>
                            )}

                            {isEditing && (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                                    <input
                                        type="file"
                                        accept={accept}
                                        multiple={multiple}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id={`file-upload-${label.replace(/\s+/g, '_').toLowerCase()}`}
                                    />
                                    <label
                                        htmlFor={`file-upload-${label.replace(/\s+/g, '_').toLowerCase()}`}
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">
                                            Click to upload files
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Max {maxSize}MB (up to {maxFiles} files)
                                        </p>
                                    </label>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <ImagePreviewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    imageUrl={previewImage || ''}
                    imageName={previewImageName}
                />
            </>
        );
    };
