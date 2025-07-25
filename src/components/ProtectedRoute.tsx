import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { checkTrialStatus } from '../utils/trialUtils';

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

      // Bloquear se status for refused, refunded ou chargeback
      const blockedStatus = ['refused', 'refunded', 'chargeback'];
      if (blockedStatus.includes(profile.subscription_status ?? '')) {
        if (isMounted) {
          setRedirectUrl('/escolher-plano?message=blocked');
          setChecking(false);
        }
        return;
      }

      // Se o pagamento estiver atrasado, redirecionar para tela especial
      if (profile.subscription_status === 'past_due') {
        if (isMounted) {
          setRedirectUrl('/escolher-plano?message=past_due');
          setChecking(false);
        }
        return;
      }

      // Verificar trial de 7 dias
      if (profile.subscription_status === 'trialing') {
        const trialStatus = checkTrialStatus({
          subscription_status: profile.subscription_status,
          trial_started_at: profile.trial_started_at,
          created_at: profile.created_at
        });

        // Se o trial expirou, atualizar status e redirecionar
        if (trialStatus.isTrialExpired) {
          // Atualizar status para expired
          if (profile.id) {
            await supabase.from('profiles')
              .update({ subscription_status: 'expired' })
              .eq('id', profile.id);
          }
          if (isMounted) {
            setRedirectUrl('/escolher-plano?message=trial_expired');
            setChecking(false);
          }
          return;
        }

        // Se o trial ainda está válido, usuário tem acesso
        if (isMounted) {
          setRedirectUrl(null);
          setChecking(false);
        }
        return;
      }

      // Se tiver plano ativo, verificar se expirou
      if (profile.subscription_status === 'active') {
        // Se não tiver data de renovação, está ok (primeira ativação)
        if (!profile.subscription_renewed_at) {
          if (isMounted) {
            setRedirectUrl(null);
            setChecking(false);
          }
          return;
        }

        const renewedAt = new Date(profile.subscription_renewed_at);
        const now = new Date();
        const diffDays = (now.getTime() - renewedAt.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays >= 30) {
          // Atualizar status para expired
          if (profile.id) {
            await supabase.from('profiles')
              .update({ subscription_status: 'expired' })
              .eq('id', profile.id);
          }
          if (isMounted) {
            setRedirectUrl('/escolher-plano?message=plan_expired');
            setChecking(false);
          }
          return;
        }
      }

      // Se não estiver em trial nem com plano ativo, redirecionar
      const validStatuses = ['active', 'trialing'];
      if (!validStatuses.includes(profile.subscription_status || '')) {
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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (redirectUrl) {
    return <Navigate to={redirectUrl} replace />;
  }

  return <>{children}</>;
} 