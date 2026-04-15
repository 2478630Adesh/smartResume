import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/App.css';

// Layout
import Navbar from './components/Layout/Navbar';
import DashboardLayout from './components/Layout/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import UserDashboard from './components/Dashboard/UserDashboard';
import JobList from './components/Jobs/JobList';
import JobDetail from './components/Jobs/JobDetail';
import MyApplications from './components/Jobs/MyApplications';
import ResumeBuilder from './components/Resume/ResumeBuilder';
import ResumeUpload from './components/Resume/ResumeUpload';
import JDAnalyzer from './components/Resume/JDAnalyzer';
import HRDashboard from './components/HR/HRDashboard';
import PostJob from './components/HR/PostJob';

// Protected Route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

// Dashboard wrapper
const WithDashboard = ({ children }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={user ? <Navigate to={user.role === 'hr' ? '/hr/dashboard' : '/dashboard'} /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'hr' ? '/hr/dashboard' : '/dashboard'} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'hr' ? '/hr/dashboard' : '/dashboard'} /> : <Register />} />

      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute roles={['user']}><WithDashboard><UserDashboard /></WithDashboard></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute roles={['user']}><WithDashboard><JobList /></WithDashboard></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<ProtectedRoute roles={['user']}><WithDashboard><JobDetail /></WithDashboard></ProtectedRoute>} />
      <Route path="/my-applications" element={<ProtectedRoute roles={['user']}><WithDashboard><MyApplications /></WithDashboard></ProtectedRoute>} />
      <Route path="/resume-builder" element={<ProtectedRoute roles={['user']}><WithDashboard><ResumeBuilder /></WithDashboard></ProtectedRoute>} />
      <Route path="/resume-upload" element={<ProtectedRoute roles={['user']}><WithDashboard><ResumeUpload /></WithDashboard></ProtectedRoute>} />
      <Route path="/analyzer" element={<ProtectedRoute roles={['user']}><WithDashboard><JDAnalyzer /></WithDashboard></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><WithDashboard><Profile /></WithDashboard></ProtectedRoute>} />

      {/* HR Routes */}
      <Route path="/hr/dashboard" element={<ProtectedRoute roles={['hr']}><WithDashboard><HRDashboard /></WithDashboard></ProtectedRoute>} />
      <Route path="/hr/post-job" element={<ProtectedRoute roles={['hr']}><WithDashboard><PostJob /></WithDashboard></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app-container">
          <Navbar />
          <AppRoutes />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1f35',
              color: '#f1f5f9',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              fontSize: '14px',
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
