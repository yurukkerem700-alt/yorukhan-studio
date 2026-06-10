import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, Smartphone, Settings, LogOut, Sparkles, 
  Zap, Star, ChevronRight, Menu, X
} from 'lucide-react';
import FloatingShapes from './components/FloatingShapes';
import ProjectCard from './components/ProjectCard';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import ProjectPlayer from './components/ProjectPlayer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

const categories = [
  { id: 'completed-game', label: 'Tamamlanan Oyunlar', icon: Gamepad2, color: 'from-green-400 to-emerald-500', filter: { category: 'game', status: 'completed' } },
  { id: 'completed-app', label: 'Tamamlanan Uygulamalar', icon: Smartphone, color: 'from-blue-400 to-cyan-500', filter: { category: 'app', status: 'completed' } },
  { id: 'developing-game', label: 'Geliştirilen Oyunlar', icon: Gamepad2, color: 'from-purple-400 to-pink-500', filter: { category: 'game', status: 'active' } },
  { id: 'developing-app', label: 'Geliştirilen Uygulamalar', icon: Smartphone, color: 'from-orange-400 to-red-500', filter: { category: 'app', status: 'active' } },
];

interface Project {
  id: number;
  name: string;
  description?: string;
  url?: string;
  category: string;
  status: string;
  image_url?: string;
  tech_stack?: string[];
}

interface Admin {
  id: number;
  name: string;
  email: string;
}

function AppContent() {
  const { isAdmin, admin, loading, logout } = useAuth() as { isAdmin: boolean; admin: Admin | null; loading: boolean; logout: () => void };
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('completed-game');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [playingProject, setPlayingProject] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects();
    trackVisit();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const trackVisit = async () => {
    // Simulate visitor tracking
    const visitorName = localStorage.getItem('visitorName') || `Ziyaretçi_${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('visitorName', visitorName);
    
    try {
      await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_name: visitorName,
          session_duration: Math.floor(Math.random() * 600) + 60,
          page_views: Math.floor(Math.random() * 10) + 1
        })
      });
    } catch (err) {
      console.error('Visit track error:', err);
    }
  };

  const handleProjectVisit = (projectId: number, project?: Project) => {
    // Open project in player if project data is provided
    if (project) {
      setPlayingProject(project);
      // Track visit asynchronously
      fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          visitor_name: localStorage.getItem('visitorName') || 'Anonim',
          session_duration: Math.floor(Math.random() * 300) + 30,
          page_views: 1
        })
      }).catch(err => console.error('Project visit error:', err));
    }
  };

  const handleEditProject = (project: Project) => {
    if (isAdmin) {
      setShowAdminPanel(true);
    }
  };

  const currentCategory = categories.find(c => c.id === activeCategory);
  const filteredProjects = projects.filter(p => {
    const cat = currentCategory?.filter;
    if (!cat) return true;
    if (cat.category && p.category !== cat.category) return false;
    if (cat.status && p.status !== cat.status) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-400 animate-pulse">Yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      <FloatingShapes />
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-xl bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <motion.div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  YÖRÜKHAN
                </h1>
                <p className="text-xs text-slate-500 -mt-0.5">STÜDYO <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">KEREM YÜRÜK</span></p>
              </div>
            </motion.div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              {isAdmin ? (
                <>
                  <span className="text-sm text-slate-400">Hoş geldin, {admin?.name || 'Admin'}</span>
                  <motion.button
                    onClick={() => setShowAdminPanel(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium shadow-lg shadow-purple-500/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Settings className="w-4 h-4" />
                    Yönetim Paneli
                  </motion.button>
                  <motion.button
                    onClick={logout}
                    className="p-2 bg-white/5 rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-slate-300 hover:bg-white/10 transition-all border border-white/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Settings className="w-4 h-4" />
                  Yönetici Girişi
                </motion.button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 bg-white/5 rounded-xl text-slate-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                className="md:hidden mt-4 pb-4 space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {isAdmin ? (
                  <>\n                    <div className="text-sm text-slate-400 py-2">Hoş geldin, {admin?.name || 'Admin'}</div>
                    <button
                      onClick={() => { setShowAdminPanel(true); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl text-white font-medium"
                    >
                      <Settings className="w-4 h-4" />
                      Yönetim Paneli
                    </button>
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl text-slate-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setShowLoginModal(true); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-white/5 rounded-xl text-slate-300"
                  >
                    <Settings className="w-4 h-4" />
                    Yönetici Girişi
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative z-10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-slate-300">Yeni projeler yakında!</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Yaratıcı Projeler
              </span>
              <br />
              <span className="text-slate-300">Tek Çatı Altında</span>
            </h2>
            
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              Geliştirdiğim tüm oyunlar ve uygulamalar burada! Keşfetmeye hazır mısın?
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {[
                { label: 'Toplam Proje', value: projects.length, icon: Star },
                { label: 'Oyun', value: projects.filter(p => p.category === 'game').length, icon: Gamepad2 },
                { label: 'Uygulama', value: projects.filter(p => p.category === 'app').length, icon: Smartphone },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <stat.icon className="w-5 h-5 text-cyan-400" />
                    <span className="text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="text-sm text-slate-500">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Category Tabs */}
      <section className="relative z-10 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-medium transition-all ${
                  activeCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <cat.icon className="w-5 h-5" />
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.label.split(' ')[0]}</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </motion.button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Projects Grid */}
      <section className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-slate-800/50 rounded-3xl h-80 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <motion.div 
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-3xl flex items-center justify-center">
                {currentCategory && <currentCategory.icon className="w-12 h-12 text-slate-600" />}\n              </div>
              <h3 className="text-xl font-medium text-slate-400 mb-2">Bu kategoride henüz proje yok</h3>
              <p className="text-slate-500">Yakında yeni projeler eklenecek!</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              <AnimatePresence>
                {filteredProjects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ProjectCard 
                      project={project} 
                      onVisit={handleProjectVisit}
                      isAdmin={isAdmin}
                      onEdit={handleEditProject}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 YÖRÜKHAN STÜDYO. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
      
      {/* Modals */}
      <AnimatePresence>
        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAdminPanel && (
          <AdminPanel
            onClose={() => setShowAdminPanel(false)}
            projects={projects}
            onRefresh={fetchProjects}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {playingProject && (
          <ProjectPlayer
            project={playingProject}
            onClose={() => setPlayingProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}