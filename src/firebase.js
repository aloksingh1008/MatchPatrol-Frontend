// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA5lNSQ7CfJ9KcBl6YMS8ZgjEuCxPEZ020",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bookmarker-ebe11.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://bookmarker-ebe11-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bookmarker-ebe11",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bookmarker-ebe11.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "489154616765",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:489154616765:web:cce6d4d4ba179f7469c6d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);

// Export the app instance as well in case it's needed
export { app, auth, db }; 
