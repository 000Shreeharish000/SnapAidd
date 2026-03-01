import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AuthCallback from './pages/AuthCallback';
import CitizenDashboard from './pages/CitizenDashboard';
import SOSPage from './pages/SOSPage';
import ReviewPage from './pages/ReviewPage';
import SuccessPage from './pages/SuccessPage';
import ProfilePage from './pages/ProfilePage';
import PoliceDashboard from './pages/PoliceDashboard';
import EmergencyNumbersPage from './pages/EmergencyNumbersPage';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';

// Router wrapper to handle OAuth callback detection
const AppRouter = () => {
  const location = useLocation();
  
  // Check URL fragment for session_id - detect BEFORE render
  // This prevents race conditions with ProtectedRoute
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/emergency-numbers" element={<EmergencyNumbersPage />} />
      
      {/* Citizen Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/sos" 
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <SOSPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/review" 
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <ReviewPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/success" 
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <SuccessPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      
      {/* Police Routes */}
      <Route 
        path="/police" 
        element={
          <ProtectedRoute allowedRoles={['police']}>
            <PoliceDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-center" />
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
