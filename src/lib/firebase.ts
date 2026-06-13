/**
 * BYTEPORT — Firebase Configuration
 *
 * Initializes Firebase App, Firestore, Storage, and Analytics.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBvLb_a7AIFQXqicg49tz7UaIGDYDh0MpQ",
  authDomain: "sender-f45b4.firebaseapp.com",
  databaseURL: "https://sender-f45b4-default-rtdb.firebaseio.com",
  projectId: "sender-f45b4",
  storageBucket: "sender-f45b4.firebasestorage.app",
  messagingSenderId: "505332976725",
  appId: "1:505332976725:web:3b3c7d68e7cabc5e2dd8dc",
  measurementId: "G-C1BXG5NYYJ",
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
