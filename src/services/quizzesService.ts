import { supabase } from "../lib/supabase";
import api from "./api";

export interface Quiz {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  slug: string;
  data: any; // JSONB com a estrutura do quiz
  status?: string | null;
  is_public?: boolean | null;
  allow_indexing?: boolean | null;
  created_at: string;
  updated_at: string;
}

export async function fetchQuizzesService(userId: string) {
  const { data, error } = await supabase
    .from("quizzes")
    .select(
      "id, title, description, slug, data, status, is_public, allow_indexing, created_at, updated_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return { data: null, error };
  return { data: data as Quiz[], error: null };
}

// Função removida - a API já salva na tabela quizzes

export async function getQuizLimitForUser(userId: string) {
  // Buscar plano do usuário
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan_id")
    .eq("id", userId)
    .single();
  if (!profile || !profile.plan_id)
    return {
      error: new Error("Plano não encontrado."),
      limit: null,
      price: null,
    };
  // Buscar limites do plano
  const { data: plan } = await supabase
    .from("plans")
    .select("max_quizzes, quiz_extra_price")
    .eq("id", profile.plan_id)
    .single();
  if (!plan)
    return {
      error: new Error("Limite do plano não encontrado."),
      limit: null,
      price: null,
    };
  return { limit: plan.max_quizzes, price: plan.quiz_extra_price, error: null };
}

export async function removeQuizService(
  userId: string,
  id: string,
  slug: string
) {
  // Primeiro remove no backend
  try {
    await api.delete("/api/clone/quiz", { data: { subdomain: slug } });
  } catch (error) {
    return { error };
  }
  // Só depois remove do supabase
  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error };
  return { error: null };
}
