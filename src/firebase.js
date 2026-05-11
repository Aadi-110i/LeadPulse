import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Warn about missing critical config values
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
if (missingKeys.length > 0) {
  console.error(
    `[Firebase] Missing critical environment variables: ${missingKeys.join(', ')}. ` +
    `Make sure all VITE_FIREBASE_* variables are set in your Vercel Environment Variables.`
  );
}

// Initialize Firebase with error handling
let app = null;
let auth = null;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Analytics initialization (safe check)
  isSupported().then(yes => {
    if (yes && app) analytics = getAnalytics(app);
  }).catch(() => {});
} catch (err) {
  console.error("[Firebase] Initialization failed:", err.message);
  console.error("[Firebase] Config received:", JSON.stringify(
    Object.fromEntries(Object.entries(firebaseConfig).map(([k, v]) => [k, v ? '✓ SET' : '✗ MISSING']))
  ));
}

export { auth, analytics };
export default app;
