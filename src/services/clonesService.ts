import { supabase } from "../lib/supabase";
import { hasFeatureAccess } from "../utils/trialUtils";

export interface CloneSite {
  id: string;
  user_id: string;
  original_url: string;
  url: string;
  subdomain: string;
  created_at: string;
  updated_at: string;
}

export async function fetchClonesService(userId: string) {
  const { data, error } = await supabase
    .from("cloned_sites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function addCloneService(
  userId: string,
  originalUrl: string,
  clonedUrl: string,
  subdomain: string
) {
  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    return { error: new Error("Perfil não encontrado."), data: null };
  }

  // Verificar se o usuário tem acesso (trial ou plano ativo)
  if (!hasFeatureAccess(profile)) {
    return {
      error: new Error(
        "Acesso negado. Você precisa de um plano ativo ou estar no período de teste."
      ),
      data: null,
    };
  }

  // Buscar o plano do usuário ou usar o plano starter como padrão durante o trial
  let planId = profile.plan_id;
  let maxClones = 0;

  if (profile.subscription_status === "trialing") {
    // Durante o trial, usar limites do plano starter
    const { data: starterPlan } = await supabase
      .from("plans")
      .select("id, max_clones")
      .eq("name", "starter")
      .single();

    if (starterPlan) {
      planId = starterPlan.id;
      maxClones = starterPlan.max_clones;
    } else {
      // Fallback: permitir 3 clones durante o trial se não encontrar o plano starter
      maxClones = 3;
    }
  } else if (planId) {
    // Usuário com plano ativo
    const { data: plan } = await supabase
      .from("plans")
      .select("max_clones")
      .eq("id", planId)
      .single();

    if (!plan) {
      return {
        error: new Error("Limite do plano não encontrado."),
        data: null,
      };
    }
    maxClones = plan.max_clones;
  } else {
    return { error: new Error("Plano não encontrado."), data: null };
  }

  // Contar clones existentes
  const { count } = await supabase
    .from("cloned_sites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (typeof count === "number" && count >= maxClones) {
    return {
      error: new Error(
        `Limite de páginas clonadas atingido para seu plano. (${maxClones})`
      ),
      data: null,
    };
  }

  // Criar o clone
  const { data, error } = await supabase
    .from("cloned_sites")
    .insert({
      user_id: userId,
      original_url: originalUrl,
      url: clonedUrl,
      subdomain,
    })
    .select("id, url, original_url, subdomain")
    .single();

  if (error) return { error, data: null };
  return { data, error: null };
}

export async function removeCloneService(userId: string, cloneId: string) {
  const { error } = await supabase
    .from("cloned_sites")
    .delete()
    .eq("id", cloneId)
    .eq("user_id", userId);
  return { error };
}

export async function checkCloneLimit(userId: string) {
  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    return {
      allowed: false,
      max: null,
      count: null,
      error: new Error("Perfil não encontrado."),
    };
  }

  // Verificar se o usuário tem acesso
  if (!hasFeatureAccess(profile)) {
    return {
      allowed: false,
      max: null,
      count: null,
      error: new Error(
        "Acesso negado. Você precisa de um plano ativo ou estar no período de teste."
      ),
    };
  }

  let maxClones = 0;

  if (profile.subscription_status === "trialing") {
    // Durante o trial, usar limites do plano starter
    const { data: starterPlan } = await supabase
      .from("plans")
      .select("max_clones")
      .eq("name", "starter")
      .single();

    if (starterPlan) {
      maxClones = starterPlan.max_clones;
    } else {
      // Fallback: permitir 3 clones durante o trial
      maxClones = 3;
    }
  } else if (profile.plan_id) {
    // Usuário com plano ativo
    const { data: plan } = await supabase
      .from("plans")
      .select("max_clones")
      .eq("id", profile.plan_id)
      .single();

    if (!plan) {
      return {
        allowed: false,
        max: null,
        count: null,
        error: new Error("Limite do plano não encontrado."),
      };
    }
    maxClones = plan.max_clones;
  } else {
    return {
      allowed: false,
      max: null,
      count: null,
      error: new Error("Plano não encontrado."),
    };
  }

  // Contar clones existentes
  const { count } = await supabase
    .from("cloned_sites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (typeof count !== "number") {
    return {
      allowed: false,
      max: maxClones,
      count: null,
      error: new Error("Erro ao contar clones."),
    };
  }

  if (count >= maxClones) {
    return {
      allowed: false,
      max: maxClones,
      count,
      error: new Error(
        `Limite de páginas clonadas atingido para seu plano. (${maxClones})`
      ),
    };
  }

  return { allowed: true, max: maxClones, count, error: null };
}
