/**
 * BYTEPORT — WebRTC Store (Zustand)
 *
 * Manages the state for Direct Transfers over WebRTC.
 */

import { create } from 'zustand';
import { WebRTCManager, type WebRTCProgress } from '../lib/webrtc/peerConnection';
import { createSignalingSession, deleteSignalingSession } from '../lib/webrtc/signaling';
import { generateTransferId, buildReceiveUrl, buildShortUrl } from '../lib/linkGenerator';
import { generateKey, exportKey, importKey } from '../lib/encryption';
import { createShortLink } from '../lib/webrtc/shortLinks';
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
  shortUrl: string | null;
  connectionState: WebRTCConnectionState;
  role: 'sender' | 'receiver' | null;
  error: string | null;
  progress: WebRTCProgress;
  receivedFiles: WebRTCFile[];
  
  // Actions
  initializeAsSender: () => Promise<void>;
  initializeAsReceiver: (sessionId: string, keyString: string) => Promise<void>;
  generateNewShortLink: () => Promise<void>;
  sendFiles: (files: File[]) => Promise<void>;
  disconnect: () => void;
  reset: () => void;
}

let webrtcManager: WebRTCManager | null = null;
let beforeUnloadHandler: (() => void) | null = null;

// Monotonically increasing ID to detect stale async continuations.
// Each call to initializeAsSender/initializeAsReceiver gets an ID;
// if the ID has changed by the time an `await` resumes, the call is stale.
let currentInitId = 0;

// Diagnostic counters for debugging Strict Mode / lifecycle issues
let peerConnectionCreateCount = 0;
let peerConnectionDestroyCount = 0;
let dataChannelCreateCount = 0;
let dataChannelCloseCount = 0;

function cleanupExistingManager() {
  if (webrtcManager) {
    console.warn(`[WebRTC Store] Cleaning up EXISTING WebRTCManager before creating a new one. (PC created: ${peerConnectionCreateCount}, PC destroyed: ${peerConnectionDestroyCount})`);
    webrtcManager.disconnect();
    webrtcManager = null;
    peerConnectionDestroyCount++;
    console.log(`[WebRTC Store] Lifecycle: PeerConnections created=${peerConnectionCreateCount}, destroyed=${peerConnectionDestroyCount}`);
  }
  // Invalidate any in-flight async initialization
  currentInitId++;
  console.log(`[WebRTC Store] Incremented initId to ${currentInitId} (any in-flight init with a lower ID will abort)`);
}

