import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      // Get all stats
      const { data: actions } = await supabase.from('visitor_actions').select('*').order('created_at', { ascending: false }).limit(100);
      const { data: ratings } = await supabase.from('project_ratings').select('*');
      const { data: comments } = await supabase.from('project_comments').select('*').order('created_at', { ascending: false }).limit(50);
      const { data: errors } = await supabase.from('error_logs').select('*').order('created_at', { ascending: false }).limit(50);
      const { data: projects } = await supabase.from('projects').select('id, name');

      // Calculate stats per project
      const projectStats = {};
      projects?.forEach(p => { projectStats[p.id] = { name: p.name, views: 0, plays: 0, totalDuration: 0, ratings: [], comments: 0, errors: 0 }; });

      actions?.forEach(a => {
        if (projectStats[a.project_id]) {
          if (a.action_type === 'view') projectStats[a.project_id].views++;
          if (a.action_type === 'play') projectStats[a.project_id].plays++;
          if (a.duration_seconds) projectStats[a.project_id].totalDuration += a.duration_seconds;
        }
      });

      ratings?.forEach(r => {
        if (projectStats[r.project_id]) projectStats[r.project_id].ratings.push(r.rating);
      });

      comments?.forEach(c => {
        if (projectStats[c.project_id] && c.approved) projectStats[c.project_id].comments++;
      });

      errors?.forEach(e => {
        if (projectStats[e.project_id]) projectStats[e.project_id].errors++;
      });

      // Top visitors
      const visitorStats = {};
      actions?.forEach(a => {
        if (!visitorStats[a.visitor_name]) visitorStats[a.visitor_name] = { actions: 0, duration: 0, projects: new Set() };
        visitorStats[a.visitor_name].actions++;
        if (a.duration_seconds) visitorStats[a.visitor_name].duration += a.duration_seconds;
        if (a.project_id) visitorStats[a.visitor_name].projects.add(a.project_id);
      });

      const topVisitors = Object.entries(visitorStats)
        .map(([name, stats]) => ({ name, actions: stats.actions, duration: stats.duration, projects: stats.projects.size }))
        .sort((a, b) => b.actions - a.actions)
        .slice(0, 10);

      // Action type breakdown
      const actionTypes = {};
      actions?.forEach(a => {
        actionTypes[a.action_type] = (actionTypes[a.action_type] || 0) + 1;
      });

      // Average ratings per project
      const projectRatings = Object.entries(projectStats).map(([id, stats]) => ({
        id: parseInt(id),
        name: stats.name,
        avgRating: stats.ratings.length > 0 ? (stats.ratings.reduce((a, b) => a + b, 0) / stats.ratings.length).toFixed(1) : null,
        totalRatings: stats.ratings.length
      })).filter(p => p.totalRatings > 0).sort((a, b) => b.totalRatings - a.totalRatings);

      return res.status(200).json({
        projectStats,
        topVisitors,
        actionTypes,
        projectRatings,
        recentActions: actions?.slice(0, 20) || [],
        recentComments: comments?.filter(c => c.approved).slice(0, 10) || [],
        recentErrors: errors?.slice(0, 10) || [],
        pendingComments: comments?.filter(c => !c.approved) || [],
        totalRatings: ratings?.length || 0,
        totalComments: comments?.filter(c => c.approved).length || 0,
        totalErrors: errors?.length || 0
      });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}