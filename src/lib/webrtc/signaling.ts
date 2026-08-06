/**
 * BYTEPORT — WebRTC Signaling Service (Optimized for Zero Firestore Waste)
 *
 * Uses Firestore to exchange SDP offers, answers, and ICE candidates
 * to establish a direct WebRTC peer-to-peer connection.
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export interface SignalingSession {
  sessionId: string;
  status: 'waiting' | 'connecting' | 'connected' | 'failed' | 'disconnected';
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

/**
 * Receiver creates a new signaling session with TTL expiration.
 */
export async function createSignalingSession(sessionId: string): Promise<void> {
  console.log(`[Signaling] Creating session document: ${sessionId}`);
  const sessionRef = doc(db, 'signaling', sessionId);
  const expiresAt = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000);
  
  await setDoc(sessionRef, {
    sessionId,
    status: 'waiting',
    createdAt: serverTimestamp(),
    expiresAt,
  });
}

/**
 * Check if a signaling session exists.
 */
export async function checkSignalingSession(sessionId: string): Promise<boolean> {
  const sessionRef = doc(db, 'signaling', sessionId);
  const snap = await getDoc(sessionRef);
  return snap.exists();
}

/**
 * Physically deletes the signaling document and all ICE candidate subcollections
 * to eliminate orphan documents and prevent Firestore quota waste.
 */
export async function deleteSignalingSession(sessionId: string): Promise<void> {
  if (!sessionId) return;
  console.log(`[Signaling] Physically purging signaling session: ${sessionId}`);
  try {
    const sessionRef = doc(db, 'signaling', sessionId);

    // Delete caller candidates subcollection
    const callerCol = collection(db, 'signaling', sessionId, 'callerCandidates');
    const callerSnap = await getDocs(callerCol);
    if (!callerSnap.empty) {
      const batch = writeBatch(db);
      callerSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // Delete callee candidates subcollection
    const calleeCol = collection(db, 'signaling', sessionId, 'calleeCandidates');
    const calleeSnap = await getDocs(calleeCol);
    if (!calleeSnap.empty) {
      const batch = writeBatch(db);
      calleeSnap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    // Delete main session document
    await deleteDoc(sessionRef);
    console.log(`[Signaling] Successfully purged session ${sessionId}`);
  } catch (e) {
    console.error(`[Signaling] Error purging session ${sessionId}:`, e);
  }
}

export function subscribeToSession(
  sessionId: string,
  onUpdate: (data: Partial<SignalingSession>) => void
) {
  const sessionRef = doc(db, 'signaling', sessionId);
  return onSnapshot(sessionRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as Partial<SignalingSession>;
      onUpdate(data);
    }
  });
}

export async function updateSession(sessionId: string, data: Partial<SignalingSession>) {
  const sessionRef = doc(db, 'signaling', sessionId);
  await updateDoc(sessionRef, data);
}

const sentCandidates = new Set<string>();

export async function addIceCandidate(
  sessionId: string,
  type: 'caller' | 'callee',
  candidate: RTCIceCandidateInit
) {
  if (!candidate || !candidate.candidate) return;
  const key = `${sessionId}:${type}:${candidate.candidate}`;
  if (sentCandidates.has(key)) return;
  sentCandidates.add(key);

  const collectionName = type === 'caller' ? 'callerCandidates' : 'calleeCandidates';
  const candidatesRef = collection(db, 'signaling', sessionId, collectionName);
  await addDoc(candidatesRef, candidate);
}

export function subscribeToIceCandidates(
  sessionId: string,
  type: 'caller' | 'callee',
  onCandidate: (candidate: RTCIceCandidateInit) => void
) {
  const collectionName = type === 'caller' ? 'callerCandidates' : 'calleeCandidates';
  const candidatesRef = collection(db, 'signaling', sessionId, collectionName);
  return onSnapshot(candidatesRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        onCandidate(data as RTCIceCandidateInit);
      }
    });
  });
}
