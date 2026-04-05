import { db } from './firebase'; 
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore"; 

const patientCollection = collection(db, "patients");

// Function to save real patient data
export const addPatient = async (patientData) => {
  try {
    const docRef = await addDoc(patientCollection, {
      ...patientData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding patient: ", error);
    throw error;
  }
};

// Function to fetch patients for the Analysis dropdown
export const getAllPatients = async () => {
  try {
    const q = query(patientCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching patients: ", error);
    return [];
  }
};