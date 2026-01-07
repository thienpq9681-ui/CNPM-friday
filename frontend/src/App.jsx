import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProjectListView from './pages/ProjectListView';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Đường dẫn mặc định khi vào localhost:3000 */}
        <Route path="/" element={<ProjectListView />} />

        {/* Đường dẫn trang Profile */}
        <Route path="/profile" element={<UserProfile />} />

        {/* Đường dẫn trang Admin/Staff Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Chuyển hướng mọi đường dẫn sai về trang chủ */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;