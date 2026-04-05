import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8Lw6G3Y4E4tB7Jjr-y7XDz-Ej98...", 
  authDomain: "smart-nephelo.firebaseapp.com",
  projectId: "smart-nephelo",
  storageBucket: "smart-nephelo.appspot.com",
  messagingSenderId: "640048194305",
  appId: "1:640048194305:web:8c5582f866dc3a",
  measurementId: "G-LCHLM7MSZM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services and Export them
export const analytics = getAnalytics(app);
export const db = getFirestore(app); // Ye line zaroori hai error hatane ke liye