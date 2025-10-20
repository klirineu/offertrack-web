import { supabase } from "../lib/supabase";

// Tags fixas disponíveis para seleção
export const FIXED_TAGS = [
  "saúde",
  "beleza",
  "fitness",
  "nutrição",
  "tecnologia",
  "finanças",
  "educação",
  "entretenimento",
  "moda",
  "casa e decoração",
  "automotivo",
  "viagem",
  "esportes",
  "bem-estar",
  "produtividade",
  "marketing",
  "vendas",
  "negócios",
  "investimentos",
  "imóveis",
  "pets",
  "jardinagem",
  "culinária",
  "artesanato",
  "livros",
  "música",
  "filmes",
  "jogos",
  "apps",
  "software",
];

export interface EscalatedOffer {
  id: string;
  original_offer_id: string;
  title: string;
  offer_url: string;
  landing_page_url?: string;
  description?: string;
  tags: string[];
  status: "active" | "inactive" | "archived";
  active_ads_count: number;
  margin_positive: boolean;
  first_analysis_date: string;
  last_analysis_date: string;
  total_analyses: number;
  positive_analyses: number;
  metrics: any[];
  created_at: string;
  updated_at: string;
}

export interface EscalatedOfferFilters {
  status?: string;
  margin?: string;
  minAds?: number;
  search?: string;
}

// Buscar todas as ofertas escaladas
export const fetchEscalatedOffersService = async (): Promise<{
  data: EscalatedOffer[] | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from("escalated_offers")
      .select("*")
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (error) {
    console.error("Erro ao buscar ofertas escaladas:", error);
    return { data: null, error };
  }
};

// Buscar ofertas escaladas com filtros
export const fetchEscalatedOffersWithFiltersService = async (
  filters: EscalatedOfferFilters
): Promise<{ data: EscalatedOffer[] | null; error: any }> => {
  try {
    let query = supabase.from("escalated_offers").select("*");

    // Aplicar filtros
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters.margin === "positive") {
      query = query.eq("margin_positive", true);
    } else if (filters.margin === "negative") {
      query = query.eq("margin_positive", false);
    }

    if (filters.minAds && filters.minAds > 0) {
      query = query.gte("active_ads_count", filters.minAds);
    }

    if (filters.search) {
      query = query.ilike("title", `%${filters.search}%`);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    return { data, error };
  } catch (error) {
    console.error("Erro ao buscar ofertas escaladas com filtros:", error);
    return { data: null, error };
  }
};

// Importar oferta escalada para ofertas do usuário
export const importEscalatedOfferService = async (
  escalatedOfferId: string,
  userId: string
): Promise<{ data: any; error: any }> => {
  try {
    // Primeiro, buscar a oferta escalada
    const { data: escalatedOffer, error: fetchError } = await supabase
      .from("escalated_offers")
      .select("*")
      .eq("id", escalatedOfferId)
      .single();

    if (fetchError || !escalatedOffer) {
      return {
        data: null,
        error: fetchError || "Oferta escalada não encontrada",
      };
    }

    // Criar nova oferta na tabela offers do usuário
    const { data, error } = await supabase
      .from("offers")
      .insert({
        user_id: userId,
        title: escalatedOffer.title,
        offer_url: escalatedOffer.offer_url,
        landing_page_url: escalatedOffer.landing_page_url,
        description: escalatedOffer.description,
        tags: escalatedOffer.tags,
        status: "waiting",
      })
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    // Atualizar contador de importações na oferta escalada
    await supabase
      .from("escalated_offers")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", escalatedOfferId);

    return { data, error: null };
  } catch (error) {
    console.error("Erro ao importar oferta escalada:", error);
    return { data: null, error };
  }
};

// Criar oferta escalada (apenas para administradores)
export const createEscalatedOfferService = async (
  offerData: Partial<EscalatedOffer>
): Promise<{ data: EscalatedOffer | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("escalated_offers")
      .insert({
        ...offerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Erro ao criar oferta escalada:", error);
    return { data: null, error };
  }
};

// Atualizar oferta escalada
export const updateEscalatedOfferService = async (
  id: string,
  updates: Partial<EscalatedOffer>
): Promise<{ data: EscalatedOffer | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("escalated_offers")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Erro ao atualizar oferta escalada:", error);
    return { data: null, error };
  }
};

// Editar oferta escalada (título e tags)
export const editEscalatedOfferService = async (
  id: string,
  title: string,
  tags: string[]
): Promise<{ data: EscalatedOffer | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("escalated_offers")
      .update({
        title,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Erro ao editar oferta escalada:", error);
    return { data: null, error };
  }
};

// Deletar oferta escalada
export const deleteEscalatedOfferService = async (
  id: string
): Promise<{ error: any }> => {
  try {
    const { error } = await supabase
      .from("escalated_offers")
      .delete()
      .eq("id", id);

    return { error };
  } catch (error) {
    console.error("Erro ao deletar oferta escalada:", error);
    return { error };
  }
};

// Buscar estatísticas das ofertas escaladas
export const getEscalatedOffersStatsService = async (): Promise<{
  data: {
    total: number;
    positiveMargin: number;
    totalAds: number;
    lastAnalysis: string | null;
  } | null;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from("escalated_offers")
      .select("active_ads_count, margin_positive, last_analysis_date");

    if (error) {
      return { data: null, error };
    }

    const stats = {
      total: data.length,
      positiveMargin: data.filter((o) => o.margin_positive).length,
      totalAds: data.reduce((sum, o) => sum + (o.active_ads_count || 0), 0),
      lastAnalysis:
        data.length > 0
          ? new Date(
              Math.max(
                ...data.map((o) => new Date(o.last_analysis_date).getTime())
              )
            ).toISOString()
          : null,
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error("Erro ao buscar estatísticas das ofertas escaladas:", error);
    return { data: null, error };
  }
};
