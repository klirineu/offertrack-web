import { differenceInDays } from "date-fns";

interface Profile {
  subscription_status: string | null;
  trial_started_at: string | null;
  created_at: string;
}

export interface TrialStatus {
  isInTrial: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  trialStartDate: Date;
  trialEndDate: Date;
  hasStarterAccess: boolean;
}

/**
 * Verifica o status do trial de 1 dia do usuário
 * Se o usuário estiver como 'trialing', verifica se já passou de 1 dia
 * Usa trial_started_at se disponível, senão usa created_at
 */
export function checkTrialStatus(profile: Profile): TrialStatus {
  const now = new Date();

  // Se não estiver em trial, retorna valores padrão
  if (profile.subscription_status !== "trialing") {
    return {
      isInTrial: false,
      isTrialExpired: false,
      daysRemaining: 0,
      trialStartDate: new Date(profile.created_at),
      trialEndDate: new Date(profile.created_at),
      hasStarterAccess: false,
    };
  }

  // Determina a data de início do trial
  const trialStartDate = profile.trial_started_at
    ? new Date(profile.trial_started_at)
    : new Date(profile.created_at);

  // Calcula a data de fim do trial (1 dia após o início)
  const trialEndDate = new Date(trialStartDate);
  trialEndDate.setDate(trialEndDate.getDate() + 1);

  // Calcula quantos dias se passaram desde o início
  const daysSinceStart = differenceInDays(now, trialStartDate);

  // Calcula quantos dias restam
  const daysRemaining = Math.max(0, 1 - daysSinceStart);

  // Verifica se o trial expirou
  const isTrialExpired = daysSinceStart >= 1;

  return {
    isInTrial: true,
    isTrialExpired,
    daysRemaining,
    trialStartDate,
    trialEndDate,
    hasStarterAccess: !isTrialExpired, // Tem acesso ao plano starter enquanto não expirou
  };
}

/**
 * Verifica se o usuário tem acesso às funcionalidades
 * Durante o trial (1 dia), tem acesso completo ao que o plano starter oferece
 */
export function hasFeatureAccess(profile: Profile): boolean {
  const trialStatus = checkTrialStatus(profile);

  // Se está em trial e não expirou, tem acesso às funcionalidades do starter
  if (trialStatus.isInTrial && !trialStatus.isTrialExpired) {
    return true;
  }

  // Se tem plano ativo, tem acesso
  if (profile.subscription_status === "active") {
    return true;
  }

  // Caso contrário, não tem acesso
  return false;
}
