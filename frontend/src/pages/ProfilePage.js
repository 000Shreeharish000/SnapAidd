import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, Trophy, Award, Star, Shield, Users, 
  FileText, ChevronRight, Medal, Crown, Loader2
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const badgeConfig = {
  'First Responder': { icon: Star, color: 'from-blue-500 to-blue-600', points: 100 },
  'Community Guardian': { icon: Shield, color: 'from-green-500 to-green-600', points: 500 },
  'Republic Day Civic Award': { icon: Crown, color: 'from-amber-400 to-amber-600', points: 1000 },
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useLanguage();
  
  const [incidents, setIncidents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('badges');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incidentsRes, leaderboardRes] = await Promise.all([
          fetch(`${API_URL}/api/incidents`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/api/leaderboard`)
        ]);

        if (incidentsRes.ok) {
          setIncidents(await incidentsRes.json());
        }
        if (leaderboardRes.ok) {
          setLeaderboard(await leaderboardRes.json());
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const userRank = leaderboard.findIndex(u => u.user_id === user?.user_id) + 1;

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col" data-testid="profile-page">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-4 py-3 safe-top">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-zinc-400 hover:text-white"
            data-testid="back-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-xl text-white">{t('profile')}</h1>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6 safe-bottom">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 mx-auto mb-4 flex items-center justify-center overflow-hidden">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-bold text-3xl text-white">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          
          <h2 className="font-display font-bold text-2xl text-white">{user?.name}</h2>
          <p className="text-zinc-400 text-sm">{user?.email}</p>
          
          {/* Points & Rank */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30">
              <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="font-display font-bold text-2xl text-white">{user?.points || 0}</p>
              <p className="text-amber-400/80 text-xs">{t('totalPoints')}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
              <Medal className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="font-display font-bold text-2xl text-white">#{userRank || '-'}</p>
              <p className="text-blue-400/80 text-xs">{t('leaderboard')}</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2">
          {['badges', 'reports', 'leaderboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
              data-testid={`tab-${tab}`}
            >
              {t(tab)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {Object.entries(badgeConfig).map(([name, config]) => {
                  const earned = user?.badges?.includes(name);
                  const IconComponent = config.icon;
                  
                  return (
                    <div
                      key={name}
                      className={`p-4 rounded-xl border ${
                        earned
                          ? 'bg-gradient-to-r ' + config.color + ' border-transparent'
                          : 'bg-zinc-900/50 border-zinc-800 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          earned ? 'bg-white/20' : 'bg-zinc-800'
                        }`}>
                          <IconComponent className={`w-6 h-6 ${earned ? 'text-white' : 'text-zinc-500'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${earned ? 'text-white' : 'text-zinc-400'}`}>{name}</p>
                          <p className={`text-sm ${earned ? 'text-white/70' : 'text-zinc-500'}`}>
                            {config.points} points required
                          </p>
                        </div>
                        {earned && (
                          <Award className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {incidents.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">No reports yet</p>
                  </div>
                ) : (
                  incidents.map((inc) => (
                    <div
                      key={inc.incident_id}
                      className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold severity-${inc.severity_score}`}>
                          {inc.incident_type}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs status-${inc.status}`}>
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-sm line-clamp-2">{inc.description}</p>
                      <p className="text-zinc-500 text-xs mt-2 font-mono">
                        {new Date(inc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {leaderboard.map((u, index) => (
                  <div
                    key={u.user_id}
                    className={`p-4 rounded-xl flex items-center gap-4 ${
                      u.user_id === user?.user_id
                        ? 'bg-red-500/10 border border-red-500/30'
                        : 'bg-zinc-900/50 border border-zinc-800'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-amber-500 text-black' :
                      index === 1 ? 'bg-zinc-400 text-black' :
                      index === 2 ? 'bg-amber-700 text-white' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${u.user_id === user?.user_id ? 'text-red-400' : 'text-white'}`}>
                        {u.name}
                      </p>
                      <p className="text-zinc-500 text-sm">{u.badges?.length || 0} badges</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-lg text-amber-400">{u.points}</p>
                      <p className="text-zinc-500 text-xs">points</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
