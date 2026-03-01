import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Check, Trophy, Plus, Home, Sparkles } from 'lucide-react';

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser, user } = useAuth();
  const { t } = useLanguage();
  
  const { incident, pointsEarned = 30 } = location.state || {};
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!incident) {
      navigate('/dashboard');
      return;
    }
    
    // Update user points locally
    if (user) {
      updateUser({ points: (user.points || 0) + pointsEarned });
    }
    
    // Show content after animation
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, [incident, navigate, pointsEarned, user, updateUser]);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6" data-testid="success-page">
      {/* Ripple Effects */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ 
              duration: 2, 
              delay: i * 0.3, 
              repeat: Infinity,
              repeatDelay: 1 
            }}
            className="absolute w-32 h-32 rounded-full border-2 border-green-500"
          />
        ))}
      </div>

      {/* Success Circle - GPay Style */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.2
        }}
        className="relative z-10"
      >
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center glow-green success-popup">
          <svg
            className="w-16 h-16 text-white"
            viewBox="0 0 52 52"
          >
            <circle
              className="checkmark-circle"
              cx="26"
              cy="26"
              r="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="checkmark-check"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14 27l8 8 16-16"
            />
          </svg>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center space-y-6 z-10"
          >
            <div>
              <h1 className="font-display font-black text-3xl text-white mb-2">
                {t('incidentSubmitted')}
              </h1>
              <p className="text-zinc-400">{t('thankYou')}</p>
            </div>

            {/* Points Earned Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-center gap-2 text-amber-400">
                <Trophy className="w-6 h-6" />
                <span className="font-display font-bold text-lg">{t('pointsEarned')}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <Plus className="w-8 h-8 text-green-400" />
                <span className="font-display font-black text-5xl text-white">{pointsEarned}</span>
              </div>

              {/* Incident ID */}
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-zinc-500 text-sm">Incident ID</p>
                <p className="font-mono text-zinc-300 text-sm">{incident?.incident_id}</p>
              </div>

              {/* Badge Notification */}
              {user?.badges?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-2 text-amber-400 pt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">{user.badges.length} badges earned!</span>
                </motion.div>
              )}
            </motion.div>

            {/* Incident Details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-xl p-4 space-y-2 text-left"
            >
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Type</span>
                <span className="text-white font-medium">{incident?.incident_type}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Severity</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold severity-${incident?.severity_score}`}>
                  Level {incident?.severity_score}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 text-sm">Status</span>
                <span className="status-pending px-2 py-0.5 rounded text-xs font-medium">
                  Pending
                </span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 pt-4"
            >
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full py-6 bg-zinc-800 hover:bg-zinc-700 text-white"
                data-testid="home-btn"
              >
                <Home className="w-5 h-5 mr-2" />
                {t('reportAnother')}
              </Button>
              
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="w-full py-6 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                data-testid="profile-btn"
              >
                <Trophy className="w-5 h-5 mr-2" />
                {t('viewProfile')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuccessPage;
