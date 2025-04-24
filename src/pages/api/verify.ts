import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Inicializa o cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Habilita CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { id, url } = req.query;

    if (!id || !url || typeof id !== 'string' || typeof url !== 'string') {
      res.status(400).json({ error: 'Missing or invalid parameters' });
      return;
    }

    // Converte o ID curto de volta para UUID
    const shortId = id;
    const { data: sites, error: sitesError } = await supabase
      .from('anticlone_sites')
      .select('id, action_type, action_data')
      .filter('id', 'ilike', `${shortId}%`)
      .limit(1)
      .single();

    if (sitesError || !sites) {
      res.status(404).json({ error: 'Site not found' });
      return;
    }

    // Registra a detecção do clone
    const { error: cloneError } = await supabase
      .from('detected_clones')
      .upsert({
        anticlone_site_id: sites.id,
        clone_url: url,
        last_access: new Date().toISOString(),
        access_count: 1
      });

    if (cloneError) {
      console.error('Error registering clone:', cloneError);
    }

    // Codifica a ação na resposta
    let width = 0;
    let height = 0;
    
    if (sites.action_type) {
      width = sites.action_type === 'redirect' ? 1 :
              sites.action_type === 'replace_links' ? 2 :
              sites.action_type === 'replace_images' ? 3 : 0;
      
      const base64Data = Buffer.from(sites.action_data || '').toString('base64');
      height = parseInt(base64Data, 36) || 0;
    }

    // Cria uma imagem GIF 1x1 transparente com as dimensões codificadas
    const gif = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // Header
      width & 0xFF, (width >> 8) & 0xFF,   // Width
      height & 0xFF, (height >> 8) & 0xFF, // Height
      0x00, 0x00, 0x00, 0x21, 0xF9, 0x04,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x2C,
      0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02,
      0x02, 0x44, 0x01, 0x00, 0x3B        // Footer
    ]);

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(gif);

  } catch (error) {
    console.error('Verify API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 