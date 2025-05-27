import { supabase } from "../lib/supabase";
import api from "./api";

export interface ClonedQuiz {
  id: string;
  user_id: string;
  original_url: string;
  checkout_url: string;
  subdomain?: string | null;
  url?: string | null;
  created_at: string;
}

export async function fetchQuizzesService(userId: string) {
  const { data, error } = await supabase
    .from("cloned_quiz")
    .select("id, original_url, checkout_url, subdomain, url, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return { data: null, error };
  return { data: data as ClonedQuiz[], error: null };
}

export async function addQuizService(
  userId: string,
  originalUrl: string,
  checkoutUrl: string,
  subdomain: string,
  url?: string | null
) {
  const { data, error } = await supabase
    .from("cloned_quiz")
    .insert({
      user_id: userId,
      original_url: originalUrl,
      checkout_url: checkoutUrl,
      subdomain,
      url,
    })
    .select("id, original_url, checkout_url, subdomain, url, created_at")
    .single();
  if (error) return { error, data: null };
  return { data, error: null };
}

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
  subdomain: string
) {
  // Primeiro remove no backend
  try {
    await api.delete("/api/clone/quiz", { data: { subdomain } });
  } catch (error) {
    return { error };
  }
  // Só depois remove do supabase
  const { error } = await supabase
    .from("cloned_quiz")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { error };
  return { error: null };
}
