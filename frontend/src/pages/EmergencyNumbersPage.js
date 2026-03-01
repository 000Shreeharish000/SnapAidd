import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, Phone, Shield, Ambulance, Flame, Users, 
  Baby, Laptop, AlertTriangle, ExternalLink
} from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';

const emergencyNumbers = [
  { 
    id: 'police',
    name: { en: 'Police', ta: 'காவல்துறை', hi: 'पुलिस' },
    number: '112',
    icon: Shield,
    color: 'from-blue-600 to-blue-700',
    description: { en: 'Emergency Police Helpline', ta: 'அவசர காவல் உதவி', hi: 'आपातकालीन पुलिस हेल्पलाइन' }
  },
  { 
    id: 'ambulance',
    name: { en: 'Ambulance', ta: 'ஆம்புலன்ஸ்', hi: 'एम्बुलेंस' },
    number: '108',
    icon: Ambulance,
    color: 'from-red-600 to-red-700',
    description: { en: 'Medical Emergency', ta: 'மருத்துவ அவசரநிலை', hi: 'चिकित्सा आपातकाल' }
  },
  { 
    id: 'fire',
    name: { en: 'Fire Station', ta: 'தீயணைப்பு', hi: 'फायर स्टेशन' },
    number: '101',
    icon: Flame,
    color: 'from-orange-600 to-orange-700',
    description: { en: 'Fire & Rescue', ta: 'தீ & மீட்பு', hi: 'आग और बचाव' }
  },
  { 
    id: 'women',
    name: { en: 'Women Helpline', ta: 'பெண்கள் உதவி', hi: 'महिला हेल्पलाइन' },
    number: '1091',
    icon: Users,
    color: 'from-pink-600 to-pink-700',
    description: { en: '24/7 Women Safety', ta: '24/7 பெண்கள் பாதுகாப்பு', hi: '24/7 महिला सुरक्षा' }
  },
  { 
    id: 'child',
    name: { en: 'Child Helpline', ta: 'குழந்தை உதவி', hi: 'बाल हेल्पलाइन' },
    number: '1098',
    icon: Baby,
    color: 'from-green-600 to-green-700',
    description: { en: 'Child Protection', ta: 'குழந்தை பாதுகாப்பு', hi: 'बाल संरक्षण' }
  },
  { 
    id: 'cyber',
    name: { en: 'Cyber Crime', ta: 'சைபர் குற்றம்', hi: 'साइबर अपराध' },
    number: '1930',
    icon: Laptop,
    color: 'from-purple-600 to-purple-700',
    description: { en: 'Online Fraud & Cybercrime', ta: 'ஆன்லைன் மோசடி', hi: 'ऑनलाइन धोखाधड़ी' }
  },
  { 
    id: 'disaster',
    name: { en: 'Disaster Management', ta: 'பேரிடர் மேலாண்மை', hi: 'आपदा प्रबंधन' },
    number: '1070',
    icon: AlertTriangle,
    color: 'from-amber-600 to-amber-700',
    description: { en: 'National Disaster Response', ta: 'தேசிய பேரிடர் மறுமொழி', hi: 'राष्ट्रीय आपदा प्रतिक्रिया' }
  },
];

const EmergencyNumbersPage = () => {
  const { language, t } = useLanguage();

  const handleCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col" data-testid="emergency-numbers-page">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-4 py-3 safe-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white"
                data-testid="back-btn"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-display font-bold text-xl text-white">{t('emergencyNumbers')}</h1>
          </div>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 safe-bottom">
        {/* Warning Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
        >
          <Phone className="w-5 h-5 text-red-400 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">
              {language === 'ta' ? 'அவசரநிலை மட்டுமே' : 
               language === 'hi' ? 'केवल आपातकाल' : 
               'Emergency Use Only'}
            </p>
            <p className="text-zinc-400 text-sm">
              {language === 'ta' ? 'தவறான அழைப்புகள் சட்டவிரோதம்' : 
               language === 'hi' ? 'गलत कॉल अवैध हैं' : 
               'False calls are illegal and punishable'}
            </p>
          </div>
        </motion.div>

        {/* Emergency Numbers Grid */}
        <div className="space-y-3">
          {emergencyNumbers.map((item, index) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleCall(item.number)}
              className={`w-full p-4 rounded-xl bg-gradient-to-r ${item.color} flex items-center gap-4 text-left active:scale-98 transition-transform`}
              data-testid={`call-${item.id}`}
            >
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <item.icon className="w-7 h-7 text-white" />
              </div>
              
              <div className="flex-1">
                <p className="text-white font-bold text-lg">
                  {item.name[language] || item.name.en}
                </p>
                <p className="text-white/70 text-sm">
                  {item.description[language] || item.description.en}
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-display font-black text-2xl text-white">{item.number}</p>
                <p className="text-white/60 text-xs flex items-center gap-1 justify-end">
                  <Phone className="w-3 h-3" />
                  {t('tapToCall')}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
        >
          <h3 className="text-white font-medium mb-2">
            {language === 'ta' ? 'முக்கிய குறிப்புகள்' : 
             language === 'hi' ? 'महत्वपूर्ण नोट्स' : 
             'Important Notes'}
          </h3>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              {language === 'ta' ? '112 என்பது ஒருங்கிணைந்த அவசர எண்' : 
               language === 'hi' ? '112 एकीकृत आपातकालीन नंबर है' : 
               '112 is the unified emergency number across India'}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              {language === 'ta' ? 'அமைதியாக இருங்கள், தெளிவாக பேசுங்கள்' : 
               language === 'hi' ? 'शांत रहें, स्पष्ट बोलें' : 
               'Stay calm and speak clearly when calling'}
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">•</span>
              {language === 'ta' ? 'உங்கள் இருப்பிடத்தை தெரிவிக்கவும்' : 
               language === 'hi' ? 'अपना स्थान बताएं' : 
               'Provide your location and describe the emergency'}
            </li>
          </ul>
        </motion.div>
      </main>
    </div>
  );
};

export default EmergencyNumbersPage;
