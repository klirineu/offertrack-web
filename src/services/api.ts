import axios from "axios";
import { supabase } from "../lib/supabase";

// https://fastspeed.site
// http://192.168.100.6:3001
const api = axios.create({
  baseURL: "https://fastspeed.site",
});

// Função específica para clonar quiz com autenticação JWT
export const cloneQuizWithAuth = async (
  url: string,
  subdomain: string,
  endpoint: string = "/api/clone/quiz"
) => {
  // Obter o token JWT do Supabase Auth
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Usuário não autenticado");
  }

  // Fazer a requisição com autenticação JWT
  const response = await api.post(
    endpoint,
    {
      url,
      subdomain,
    },
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

export default api;
