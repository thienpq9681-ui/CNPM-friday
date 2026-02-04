import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

const TypingIndicator = ({ typingUsers }) => {
    if (!typingUsers || typingUsers.length === 0) {
        return null;
    }

    const names = typingUsers.map((user) => user.user_name || user.name || 'Someone');
    const label = names.length === 1
        ? `${names[0]} is typing...`
        : `${names.slice(0, 2).join(', ')}${names.length > 2 ? ' and others' : ''} are typing...`;

    return (
        <Text type="secondary" style={{ fontSize: 12 }}>{label}</Text>
    );
};

export default TypingIndicator;
