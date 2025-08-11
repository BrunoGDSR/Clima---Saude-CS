import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDb7dMdiebZzRUjBkxPvreXluUd6HqFmYw",
  authDomain: "clima-saude-cs.firebaseapp.com",
  projectId: "clima-saude-cs",
  storageBucket: "clima-saude-cs.firebasestorage.app",
  messagingSenderId: "436160046854",
  appId: "G-0BX2QJJN0S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

