import { doc, getDoc, setDoc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { generateShortCode } from '../linkGenerator';

/**
 * Creates a unique short link for a given transfer ID with TTL expiration.
 */
export async function createShortLink(transferId: string, encryptionKey: string): Promise<string> {
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const shortCode = generateShortCode();
    const docRef = doc(db, 'shortLinks', shortCode);
    
    // Check if the short code already exists
    const existingDoc = await getDoc(docRef);
    if (!existingDoc.exists()) {
      // Expiration time is same as transfer (24 hours)
      const expiresAt = Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000);
      
      await setDoc(docRef, {
        shortCode,
        transferId,
        encryptionKey,
        createdAt: serverTimestamp(),
        expiresAt
      });
      
      return shortCode;
    }
    
    attempts++;
  }

  throw new Error('Failed to generate a unique short link after 5 attempts');
}

/**
 * Deletes a short link document immediately.
 */
export async function deleteShortLink(shortCode: string): Promise<void> {
  if (!shortCode) return;
  try {
    const docRef = doc(db, 'shortLinks', shortCode);
    await deleteDoc(docRef);
    console.log(`[ShortLink] Purged short link: ${shortCode}`);
  } catch (e) {
    console.error(`[ShortLink] Error purging short link ${shortCode}:`, e);
  }
}

/**
 * Retrieves the transfer ID for a given short code.
 * Checks expiration and automatically purges expired documents.
 */
export async function getTransferDetailsFromShortCode(shortCode: string): Promise<{ transferId: string; encryptionKey: string } | null> {
  const docRef = doc(db, 'shortLinks', shortCode);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  const expiresAt = data.expiresAt as Timestamp;
  
  // Check if expired & auto-purge from Firestore
  if (expiresAt && expiresAt.toMillis() < Date.now()) {
    deleteDoc(docRef).catch(console.error);
    return null; // Expired
  }
  
  return {
    transferId: data.transferId,
    encryptionKey: data.encryptionKey || ''
  };
}
