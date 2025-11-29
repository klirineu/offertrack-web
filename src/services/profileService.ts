import { Database } from "../types/supabase";
import api from "./api";
import { supabase } from "../lib/supabase";
import { withTimeout } from "../utils/supabaseHelpers";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    // Obter o token JWT do Supabase Auth com timeout para prevenir bloqueio
    const {
      data: { session },
    } = await withTimeout(
      supabase.auth.getSession(),
      10000 // 10 segundos de timeout
    );

    if (!session?.access_token) {
      console.error("Usuário não autenticado");
      return null;
    }

    // Fazer a requisição com autenticação JWT
    const res = await api.get(`/api/profile/${userId}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    });

    return res.data.profile ?? null;
  } catch (err) {
    console.error("Erro ao buscar profile via API:", err);
    return null;
  }
}

/**
 * Verifica se o usuário é realmente admin no banco de dados Supabase
 * Esta verificação consulta diretamente o Supabase para garantir segurança
 * mesmo se alguém tentar alterar o retorno da API no frontend
 *
 * IMPORTANTE: Esta verificação depende do RLS (Row Level Security) do Supabase.
 * Configure RLS na tabela profiles para que apenas admins possam ver dados de admin.
 */
export async function verifyAdmin(): Promise<boolean> {
  try {
    // Obter o usuário atual do Supabase Auth com timeout para prevenir bloqueio
    const {
      data: { user },
    } = await withTimeout(
      supabase.auth.getUser(),
      10000 // 10 segundos de timeout
    );

    if (!user?.id) {
      return false;
    }

    // Consultar diretamente no Supabase se o usuário é admin
    // Se RLS estiver configurado, usuários não-admin não conseguirão ver dados de outros usuários
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      // Se der erro de permissão (RLS bloqueou), definitivamente não é admin
      if (
        error.code === "PGRST301" ||
        error.message?.includes("permission") ||
        error.message?.includes("policy")
      ) {
        return false;
      }
      // Outros erros também retornam false por segurança
      return false;
    }

    // Retorna true apenas se o role for 'admin' no banco de dados
    // Esta verificação é feita diretamente no Supabase, não no frontend
    return data?.role === "admin";
  } catch {
    // Em caso de qualquer erro, retorna false por segurança
    return false;
  }
}
