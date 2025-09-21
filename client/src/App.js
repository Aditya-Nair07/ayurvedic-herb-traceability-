import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useNotificationStore } from './store/notificationStore';


// Components
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Batches from './pages/Batches/Batches';
import BatchDetail from './pages/Batches/BatchDetail';
import CreateBatch from './pages/Batches/CreateBatch';
import Events from './pages/Events/Events';
import EventDetail from './pages/Events/EventDetail';
import AddEvent from './pages/Events/AddEvent';
import BlockchainDashboard from './pages/Blockchain/BlockchainDashboard';
import QRScanner from './pages/QR/QRScanner';
import QRGenerator from './pages/QR/QRGenerator';
import Compliance from './pages/Compliance/Compliance';
import ComplianceReport from './pages/Compliance/ComplianceReport';
import Users from './pages/Users/Users';
import UserProfile from './pages/Users/UserProfile';
import Settings from './pages/Settings/Settings';
import NotFound from './pages/NotFound/NotFound';
import LoadingSpinner from './components/UI/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null, requiredPermission = null }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredPermission && !user?.permissions?.includes(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { initializeAuth } = useAuthStore();
  const { initializeNotifications } = useNotificationStore();

  useEffect(() => {
    // Initialize authentication
    initializeAuth();

    // Initialize notifications
    initializeNotifications();
  }, [initializeAuth, initializeNotifications]);



  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* Batches */}
          <Route path="batches" element={<Batches />} />
          <Route path="batches/create" element={
            <ProtectedRoute requiredPermission="create_batch">
              <CreateBatch />
            </ProtectedRoute>
          } />
          <Route path="batches/:batchId" element={<BatchDetail />} />
          
          {/* Events */}
          <Route path="events" element={<Events />} />
          <Route path="events/add" element={<AddEvent />} />
          <Route path="events/:eventId" element={<EventDetail />} />
          
          {/* Blockchain */}
          <Route path="blockchain" element={<BlockchainDashboard />} />
          
          {/* QR Code */}
          <Route path="qr/scanner" element={
            <ProtectedRoute requiredPermission="scan_qr">
              <QRScanner />
            </ProtectedRoute>
          } />
          <Route path="qr/generator" element={
            <ProtectedRoute requiredPermission="generate_qr">
              <QRGenerator />
            </ProtectedRoute>
          } />
          
          {/* Compliance */}
          <Route path="compliance" element={
            <ProtectedRoute requiredRole="regulator">
              <Compliance />
            </ProtectedRoute>
          } />
          <Route path="compliance/report/:batchId" element={
            <ProtectedRoute requiredRole="regulator">
              <ComplianceReport />
            </ProtectedRoute>
          } />
          
          {/* Users (Admin only) */}
          <Route path="users" element={
            <ProtectedRoute requiredRole="admin">
              <Users />
            </ProtectedRoute>
          } />
          <Route path="users/:userId" element={<UserProfile />} />
          
          {/* Profile Route */}
          <Route path="profile" element={<UserProfile />} />
          
          {/* Settings */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
