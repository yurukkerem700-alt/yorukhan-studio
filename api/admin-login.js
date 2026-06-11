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
      
      // Admin bilgilerini email ve şifre ile kontrol et
      const { data: admin, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();
      
      if (error || !admin) {
        console.error('Admin query error or not found:', error?.message);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Güvenli Session token oluştur
      const sessionToken = Buffer.from(`${admin.email}:${Date.now()}`).toString('base64');      
      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({ admin_id: admin.id, token: sessionToken });
      
      if (sessionError) {
        console.error('Session insert error:', sessionError);
        throw sessionError;
      }
      
      console.log('Login successful for:', admin.email);
      
      // Arayüzün beklediği şekilde admin objesini geri dön
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
