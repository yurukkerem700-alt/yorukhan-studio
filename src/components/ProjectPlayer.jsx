import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, RefreshCw, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function ProjectPlayer({ project, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  if (!project || !project.url) {
    console.error('ProjectPlayer: No project or URL');
    return null;
  }

  console.log('ProjectPlayer rendering with:', project.name, project.url);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  const openInNewTab = () => {
    window.open(project.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={`relative bg-slate-900 rounded-2xl overflow-hidden border border-white/10 shadow-2xl ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[85vh]'
        }`}
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-slate-900 via-slate-900/90 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{project.name?.[0] || 'P'}</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">{project.name}</h2>
                <p className="text-slate-400 text-sm">{project.category === 'game' ? 'Oyun' : 'Uygulama'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Yenile"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={openInNewTab}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Yeni Sekmede Aç"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                title={isFullscreen ? 'Küçült' : 'Tam Ekran'}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* iframe */}
        <iframe
          key={iframeKey}
          src={project.url}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          title={project.name}
        />
      </motion.div>
    </motion.div>
  );
}
