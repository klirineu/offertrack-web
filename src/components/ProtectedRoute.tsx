import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, profile, refreshProfile } = useAuth();
  const location = useLocation();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkPlan() {
      if (!profile) return;
      if (isMounted) setChecking(true);

      // Se não tiver as datas de trial definidas, redirecionar para escolher plano
      if (!profile.trial_started_at || !profile.trial_expires_at) {
        if (isMounted) {
          setRedirectUrl('/escolher-plano?message=choose');
          setChecking(false);
        }
        return;
      }

      // Bloquear se status for refused, refunded ou chargeback
      const blockedStatus = ['refused', 'refunded', 'chargeback'];
      if (blockedStatus.includes(profile.subscription_status ?? '')) {
        if (isMounted) {
          setRedirectUrl('/escolher-plano?message=blocked');
          setChecking(false);
        }
        return;
      }

      // Se estiver em trial, verificar se expirou
      if (profile.subscription_status === 'trialing' && profile.trial_started_at) {
        const trialStarted = new Date(profile.trial_started_at);
        const now = new Date();
        const diffDays = (now.getTime() - trialStarted.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays >= 7) {
          if (isMounted) {
            setRedirectUrl('/escolher-plano?message=trial_expired');
            setChecking(false);
          }
          return;
        }
      }

      // Se tiver plano ativo, verificar se expirou
      if (profile.subscription_status === 'active' && profile.subscription_renewed_at) {
        const renewedAt = new Date(profile.subscription_renewed_at);
        const now = new Date();
        const diffDays = (now.getTime() - renewedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays >= 30) {
          if (isMounted) {
            setRedirectUrl('/escolher-plano?message=plan_expired');
            setChecking(false);
          }
          return;
        }
      }

      // Se não estiver em trial nem com plano ativo, redirecionar
      if (profile.subscription_status !== 'active' && profile.subscription_status !== 'trialing') {
        if (isMounted) {
          setRedirectUrl('/escolher-plano?message=no_plan');
          setChecking(false);
        }
        return;
      }

      // Se chegou aqui, está tudo ok
      if (isMounted) {
        setRedirectUrl(null);
        setChecking(false);
      }
    }
    checkPlan();
    return () => { isMounted = false; };
  }, [profile]);

  // Recarrega o perfil ao reativar a aba
  useEffect(() => {
    async function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        await supabase.auth.getSession();
        refreshProfile?.();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshProfile]);

  if (isLoading || checking) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (redirectUrl) {
    return <Navigate to={redirectUrl} replace />;
  }

  return <>{children}</>;
} 