export const useWebRTCStore = create<WebRTCState>((set, get) => ({
  sessionId: null,
  encryptionKey: null,
  shareUrl: null,
  shortUrl: null,
  connectionState: 'idle',
  role: null,
  error: null,
  progress: { totalBytes: 0, transferredBytes: 0, currentSpeed: 0 },
  receivedFiles: [],

  initializeAsSender: async () => {
    // Guard: clean up any orphaned manager from a previous mount
    cleanupExistingManager();
    const myInitId = currentInitId;

    console.log(`[WebRTC Store] ▶ Sender: Generate Link clicked (initId=${myInitId})`);

    const sessionId = generateTransferId();
    console.log(`[WebRTC Store] ▶ Sender: Generated sessionId=${sessionId}`);
    
    // Setup cleanup on tab close
    if (beforeUnloadHandler) window.removeEventListener('beforeunload', beforeUnloadHandler);
    beforeUnloadHandler = () => get().disconnect();
    window.addEventListener('beforeunload', beforeUnloadHandler);
    
    // Generate AES key for encryption
    const cryptoKey = await generateKey();
    if (myInitId !== currentInitId) {
      console.warn(`[WebRTC Store] ✖ Sender: STALE init detected after generateKey (myId=${myInitId}, current=${currentInitId}). Aborting.`);
      return;
    }

    const keyString = await exportKey(cryptoKey);
    const shareUrl = buildReceiveUrl(sessionId) + `#${keyString}`;

    // Create the initial short link in background (do not block initialization if it fails)
    let shortUrl: string | null = null;
    try {
      const shortCode = await createShortLink(sessionId, keyString);
      shortUrl = buildShortUrl(shortCode);
    } catch (error) {
      console.error('[WebRTC Store] Failed to generate initial short link', error);
    }

    set({
      sessionId,
      encryptionKey: cryptoKey,
      shareUrl,
      shortUrl,
      role: 'sender',
      connectionState: 'waiting',
      error: null,
      progress: { totalBytes: 0, transferredBytes: 0, currentSpeed: 0 }
    });

    try {
      console.log(`[WebRTC Store] ▶ Sender: Creating signaling session in Firestore (sessionId=${sessionId})...`);
      await createSignalingSession(sessionId);
      if (myInitId !== currentInitId) {
        console.warn(`[WebRTC Store] ✖ Sender: STALE init detected after createSignalingSession. Aborting.`);
        return;
      }
      console.log(`[WebRTC Store] ✓ Sender: Signaling session created successfully`);

      peerConnectionCreateCount++;
      dataChannelCreateCount++;
      console.log(`[WebRTC Store] ▶ Sender: Initializing WebRTCManager (PC #${peerConnectionCreateCount}, DC #${dataChannelCreateCount})`);
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
      if (myInitId !== currentInitId) {
        console.warn(`[WebRTC Store] ✖ Sender: STALE init detected after initialize(). Disconnecting orphaned manager.`);
        webrtcManager?.disconnect();
        webrtcManager = null;
        return;
      }
      console.log(`[WebRTC Store] ✓ Sender: Initialization complete (sessionId=${sessionId})`);

    } catch (err) {
      console.error(`[WebRTC Store] ✖ Sender initialization FAILED:`, err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize sender';
      set({ error: errorMsg, connectionState: 'failed' });
      throw err;
    }
  },

  generateNewShortLink: async () => {
    const { sessionId, encryptionKey } = get();
    if (!sessionId || !encryptionKey) return;
    try {
      const keyString = await exportKey(encryptionKey);
      const shortCode = await createShortLink(sessionId, keyString);
      const shortUrl = buildShortUrl(shortCode);
      set({ shortUrl });
    } catch (error) {
      console.error('[WebRTC Store] Failed to generate new short link', error);
    }
  },

  initializeAsReceiver: async (sessionId: string, keyString: string) => {
    // Guard: clean up any orphaned manager from a previous mount
    cleanupExistingManager();
    const myInitId = currentInitId;

    console.log(`[WebRTC Store] ▶ Receiver: initializeAsReceiver called (initId=${myInitId}, sessionId=${sessionId})`);

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
      console.log(`[WebRTC Store] ▶ Receiver: Importing AES key from URL`);
      const cryptoKey = await importKey(keyString);
      if (myInitId !== currentInitId) {
        console.warn(`[WebRTC Store] ✖ Receiver: STALE init detected after importKey (myId=${myInitId}, current=${currentInitId}). Aborting.`);
        return;
      }
      set({ encryptionKey: cryptoKey });

      peerConnectionCreateCount++;
      dataChannelCreateCount++;
      console.log(`[WebRTC Store] ▶ Receiver: Initializing WebRTCManager (PC #${peerConnectionCreateCount}, DC #${dataChannelCreateCount}, initId=${myInitId})`);
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
      if (myInitId !== currentInitId) {
        console.warn(`[WebRTC Store] ✖ Receiver: STALE init detected after initialize(). Disconnecting orphaned manager.`);
        webrtcManager?.disconnect();
        webrtcManager = null;
        return;
      }
      console.log(`[WebRTC Store] ✓ Receiver: Initialization complete (sessionId=${sessionId}, initId=${myInitId})`);

    } catch (err) {
      console.error(`[WebRTC Store] ✖ Receiver initialization FAILED:`, err);
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
    console.log(`[WebRTC Store] Disconnecting and cleaning up... (currentInitId=${currentInitId})`);
    // Invalidate any in-flight async init so stale continuations abort
    currentInitId++;

    if (webrtcManager) {
      webrtcManager.disconnect();
      webrtcManager = null;
      peerConnectionDestroyCount++;
      dataChannelCloseCount++;
      console.log(`[WebRTC Store] Lifecycle: PeerConnections created=${peerConnectionCreateCount}, destroyed=${peerConnectionDestroyCount}, DataChannels created=${dataChannelCreateCount}, closed=${dataChannelCloseCount}`);
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
      shortUrl: null,
      connectionState: 'idle',
      role: null,
      error: null,
      progress: { totalBytes: 0, transferredBytes: 0, currentSpeed: 0 },
      receivedFiles: [],
    });
  }
}));
