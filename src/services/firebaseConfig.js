// Firebase Cloud Integration Layer for Egyptian Fire Code Assistant
// Project: fire-code-9603d
// Grounded in Egyptian Fire Protection Code 305 & Decree 255/2026

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export const DEFAULT_FIREBASE_PROJECT_ID = 'fire-code-9603d';

// Default project configuration structure
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: `${DEFAULT_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: DEFAULT_FIREBASE_PROJECT_ID,
  storageBucket: `${DEFAULT_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

const STORAGE_KEY = 'fire_code_firebase_config';

/**
 * Get current stored Firebase configuration from localStorage or default
 */
export function getFirebaseConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_FIREBASE_CONFIG,
        ...parsed,
        projectId: DEFAULT_FIREBASE_PROJECT_ID // Ensure project ID remains locked to fire-code-9603d
      };
    }
  } catch (e) {
    console.warn('Error reading stored Firebase config:', e);
  }
  return { ...DEFAULT_FIREBASE_CONFIG };
}

/**
 * Persist new Firebase configuration (e.g. user pasted Web API Key from console)
 */
export function saveFirebaseConfig(config) {
  try {
    const updated = {
      ...DEFAULT_FIREBASE_CONFIG,
      ...config,
      projectId: DEFAULT_FIREBASE_PROJECT_ID
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Error saving Firebase config:', e);
    throw e;
  }
}

/**
 * Initialize Firebase App instance safely
 */
let firebaseApp = null;
let firestoreDb = null;

export function getFirebaseServices() {
  const config = getFirebaseConfig();

  // If no API key is provided, return inactive state
  if (!config.apiKey || config.apiKey.trim() === '') {
    return {
      isReady: false,
      reason: 'missing_api_key',
      config,
      db: null
    };
  }

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApp();
    }
    firestoreDb = getFirestore(firebaseApp);

    return {
      isReady: true,
      reason: 'connected',
      config,
      db: firestoreDb
    };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return {
      isReady: false,
      reason: err.message,
      config,
      db: null
    };
  }
}

/**
 * Test live connection to Firebase Firestore
 */
export async function testFirebaseConnection() {
  const { isReady, db, reason } = getFirebaseServices();
  if (!isReady || !db) {
    return {
      success: false,
      messageAr: reason === 'missing_api_key'
        ? 'يرجى إدخال مفتاح الـ Web API Key الخاص بمشروع fire-code-9603d من لوحة تحكم Firebase للبدء.'
        : `فشل تهيئة الاتصال بـ Firebase: ${reason}`,
      messageEn: reason === 'missing_api_key'
        ? 'Please enter the Web API Key for fire-code-9603d from your Firebase Console.'
        : `Firebase init failed: ${reason}`
    };
  }

  try {
    // Attempt writing a test handshake document to _connection_check collection
    const testDocRef = doc(db, '_connection_check', 'ping');
    await setDoc(testDocRef, {
      pingTime: serverTimestamp(),
      clientTimestamp: new Date().toISOString(),
      clientApp: 'Egyptian Fire Code Assistant 2026',
      designer: 'Eng. Ahmed Fawzy',
      projectId: DEFAULT_FIREBASE_PROJECT_ID
    });

    return {
      success: true,
      messageAr: 'تم الاتصال بقاعدة بيانات Firebase بنجاح! السحابة متصلة وجاهزة للمزامنة اللحظية.',
      messageEn: 'Connected to Firebase Firestore successfully! Cloud database is ready for sync.'
    };
  } catch (err) {
    console.error('Firebase test connection failed:', err);
    return {
      success: false,
      messageAr: `حدث خطأ أثناء الاتصال بقاعدة البيانات: ${err.message}. تأكد من تفعيل قواعد الحماية (Firestore Security Rules) في وحدة التحكم.`,
      messageEn: `Connection error: ${err.message}. Please check Firestore Security Rules in Firebase Console.`
    };
  }
}

/**
 * Save a single project to Firestore
 */
export async function saveProjectToFirestore(project) {
  const { isReady, db } = getFirebaseServices();
  if (!isReady || !db) return false;

  try {
    const docRef = doc(db, 'projects', project.id);
    await setDoc(docRef, {
      ...project,
      updatedAt: serverTimestamp(),
      cloudSyncTime: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving project to Firestore:', err);
    throw err;
  }
}

/**
 * Sync entire projects list to Firestore
 */
export async function syncProjectsToFirestore(projects) {
  const { isReady, db } = getFirebaseServices();
  if (!isReady || !db) return { success: false, syncedCount: 0 };

  try {
    let count = 0;
    for (const project of projects) {
      const docRef = doc(db, 'projects', project.id);
      await setDoc(docRef, {
        ...project,
        updatedAt: serverTimestamp(),
        cloudSyncTime: new Date().toISOString()
      }, { merge: true });
      count++;
    }
    return { success: true, syncedCount: count };
  } catch (err) {
    console.error('Error syncing projects to Firestore:', err);
    throw err;
  }
}

/**
 * Fetch all projects from Firestore
 */
export async function fetchProjectsFromFirestore() {
  const { isReady, db } = getFirebaseServices();
  if (!isReady || !db) return null;

  try {
    const colRef = collection(db, 'projects');
    const snapshot = await getDocs(colRef);
    const projects = [];
    snapshot.forEach(docSnap => {
      projects.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    return projects;
  } catch (err) {
    console.error('Error fetching projects from Firestore:', err);
    throw err;
  }
}

/**
 * Delete a project from Firestore
 */
export async function deleteProjectFromFirestore(projectId) {
  const { isReady, db } = getFirebaseServices();
  if (!isReady || !db) return false;

  try {
    const docRef = doc(db, 'projects', projectId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting project from Firestore:', err);
    throw err;
  }
}
