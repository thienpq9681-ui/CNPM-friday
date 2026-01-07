import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layout, Typography, Button, Table, Avatar, Space, Badge,
  Input, Row, Col, Tabs, Tag, Tooltip, Menu
} from 'antd';
import {
  SettingOutlined, BellOutlined, SearchOutlined, UserOutlined,
  BookOutlined, TeamOutlined, EditOutlined, DeleteOutlined,
  PlusOutlined, LogoutOutlined, MenuOutlined, ArrowLeftOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [searchText, setSearchText] = useState('');

  // --- Dữ liệu mẫu ---
  const subjectsData = Array.from({ length: 25 }, (_, i) => ({
    key: `sub-${i}`,
    id: `SUB00${i}`,
    name: `Môn học chuyên ngành ${i + 1}`,
    credits: Math.floor(Math.random() * 4) + 1,
    department: 'Công nghệ thông tin'
  }));

  const classesData = Array.from({ length: 15 }, (_, i) => ({
    key: `class-${i}`,
    classId: `L00${i}`,
    className: `Lớp kỹ thuật phần mềm ${i + 1}`,
    studentCount: 40 + i,
    status: i % 2 === 0 ? 'Active' : 'Closed'
  }));

  const usersData = [
    { key: '1', name: 'Nguyễn Văn A', role: 'Staff', email: 'vana@school.edu.vn', status: 'Online' },
    { key: '2', name: 'Trần Thị B', role: 'Admin', email: 'admin_thib@school.edu.vn', status: 'Offline' },
    { key: '3', name: 'Lê Văn C', role: 'Staff', email: 'vanc@school.edu.vn', status: 'Online' },
  ];

  // --- Logic tìm kiếm ---
  const filterData = (data, field) => {
    return data.filter(item =>
      item[field].toLowerCase().includes(searchText.toLowerCase().trim())
    );
  };

  // --- Cấu hình cột bảng ---
  const subjectColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Credits', dataIndex: 'credits', key: 'credits', align: 'center' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: () => (
        <Space>
          <Tooltip title="Sửa"><Button size="small" icon={<EditOutlined />} /></Tooltip>
          <Tooltip title="Xóa"><Button size="small" danger icon={<DeleteOutlined />} /></Tooltip>
        </Space>
      )
    },
  ];

  const classColumns = [
    { title: 'Class ID', dataIndex: 'classId', key: 'classId' },
    { title: 'Class Name', dataIndex: 'className', key: 'className' },
    { title: 'Student Count', dataIndex: 'studentCount', key: 'studentCount', align: 'center' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
    },
    { title: 'Action', key: 'action', render: () => <Button type="link" icon={<EditOutlined />}>Edit</Button> },
  ];

  const userColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Space><Avatar size="small" icon={<UserOutlined />} />{text}</Space>
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (role) => <Tag color={role === 'Admin' ? 'purple' : 'blue'}>{role}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: (st) => <Badge status={st === 'Online' ? 'success' : 'default'} text={st} /> },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      {/* Header */}
      <Header style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e8e8e8',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: '64px'
      }}>
        <Space size="middle">
          <Avatar shape="square" style={{ backgroundColor: '#1890ff' }}>Logo</Avatar>
          <Text strong style={{ fontSize: '18px' }}>UTH ADMIN SYSTEM</Text>
        </Space>
        <Space size="large">
          <Badge count={5}><BellOutlined style={{ fontSize: 20 }} /></Badge>
          <Space style={{ cursor: 'pointer', marginLeft: 10 }}>
            <Avatar icon={<UserOutlined />} />
            <Text strong>Admin</Text>
          </Space>
        </Space>
      </Header>

      <Layout>
        {/* Sibar thu gọn */}
        <Sider
          width={240}
          theme="light"
          collapsible
          collapsed={collapsed}
          trigger={null}
          style={{ borderRight: '1px solid #f0f0f0' }}
        >
          <div style={{ padding: '16px', textAlign: collapsed ? 'center' : 'left' }}>
            <Button
              type="text"
              icon={collapsed ? <ArrowLeftOutlined style={{ transform: 'rotate(180deg)' }} /> : <MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px' }}
            />
          </div>

          <Space direction="vertical" style={{ width: '100%', padding: '0 8px' }} size={4}>
            {[
              { key: 'sub', icon: <BookOutlined />, label: 'Management' },
              { key: 'class', icon: <TeamOutlined />, label: 'Semester Management' },
              { key: 'user', icon: <UserOutlined />, label: 'User Import' },
              { key: 'set', icon: <SettingOutlined />, label: 'Setting' },
            ].map((item) => (
              <Tooltip key={item.key} title={collapsed ? item.label : ""} placement="right">
                <Button
                  type="text"
                  block
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    height: '45px',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    padding: collapsed ? '0' : '0 16px',
                    color: item.key === 'sub' ? '#1890ff' : 'rgba(0,0,0,0.65)',
                    background: item.key === 'sub' ? '#e6f7ff' : 'transparent'
                  }}
                >
                  {item.icon}
                  {!collapsed && <span style={{ marginLeft: 12, fontWeight: 500 }}>{item.label}</span>}
                </Button>
              </Tooltip>
            ))}
          </Space>

          <div style={{ position: 'absolute', bottom: 20, width: '100%', padding: '0 8px' }}>
            <Button
              type="text"
              danger
              block
              icon={<LogoutOutlined />}
              style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start' }}
            >
              {!collapsed && <span style={{ marginLeft: 12 }}>Logout</span>}
            </Button>
          </div>
        </Sider>

        {/* Nội dung chính */}
        <Content style={{ padding: '24px', overflowY: 'auto' }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={3} style={{ margin: 0 }}>Admin Dashboard</Title>
              <Text type="secondary">Manage and monitor training information throughout the system</Text>
            </Col>
            <Col>
              <Space>
                <Input
                  placeholder="Quick search..."
                  prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                  style={{ width: 280, borderRadius: 8, height: '40px' }}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  allowClear
                />
                <Button type="primary" icon={<PlusOutlined />} size="large" style={{ borderRadius: 8 }}>
                  Thêm mới
                </Button>
              </Space>
            </Col>
          </Row>

          <div style={{ background: '#fff', padding: '24px', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Tabs
              defaultActiveKey="1"
              onChange={() => setSearchText('')} // Xóa search khi đổi tab để tránh nhầm lẫn
              items={[
                {
                  key: '1',
                  label: <Space><BookOutlined />Subject</Space>,
                  children: <Table columns={subjectColumns} dataSource={filterData(subjectsData, 'name')} pagination={{ pageSize: 7, showSizeChanger: false }} />
                },
                {
                  key: '2',
                  label: <Space><TeamOutlined />Class</Space>,
                  children: <Table columns={classColumns} dataSource={filterData(classesData, 'className')} pagination={{ pageSize: 7 }} />
                },
                {
                  key: '3',
                  label: <Space><UserOutlined />User</Space>,
                  children: <Table columns={userColumns} dataSource={filterData(usersData, 'name')} pagination={{ pageSize: 7 }} />
                },
              ]}
            />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;