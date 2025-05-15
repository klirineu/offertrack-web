import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, profile } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Bloqueio de acesso se trial expirou ou assinatura inativa
  if (profile) {
    const status = profile.subscription_status;
    const trialExpires = profile.trial_expires_at ? new Date(profile.trial_expires_at) : null;
    const now = new Date();
    if ((status !== 'active' && status !== 'trialing') || (status === 'trialing' && trialExpires && now > trialExpires)) {
      return <Navigate to="/planos" state={{ from: location }} replace />;
    }
  }

  return <>{children}</>;
} 