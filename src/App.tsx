import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Campaigns } from './pages/traffic-filter/Campaigns';
import { Requests } from './pages/traffic-filter/Requests';
import { Domains } from './pages/traffic-filter/Domains';
import { Reports } from './pages/traffic-filter/Reports';
import { CreateCampaign } from './pages/traffic-filter/CreateCampaign';
import { EncryptText } from './pages/tools/EncryptText';
import { Anticlone } from './pages/tools/Anticlone';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/traffic-filter/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/traffic-filter/campaigns/new" element={<ProtectedRoute><CreateCampaign /></ProtectedRoute>} />
          <Route path="/traffic-filter/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
          <Route path="/traffic-filter/domains" element={<ProtectedRoute><Domains /></ProtectedRoute>} />
          <Route path="/traffic-filter/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/tools/encrypt" element={<ProtectedRoute><EncryptText /></ProtectedRoute>} />
          <Route path="/tools/anticlone" element={<ProtectedRoute><Anticlone /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;