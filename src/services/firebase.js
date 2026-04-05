import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // Realtime Database import

const firebaseConfig = {
  apiKey: "AIzaSyD8LwUG3yE4eAtB71yn-jXdUBr82GLOqtg",
  authDomain: "smart-nephelo.firebaseapp.com",
  projectId: "smart-nephelo",
  storageBucket: "smart-nephelo.firebasestorage.app",
  messagingSenderId: "640848794365",
  appId: "1:640848794365:web:0ad6a85025860dc331e494",
  measurementId: "G-LC6LFHBS2H",
  databaseURL: "https://smart-nephelo-default-rtdb.firebaseio.com" // Aapka RTDB URL
};

const app = initializeApp(firebaseConfig);

// Exports
export const db = getFirestore(app);
export const rtdb = getDatabase(app); 

export default app;