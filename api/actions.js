import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { project_id, visitor_name, action_type, limit } = req.query;
      let query = supabase.from('visitor_actions').select('*').order('created_at', { ascending: false });
      if (project_id) query = query.eq('project_id', project_id);
      if (visitor_name) query = query.eq('visitor_name', visitor_name);
      if (action_type) query = query.eq('action_type', action_type);
      if (limit) query = query.limit(parseInt(limit));
      else query = query.limit(100);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { visitor_id, visitor_name, project_id, action_type, action_detail, duration_seconds } = req.body;
      const { data, error } = await supabase
        .from('visitor_actions')
        .insert({ visitor_id, visitor_name, project_id, action_type, action_detail, duration_seconds })
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