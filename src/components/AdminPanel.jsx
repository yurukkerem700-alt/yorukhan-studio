import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Trash2, Edit3, Save, Users, Clock, Eye, 
  TrendingUp, Package, Activity, AlertTriangle, CheckCircle, 
  Gamepad2, Smartphone, Search, BarChart3, Zap, Globe, RefreshCw,
  ExternalLink, Bell, Star, MessageSquare, Bug, Play, MousePointer,
  ThumbsUp, Filter, ChevronDown, XCircle
} from 'lucide-react';

export default function AdminPanel({ onClose, projects, onRefresh }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [detailedStats, setDetailedStats] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [formData, setFormData] = useState({
    name: '', description: '', url: '', category: 'app', status: 'active', image_url: '', tech_stack: []
  });
  const [techInput, setTechInput] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [comments, setComments] = useState([]);
  const [errors, setErrors] = useState([]);
  const [actions, setActions] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchDetailedStats();
    fetchComments();
    fetchErrors();
    generateNotifications();
  }, [projects]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const fetchDetailedStats = async () => {
    setLoadingDetail(true);
    try {
      const res = await fetch('/api/detailed-stats');
      const data = await res.json();
      setDetailedStats(data);
      setActions(data.recentActions || []);
    } catch (err) {
      console.error('Detailed stats fetch error:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comments');
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Comments fetch error:', err);
    }
  };

  const fetchErrors = async () => {
    try {
      const res = await fetch('/api/errors');
      const data = await res.json();
      setErrors(data);
    } catch (err) {
      console.error('Errors fetch error:', err);
    }
  };

  const generateNotifications = () => {
    const notifs = [];
    const pendingCount = comments.filter(c => !c.approved).length;
    if (pendingCount > 0) {
      notifs.push({ type: 'info', message: `${pendingCount} onay bekleyen yorum`, icon: MessageSquare });
    }
    if (projects.filter(p => p.status === 'maintenance').length > 0) {
      notifs.push({ type: 'warning', message: `${projects.filter(p => p.status === 'maintenance').length} proje bakımda`, icon: AlertTriangle });
    }
    if (errors.length > 0) {
      notifs.push({ type: 'error', message: `${errors.length} hata kaydı`, icon: Bug });
    }
    setNotifications(notifs);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.name.trim()) {
      alert('Proje adı zorunludur!');
      return;
    }
    
    try {
      const isNewProject = !editingProject?.id;
      const method = isNewProject ? 'POST' : 'PUT';
      const body = isNewProject ? formData : { id: editingProject.id, ...formData };
      
      const res = await fetch('/api/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onRefresh();
        setEditingProject(null);
        setIsAdding(false);
        setFormData({ name: '', description: '', url: '', category: 'app', status: 'active', image_url: '', tech_stack: [] });
        alert('Proje başarıyla kaydedildi!');
      } else {
        alert('Hata: ' + (data.error || 'Kaydetme başarısız'));
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Kaydetme hatası: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleQuickStatusChange = async (projectId, newStatus) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: projectId, status: newStatus }),
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error('Status change error:', err);
    }
  };

  const handleApproveComment = async (id, approved) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved }),
      });
      if (res.ok) {
        fetchComments();
      }
    } catch (err) {
      console.error('Comment approve error:', err);
    }
  };

  const handleDeleteComment = async (id) => {
    if (!confirm('Yorumu silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchComments();
    } catch (err) {
      console.error('Delete comment error:', err);
    }
  };

  const addTech = () => {
    if (techInput.trim()) {
      setFormData(prev => ({
        ...prev,
        tech_stack: [...prev.tech_stack, techInput.trim()]
      }));
      setTechInput('');
    }
  };

  const removeTech = (index) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((_, i) => i !== index)
    }));
  };

  const filteredProjects = projects
    .filter(p => {
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterStatus !== 'all' && p.status !== filterStatus) return false;
      if (filterCategory !== 'all' && p.category !== filterCategory) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const StatCard = ({ icon: Icon, label, value, color, trend, subtitle }) => (
    <motion.div 
      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-white/10 relative overflow-hidden group"
      whileHover={{ scale: 1.02, y: -5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity" 
        style={{ background: color.includes('cyan') ? 'linear-gradient(to right, #06b6d4, #8b5cf6)' : color.includes('green') ? 'linear-gradient(to right, #22c55e, #10b981)' : color.includes('purple') ? 'linear-gradient(to right, #a855f7, #ec4899)' : color.includes('pink') ? 'linear-gradient(to right, #ec4899, #f472b6)' : color.includes('yellow') ? 'linear-gradient(to right, #f59e0b, #eab308)' : 'linear-gradient(to right, #3b82f6, #06b6d4)' }} />
      <div className="flex items-start justify-between relative">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <TrendingUp className={`w-4 h-4 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4 relative">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-slate-400 text-sm mt-1">{label}</p>
        {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );

  const ActionIcon = ({ type }) => {
    switch(type) {
      case 'view': return <Eye className="w-4 h-4 text-cyan-400" />;
      case 'play': return <Play className="w-4 h-4 text-green-400" />;
      case 'like': return <ThumbsUp className="w-4 h-4 text-pink-400" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'error': return <Bug className="w-4 h-4 text-red-400" />;
      case 'click': return <MousePointer className="w-4 h-4 text-yellow-400" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Bilinmeyen';
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-hidden border border-white/10 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Yönetici Paneli
              </h2>
              <p className="text-slate-500 text-sm">KEJDER olarak giriş yapıldı</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="p-2 hover:bg-white/10 rounded-xl transition-colors relative">
                <Bell className="w-5 h-5 text-slate-400" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 rounded-xl border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {notifications.map((notif, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border-b border-white/5 last:border-0">
                    <notif.icon className={`w-5 h-5 ${notif.type === 'warning' ? 'text-yellow-400' : notif.type === 'error' ? 'text-red-400' : notif.type === 'info' ? 'text-blue-400' : 'text-green-400'}`} />
                    <span className="text-sm text-slate-300">{notif.message}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-white/10 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Gösterge Paneli', icon: BarChart3 },
            { id: 'projects', label: 'Projeler', icon: Package },
            { id: 'visitors', label: 'Ziyaretçiler', icon: Users },
            { id: 'actions', label: 'Eylemler', icon: Activity },
            { id: 'comments', label: 'Yorumlar', icon: MessageSquare },
            { id: 'errors', label: 'Hatalar', icon: Bug }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'comments' && comments.filter(c => !c.approved).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-red-500 rounded-full text-xs">{comments.filter(c => !c.approved).length}</span>
              )}
              {tab.id === 'errors' && errors.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-yellow-500 rounded-full text-xs">{errors.length}</span>
              )}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <AnimatePresence mode="wait">
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && stats && (
              <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                  <StatCard icon={Package} label="Toplam Proje" value={stats.totalProjects} color="from-cyan-500 to-blue-500" trend={12} />
                  <StatCard icon={Activity} label="Aktif" value={stats.activeProjects} color="from-green-500 to-emerald-500" />
                  <StatCard icon={AlertTriangle} label="Bakımda" value={stats.maintenanceProjects} color="from-yellow-500 to-orange-500" />
                  <StatCard icon={Users} label="Ziyaretçi" value={stats.totalVisitors} color="from-purple-500 to-pink-500" trend={8} />
                  <StatCard icon={Star} label="Beğeni" value={detailedStats?.totalRatings || 0} color="from-pink-500 to-rose-500" />
                  <StatCard icon={MessageSquare} label="Yorum" value={detailedStats?.totalComments || 0} color="from-indigo-500 to-purple-500" />
                </div>

                {/* Quick Actions & Recent Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Recent Projects */}
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Son Projeler</h3>
                      <button onClick={() => setActiveTab('projects')} className="text-sm text-cyan-400 hover:text-cyan-300">Tümünü Gör</button>
                    </div>
                    <div className="space-y-3">
                      {projects.slice(0, 4).map(project => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl">
                          <div className="flex items-center gap-3">
                            {project.category === 'game' ? (
                              <Gamepad2 className="w-5 h-5 text-purple-400" />
                            ) : (
                              <Smartphone className="w-5 h-5 text-cyan-400" />
                            )}
                            <div>
                              <p className="text-white font-medium">{project.name}</p>
                              <p className="text-xs text-slate-500">{project.category === 'game' ? 'Oyun' : 'Uygulama'}</p>
                            </div>
                          </div>
                          <select
                            value={project.status}
                            onChange={(e) => handleQuickStatusChange(project.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded-lg border-0 ${
                              project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              project.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            <option value="active">Aktif</option>
                            <option value="maintenance">Bakımda</option>
                            <option value="completed">Tamamlandı</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-medium text-white mb-4">Hızlı İşlemler</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        onClick={() => { setIsAdding(true); setEditingProject(null); }}
                        className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Plus className="w-6 h-6 text-cyan-400" />
                        <span className="text-sm text-slate-300">Yeni Proje</span>
                      </motion.button>
                      <motion.button
                        onClick={() => setActiveTab('comments')}
                        className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <MessageSquare className="w-6 h-6 text-purple-400" />
                        <span className="text-sm text-slate-300">Yorumlar</span>
                      </motion.button>
                      <motion.button
                        onClick={() => setActiveTab('errors')}
                        className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <Bug className="w-6 h-6 text-red-400" />
                        <span className="text-sm text-slate-300">Hatalar</span>
                      </motion.button>
                      <motion.button
                        onClick={() => { fetchDetailedStats(); fetchStats(); }}
                        className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <RefreshCw className="w-6 h-6 text-green-400" />
                        <span className="text-sm text-slate-300">Yenile</span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Recent Actions */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Son Eylemler</h3>
                    <button onClick={() => setActiveTab('actions')} className="text-sm text-cyan-400 hover:text-cyan-300">Tümünü Gör</button>
                  </div>
                  <div className="space-y-2">
                    {actions.slice(0, 8).map((action, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
                        <ActionIcon type={action.action_type} />
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            <span className="font-medium">{action.visitor_name || 'Anonim'}</span>
                            {' '}• {action.action_type === 'view' ? 'görüntüledi' : action.action_type === 'play' ? 'oynadı' : action.action_type === 'like' ? 'beğendi' : action.action_type === 'comment' ? 'yorum yaptı' : action.action_type}
                            {action.project_id && <span className="text-cyan-400"> {getProjectName(action.project_id)}</span>}
                          </p>
                          {action.duration_seconds > 0 && (
                            <p className="text-xs text-slate-500">{Math.round(action.duration_seconds / 60)} dakika</p>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{new Date(action.created_at).toLocaleString('tr-TR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Search and Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Proje ara..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="active">Aktif</option>
                    <option value="maintenance">Bakımda</option>
                    <option value="completed">Tamamlandı</option>
                  </select>
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="all">Tüm Kategoriler</option>
                    <option value="game">Oyunlar</option>
                    <option value="app">Uygulamalar</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="newest">En Yeni</option>
                    <option value="oldest">En Eski</option>
                    <option value="name">İsme Göre</option>
                  </select>
                  <motion.button
                    onClick={() => { setIsAdding(true); setEditingProject(null); }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-5 h-5" />
                    Yeni Proje
                  </motion.button>
                </div>
                
                {/* Project Form */}
                <AnimatePresence>
                  {(isAdding || editingProject) && (
                    <motion.div 
                      className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-white/10"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <h3 className="text-lg font-medium text-white mb-4">
                        {editingProject?.id ? 'Proje Düzenle' : 'Yeni Proje Ekle'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          placeholder="Proje Adı *"
                          value={formData.name}
                          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                        />
                        <input
                          type="url"
                          placeholder="Proje URL"
                          value={formData.url}
                          onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                          className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Görsel URL"
                          value={formData.image_url}
                          onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                          className="px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <select
                            value={formData.category}
                            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                          >
                            <option value="app">Uygulama</option>
                            <option value="game">Oyun</option>
                          </select>
                          <select
                            value={formData.status}
                            onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))}
                            className="flex-1 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:border-cyan-500 focus:outline-none"
                          >
                            <option value="active">Aktif</option>
                            <option value="maintenance">Bakımda</option>
                            <option value="completed">Tamamlandı</option>
                          </select>
                        </div>
                        <textarea
                          placeholder="Açıklama"
                          value={formData.description}
                          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="md:col-span-2 px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none resize-none h-24"
                        />
                        <div className="md:col-span-2">
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              placeholder="Teknoloji ekle..."
                              value={techInput}
                              onChange={e => setTechInput(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && addTech()}
                              className="flex-1 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                            />
                            <button onClick={addTech} className="px-4 py-2 bg-white/10 rounded-xl text-slate-300 hover:bg-white/20">Ekle</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {formData.tech_stack.map((tech, i) => (
                              <span key={i} className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm">
                                {tech}
                                <button onClick={() => removeTech(i)} className="hover:text-red-400">×</button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button onClick={() => { setIsAdding(false); setEditingProject(null); setFormData({ name: '', description: '', url: '', category: 'app', status: 'active', image_url: '', tech_stack: [] }); }} className="px-4 py-2 bg-white/10 rounded-xl text-slate-300 hover:bg-white/20">İptal</button>
                        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium">
                          <Save className="w-4 h-4" />
                          Kaydet
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Projects List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map(project => (
                    <motion.div 
                      key={project.id}
                      className="bg-slate-800/50 rounded-xl p-4 border border-white/10 group"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {project.category === 'game' ? (
                            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                              <Gamepad2 className="w-5 h-5 text-purple-400" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-cyan-400" />
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-white">{project.name}</h4>
                            <p className="text-xs text-slate-500">{project.category === 'game' ? 'Oyun' : 'Uygulama'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <select
                        value={project.status}
                        onChange={(e) => handleQuickStatusChange(project.id, e.target.value)}
                        className={`w-full text-sm px-3 py-2 rounded-lg border-0 mb-3 ${
                          project.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          project.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        <option value="active">✓ Aktif</option>
                        <option value="maintenance">⚠ Bakımda</option>
                        <option value="completed">★ Tamamlandı</option>
                      </select>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingProject(project);
                            setFormData({
                              name: project.name,
                              description: project.description || '',
                              url: project.url || '',
                              category: project.category,
                              status: project.status,
                              image_url: project.image_url || '',
                              tech_stack: project.tech_stack || []
                            });
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-white/5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition-colors text-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                          Düzenle
                        </button>
                        {project.url && (
                          <button 
                            onClick={() => window.open(project.url, '_blank')}
                            className="px-3 py-2 bg-cyan-500/10 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                            title="Projeyi Aç"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(project.id)}
                          className="px-3 py-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {filteredProjects.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Proje bulunamadı</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Visitors Tab */}
            {activeTab === 'visitors' && stats && detailedStats && (
              <motion.div key="visitors" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <StatCard icon={Users} label="Toplam Ziyaretçi" value={stats.totalVisitors} color="from-pink-500 to-rose-500" trend={8} />
                  <StatCard icon={Clock} label="Ort. Süre" value={`${Math.round(stats.totalSessionDuration / Math.max(stats.totalVisitors, 1) / 60)} dk`} color="from-indigo-500 to-purple-500" />
                  <StatCard icon={Eye} label="Sayfa Görüntüleme" value={stats.totalPageViews} color="from-teal-500 to-cyan-500" trend={15} />
                  <StatCard icon={Activity} label="Toplam Eylem" value={actions.length} color="from-orange-500 to-yellow-500" />
                </div>

                {/* Top Visitors */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10 mb-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    En Aktif Ziyaretçiler
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-900/50">
                        <tr>
                          <th className="text-left px-4 py-3 text-slate-400 text-sm">Ziyaretçi</th>
                          <th className="text-left px-4 py-3 text-slate-400 text-sm">Eylem</th>
                          <th className="text-left px-4 py-3 text-slate-400 text-sm">Süre</th>
                          <th className="text-left px-4 py-3 text-slate-400 text-sm">Proje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailedStats.topVisitors?.map((visitor, i) => (
                          <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                            <td className="px-4 py-3 text-white">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                  {visitor.name[0]?.toUpperCase()}
                                </div>
                                {visitor.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{visitor.actions}</td>
                            <td className="px-4 py-3 text-slate-400">{Math.round(visitor.duration / 60)} dk</td>
                            <td className="px-4 py-3 text-slate-400">{visitor.projects} proje</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Visitors */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-medium text-white mb-4">Son Ziyaretçiler</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-900/50">
                        <tr>
                          <th className="text-left px-4 py-3 text-slate-400 text-sm">Ziyaretçi</th>
                          <th className="text-left px-4 py-3 text-slate-400 text-sm">Süre</th>
                          <th className="text-left px-4 py-3 text-slate-400 text-sm">Sayfa</th>
                          <th className="text-left px-4 py-3 text-slate-400 text-sm">Tarih</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentVisitors?.map((visitor, i) => (
                          <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                            <td className="px-4 py-3 text-white">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                  {(visitor.visitor_name || 'A')[0].toUpperCase()}
                                </div>
                                {visitor.visitor_name || 'Anonim'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-400">{Math.round(visitor.session_duration / 60)} dk</td>
                            <td className="px-4 py-3 text-slate-400">{visitor.page_views}</td>
                            <td className="px-4 py-3 text-slate-400">{new Date(visitor.visited_at).toLocaleString('tr-TR')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions Tab */}
            {activeTab === 'actions' && (
              <motion.div key="actions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-white">Tüm Eylemler</h3>
                  <button onClick={fetchDetailedStats} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-slate-400 hover:bg-white/10">
                    <RefreshCw className="w-4 h-4" />
                    Yenile
                  </button>
                </div>
                
                <div className="bg-slate-800/50 rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-900/50">
                      <tr>
                        <th className="text-left px-4 py-3 text-slate-400 text-sm">Ziyaretçi</th>
                        <th className="text-left px-4 py-3 text-slate-400 text-sm">Eylem</th>
                        <th className="text-left px-4 py-3 text-slate-400 text-sm">Proje</th>
                        <th className="text-left px-4 py-3 text-slate-400 text-sm">Detay</th>
                        <th className="text-left px-4 py-3 text-slate-400 text-sm">Süre</th>
                        <th className="text-left px-4 py-3 text-slate-400 text-sm">Tarih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actions.map((action, i) => (
                        <tr key={i} className="border-t border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-white">{action.visitor_name || 'Anonim'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <ActionIcon type={action.action_type} />
                              <span className="text-slate-300">{action.action_type}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-cyan-400">{action.project_id ? getProjectName(action.project_id) : '-'}</td>
                          <td className="px-4 py-3 text-slate-400 text-sm">{action.action_detail || '-'}</td>
                          <td className="px-4 py-3 text-slate-400">{action.duration_seconds ? `${Math.round(action.duration_seconds / 60)} dk` : '-'}</td>
                          <td className="px-4 py-3 text-slate-500 text-sm">{new Date(action.created_at).toLocaleString('tr-TR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {actions.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Henüz eylem kaydı yok</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <motion.div key="comments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Pending Comments */}
                {comments.filter(c => !c.approved).length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-yellow-400 mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Onay Bekleyen Yorumlar ({comments.filter(c => !c.approved).length})
                    </h3>
                    <div className="space-y-3">
                      {comments.filter(c => !c.approved).map(comment => (
                        <div key={comment.id} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-white">{comment.visitor_name || 'Anonim'}</span>
                                <span className="text-slate-500 text-sm">→ {getProjectName(comment.project_id)}</span>
                              </div>
                              <p className="text-slate-300">{comment.comment}</p>
                              <p className="text-xs text-slate-500 mt-2">{new Date(comment.created_at).toLocaleString('tr-TR')}</p>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleApproveComment(comment.id, true)}
                                className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 text-sm"
                              >
                                Onayla
                              </button>
                              <button 
                                onClick={() => handleDeleteComment(comment.id)}
                                className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved Comments */}
                <h3 className="text-lg font-medium text-white mb-4">Onaylanan Yorumlar</h3>
                <div className="space-y-3">
                  {comments.filter(c => c.approved).map(comment => (
                    <div key={comment.id} className="bg-slate-800/50 border border-white/10 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-white">{comment.visitor_name || 'Anonim'}</span>
                            <span className="text-cyan-400 text-sm">→ {getProjectName(comment.project_id)}</span>
                          </div>
                          <p className="text-slate-300">{comment.comment}</p>
                          <p className="text-xs text-slate-500 mt-2">{new Date(comment.created_at).toLocaleString('tr-TR')}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {comments.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Henüz yorum yok</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Errors Tab */}
            {activeTab === 'errors' && (
              <motion.div key="errors" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-red-400 flex items-center gap-2">
                    <Bug className="w-5 h-5" />
                    Hata Kayıtları ({errors.length})
                  </h3>
                  <button onClick={fetchErrors} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-slate-400 hover:bg-white/10">
                    <RefreshCw className="w-4 h-4" />
                    Yenile
                  </button>
                </div>
                
                <div className="space-y-3">
                  {errors.map((error, i) => (
                    <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">{error.error_type || 'Hata'}</span>
                          <span className="text-slate-400 text-sm">{error.visitor_name || 'Anonim'}</span>
                        </div>
                        <span className="text-xs text-slate-500">{new Date(error.created_at).toLocaleString('tr-TR')}</span>
                      </div>
                      <p className="text-white mb-2">{error.error_message}</p>
                      {error.page_url && (
                        <p className="text-xs text-slate-500">Sayfa: {error.page_url}</p>
                      )}
                      {error.project_id && (
                        <p className="text-xs text-cyan-400">Proje: {getProjectName(error.project_id)}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                {errors.length === 0 && (
                  <div className="text-center py-12 text-slate-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
                    <p>Hata kaydı yok! 🎉</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}