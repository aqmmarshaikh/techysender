import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { generateShortCode } from '../linkGenerator';

/**
 * Creates a unique short link for a given transfer ID.
 * Retries on collision up to 5 times.
 *
 * @param transferId The ID of the transfer
 * @param encryptionKey The encryption key to store
 * @returns The unique short code generated
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
      // Expiration time is same as transfer (typically 24 hours)
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
 * Retrieves the transfer ID for a given short code.
 * Checks expiration.
 *
 * @param shortCode The short code to look up
 * @returns An object with transferId and encryptionKey, or null if invalid or expired
 */
export async function getTransferDetailsFromShortCode(shortCode: string): Promise<{ transferId: string; encryptionKey: string } | null> {
  const docRef = doc(db, 'shortLinks', shortCode);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  const expiresAt = data.expiresAt as Timestamp;
  
  // Check if expired
  if (expiresAt && expiresAt.toMillis() < Date.now()) {
    return null; // Expired
  }
  
  return {
    transferId: data.transferId,
    encryptionKey: data.encryptionKey || ''
  };
}
