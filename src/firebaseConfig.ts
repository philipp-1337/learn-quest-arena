// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// Use environment variables for sensitive configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDdmuEk9jaRTszJv6MBbBgKRPNSBrDHsbM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "learn-quest-arena.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "learn-quest-arena",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "learn-quest-arena.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "439235647120",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:439235647120:web:1c60d464b629796e31aa15"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Auth persistence set to local
  })
  .catch((error) => {
    console.error("Fehler beim Setzen der Auth-Persistenz:", error);
  });

export default app;