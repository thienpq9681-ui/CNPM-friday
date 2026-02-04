import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Input, Modal, Row, Select, Space, Table, Tag, Typography, message } from 'antd';
import dayjs from 'dayjs';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../components/AuthContext';
import { teamService } from '../services/api';
import {
    createMentoringLog,
    deleteMentoringLog,
    generateAISuggestions,
    getTeamMentoringLogs,
    updateMentoringLog
} from '../services/mentoringService';

const { Title, Text } = Typography;
const { Option } = Select;

const MentoringPage = () => {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [form] = Form.useForm();

    const isMentor = useMemo(() => {
        return user?.role_id === 4 || user?.role_id === 1 || user?.role_id === 3;
    }, [user]);

    const fetchTeams = async () => {
        try {
            const res = await teamService.getAll();
            const teamList = Array.isArray(res?.data) ? res.data : (res?.data?.teams || []);
            setTeams(teamList);
            const defaultTeamId = teamList[0]?.team_id || teamList[0]?.id || null;
            setSelectedTeamId((prev) => prev || defaultTeamId);
        } catch (error) {
            console.error(error);
            message.error('Failed to load teams');
        }
    };

    const fetchLogs = async (teamId) => {
        if (!teamId) return;
        setLoading(true);
        try {
            const data = await getTeamMentoringLogs(teamId);
            const list = Array.isArray(data) ? data : (data?.logs || data?.data || []);
            const mapped = list.map((log) => ({
                ...log,
                key: log.id || log.log_id || log.mentoring_log_id || Math.random().toString(36).slice(2)
            }));
            setLogs(mapped);
        } catch (error) {
            console.error(error);
            message.error('Failed to load mentoring logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        fetchLogs(selectedTeamId);
    }, [selectedTeamId]);

    const openCreateModal = () => {
        setEditingLog(null);
        form.resetFields();
        form.setFieldsValue({ team_id: selectedTeamId });
        setModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingLog(record);
        form.resetFields();
        form.setFieldsValue({
            team_id: selectedTeamId,
            session_notes: record.session_notes || record.notes || '',
            discussion_points: record.discussion_points || record.points || '',
            meeting_date: record.meeting_date ? dayjs(record.meeting_date) : undefined
        });
        setModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                team_id: values.team_id,
                session_notes: values.session_notes,
                discussion_points: values.discussion_points,
                meeting_date: values.meeting_date ? values.meeting_date.toISOString() : undefined
            };
            if (editingLog) {
                const logId = editingLog.id || editingLog.log_id || editingLog.mentoring_log_id;
                await updateMentoringLog(logId, payload);
                message.success('Mentoring log updated');
            } else {
                await createMentoringLog(payload);
                message.success('Mentoring log created');
            }
            setModalOpen(false);
            fetchLogs(selectedTeamId);
        } catch (error) {
            if (error?.errorFields) return;
            console.error(error);
            message.error('Failed to save mentoring log');
        }
    };

    const handleDelete = async (record) => {
        const logId = record.id || record.log_id || record.mentoring_log_id;
        try {
            await deleteMentoringLog(logId);
            message.success('Mentoring log deleted');
            fetchLogs(selectedTeamId);
        } catch (error) {
            console.error(error);
            message.error('Failed to delete mentoring log');
        }
    };

    const handleGenerateAI = async (record) => {
        const logId = record.id || record.log_id || record.mentoring_log_id;
        setAiLoading((prev) => ({ ...prev, [logId]: true }));
        try {
            const context = [record.session_notes, record.discussion_points].filter(Boolean).join('\n');
            const response = await generateAISuggestions(logId, { team_id: selectedTeamId, context });
            const suggestion = response?.ai_suggestions || response?.suggestions || response?.data?.ai_suggestions;
            setLogs((prev) => prev.map((item) => (
                (item.id || item.log_id || item.mentoring_log_id) === logId
                    ? { ...item, ai_suggestions: suggestion || item.ai_suggestions }
                    : item
            )));
            message.success('AI suggestions generated');
        } catch (error) {
            console.error(error);
            message.error('Failed to generate AI suggestions');
        } finally {
            setAiLoading((prev) => ({ ...prev, [logId]: false }));
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'meeting_date',
            key: 'meeting_date',
            render: (value) => value ? dayjs(value).format('MMM DD, YYYY') : 'N/A'
        },
        {
            title: 'Session Notes',
            dataIndex: 'session_notes',
            key: 'session_notes',
            render: (value) => value || '—'
        },
        {
            title: 'Discussion Points',
            dataIndex: 'discussion_points',
            key: 'discussion_points',
            render: (value) => value || '—'
        },
        {
            title: 'AI Suggestions',
            dataIndex: 'ai_suggestions',
            key: 'ai_suggestions',
            render: (value) => value ? <Tag color="blue">Available</Tag> : <Text type="secondary">None</Text>
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_value, record) => (
                <Space>
                    <Button size="small" onClick={() => handleGenerateAI(record)} loading={aiLoading[record.id || record.log_id || record.mentoring_log_id]}>AI</Button>
                    {isMentor && (
                        <>
                            <Button size="small" onClick={() => openEditModal(record)}>Edit</Button>
                            <Button size="small" danger onClick={() => handleDelete(record)}>Delete</Button>
                        </>
                    )}
                </Space>
            )
        }
    ];

    return (
        <MainLayout>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card style={{ borderRadius: 16 }}>
                        <Space direction="vertical" style={{ width: '100%' }} size={12}>
                            <Title level={3} style={{ margin: 0 }}>AI Mentoring</Title>
                            <Text type="secondary">Manage mentoring logs and generate AI suggestions.</Text>
                            <Space>
                                <Select
                                    value={selectedTeamId}
                                    onChange={setSelectedTeamId}
                                    style={{ minWidth: 220 }}
                                    placeholder="Select team"
                                >
                                    {teams.map((team) => (
                                        <Option key={team.team_id || team.id} value={team.team_id || team.id}>
                                            {team.name || team.team_name || `Team ${team.team_id || team.id}`}
                                        </Option>
                                    ))}
                                </Select>
                                {isMentor && (
                                    <Button type="primary" onClick={openCreateModal}>New Log</Button>
                                )}
                            </Space>
                        </Space>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card style={{ borderRadius: 16 }}>
                        <Table
                            rowKey="key"
                            columns={columns}
                            dataSource={logs}
                            loading={loading}
                            expandable={{
                                expandedRowRender: (record) => (
                                    <div>
                                        <Text strong>AI Suggestions</Text>
                                        <div style={{ marginTop: 8 }}>
                                            {record.ai_suggestions || record.suggestions || 'No suggestions yet.'}
                                        </div>
                                    </div>
                                ),
                                rowExpandable: (record) => !!(record.ai_suggestions || record.suggestions)
                            }}
                            pagination={{ pageSize: 6 }}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title={editingLog ? 'Edit Mentoring Log' : 'Create Mentoring Log'}
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmit}
                okText={editingLog ? 'Update' : 'Create'}
                destroyOnHidden
            >
                <Form layout="vertical" form={form}>
                    <Form.Item label="Team" name="team_id" rules={[{ required: true, message: 'Select a team' }]}
                    >
                        <Select placeholder="Select team">
                            {teams.map((team) => (
                                <Option key={team.team_id || team.id} value={team.team_id || team.id}>
                                    {team.name || team.team_name || `Team ${team.team_id || team.id}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="Meeting Date" name="meeting_date">
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item label="Session Notes" name="session_notes" rules={[{ required: true, message: 'Enter session notes' }]}>
                        <Input.TextArea rows={3} placeholder="What did you discuss?" />
                    </Form.Item>
                    <Form.Item label="Discussion Points" name="discussion_points">
                        <Input.TextArea rows={3} placeholder="Key points / action items" />
                    </Form.Item>
                </Form>
            </Modal>
        </MainLayout>
    );
};

export default MentoringPage;
