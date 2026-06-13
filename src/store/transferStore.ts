/**
 * BYTEPORT — Transfer Store (Zustand)
 *
 * Handles local file selection before initiating a WebRTC transfer.
 */

import { create } from 'zustand';
import type { TransferFile } from '../types/transfer';
import { MAX_TRANSFER_SIZE } from '../types/transfer';

interface TransferState {
  files: TransferFile[];
  error: string | null;

  addFiles: (fileList: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;

  totalSize: () => number;
  isOverLimit: () => boolean;
}

let fileIdCounter = 0;
function createFileId(): string {
  return `file-${Date.now()}-${++fileIdCounter}`;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  files: [],
  error: null,

  addFiles: (fileList: FileList | File[]) => {
    const newFiles: TransferFile[] = Array.from(fileList).map(file => ({
      id: createFileId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending' as const,
    }));

    set(state => {
      const combined = [...state.files, ...newFiles];
      const totalSize = combined.reduce((sum, f) => sum + f.size, 0);

      return {
        files: combined,
        error: totalSize > MAX_TRANSFER_SIZE
          ? `Total size exceeds 200 MB limit. Please remove some files.`
          : null,
      };
    });
  },

  removeFile: (id: string) => {
    set(state => {
      const remaining = state.files.filter(f => f.id !== id);
      const totalSize = remaining.reduce((sum, f) => sum + f.size, 0);
      return {
        files: remaining,
        error: totalSize > MAX_TRANSFER_SIZE
          ? `Total size exceeds 200 MB limit. Please remove some files.`
          : null,
      };
    });
  },

  clearFiles: () => {
    set({ files: [], error: null });
  },

  totalSize: () => {
    return get().files.reduce((sum, f) => sum + f.size, 0);
  },

  isOverLimit: () => {
    return get().totalSize() > MAX_TRANSFER_SIZE;
  },
}));
