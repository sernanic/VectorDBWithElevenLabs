import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  browserLocalPersistence, 
  setPersistence,
  initializeAuth,
  indexedDBLocalPersistence,
  browserPopupRedirectResolver
} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBeiRVnRW9IiRhYuNSVTO1pP1NwgS7zzuA",
  authDomain: "mobiwork-docs-hub.firebaseapp.com",
  projectId: "mobiwork-docs-hub",
  storageBucket: "mobiwork-docs-hub.appspot.com",
  messagingSenderId: "216358932416",
  appId: "1:216358932416:web:df88788d2b59d81c170225",
  measurementId: "G-35QZE44XG9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with IndexedDB persistence
const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver,
});

// Initialize Firestore
const db = getFirestore(app);

// Set persistence to local
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

export { app, auth, db };
