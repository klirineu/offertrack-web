import { supabase } from "../lib/supabase";
import { Offer, AdMetrics } from "../types";
import { Database } from "../types/supabase";

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
  const insertObj = { ...mapToSupabaseOffer(newOffer), user_id };
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
  const updateObj = mapToSupabaseOffer(updates);
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
