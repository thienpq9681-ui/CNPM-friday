import React, { useState, useEffect, useRef } from 'react';
import { Typography, Button, Space, Avatar, List, Input, Divider, Badge, message, Select, Modal } from 'antd';
import {
    VideoCameraOutlined,
    SettingOutlined,
    LogoutOutlined,
    AudioOutlined,
    AudioMutedOutlined,
    CameraOutlined,
    PhoneOutlined,
    UserOutlined,
    MessageOutlined,
    ShareAltOutlined,
    MoreOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { useAuth } from '../components/AuthContext';
import MainLayout from '../components/MainLayout';
import { teamService } from '../services/api';
// Use the new named exports
import {
    scheduleMeeting,
    joinMeeting,
    cancelMeeting,
    getMeeting,
    initPeer,
    getLocalStream,
    stopLocalStream,
    disconnectPeer,
    callPeer,
    toggleAudio,
    toggleVideo
} from '../services/meetingService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const TeamMeetings = () => {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isInMeeting, setIsInMeeting] = useState(false);
    const [currentMeeting, setCurrentMeeting] = useState(null);
    const [currentTime, setCurrentTime] = useState(dayjs());
    const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
    const [joinCode, setJoinCode] = useState('');

    // Fetch user's teams on mount
    useEffect(() => {
        const fetchTeams = async () => {
            if (!user) return;
            try {
                const res = await teamService.getAll();
                const myTeams = res.data || [];
                setTeams(myTeams);
                if (myTeams.length > 0) {
                    setSelectedTeam(myTeams[0]);
                }
            } catch (error) {
                console.error("Failed to fetch teams", error);
            }
        };
        fetchTeams();
    }, [user]);

    // Update clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleStartMeeting = async () => {
        if (!selectedTeam) {
            message.warning("Please join a team to start a meeting.");
            return;
        }

        try {
            message.loading({ content: "Creating meeting...", key: "createMeeting" });
            const meetingData = {
                team_id: selectedTeam.id,
                title: `Meeting for ${selectedTeam.name}`,
                start_time: new Date().toISOString()
            };
            const res = await scheduleMeeting(meetingData);
            
            setCurrentMeeting(res);
            setIsInMeeting(true);
            message.success({ content: "Meeting started!", key: "createMeeting" });
        } catch (error) {
            console.error("Failed to create meeting", error);
            message.error({ content: "Failed to create meeting", key: "createMeeting" });
        }
    };

    const handleLeaveMeeting = () => {
        setIsInMeeting(false);
        setCurrentMeeting(null);
    };

    const handleJoinSubmit = async () => {
        if (!joinCode) return;

        let meetingId = joinCode.trim();

        if (!/^\d+$/.test(meetingId)) {
            // Basic validation
        }

        try {
            message.loading({ content: "Joining meeting...", key: "joinMeeting" });
            // joinMeeting returns response.data
            const res = await joinMeeting(meetingId);

            // Fetch details to get team info
            const meeting = await getMeeting(meetingId);

            if (meeting.team_id) {
                const team = teams.find(t => t.id === meeting.team_id);
                if (team) setSelectedTeam(team);
            }

            setCurrentMeeting(meeting);
            setIsInMeeting(true);
            setIsJoinModalOpen(false);
            setJoinCode('');
            message.success({ content: "Joined meeting successfully", key: "joinMeeting" });

        } catch (error) {
            console.error("Failed to join meeting", error);
            message.error({ content: "Failed to join meeting. Check ID.", key: "joinMeeting" });
        }
    };

    return (
        <MainLayout>
            {isInMeeting && currentMeeting ? (
                <MeetingRoom
                    user={user}
                    team={selectedTeam}
                    meeting={currentMeeting}
                    currentTime={currentTime}
                    onLeave={handleLeaveMeeting}
                />
            ) : (
                <div style={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#fff',
                    borderRadius: '12px',
                    minHeight: '80vh'
                }}>
                    <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                        <Title level={1} style={{ fontSize: '38px', marginBottom: '16px' }}>
                            Create video meeting room
                        </Title>
                        <Text style={{ fontSize: '18px', display: 'block', color: '#595959', lineHeight: '1.6' }}>
                            The call-making feature is for everyone.<br />
                            Connect, collaborate, and celebrate with your team.
                        </Text>

                        {teams.length > 0 && (
                            <div style={{ marginTop: '24px' }}>
                                <Text strong>Selected Team: </Text>
                                <Select
                                    value={selectedTeam?.id}
                                    onChange={(val) => setSelectedTeam(teams.find(t => t.id === val))}
                                    style={{ width: 200 }}
                                >
                                    {teams.map(t => (
                                        <Option key={t.id} value={t.id}>{t.name}</Option>
                                    ))}
                                </Select>
                            </div>
                        )}

                        <div style={{ marginTop: '40px' }}>
                            <Space size="large">
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<VideoCameraOutlined />}
                                    onClick={handleStartMeeting}
                                    disabled={!selectedTeam}
                                    style={{
                                        height: '56px',
                                        padding: '0 32px',
                                        fontSize: '18px',
                                        borderRadius: '28px',
                                        backgroundColor: '#52c41a',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(82, 196, 26, 0.35)'
                                    }}
                                >
                                    New Meeting
                                </Button>
                                <Button
                                    size="large"
                                    icon={<TeamOutlined />}
                                    onClick={() => setIsJoinModalOpen(true)}
                                    style={{
                                        height: '56px',
                                        padding: '0 32px',
                                        fontSize: '18px',
                                        borderRadius: '28px',
                                        backgroundColor: '#f0f0f0',
                                        border: 'none',
                                        color: '#595959'
                                    }}
                                >
                                    Join A Meeting
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>
            )}

            <Modal
                title="Join a Meeting"
                open={isJoinModalOpen}
                onOk={handleJoinSubmit}
                onCancel={() => setIsJoinModalOpen(false)}
                okText="Join"
            >
                <div style={{ padding: '24px 0' }}>
                    <Text style={{ display: 'block', marginBottom: 8 }}>Enter the Meeting ID:</Text>
                    <Input
                        placeholder="e.g. 123"
                        size="large"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        prefix={<TeamOutlined />}
                    />
                </div>
            </Modal>
        </MainLayout>
    );
};

