import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyBWyJEoBfa1T2VVh8bJtGIa5Onxs3ajeng",
  authDomain: "somlik-point-of-sale-next.firebaseapp.com",
  projectId: "somlik-point-of-sale-next",
  storageBucket: "somlik-point-of-sale-next.firebasestorage.app",
  messagingSenderId: "141962606370",
  appId: "1:141962606370:web:11f1456bd86a9e631a177b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);