import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { io } from 'socket.io-client';
import { 
  LogOut, Shield, Bell, Search, MapPin, Clock, 
  AlertTriangle, Flame, Car, Swords, Stethoscope, HelpCircle,
  ChevronRight, Send, Loader2, Activity, CheckCircle,
  Truck, BarChart3, RefreshCw
} from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const incidentIcons = {
  'Accident': Car,
  'Fire': Flame,
  'Weapon': Shield,
  'Violence': Swords,
  'Medical': Stethoscope,
  'Crime': AlertTriangle,
  'Other': HelpCircle,
  'Natural Disaster': AlertTriangle,
};

const PoliceDashboard = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const { t } = useLanguage();
  
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    severity: '',
    type: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.type) params.append('incident_type', filters.type);
      
      const [incidentsRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/incidents?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (incidentsRes.ok) {
        setIncidents(await incidentsRes.json());
      }
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      socket.emit('join_police_room', {});
    });

    socket.on('new_incident', (incident) => {
      setIncidents(prev => [incident, ...prev]);
      setStats(prev => prev ? {
        ...prev,
        total: prev.total + 1,
        pending: prev.pending + 1
      } : null);
    });

    socket.on('incident_updated', (updatedIncident) => {
      setIncidents(prev => 
        prev.map(inc => 
          inc.incident_id === updatedIncident.incident_id ? updatedIncident : inc
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  const handleUpdateIncident = async () => {
    if (!selectedIncident || (!newStatus && !newNote)) return;
    
    setUpdating(true);
    try {
      const body = {};
      if (newStatus) body.status = newStatus;
      if (newNote) body.internal_notes = (selectedIncident.internal_notes || '') + '\n' + newNote;

      const res = await fetch(`${API_URL}/api/incidents/${selectedIncident.incident_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const updated = await res.json();
        setSelectedIncident(updated);
        setNewNote('');
        setNewStatus('');
        fetchData();
      }
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredIncidents = incidents.filter(inc => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        inc.incident_type?.toLowerCase().includes(query) ||
        inc.description?.toLowerCase().includes(query) ||
        inc.incident_id?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const IconComponent = (type) => incidentIcons[type] || HelpCircle;

  return (
    <div className="min-h-screen bg-black" data-testid="police-dashboard">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-4 py-3 border-b border-zinc-900">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white">{t('appName')} Police</h1>
              <p className="text-zinc-600 text-xs flex items-center gap-1">
                <Activity className="w-3 h-3 text-red-500" />
                {t('liveUpdates')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchData}
              className="text-zinc-500 hover:text-white"
              data-testid="refresh-btn"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-zinc-500 hover:text-white"
              data-testid="logout-btn"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-zinc-950 border border-zinc-900"
          >
            <BarChart3 className="w-6 h-6 text-zinc-500 mb-2" />
            <p className="font-display font-bold text-2xl text-white">{stats?.total || 0}</p>
            <p className="text-zinc-600 text-sm">{t('totalIncidents')}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-xl bg-zinc-950 border border-zinc-900"
          >
            <Clock className="w-6 h-6 text-zinc-500 mb-2" />
            <p className="font-display font-bold text-2xl text-white">{stats?.pending || 0}</p>
            <p className="text-zinc-600 text-sm">{t('pending')}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-xl bg-zinc-950 border border-zinc-900"
          >
            <Truck className="w-6 h-6 text-red-500 mb-2" />
            <p className="font-display font-bold text-2xl text-white">{stats?.dispatched || 0}</p>
            <p className="text-zinc-600 text-sm">{t('dispatched')}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-xl bg-zinc-950 border border-zinc-900"
          >
            <CheckCircle className="w-6 h-6 text-zinc-600 mb-2" />
            <p className="font-display font-bold text-2xl text-white">{stats?.closed || 0}</p>
            <p className="text-zinc-600 text-sm">{t('closed')}</p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <Input
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600"
              data-testid="search-input"
            />
          </div>
          
          <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? '' : v })}>
            <SelectTrigger className="w-[140px] bg-zinc-950 border-zinc-800 text-white" data-testid="status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800">
              <SelectItem value="all" className="text-white">{t('all')}</SelectItem>
              <SelectItem value="pending" className="text-white">{t('pending')}</SelectItem>
              <SelectItem value="dispatched" className="text-white">{t('dispatched')}</SelectItem>
              <SelectItem value="closed" className="text-white">{t('closed')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filters.severity} onValueChange={(v) => setFilters({ ...filters, severity: v === 'all' ? '' : v })}>
            <SelectTrigger className="w-[140px] bg-zinc-950 border-zinc-800 text-white" data-testid="severity-filter">
              <SelectValue placeholder={t('severity')} />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800">
              <SelectItem value="all" className="text-white">{t('all')}</SelectItem>
              {[5, 4, 3, 2, 1].map(s => (
                <SelectItem key={s} value={String(s)} className="text-white">Level {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Incident Feed */}
        <div className="space-y-3">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-500" />
            {t('incidentFeed')}
            <span className="ml-2 px-2 py-0.5 rounded-full bg-red-600 text-white text-sm font-mono">
              {filteredIncidents.length}
            </span>
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
              <p className="text-zinc-600">No incidents found</p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredIncidents.map((incident, index) => {
                const Icon = IconComponent(incident.incident_type);
                return (
                  <motion.div
                    key={incident.incident_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setSelectedIncident(incident);
                      setNewStatus(incident.status);
                    }}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-900 border-l-4 border-l-red-600 cursor-pointer transition-all hover:bg-zinc-900"
                    data-testid={`incident-${incident.incident_id}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-red-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-600 text-white">
                            {incident.incident_type}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs status-${incident.status}`}>
                            {incident.status}
                          </span>
                        </div>
                        
                        <p className="text-zinc-400 text-sm line-clamp-2 mb-2">
                          {incident.description || incident.ai_summary || 'No description'}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs text-zinc-600">
                          {incident.latitude && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {incident.latitude.toFixed(2)}, {incident.longitude.toFixed(2)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(incident.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-zinc-700" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Incident Detail Modal */}
      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Incident Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedIncident && (
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-600 text-white">
                  {selectedIncident.incident_type}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm status-${selectedIncident.status}`}>
                  {selectedIncident.status}
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-zinc-900 text-zinc-400">
                  Severity: {selectedIncident.severity_score}/5
                </span>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-zinc-900">
                  <p className="text-zinc-600">Confidence</p>
                  <p className="text-white font-mono">{(selectedIncident.confidence_score * 100).toFixed(0)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900">
                  <p className="text-zinc-600">Authenticity</p>
                  <p className="text-white font-mono">{(selectedIncident.authenticity_score * 100).toFixed(0)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900">
                  <p className="text-zinc-600">Reporter</p>
                  <p className="text-white">{selectedIncident.user_name || 'Anonymous'}</p>
                </div>
                <div className="p-3 rounded-lg bg-zinc-900">
                  <p className="text-zinc-600">Time</p>
                  <p className="text-white font-mono text-xs">{new Date(selectedIncident.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Location */}
              {selectedIncident.latitude && (
                <div className="p-3 rounded-lg bg-zinc-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="font-mono text-sm text-zinc-400">
                    {selectedIncident.latitude.toFixed(6)}, {selectedIncident.longitude.toFixed(6)}
                  </span>
                  <a 
                    href={`https://www.google.com/maps?q=${selectedIncident.latitude},${selectedIncident.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-red-500 text-sm hover:underline"
                  >
                    Open Maps
                  </a>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <p className="text-zinc-600 text-sm">{t('description')}</p>
                <p className="text-zinc-300 bg-zinc-900 p-3 rounded-lg">
                  {selectedIncident.description || 'No description provided'}
                </p>
              </div>

              {/* AI Summary */}
              {selectedIncident.ai_summary && (
                <div className="space-y-2">
                  <p className="text-zinc-600 text-sm">AI Summary</p>
                  <p className="text-zinc-300 bg-red-950/20 p-3 rounded-lg border border-red-900/30">
                    {selectedIncident.ai_summary}
                  </p>
                </div>
              )}

              {/* Internal Notes */}
              {selectedIncident.internal_notes && (
                <div className="space-y-2">
                  <p className="text-zinc-600 text-sm">{t('internalNotes')}</p>
                  <p className="text-zinc-400 bg-zinc-900 p-3 rounded-lg whitespace-pre-wrap">
                    {selectedIncident.internal_notes}
                  </p>
                </div>
              )}

              {/* Update Section */}
              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <p className="text-zinc-500 text-sm font-medium">{t('updateStatus')}</p>
                
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white" data-testid="update-status-select">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    <SelectItem value="pending" className="text-white">{t('pending')}</SelectItem>
                    <SelectItem value="dispatched" className="text-white">{t('dispatched')}</SelectItem>
                    <SelectItem value="closed" className="text-white">{t('closed')}</SelectItem>
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder={t('addNotes')}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
                  data-testid="notes-input"
                />

                <Button
                  onClick={handleUpdateIncident}
                  disabled={updating || (!newStatus && !newNote)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  data-testid="update-incident-btn"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Update Incident
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PoliceDashboard;
