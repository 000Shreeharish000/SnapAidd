import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Shield, Mail, Lock, User, AlertCircle, Loader2, ShieldAlert, Users } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(name, email, password, role);
      navigate(user.role === 'police' ? '/police' : '/dashboard');
    } catch (err) {
      setError(err.message || t('errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col" data-testid="register-page">
      {/* Header */}
      <header className="flex items-center justify-between p-4 safe-top">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">{t('appName')}</span>
        </div>
        <LanguageSelector />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <h1 className="font-display font-bold text-3xl text-white">{t('register')}</h1>
              <p className="text-zinc-600">{t('tagline')}</p>
            </div>

            {/* Google Login */}
            <Button
              onClick={loginWithGoogle}
              variant="outline"
              className="w-full py-6 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-white"
              data-testid="google-register-btn"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('loginWithGoogle')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-zinc-950 text-zinc-600">{t('orContinueWith')}</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-950/30 border border-red-900/30 text-red-500"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-zinc-500">{t('selectRole')}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('citizen')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      role === 'citizen'
                        ? 'border-red-600 bg-red-950/30 text-white'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'
                    }`}
                    data-testid="role-citizen-btn"
                  >
                    <Users className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{t('citizen')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('police')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      role === 'police'
                        ? 'border-red-600 bg-red-950/30 text-white'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700'
                    }`}
                    data-testid="role-police-btn"
                  >
                    <ShieldAlert className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-sm font-medium">{t('police')}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-500">{t('name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
                    required
                    data-testid="name-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-500">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
                    required
                    data-testid="email-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-500">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
                    required
                    minLength={6}
                    data-testid="password-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-bold"
                data-testid="register-submit-btn"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t('register')
                )}
              </Button>
            </form>

            <p className="text-center text-zinc-600">
              {t('haveAccount')}{' '}
              <Link to="/login" className="text-red-500 hover:text-red-400 font-medium">
                {t('login')}
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default RegisterPage;
