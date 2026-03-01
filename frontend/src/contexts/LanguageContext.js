import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    // Common
    appName: 'SnapAid',
    tagline: 'Emergency Intelligence System',
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    
    // Auth
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    confirmPassword: 'Confirm Password',
    loginWithGoogle: 'Continue with Google',
    orContinueWith: 'or continue with',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    citizen: 'Citizen',
    police: 'Police Authority',
    selectRole: 'Select your role',
    
    // Home
    reportEmergency: 'Report Emergency',
    captureImage: 'Capture Image',
    uploadImage: 'Upload Image',
    uploadVideo: 'Upload Video',
    sosButton: 'SOS',
    emergencyNumbers: 'Emergency Numbers',
    viewProfile: 'View Profile',
    
    // SOS
    sosMode: 'SOS Mode',
    sosModeDesc: 'Capture and send emergency instantly',
    tapToCapture: 'Tap to Capture',
    sending: 'Sending...',
    
    // Incident
    incidentType: 'Incident Type',
    severity: 'Severity',
    confidence: 'Confidence',
    description: 'Description',
    location: 'Location',
    analyzingMedia: 'Analyzing media with AI...',
    reviewIncident: 'Review Incident',
    submitReport: 'Submit Report',
    incidentSubmitted: 'Incident Submitted!',
    pointsEarned: 'Points Earned',
    thankYou: 'Thank you for keeping your community safe',
    viewIncidents: 'View My Reports',
    reportAnother: 'Report Another',
    
    // Incident Types
    accident: 'Accident',
    fire: 'Fire',
    weapon: 'Weapon',
    violence: 'Violence',
    medical: 'Medical',
    naturalDisaster: 'Natural Disaster',
    crime: 'Crime',
    other: 'Other',
    
    // Status
    pending: 'Pending',
    dispatched: 'Dispatched',
    closed: 'Closed',
    
    // Profile
    profile: 'Profile',
    totalPoints: 'Total Points',
    badges: 'Badges',
    myReports: 'My Reports',
    leaderboard: 'Leaderboard',
    
    // Police Dashboard
    dashboard: 'Dashboard',
    incidentFeed: 'Incident Feed',
    liveUpdates: 'Live Updates',
    mapView: 'Map View',
    statistics: 'Statistics',
    totalIncidents: 'Total Incidents',
    updateStatus: 'Update Status',
    addNotes: 'Add Notes',
    internalNotes: 'Internal Notes',
    
    // Emergency Numbers
    emergencyHelpline: 'Emergency Helpline',
    policeHelpline: 'Police',
    ambulance: 'Ambulance',
    fireStation: 'Fire Station',
    womenHelpline: 'Women Helpline',
    childHelpline: 'Child Helpline',
    cyberCrime: 'Cyber Crime',
    disasterManagement: 'Disaster Management',
    tapToCall: 'Tap to call',
    
    // Errors
    errorOccurred: 'An error occurred',
    tryAgain: 'Try Again',
    invalidCredentials: 'Invalid credentials',
    networkError: 'Network error',
  },
  
  ta: {
    // Common
    appName: 'SnapAid',
    tagline: 'அவசர புலனாய்வு அமைப்பு',
    loading: 'ஏற்றுகிறது...',
    submit: 'சமர்ப்பி',
    cancel: 'ரத்து செய்',
    save: 'சேமி',
    close: 'மூடு',
    back: 'பின்',
    next: 'அடுத்து',
    search: 'தேடு',
    filter: 'வடிகட்டு',
    all: 'அனைத்தும்',
    
    // Auth
    login: 'உள்நுழை',
    register: 'பதிவு செய்',
    logout: 'வெளியேறு',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    name: 'பெயர்',
    confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்து',
    loginWithGoogle: 'Google மூலம் தொடரவும்',
    orContinueWith: 'அல்லது இதன் மூலம் தொடரவும்',
    noAccount: 'கணக்கு இல்லையா?',
    haveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
    citizen: 'குடிமகன்',
    police: 'காவல் அதிகாரி',
    selectRole: 'உங்கள் பங்கை தேர்ந்தெடுக்கவும்',
    
    // Home
    reportEmergency: 'அவசரநிலை தெரிவி',
    captureImage: 'படம் எடு',
    uploadImage: 'படம் பதிவேற்று',
    uploadVideo: 'வீடியோ பதிவேற்று',
    sosButton: 'SOS',
    emergencyNumbers: 'அவசர எண்கள்',
    viewProfile: 'சுயவிவரம் காண்க',
    
    // SOS
    sosMode: 'SOS முறை',
    sosModeDesc: 'உடனடியாக படம் எடுத்து அனுப்பு',
    tapToCapture: 'படம் எடுக்க தட்டு',
    sending: 'அனுப்புகிறது...',
    
    // Incident
    incidentType: 'சம்பவ வகை',
    severity: 'தீவிரம்',
    confidence: 'நம்பகத்தன்மை',
    description: 'விவரம்',
    location: 'இடம்',
    analyzingMedia: 'AI மூலம் ஊடகத்தை பகுப்பாய்வு செய்கிறது...',
    reviewIncident: 'சம்பவத்தை மதிப்பாய்வு செய்',
    submitReport: 'அறிக்கையை சமர்ப்பி',
    incidentSubmitted: 'சம்பவம் சமர்ப்பிக்கப்பட்டது!',
    pointsEarned: 'பெற்ற புள்ளிகள்',
    thankYou: 'உங்கள் சமூகத்தை பாதுகாப்பாக வைத்திருப்பதற்கு நன்றி',
    viewIncidents: 'என் அறிக்கைகளை காண்க',
    reportAnother: 'மற்றொன்றை தெரிவி',
    
    // Incident Types
    accident: 'விபத்து',
    fire: 'தீ',
    weapon: 'ஆயுதம்',
    violence: 'வன்முறை',
    medical: 'மருத்துவம்',
    naturalDisaster: 'இயற்கை பேரிடர்',
    crime: 'குற்றம்',
    other: 'மற்றவை',
    
    // Status
    pending: 'நிலுவையில்',
    dispatched: 'அனுப்பப்பட்டது',
    closed: 'மூடப்பட்டது',
    
    // Profile
    profile: 'சுயவிவரம்',
    totalPoints: 'மொத்த புள்ளிகள்',
    badges: 'பேட்ஜ்கள்',
    myReports: 'என் அறிக்கைகள்',
    leaderboard: 'தரவரிசை',
    
    // Police Dashboard
    dashboard: 'டாஷ்போர்ட்',
    incidentFeed: 'சம்பவ ஊட்டம்',
    liveUpdates: 'நேரடி புதுப்பிப்புகள்',
    mapView: 'வரைபடக் காட்சி',
    statistics: 'புள்ளிவிவரங்கள்',
    totalIncidents: 'மொத்த சம்பவங்கள்',
    updateStatus: 'நிலையை புதுப்பி',
    addNotes: 'குறிப்புகள் சேர்',
    internalNotes: 'உள் குறிப்புகள்',
    
    // Emergency Numbers
    emergencyHelpline: 'அவசர உதவி எண்',
    policeHelpline: 'காவல்துறை',
    ambulance: 'ஆம்புலன்ஸ்',
    fireStation: 'தீயணைப்பு நிலையம்',
    womenHelpline: 'பெண்கள் உதவி எண்',
    childHelpline: 'குழந்தை உதவி எண்',
    cyberCrime: 'சைபர் குற்றம்',
    disasterManagement: 'பேரிடர் மேலாண்மை',
    tapToCall: 'அழைக்க தட்டு',
    
    // Errors
    errorOccurred: 'பிழை ஏற்பட்டது',
    tryAgain: 'மீண்டும் முயற்சி',
    invalidCredentials: 'தவறான சான்றுகள்',
    networkError: 'நெட்வொர்க் பிழை',
  },
  
  hi: {
    // Common
    appName: 'SnapAid',
    tagline: 'आपातकालीन खुफिया प्रणाली',
    loading: 'लोड हो रहा है...',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    close: 'बंद करें',
    back: 'वापस',
    next: 'आगे',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    all: 'सभी',
    
    // Auth
    login: 'लॉगिन',
    register: 'रजिस्टर',
    logout: 'लॉगआउट',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'नाम',
    confirmPassword: 'पासवर्ड की पुष्टि करें',
    loginWithGoogle: 'Google के साथ जारी रखें',
    orContinueWith: 'या इसके साथ जारी रखें',
    noAccount: 'खाता नहीं है?',
    haveAccount: 'पहले से खाता है?',
    citizen: 'नागरिक',
    police: 'पुलिस अधिकारी',
    selectRole: 'अपनी भूमिका चुनें',
    
    // Home
    reportEmergency: 'आपातकाल रिपोर्ट करें',
    captureImage: 'फोटो लें',
    uploadImage: 'फोटो अपलोड करें',
    uploadVideo: 'वीडियो अपलोड करें',
    sosButton: 'SOS',
    emergencyNumbers: 'आपातकालीन नंबर',
    viewProfile: 'प्रोफाइल देखें',
    
    // SOS
    sosMode: 'SOS मोड',
    sosModeDesc: 'तुरंत फोटो लें और भेजें',
    tapToCapture: 'फोटो लेने के लिए टैप करें',
    sending: 'भेज रहा है...',
    
    // Incident
    incidentType: 'घटना का प्रकार',
    severity: 'गंभीरता',
    confidence: 'विश्वसनीयता',
    description: 'विवरण',
    location: 'स्थान',
    analyzingMedia: 'AI के साथ मीडिया का विश्लेषण...',
    reviewIncident: 'घटना की समीक्षा करें',
    submitReport: 'रिपोर्ट जमा करें',
    incidentSubmitted: 'घटना जमा हो गई!',
    pointsEarned: 'अर्जित अंक',
    thankYou: 'अपने समुदाय को सुरक्षित रखने के लिए धन्यवाद',
    viewIncidents: 'मेरी रिपोर्ट देखें',
    reportAnother: 'एक और रिपोर्ट करें',
    
    // Incident Types
    accident: 'दुर्घटना',
    fire: 'आग',
    weapon: 'हथियार',
    violence: 'हिंसा',
    medical: 'चिकित्सा',
    naturalDisaster: 'प्राकृतिक आपदा',
    crime: 'अपराध',
    other: 'अन्य',
    
    // Status
    pending: 'लंबित',
    dispatched: 'भेजा गया',
    closed: 'बंद',
    
    // Profile
    profile: 'प्रोफाइल',
    totalPoints: 'कुल अंक',
    badges: 'बैज',
    myReports: 'मेरी रिपोर्ट',
    leaderboard: 'लीडरबोर्ड',
    
    // Police Dashboard
    dashboard: 'डैशबोर्ड',
    incidentFeed: 'घटना फीड',
    liveUpdates: 'लाइव अपडेट',
    mapView: 'मानचित्र दृश्य',
    statistics: 'आंकड़े',
    totalIncidents: 'कुल घटनाएं',
    updateStatus: 'स्थिति अपडेट करें',
    addNotes: 'नोट्स जोड़ें',
    internalNotes: 'आंतरिक नोट्स',
    
    // Emergency Numbers
    emergencyHelpline: 'आपातकालीन हेल्पलाइन',
    policeHelpline: 'पुलिस',
    ambulance: 'एम्बुलेंस',
    fireStation: 'फायर स्टेशन',
    womenHelpline: 'महिला हेल्पलाइन',
    childHelpline: 'बाल हेल्पलाइन',
    cyberCrime: 'साइबर अपराध',
    disasterManagement: 'आपदा प्रबंधन',
    tapToCall: 'कॉल करने के लिए टैप करें',
    
    // Errors
    errorOccurred: 'एक त्रुटि हुई',
    tryAgain: 'पुनः प्रयास करें',
    invalidCredentials: 'अमान्य क्रेडेंशियल',
    networkError: 'नेटवर्क त्रुटि',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('snapaid_language') || 'en';
    }
    return 'en';
  });

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem('snapaid_language', lang);
  }, []);

  const t = useCallback((key) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
