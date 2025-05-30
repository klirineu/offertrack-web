import { supabase } from "../lib/supabase";
import api from "../services/api";

export interface CloneSite {
  id: string;
  url: string;
  original_url?: string;
  subdomain: string;
}

export async function fetchClonesService(userId: string) {
  const { data, error } = await supabase
    .from("cloned_sites")
    .select("id, url, original_url, subdomain")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return { data: null, error };
  return { data: data as CloneSite[], error: null };
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
    .select("plan_id")
    .eq("id", userId)
    .single();
  if (!profile || !profile.plan_id)
    return { error: new Error("Plano não encontrado."), data: null };
  // Buscar limites do plano
  const { data: plan } = await supabase
    .from("plans")
    .select("max_clones")
    .eq("id", profile.plan_id)
    .single();
  if (!plan)
    return { error: new Error("Limite do plano não encontrado."), data: null };
  // Contar clones existentes
  const { count } = await supabase
    .from("cloned_sites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (typeof count === "number" && count >= plan.max_clones) {
    return {
      error: new Error(
        `Limite de páginas clonadas atingido para seu plano. (${plan.max_clones})`
      ),
      data: null,
    };
  }
  // Só chama o backend se não atingiu o limite
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

export async function removeCloneService(
  userId: string,
  id: string,
  urlId: string
) {
  const { error } = await supabase
    .from("cloned_sites")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error };
  // Chamada à API para remover arquivos/recursos do clone
  try {
    await api.delete("/api/clone", { data: { subdomain: urlId } });
  } catch {
    // Não bloqueia a exclusão do banco se a API falhar
  }
  return { error: null };
}

export async function checkCloneLimit(userId: string) {
  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_id")
    .eq("id", userId)
    .single();
  if (!profile || !profile.plan_id)
    return {
      allowed: false,
      max: null,
      count: null,
      error: new Error("Plano não encontrado."),
    };
  // Buscar limites do plano
  const { data: plan } = await supabase
    .from("plans")
    .select("max_clones")
    .eq("id", profile.plan_id)
    .single();
  if (!plan)
    return {
      allowed: false,
      max: null,
      count: null,
      error: new Error("Limite do plano não encontrado."),
    };
  // Contar clones existentes
  const { count } = await supabase
    .from("cloned_sites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (typeof count !== "number")
    return {
      allowed: false,
      max: plan.max_clones,
      count: null,
      error: new Error("Erro ao contar clones."),
    };
  if (count >= plan.max_clones) {
    return {
      allowed: false,
      max: plan.max_clones,
      count,
      error: new Error(
        `Limite de páginas clonadas atingido para seu plano. (${plan.max_clones})`
      ),
    };
  }
  return { allowed: true, max: plan.max_clones, count, error: null };
}
