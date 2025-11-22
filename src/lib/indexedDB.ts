export interface IndexedDBConfig {
    dbName: string;
    version: number;
    storeName: string;
}

export class IndexedDB {
    private dbName: string;
    private version: number;
    private storeName: string;
    private db: IDBDatabase | null = null;

    constructor(config: IndexedDBConfig) {
        this.dbName = config.dbName;
        this.version = config.version;
        this.storeName = config.storeName;
    }

    async open(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        });
    }

    async get<T>(key: string): Promise<T | undefined> {
        try {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(key);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            });
        } catch (error) {
            console.error('Error reading from IndexedDB:', error);
            throw error;
        }
    }

    async set(key: string, value: unknown): Promise<void> {
        try {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put(value, key);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            });
        } catch (error) {
            console.error('Error writing to IndexedDB:', error);
            throw error;
        }
    }

    async delete(key: string): Promise<void> {
        try {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.delete(key);

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            });
        } catch (error) {
            console.error('Error deleting from IndexedDB:', error);
            throw error;
        }
    }

    async clear(): Promise<void> {
        try {
            const db = await this.open();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.clear();

                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve();
            });
        } catch (error) {
            console.error('Error clearing IndexedDB store:', error);
            throw error;
        }
    }

    async close(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

// Create a default instance for form data
export const formDB = new IndexedDB({
    dbName: 'AdmissionFormDB',
    version: 1,
    storeName: 'formData'
});