// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdmuEk9jaRTszJv6MBbBgKRPNSBrDHsbM",
  authDomain: "learn-quest-arena.firebaseapp.com",
  projectId: "learn-quest-arena",
  storageBucket: "learn-quest-arena.firebasestorage.app",
  messagingSenderId: "439235647120",
  appId: "1:439235647120:web:1c60d464b629796e31aa15"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;