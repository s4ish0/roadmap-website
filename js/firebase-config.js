// js/firebase-config.js
//
// This is the ONLY file you need to edit to connect the site to your
// own Firebase project. See README.md, section "Firebase setup", for
// step-by-step instructions on getting these values.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  connectFirestoreEmulator
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// TODO: paste your project's config object here (Firebase Console >
// Project settings > General > Your apps > SDK setup and configuration).
const firebaseConfig = {
  apiKey: "AIzaSyBj_DP36Y50PV3zPFzQIXAnAKRrWesJSY0",
  authDomain: "java-roadmap-website.firebaseapp.com",
  projectId: "java-roadmap-website",
  storageBucket: "java-roadmap-website.firebasestorage.app",
  messagingSenderId: "1028026638056",
  appId: "1:1028026638056:web:5fc54a955ef523f110735d",
  measurementId: "G-KGXSMZNZZP"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Optional: if you want to develop against the local Firestore emulator
// instead of live Firebase, uncomment the two lines below (run
// `firebase emulators:start` first).
// connectFirestoreEmulator(db, "127.0.0.1", 8080);
