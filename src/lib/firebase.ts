/**
 * BYTEPORT — Firebase Configuration
 *
 * Initializes Firebase App, Firestore, Storage, and Analytics.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyA8rUDROe7fWfb0avCt1ia5opsc-FwTtiM",
  authDomain: "sender2-85c30.firebaseapp.com",
  projectId: "sender2-85c30",
  storageBucket: "sender2-85c30.firebasestorage.app",
  messagingSenderId: "156828156579",
  appId: "1:156828156579:web:ae8ae66eb6f82792393516",
  measurementId: "G-FWVKB8DP2W",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Analytics (only in browser, not SSR)
export let analytics: ReturnType<typeof getAnalytics> | null = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
