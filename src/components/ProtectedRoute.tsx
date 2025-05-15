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
      if (!profile.plan_id) {
        if (isMounted) setRedirectUrl('/escolher-plano');
        if (isMounted) setChecking(false);
        return;
      }
      // Bloquear se status for refused, refunded ou chargeback
      const blockedStatus = ['refused', 'refunded', 'chargeback'];
      if (blockedStatus.includes(profile.subscription_status ?? '')) {
        if (isMounted) setRedirectUrl('/escolher-plano');
        if (isMounted) setChecking(false);
        return;
      }
      // Verificar expiração do plano mensal
      if (profile.subscription_status === 'active' && profile.subscription_renewed_at) {
        const renewedAt = new Date(profile.subscription_renewed_at);
        const now = new Date();
        const diffDays = (now.getTime() - renewedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays >= 30) {
          // Atualizar status para expired
          if (profile.id) {
            await supabase.from('profiles').update({ subscription_status: 'expired' }).eq('id', profile.id);
          }
          if (isMounted) setRedirectUrl('/escolher-plano');
          if (isMounted) setChecking(false);
          return;
        }
      }
      if (profile.subscription_status !== 'active') {
        // Buscar checkout_url do plano
        if (profile.plan_id) {
          const { data: plan } = await supabase.from('plans').select('checkout_url').eq('id', profile.plan_id).single();
          if (isMounted) {
            if (plan?.checkout_url) {
              setRedirectUrl(plan.checkout_url);
            } else {
              setRedirectUrl('/escolher-plano');
            }
            setChecking(false);
          }
        } else {
          if (isMounted) {
            setRedirectUrl('/escolher-plano');
            setChecking(false);
          }
        }
        return;
      }
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