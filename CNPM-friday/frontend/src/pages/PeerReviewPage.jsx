import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Table, Tabs, Typography, message } from 'antd';
import MainLayout from '../components/MainLayout';
import { useAuth } from '../components/AuthContext';
import { teamService } from '../services/api';
import {
    calculateAverageScore,
    checkReviewProgress,
    createPeerReview,
    getMyReviews,
    getTeamPeerReviews,
    getTeamReviewSummary
} from '../services/peerReviewService';

const { Title, Text } = Typography;
const { Option } = Select;

const PeerReviewPage = () => {
    const { user } = useAuth();
    const currentUserId = user?.user_id || user?.id;

    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [teamReviews, setTeamReviews] = useState([]);
    const [myReviews, setMyReviews] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const isLecturer = user?.role_id === 4 || user?.role_id === 1 || user?.role_id === 3;

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

    const fetchTeamDetail = async (teamId) => {
        if (!teamId) return;
        try {
            const res = await teamService.getDetail(teamId);
            const data = res?.data || {};
            const members = data.members || data.team_members || [];
            setTeamMembers(members);
        } catch (error) {
            console.error(error);
            message.error('Failed to load team members');
        }
    };

    const fetchReviews = async (teamId) => {
        if (!teamId) return;
        setLoading(true);
        try {
            const reviewsData = await getTeamPeerReviews(teamId);
            const reviewsList = Array.isArray(reviewsData) ? reviewsData : (reviewsData?.reviews || reviewsData?.data || []);
            setTeamReviews(reviewsList);
            const myReviewsData = await getMyReviews(teamId);
            const myList = Array.isArray(myReviewsData) ? myReviewsData : (myReviewsData?.reviews || myReviewsData?.data || []);
            setMyReviews(myList);
            if (isLecturer) {
                const summaryData = await getTeamReviewSummary(teamId);
                setSummary(summaryData);
            }
        } catch (error) {
            console.error(error);
            message.error('Failed to load peer reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    useEffect(() => {
        if (selectedTeamId) {
            fetchTeamDetail(selectedTeamId);
            fetchReviews(selectedTeamId);
        }
    }, [selectedTeamId]);

    const availableReviewees = useMemo(() => {
        const reviewedIds = new Set(myReviews.map((review) => review.reviewee_id));
        return teamMembers.filter((member) => member.user_id !== currentUserId && !reviewedIds.has(member.user_id));
    }, [teamMembers, myReviews, currentUserId]);

    const progress = useMemo(() => checkReviewProgress(myReviews, teamMembers, currentUserId), [myReviews, teamMembers, currentUserId]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                team_id: selectedTeamId,
                reviewee_id: values.reviewee_id,
                score: values.score,
                feedback: values.feedback,
                criteria: values.criteria
            };
            await createPeerReview(payload);
            message.success('Peer review submitted');
            form.resetFields();
            fetchReviews(selectedTeamId);
        } catch (error) {
            if (error?.errorFields) return;
            console.error(error);
            message.error('Failed to submit review');
        }
    };

    const teamReviewColumns = [
        { title: 'Reviewee', dataIndex: 'reviewee_name', key: 'reviewee_name', render: (_, record) => record.reviewee_name || record.reviewee?.full_name || record.reviewee_id },
        { title: 'Score', dataIndex: 'score', key: 'score' },
        { title: 'Feedback', dataIndex: 'feedback', key: 'feedback', render: (value) => value || '—' }
    ];

    const myReviewColumns = [
        { title: 'Score', dataIndex: 'score', key: 'score' },
        { title: 'Feedback', dataIndex: 'feedback', key: 'feedback', render: (value) => value || '—' },
        { title: 'Criteria', dataIndex: 'criteria', key: 'criteria', render: (value) => value || '—' }
    ];

    return (
        <MainLayout>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card style={{ borderRadius: 16 }}>
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                            <Title level={3} style={{ margin: 0 }}>Peer Reviews</Title>
                            <Text type="secondary">Review your teammates and view anonymous feedback.</Text>
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
                                <Text type="secondary">Progress: {progress.reviewed}/{progress.total}</Text>
                            </Space>
                        </Space>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card style={{ borderRadius: 16 }} loading={loading}>
                        <Tabs
                            items={[
                                {
                                    key: 'review',
                                    label: 'Review Teammates',
                                    children: (
                                        <Row gutter={[16, 16]}>
                                            <Col span={12}>
                                                <Form layout="vertical" form={form}>
                                                    <Form.Item label="Reviewee" name="reviewee_id" rules={[{ required: true, message: 'Select a teammate' }]}
                                                    >
                                                        <Select placeholder="Select member">
                                                            {availableReviewees.map((member) => (
                                                                <Option key={member.user_id} value={member.user_id}>
                                                                    {member.full_name}
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                    </Form.Item>
                                                    <Form.Item label="Score (0-10)" name="score" rules={[{ required: true, message: 'Enter score' }]}
                                                    >
                                                        <InputNumber min={0} max={10} style={{ width: '100%' }} />
                                                    </Form.Item>
                                                    <Form.Item label="Feedback" name="feedback">
                                                        <Input.TextArea rows={3} placeholder="Share feedback" />
                                                    </Form.Item>
                                                    <Form.Item label="Criteria" name="criteria">
                                                        <Input.TextArea rows={2} placeholder="Optional criteria" />
                                                    </Form.Item>
                                                    <Button type="primary" onClick={handleSubmit} disabled={!selectedTeamId}>
                                                        Submit Review
                                                    </Button>
                                                </Form>
                                            </Col>
                                            <Col span={12}>
                                                <Card type="inner" title="Team Reviews" style={{ height: '100%' }}>
                                                    <Table
                                                        size="small"
                                                        columns={teamReviewColumns}
                                                        dataSource={teamReviews.map((item, index) => ({ ...item, key: item.id || item.review_id || index }))}
                                                        pagination={false}
                                                    />
                                                </Card>
                                            </Col>
                                        </Row>
                                    )
                                },
                                {
                                    key: 'my',
                                    label: 'My Reviews',
                                    children: (
                                        <Table
                                            columns={myReviewColumns}
                                            dataSource={myReviews.map((item, index) => ({ ...item, key: item.id || item.review_id || index }))}
                                            pagination={{ pageSize: 5 }}
                                        />
                                    )
                                },
                                isLecturer ? {
                                    key: 'summary',
                                    label: 'Summary',
                                    children: (
                                        <Card type="inner" title="Team Summary">
                                            <Text>Average Score: {calculateAverageScore(teamReviews)}</Text>
                                            <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
                                                {summary ? JSON.stringify(summary, null, 2) : 'No summary data yet.'}
                                            </pre>
                                        </Card>
                                    )
                                } : null
                            ].filter(Boolean)}
                        />
                    </Card>
                </Col>
            </Row>
        </MainLayout>
    );
};

export default PeerReviewPage;
