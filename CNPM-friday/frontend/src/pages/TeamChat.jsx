import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, Typography, message as antdMessage, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../components/AuthContext';
import { teamService } from '../services/api';
import {
    getTeamChannels,
    getChannelMessages,
    sendMessage
} from '../services/chatService';
import {
    initSocket,
    disconnectSocket,
    onNewMessage,
    onTyping,
    sendTyping,
    joinChannel,
    leaveChannel,
    removeAllListeners
} from '../services/socketService';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';

const { Content } = Layout;
const { Title, Text } = Typography;

const PAGE_SIZE = 50;

const TeamChat = () => {
    const navigate = useNavigate();
    const { user, token, isAuthReady } = useAuth();
    const currentUserId = user?.user_id || user?.id;

    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [channels, setChannels] = useState([]);
    const [selectedChannelId, setSelectedChannelId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [hasMore, setHasMore] = useState(false);
    const [loadingChannels, setLoadingChannels] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [page, setPage] = useState(1);
    const [typingUsers, setTypingUsers] = useState([]);

    const typingTimeoutsRef = useRef(new Map());
    const selectedChannelIdRef = useRef(selectedChannelId);

    const selectedChannel = useMemo(() => {
        return channels.find((channel) => (channel.id || channel.channel_id) === selectedChannelId);
    }, [channels, selectedChannelId]);

    const loadTeams = async () => {
        try {
            const res = await teamService.getAll();
            const rawTeams = res?.data;
            const teamList = Array.isArray(rawTeams)
                ? rawTeams
                : (rawTeams?.teams || []);
            setTeams(teamList);
            const defaultTeamId = teamList[0]?.team_id || teamList[0]?.id || null;
            setSelectedTeamId((prev) => prev || defaultTeamId);
        } catch (error) {
            console.error(error);
            if (error?.response?.status === 401) {
                antdMessage.error('Session expired. Please sign in again.');
                navigate('/login', { replace: true });
                return;
            }
            antdMessage.error('Failed to load teams');
        }
    };

    const loadChannels = async (teamId) => {
        if (!teamId) return;
        setLoadingChannels(true);
        try {
            const data = await getTeamChannels(teamId);
            const channelList = Array.isArray(data) ? data : (data?.data || []);
            setChannels(channelList);
            const defaultChannelId = channelList[0]?.id || channelList[0]?.channel_id || null;
            setSelectedChannelId((prev) => prev || defaultChannelId);
        } catch (error) {
            console.error(error);
            antdMessage.error('Failed to load channels');
        } finally {
            setLoadingChannels(false);
        }
    };

    const normalizeMessages = (data) => {
        if (Array.isArray(data)) {
            return { list: data, hasMore: data.length === PAGE_SIZE };
        }
        if (Array.isArray(data?.messages)) {
            return { list: data.messages, hasMore: !!data.has_more };
        }
        return { list: [], hasMore: false };
    };

    const loadMessages = async (channelId, pageToLoad = 1) => {
        if (!channelId) return;
        setLoadingMessages(true);
        try {
            const skip = (pageToLoad - 1) * PAGE_SIZE;
            const data = await getChannelMessages(channelId, { skip, limit: PAGE_SIZE });
            const { list, hasMore: more } = normalizeMessages(data);
            setHasMore(more);
            setPage(pageToLoad);
            setMessages((prev) => {
                if (pageToLoad === 1) return list;
                return [...list, ...prev];
            });
        } catch (error) {
            console.error(error);
            antdMessage.error('Failed to load messages');
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSend = async (content) => {
        if (!selectedChannelId) {
            antdMessage.warning('Select a channel first');
            return;
        }
        const payload = typeof content === 'string'
            ? content
            : (content?.type === 'image' ? content.dataUrl : '');
        if (!payload) {
            return;
        }
        try {
            const response = await sendMessage(selectedChannelId, payload);
            const responseMessage = response?.message || response;
            const responseId = responseMessage?.message_id || responseMessage?.id;
            setMessages((prev) => {
                const exists = prev.some((item) => (item.message_id || item.id) === responseId);
                if (exists) return prev;
                return [...prev, responseMessage];
            });
        } catch (error) {
            console.error(error);
            antdMessage.error('Failed to send message');
        }
    };

    const handleTyping = () => {
        if (!selectedChannelId) return;
        sendTyping(selectedChannelId);
    };

    const handleLoadMore = () => {
        if (hasMore) {
            loadMessages(selectedChannelId, page + 1);
        }
    };

    useEffect(() => {
        if (!isAuthReady) return;
        if (!token) {
            navigate('/login', { replace: true });
            return;
        }
        loadTeams();
    }, [isAuthReady, token, navigate]);

    useEffect(() => {
        if (selectedTeamId) {
            setChannels([]);
            setSelectedChannelId(null);
            setMessages([]);
            loadChannels(selectedTeamId);
        }
    }, [selectedTeamId]);

    useEffect(() => {
        if (selectedChannelId) {
            loadMessages(selectedChannelId, 1);
        }
    }, [selectedChannelId]);

    useEffect(() => {
        selectedChannelIdRef.current = selectedChannelId;
    }, [selectedChannelId]);

    useEffect(() => {
        if (!isAuthReady || !token) return;

        initSocket(token);

        const handleIncomingMessage = (message) => {
            const activeChannelId = selectedChannelIdRef.current;
            const incomingMessage = message?.message || message;
            const incomingChannelId = message?.channel_id || incomingMessage?.channel_id || incomingMessage?.channel?.id;
            if (incomingChannelId !== activeChannelId) {
                return;
            }
            const messageId = incomingMessage?.message_id || incomingMessage?.id;
            setMessages((prev) => {
                const exists = prev.some((item) => (item.message_id || item.id) === messageId);
                if (exists) return prev;
                return [...prev, incomingMessage];
            });
        };

        const handleTypingEvent = (payload) => {
            const activeChannelId = selectedChannelIdRef.current;
            if (!payload || payload.channel_id !== activeChannelId) return;
            if (payload.user_id === currentUserId) return;

            setTypingUsers((prev) => {
                const exists = prev.some((user) => user.user_id === payload.user_id);
                if (exists) return prev;
                return [...prev, payload];
            });

            if (typingTimeoutsRef.current.has(payload.user_id)) {
                clearTimeout(typingTimeoutsRef.current.get(payload.user_id));
            }
            const timeout = setTimeout(() => {
                setTypingUsers((prev) => prev.filter((user) => user.user_id !== payload.user_id));
                typingTimeoutsRef.current.delete(payload.user_id);
            }, 2000);
            typingTimeoutsRef.current.set(payload.user_id, timeout);
        };

        onNewMessage(handleIncomingMessage);
        onTyping(handleTypingEvent);

        return () => {
            typingTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
            typingTimeoutsRef.current.clear();
            removeAllListeners();
            disconnectSocket();
        };
    }, [currentUserId, token, isAuthReady]);

    useEffect(() => {
        if (selectedChannelId) {
            joinChannel(selectedChannelId);
            return () => leaveChannel(selectedChannelId);
        }
        return undefined;
    }, [selectedChannelId]);

    return (
        <MainLayout>
            <Content>
                <div style={{ marginBottom: 24 }}>
                    <Title level={2} style={{ marginBottom: 4 }}>Team Chat</Title>
                    <Text type="secondary">Collaborate with your team in real-time.</Text>
                </div>

                <Row gutter={24} style={{ height: 'calc(100vh - 220px)' }}>
                    <Col xs={24} md={8} lg={6} style={{ height: '100%' }}>
                        <ChatSidebar
                            teams={teams}
                            selectedTeamId={selectedTeamId}
                            onTeamChange={setSelectedTeamId}
                            channels={channels}
                            selectedChannelId={selectedChannelId}
                            onSelectChannel={setSelectedChannelId}
                            loadingChannels={loadingChannels}
                        />
                    </Col>
                    <Col xs={24} md={16} lg={18} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ flex: 1, minHeight: 0 }}>
                            <ChatWindow
                                channel={selectedChannel}
                                messages={messages}
                                loading={loadingMessages}
                                onLoadMore={handleLoadMore}
                                hasMore={hasMore}
                                currentUserId={currentUserId}
                                typingUsers={typingUsers}
                            />
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <MessageInput
                                onSend={handleSend}
                                onTyping={handleTyping}
                                disabled={!selectedChannelId}
                            />
                        </div>
                    </Col>
                </Row>
            </Content>
        </MainLayout>
    );
};

export default TeamChat;
