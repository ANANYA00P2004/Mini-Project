// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIAqR5SP3iH8eIegRrq0gILbphVAh5ZKc",
  authDomain: "miniproject-ea70f.firebaseapp.com",
  projectId: "miniproject-ea70f",
  storageBucket: "miniproject-ea70f.firebasestorage.app",
  messagingSenderId: "318848598704",
  appId: "1:318848598704:web:7c518bb127dec8ebcaf175",
  measurementId: "G-8CVS4X7XRD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup };
