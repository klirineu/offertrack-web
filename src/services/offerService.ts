import { supabase } from "../lib/supabase";
import { Offer, AdMetrics } from "../types";
import { Database } from "../types/supabase";

// Função para corrigir URLs do Facebook Ads Library
export function fixFacebookAdsLibraryUrl(url: string): string {
  // URL correta do Facebook Ads Library
  const correctBaseUrl =
    "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR";

  // Se a URL já está no formato correto, retorna como está
  if (
    url.includes("facebook.com/ads/library") &&
    url.includes("active_status=active")
  ) {
    return url;
  }

  // Extrair o ID da oferta da URL (pode estar em diferentes formatos)
  let adId = "";

  // Tentar extrair ID de diferentes formatos de URL
  const idPatterns = [
    /[?&]id=(\d+)/, // ?id=123456 ou &id=123456
    /\/ads\/library\/\?.*id=(\d+)/, // /ads/library/?id=123456
    /\/ads\/library\/.*[?&]id=(\d+)/, // /ads/library/?...&id=123456
    /id=(\d+)/, // id=123456
    /(\d{15,})/, // Número com 15+ dígitos
  ];

  for (const pattern of idPatterns) {
    const match = url.match(pattern);
    if (match) {
      adId = match[1];
      break;
    }
  }

  // Se encontrou um ID, monta a URL correta
  if (adId) {
    return `${correctBaseUrl}&id=${adId}&is_targeted_country=false&media_type=all&search_type=page&view_all_page_id=109161531897405`;
  }

  // Se não encontrou ID, retorna a URL original
  return url;
}

type SupabaseOffer = Database["public"]["Tables"]["offers"]["Row"];

const mapSupabaseOffer = (offer: SupabaseOffer): Offer => ({
  id: offer.id,
  title: offer.title,
  offerUrl: offer.offer_url,
  landingPageUrl: offer.landing_page_url,
  description: offer.description || undefined,
  tags: offer.tags,
  status: offer.status,
  createdAt: new Date(offer.created_at),
  updatedAt: new Date(offer.updated_at),
  metrics: (offer.metrics as unknown as AdMetrics[]) || [],
});

const mapToSupabaseOffer = (offer: Partial<Offer>) => ({
  title: offer.title,
  offer_url: offer.offerUrl,
  landing_page_url: offer.landingPageUrl,
  description: offer.description,
  tags: offer.tags,
  status: offer.status,
  metrics: offer.metrics,
});

export async function fetchOffersService(user_id: string) {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  if (error) return { data: null, error };
  return { data: data ? data.map(mapSupabaseOffer) : [], error: null };
}

export async function addOfferService(
  newOffer: Partial<Offer>,
  user_id: string
) {
  if (!user_id)
    return { data: null, error: new Error("Usuário não autenticado") };

  // Corrigir URL da oferta se for do Facebook Ads Library
  const correctedOffer = {
    ...newOffer,
    offerUrl: newOffer.offerUrl
      ? fixFacebookAdsLibraryUrl(newOffer.offerUrl)
      : newOffer.offerUrl,
  };

  const insertObj = { ...mapToSupabaseOffer(correctedOffer), user_id };
  const { data, error } = await supabase
    .from("offers")
    .insert(insertObj)
    .select("*")
    .single();
  if (error) return { data: null, error };
  return { data: mapSupabaseOffer(data), error: null };
}

export async function updateOfferService(
  offerId: string,
  updates: Partial<Offer>
) {
  const allowedStatus = ["waiting", "testing", "approved", "invalid"];
  if (updates.status && !allowedStatus.includes(updates.status)) {
    throw new Error("Status inválido");
  }

  // Corrigir URL da oferta se for do Facebook Ads Library
  const correctedUpdates = {
    ...updates,
    offerUrl: updates.offerUrl
      ? fixFacebookAdsLibraryUrl(updates.offerUrl)
      : updates.offerUrl,
  };

  const updateObj = mapToSupabaseOffer(correctedUpdates);
  const { data, error } = await supabase
    .from("offers")
    .update(updateObj)
    .eq("id", offerId)
    .select("*")
    .single();
  return { data: data ? mapSupabaseOffer(data) : null, error };
}

export async function deleteOfferService(offerId: string) {
  const { error } = await supabase.from("offers").delete().eq("id", offerId);
  return { error };
}

// Função para corrigir todas as URLs existentes no banco de dados
export async function fixAllOfferUrlsService() {
  try {
    // Buscar todas as ofertas
    const { data: offers, error: fetchError } = await supabase
      .from("offers")
      .select("id, offer_url");

    if (fetchError) {
      return { error: fetchError };
    }

    if (!offers || offers.length === 0) {
      return { data: { fixed: 0, total: 0 }, error: null };
    }

    let fixedCount = 0;

    // Corrigir cada URL
    for (const offer of offers) {
      const correctedUrl = fixFacebookAdsLibraryUrl(offer.offer_url);

      // Se a URL foi corrigida, atualizar no banco
      if (correctedUrl !== offer.offer_url) {
        const { error: updateError } = await supabase
          .from("offers")
          .update({ offer_url: correctedUrl })
          .eq("id", offer.id);

        if (!updateError) {
          fixedCount++;
        }
      }
    }

    return {
      data: {
        fixed: fixedCount,
        total: offers.length,
      },
      error: null,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error : new Error("Erro ao corrigir URLs"),
    };
  }
}
