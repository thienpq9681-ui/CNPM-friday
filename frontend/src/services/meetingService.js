/**
 * Meeting Service - Phase 3
 * Copy file này vào: frontend/src/services/meetingService.js
 * 
 * Quản lý các API calls cho Meetings và Video Calls
 */

import api from './api';
import peerService from './peerService';

// ============ MEETING API ============

/**
 * Tạo meeting mới
 * @param {object} meetingData - { team_id, title, start_time, end_time?, link_url? }
 */
export const scheduleMeeting = async (meetingData) => {
    const response = await api.post('/meetings/', meetingData);
    return response.data;
};

/**
 * Lấy danh sách meetings của team
 * @param {number} teamId - ID của team
 * @param {boolean} upcomingOnly - Chỉ lấy meetings sắp diễn ra
 */
export const getTeamMeetings = async (teamId, upcomingOnly = false) => {
    const response = await api.get('/meetings/', {
        // ============ PEERJS VIDEO CALL ============

        export const initPeer = (peerId, options = {}) => peerService.init(peerId, options);

        export const getLocalStream = (constraints = { video: true, audio: true }) =>
            peerService.getLocalStream(constraints);

        export const callPeer = (remotePeerId) => peerService.callPeer(remotePeerId);

        export const endCall = (remotePeerId) => {
            if (peerService.connections?.has?.(remotePeerId)) {
                const entry = peerService.connections.get(remotePeerId);
                entry?.call?.close();
                peerService.connections.delete(remotePeerId);
            }
        };

        export const endAllCalls = () => {
            peerService.disconnect();
        };

        export const toggleAudio = (enabled) => peerService.toggleAudio(enabled);

        export const toggleVideo = (enabled) => peerService.toggleVideo(enabled);

        export const cleanupPeer = () => peerService.disconnect();
/**
 * Tắt local stream và cleanup
 */
export const stopLocalStream = () => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
};

/**
 * Disconnect PeerJS hoàn toàn
 */
export const disconnectPeer = () => {
    endAllCalls();
    stopLocalStream();

    if (peer) {
        peer.destroy();
        peer = null;
    }

    console.log('PeerJS disconnected');
};

/**
 * Lấy tất cả remote streams hiện tại
 */
export const getRemoteStreams = () => {
    return new Map(remoteStreams);
};

/**
 * Lấy PeerJS instance
 */
export const getPeer = () => peer;

/**
 * Toggle mute audio
 */
export const toggleAudio = () => {
    if (!localStream) return false;

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
    }
    return false;
};

/**
 * Toggle video on/off
 */
export const toggleVideo = () => {
    if (!localStream) return false;

    const videoTrack = localStream.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
    }
    return false;
};


// ============ UTILITY FUNCTIONS ============

/**
 * Format thời gian meeting
 * @param {string} dateString - ISO date string
 */
export const formatMeetingTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Kiểm tra meeting có đang diễn ra không
 * @param {object} meeting - Meeting object với start_time và end_time
 */
export const isMeetingActive = (meeting) => {
    const now = new Date();
    const start = new Date(meeting.start_time);
    const end = meeting.end_time ? new Date(meeting.end_time) : null;

    return now >= start && (!end || now <= end);
};

/**
 * Kiểm tra meeting sắp diễn ra (trong 15 phút tới)
 * @param {object} meeting - Meeting object
 */
export const isMeetingSoon = (meeting) => {
    const now = new Date();
    const start = new Date(meeting.start_time);
    const diff = start - now;

    return diff > 0 && diff <= 15 * 60 * 1000; // 15 minutes
};


export default {
    // API
    scheduleMeeting,
    getTeamMeetings,
    getMeeting,
    updateMeeting,
    cancelMeeting,
    joinMeeting,
    // PeerJS
    initPeer,
    getLocalStream,
    callPeer,
    endCall,
    endAllCalls,
    stopLocalStream,
    disconnectPeer,
    getRemoteStreams,
    getPeer,
    toggleAudio,
    toggleVideo,
    // Utilities
    formatMeetingTime,
    isMeetingActive,
    isMeetingSoon
};
