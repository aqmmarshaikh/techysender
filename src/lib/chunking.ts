/**
 * BYTEPORT — File Chunking Module
 * 
 * Splits files into 256KB chunks for incremental processing.
 * Prevents loading entire files into memory at once.
 */

import { CHUNK_SIZE } from '../types/transfer';

export interface FileChunk {
  index: number;
  data: ArrayBuffer;
  size: number;
  isLast: boolean;
}

/**
 * Read a file as an ArrayBuffer.
 * For files under 50MB, reads the entire file.
 * For larger files, use readFileChunks for streaming.
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Read a file chunk by chunk using slice().
 * Yields FileChunk objects for each chunk.
 */
export async function* readFileChunks(
  file: File,
  chunkSize: number = CHUNK_SIZE
): AsyncGenerator<FileChunk> {
  const totalChunks = Math.ceil(file.size / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const blob = file.slice(start, end);
    const data = await blob.arrayBuffer();

    yield {
      index: i,
      data,
      size: data.byteLength,
      isLast: i === totalChunks - 1,
    };
  }
}

/**
 * Reassemble chunks back into a single Blob for download.
 */
export function reassembleChunks(
  chunks: ArrayBuffer[],
  mimeType: string = 'application/octet-stream'
): Blob {
  return new Blob(chunks, { type: mimeType });
}

/**
 * Calculate the number of chunks for a given file size.
 */
export function getChunkCount(fileSize: number, chunkSize: number = CHUNK_SIZE): number {
  return Math.ceil(fileSize / chunkSize);
}

/**
 * Create a download URL from a blob and trigger a download.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();

  // Cleanup
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}

/**
 * Create a preview URL for a file (for images, video, audio, etc.)
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoke a preview URL to free memory.
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
