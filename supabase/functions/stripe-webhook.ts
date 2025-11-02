import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.15.0?target=deno";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2022-11-15",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.metadata.userId;
    const planId = session.metadata.planId;

    // Atualiza o perfil do usuário no Supabase
    const now = new Date();
    const trialExpires = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 dia de trial

    await supabase
      .from("profiles")
      .update({
        plan_id: planId,
        subscription_status: "trialing",
        trial_started_at: now.toISOString(),
        trial_expires_at: trialExpires.toISOString(),
      })
      .eq("id", userId);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
