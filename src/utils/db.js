const DB_NAME = 'ExamPaperAppDB';
const DB_VERSION = 1;
const STORE_NAME = 'problems';

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('createdAt', 'createdAt', { unique: false });
                store.createIndex('menuTitle', 'menuTitle', { unique: false });
            }
        };
    });
};

export const addProblem = async (problemData) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        // Ensure data is clonable
        const data = {
            ...problemData,
            createdAt: new Date().toISOString()
        };

        const request = store.add(data);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

export const getAllProblems = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            // Sort by createdAt desc by default
            const results = request.result;
            results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            resolve(results);
        };
        request.onerror = (e) => reject(e.target.error);
    });
};

export const getProblem = async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
};

export const deleteProblem = async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
};

export const updateProblem = async (id, updates) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
            const data = getRequest.result;
            if (!data) {
                reject(new Error('Problem not found'));
                return;
            }

            const updatedData = { ...data, ...updates, updatedAt: new Date().toISOString() };
            const updateRequest = store.put(updatedData);

            updateRequest.onsuccess = () => resolve(updateRequest.result);
            updateRequest.onerror = (e) => reject(e.target.error);
        };
        getRequest.onerror = (e) => reject(e.target.error);
    });
};
// Export all data to JSON
export const exportDB = async () => {
    const data = await getAllProblems();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam_app_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Import data from JSON file
export const importDB = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!Array.isArray(data)) throw new Error('Invalid backup file format');

                const db = await initDB();
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);

                // Clear existing data (optional, but safer for full restore) or Merge?
                // Let's merge/overwrite by ID. If ID exists, it updates.
                // If the user wants a clean restore, they might need to clear first.
                // For now, let's just loop and put.

                let count = 0;
                for (const item of data) {
                    await new Promise((res, rej) => {
                        // Ensure we don't accidentally overwrite with older ID logic if not careful,
                        // but usually put with existing ID updates it.
                        // However, autoIncrement IDs might conflict if we transfer between DBs.
                        // Ideally, we keep IDs if we want to preserve exactly, 
                        // but if we are moving to a new empty DB, we can just add them.
                        // Let's use 'put' to save with the ID in the object.
                        const request = store.put(item);
                        request.onsuccess = () => res();
                        request.onerror = (err) => rej(err);
                    });
                    count++;
                }

                resolve(count);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

// Sync with repository data (initialData.json)
export const syncWithRepo = async () => {
    try {
        const response = await fetch('/initialData.json');
        if (!response.ok) {
            if (response.status === 404) return 0; // No file found
            throw new Error('Failed to fetch initial data');
        }
        const data = await response.json();

        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        let count = 0;
        for (const item of data) {
            await new Promise((resolve, reject) => {
                const request = store.put(item);
                request.onsuccess = () => resolve();
                request.onerror = (e) => reject(e);
            });
            count++;
        }
        return count;
    } catch (error) {
        console.error('Sync error:', error);
        throw error;
    }
};
