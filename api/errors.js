import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { project_id, limit } = req.query;
      let query = supabase.from('error_logs').select('*').order('created_at', { ascending: false });
      if (project_id) query = query.eq('project_id', project_id);
      if (limit) query = query.limit(parseInt(limit));
      else query = query.limit(50);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { project_id, visitor_name, error_type, error_message, page_url } = req.body;
      const { data, error } = await supabase
        .from('error_logs')
        .insert({ project_id, visitor_name, error_type, error_message, page_url })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}