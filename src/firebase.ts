import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Hardcoded config for zero-config deployment (Vercel, Localhost, etc.)
const firebaseConfig = {
  projectId: "gen-lang-client-0935273496",
  appId: "1:842280102549:web:afa1fc8369cdd941fbc99c",
  apiKey: "AIzaSyCCQvmaF0CVEx99Q0I8jQBlRnoZ7rMSNC8",
  authDomain: "gen-lang-client-0935273496.firebaseapp.com",
  storageBucket: "gen-lang-client-0935273496.firebasestorage.app",
  messagingSenderId: "842280102549",
};

const firestoreDatabaseId = "ai-studio-3f794bbe-25dd-404d-b50d-aa3b188e1483";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
