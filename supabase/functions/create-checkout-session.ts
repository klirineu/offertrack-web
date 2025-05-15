import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
  // Integração Stripe removida
  return new Response(
    JSON.stringify({
      error:
        "Método de pagamento temporariamente indisponível. Aguarde novas instruções.",
    }),
    {
      status: 400,
      headers: corsHeaders,
    }
  );
});
