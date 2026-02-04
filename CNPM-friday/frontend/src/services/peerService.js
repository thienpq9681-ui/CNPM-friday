<<<<<<< HEAD:frontend/src/services/peerService.js
/**
 * Peer Service - Phase 3
 * Helper for PeerJS video calls
 */

import Peer from 'peerjs';

class PeerService {
    constructor() {
        this.peer = null;
        this.localStream = null;
        this.connections = new Map(); // peerId -> { call, stream }
    }

    async init(peerId, options = {}) {
        return new Promise((resolve, reject) => {
            this.peer = new Peer(peerId, {
                host: import.meta.env.VITE_PEER_HOST || 'localhost',
                port: import.meta.env.VITE_PEER_PORT || 9000,
                path: '/peerjs',
                secure: import.meta.env.VITE_PEER_SECURE === 'true',
                debug: import.meta.env.DEV ? 2 : 0,
                ...options
            });

            this.peer.on('open', (id) => {
                console.log('✅ PeerJS connected with ID:', id);
                resolve(id);
            });

            this.peer.on('error', (err) => {
                console.error('PeerJS error:', err);
                reject(err);
            });
        });
    }

    async getLocalStream(constraints = { video: true, audio: true }) {
        if (this.localStream) return this.localStream;
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
        return this.localStream;
    }

    async callPeer(remotePeerId) {
        if (!this.peer) {
            throw new Error('PeerJS not initialized');
        }
        const localStream = await this.getLocalStream();
        const call = this.peer.call(remotePeerId, localStream);

        return new Promise((resolve, reject) => {
            call.on('stream', (remoteStream) => {
                this.connections.set(remotePeerId, { call, stream: remoteStream });
                resolve(remoteStream);
            });
            call.on('error', (err) => {
                reject(err);
            });
            call.on('close', () => {
                this.connections.delete(remotePeerId);
            });
        });
    }

    onIncomingCall(callback) {
        if (!this.peer) return;
        this.peer.on('call', async (call) => {
            const localStream = await this.getLocalStream();
            call.answer(localStream);

            call.on('stream', (remoteStream) => {
                this.connections.set(call.peer, { call, stream: remoteStream });
                callback(call.peer, remoteStream);
            });
        });
    }

    toggleAudio(enabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach((track) => {
                track.enabled = enabled;
            });
        }
    }

    toggleVideo(enabled) {
        if (this.localStream) {
            this.localStream.getVideoTracks().forEach((track) => {
                track.enabled = enabled;
            });
        }
    }

    disconnect() {
        this.connections.forEach(({ call }) => call.close());
        this.connections.clear();

        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }

        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    }
}

export default new PeerService();
=======
import Peer from 'peerjs';

let peer = null;

export const initPeer = (userId) => {
    // Using default public PeerJS server for dev
    peer = new Peer(userId);

    peer.on('open', (id) => {
        console.log('My peer ID is: ' + id);
    });

    return peer;
};

export const callPeer = (remotePeerId, localStream) => {
    if (!peer) return null;
    return peer.call(remotePeerId, localStream);
};

export const destroyPeer = () => {
    if (peer) {
        peer.destroy();
        peer = null;
    }
};
>>>>>>> upstream/main:CNPM-friday/frontend/src/services/peerService.js
