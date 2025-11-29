import { Database } from "../types/supabase";
import api from "./api";
import { supabase } from "../lib/supabase";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    // Obter o token JWT do Supabase Auth
    const {
      data: { session },
    } = await supabase.auth.getSession();

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
