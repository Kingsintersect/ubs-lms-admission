// lib/fileStorage.ts
export interface StoredFile {
    name: string;
    type: string;
    size: number;
    data: string; // Base64 encoded string
    lastModified: number;
}

export const serializeFiles = async (files: (File | string | null)[]): Promise<StoredFile[]> => {
    const serializedFiles: StoredFile[] = [];

    for (const file of files) {
        if (!file) continue;

        if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            const base64 = btoa(
                new Uint8Array(arrayBuffer)
                    .reduce((data, byte) => data + String.fromCharCode(byte), '')
            );

            serializedFiles.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64,
                lastModified: file.lastModified
            });
        } else if (typeof file === 'string') {
            // It's already a URL string, store as is
            serializedFiles.push({
                name: file.split('/').pop() || 'file',
                type: 'unknown',
                size: 0,
                data: file,
                lastModified: Date.now()
            });
        }
    }

    return serializedFiles;
};

export const deserializeFiles = (serializedFiles: any[]): (File | string)[] => {
    return serializedFiles.map(item => {
        if (item && typeof item === 'object' && item.data) {
            try {
                // Check if it's a base64 encoded file
                if (typeof item.data === 'string' && item.data.length > 0) {
                    // It's a base64 encoded file - convert back to File
                    const byteString = atob(item.data);
                    const byteArray = new Uint8Array(byteString.length);

                    for (let i = 0; i < byteString.length; i++) {
                        byteArray[i] = byteString.charCodeAt(i);
                    }

                    const blob = new Blob([byteArray], { type: item.type || 'application/octet-stream' });

                    return new File([blob], item.name, {
                        type: item.type || 'application/octet-stream',
                        lastModified: item.lastModified || Date.now()
                    });
                }
            } catch (error) {
                console.error('Error deserializing file:', error);
                // If deserialization fails, return the original data
                return item;
            }
        } else if (typeof item === 'string') {
            // It's a URL string
            return item;
        }

        return item;
    }).filter(Boolean) as (File | string)[];
};


// export interface StoredFile {
//     name: string;
//     type: string;
//     data: string; // Base64 encoded string
// }

// // In your fileStorage.ts
// export const serializeFiles = async (files: (File | null)[]): Promise<StoredFile[]> => {
//     const serializedFiles = [];
//     for (const file of files) {
//         if (!file) continue;

//         if (file instanceof File) {
//             const arrayBuffer = await file.arrayBuffer();
//             const base64 = btoa(
//                 new Uint8Array(arrayBuffer)
//                     .reduce((data, byte) => data + String.fromCharCode(byte), '')
//             );

//             serializedFiles.push({
//                 name: file.name,
//                 type: file.type,
//                 size: file.size,
//                 data: base64,
//                 lastModified: file.lastModified
//             });
//         } else {
//             // It's already a URL string or some other format
//             serializedFiles.push(file);
//         }
//     }

//     return serializedFiles;
// };

// export const deserializeFiles = (serializedFiles: any[]): (File | string)[] => {
//     return serializedFiles.map(item => {
//         if (item && typeof item === 'object' && item.data) {
//             // It's a serialized File object
//             const byteString = atob(item.data);
//             const byteArray = new Uint8Array(byteString.length);
//             for (let i = 0; i < byteString.length; i++) {
//                 byteArray[i] = byteString.charCodeAt(i);
//             }

//             return new File([byteArray], item.name, {
//                 type: item.type,
//                 lastModified: item.lastModified
//             });
//         } else if (typeof item === 'string') {
//             // It's a URL string
//             return item;
//         }
//         return null;
//     }).filter(Boolean) as (File | string)[];
// };