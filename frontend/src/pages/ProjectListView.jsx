import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'; // Cài đặt: npm install dayjs 
import { Layout, Typography, Button, Table, Avatar, Space, Badge, Calendar, Input, Select, Card, Tag, Row, Col, List } from 'antd';
import {
  SettingOutlined, BellOutlined, SearchOutlined, FilterOutlined,
  DashboardOutlined, TeamOutlined, DesktopOutlined, TableOutlined,
  FileTextOutlined, VideoCameraOutlined, SendOutlined, FormOutlined,
  LogoutOutlined, UserOutlined, AppstoreOutlined, ProjectOutlined,
  MenuOutlined, DownOutlined,
  LeftOutlined, RightOutlined
} from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';

const { Title, Text } = Typography;
const { Header, Sider, Content } = Layout;

const ProjectListView = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: '(Name)' });
  const [collapsed, setCollapsed] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('user_avatar'));
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentDate, setCurrentDate] = useState(dayjs()); // State cho Lịch thực tế
  const [searchText, setSearchText] = useState(''); // State lưu từ khóa tìm kiếm

  useEffect(() => {
    const savedData = localStorage.getItem('user_profile');
    if (savedData) setUserData(JSON.parse(savedData));
  }, []);
  // Logic xử lý Lịch
  const startDay = currentDate.startOf('month').day(); // Ngày đầu tiên của tháng là thứ mấy
  const daysInMonth = currentDate.daysInMonth(); // Tháng này có bao nhiêu ngày
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startDay }, (_, i) => i); // Khoảng trống đầu tháng

  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));
  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));

  // kiểm tra tính năng cuộn trang
  const initialData = [
    { key: '1', proposer: 'Dr. John', topic: 'Smart Inventory System', category: 'IoT', date: 'Nov 15 2025', status: 'Pending' },
    { key: '2', proposer: 'Dr. John', topic: 'Smart Inventory System', category: 'IoT', date: 'Nov 15 2025', status: 'Pending' },
    { key: '3', proposer: 'Dr. John', topic: 'Smart Inventory System', category: 'IoT', date: 'Nov 15 2025', status: 'Pending' },
    { key: '4', proposer: 'Dr. Smith', topic: 'AI Health Monitor', category: 'AI', date: 'Dec 01 2025', status: 'Pending' },
    { key: '5', proposer: 'Dr. Brown', topic: 'Blockchain Voting', category: 'Blockchain', date: 'Dec 05 2025', status: 'Pending' },
    { key: '6', proposer: 'Dr. John', topic: 'Smart Campus App', category: 'Mobile', date: 'Nov 20 2025', status: 'Pending' },
    { key: '7', proposer: 'Dr. Smith', topic: 'Library Management', category: 'Web', date: 'Nov 25 2025', status: 'Pending' },
    { key: '8', proposer: 'Dr. Brown', topic: 'Drone Delivery', category: 'IoT', date: 'Dec 10 2025', status: 'Pending' },
  ];

  const allData = [...initialData, ...initialData]; // 16 items

  const categories = [...new Set(initialData.map(item => item.category))];

  // Logic tìm kiếm & lọc kết hợp
  const sortedDataSource = allData
    .filter(item => {
      // 1. Chuẩn hóa dữ liệu tìm kiếm giống bên Admin (trim và toLowerCase)
      const searchKey = searchText.trim().toLowerCase();

      // 2. Nếu không có từ khóa, hiển thị tất cả (theo Category nếu có)
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true;

      // 3. Tìm kiếm trong Topic title
      const matchesSearch = item.topic.toLowerCase().includes(searchKey);

      return matchesCategory && matchesSearch;
    })
    // 4. Sắp xếp A-Z để giao diện chuyên nghiệp
    .sort((a, b) => a.topic.localeCompare(b.topic));

  const filterData = (data, field) => {
    return data.filter(item =>
      item[field].toLowerCase().includes(searchText.toLowerCase().trim())
    );
  };

  const handleMenuClick = (e) => {
    if (e.key === 'all') {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(e.key);
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="all">All Categories</Menu.Item>
      {categories.map(cat => (
        <Menu.Item key={cat}>{cat}</Menu.Item>
      ))}
    </Menu>
  );

  const dataSource = selectedCategory
    ? allData.filter(item => item.category === selectedCategory)
    : allData;

  const columns = [
    { title: 'Proposer', dataIndex: 'proposer', key: 'proposer', width: 120 },
    { title: 'Topic title', dataIndex: 'topic', key: 'topic' },
    { title: 'Category', dataIndex: 'category', key: 'category', width: 100 },
    { title: 'Date started', dataIndex: 'date', key: 'date', width: 120 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
    {
      title: 'Activity',
      key: 'activity',
      width: 100,
      render: () => <Button size="small" type="default" style={{ background: '#1890ff', color: '#fff', border: 'none' }}>Choose</Button>
    },
  ];

  const recentActivities = [
    'Smart Inventory System', 'AI Health Monitor', 'Smart Campus App', 'Drone Delivery'
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* Top Header */}
      <Header style={{
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        height: '64px',
        lineHeight: '64px',
      }}>
        <Space size="large">
          <Avatar size="small" style={{ backgroundColor: '#ccc' }}>logo</Avatar>
          <Text strong style={{ fontSize: '16px' }}>Name of web</Text>
        </Space>
        <Badge dot offset={[-5, 5]}>
          <BellOutlined style={{ fontSize: 20, color: '#000' }} />
        </Badge>
      </Header>

      <Layout>
        {/* Thanh Menu bên trái (Sidebar) */}
        <Sider
          width={260}
          theme="light"
          style={{ borderRight: '1px solid #f0f0f0' }}
          collapsible
          collapsed={collapsed}
          trigger={null}
        >
          <div style={{ padding: collapsed ? '24px 8px' : '24px 24px 0', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', height: '100%' }}>

            <div style={{ marginBottom: 24, paddingLeft: collapsed ? 12 : 0, transition: 'all 0.2s' }}>
              <Button
                type="text"
                icon={<MenuOutlined style={{ fontSize: '18px' }} />}
                onClick={() => setCollapsed(!collapsed)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32, justifyContent: collapsed ? 'center' : 'flex-start', flexDirection: collapsed ? 'column' : 'row' }}>
              <Avatar size={collapsed ? 40 : 64} src={avatarUrl} style={{ backgroundColor: '#d9d9d9', marginRight: collapsed ? 0 : 16, transition: 'all 0.2s' }} />
              {!collapsed && (
                <div>
                  <Title level={4} style={{ margin: 0, fontWeight: 'normal', whiteSpace: 'nowrap' }}>Hi <span style={{ color: '#1890ff' }}>{userData.name.split(' ').pop()}</span>!</Title>
                </div>
              )}
            </div>




            <div style={{ marginBottom: 24 }}>
              {!collapsed && <Text strong style={{ color: '#1890ff', fontSize: '12px', letterSpacing: '1px' }}>OVERVIEW</Text>}
              {collapsed && <div style={{ height: 20 }} />}

              <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size={8}>
                <Button type="text" block icon={<DashboardOutlined />} style={{ textAlign: collapsed ? 'center' : 'left', color: '#81bef6ff' }}>
                  {!collapsed && "Dashboard"}
                </Button>
                <Button type="text" block icon={<TeamOutlined />} style={{ textAlign: collapsed ? 'center' : 'left' }}>
                  {!collapsed && "Team Management"}
                </Button>
                <Button type="text" block icon={<DesktopOutlined />} style={{ textAlign: collapsed ? 'center' : 'left' }}>
                  {!collapsed && "Real-time Workspace"}
                </Button>
                <Button type="text" block icon={<TableOutlined />} style={{ textAlign: collapsed ? 'center' : 'left' }}>
                  {!collapsed && "Kanban Board Detail"}
                </Button>
                <Button type="text" block icon={<FormOutlined />} style={{ textAlign: collapsed ? 'center' : 'left' }}>
                  {!collapsed && "Whiteboard Canvas"}
                </Button>
                <Button type="text" block icon={<VideoCameraOutlined />} style={{ textAlign: collapsed ? 'center' : 'left' }}>
                  {!collapsed && "Video Meeting Room"}
                </Button>
                <Button type="text" block icon={<SendOutlined />} style={{ textAlign: collapsed ? 'center' : 'left' }}>
                  {!collapsed && "Submission Portal"}
                </Button>
                <Button type="text" block icon={<FileTextOutlined />} style={{ textAlign: collapsed ? 'center' : 'left' }}>
                  {!collapsed && "Peer Review Form"}
                </Button>
              </Space>
            </div>

            <div style={{ flex: 1 }} />

            <div>
              {!collapsed && <Text strong style={{ color: '#1890ff', fontSize: '12px', letterSpacing: '1px' }}>SETTINGS</Text>}
              {collapsed && <div style={{ height: 20 }} />}
              <Space direction="vertical" style={{ width: '100%', marginTop: 16 }} size={8}>
                <Button type="text" block icon={<SettingOutlined />} style={{ textAlign: collapsed ? 'center' : 'left' }} onClick={() => navigate('/profile')}>
                  {!collapsed && "Settings"}
                </Button>
                <Button type="text" block icon={<LogoutOutlined />} style={{ textAlign: collapsed ? 'center' : 'left' }}>
                  {!collapsed && "Logout"}
                </Button>
              </Space>
            </div>

            <div style={{ flex: 1 }} />
          </div>
        </Sider>

        {/* nội dung chính */}
        <Content style={{ padding: '24px 32px', background: '#fff' }}>
          <div style={{ marginBottom: 120 }}>
            <Title level={2} style={{ margin: '0 0 8px 0', fontWeight: 'normal' }}>Project List View</Title>
            <Text style={{ fontSize: '16px' }}>List of topics for students to choose</Text>
          </div>

          {/* Tìm kiếm và Lọc */}
          <Row justify="end" gutter={16} style={{ marginBottom: 16 }}>
            <Col>
              <Input
                placeholder="Quick search topic title..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} // Màu icon nhạt giống Admin
                style={{
                  width: 300,
                  borderRadius: 8, // Bo góc giống Admin
                  height: '40px',   // Độ cao đồng bộ
                  background: '#f0f2f5',
                  border: 'none'
                }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)} // Cập nhật state ngay lập tức
                allowClear
              />
            </Col>
            <Col>
              <Button style={{ background: '#d9d9d9', border: 'none', borderRadius: 6 }}>Sort by category</Button>
            </Col>
          </Row>

          {/* Bảng dữ liệu với tính năng cuộn trang */}
          <Table
            dataSource={sortedDataSource}
            columns={columns}
            pagination={false}
            scroll={{ y: 450 }}
            rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-light'}
            style={{
              border: 'none',
            }}
            onRow={() => ({
              style: { background: '#d9d9d9', marginBottom: '4px' }
            })}
          />
          <style>{`
                .ant-table-thead > tr > th {
                    background: #4a90e2 !important; /* Xanh dương đậm hơn */
                    color: white !important;        /* Chữ trắng mới nổi trên nền xanh */
                    font-weight: 600;
                    border-right: 2px solid white !important;
                }
                .ant-table-tbody > tr > td {
                    background: #e6e6e6;
                    border-bottom: 2px solid white !important; /* Visual gap */
                    border-right: 2px solid white !important; /* Vertical Separator */
                }
                .ant-table-container {
                    background: transparent;
                }
            `}</style>
        </Content>

        {/* Thanh Menu bên phải (Sidebar) */}
        <Sider width={300} theme="light" style={{ padding: '24px', borderLeft: '1px solid #f0f0f0' }}>
          <div style={{ background: '#fff', borderRadius: 12, marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text strong style={{ fontSize: '16px' }}>{currentDate.format('MMMM YYYY')}</Text>
              <Space>
                <Button size="small" icon={<LeftOutlined />} onClick={prevMonth} />
                <Button size="small" icon={<RightOutlined />} onClick={nextMonth} />
              </Space>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <Text key={day} type="secondary" style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: 8 }}>{day}</Text>
              ))}

              {/* Ô trống của tháng trước */}
              {emptyDays.map(i => <div key={`empty-${i}`} />)}

              {/* Các ngày trong tháng */}
              {daysArray.map(day => {
                const isToday = day === dayjs().date() && currentDate.isSame(dayjs(), 'month');
                return (
                  <div key={day} style={{
                    padding: '8px 0',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    background: isToday ? '#1890ff' : 'transparent',
                    color: isToday ? '#fff' : 'inherit',
                    fontWeight: isToday ? 'bold' : 'normal',
                    transition: '0.3s'
                  }}>
                    {day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activities */}
          <Title level={5}>Recent activities</Title>
          <div style={{ background: '#d9d9d9', borderRadius: 12, padding: '16px', minHeight: 150 }}>
            <List
              dataSource={recentActivities}
              renderItem={item => (
                <List.Item style={{ padding: '4px 0', border: 'none' }}>
                  <Typography.Text>{item}</Typography.Text>
                </List.Item>
              )}
            />
          </div>
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <Text style={{ fontSize: 12, cursor: 'pointer' }}>see more</Text>
          </div>
        </Sider>
      </Layout>
    </Layout>
  );
};

export default ProjectListView;