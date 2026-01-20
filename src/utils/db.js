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
