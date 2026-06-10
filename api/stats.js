import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      // Total projects by status
      const { data: projects } = await supabase.from('projects').select('status, category');
      
      // Total visitors
      const { data: visitors } = await supabase.from('visitors').select('session_duration, page_views');
      
      // Recent visitors
      const { data: recentVisitors } = await supabase
        .from('visitors')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(10);

      const stats = {
        totalProjects: projects?.length || 0,
        activeProjects: projects?.filter(p => p.status === 'active').length || 0,
        maintenanceProjects: projects?.filter(p => p.status === 'maintenance').length || 0,
        completedProjects: projects?.filter(p => p.status === 'completed').length || 0,
        games: projects?.filter(p => p.category === 'game').length || 0,
        apps: projects?.filter(p => p.category === 'app').length || 0,
        totalVisitors: visitors?.length || 0,
        totalSessionDuration: visitors?.reduce((sum, v) => sum + (v.session_duration || 0), 0) || 0,
        totalPageViews: visitors?.reduce((sum, v) => sum + (v.page_views || 0), 0) || 0,
        recentVisitors: recentVisitors || []
      };

      return res.status(200).json(stats);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}