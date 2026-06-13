/**
 * BYTEPORT — WebRTC Store (Zustand)
 *
 * Manages the state for Direct Transfers over WebRTC.
 */

import { create } from 'zustand';
import { WebRTCManager, type WebRTCProgress } from '../lib/webrtc/peerConnection';
import { createSignalingSession, deleteSignalingSession } from '../lib/webrtc/signaling';
import { generateTransferId, buildReceiveUrl } from '../lib/linkGenerator';
import { generateKey, exportKey, importKey } from '../lib/encryption';

export type WebRTCConnectionState =
  | 'idle'
  | 'waiting' // Receiver waiting for sender
  | 'connecting'
  | 'connected'
  | 'transferring'
  | 'completed'
  | 'failed'
  | 'disconnected';

export interface WebRTCFile {
  name: string;
  size: number;
  type: string;
  data?: ArrayBuffer; // Received data
}

interface WebRTCState {
  sessionId: string | null;
  encryptionKey: CryptoKey | null;
  shareUrl: string | null;
  connectionState: WebRTCConnectionState;
  role: 'sender' | 'receiver' | null;
  error: string | null;
  progress: WebRTCProgress;
  receivedFiles: WebRTCFile[];
  
  // Actions
  initializeAsSender: () => Promise<void>;
  initializeAsReceiver: (sessionId: string, keyString: string) => Promise<void>;
  sendFiles: (files: File[]) => Promise<void>;
  disconnect: () => void;
  reset: () => void;
}

let webrtcManager: WebRTCManager | null = null;
let beforeUnloadHandler: (() => void) | null = null;

export const useWebRTCStore = create<WebRTCState>((set, get) => ({
  sessionId: null,
  encryptionKey: null,
  shareUrl: null,
  connectionState: 'idle',
  role: null,
  error: null,
  progress: { totalBytes: 0, transferredBytes: 0, currentSpeed: 0 },
  receivedFiles: [],

  initializeAsSender: async () => {
    const sessionId = generateTransferId();
    
    // Setup cleanup on tab close
    if (beforeUnloadHandler) window.removeEventListener('beforeunload', beforeUnloadHandler);
    beforeUnloadHandler = () => get().disconnect();
    window.addEventListener('beforeunload', beforeUnloadHandler);
    
    // Generate AES key for encryption
    const cryptoKey = await generateKey();
    const keyString = await exportKey(cryptoKey);
    const shareUrl = buildReceiveUrl(sessionId) + `#${keyString}`;

    set({
      sessionId,
      encryptionKey: cryptoKey,
      shareUrl,
      role: 'sender',
      connectionState: 'waiting',
      error: null,
      progress: { totalBytes: 0, transferredBytes: 0, currentSpeed: 0 }
    });

    try {
      console.log(`[WebRTC Store] Sender: Creating signaling session in Firestore...`);
      await createSignalingSession(sessionId);

      console.log(`[WebRTC Store] Sender: Initializing WebRTCManager`);
      webrtcManager = new WebRTCManager('sender', sessionId, cryptoKey, {
        onStatusChange: (status) => {
          if (status === 'connected') set({ connectionState: 'connected' });
          if (status === 'disconnected' || status === 'failed') set({ connectionState: 'disconnected' });
          if (status === 'channel-open') set({ connectionState: 'connected' });
        },
        onProgress: (progress) => {
          set({ progress, connectionState: 'transferring' });
          if (progress.totalBytes > 0 && progress.transferredBytes >= progress.totalBytes) {
             set({ connectionState: 'completed' });
          }
        },
        onFileComplete: () => {},
        onError: (error) => {
          set({ error, connectionState: 'failed' });
        }
      });

      await webrtcManager.initialize();
      console.log(`[WebRTC Store] Sender: Initialization complete`);

    } catch (err) {
      console.error(`[WebRTC Store] Sender initialization failed:`, err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize sender';
      set({ error: errorMsg, connectionState: 'failed' });
      throw err;
    }
  },

  initializeAsReceiver: async (sessionId: string, keyString: string) => {
    // Setup cleanup on tab close
    if (beforeUnloadHandler) window.removeEventListener('beforeunload', beforeUnloadHandler);
    beforeUnloadHandler = () => get().disconnect();
    window.addEventListener('beforeunload', beforeUnloadHandler);

    set({
      sessionId,
      role: 'receiver',
      connectionState: 'connecting',
      error: null,
      receivedFiles: [],
      progress: { totalBytes: 0, transferredBytes: 0, currentSpeed: 0 }
    });

    try {
      console.log(`[WebRTC Store] Receiver: Importing AES key from URL`);
      const cryptoKey = await importKey(keyString);
      set({ encryptionKey: cryptoKey });

      console.log(`[WebRTC Store] Receiver: Initializing WebRTCManager`);
      webrtcManager = new WebRTCManager('receiver', sessionId, cryptoKey, {
        onStatusChange: (status) => {
          if (status === 'connected') set({ connectionState: 'connected' });
          if (status === 'disconnected' || status === 'failed') set({ connectionState: 'disconnected' });
          if (status === 'channel-open') set({ connectionState: 'connected' });
          if (status === 'channel-closed') set({ connectionState: 'disconnected' });
        },
        onProgress: (progress) => {
          set({ progress, connectionState: 'transferring' });
        },
        onFileComplete: (fileBuffer, metadata) => {
          set(state => ({
            receivedFiles: [...state.receivedFiles, {
              name: metadata.name,
              size: metadata.size,
              type: metadata.type,
              data: fileBuffer
            }]
          }));

          const blob = new Blob([fileBuffer], { type: metadata.type || 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = metadata.name;
          a.click();
          URL.revokeObjectURL(url);
        },
        onError: (error) => {
          set({ error, connectionState: 'failed' });
        }
      });

      await webrtcManager.initialize();
      console.log(`[WebRTC Store] Receiver: Initialization complete`);

    } catch (err) {
      console.error(`[WebRTC Store] Receiver initialization failed:`, err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize receiver';
      set({ error: errorMsg, connectionState: 'failed' });
      throw err;
    }
  },

  sendFiles: async (files: File[]) => {
    if (!webrtcManager) throw new Error('WebRTC Manager not initialized');
    
    set({ connectionState: 'transferring' });
    try {
      await webrtcManager.sendFiles(files);
      set({ connectionState: 'completed' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transfer failed';
      set({ error: errorMsg, connectionState: 'failed' });
    }
  },

  disconnect: () => {
    console.log(`[WebRTC Store] Disconnecting and cleaning up...`);
    if (webrtcManager) {
      webrtcManager.disconnect();
      webrtcManager = null;
    }
    
    const { sessionId, role } = get();
    if (sessionId && role === 'sender') {
      deleteSignalingSession(sessionId).catch(console.error);
    }

    set({ connectionState: 'disconnected' });
    
    if (beforeUnloadHandler) {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      beforeUnloadHandler = null;
    }
  },

  reset: () => {
    get().disconnect();
    set({
      sessionId: null,
      encryptionKey: null,
      shareUrl: null,
      connectionState: 'idle',
      role: null,
      error: null,
      progress: { totalBytes: 0, transferredBytes: 0, currentSpeed: 0 },
      receivedFiles: [],
    });
  }
}));
