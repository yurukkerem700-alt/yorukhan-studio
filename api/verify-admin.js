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
      
      // Get session
      const { data: session, error: sessionError } = await supabase
        .from('admin_sessions')
        .select('admin_id')
        .eq('token', token)
        .single();
      
      if (sessionError || !session) {
        return res.status(401).json({ valid: false });
      }
      
      // Get admin info
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('id, name, email')
        .eq('id', session.admin_id)
        .single();
      
      if (adminError || !admin) {
        return res.status(401).json({ valid: false });
      }
      
      return res.status(200).json({ 
        valid: true, 
        admin: admin 
      });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
