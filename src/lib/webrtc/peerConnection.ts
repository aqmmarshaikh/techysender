/**
 * BYTEPORT — WebRTC Peer Connection Manager
 *
 * Wraps RTCPeerConnection and RTCDataChannel to handle sending
 * and receiving file chunks securely over the network.
 */

import {
  updateSession,
  addIceCandidate,
  subscribeToIceCandidates,
  subscribeToSession
} from './signaling';
import { encryptChunk, decryptChunk } from '../encryption';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const CHUNK_SIZE = 64 * 1024; // 64 KB (optimal for RTCDataChannel)

export type TransferRole = 'sender' | 'receiver';

export interface WebRTCProgress {
  totalBytes: number;
  transferredBytes: number;
  currentSpeed: number; // bytes per second
}

interface PeerConnectionCallbacks {
  onStatusChange: (status: string) => void;
  onProgress: (progress: WebRTCProgress) => void;
  onFileComplete: (fileBuffer: ArrayBuffer, metadata: any) => void;
  onError: (error: string) => void;
}

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private role: TransferRole;
  private sessionId: string;
  private cryptoKey: CryptoKey;
  private callbacks: PeerConnectionCallbacks;
  private unsubscribes: (() => void)[] = [];
  
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private disconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private isDisconnecting = false;

  // Transfer state
  private transferState = {
    totalBytes: 0,
    transferredBytes: 0,
    startTime: 0,
    lastUpdateBytes: 0,
    lastUpdateTime: 0,
  };

  // Receiving state
  private receiveBuffer: ArrayBuffer[] = [];
  private currentFileMeta: any = null;
  private currentFileReceivedBytes = 0;

  constructor(role: TransferRole, sessionId: string, cryptoKey: CryptoKey, callbacks: PeerConnectionCallbacks) {
    this.role = role;
    this.sessionId = sessionId;
    this.cryptoKey = cryptoKey;
    this.callbacks = callbacks;
  }

  private get isTransferComplete() {
    return this.transferState.totalBytes > 0 && this.transferState.transferredBytes >= this.transferState.totalBytes;
  }

  public async initialize() {
    console.log(`[WebRTC] Initializing as ${this.role} for session ${this.sessionId}`);
    this.pc = new RTCPeerConnection(ICE_SERVERS);

    // ── Setup ICE Candidate Gathering ──
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WebRTC] Local ICE candidate generated: ${event.candidate.candidate}`);
        addIceCandidate(
          this.sessionId,
          this.role === 'sender' ? 'caller' : 'callee',
          event.candidate.toJSON()
        );
      } else {
        console.log(`[WebRTC] Local ICE gathering COMPLETE (null candidate).`);
      }
    };

    this.pc.onicegatheringstatechange = () => {
      if (!this.pc) return;
      console.log(`[WebRTC] ICE Gathering State changed: ${this.pc.iceGatheringState}`);
    };

    // ── Setup Connection State Monitoring ──
    this.pc.onconnectionstatechange = () => {
      if (!this.pc) return;
      console.log(`[WebRTC] PeerConnection onconnectionstatechange: ${this.pc.connectionState} (isDisconnecting: ${this.isDisconnecting}, isTransferComplete: ${this.isTransferComplete})`);
      
      if (this.isDisconnecting) return;

      if (this.isTransferComplete && (this.pc.connectionState === 'disconnected' || this.pc.connectionState === 'failed' || this.pc.connectionState === 'closed')) {
        console.log(`[WebRTC] Ignoring PeerConnection state ${this.pc.connectionState} because transfer is already complete.`);
        return;
      }

      if (this.pc.connectionState === 'connected') {
        if (this.disconnectTimeout) {
          clearTimeout(this.disconnectTimeout);
          this.disconnectTimeout = null;
          console.log(`[WebRTC] Recovered from disconnected state!`);
        }
        this.callbacks.onStatusChange(this.pc.connectionState);
        // Reset transfer stats on connect
        this.transferState.startTime = Date.now();
        this.transferState.lastUpdateTime = Date.now();
      } else if (this.pc.connectionState === 'disconnected') {
        console.warn(`[WebRTC] Connection lost temporarily. Waiting 5 seconds for recovery...`);
        if (!this.disconnectTimeout) {
          this.disconnectTimeout = setTimeout(() => {
            console.error(`[WebRTC] Recovery timeout expired. Failing connection.`);
            if (!this.isDisconnecting && !this.isTransferComplete) {
              this.callbacks.onStatusChange('failed');
            }
            this.disconnectTimeout = null;
          }, 5000);
        }
      } else if (this.pc.connectionState === 'failed') {
        if (this.disconnectTimeout) {
          clearTimeout(this.disconnectTimeout);
          this.disconnectTimeout = null;
        }
        this.callbacks.onStatusChange('failed');
      } else {
        this.callbacks.onStatusChange(this.pc.connectionState);
      }
    };

    this.pc.oniceconnectionstatechange = () => {
      if (!this.pc) return;
      console.log(`[WebRTC] ICE Connection State changed: ${this.pc.iceConnectionState}`);
    };

    this.pc.onsignalingstatechange = () => {
      if (!this.pc) return;
      console.log(`[WebRTC] Signaling State changed: ${this.pc.signalingState}`);
    };

    if (this.role === 'sender') {
      console.log(`[WebRTC] Sender: Creating DataChannel`);
      // Sender = Caller = Creates DataChannel
      this.dataChannel = this.pc.createDataChannel('byteport-transfer', {
        ordered: true,
      });
      this.setupDataChannel(this.dataChannel);

      // Create Offer
      console.log(`[WebRTC] Sender: Creating Offer`);
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Write Offer to Firestore
      console.log(`[WebRTC] Sender: Saving Offer to signaling session`);
      await updateSession(this.sessionId, {
        offer: { type: offer.type, sdp: offer.sdp },
        status: 'connecting',
      });

      // Listen for Answer
      console.log(`[WebRTC] Sender: Listening for Answer...`);
      const unsub = subscribeToSession(this.sessionId, async (data) => {
        if (data.answer && this.pc && this.pc.signalingState === 'have-local-offer') {
          console.log(`[WebRTC] Sender: Received Answer, setting remote description`);
          await this.pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          
          // Apply any buffered ICE candidates
          this.processPendingIceCandidates();
        }
      });
      this.unsubscribes.push(unsub);

      // Listen for Receiver's ICE Candidates
      const unsubIce = subscribeToIceCandidates(this.sessionId, 'callee', async (candidate) => {
        console.log(`[WebRTC] Remote ICE candidate received from receiver: ${candidate.candidate}`);
        if (this.pc && this.pc.remoteDescription) {
          console.log(`[WebRTC] Sender: Adding remote ICE candidate immediately`);
          await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.log(`[WebRTC] Sender: Buffering remote ICE candidate (remoteDescription not set)`);
          this.pendingIceCandidates.push(candidate);
        }
      });
      this.unsubscribes.push(unsubIce);

    } else {
      // Receiver = Callee = Waits for DataChannel
      console.log(`[WebRTC] Receiver: Waiting for DataChannel...`);
      this.pc.ondatachannel = (event) => {
        console.log(`[WebRTC] Receiver: DataChannel received`);
        this.dataChannel = event.channel;
        this.setupDataChannel(this.dataChannel);
      };

      // Listen for Offer
      console.log(`[WebRTC] Receiver: Listening for Offer...`);
      const unsub = subscribeToSession(this.sessionId, async (data) => {
        if (data.offer && this.pc && this.pc.signalingState === 'stable') {
          console.log(`[WebRTC] Receiver: Received Offer, setting remote description`);
          await this.pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          
          // Apply any buffered ICE candidates
          this.processPendingIceCandidates();
          
          console.log(`[WebRTC] Receiver: Creating Answer`);
          const answer = await this.pc.createAnswer();
          await this.pc.setLocalDescription(answer);

          // Write Answer to Firestore
          console.log(`[WebRTC] Receiver: Saving Answer to signaling session`);
          await updateSession(this.sessionId, {
            answer: { type: answer.type, sdp: answer.sdp },
          });
        }
      });
      this.unsubscribes.push(unsub);

      // Listen for Sender's ICE Candidates
      const unsubIce = subscribeToIceCandidates(this.sessionId, 'caller', async (candidate) => {
        console.log(`[WebRTC] Remote ICE candidate received from sender: ${candidate.candidate}`);
        if (this.pc && this.pc.remoteDescription) {
          console.log(`[WebRTC] Receiver: Adding remote ICE candidate immediately`);
          await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.log(`[WebRTC] Receiver: Buffering remote ICE candidate (remoteDescription not set)`);
          this.pendingIceCandidates.push(candidate);
        }
      });
      this.unsubscribes.push(unsubIce);
    }
  }

  private async processPendingIceCandidates() {
    if (!this.pc) return;
    console.log(`[WebRTC] Processing ${this.pendingIceCandidates.length} buffered ICE candidates`);
    for (const candidate of this.pendingIceCandidates) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error(`[WebRTC] Failed to add buffered ICE candidate`, e);
      }
    }
    this.pendingIceCandidates = [];
  }

  private setupDataChannel(channel: RTCDataChannel) {
    console.log(`[WebRTC] Setting up DataChannel events. Current readyState: ${channel.readyState}`);
    channel.binaryType = 'arraybuffer';

    channel.onopen = () => {
      console.log(`[WebRTC] EXPLICIT LOG: DataChannel reached OPEN state! (readyState: ${channel.readyState})`);
      this.callbacks.onStatusChange('channel-open');
    };

    channel.onclose = () => {
      console.log(`[WebRTC] DataChannel onclose fired. ReadyState: ${channel.readyState}`);
      if (this.isDisconnecting || this.isTransferComplete) {
        console.log(`[WebRTC] Ignoring channel-closed as connection is completing or disconnecting.`);
      } else {
        this.callbacks.onStatusChange('channel-closed');
      }
    };

    channel.onerror = (error) => {
      console.error(`[WebRTC] DataChannel onerror fired. ReadyState: ${channel.readyState}`, error);
      if (this.isDisconnecting || this.isTransferComplete) {
        console.log(`[WebRTC] Ignoring channel error because transfer is complete or already disconnecting.`);
        return;
      }
      this.callbacks.onError('Data channel error: ' + error);
    };

    channel.onmessage = (event) => {
      this.handleIncomingMessage(event.data);
    };
  }

  // ── Receiving Logic ──

  private async handleIncomingMessage(data: string | ArrayBuffer) {
    if (typeof data === 'string') {
      // Metadata message (JSON)
      try {
        const meta = JSON.parse(data);
        if (meta.type === 'file-start') {
          console.log(`[WebRTC] Receiving file start:`, meta.file.name);
          this.currentFileMeta = meta.file;
          this.receiveBuffer = [];
          this.currentFileReceivedBytes = 0;
          this.transferState.totalBytes = meta.totalBytes;
        } else if (meta.type === 'file-end') {
          console.log(`[WebRTC] Receiving file end, reconstructing file:`, this.currentFileMeta?.name);
          // Reassemble and emit
          const totalLength = this.receiveBuffer.reduce((sum, buf) => sum + buf.byteLength, 0);
          const completeBuffer = new Uint8Array(totalLength);
          let offset = 0;
          for (const buf of this.receiveBuffer) {
            completeBuffer.set(new Uint8Array(buf), offset);
            offset += buf.byteLength;
          }

          console.log(`[WebRTC] File reconstruction complete, triggering download`);
          this.callbacks.onFileComplete(completeBuffer.buffer, this.currentFileMeta);
          this.currentFileMeta = null;
          this.receiveBuffer = [];
        }
      } catch (e) {
        console.error('Failed to parse metadata message', e);
      }
    } else {
      // Binary chunk (encrypted)
      try {
        const dataArray = new Uint8Array(data);
        const iv = dataArray.slice(0, 12);
        const ciphertext = dataArray.slice(12).buffer;
        
        const plaintext = await decryptChunk(this.cryptoKey, { iv, ciphertext });
        
        this.receiveBuffer.push(plaintext);
        this.currentFileReceivedBytes += plaintext.byteLength;
        this.updateProgress(plaintext.byteLength);
        
        // Log every 10MB received
        if (this.currentFileReceivedBytes % (10 * 1024 * 1024) < data.byteLength) {
           console.log(`[WebRTC] Received and decrypted ${Math.round(this.currentFileReceivedBytes / (1024*1024))} MB`);
        }
      } catch (e) {
        console.error('Failed to decrypt chunk', e);
        this.callbacks.onError('Decryption failed');
      }
    }
  }

  // ── Sending Logic ──

  public async sendFiles(files: File[]) {
    console.log(`[WebRTC] Starting transmission of ${files.length} files`);
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error('Data channel is not open');
    }

    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    this.transferState.totalBytes = totalBytes;
    this.transferState.transferredBytes = 0;
    this.transferState.startTime = Date.now();
    this.transferState.lastUpdateTime = Date.now();
    this.transferState.lastUpdateBytes = 0;

    for (const file of files) {
      console.log(`[WebRTC] Sending file: ${file.name} (${file.size} bytes)`);
      await this.sendFile(file, totalBytes);
    }
    console.log(`[WebRTC] All files sent successfully`);
  }

  private async sendFile(file: File, overallTotalBytes: number) {
    if (!this.dataChannel) return;

    // Send metadata
    this.dataChannel.send(JSON.stringify({
      type: 'file-start',
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      totalBytes: overallTotalBytes,
    }));

    // Chunk and send
    const buffer = await file.arrayBuffer();
    let offset = 0;

    while (offset < buffer.byteLength) {
      if (this.dataChannel.readyState !== 'open') throw new Error('Channel closed during transfer');

      // Handle backpressure
      if (this.dataChannel.bufferedAmount > this.dataChannel.bufferedAmountLowThreshold + 1024 * 1024) {
        // Buffer is getting full (> 1MB), wait a bit
        await new Promise(r => setTimeout(r, 50));
        continue;
      }

      const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
      
      const { iv, ciphertext } = await encryptChunk(this.cryptoKey, chunk);
      
      // Packet format: [iv(12 bytes)] + [ciphertext]
      const packet = new Uint8Array(12 + ciphertext.byteLength);
      packet.set(iv, 0);
      packet.set(new Uint8Array(ciphertext), 12);

      this.dataChannel.send(packet);
      offset += chunk.byteLength;

      this.updateProgress(chunk.byteLength);
      
      // Log every 10MB sent
      if (offset % (10 * 1024 * 1024) < chunk.byteLength) {
         console.log(`[WebRTC] Encrypted and sent ${Math.round(offset / (1024*1024))} MB`);
      }
      
      // Yield to event loop to prevent blocking UI completely on fast networks
      if (offset % (CHUNK_SIZE * 10) === 0) {
        await new Promise(r => setTimeout(r, 0));
      }
    }

    // End of file
    this.dataChannel.send(JSON.stringify({ type: 'file-end' }));
  }

  // ── Stats ──

  private updateProgress(bytesAdded: number) {
    this.transferState.transferredBytes += bytesAdded;

    const now = Date.now();
    const dt = now - this.transferState.lastUpdateTime;

    // Update speed every 500ms to smooth it out
    if (dt > 500) {
      const db = this.transferState.transferredBytes - this.transferState.lastUpdateBytes;
      const speed = (db / dt) * 1000; // bytes per second

      this.callbacks.onProgress({
        totalBytes: this.transferState.totalBytes,
        transferredBytes: this.transferState.transferredBytes,
        currentSpeed: speed,
      });

      this.transferState.lastUpdateTime = now;
      this.transferState.lastUpdateBytes = this.transferState.transferredBytes;
    } else {
      // Still trigger progress update without recalculating speed
      this.callbacks.onProgress({
        totalBytes: this.transferState.totalBytes,
        transferredBytes: this.transferState.transferredBytes,
        currentSpeed: this.transferState.lastUpdateTime === 0 ? 0 : 
          ((this.transferState.transferredBytes - this.transferState.lastUpdateBytes) / dt) * 1000,
      });
    }
  }

  // ── Cleanup ──

  public disconnect() {
    if (this.isDisconnecting) {
      console.log(`[WebRTC] Disconnect called, but already disconnecting. Ignoring duplicate call.`);
      return;
    }
    console.log(`[WebRTC] Gracefully disconnecting PeerConnection and DataChannel...`);
    this.isDisconnecting = true;

    if (this.disconnectTimeout) {
      clearTimeout(this.disconnectTimeout);
      this.disconnectTimeout = null;
    }

    // Unsubscribe from signaling
    this.unsubscribes.forEach(u => u());
    this.unsubscribes = [];

    // Gracefully close DataChannel
    if (this.dataChannel) {
      try {
        if (this.dataChannel.readyState !== 'closed') {
          console.log(`[WebRTC] Closing DataChannel`);
          this.dataChannel.close();
        }
      } catch (e) {
        console.error(`[WebRTC] Error closing DataChannel`, e);
      }
    }

    // Gracefully close PeerConnection
    if (this.pc) {
      try {
        if (this.pc.signalingState !== 'closed') {
          console.log(`[WebRTC] Closing PeerConnection`);
          this.pc.close();
        }
      } catch (e) {
        console.error(`[WebRTC] Error closing PeerConnection`, e);
      }
    }
  }
}
