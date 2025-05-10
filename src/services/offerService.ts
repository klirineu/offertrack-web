import { supabase } from "../lib/supabase";

async function getCurrentUserId() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");
  return user.id;
}

export async function fetchOffersService() {
  const userId = await getCurrentUserId();
  return await supabase
    .from("offers")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function addOfferService(offer: Record<string, unknown>) {
  const userId = await getCurrentUserId();
  const result = await supabase
    .from("offers")
    .insert({ ...offer, user_id: userId })
    .select("*")
    .single();
  console.log(
    "[DEBUG] Resposta completa do Supabase (addOfferService):",
    result
  );
  return result;
}

export async function updateOfferService(
  offerId: string,
  updates: Record<string, unknown>
) {
  return await supabase.from("offers").update(updates).eq("id", offerId);
}

export async function deleteOfferService(offerId: string) {
  return await supabase.from("offers").delete().eq("id", offerId);
}
