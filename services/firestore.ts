import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db as firestore } from './firebase';
import { AppState } from '../types';

const FIRESTORE_COLLECTION = 'users';

/**
 * Save user data to Firestore
 */
export const syncToFirestore = async (userId: string, data: AppState): Promise<void> => {
  try {
    const userDocRef = doc(firestore, FIRESTORE_COLLECTION, userId);
    await setDoc(userDocRef, {
      ...data,
      lastUpdated: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error syncing to Firestore:', error);
    throw error;
  }
};

/**
 * Load user data from Firestore
 */
export const loadFromFirestore = async (userId: string): Promise<AppState | null> => {
  try {
    const userDocRef = doc(firestore, FIRESTORE_COLLECTION, userId);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Remove Firestore metadata before returning
      const { lastUpdated, ...appData } = data;
      return appData as AppState;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading from Firestore:', error);
    throw error;
  }
};
