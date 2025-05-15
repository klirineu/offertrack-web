import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);
const PLAN_PRICES = {
  prod_SJTAZ4GN7byoAT: "price_1ROqECGNVInNw9dSGcoJoVbn",
  prod_SJTB7XU8X0k7SJ: "price_1ROqF9GNVInNw9dSKhM4uMNb",
  prod_SJTCB6OT22VDuh: "price_1ROqFoGNVInNw9dSQGy1XlFq",
};
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }
  const { email, planId, fullName, password } = await req.json();
  const priceId = PLAN_PRICES[planId];
  if (!priceId) {
    return new Response(
      JSON.stringify({
        error: "Plano inválido",
      }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }
  // Cria o usuário no Supabase
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: {
      full_name: fullName,
      plan_id: planId,
      subscription_status: "pending",
    },
  });
  if (error || !data?.user?.id) {
    return new Response(
      JSON.stringify({
        error: error?.message || "Erro ao criar usuário",
      }),
      {
        status: 400,
        headers: corsHeaders,
      }
    );
  }
  const userId = data.user.id;
  // Cria sessão Stripe via API REST
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const sessionRes = await fetch(
    "https://api.stripe.com/v1/checkout/sessions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecret}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payment_method_types[]": "card",
        mode: "subscription",
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        customer_email: email,
        "subscription_data[trial_period_days]": "7",
        "subscription_data[metadata][userId]": userId,
        "subscription_data[metadata][planId]": planId,
        success_url: "https://clonup.pro/dashboard?payment=success",
        cancel_url: "https://clonup.pro/planos?payment=cancel",
        "metadata[userId]": userId,
        "metadata[planId]": planId,
      }),
    }
  );
  const session = await sessionRes.json();
  if (!session.url) {
    return new Response(
      JSON.stringify({
        error: session.error?.message || "Erro ao criar checkout Stripe",
      }),
      { status: 400, headers: corsHeaders }
    );
  }
  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: corsHeaders,
  });
});
