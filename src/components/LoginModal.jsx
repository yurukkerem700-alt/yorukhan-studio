import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, X, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginModal({ onClose }) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(name, password);
    if (result.success) {
      onClose();
    } else {
      setError('Giriş başarısız. İsim veya şifre hatalı.');
    }
    setLoading(false);
  };

  return (
    <motion.div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl w-full max-w-md overflow-hidden border border-white/10 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
      >
        {/* Header */}
        <div className="relative p-8 pb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20" />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-xl transition-colors z-10"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-center text-white">Yönetici Girişi</h2>
            <p className="text-slate-400 text-center mt-2">Sadece yetkili kişiler erişebilir</p>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 pt-2">
          {error && (
            <motion.div 
              className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">İsim</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="KEJDER"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>
          
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-medium text-white flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Giriş Yap
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}