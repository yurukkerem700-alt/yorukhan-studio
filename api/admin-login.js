import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { name, password } = req.body;
      
      // Check admin credentials by name
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('name', name)
        .eq('password', password)
        .single();
      
      if (error || !admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Create session
      const sessionToken = Buffer.from(`${admin.name}:${Date.now()}`).toString('base64');
      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({ admin_id: admin.id, token: sessionToken });
      
      if (sessionError) throw sessionError;
      
      return res.status(200).json({ 
        success: true, 
        token: sessionToken,
        admin: { id: admin.id, name: admin.name, email: admin.email }
      });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}