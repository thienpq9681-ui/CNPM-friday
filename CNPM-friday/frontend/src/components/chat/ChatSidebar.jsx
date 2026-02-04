import React from 'react';
import { Card, List, Typography, Select, Space, Badge, Skeleton, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ChatSidebar = ({
    teams,
    selectedTeamId,
    onTeamChange,
    channels,
    selectedChannelId,
    onSelectChannel,
    loadingChannels,
    onCreateChannel
}) => {
    return (
        <Card
            style={{ height: '100%', borderRadius: 16 }}
            styles={{ body: { padding: 16, display: 'flex', flexDirection: 'column', gap: 12, height: '100%' } }}
        >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <div>
                    <Text strong style={{ fontSize: 14 }}>Team</Text>
                    <Select
                        value={selectedTeamId}
                        onChange={onTeamChange}
                        placeholder="Select a team"
                        style={{ width: '100%', marginTop: 8 }}
                        options={teams.map((team) => ({
                            label: team.team_name || team.name || `Team ${team.id || team.team_id}`,
                            value: team.id || team.team_id
                        }))}
                    />
                </div>
                <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Text strong style={{ fontSize: 14 }}>Channels</Text>
                    {onCreateChannel && (
                        <Button size="small" icon={<PlusOutlined />} onClick={onCreateChannel} />
                    )}
                </Space>
            </Space>

            <div style={{ flex: 1, overflowY: 'auto', marginTop: 8 }}>
                {loadingChannels ? (
                    <Space direction="vertical" style={{ width: '100%' }}>
                        {Array.from({ length: 5 }).map((_, idx) => (
                            <Skeleton.Input key={idx} active size="small" style={{ width: '100%' }} />
                        ))}
                    </Space>
                ) : (
                    <List
                        dataSource={channels}
                        locale={{ emptyText: 'No channels yet' }}
                        renderItem={(channel) => {
                            const isActive = (channel.id || channel.channel_id) === selectedChannelId;
                            return (
                                <List.Item
                                    key={channel.id || channel.channel_id}
                                    onClick={() => onSelectChannel(channel.id || channel.channel_id)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        marginBottom: 6,
                                        background: isActive ? 'rgba(24, 144, 255, 0.1)' : 'transparent'
                                    }}
                                >
                                    <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                                        <Text strong={isActive}>#{channel.name}</Text>
                                        <Badge count={channel.message_count || 0} overflowCount={99} />
                                    </Space>
                                </List.Item>
                            );
                        }}
                    />
                )}
            </div>
        </Card>
    );
};

export default ChatSidebar;
