import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the values below with your specific config from the Firebase Console
// Go to Project Settings -> General -> Your apps -> SDK setup and configuration
const firebaseConfig = {
  apiKey: "AIzaSyDiu1Cf57-1nH2mDKWvvZOYxF8zzhRoldI",
  authDomain: "business-plan-creator-70b33.firebaseapp.com",
  projectId: "business-plan-creator-70b33",
  storageBucket: "business-plan-creator-70b33.firebasestorage.app",
  messagingSenderId: "237709124178",
  appId: "1:237709124178:web:487480509c83520314358b",
  measurementId: "G-YNEPYLG3TH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
