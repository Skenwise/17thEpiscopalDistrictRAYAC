import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBTQ0VOv8HQX7-DZWZoij9zvxukaP5tS3o",
  authDomain: "districtrayac.firebaseapp.com",
  projectId: "districtrayac",
  storageBucket: "districtrayac.firebasestorage.app",
  messagingSenderId: "914772441441",
  appId: "1:914772441441:web:a9632eb5ef3eb0ff762d20"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistence to LOCAL so user stays logged in after page refresh
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});
