export function objectToFormData(obj: Record<string, unknown>): FormData {
    const formData = new FormData();

    function appendFormData(data: unknown, parentKey: string = "") {
        if (data instanceof File) {
            formData.append(parentKey, data);
        } else if (Array.isArray(data)) {
            // Use key[] instead of key[0], key[1] for backend compatibility
            data.forEach((value) => {
                appendFormData(value, `${parentKey}[]`);
            });
        } else if (typeof data === "object" && data !== null) {
            Object.keys(data).forEach((key) => {
                const fullKey = parentKey ? `${parentKey}.${key}` : key;
                appendFormData((data as Record<string, unknown>)[key], fullKey);
            });
        } else if (data !== undefined && data !== null) {
            formData.append(parentKey, data.toString());
        }
    }

    appendFormData(obj);
    return formData;
}
