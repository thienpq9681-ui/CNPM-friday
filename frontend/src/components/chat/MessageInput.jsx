import React, { useRef, useState } from 'react';
import { Input, Button, Space, Popover } from 'antd';
import { SendOutlined, SmileOutlined, PictureOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const EMOJIS = ['😀', '😄', '😁', '😊', '😉', '😍', '😘', '😎', '🤔', '😅', '😂', '😭', '😡', '👍', '🙏', '🔥', '🎉', '❤️', '✅', '🚀'];

const MessageInput = ({ onSend, onTyping, disabled }) => {
    const [value, setValue] = useState('');
    const fileInputRef = useRef(null);

    const handleSend = () => {
        const trimmed = value.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setValue('');
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const handleChange = (event) => {
        setValue(event.target.value);
        if (onTyping) {
            onTyping();
        }
    };

    const handleEmojiSelect = (emoji) => {
        setValue((prev) => `${prev}${emoji}`);
        if (onTyping) {
            onTyping();
        }
    };

    const handlePickImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type?.startsWith('image/')) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            if (typeof dataUrl === 'string') {
                onSend({ type: 'image', dataUrl, fileName: file.name });
            }
        };
        reader.readAsDataURL(file);
    };

    const emojiContent = (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, padding: 4 }}>
            {EMOJIS.map((emoji) => (
                <Button
                    key={emoji}
                    type="text"
                    style={{ fontSize: 18 }}
                    onClick={() => handleEmojiSelect(emoji)}
                >
                    {emoji}
                </Button>
            ))}
        </div>
    );

    return (
        <Space style={{ width: '100%' }}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <Popover content={emojiContent} trigger="click">
                <Button icon={<SmileOutlined />} disabled={disabled} />
            </Popover>
            <Button icon={<PictureOutlined />} onClick={handlePickImage} disabled={disabled} />
            <TextArea
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoSize={{ minRows: 1, maxRows: 4 }}
                placeholder="Type a message..."
                disabled={disabled}
            />
            <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={disabled || !value.trim()}
            />
        </Space>
    );
};

export default MessageInput;
