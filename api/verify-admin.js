import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { token } = req.body;
      
      if (!token) {
        return res.status(401).json({ valid: false });
      }
      
      const { data: session, error } = await supabase
        .from('admin_sessions')
        .select('admin_id, admins(id, name, email)')
        .eq('token', token)
        .single();
      
      if (error || !session) {
        return res.status(401).json({ valid: false });
      }
      
      return res.status(200).json({ 
        valid: true, 
        admin: session.admins 
      });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}