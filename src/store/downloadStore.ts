/**
 * BYTEPORT — Download Store (Zustand) — Firebase-Integrated
 *
 * Loads transfer metadata from Firestore, downloads encrypted files
 * from Firebase Storage, decrypts them client-side, and triggers download.
 */

import { create } from 'zustand';
import type { TransferStatus } from '../types/transfer';
import { getTransferDoc, incrementViewCount, incrementDownloadCount } from '../lib/firestoreService';
import { downloadEncryptedFile } from '../lib/storageService';
import { importKey, decryptFile, deserializeChunks } from '../lib/encryption';
import { parseTransferUrl } from '../lib/linkGenerator';

export interface DownloadFileInfo {
  name: string;
  size: number;
  type: string;
  storagePath: string;
  previewUrl?: string;
}

export interface DownloadTransfer {
  transferId: string;
  status: TransferStatus;
  files: DownloadFileInfo[];
  totalSize: number;
  createdAt: number;
  expiresAt: number;
  downloadCount: number;
  viewCount: number;
  previewViewed: boolean;
  downloadProgress: number;
  currentSpeed: number;
  isDecrypting: boolean;
}

interface DownloadState {
  transfer: DownloadTransfer | null;
  error: string | null;
  isLoading: boolean;

  loadTransfer: (transferId: string) => Promise<void>;
  startDownload: () => Promise<void>;
  incrementView: () => void;
}

export const useDownloadStore = create<DownloadState>((set, get) => ({
  transfer: null,
  error: null,
  isLoading: false,

  loadTransfer: async (transferId: string) => {
    set({ isLoading: true, error: null });

    try {
      const doc = await getTransferDoc(transferId);

      if (!doc) {
        set({
          isLoading: false,
          error: 'expired',
          transfer: null,
        });
        return;
      }

      const transfer: DownloadTransfer = {
        transferId: doc.transferId,
        status: doc.status as TransferStatus,
        files: doc.files.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
          storagePath: f.storagePath,
        })),
        totalSize: doc.totalSize,
        createdAt: doc.createdAt.toMillis(),
        expiresAt: doc.expiresAt.toMillis(),
        downloadCount: doc.downloadCount,
        viewCount: doc.viewCount,
        previewViewed: false,
        downloadProgress: 0,
        currentSpeed: 0,
        isDecrypting: false,
      };

      set({ transfer, isLoading: false });
    } catch (err) {
      console.error('Failed to load transfer:', err);
      set({
        isLoading: false,
        error: 'Failed to load transfer. Please check the link.',
        transfer: null,
      });
    }
  },

  startDownload: async () => {
    const { transfer } = get();
    if (!transfer) return;

    // Extract encryption key from URL fragment
    const parsed = parseTransferUrl();
    if (!parsed) {
      set({ error: 'Invalid link — encryption key missing from URL.' });
      return;
    }

    set({
      transfer: { ...transfer, isDecrypting: true, downloadProgress: 0 },
    });

    try {
      const cryptoKey = await importKey(parsed.encryptionKey);
      const totalFiles = transfer.files.length;
      const decryptedBlobs: { blob: Blob; name: string }[] = [];

      for (let i = 0; i < totalFiles; i++) {
        const file = transfer.files[i];

        // Update progress: downloading
        set(state => ({
          transfer: state.transfer ? {
            ...state.transfer,
            downloadProgress: ((i) / totalFiles) * 80, // 0-80% for downloads
            currentSpeed: 2_000_000 + Math.random() * 4_000_000,
            isDecrypting: false,
          } : null,
        }));

        // Download encrypted data from Firebase Storage
        const encryptedData = await downloadEncryptedFile(file.storagePath);

        // Update progress: decrypting
        set(state => ({
          transfer: state.transfer ? {
            ...state.transfer,
            downloadProgress: ((i + 0.5) / totalFiles) * 80 + 10,
            isDecrypting: true,
          } : null,
        }));

        // Deserialize and decrypt client-side
        const chunks = deserializeChunks(encryptedData);
        const decryptedData = await decryptFile(cryptoKey, chunks);

        const blob = new Blob([decryptedData], { type: file.type || 'application/octet-stream' });
        decryptedBlobs.push({ blob, name: file.name });
      }

      // Progress: 100%
      set(state => ({
        transfer: state.transfer ? {
          ...state.transfer,
          downloadProgress: 100,
          currentSpeed: 0,
          isDecrypting: false,
        } : null,
      }));

      // Trigger browser download for each file
      for (const { blob, name } of decryptedBlobs) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();

        // Stagger downloads slightly
        await new Promise(r => setTimeout(r, 300));

        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      // Increment download count in Firestore
      await incrementDownloadCount(transfer.transferId);

      set(state => ({
        transfer: state.transfer ? {
          ...state.transfer,
          downloadCount: state.transfer.downloadCount + 1,
        } : null,
      }));

    } catch (err) {
      console.error('Download/decrypt failed:', err);
      set({
        error: err instanceof Error ? err.message : 'Decryption failed. The link may be corrupted.',
        transfer: get().transfer ? {
          ...get().transfer!,
          downloadProgress: 0,
          isDecrypting: false,
          currentSpeed: 0,
        } : null,
      });
    }
  },

  incrementView: () => {
    const { transfer } = get();
    if (transfer) {
      incrementViewCount(transfer.transferId);
      set(state => ({
        transfer: state.transfer ? {
          ...state.transfer,
          viewCount: state.transfer.viewCount + 1,
        } : null,
      }));
    }
  },
}));
