import React from 'react';
import { Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { formatMessageTime } from '../../services/chatService';

const { Text } = Typography;

const MessageItem = ({ message, isOwn }) => {
    const senderName = message.sender_name || message.sender?.full_name || 'Unknown';
    const timestamp = message.sent_at || message.updated_at || message.created_at;
    const content = message.content || '';
    const isImage = typeof content === 'string' && content.startsWith('data:image/');

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: isOwn ? 'row-reverse' : 'row',
                gap: 12,
                alignItems: 'flex-start'
            }}
        >
            <Avatar src={message.sender_avatar} icon={<UserOutlined />} />
            <div style={{ maxWidth: '70%', textAlign: isOwn ? 'right' : 'left' }}>
                <div style={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start', gap: 8 }}>
                    <Text strong>{senderName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatMessageTime(timestamp)}</Text>
                    {message.is_edited && <Text type="secondary" style={{ fontSize: 11 }}>(edited)</Text>}
                </div>
                <div
                    style={{
                        marginTop: 6,
                        background: isImage ? 'transparent' : (isOwn ? '#1890ff' : '#f5f5f5'),
                        color: isOwn ? '#fff' : '#1f1f1f',
                        padding: isImage ? 0 : '10px 12px',
                        borderRadius: 12,
                        wordBreak: 'break-word'
                    }}
                >
                    {isImage ? (
                        <img
                            src={content}
                            alt="sent attachment"
                            style={{ maxWidth: 280, borderRadius: 12, display: 'block' }}
                        />
                    ) : (
                        content
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageItem;
