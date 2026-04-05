import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Tera asli configuration yahan hai
const firebaseConfig = {
  apiKey: "AIzaSyD8LwUG3yE4eAtB71yn-jXdUBr82GLOqtg",
  authDomain: "smart-nephelo.firebaseapp.com",
  projectId: "smart-nephelo",
  storageBucket: "smart-nephelo.firebasestorage.app",
  messagingSenderId: "640848794365",
  appId: "1:640848794365:web:0ad6a85025860dc331e494",
  measurementId: "G-LC6LFHBS2H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Database (Firestore) ko export kar rahe hain taaki baaki pages use kar sakein
export const db = getFirestore(app);

// Analytics (Optional)
export const analytics = getAnalytics(app);

export default app;