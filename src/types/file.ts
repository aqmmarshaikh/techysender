export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
  isPreviewable: boolean;
  previewType: PreviewType;
}

export type PreviewType = 'image' | 'video' | 'audio' | 'pdf' | 'none';

export const PREVIEWABLE_IMAGES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const PREVIEWABLE_VIDEOS = ['video/mp4', 'video/webm'];
export const PREVIEWABLE_AUDIO = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
export const PREVIEWABLE_DOCUMENTS = ['application/pdf'];

export function getPreviewType(mimeType: string): PreviewType {
  if (PREVIEWABLE_IMAGES.includes(mimeType)) return 'image';
  if (PREVIEWABLE_VIDEOS.includes(mimeType)) return 'video';
  if (PREVIEWABLE_AUDIO.includes(mimeType)) return 'audio';
  if (PREVIEWABLE_DOCUMENTS.includes(mimeType)) return 'pdf';
  return 'none';
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function formatSpeed(bytesPerSecond: number): string {
  return `${formatFileSize(bytesPerSecond)}/s`;
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.ceil(seconds % 60)}s`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}
