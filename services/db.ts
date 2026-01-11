import { syncToFirestore } from './firestore';

const DB_NAME = 'FocusAppDB';
const STORE_NAME = 'appData';
const DB_VERSION = 1;

let currentUserId: string | null = null;

export const setCurrentUser = (userId: string | null) => {
  currentUserId = userId;
};

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveData = async (key: string, data: any): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, key);

    request.onsuccess = async () => {
      // Sync to Firestore if user is authenticated
      if (currentUserId && key === 'focus-app-data') {
        try {
          await syncToFirestore(currentUserId, data);
        } catch (error) {
          console.error('Failed to sync to Firestore:', error);
          // Don't reject - local save was successful
        }
      }
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
};

export const getData = async (key: string): Promise<any> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};
