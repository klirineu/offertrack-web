import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, profile } = useAuthStore();
  const location = useLocation();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    async function checkPlan() {
      if (!profile) return;
      setChecking(true);
      if (!profile.plan_id) {
        setRedirectUrl('/escolher-plano');
        setChecking(false);
        return;
      }
      // Bloquear se status for refused, refunded ou chargeback
      const blockedStatus = ['refused', 'refunded', 'chargeback'];
      if (blockedStatus.includes(profile.subscription_status)) {
        setRedirectUrl('/escolher-plano');
        setChecking(false);
        return;
      }
      if (profile.subscription_status !== 'active') {
        // Buscar checkout_url do plano
        const { data: plan } = await supabase.from('plans').select('checkout_url').eq('id', profile.plan_id).single();
        if (plan?.checkout_url) {
          setRedirectUrl(plan.checkout_url);
        } else {
          setRedirectUrl('/escolher-plano');
        }
        setChecking(false);
        return;
      }
      setRedirectUrl(null);
      setChecking(false);
    }
    checkPlan();
  }, [profile]);

  if (isLoading || checking) {
    return <div className="p-8">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (redirectUrl) {
    window.location.href = redirectUrl;
    return null;
  }

  return <>{children}</>;
} 