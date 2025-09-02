import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import SchoolAdminLayout from './components/layout/SchoolAdminLayout';
import SuperAdminLayout from './components/layout/SuperAdminLayout';
import DashboardPage from './pages/DashboardPage';

const navStyle = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  zIndex: 1000,
  background: 'rgba(0,0,0,0.7)',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  display: 'flex',
  gap: '1rem'
};

function App() {
  return (
    <Router>
      <div style={navStyle}>
        <Link to="/school-admin/dashboard" style={{color: 'white'}}>School Admin</Link>
        <Link to="/super-admin/dashboard" style={{color: 'white'}}>Super Admin</Link>
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/school-admin/dashboard" />} />

        {/* School Admin Routes */}
        <Route path="/school-admin" element={<SchoolAdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<DashboardPage />} />
          <Route path="students/add" element={<DashboardPage />} />
          <Route path="students/profiles" element={<DashboardPage />} />
          <Route path="teachers" element={<DashboardPage />} />
          <Route path="teachers/add" element={<DashboardPage />} />
          <Route path="classes" element={<DashboardPage />} />
          <Route path="classes/add" element={<DashboardPage />} />
          <Route path="subjects" element={<DashboardPage />} />
          <Route path="fees/collect" element={<DashboardPage />} />
          <Route path="fees/history" element={<DashboardPage />} />
          <Route path="exams" element={<DashboardPage />} />
          <Route path="exams/marks" element={<DashboardPage />} />
          <Route path="routines" element={<DashboardPage />} />
          <Route path="settings" element={<DashboardPage />} />
        </Route>

        {/* Super Admin Routes */}
        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="schools/add" element={<DashboardPage />} />
          <Route path="schools/manage" element={<DashboardPage />} />
          <Route path="subscriptions" element={<DashboardPage />} />
          <Route path="users" element={<DashboardPage />} />
          <Route path="analytics" element={<DashboardPage />} />
          <Route path="billing" element={<DashboardPage />} />
          <Route path="ai-supervision" element={<DashboardPage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
