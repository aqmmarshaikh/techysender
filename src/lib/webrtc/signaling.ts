/**
 * BYTEPORT — WebRTC Signaling Service
 *
 * Uses Firestore to exchange SDP offers, answers, and ICE candidates
 * to establish a direct WebRTC peer-to-peer connection.
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
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
}

/**
 * Receiver creates a new signaling session.
 * Receiver = "Callee" (waits for offer)
 * Actually, usually the one creating the room is the Caller, but in our flow:
 * Receiver generates link -> creates empty room -> waits.
 * Sender opens link -> creates RTCPeerConnection -> writes Offer -> Caller.
 * Receiver sees Offer -> writes Answer -> Callee.
 */
export async function createSignalingSession(sessionId: string): Promise<void> {
  console.log(`[DEBUG] [Signaling] Session ID: ${sessionId}`);
  console.log(`[DEBUG] [Signaling] Creating session document...`);
  const sessionRef = doc(db, 'signaling', sessionId);
  await setDoc(sessionRef, {
    sessionId,
    status: 'waiting',
    createdAt: serverTimestamp(),
  });
  console.log(`[DEBUG] [Signaling] Session document created successfully.`);
}

/**
 * Check if a signaling session exists.
 */
export async function checkSignalingSession(sessionId: string): Promise<boolean> {
  const sessionRef = doc(db, 'signaling', sessionId);
  const snap = await getDoc(sessionRef);
  return snap.exists();
}

export async function deleteSignalingSession(sessionId: string): Promise<void> {
  console.log(`[DEBUG] [Signaling] Session ID: ${sessionId}`);
  console.log(`[DEBUG] [Signaling] Updating session status to disconnected...`);
  const sessionRef = doc(db, 'signaling', sessionId);
  await updateDoc(sessionRef, { status: 'disconnected' });
  console.log(`[DEBUG] [Signaling] Session status updated to disconnected.`);
}

export function subscribeToSession(
  sessionId: string,
  onUpdate: (data: Partial<SignalingSession>) => void
) {
  console.log(`[DEBUG] [Signaling] Session ID: ${sessionId}`);
  console.log(`[DEBUG] [Signaling] Subscribing to session updates...`);
  const sessionRef = doc(db, 'signaling', sessionId);
  return onSnapshot(sessionRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data() as Partial<SignalingSession>;
      console.log(`[DEBUG] [Signaling] Session snapshot received:\n`, JSON.stringify(data, null, 2));
      onUpdate(data);
    } else {
      console.log(`[DEBUG] [Signaling] Session snapshot received, but document does not exist.`);
    }
  });
}

export async function updateSession(sessionId: string, data: Partial<SignalingSession>) {
  console.log(`[DEBUG] [Signaling] Session ID: ${sessionId}`);
  console.log(`[DEBUG] [Signaling] Updating session document with data:\n`, JSON.stringify(data, null, 2));
  const sessionRef = doc(db, 'signaling', sessionId);
  await updateDoc(sessionRef, data);
  console.log(`[DEBUG] [Signaling] Session document updated successfully.`);
}

export async function addIceCandidate(
  sessionId: string,
  type: 'caller' | 'callee',
  candidate: RTCIceCandidateInit
) {
  console.log(`[DEBUG] [Signaling] Session ID: ${sessionId}`);
  console.log(`[DEBUG] [Signaling] Adding ICE candidate for ${type}...`);
  const collectionName = type === 'caller' ? 'callerCandidates' : 'calleeCandidates';
  const candidatesRef = collection(db, 'signaling', sessionId, collectionName);
  await addDoc(candidatesRef, candidate);
  console.log(`[DEBUG] [Signaling] ICE candidate for ${type} added successfully.`);
}

export function subscribeToIceCandidates(
  sessionId: string,
  type: 'caller' | 'callee',
  onCandidate: (candidate: RTCIceCandidateInit) => void
) {
  console.log(`[DEBUG] [Signaling] Session ID: ${sessionId}`);
  console.log(`[DEBUG] [Signaling] Subscribing to ICE candidates for ${type}...`);
  const collectionName = type === 'caller' ? 'callerCandidates' : 'calleeCandidates';
  const candidatesRef = collection(db, 'signaling', sessionId, collectionName);
  return onSnapshot(candidatesRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const data = change.doc.data();
        console.log(`[DEBUG] [Signaling] New ICE candidate snapshot received from ${type}:\n`, JSON.stringify(data, null, 2));
        onCandidate(data as RTCIceCandidateInit);
      }
    });
  });
}
