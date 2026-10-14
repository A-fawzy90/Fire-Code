// Firebase Cloud Integration Layer for Egyptian Fire Code Assistant
// Project: fire-code-9603d
// Grounded in Egyptian Fire Protection Code 305 & Decree 255/2026
// Prepared by: Eng. Ahmed Fawzy

import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  serverTimestamp,
  writeBatch 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';

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
 * Recursively remove undefined values from an object to prevent Firestore errors
 */
export function sanitizeFirestoreData(data) {
  if (data === null || data === undefined) return null;
  if (typeof data !== 'object') return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) return data.map(sanitizeFirestoreData).filter(v => v !== undefined);
  
  const cleaned = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleaned[key] = sanitizeFirestoreData(value);
    }
  }
  return cleaned;
}

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
        projectId: DEFAULT_FIREBASE_PROJECT_ID
      };
    }
  } catch (e) {
    console.warn('Error reading stored Firebase config:', e);
  }
  return { ...DEFAULT_FIREBASE_CONFIG };
}

/**
 * Persist new Firebase configuration and re-initialize Firebase client immediately
 */
export async function saveFirebaseConfig(config) {
  try {
    const updated = {
      ...DEFAULT_FIREBASE_CONFIG,
      ...config,
      projectId: DEFAULT_FIREBASE_PROJECT_ID
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Reset current Firebase app instance so new API Key takes effect immediately without page reload
    if (firebaseApp) {
      try {
        await deleteApp(firebaseApp);
      } catch (e) {
        console.warn('Error deleting previous Firebase App instance:', e);
      }
      firebaseApp = null;
      firestoreDb = null;
      firebaseAuth = null;
    }

    return updated;
  } catch (e) {
    console.error('Error saving Firebase config:', e);
    throw e;
  }
}

/**
 * Initialize Firebase App, Auth, and Firestore instances safely
 */
let firebaseApp = null;
let firestoreDb = null;
let firebaseAuth = null;

export function getFirebaseServices() {
  const config = getFirebaseConfig();

  if (!config.apiKey || config.apiKey.trim() === '') {
    return {
      isReady: false,
      reason: 'missing_api_key',
      config,
      db: null,
      auth: null
    };
  }

  try {
    if (!firebaseApp) {
      if (!getApps().length) {
        firebaseApp = initializeApp(config);
      } else {
        firebaseApp = getApp();
      }
    }
    
    if (!firestoreDb) {
      firestoreDb = getFirestore(firebaseApp);
    }

    if (!firebaseAuth) {
      firebaseAuth = getAuth(firebaseApp);
    }

    return {
      isReady: true,
      reason: 'connected',
      config,
      db: firestoreDb,
      auth: firebaseAuth
    };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return {
      isReady: false,
      reason: err.message,
      config,
      db: null,
      auth: null
    };
  }
}

/**
 * Ensure user is authenticated (e.g. anonymously or via token) for secure Firestore rules
 */
export async function ensureFirebaseAuth() {
  const { isReady, auth } = getFirebaseServices();
  if (!isReady || !auth) return null;

  if (auth.currentUser) {
    return auth.currentUser;
  }

  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Firebase anonymous authentication notice:', err);
    return null;
  }
}

/**
 * Test live connection to Firebase Firestore with Auth & Ping
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
    // Authenticate user anonymously to comply with secure Firestore rules
    const user = await ensureFirebaseAuth();

    // Write a test handshake document to _connection_check collection
    const testDocRef = doc(db, '_connection_check', 'ping');
    await setDoc(testDocRef, {
      pingTime: serverTimestamp(),
      clientTimestamp: new Date().toISOString(),
      clientApp: 'Egyptian Fire Code Assistant 2026',
      designer: 'Eng. Ahmed Fawzy',
      projectId: DEFAULT_FIREBASE_PROJECT_ID,
      authUid: user ? user.uid : 'anonymous_client'
    });

    return {
      success: true,
      authUid: user?.uid,
      messageAr: 'تم الاتصال بقاعدة بيانات Firebase وتأكيد هوية الجلسة بنجاح! السحابة متصلة وجاهزة للمزامنة اللحظية.',
      messageEn: 'Connected to Firebase Firestore & session verified successfully! Ready for cloud sync.'
    };
  } catch (err) {
    console.error('Firebase test connection failed:', err);
    return {
      success: false,
      messageAr: `حدث خطأ أثناء الاتصال بقاعدة البيانات: ${err.message}. تأكد من تفعيل قواعد الحماية في وحدة التحكم.`,
      messageEn: `Connection error: ${err.message}. Please check Firestore Security Rules in Firebase Console.`
    };
  }
}

/**
 * Save a single project to Firestore safely
 */
export async function saveProjectToFirestore(project) {
  const { isReady, db } = getFirebaseServices();
  if (!isReady || !db || !project?.id) return false;

  try {
    const user = await ensureFirebaseAuth();
    const docRef = doc(db, 'projects', String(project.id));
    const cleanData = sanitizeFirestoreData({
      ...project,
      ownerId: user ? user.uid : 'default_owner',
      updatedAt: serverTimestamp(),
      cloudSyncTime: new Date().toISOString()
    });
    await setDoc(docRef, cleanData, { merge: true });
    return true;
  } catch (err) {
    console.error('Error saving project to Firestore:', err);
    throw err;
  }
}

/**
 * Sync entire projects list to Firestore using writeBatch for atomic high performance
 */
export async function syncProjectsToFirestore(projects = []) {
  const { isReady, db } = getFirebaseServices();
  if (!isReady || !db) return { success: false, syncedCount: 0 };
  if (!projects.length) return { success: true, syncedCount: 0 };

  try {
    const user = await ensureFirebaseAuth();
    const batch = writeBatch(db);
    let count = 0;

    for (const project of projects) {
      if (!project?.id) continue;
      const docRef = doc(db, 'projects', String(project.id));
      const cleanData = sanitizeFirestoreData({
        ...project,
        ownerId: user ? user.uid : 'default_owner',
        updatedAt: serverTimestamp(),
        cloudSyncTime: new Date().toISOString()
      });
      batch.set(docRef, cleanData, { merge: true });
      count++;
    }

    await batch.commit();
    return { success: true, syncedCount: count };
  } catch (err) {
    console.error('Error batch syncing projects to Firestore:', err);
    throw err;
  }
}

/**
 * Fetch all projects from Firestore with schema sanitization
 */
export async function fetchProjectsFromFirestore() {
  const { isReady, db } = getFirebaseServices();
  if (!isReady || !db) return null;

  try {
    await ensureFirebaseAuth();
    const colRef = collection(db, 'projects');
    const snapshot = await getDocs(colRef);
    const projects = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      projects.push({
        id: docSnap.id,
        ...data
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
  if (!isReady || !db || !projectId) return false;

  try {
    const docRef = doc(db, 'projects', String(projectId));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error deleting project from Firestore:', err);
    throw err;
  }
}
