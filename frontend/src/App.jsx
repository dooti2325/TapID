import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import StartAttendance from './pages/Attendance/StartAttendance';
import LiveAttendance from './pages/Attendance/LiveAttendance';
import Reports from './pages/Reports/Reports';
import Students from './pages/Students/Students';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ClassroomStatus from './pages/Classrooms/ClassroomStatus';
import Profile from './pages/Profile/Profile';
import Upload from './pages/Upload/Upload';
import AuditLogs from './pages/Admin/AuditLogs';
import RfidCards from './pages/Admin/RfidCards';
import Devices from './pages/Devices/Devices';
import Faculty from './pages/Faculty/Faculty';
import Subjects from './pages/Subjects/Subjects';
import Settings from './pages/Settings/Settings';

function ProtectedRoute({ children }) {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ role, children }) {
  const { user } = React.useContext(AuthContext);
  if (user?.role !== role) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const { user } = React.useContext(AuthContext);
  return <Navigate to={user?.role === 'admin' ? '/admin-dashboard' : '/dashboard'} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<HomeRedirect />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="attendance" element={<StartAttendance />} />
        <Route path="attendance/live" element={<LiveAttendance />} />
        <Route path="reports" element={<Reports />} />
        <Route path="students" element={<Students />} />
        <Route path="admin-dashboard" element={<RoleRoute role="admin"><AdminDashboard /></RoleRoute>} />
        <Route path="classrooms" element={<ClassroomStatus />} />
        <Route path="profile" element={<Profile />} />
        <Route path="upload" element={<Upload />} />
        <Route path="audit-logs" element={<RoleRoute role="admin"><AuditLogs /></RoleRoute>} />
        <Route path="rfid-cards" element={<RoleRoute role="admin"><RfidCards /></RoleRoute>} />
        
        {/* New Routes */}
        <Route path="devices" element={<RoleRoute role="admin"><Devices /></RoleRoute>} />
        <Route path="faculty" element={<RoleRoute role="admin"><Faculty /></RoleRoute>} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
