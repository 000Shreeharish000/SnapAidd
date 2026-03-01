import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { 
  Camera, X, Loader2, MapPin, AlertTriangle, Send, ArrowLeft
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SOSPage = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { t } = useLanguage();
  
  const [capturing, setCapturing] = useState(false);
  const [sending, setSending] = useState(false);
  const [location, setLocation] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Get location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => console.log('Location access denied')
      );
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCapturing(true);
    } catch (err) {
      console.error('Camera error:', err);
      alert('Could not access camera');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturing(false);
  }, [stream]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();
  }, [stopCamera]);

  // Send SOS
  const sendSOS = async () => {
    if (!capturedImage) return;
    
    setSending(true);
    
    try {
      const base64 = capturedImage.split(',')[1];
      
      // Analyze media
      const analyzeRes = await fetch(`${API_URL}/api/analyze-media`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          media_base64: base64,
          media_type: 'image/jpeg'
        })
      });
      
      const analysis = await analyzeRes.json();
      
      // Submit incident
      const incidentRes = await fetch(`${API_URL}/api/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          incident_type: analysis.incident_type || 'Other',
          severity_score: analysis.severity_score || 5,
          confidence_score: analysis.confidence_score || 0.8,
          description: 'SOS Emergency Alert',
          ai_summary: analysis.summary,
          latitude: location?.latitude,
          longitude: location?.longitude,
          media_base64: base64,
          media_type: 'image/jpeg'
        })
      });
      
      if (incidentRes.ok) {
        const incident = await incidentRes.json();
        navigate('/success', { 
          state: { 
            incident,
            pointsEarned: (analysis.severity_score || 5) * 10
          }
        });
      } else {
        throw new Error('Failed to submit');
      }
    } catch (err) {
      console.error('SOS error:', err);
      alert('Failed to send SOS. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col" data-testid="sos-page">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 p-4 safe-top">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              stopCamera();
              navigate('/dashboard');
            }}
            className="w-10 h-10 rounded-full glass text-white"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-display font-bold text-sm">{t('sosMode')}</span>
          </div>
          
          <div className="w-10" />
        </div>
      </header>

      {/* Camera View / Captured Image */}
      <main className="flex-1 relative">
        {capturing ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Location Indicator */}
            <div className="absolute top-20 left-4 right-4">
              <div className={`glass px-4 py-2 rounded-full inline-flex items-center gap-2 ${
                location ? 'text-green-400' : 'text-amber-400'
              }`}>
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {location 
                    ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                    : 'Getting location...'
                  }
                </span>
              </div>
            </div>

            {/* Capture Button */}
            <div className="absolute bottom-0 left-0 right-0 p-8 safe-bottom">
              <div className="flex justify-center">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto}
                  className="w-24 h-24 rounded-full bg-red-600 border-4 border-white flex items-center justify-center glow-red"
                  data-testid="capture-btn"
                >
                  <Camera className="w-10 h-10 text-white" />
                </motion.button>
              </div>
              <p className="text-center text-white/70 mt-4 text-sm">{t('tapToCapture')}</p>
            </div>
          </>
        ) : capturedImage ? (
          <>
            <img
              src={capturedImage}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Action Buttons */}
            <div className="absolute bottom-0 left-0 right-0 p-6 safe-bottom">
              <div className="glass rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-3 text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm font-medium">Emergency report will be sent immediately</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCapturedImage(null);
                      startCamera();
                    }}
                    className="py-6 border-zinc-600 text-white hover:bg-zinc-800"
                    data-testid="retake-btn"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Retake
                  </Button>
                  
                  <Button
                    onClick={sendSOS}
                    disabled={sending}
                    className="py-6 bg-red-600 hover:bg-red-700 text-white glow-red"
                    data-testid="send-sos-btn"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        {t('submit')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
          </div>
        )}
      </main>

      {/* Sending Overlay */}
      <AnimatePresence>
        {sending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          >
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center mx-auto mb-4 sos-pulse">
                <Send className="w-10 h-10 text-white" />
              </div>
              <p className="text-white font-display font-bold text-xl">{t('sending')}</p>
              <p className="text-zinc-400 text-sm mt-2">Analyzing and sending emergency...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SOSPage;
