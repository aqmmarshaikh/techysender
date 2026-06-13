export type TransferMode = 'direct' | 'relay';

export type TransferStatus =
  | 'CREATED'
  | 'WAITING'
  | 'CONNECTING'
  | 'UPLOADING'
  | 'DOWNLOADING'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'FAILED'
  | 'CANCELLED'
  | 'PAUSED';

export interface TransferFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'paused';
  previewUrl?: string;
}

export interface Transfer {
  transferId: string;
  mode: TransferMode;
  status: TransferStatus;
  files: TransferFile[];
  totalSize: number;
  uploadedSize: number;
  createdAt: number;
  expiresAt: number;
  downloadCount: number;
  viewCount: number;
  previewViewed: boolean;
  encryptionKey?: string;
  shareUrl?: string;
  currentSpeed: number;
  averageSpeed: number;
  estimatedTimeRemaining: number;
}

export interface TransferSettings {
  mode: TransferMode;
  expirationHours: number;
  encryptionEnabled: boolean;
  analyticsEnabled: boolean;
}

export const DEFAULT_SETTINGS: TransferSettings = {
  mode: 'relay',
  expirationHours: 24,
  encryptionEnabled: true,
  analyticsEnabled: true,
};

export const MAX_TRANSFER_SIZE = 200 * 1024 * 1024; // 200 MB
export const CHUNK_SIZE = 256 * 1024; // 256 KB
export const MAX_SPEED = 10 * 1024 * 1024; // 10 MB/s
