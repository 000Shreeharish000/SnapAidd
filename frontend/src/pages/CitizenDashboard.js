import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { 
  Camera, Upload, Video, Siren, Phone, User, LogOut, 
  MapPin, Loader2, ChevronRight, Trophy
} from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setGettingLocation(false);
      },
      () => setGettingLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1];
        const mediaType = file.type;
        
        navigate('/review', {
          state: {
            media: { base64, type: mediaType, name: file.name },
            location
          }
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col" data-testid="citizen-dashboard">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-4 py-3 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
              {user?.picture ? (
                <img src={user.picture} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-zinc-500" />
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{user?.name}</p>
              <p className="text-zinc-600 text-xs flex items-center gap-1">
                <Trophy className="w-3 h-3 text-red-500" />
                {user?.points || 0} pts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-zinc-600 hover:text-white"
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-6 space-y-8">
        {/* Location Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-900"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              location ? 'bg-red-950/50 text-red-500' : 'bg-zinc-900 text-zinc-600'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">{t('location')}</p>
              <p className="text-zinc-600 text-xs font-mono">
                {location 
                  ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : 'Not detected'
                }
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={getLocation}
            disabled={gettingLocation}
            className="text-zinc-500 hover:text-white"
            data-testid="get-location-btn"
          >
            {gettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Detect'}
          </Button>
        </motion.div>

        {/* SOS Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex items-center justify-center py-8"
        >
          <Link to="/sos" data-testid="sos-button-link">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-40 h-40 rounded-full bg-red-600 text-white font-display font-black text-4xl sos-pulse flex flex-col items-center justify-center gap-2 border-4 border-red-500/50"
              data-testid="sos-button"
            >
              <Siren className="w-10 h-10" />
              <span>{t('sosButton')}</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <h2 className="font-display font-bold text-lg text-white">{t('reportEmergency')}</h2>
          
          <div className="grid grid-cols-3 gap-4">
            {/* Capture Image */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => cameraInputRef.current?.click()}
              disabled={loading}
              className="aspect-square rounded-xl bg-red-600 p-4 flex flex-col items-center justify-center gap-2 btn-press"
              data-testid="capture-image-btn"
            >
              <Camera className="w-7 h-7 text-white" />
              <span className="text-white text-xs font-medium text-center">{t('captureImage')}</span>
            </motion.button>

            {/* Upload Image */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => imageInputRef.current?.click()}
              disabled={loading}
              className="aspect-square rounded-xl bg-zinc-950 border border-zinc-800 p-4 flex flex-col items-center justify-center gap-2 hover:bg-zinc-900 transition-colors btn-press"
              data-testid="upload-image-btn"
            >
              <Upload className="w-7 h-7 text-zinc-400" />
              <span className="text-zinc-400 text-xs font-medium text-center">{t('uploadImage')}</span>
            </motion.button>

            {/* Upload Video */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => videoInputRef.current?.click()}
              disabled={loading}
              className="aspect-square rounded-xl bg-zinc-950 border border-zinc-800 p-4 flex flex-col items-center justify-center gap-2 hover:bg-zinc-900 transition-colors btn-press"
              data-testid="upload-video-btn"
            >
              <Video className="w-7 h-7 text-zinc-400" />
              <span className="text-zinc-400 text-xs font-medium text-center">{t('uploadVideo')}</span>
            </motion.button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="camera-input"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="image-input"
          />
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
            data-testid="video-input"
          />
        </div>

        {/* Quick Links */}
        <div className="space-y-3 safe-bottom">
          <Link
            to="/profile"
            className="flex items-center justify-between p-4 rounded-xl bg-zinc-950 border border-zinc-900 hover:bg-zinc-900 transition-colors"
            data-testid="profile-link"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-white font-medium">{t('viewProfile')}</p>
                <p className="text-zinc-600 text-sm">{user?.badges?.length || 0} {t('badges')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600" />
          </Link>

          <Link
            to="/emergency-numbers"
            className="flex items-center justify-between p-4 rounded-xl bg-red-950/20 border border-red-900/30 hover:bg-red-950/30 transition-colors"
            data-testid="emergency-link"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-950/50 flex items-center justify-center">
                <Phone className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-white font-medium">{t('emergencyNumbers')}</p>
                <p className="text-zinc-500 text-sm">{t('tapToCall')}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600" />
          </Link>
        </div>
      </main>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium">{t('loading')}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CitizenDashboard;
