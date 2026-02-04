import React, { useEffect, useRef } from 'react';
import { Card, Typography, Button, Space, Spin } from 'antd';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';

const { Title, Text } = Typography;

const ChatWindow = ({
    channel,
    messages,
    loading,
    onLoadMore,
    hasMore,
    currentUserId,
    typingUsers
}) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <Card
            style={{ height: '100%', borderRadius: 16, display: 'flex', flexDirection: 'column' }}
            styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}
        >
            <div style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 12 }}>
                <Title level={4} style={{ margin: 0 }}>#{channel?.name || 'Select a channel'}</Title>
                <Text type="secondary">{channel?.description || 'Chat with your team in real time.'}</Text>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 6 }}>
                {hasMore && (
                    <Button size="small" onClick={onLoadMore} style={{ marginBottom: 12 }}>
                        Load earlier messages
                    </Button>
                )}

                {loading ? (
                    <Spin />
                ) : (
                    <Space direction="vertical" size={16} style={{ width: '100%' }}>
                        {messages.length === 0 ? (
                            <Text type="secondary">No messages yet. Start the conversation!</Text>
                        ) : (
                            messages.map((message) => (
                                <MessageItem
                                    key={message.message_id || message.id || message.temp_id}
                                    message={message}
                                    isOwn={(message.sender_id || message.sender?.id) === currentUserId}
                                />
                            ))
                        )}
                    </Space>
                )}
                <div ref={bottomRef} />
            </div>

            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 12 }}>
                <TypingIndicator typingUsers={typingUsers} />
            </div>
        </Card>
    );
};

export default ChatWindow;
