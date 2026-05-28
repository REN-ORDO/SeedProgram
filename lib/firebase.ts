/**
 * Firebase client SDK initialization.
 *
 * Estas claves son públicas por diseño en Firebase Web (no son secretos).
 * La seguridad real vive en las Security Rules de Firestore.
 * Aun así, las leemos desde NEXT_PUBLIC_* para poder cambiar de proyecto
 * sin tocar código. Hay defaults para que `next build` no falle si falta
 * el .env (útil en CI / primera clonada).
 *
 * NOTA: el upload de CVs se hace en Cloudinary (ver lib/cloudinary.ts),
 * no en Firebase Storage. Por eso aquí solo exportamos Firestore.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    "AIzaSyAAE-fvZuEWsY2_Z6LtjyTIYX5RdhTx50k",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    "seed-program.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "seed-program",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    "seed-program.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "891690110646",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    "1:891690110646:web:b9dad56f6d77dce1716017",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-DV52HHP97S",
};

// Evita re-inicializar en HMR / multiples imports.
const app: FirebaseApp = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

export const db: Firestore = getFirestore(app);

/**
 * Analytics solo se carga en el cliente y cuando el navegador lo soporta.
 * No bloquea el render ni rompe SSR.
 */
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  if (!(await isSupported())) return null;
  return getAnalytics(app);
}

export { app };
