/**
 * BYTEPORT — AES-256-GCM Encryption Module
 * 
 * All encryption/decryption happens client-side using the Web Crypto API.
 * Keys never leave the browser.
 */

/** Generate a random AES-256-GCM key */
export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true, // extractable — needed to export for URL fragment
    ['encrypt', 'decrypt']
  );
}

/** Export key to a URL-safe base64 string for embedding in URL fragment */
export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64Url(raw);
}

/** Import a key from a URL-safe base64 string */
export async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = base64UrlToArrayBuffer(base64Key);
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/** Encrypt a chunk of data using AES-256-GCM */
export async function encryptChunk(
  key: CryptoKey,
  data: ArrayBuffer
): Promise<EncryptedChunk> {
  // Generate a unique 12-byte IV for each chunk
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as Uint8Array<ArrayBuffer> },
    key,
    data
  );

  return { iv, ciphertext };
}

/** Decrypt a chunk of data using AES-256-GCM */
export async function decryptChunk(
  key: CryptoKey,
  chunk: EncryptedChunk
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: chunk.iv as Uint8Array<ArrayBuffer> },
    key,
    chunk.ciphertext
  );
}

/** Encrypt an entire file, returning encrypted chunks */
export async function encryptFile(
  key: CryptoKey,
  data: ArrayBuffer,
  chunkSize: number = 256 * 1024 // 256 KB
): Promise<EncryptedChunk[]> {
  const chunks: EncryptedChunk[] = [];
  const totalChunks = Math.ceil(data.byteLength / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, data.byteLength);
    const chunkData = data.slice(start, end);
    const encrypted = await encryptChunk(key, chunkData);
    chunks.push(encrypted);
  }

  return chunks;
}

/** Decrypt encrypted chunks back to original data */
export async function decryptFile(
  key: CryptoKey,
  chunks: EncryptedChunk[]
): Promise<ArrayBuffer> {
  const decrypted: ArrayBuffer[] = [];

  for (const chunk of chunks) {
    const plaintext = await decryptChunk(key, chunk);
    decrypted.push(plaintext);
  }

  // Concatenate all decrypted chunks
  const totalLength = decrypted.reduce((sum, buf) => sum + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of decrypted) {
    result.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }

  return result.buffer;
}

// ── Types ──

export interface EncryptedChunk {
  iv: Uint8Array;
  ciphertext: ArrayBuffer;
}

// ── Utilities ──

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToArrayBuffer(base64: string): ArrayBuffer {
  const padded = base64.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/** Serialize encrypted chunks for storage/transfer */
export function serializeChunks(chunks: EncryptedChunk[]): ArrayBuffer {
  // Format: [chunkCount(4)] [iv(12) + ciphertextLen(4) + ciphertext]...
  let totalSize = 4; // chunk count header
  for (const chunk of chunks) {
    totalSize += 12 + 4 + chunk.ciphertext.byteLength;
  }

  const result = new Uint8Array(totalSize);
  const view = new DataView(result.buffer);
  let offset = 0;

  view.setUint32(offset, chunks.length);
  offset += 4;

  for (const chunk of chunks) {
    result.set(chunk.iv, offset);
    offset += 12;
    view.setUint32(offset, chunk.ciphertext.byteLength);
    offset += 4;
    result.set(new Uint8Array(chunk.ciphertext), offset);
    offset += chunk.ciphertext.byteLength;
  }

  return result.buffer;
}

/** Deserialize encrypted chunks from storage/transfer */
export function deserializeChunks(buffer: ArrayBuffer): EncryptedChunk[] {
  const view = new DataView(buffer);
  const data = new Uint8Array(buffer);
  let offset = 0;

  const chunkCount = view.getUint32(offset);
  offset += 4;

  const chunks: EncryptedChunk[] = [];
  for (let i = 0; i < chunkCount; i++) {
    const iv = data.slice(offset, offset + 12);
    offset += 12;
    const ciphertextLen = view.getUint32(offset);
    offset += 4;
    const ciphertext = buffer.slice(offset, offset + ciphertextLen);
    offset += ciphertextLen;
    chunks.push({ iv, ciphertext });
  }

  return chunks;
}
