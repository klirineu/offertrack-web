import { Database } from "../types/supabase";
import { supabase } from "../lib/supabase";
import { withTimeout } from "../utils/supabaseHelpers";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type PublicTableName = keyof Database["public"]["Tables"] & string;
const PROFILES_TABLE = "profiles" as PublicTableName;

export async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    // Buscar o profile direto do Supabase (evita depender da API externa que pode bloquear usuário comum)
    // withTimeout para prevenir bloqueio indefinido após troca de abas.
    // Observação: em alguns setups o typing do Supabase pode falhar em inferir tabelas
    // (ex.: tipos gerados desatualizados). Fazemos um cast seguro para manter o runtime correto.
    const { data, error } = (await withTimeout(
      supabase.from(PROFILES_TABLE).select("*").eq("id", userId).single(),
      10000
    )) as unknown as {
      data: Profile | null;
      error: { message?: string; code?: string } | null;
    };

    if (error) {
      console.error("Erro ao buscar profile via Supabase:", error);
      return null;
    }

    return data ?? null;
  } catch (err) {
    console.error("Erro ao buscar profile:", err);
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
    const { data, error } = (await supabase
      .from(PROFILES_TABLE)
      .select("role")
      .eq("id", user.id)
      .single()) as unknown as {
      data: { role: string | null } | null;
      error: { message?: string; code?: string } | null;
    };

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
