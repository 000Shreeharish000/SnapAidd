import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  ArrowLeft, Loader2, MapPin, AlertTriangle, Flame, Car, 
  Swords, Stethoscope, Shield, HelpCircle, Send, Sparkles
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const incidentTypes = [
  { value: 'Accident', icon: Car },
  { value: 'Fire', icon: Flame },
  { value: 'Weapon', icon: Shield },
  { value: 'Violence', icon: Swords },
  { value: 'Medical', icon: Stethoscope },
  { value: 'Crime', icon: AlertTriangle },
  { value: 'Other', icon: HelpCircle },
];

const ReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { t } = useLanguage();
  
  const { media, location: gpsLocation } = location.state || {};
  
  const [analyzing, setAnalyzing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    incident_type: 'Other',
    severity_score: 3,
    confidence_score: 0.5,
    description: '',
    ai_summary: '',
    latitude: gpsLocation?.latitude || null,
    longitude: gpsLocation?.longitude || null
  });

  useEffect(() => {
    if (!media) {
      navigate('/dashboard');
      return;
    }

    const analyzeMedia = async () => {
      try {
        const res = await fetch(`${API_URL}/api/analyze-media`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            media_base64: media.base64,
            media_type: media.type
          })
        });

        if (res.ok) {
          const analysis = await res.json();
          setForm(prev => ({
            ...prev,
            incident_type: analysis.incident_type || 'Other',
            severity_score: analysis.severity_score || 3,
            confidence_score: analysis.confidence_score || 0.5,
            description: analysis.summary || '',
            ai_summary: analysis.summary || ''
          }));
        }
      } catch (err) {
        console.error('Analysis error:', err);
      } finally {
        setAnalyzing(false);
      }
    };

    analyzeMedia();
  }, [media, token, navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const res = await fetch(`${API_URL}/api/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          media_base64: media.base64,
          media_type: media.type
        })
      });

      if (res.ok) {
        const incident = await res.json();
        navigate('/success', {
          state: {
            incident,
            pointsEarned: form.severity_score * 10
          },
          replace: true
        });
      } else {
        throw new Error('Submit failed');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const mediaPreview = media ? `data:${media.type};base64,${media.base64}` : null;
  const isVideo = media?.type?.startsWith('video');

  return (
    <div className="min-h-screen bg-black flex flex-col" data-testid="review-page">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-4 py-3 safe-top">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-zinc-500 hover:text-white"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-xl text-white">{t('reviewIncident')}</h1>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 safe-bottom">
        {/* Media Preview */}
        <div className="rounded-xl overflow-hidden bg-zinc-950 border border-zinc-900 aspect-video relative">
          {isVideo ? (
            <video
              src={mediaPreview}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <img
              src={mediaPreview}
              alt="Incident"
              className="w-full h-full object-contain"
            />
          )}
          
          {/* AI Analysis Overlay */}
          {analyzing && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-950/50 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-8 h-8 text-red-500 animate-pulse" />
                </div>
                <p className="text-white font-medium">{t('analyzingMedia')}</p>
                <p className="text-zinc-500 text-sm mt-1">Gemini AI is analyzing...</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Confidence Badge */}
        {!analyzing && form.confidence_score > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-zinc-950 border border-zinc-900"
          >
            <Sparkles className="w-5 h-5 text-red-500" />
            <span className="text-zinc-300 text-sm">
              AI Analysis: <span className="text-white font-medium">{(form.confidence_score * 100).toFixed(0)}% confidence</span>
            </span>
          </motion.div>
        )}

        {/* Form */}
        <div className="space-y-4">
          {/* Incident Type */}
          <div className="space-y-2">
            <Label className="text-zinc-400">{t('incidentType')}</Label>
            <Select
              value={form.incident_type}
              onValueChange={(v) => setForm({ ...form, incident_type: v })}
            >
              <SelectTrigger className="bg-zinc-950 border-zinc-800 text-white" data-testid="incident-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800">
                {incidentTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className="text-white hover:bg-zinc-900"
                  >
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4 text-red-500" />
                      <span>{t(type.value.toLowerCase())}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label className="text-zinc-400">{t('severity')} (1-5)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setForm({ ...form, severity_score: level })}
                  className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                    form.severity_score === level
                      ? 'bg-red-600 text-white'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-500 hover:bg-zinc-900'
                  }`}
                  data-testid={`severity-${level}`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-zinc-400">{t('description')}</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the incident..."
              className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 min-h-[100px]"
              data-testid="description-input"
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950 border border-zinc-900">
            <MapPin className={`w-5 h-5 ${form.latitude ? 'text-red-500' : 'text-zinc-600'}`} />
            <div className="flex-1">
              <p className="text-sm text-zinc-400">{t('location')}</p>
              <p className="text-xs text-zinc-600 font-mono">
                {form.latitude
                  ? `${form.latitude.toFixed(6)}, ${form.longitude.toFixed(6)}`
                  : 'Not available'
                }
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={submitting || analyzing}
            className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-bold"
            data-testid="submit-btn"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                {t('submitReport')}
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ReviewPage;
