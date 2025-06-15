import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import Editor from './pages/tools/Editor';
import EditorStudio from './pages/tools/EditorStudio';
import { useAuth } from './context/AuthContext';
import OfferMetrics from './pages/OfferMetrics';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import EscolherPlano from './pages/EscolherPlano';
import StripMeta from './pages/tools/StripMeta';
import EditorQuiz from './pages/tools/EditorQuiz';
import ResetPassword from './pages/ResetPassword';
import { Admin } from './pages/Admin';

// Componente para proteger rotas de admin
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAuth();

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5541987268493?text=Preciso%20de%20suporte%20no%20Clonup"
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
      title="Quero saber mais sobre o Clonup"
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#25D366',
        color: '#fff',
        width: '55px',
        height: '55px',
        borderRadius: '50%',
        boxShadow: '0 4px 12px rgba(37,211,102,0.3)',
        textDecoration: 'none',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        border: '2px solid #fff',
      }}
      onMouseOver={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.05)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 16px rgba(37,211,102,0.4)';
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 12px rgba(37,211,102,0.3)';
      }}
      aria-label="Quero saber mais sobre o Clonup"
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="#fff" />
      </svg>
    </a>
  );
}

function App() {
  const { initialize } = useAuth();
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/escolher-plano" element={<EscolherPlano />} />
        <Route path="/reset-password" element={<ResetPassword />} />
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
        <Route path="/tools/removemetadados" element={<ProtectedRoute><StripMeta /></ProtectedRoute>} />
        <Route path="/tools/clonesites" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
        <Route path="/tools/editor-studio" element={<ProtectedRoute><EditorStudio /></ProtectedRoute>} />
        <Route path="/tools/clonequiz" element={<ProtectedRoute><EditorQuiz /></ProtectedRoute>} />
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>} />
        {/* Static Pages */}
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfUse />} />
      </Routes>
      <WhatsAppButton />
    </Router>
  );
}

export default App;