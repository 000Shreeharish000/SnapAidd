import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Check, Trophy, Plus, Home, ArrowLeft } from 'lucide-react';

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

  const handleGoHome = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleViewProfile = () => {
    navigate('/profile', { replace: true });
  };

  // Prevent going back to the upload flow
  useEffect(() => {
    const handlePopState = (e) => {
      e.preventDefault();
      navigate('/dashboard', { replace: true });
    };
    
    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6" data-testid="success-page">
      {/* Back Button - Fixed at top */}
      <div className="absolute top-4 left-4 safe-top">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoHome}
          className="text-zinc-400 hover:text-white"
          data-testid="back-btn"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Success Circle Animation */}
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
        {/* Ripple Effects */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.5, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ 
                duration: 1.5, 
                delay: i * 0.2, 
                repeat: Infinity,
                repeatDelay: 0.5
              }}
              className="absolute w-32 h-32 rounded-full border-2 border-red-500"
            />
          ))}
        </div>
        
        <div className="w-32 h-32 rounded-full bg-red-600 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.5)]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <Check className="w-16 h-16 text-white stroke-[3]" />
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center space-y-6 z-10 w-full max-w-sm"
        >
          <div>
            <h1 className="font-display font-black text-3xl text-white mb-2">
              {t('incidentSubmitted')}
            </h1>
            <p className="text-zinc-500">{t('thankYou')}</p>
          </div>

          {/* Points Earned Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-center gap-2 text-red-500">
              <Trophy className="w-6 h-6" />
              <span className="font-display font-bold text-lg">{t('pointsEarned')}</span>
            </div>
            
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-8 h-8 text-red-500" />
              <span className="font-display font-black text-5xl text-white">{pointsEarned}</span>
            </div>

            {/* Incident ID */}
            <div className="pt-4 border-t border-zinc-800">
              <p className="text-zinc-600 text-sm">Incident ID</p>
              <p className="font-mono text-zinc-400 text-sm">{incident?.incident_id}</p>
            </div>
          </motion.div>

          {/* Incident Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2 text-left"
          >
            <div className="flex justify-between items-center">
              <span className="text-zinc-600 text-sm">Type</span>
              <span className="text-white font-medium">{incident?.incident_type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-600 text-sm">Severity</span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
                Level {incident?.severity_score}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-600 text-sm">Status</span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
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
              onClick={handleGoHome}
              className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-bold"
              data-testid="home-btn"
            >
              <Home className="w-5 h-5 mr-2" />
              {t('reportAnother')}
            </Button>
            
            <Button
              onClick={handleViewProfile}
              variant="outline"
              className="w-full py-6 border-zinc-700 text-white hover:bg-zinc-900"
              data-testid="profile-btn"
            >
              <Trophy className="w-5 h-5 mr-2" />
              {t('viewProfile')}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SuccessPage;
