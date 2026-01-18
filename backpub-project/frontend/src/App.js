// App.js - Optimisé avec lazy loading
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Lazy loading pour améliorer les performances
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterClientPage = lazy(() => import('./pages/RegisterClientPage'));
const RegisterPartnerPage = lazy(() => import('./pages/RegisterPartnerPage'));
const ClientDashboard = lazy(() => import('./pages/ClientDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CreateCampaign = lazy(() => import('./pages/CreateCampaign'));
const CampaignLanding = lazy(() => import('./pages/CampaignLanding'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Composant de chargement optimisé
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8f5f2 0%, #fff 100%)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #A67C52',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      <p style={{ color: '#666', fontSize: '16px' }}>Chargement...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          {/* ============================================ */}
          {/* ROUTES PUBLIQUES */}
          {/* ============================================ */}
          
          {/* Page d'accueil publique */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/client" element={<RegisterClientPage />} />
          <Route path="/register/partner" element={<RegisterPartnerPage />} />
          
          {/* NOUVELLES ROUTES - MOT DE PASSE OUBLIÉ */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* ============================================ */}
          {/* LANDING PAGES PUBLIQUES (URLS PROPRES) */}
          {/* ============================================ */}
          
          {/* URL PROPRE : /nom-de-entreprise */}
          <Route path="/:companySlug" element={<CampaignLanding />} />
          
          {/* Compatibilité anciens liens : /campaign/token */}
          <Route path="/campaign/:secure_token" element={<CampaignLanding />} />
          
          {/* ============================================ */}
          {/* ROUTES PROTÉGÉES - CLIENT */}
          {/* ============================================ */}
          <Route path="/client/dashboard" element={
            <PrivateRoute allowedRoles={['client']}>
              <ClientDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/client/campaign/new" element={
            <PrivateRoute allowedRoles={['client']}>
              <CreateCampaign />
            </PrivateRoute>
          } />
          
          {/* ============================================ */}
          {/* ROUTES PROTÉGÉES - ADMIN */}
          {/* ============================================ */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          {/* ============================================ */}
          {/* ROUTES D'ERREUR */}
          {/* ============================================ */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;