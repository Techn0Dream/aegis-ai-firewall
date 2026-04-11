import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const hasFirebase = !!firebaseConfig.apiKey;

let db = null;

if (hasFirebase) {
  if (!getApps().length) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    db = getFirestore(getApps()[0]);
  }
}

// Fallback interface matching firestore's onSnapshot roughly for our demo
export const listenToLogs = (callback, maxLimit = 50) => {
  if (hasFirebase && db) {
    const q = query(collection(db, "logs"), orderBy("created_at", "desc"), limit(maxLimit));
    return onSnapshot(q, (snapshot) => {
      const logs = [];
      snapshot.forEach((doc) => logs.push({ id: doc.id, ...doc.data() }));
      callback(logs);
    });
  } else {
    console.warn("🔴 [DEMO MODE] Firebase not configured. Logs panel will auto-poll backend as fallback.");
    return null; // Signals to the component to use manual API fallback
  }
};

export const listenToUnknownPatterns = (callback) => {
  if (hasFirebase && db) {
    const q = query(collection(db, "unknown_patterns"), orderBy("timestamp", "desc"), limit(10));
    return onSnapshot(q, (snapshot) => {
      const patterns = [];
      snapshot.forEach((doc) => patterns.push({ id: doc.id, ...doc.data() }));
      callback(patterns);
    });
  } else {
    return null; // Fallback handles this empty state
  }
};
