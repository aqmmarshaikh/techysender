export type ConnectionStatus =
  | 'offline'
  | 'connecting'
  | 'connected'
  | 'transferring'
  | 'completed'
  | 'failed';

export interface PeerConnection {
  status: ConnectionStatus;
  peerId: string | null;
  dataChannel: RTCDataChannel | null;
  connection: RTCPeerConnection | null;
  lastActivity: number;
}

export interface SignalingData {
  transferId: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  iceCandidates: RTCIceCandidateInit[];
  updatedAt: number;
}