const MeetingRoom = ({ user, team, meeting, currentTime, onLeave }) => {
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);
    const [participants, setParticipants] = useState([]);
    const [isLeader, setIsLeader] = useState(false);
    const [remoteStreams, setRemoteStreams] = useState({}); // Map of peerId -> stream

    // Video refs
    const myVideoRef = useRef(null);

    // Display Meeting ID as code
    const roomCode = meeting ? `${meeting.id}` : (team ? `TEAM-${team.id}` : 'N/A');

    useEffect(() => {
        if (team && user) {
            setIsLeader(team.leader_id === user.user_id || team.leader_id === user.id);
        }
    }, [team, user]);

    // Initialize PeerJS and Media
    useEffect(() => {
        const setupMediaAndPeer = async () => {
            // 1. Get Local Stream
            try {
                const stream = await getLocalStream();
                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                message.error("Error accessing camera/microphone");
            }

            // 2. Init Peer
            // Use user_id as peer id for simplicity, or handle collision logic
            try {
                await initPeer(`${user.user_id}`);

                // 3. Listen for remote streams from the service event
                window.addEventListener('peer-stream', handleRemoteStream);

            } catch (err) {
                console.error("Peer init failed", err);
            }
        };

        setupMediaAndPeer();

        return () => {
            window.removeEventListener('peer-stream', handleRemoteStream);
            disconnectPeer();
            // stopLocalStream(); // Optionally stop it, or let the service handle it
        };
    }, [user]);

    const handleRemoteStream = (e) => {
        const { peerId, stream } = e.detail;
        setRemoteStreams(prev => ({
            ...prev,
            [peerId]: stream
        }));
    };

    // Toggle logic utilizing service
    const handleToggleMic = () => {
        const newState = toggleAudio();
        setMicOn(newState);
    };

    const handleToggleCam = () => {
        const newState = toggleVideo();
        setCameraOn(newState);
    };

    // Fetch participants
    useEffect(() => {
        const fetchMembers = async () => {
            if (!team) return;
            try {
                const res = await teamService.getDetail(team.id);
                const members = res.data.members || [];

                const formattedParticipants = members.map(m => {
                    const id = m.student_id || m.user_id || m.id;
                    return {
                        id: id,
                        name: m.full_name || m.name,
                        isMe: id === user.user_id,
                        avatar: m.avatar_url,
                        status: 'online'
                    };
                });

                // Sort to put Me first
                const me = formattedParticipants.find(p => p.isMe);
                const others = formattedParticipants.filter(p => !p.isMe);

                if (me) {
                    setParticipants([me, ...others]);
                } else {
                    setParticipants(others);
                }

            } catch (error) {
                console.error("Failed to load participants", error);
            }
        };
        fetchMembers();
    }, [team, user]);

    const handleCancelMeeting = async () => {
        if (!meeting) return;
        try {
            await cancelMeeting(meeting.id);
            message.success("Meeting canceled successfully");
            onLeave();
        } catch (error) {
            console.error("Failed to cancel meeting", error);
            message.error("Failed to cancel meeting");
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>

            {/* Top Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                background: '#fff',
                padding: '12px 24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f0f0f0', padding: '6px 16px', borderRadius: '8px' }}>
                    <Text strong style={{ marginRight: 8, color: '#595959' }}>Meeting ID:</Text>
                    <Text copyable>{roomCode}</Text>
                </div>

                <Title level={4} style={{ margin: 0 }}>{currentTime.format('h:mm A')}</Title>

                <Space size="middle">
                    <Button icon={<SettingOutlined />} shape="circle" />
                    <Button icon={<MoreOutlined />} shape="circle" />
                </Space>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', flex: 1, gap: '24px', overflow: 'hidden' }}>

                {/* Video Grid */}
                <div style={{ flex: 3, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', overflowY: 'auto' }}>
                    {participants.map((p, index) => {
                        // Determine what to show.
                        // If it's me -> shows local stream (myVideoRef)
                        // If it's remote -> check remoteStreams[p.id]
                        // BUT user IDs might not match peer IDs exactly if we don't map them carefully.
                        // Assuming peerId = user_id for now.

                        const remoteStream = remoteStreams[`${p.id}`];

                        return (
                            <div key={index} style={{
                                background: '#e6e6e6',
                                borderRadius: '16px',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '200px',
                                aspectRatio: '16/9',
                                overflow: 'hidden'
                            }}>
                                {p.isMe ? (
                                    <video
                                        ref={myVideoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: cameraOn ? 'block' : 'none' }}
                                    />
                                ) : (
                                    <>
                                        {remoteStream ? (
                                            <RemoteVideo stream={remoteStream} />
                                        ) : (
                                            p.avatar && !remoteStream ? (
                                                <img src={p.avatar} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ textAlign: 'center' }}>
                                                    <Avatar size={64} style={{ marginBottom: 8 }} icon={<UserOutlined />}>{p.name[0]}</Avatar>
                                                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                                                </div>
                                            )
                                        )}
                                    </>
                                )}

                                {!p.isMe && !remoteStream && !p.avatar && (
                                    <div style={{ textAlign: 'center' }}>
                                        <Avatar size={64} style={{ marginBottom: 8 }} icon={<UserOutlined />}>{p.name[0]}</Avatar>
                                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                                    </div>
                                )}

                                <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>
                                    {p.name} {p.isMe ? '(You)' : ''}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Sidebar */}
                <div style={{
                    flex: 1,
                    background: '#fff',
                    borderRadius: '16px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    maxWidth: '300px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <Title level={5} style={{ margin: 0 }}>People</Title>
                        <Text type="secondary">({participants.length})</Text>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <List
                            itemLayout="horizontal"
                            dataSource={participants}
                            renderItem={item => (
                                <List.Item style={{ padding: '12px 0', border: 'none' }}>
                                    <List.Item.Meta
                                        avatar={<Avatar size="large" src={item.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#d9d9d9' }} />}
                                        title={<Text style={{ fontSize: '16px' }}>{item.name} {item.isMe ? '(You)' : ''}</Text>}
                                        description={<Badge status={item.status === 'online' ? 'success' : 'default'} text={item.status} />}
                                    />
                                </List.Item>
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                marginTop: '16px',
                background: '#434343',
                borderRadius: '16px',
                padding: '16px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#fff'
            }}>
                <Space size="large">
                    <Button
                        shape="circle"
                        size="large"
                        icon={micOn ? <AudioOutlined /> : <AudioMutedOutlined />}
                        onClick={handleToggleMic}
                        className={!micOn ? 'danger-button' : ''}
                        type={!micOn ? 'primary' : 'default'}
                        danger={!micOn}
                    />
                    <Button
                        shape="circle"
                        size="large"
                        icon={<CameraOutlined />}
                        onClick={handleToggleCam}
                        type={!cameraOn ? 'primary' : 'default'}
                        danger={!cameraOn}
                    />
                    <Button shape="circle" size="large" icon={<ShareAltOutlined />} />
                </Space>

                <Space size="large">
                    <Button shape="circle" size="large" icon={<UserOutlined />} />
                    <Button shape="circle" size="large" icon={<MessageOutlined />} />
                    <Button shape="circle" size="large" icon={<MoreOutlined />} />
                </Space>

                {isLeader ? (
                    <Button
                        type="primary"
                        danger
                        shape="round"
                        size="large"
                        icon={<PhoneOutlined rotate={225} />}
                        onClick={handleCancelMeeting}
                        style={{ padding: '0 32px', height: '48px' }}
                    >
                        Cancel Meeting
                    </Button>
                ) : (
                    <Button
                        type="primary"
                        danger
                        shape="round"
                        size="large"
                        icon={<PhoneOutlined rotate={225} />}
                        onClick={onLeave}
                        style={{ padding: '0 32px', height: '48px' }}
                    >
                        Leave Meeting
                    </Button>
                )}
            </div>
        </div>
    );
};

// Helper component for remote video
const RemoteVideo = ({ stream }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
    );
};

export default TeamMeetings;
