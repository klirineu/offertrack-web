import { Database } from "../types/supabase";
import api from "./api";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    const res = await api.get(`/api/profile/${userId}`);
    return res.data.profile ?? null;
  } catch (err) {
    console.error("Erro ao buscar profile via API:", err);
    return null;
  }
}
