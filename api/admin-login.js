import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { email, password } = req.body;
      
      console.log('Login attempt:', { email });
      
      // Check admin credentials
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();
      
      if (error) {
        console.error('Admin query error:', error);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Create session token
      const sessionToken = Buffer.from(`${admin.email}:${Date.now()}`).toString('base64');      
      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({ admin_id: admin.id, token: sessionToken });
      
      if (sessionError) {
        console.error('Session insert error:', sessionError);
        throw sessionError;
      }
      
      console.log('Login successful for:', admin.email);
      
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
