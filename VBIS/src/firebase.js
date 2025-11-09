// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB9bkKVGlSxUQTtR9kA8Rc-W1TiLvhjQf8",
  authDomain: "neuroverse-2025.firebaseapp.com",
  projectId: "neuroverse-2025",
  storageBucket: "neuroverse-2025.firebasestorage.app",
  messagingSenderId: "749460926559",
  appId: "1:749460926559:web:8729175cf5df8518d86bea",
  measurementId: "G-7BY8W7Q22Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };