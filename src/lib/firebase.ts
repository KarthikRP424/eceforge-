// ============================================================
// ECEForge — Firebase Initialization
// ============================================================

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// NOTE: Do NOT commit real API keys. Users must create a .env file
// with REACT_APP_FIREBASE_... variables (see README). This file reads
// them from process.env. In Vite, environment vars must be prefixed with VITE_.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore (optional, improves UX)
// import { enableIndexedDbPersistence } from 'firebase/firestore';
// enableIndexedDbPersistence(db).catch(err => console.warn('Firestore persistence error', err));
