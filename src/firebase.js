// src/firebase.js
import { initializeApp } from "firebase/app";

import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
} from "firebase/firestore";

import { getStorage } from "firebase/storage"; // <- IMPORTANT: storage

// CLEAN CONFIG (from .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase apps / services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // <- EXPORT THIS

const googleProvider = new GoogleAuthProvider();

// helper to create user doc
async function createUserDoc(uid, data) {
  await setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: new Date().toISOString(),
  });
}

export {
  auth,
  db,
  storage,            // <<--- exported
  googleProvider,
  createUserDoc,
  signInWithPopup,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
};