const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function supaFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.method === 'POST' ? 'resolution=merge-duplicates' : 'return=representation',
      ...options.headers,
    },
  });
  return res;
}

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  // GET — load data
  if (req.method === 'GET') {
    try {
      const r = await supaFetch('app_data?id=eq.main&select=data');
      const rows = await r.json();
      if (rows.length > 0) {
        return res.status(200).json(rows[0].data);
      }
      return res.status(200).json(null);
    } catch (e) {
      console.error('Load error:', e);
      return res.status(500).json({ error: 'Failed to load' });
    }
  }

  // POST — save data
  if (req.method === 'POST') {
    try {
      const r = await supaFetch('app_data', {
        method: 'POST',
        body: JSON.stringify({
          id: 'main',
          data: req.body,
          updated_at: new Date().toISOString(),
        }),
      });
      if (!r.ok) {
        const err = await r.text();
        console.error('Supabase error:', err);
        return res.status(500).json({ error: 'Failed to save' });
      }
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error('Save error:', e);
      return res.status(500).json({ error: 'Failed to save' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
