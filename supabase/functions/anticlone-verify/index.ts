import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Function initialized with URL:', supabaseUrl);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const shortId = url.searchParams.get('id');
    const currentUrl = url.searchParams.get('url');

    console.log('Received request:', { shortId, currentUrl });

    if (!shortId || !currentUrl) {
      console.error('Missing parameters:', { shortId, currentUrl });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get all sites and find the one matching the short ID
    const { data: sites, error: sitesError } = await supabase
      .from('anticlone_sites')
      .select('*');

    if (sitesError) {
      console.error('Error fetching sites:', sitesError);
      return new Response(
        JSON.stringify({ error: 'Error fetching sites' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Find the site with matching short ID
    const site = sites.find(s => {
      const siteShortId = parseInt(s.id.replace(/-/g, '').slice(0, 8), 16).toString(36);
      return siteShortId === shortId;
    });

    console.log('Site lookup result:', { site });

    if (!site) {
      console.error('Site not found:', { shortId });
      return new Response(
        JSON.stringify({ error: 'Site not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if the current URL matches the original URL's domain
    const currentDomain = new URL(currentUrl).hostname;
    const originalDomain = new URL(site.original_url).hostname;

    console.log('Domain comparison:', { currentDomain, originalDomain });

    if (currentDomain === originalDomain) {
      return new Response(
        JSON.stringify({ isClone: false }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Coletar informações do visitante
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('cf-connecting-ip') || 
               req.headers.get('x-real-ip') || '';
    const referer = req.headers.get('referer') || '';
    const country = req.headers.get('cf-ipcountry') || '';
    const city = req.headers.get('cf-ipcity') || '';
    const region = req.headers.get('cf-region') || '';

    console.log('Visitor info:', { ip, country, city, region });

    // Se for um clone, registrar em ambas as tabelas
    const [cloneResult, accessResult] = await Promise.all([
      // Registrar/atualizar na detected_clones
      supabase.from('detected_clones').upsert(
        {
          anticlone_site_id: site.id,
          clone_url: currentUrl,
          status: 'active',
          similarity_score: 100,
          last_access: new Date().toISOString(),
          access_count: 1
        },
        {
          onConflict: 'anticlone_site_id,clone_url',
          update: {
            last_access: new Date().toISOString(),
            access_count: "access_count + 1"
          }
        }
      ),

      // Registrar na clone_access_logs
      supabase.from('clone_access_logs').insert({
        anticlone_site_id: site.id,
        clone_url: currentUrl,
        ip_address: ip,
        user_agent: userAgent,
        country,
        city,
        region,
        referrer: referer
      })
    ]);

    console.log('Database operations result:', { cloneResult, accessResult });

    if (cloneResult.error) {
      console.error('Error logging clone:', cloneResult.error);
    }

    if (accessResult.error) {
      console.error('Error logging access:', accessResult.error);
    }

    // Return the action to take
    return new Response(
      JSON.stringify({
        isClone: true,
        action: site.action_type ? {
          type: site.action_type,
          data: site.action_data
        } : null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}); 