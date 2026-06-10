import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Wrench, CheckCircle, Play, Smartphone, Gamepad2, Star, ThumbsUp } from 'lucide-react';

const statusConfig = {
  active: { 
    label: 'Aktif', 
    color: 'from-green-400 to-emerald-500', 
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    icon: Play 
  },
  maintenance: { 
    label: 'Bakımda', 
    color: 'from-yellow-400 to-orange-500', 
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    icon: Wrench 
  },
  completed: { 
    label: 'Tamamlandı', 
    color: 'from-blue-400 to-cyan-500', 
    bgColor: 'bg-blue-500/20',
    textColor: 'text-blue-400',
    icon: CheckCircle 
  }
};

const categoryConfig = {
  game: { label: 'Oyun', color: 'from-purple-400 to-pink-500', icon: Gamepad2 },
  app: { label: 'Uygulama', color: 'from-cyan-400 to-blue-500', icon: Smartphone }
};

export default function ProjectCard({ project, onVisit, isAdmin, onEdit }) {
  const status = statusConfig[project.status] || statusConfig.active;
  const category = categoryConfig[project.category] || categoryConfig.app;
  const StatusIcon = status.icon;
  const CategoryIcon = category.icon;
  
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(project.likes || 0);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const trackAction = async (actionType, projectId) => {
    try {
      await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_name: localStorage.getItem('visitorName') || 'Anonim',
          project_id: projectId,
          action_type: actionType,
          action_detail: null,
          duration_seconds: 0
        })
      });
    } catch (err) {
      console.error('Action track error:', err);
    }
  };

  const handleOpenProject = () => {
    console.log('Opening project:', project.name, project.url);
    if (project.url) {
      trackAction('view', project.id);
      // Direkt olarak onVisit çağır
      if (onVisit) {
        onVisit(project.id, project);
      }
    }
  };

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    await trackAction('like', project.id);
  };

  return (
    <motion.div
      className="group relative bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-cyan-500/50 transition-all duration-300"
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Image */}
      {project.image_url && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={project.image_url} 
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        </div>
      )}
      
      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{project.name}</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${category.color} text-white`}>
                {category.label}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${status.bgColor} ${status.textColor} flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        {project.description && (
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">{project.description}</p>
        )}
        
        {/* Tech Stack */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tech_stack.slice(0, 4).map((tech, i) => (
              <span key={i} className="text-xs px-2 py-1 bg-slate-800 rounded-lg text-slate-300">
                {tech}
              </span>
            ))}
          </div>
        )}
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-0.5"
            >
              <Star 
                className={`w-4 h-4 transition-colors ${
                  star <= (hoveredRating || rating) 
                    ? 'text-yellow-400 fill-yellow-400' 
                    : 'text-slate-600'
                }`} 
              />
            </button>
          ))}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          {project.url && (
            <motion.button
              onClick={handleOpenProject}
              className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-medium text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ExternalLink className="w-4 h-4" />
              Projeyi Aç
            </motion.button>
          )}
          
          <motion.button
            onClick={handleLike}
            className={`px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              liked 
                ? 'bg-pink-500/20 text-pink-400' 
                : 'bg-slate-800 text-slate-400 hover:text-pink-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-pink-400' : ''}`} />
            <span className="text-sm">{likeCount}</span>
          </motion.button>
          
          {isAdmin && (
            <button
              onClick={() => onEdit && onEdit(project)}
              className="px-4 py-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            >
              Düzenle
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
